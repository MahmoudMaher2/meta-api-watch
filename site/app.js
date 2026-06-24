/* Meta API Watch — Client-Side Logic */

(function () {
  'use strict';

  // ── Theme Toggle ──────────────────────────────────────────────────────────
  const html      = document.documentElement;
  const themeBtn  = document.getElementById('theme-toggle');
  const STORAGE_KEY = 'maw-theme';

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  // Load saved theme or fall back to system preference
  const savedTheme = localStorage.getItem(STORAGE_KEY) || getSystemTheme();
  applyTheme(savedTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // Sync with OS theme changes (if user hasn't manually set a preference)
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? 'light' : 'dark');
    }
  });

  // ── Filters ───────────────────────────────────────────────────────────────
  const filterCat = document.getElementById('filter-category');
  const filterMod = document.getElementById('filter-module');
  const clearBtn  = document.getElementById('clear-filters');
  const countEl   = document.getElementById('filtered-count');
  const grid      = document.getElementById('cards-grid');

  if (!grid) return;

  function applyFilters() {
    const cat = filterCat.value.toLowerCase();
    const mod = filterMod.value.toLowerCase();
    const cards = grid.querySelectorAll('.card');
    let visible = 0;

    cards.forEach(card => {
      const cardCat  = (card.dataset.category || '').toLowerCase();
      const cardMods = (card.dataset.modules  || '').toLowerCase();

      const catOk = !cat || cardCat === cat;
      const modOk = !mod || cardMods.split(',').map(m => m.trim()).includes(mod);

      const show = catOk && modOk;
      card.classList.toggle('hidden', !show);
      if (show) visible++;
    });

    if (countEl) countEl.textContent = visible;
  }

  filterCat.addEventListener('change', applyFilters);
  filterMod.addEventListener('change', applyFilters);

  clearBtn.addEventListener('click', () => {
    filterCat.value = '';
    filterMod.value = '';
    applyFilters();
  });

  // Animate cards on load with stagger
  const cards = grid.querySelectorAll('.card');
  cards.forEach((card, i) => {
    card.style.animationDelay = `${i * 40}ms`;
  });
})();
