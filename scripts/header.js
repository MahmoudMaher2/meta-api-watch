#!/usr/bin/env node
'use strict';
/**
 * scripts/header.js — Shared header builder for ALL Meta API Watch pages.
 *
 * Usage:
 *   const { buildHeader, buildSharedScript } = require('./header');
 *   const headerHtml = buildHeader('', 'changelog');   // root page
 *   const headerHtml = buildHeader('../', 'learn');    // from learn/
 *   const headerHtml = buildHeader('../../', 'learn'); // from learn/topics/
 */

function buildHeader(basePath, activePage) {
  const bp = basePath || '';
  const isChangelog = activePage === 'changelog';
  const isLearn     = activePage === 'learn';

  return `<header class="site-header">
  <div class="header-inner">

    <a href="${bp}index.html" class="header-logo" aria-label="Meta API Watch Home">
      <span class="logo-icon">🔭</span>
      <div class="logo-text">
        <span class="site-title">Meta API Watch</span>
        <span class="site-subtitle"
              data-en="SEEN V2 · Developer Hub"
              data-ar="SEEN V2 · مركز المطورين">SEEN V2 · Developer Hub</span>
      </div>
    </a>

    <nav class="header-nav" role="navigation" aria-label="Main navigation">
      <a href="${bp}changelog.html"
         class="nav-tab${isChangelog ? ' active' : ''}"
         ${isChangelog ? 'aria-current="page"' : ''}>
        <span data-en="🔔 Latest Updates" data-ar="🔔 آخر التحديثات">🔔 Latest Updates</span>
      </a>
      <a href="${bp}learn/index.html"
         class="nav-tab${isLearn ? ' active' : ''}"
         ${isLearn ? 'aria-current="page"' : ''}>
        <span data-en="📚 Learn" data-ar="📚 تعلّم">📚 Learn</span>
      </a>
    </nav>

    <div class="header-actions">
      <button class="lang-toggle" id="lang-toggle" aria-label="Toggle language">
        <span class="lang-en">EN</span>
        <span class="lang-sep" aria-hidden="true">·</span>
        <span class="lang-ar">عربي</span>
      </button>
      <button class="theme-toggle" id="theme-toggle" aria-label="Toggle dark/light mode">
        <span class="icon-sun">☀️</span>
        <span class="icon-moon">🌙</span>
      </button>
    </div>

  </div>
</header>`;
}

/**
 * Inline JS for theme + language toggle.
 * Accepts optional extra JS string to run inside the IIFE.
 */
function buildSharedScript(extraJs) {
  return `<script>
(function(){
  var html=document.documentElement,TK='maw-theme',LK='maw-lang';

  // ── Theme ────────────────────────────────────────────────
  function applyTheme(t){html.setAttribute('data-theme',t);localStorage.setItem(TK,t);}
  applyTheme(localStorage.getItem(TK)||(window.matchMedia('(prefers-color-scheme:light)').matches?'light':'dark'));
  var thBtn=document.getElementById('theme-toggle');
  if(thBtn) thBtn.addEventListener('click',function(){
    applyTheme(html.getAttribute('data-theme')==='dark'?'light':'dark');
  });

  // ── Language ─────────────────────────────────────────────
  function applyLang(l){
    html.setAttribute('data-lang',l);
    html.setAttribute('lang',l==='ar'?'ar':'en');
    html.setAttribute('dir',l==='ar'?'rtl':'ltr');
    localStorage.setItem(LK,l);
    document.querySelectorAll('[data-en][data-ar]').forEach(function(el){
      el.textContent=el.getAttribute(l==='ar'?'data-ar':'data-en');
    });
  }
  applyLang(localStorage.getItem(LK)||'en');
  var lgBtn=document.getElementById('lang-toggle');
  if(lgBtn) lgBtn.addEventListener('click',function(){
    applyLang(html.getAttribute('data-lang')==='ar'?'en':'ar');
  });

  ${extraJs || ''}
})();
</script>`;
}

/** Shared <head> open — fonts + CSS reference */
function buildHead(title, description, cssPath) {
  return `<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${cssPath}" />
</head>`;
}

module.exports = { buildHeader, buildSharedScript, buildHead };
