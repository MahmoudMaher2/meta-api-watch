/* Meta API Watch — Client-Side Logic */

(function () {
  'use strict';

  const html = document.documentElement;

  // ── Theme Toggle ────────────────────────────────────────────────────────────
  const themeBtn  = document.getElementById('theme-toggle');
  const THEME_KEY = 'maw-theme';
  const LANG_KEY  = 'maw-lang';

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  const savedTheme = localStorage.getItem(THEME_KEY)
    || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  applyTheme(savedTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', function() {
      applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function(e) {
    if (!localStorage.getItem(THEME_KEY)) applyTheme(e.matches ? 'light' : 'dark');
  });

  // ── Language Toggle (AR / EN) ───────────────────────────────────────────────
  const langBtn = document.getElementById('lang-toggle');

  function applyLang(lang) {
    html.setAttribute('data-lang', lang);
    html.setAttribute('lang', lang === 'ar' ? 'ar' : 'en');
    html.setAttribute('dir',  lang === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem(LANG_KEY, lang);

    // Update all bilingual text nodes
    document.querySelectorAll('[data-en][data-ar]').forEach(function(el) {
      el.textContent = el.getAttribute(lang === 'ar' ? 'data-ar' : 'data-en');
    });

    // Update expand button labels inside cards
    document.querySelectorAll('.btn-expand').forEach(function(btn) {
      const more = btn.querySelector('.lbl-more');
      const less = btn.querySelector('.lbl-less');
      if (more) more.textContent = more.getAttribute(lang === 'ar' ? 'data-ar' : 'data-en');
      if (less) less.textContent = less.getAttribute(lang === 'ar' ? 'data-ar' : 'data-en');
    });
  }

  const savedLang = localStorage.getItem(LANG_KEY) || 'en';
  applyLang(savedLang);

  if (langBtn) {
    langBtn.addEventListener('click', function() {
      applyLang(html.getAttribute('data-lang') === 'ar' ? 'en' : 'ar');
    });
  }

  // ── Card Expand / Collapse ──────────────────────────────────────────────────
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('.btn-expand');
    if (!btn) return;

    const detId = btn.getAttribute('data-det');
    const detEl = detId ? document.getElementById(detId) : null;
    if (!detEl) return;

    const isOpen = btn.getAttribute('aria-expanded') === 'true';

    if (isOpen) {
      detEl.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      detEl.setAttribute('aria-hidden', 'true');
    } else {
      detEl.classList.remove('open');
      void detEl.offsetWidth; // reflow
      detEl.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      detEl.setAttribute('aria-hidden', 'false');
    }
  });

  // ── Filters (Changelog page only) ───────────────────────────────────────────
  const filterCat = document.getElementById('filter-category');
  const filterMod = document.getElementById('filter-module');
  const clearBtn  = document.getElementById('clear-filters');
  const countEl   = document.getElementById('filtered-count');
  const grid      = document.getElementById('cards-grid');

  // Only wire up filters if we're on a page that has them
  if (grid && filterCat && filterMod && clearBtn) {

    function applyFilters() {
      const cat   = filterCat.value.toLowerCase();
      const mod   = filterMod.value.toLowerCase();
      const cards = grid.querySelectorAll('.card');
      let visible = 0;

      cards.forEach(function(card) {
        const cardCat  = (card.dataset.category || '').toLowerCase();
        const cardMods = (card.dataset.modules  || '').toLowerCase();
        const catOk = !cat || cardCat === cat;
        const modOk = !mod || cardMods.split(',').map(function(m) { return m.trim(); }).includes(mod);
        const show = catOk && modOk;
        card.classList.toggle('hidden', !show);
        if (show) visible++;
      });

      if (countEl) countEl.textContent = visible;
    }

    filterCat.addEventListener('change', applyFilters);
    filterMod.addEventListener('change', applyFilters);

    clearBtn.addEventListener('click', function() {
      filterCat.value = '';
      filterMod.value = '';
      applyFilters();
    });

    // Stagger card animations
    grid.querySelectorAll('.card').forEach(function(card, i) {
      card.style.animationDelay = (i * 30) + 'ms';
    });
  }

})();
