const fs = require('fs');

/** Shared top header */
function buildHeader(basePath, activePage, lastBuild) {
  const isIndex = activePage === 'changelog' ? 'active' : '';
  const isLearn = activePage === 'learn' ? 'active' : '';
  const isTools = activePage === 'tools' ? 'active' : '';
  
  return `<header class="site-header">
  <div class="header-inner">
    <div class="header-logo">
      <span class="logo-icon">🔭</span>
      <div class="logo-text">
        <strong>Meta API Watch</strong>
        <span>SEEN V2 · Developer Hub</span>
      </div>
    </div>
    
    <nav class="header-nav">
      <a href="${basePath}index.html" class="nav-item ${isIndex}">
        <span class="nav-icon">🔔</span>
        Latest Updates
      </a>
      <a href="${basePath}learn/index.html" class="nav-item ${isLearn}">
        <span class="nav-icon">📚</span>
        Learn
      </a>
    </nav>

    <div class="header-actions">
      <!-- Search Trigger -->
      <button id="search-trigger" class="search-btn" title="Search documentation... (Ctrl+K)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <span>Search...</span>
        <kbd>/</kbd>
      </button>

      <div class="build-badge">
        <span class="pulse"></span>
        LAST BUILD ${lastBuild || ''}
      </div>
      
      <!-- Language Toggle -->
      <button id="lang-toggle" class="icon-btn" title="Toggle Language (AR/EN)">
        <span class="lang-en">EN</span>
        <span class="lang-ar">عربي</span>
      </button>
      
      <!-- Theme Toggle -->
      <button id="theme-toggle" class="icon-btn" title="Toggle Theme">
        <span class="moon">🌙</span>
        <span class="sun">☀️</span>
      </button>
    </div>
  </div>
</header>

<!-- Search Modal -->
<div id="search-modal" class="search-modal">
  <div class="search-modal-content">
    <div class="search-header">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <input type="text" id="search-input" placeholder="Search topics, error codes, guidelines..." autocomplete="off">
      <button id="search-close" class="icon-btn">×</button>
    </div>
    <div id="search-results" class="search-results"></div>
    <div class="search-footer">
      <span><kbd>↑</kbd> <kbd>↓</kbd> to navigate</span>
      <span><kbd>Enter</kbd> to select</span>
      <span><kbd>ESC</kbd> to close</span>
    </div>
  </div>
</div>
`;
}

/** Shared <script> logic for theme, lang, search wire-up */
function buildSharedScript(bp, extraJs) {
  return `<script>
(function(){
  var html=document.documentElement;
  var theme=localStorage.getItem('theme');
  if(!theme){
    theme=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';
  }
  function applyTheme(t){
    html.setAttribute('data-theme',t);
    localStorage.setItem('theme',t);
  }
  applyTheme(theme);
  
  var lang=localStorage.getItem('lang')||'en';
  function applyLang(l){
    html.setAttribute('data-lang',l);
    localStorage.setItem('lang',l);
  }
  applyLang(lang);

  function wireButtons(){
    var thBtn=document.getElementById('theme-toggle');
    if(thBtn) thBtn.addEventListener('click',function(){
      applyTheme(html.getAttribute('data-theme')==='dark'?'light':'dark');
    });
    var lgBtn=document.getElementById('lang-toggle');
    if(lgBtn) lgBtn.addEventListener('click',function(){
      applyLang(html.getAttribute('data-lang')==='ar'?'en':'ar');
    });
    ${extraJs || ''}
  }

  // Global handler for interactive MCQ quizzes
  window.handleMcqClick = function(radio) {
    var container = radio.closest('.mcq-options');
    var labels = container.querySelectorAll('.mcq-option');
    var widget = radio.closest('.mcq-widget');
    var progressFill = widget.querySelector('.mcq-progress-bar-fill');
    var progressPct = widget.querySelector('.mcq-pct');
    
    // Lock all inputs & show correct/wrong
    labels.forEach(function(l) {
      var inp = l.querySelector('input');
      inp.disabled = true;
      if (inp.value === 'correct') {
        l.classList.add('correct');
      } else if (inp === radio && inp.value === 'wrong') {
        l.classList.add('wrong');
      }
    });
    
    // Update progress bar
    if(progressFill) progressFill.style.width = '100%';
    if(progressPct) progressPct.innerText = '100%';
  };

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',wireButtons);
  } else {
    wireButtons();
  }
})();
</script>
<script>var _SEARCH_BASE_='${bp}';</script>
<script src="${bp}search.js"></script>
<!-- Syntax Highlighting (PrismJS) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-json.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-bash.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-markup.min.js"></script>
`;
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
  <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet" />
</head>`;
}

module.exports = { buildHeader, buildSharedScript, buildHead };
