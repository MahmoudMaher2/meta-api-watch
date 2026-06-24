/* ═══════════════════════════════════════════════════════════════
   Meta API Watch — Professional Search Modal
   site/search.js
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Resolve base path (set by inline script before this file loads) ───────
  // Each page sets: <script>var _SEARCH_BASE_='../';</script>
  var BASE = (typeof _SEARCH_BASE_ !== 'undefined') ? _SEARCH_BASE_ : '';
  var INDEX_URL = BASE + 'search-index.json';

  var searchIndex   = null;
  var selectedIdx   = -1;
  var currentResults = [];

  // ── Build modal DOM ───────────────────────────────────────────────────────
  function createModal() {
    var overlay = document.createElement('div');
    overlay.id = 'search-overlay';
    overlay.innerHTML = [
      '<div class="search-modal" id="search-modal" role="dialog" aria-modal="true" aria-label="Site Search">',
      '  <div class="search-modal-header">',
      '    <div class="search-input-wrap">',
      '      <span class="search-icon-prefix">',
      '        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">',
      '          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
      '        </svg>',
      '      </span>',
      '      <input id="search-input" type="text" placeholder="Search changelog, docs, topics…"',
      '             autocomplete="off" autocorrect="off" spellcheck="false" aria-label="Search" />',
      '      <kbd class="search-esc-hint" id="search-esc-btn">ESC</kbd>',
      '    </div>',
      '  </div>',
      '  <div class="search-body" id="search-body">',
      '    <div class="search-empty-state" id="search-empty">',
      '      <div class="search-empty-icon">🔍</div>',
      '      <p class="search-empty-title">Search across 121 articles &amp; docs</p>',
      '      <p class="search-empty-sub">Changelog changes, Learn topics, validation rules, error codes…</p>',
      '      <div class="search-shortcuts-grid">',
      '        <div class="shortcut-item"><kbd>↑</kbd><kbd>↓</kbd><span>Navigate</span></div>',
      '        <div class="shortcut-item"><kbd>↵</kbd><span>Open</span></div>',
      '        <div class="shortcut-item"><kbd>ESC</kbd><span>Close</span></div>',
      '        <div class="shortcut-item"><kbd>/</kbd><span>Quick open</span></div>',
      '      </div>',
      '    </div>',
      '    <div id="search-results" class="search-results" role="listbox" style="display:none"></div>',
      '    <div id="search-no-results" class="search-no-results" style="display:none">',
      '      <div class="search-empty-icon">🤷</div>',
      '      <p class="search-empty-title">No results found</p>',
      '      <p class="search-empty-sub">Try different keywords or check spelling.</p>',
      '    </div>',
      '  </div>',
      '  <div class="search-footer">',
      '    <span class="search-footer-brand">🔭 Meta API Watch</span>',
      '    <span class="search-footer-hint">',
      '      <kbd>/</kbd> to open · <kbd>↑↓</kbd> navigate · <kbd>↵</kbd> open',
      '    </span>',
      '  </div>',
      '</div>'
    ].join('');
    document.body.appendChild(overlay);
    return overlay;
  }

  // ── Fetch + cache index ───────────────────────────────────────────────────
  function loadIndex(cb) {
    if (searchIndex) { cb(searchIndex); return; }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', INDEX_URL);
    xhr.onload = function() {
      if (xhr.status === 200) {
        try {
          searchIndex = JSON.parse(xhr.responseText);
          var el = document.querySelector('.search-empty-title');
          if (el) el.textContent = 'Search across ' + searchIndex.items.length + ' articles & docs';
          cb(searchIndex);
        } catch(e) { console.warn('[Search] JSON parse error', e); }
      }
    };
    xhr.onerror = function() { console.warn('[Search] Failed to fetch', INDEX_URL); };
    xhr.send();
  }

  // ── Highlight match ───────────────────────────────────────────────────────
  function escHtml(s) {
    return String(s || '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }

  function highlight(text, query) {
    if (!query || !text) return escHtml(text || '');
    var out = escHtml(text);
    var words = query.trim().split(/\s+/).filter(Boolean);
    for (var i = 0; i < words.length; i++) {
      var re = new RegExp('(' + escRe(escHtml(words[i])) + ')', 'gi');
      out = out.replace(re, '<mark>$1</mark>');
    }
    return out;
  }

  // ── Scoring ───────────────────────────────────────────────────────────────
  function scoreItem(item, words) {
    var score = 0;
    var titleLow = (item.title || '').toLowerCase();
    for (var i = 0; i < words.length; i++) {
      var wl = words[i].toLowerCase();
      if (titleLow.indexOf(wl) === 0)         score += 100;
      else if (titleLow.indexOf(wl) > -1)     score += 60;
      if ((item.category || '').toLowerCase().indexOf(wl) > -1) score += 30;
      if ((item.platform || '').toLowerCase().indexOf(wl) > -1) score += 25;
      if (Array.isArray(item.modules)) {
        for (var m = 0; m < item.modules.length; m++) {
          if (item.modules[m].toLowerCase().indexOf(wl) > -1) { score += 25; break; }
        }
      }
      if (Array.isArray(item.headings)) {
        for (var h = 0; h < item.headings.length; h++) {
          if (item.headings[h].toLowerCase().indexOf(wl) > -1) { score += 20; break; }
        }
      }
      if ((item.snippet || '').toLowerCase().indexOf(wl) > -1) score += 10;
      if ((item.body    || '').toLowerCase().indexOf(wl) > -1) score += 5;
    }
    return score;
  }

  function doSearch(query) {
    if (!searchIndex) return [];
    var words = query.trim().split(/\s+/).filter(function(w){ return w.length > 1; });
    if (!words.length) return [];
    var scored = [];
    for (var i = 0; i < searchIndex.items.length; i++) {
      var s = scoreItem(searchIndex.items[i], words);
      if (s > 0) scored.push({ item: searchIndex.items[i], score: s });
    }
    scored.sort(function(a,b){ return b.score - a.score; });
    return scored.slice(0, 30).map(function(r){ return r.item; });
  }

  // ── Render ────────────────────────────────────────────────────────────────
  var TYPE_LABELS = { changelog: { label: 'Changelog', icon: '🔔' }, learn: { label: 'Learn', icon: '📚' } };

  function renderResults(results, query) {
    var container  = document.getElementById('search-results');
    var empty      = document.getElementById('search-empty');
    var noResults  = document.getElementById('search-no-results');
    currentResults = results;
    selectedIdx    = -1;

    if (!results.length) {
      container.style.display  = 'none';
      empty.style.display      = 'none';
      noResults.style.display  = '';
      return;
    }
    empty.style.display     = 'none';
    noResults.style.display = 'none';
    container.style.display = '';

    // Group by type
    var groups = {};
    for (var i = 0; i < results.length; i++) {
      var t = results[i].type;
      if (!groups[t]) groups[t] = [];
      groups[t].push(results[i]);
    }

    var html = '';
    var globalIdx = 0;
    var types = Object.keys(groups);
    for (var ti = 0; ti < types.length; ti++) {
      var type  = types[ti];
      var items = groups[type];
      var tl    = TYPE_LABELS[type] || { label: type, icon: '📄' };
      html += '<div class="search-group"><div class="search-group-label">' +
              tl.icon + ' ' + tl.label +
              ' <span class="search-group-count">' + items.length + '</span></div>';

      for (var ii = 0; ii < items.length; ii++) {
        var item    = items[ii];
        var idx     = globalIdx++;
        var url     = item.url + (item.anchor ? '#' + item.anchor : '');
        var modules = Array.isArray(item.modules) ? item.modules.slice(0,3) : [];
        var modBadges = modules.map(function(m){ return '<span class="sr-badge">' + escHtml(m) + '</span>'; }).join('');
        var catBadge  = item.category ? '<span class="sr-cat-badge">' + escHtml(item.category) + '</span>' : '';
        var platform  = item.platform ? '<span class="sr-platform">' + escHtml(item.platform) + '</span>' : '';
        var date      = item.date     ? '<span class="sr-date">' + escHtml(item.date) + '</span>' : '';
        var snippet   = item.snippet  ? '<p class="sr-snippet">' + highlight(item.snippet, query) + '</p>' : '';

        html += '<a class="search-result-item" href="' + escHtml(BASE + url) +
                '" role="option" data-idx="' + idx + '" tabindex="-1">' +
                '<div class="sr-main">' +
                '<div class="sr-title">' + highlight(item.title, query) + '</div>' +
                '<div class="sr-meta">' + platform + catBadge + modBadges + date + '</div>' +
                snippet + '</div><span class="sr-arrow">→</span></a>';
      }
      html += '</div>';
    }
    container.innerHTML = html;

    // Wire result clicks to close modal
    var resultEls = container.querySelectorAll('.search-result-item');
    for (var ri = 0; ri < resultEls.length; ri++) {
      resultEls[ri].addEventListener('click', closeModal);
    }
  }

  // ── Keyboard nav ──────────────────────────────────────────────────────────
  function updateSelection(newIdx) {
    var items = document.querySelectorAll('.search-result-item');
    if (!items.length) return;
    if (selectedIdx >= 0 && items[selectedIdx]) items[selectedIdx].classList.remove('selected');
    selectedIdx = Math.max(0, Math.min(newIdx, items.length - 1));
    var el = items[selectedIdx];
    if (el) { el.classList.add('selected'); el.scrollIntoView({ block: 'nearest' }); }
  }

  // ── Open / Close ──────────────────────────────────────────────────────────
  var overlay = null;
  var wired   = false;

  function openModal() {
    if (!overlay) {
      overlay = createModal();
      wireModal();
    }
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    var input = document.getElementById('search-input');
    if (input) { input.focus(); input.value = ''; }
    resetResults();
    loadIndex(function(idx) {
      var el = document.querySelector('.search-empty-title');
      if (el) el.textContent = 'Search across ' + idx.items.length + ' articles & docs';
    });
  }

  function closeModal() {
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
    selectedIdx = -1;
  }

  function resetResults() {
    var container = document.getElementById('search-results');
    var empty     = document.getElementById('search-empty');
    var noResults = document.getElementById('search-no-results');
    if (container)  { container.style.display = 'none'; container.innerHTML = ''; }
    if (empty)      empty.style.display = '';
    if (noResults)  noResults.style.display = 'none';
    currentResults = [];
  }

  function wireModal() {
    if (wired) return;
    wired = true;

    var ov    = document.getElementById('search-overlay');
    var modal = document.getElementById('search-modal');
    var input = document.getElementById('search-input');
    var escBtn = document.getElementById('search-esc-btn');

    // Close on backdrop click
    ov.addEventListener('click', function(e) {
      if (!modal.contains(e.target)) closeModal();
    });

    // ESC button click
    if (escBtn) escBtn.addEventListener('click', closeModal);

    // Debounced search
    var debounce;
    input.addEventListener('input', function() {
      clearTimeout(debounce);
      debounce = setTimeout(function() {
        var q = input.value.trim();
        if (!q) { resetResults(); return; }
        loadIndex(function() {
          var results = doSearch(q);
          renderResults(results, q);
        });
      }, 120);
    });

    // Keyboard navigation inside input
    input.addEventListener('keydown', function(e) {
      var items = document.querySelectorAll('.search-result-item');
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

  // ── Global keyboard shortcuts ──────────────────────────────────────────────
  document.addEventListener('keydown', function(e) {
    var tag = document.activeElement ? document.activeElement.tagName : '';
    var inInput = (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT');

    // "/" key when NOT in an input — open search
    if (e.key === '/' && !inInput) {
      e.preventDefault();
      if (overlay && overlay.classList.contains('open')) { closeModal(); } else { openModal(); }
      return;
    }

    // Escape — close modal
    if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) {
      e.preventDefault();
      closeModal();
      return;
    }
  });

  // ── Wire search trigger button ─────────────────────────────────────────────
  function wireSearchButton() {
    var btn = document.getElementById('search-trigger');
    if (btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openModal();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireSearchButton);
  } else {
    wireSearchButton();
  }

  // Expose globally
  window.openSearch = openModal;
  window.closeSearch = closeModal;

})();
