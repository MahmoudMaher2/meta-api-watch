/* Meta API Watch — Client-Side Filtering */

(function () {
  'use strict';

  const filterCat    = document.getElementById('filter-category');
  const filterMod    = document.getElementById('filter-module');
  const clearBtn     = document.getElementById('clear-filters');
  const countEl      = document.getElementById('filtered-count');
  const grid         = document.getElementById('cards-grid');

  if (!grid) return;

  function applyFilters() {
    const cat = filterCat.value.toLowerCase();
    const mod = filterMod.value.toLowerCase();
    const cards = grid.querySelectorAll('.card');
    let visible = 0;

    cards.forEach(card => {
      const cardCat = (card.dataset.category || '').toLowerCase();
      const cardMods = (card.dataset.modules || '').toLowerCase();

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
