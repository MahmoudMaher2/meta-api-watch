/* Meta Docs Learn — Client-Side Logic */
(function () {
  'use strict';

  // ── Theme ──────────────────────────────────────────────────────────────────
  const html = document.documentElement;
  const themeBtn = document.getElementById('theme-toggle');
  const KEY = 'maw-theme';

  function applyTheme(t) {
    html.setAttribute('data-theme', t);
    localStorage.setItem(KEY, t);
  }

  const saved = localStorage.getItem(KEY) ||
    (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  applyTheme(saved);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  // ── TOC Active Highlight ───────────────────────────────────────────────────
  const tocLinks = document.querySelectorAll('.toc-list a');
  if (tocLinks.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          tocLinks.forEach(l => l.classList.remove('active'));
          const link = document.querySelector(`.toc-list a[href="#${entry.target.id}"]`);
          if (link) link.classList.add('active');
        }
      }
    }, { rootMargin: '-10% 0px -80% 0px' });

    document.querySelectorAll('.topic-body h2, .topic-body h3').forEach(h => {
      if (h.id) observer.observe(h);
    });
  }

  // ── Code block copy button ─────────────────────────────────────────────────
  document.querySelectorAll('.code-block').forEach(block => {
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.style.cssText = `
      position: absolute; top: 10px; right: 10px;
      background: var(--bg3); border: 1px solid var(--border);
      color: var(--text-muted); padding: 4px 10px; border-radius: 5px;
      font-size: 0.72rem; cursor: pointer; font-family: inherit;
      transition: all 0.15s;
    `;
    btn.addEventListener('click', () => {
      const code = block.querySelector('code');
      navigator.clipboard.writeText(code.textContent).then(() => {
        btn.textContent = 'Copied!';
        btn.style.color = '#4ade80';
        setTimeout(() => { btn.textContent = 'Copy'; btn.style.color = ''; }, 2000);
      });
    });
    block.appendChild(btn);
  });

  // ── Smooth scroll for TOC links ────────────────────────────────────────────
  document.querySelectorAll('.toc-list a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

})();
