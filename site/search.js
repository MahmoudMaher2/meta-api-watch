/* ═══════════════════════════════════════════════════════════════
   Meta API Watch — Professional Search Modal
   site/search.js
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Config ────────────────────────────────────────────────────────────────
  const INDEX_URL = _SEARCH_BASE_ + 'search-index.json';
  let   searchIndex = null;
  let   selectedIdx = -1;
  let   currentResults = [];

  // ── Resolve base URL for subfolder pages (learn/topics/) ─────────────────
  // _SEARCH_BASE_ is replaced at build time by the basePath string

  // ── Build modal DOM ───────────────────────────────────────────────────────
  function createModal() {
    const overlay = document.createElement('div');
    overlay.id = 'search-overlay';
    overlay.innerHTML = `
      <div class="search-modal" id="search-modal" role="dialog" aria-modal="true" aria-label="Site Search">
        <div class="search-modal-header">
          <div class="search-input-wrap">
            <span class="search-icon-prefix">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input
              id="search-input"
              type="text"
              placeholder="Search changelog, docs, topics…"
              autocomplete="off"
              autocorrect="off"
              spellcheck="false"
              aria-label="Search"
            />
            <kbd class="search-esc-hint">ESC</kbd>
          </div>
        </div>

        <div class="search-body" id="search-body">
          <div class="search-empty-state" id="search-empty">
            <div class="search-empty-icon">🔍</div>
            <p class="search-empty-title">Search across 121 articles & docs</p>
            <p class="search-empty-sub">Changelog changes, Learn topics, validation rules, error codes…</p>
            <div class="search-shortcuts-grid">
              <div class="shortcut-item"><kbd>↑</kbd><kbd>↓</kbd><span>Navigate</span></div>
              <div class="shortcut-item"><kbd>↵</kbd><span>Open</span></div>
              <div class="shortcut-item"><kbd>ESC</kbd><span>Close</span></div>
            </div>
          </div>
          <div id="search-results" class="search-results" role="listbox" style="display:none"></div>
          <div id="search-no-results" class="search-no-results" style="display:none">
            <div class="search-empty-icon">🤷</div>
            <p class="search-empty-title">No results found</p>
            <p class="search-empty-sub">Try different keywords or check spelling.</p>
          </div>
        </div>

        <div class="search-footer">
          <span class="search-footer-brand">🔭 Meta API Watch</span>
          <span class="search-footer-hint">
            <kbd>Ctrl</kbd><kbd>K</kbd> to open · <kbd>/</kbd> to search
          </span>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  // ── Fetch + cache search index ─────────────────────────────────────────────
  async function loadIndex() {
    if (searchIndex) return searchIndex;
    try {
      const res = await fetch(INDEX_URL);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      searchIndex = await res.json();
      // Update total count in empty state
      const sub = document.querySelector('.search-empty-sub');
      if (sub) {
        const n = searchIndex.items.length;
        document.querySelector('.search-empty-title').textContent =
          `Search across ${n} articles & docs`;
      }
    } catch (e) {
      console.warn('[Search] Failed to load index:', e);
    }
    return searchIndex;
  }

  // ── Highlight match ───────────────────────────────────────────────────────
  function highlight(text, query) {
    if (!query || !text) return escHtml(text || '');
    const escaped = escHtml(text);
    const words = query.trim().split(/\s+/).filter(Boolean);
    let result = escaped;
    for (const word of words) {
      const re = new RegExp(`(${escRe(escHtml(word))})`, 'gi');
      result = result.replace(re, '<mark>$1</mark>');
    }
    return result;
  }

  function escHtml(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function escRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // ── Score / Search ────────────────────────────────────────────────────────
  function scoreItem(item, words) {
    let score = 0;
    const titleLow = (item.title || '').toLowerCase();

    for (const w of words) {
      const wl = w.toLowerCase();
      // Title match (highest weight)
      if (titleLow.includes(wl)) score += titleLow.startsWith(wl) ? 100 : 60;
      // Category match
      if ((item.category || '').toLowerCase().includes(wl)) score += 30;
      // Platform match
      if ((item.platform || '').toLowerCase().includes(wl)) score += 25;
      // Modules match
      if (Array.isArray(item.modules)) {
        for (const m of item.modules) {
          if (m.toLowerCase().includes(wl)) { score += 25; break; }
        }
      }
      // Headings match
      if (Array.isArray(item.headings)) {
        for (const h of item.headings) {
          if (h.toLowerCase().includes(wl)) { score += 20; break; }
        }
      }
      // Snippet / body match
      if ((item.snippet || '').toLowerCase().includes(wl)) score += 10;
      if ((item.body || '').toLowerCase().includes(wl)) score += 5;
    }

    return score;
  }

  function doSearch(query) {
    if (!searchIndex) return [];
    const words = query.trim().split(/\s+/).filter(w => w.length > 1);
    if (!words.length) return [];

    return searchIndex.items
      .map(item => ({ item, score: scoreItem(item, words) }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 30)
      .map(r => r.item);
  }

  // ── Render results ─────────────────────────────────────────────────────────
  const TYPE_LABELS = {
    changelog: { label: 'Changelog', icon: '🔔' },
    learn:     { label: 'Learn',     icon: '📚' },
  };

  function renderResults(results, query) {
    const container = document.getElementById('search-results');
    const empty     = document.getElementById('search-empty');
    const noResults = document.getElementById('search-no-results');

    currentResults = results;
    selectedIdx = -1;

    if (!results.length) {
      container.style.display = 'none';
      empty.style.display     = 'none';
      noResults.style.display = '';
      return;
    }

    empty.style.display     = 'none';
    noResults.style.display = 'none';
    container.style.display = '';

    // Group by type
    const groups = {};
    for (const item of results) {
      if (!groups[item.type]) groups[item.type] = [];
      groups[item.type].push(item);
    }

    let html = '';
    let globalIdx = 0;

    for (const [type, items] of Object.entries(groups)) {
      const tl = TYPE_LABELS[type] || { label: type, icon: '📄' };
      html += `<div class="search-group">
        <div class="search-group-label">${tl.icon} ${tl.label} <span class="search-group-count">${items.length}</span></div>`;

      for (const item of items) {
        const idx = globalIdx++;
        const modules = Array.isArray(item.modules) ? item.modules.slice(0,3) : [];
        const moduleBadges = modules.map(m =>
          `<span class="sr-badge">${escHtml(m)}</span>`).join('');
        const catBadge = item.category
          ? `<span class="sr-cat-badge">${escHtml(item.category)}</span>` : '';
        const platform = item.platform
          ? `<span class="sr-platform">${escHtml(item.platform)}</span>` : '';
        const date = item.date
          ? `<span class="sr-date">${item.date}</span>` : '';
        const snippet = item.snippet
          ? `<p class="sr-snippet">${highlight(item.snippet, query)}</p>` : '';

        html += `
          <a class="search-result-item" href="${escHtml(item.url)}${item.anchor ? '#' + escHtml(item.anchor) : ''}"
             role="option" data-idx="${idx}" tabindex="-1">
            <div class="sr-main">
              <div class="sr-title">${highlight(item.title, query)}</div>
              <div class="sr-meta">
                ${platform}
                ${catBadge}
                ${moduleBadges}
                ${date}
              </div>
              ${snippet}
            </div>
            <span class="sr-arrow">→</span>
          </a>`;
      }

      html += '</div>';
    }

    container.innerHTML = html;

    // Wire clicks
    container.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', () => closeModal());
    });
  }

  // ── Keyboard nav ──────────────────────────────────────────────────────────
  function updateSelection(newIdx) {
    const items = document.querySelectorAll('.search-result-item');
    if (!items.length) return;

    if (selectedIdx >= 0 && items[selectedIdx]) {
      items[selectedIdx].classList.remove('selected');
    }

    selectedIdx = Math.max(0, Math.min(newIdx, items.length - 1));
    const el = items[selectedIdx];
    if (el) {
      el.classList.add('selected');
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  // ── Open / Close ──────────────────────────────────────────────────────────
  let overlay = null;

  function openModal() {
    if (!overlay) overlay = createModal();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    const input = document.getElementById('search-input');
    if (input) {
      input.focus();
      input.value = '';
    }
    resetResults();
    loadIndex();
    wireModal();
  }

  function closeModal() {
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
    selectedIdx = -1;
  }

  function resetResults() {
    const container = document.getElementById('search-results');
    const empty     = document.getElementById('search-empty');
    const noResults = document.getElementById('search-no-results');
    if (container)  { container.style.display = 'none'; container.innerHTML = ''; }
    if (empty)      empty.style.display = '';
    if (noResults)  noResults.style.display = 'none';
    currentResults = [];
  }

  let wired = false;
  function wireModal() {
    if (wired) return;
    wired = true;

    const input  = document.getElementById('search-input');
    const ov     = document.getElementById('search-overlay');
    const modal  = document.getElementById('search-modal');

    // Close on overlay click (outside modal)
    ov.addEventListener('click', e => {
      if (!modal.contains(e.target)) closeModal();
    });

    // Search input
    let debounce;
    input.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(async () => {
        const q = input.value.trim();
        if (!q) { resetResults(); return; }
        await loadIndex();
        const results = doSearch(q);
        renderResults(results, q);
      }, 120);
    });

    // Keyboard navigation
    input.addEventListener('keydown', e => {
      const items = document.querySelectorAll('.search-result-item');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        updateSelection(selectedIdx < 0 ? 0 : selectedIdx + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        updateSelection(selectedIdx <= 0 ? 0 : selectedIdx - 1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIdx >= 0 && items[selectedIdx]) {
          items[selectedIdx].click();
        } else if (items.length > 0) {
          items[0].click();
        }
      } else if (e.key === 'Escape') {
        closeModal();
      }
    });
  }

  // ── Global keyboard shortcut ───────────────────────────────────────────────
  document.addEventListener('keydown', function(e) {
    // Ctrl+K or Cmd+K
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (overlay && overlay.classList.contains('open')) {
        closeModal();
      } else {
        openModal();
      }
      return;
    }
    // "/" key when not in an input
    if (e.key === '/' && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      openModal();
      return;
    }
    // Escape
    if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) {
      closeModal();
    }
  });

  // ── Wire search trigger buttons ───────────────────────────────────────────
  function wireSearchButtons() {
    document.querySelectorAll('#search-trigger, .search-trigger').forEach(btn => {
      btn.addEventListener('click', openModal);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireSearchButtons);
  } else {
    wireSearchButtons();
  }

  // Expose for inline use
  window.openSearch = openModal;

})();
