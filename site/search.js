/* ═══════════════════════════════════════════════════════════════
   Meta API Explain — Professional Search Modal
   site/search.js
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Config ────────────────────────────────────────────────────────────────
  var BASE      = (typeof _SEARCH_BASE_ !== 'undefined') ? _SEARCH_BASE_ : '';
  var INDEX_URL = BASE + 'search-index.json';
  var RECENT_KEY    = 'maw-recent-searches';
  var HIGHLIGHT_KEY = 'maw-highlight-query';
  var MAX_RECENT    = 8;

  var searchIndex    = null;
  var selectedIdx    = -1;
  var currentResults = [];
  var overlay        = null;
  var wired          = false;

  // ════════════════════════════════════════════════════════════════
  // PAGE HIGHLIGHT — runs on every page load
  // ════════════════════════════════════════════════════════════════
  var currentMarks = [];
  var currentHlIndex = -1;
  var localSearchTimer = null;

  function runPageHighlight() {
    var query = '';
    try { query = sessionStorage.getItem(HIGHLIGHT_KEY) || ''; } catch(e) {}
    if (!query) return;
    highlightPageContent(query, false);
  }

  function highlightPageContent(query, isInteractive) {
    var words = query.trim().split(/\s+/).filter(function(w){ return w.length > 0; });
    
    // Clear previous
    var existingMarks = document.querySelectorAll('mark.search-hl');
    for (var i = 0; i < existingMarks.length; i++) {
      var m = existingMarks[i];
      if (m.parentNode) m.parentNode.replaceChild(document.createTextNode(m.textContent), m);
    }
    currentMarks = [];
    currentHlIndex = -1;

    if (!words.length) {
      if (isInteractive) updateBannerCount(0);
      return;
    }

    var target = document.querySelector('main, .learn-content, .cards-grid, #cards-grid, .card-body, article');
    if (!target) return;

    var count = highlightInNode(target, words);
    currentMarks = document.querySelectorAll('mark.search-hl');
    
    if (isInteractive) {
      updateBannerCount(count);
      if (count > 0) scrollToMatch(0);
    } else {
      if (count > 0) {
        showHighlightBanner(query, count);
        setTimeout(function() { scrollToMatch(0); }, 200);
      }
    }
  }

  function scrollToMatch(index) {
    if (!currentMarks.length) return;
    if (currentHlIndex >= 0 && currentHlIndex < currentMarks.length) {
      currentMarks[currentHlIndex].classList.remove('active-hl');
    }
    currentHlIndex = index;
    if (currentHlIndex < 0) currentHlIndex = currentMarks.length - 1;
    if (currentHlIndex >= currentMarks.length) currentHlIndex = 0;
    
    var m = currentMarks[currentHlIndex];
    m.classList.add('active-hl');
    m.scrollIntoView({ behavior: 'smooth', block: 'center' });
    updateBannerCount(currentMarks.length);
  }

  function updateBannerCount(total) {
    var countEl = document.getElementById('hl-banner-count');
    if (countEl) {
      if (total === 0) countEl.textContent = '0 / 0';
      else countEl.textContent = (currentHlIndex + 1) + ' / ' + total;
    }
  }

  function highlightInNode(root, words) {
    var re = new RegExp('(' + words.map(escRe).join('|') + ')', 'gi');
    var count = 0;
    function walk(node) {
      if (node.nodeType === 3) {
        var m = node.nodeValue.match(re);
        if (m) {
          var frag = document.createDocumentFragment();
          var remaining = node.nodeValue;
          re.lastIndex = 0;
          var parts = remaining.split(re);
          for (var i = 0; i < parts.length; i++) {
            if (parts[i].match(re)) {
              var mark = document.createElement('mark');
              mark.className = 'search-hl';
              mark.textContent = parts[i];
              frag.appendChild(mark);
              count++;
            } else {
              frag.appendChild(document.createTextNode(parts[i]));
            }
          }
          if(node.parentNode) node.parentNode.replaceChild(frag, node);
        }
      } else if (node.nodeType === 1) {
        var tag = node.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'MARK' ||
            tag === 'HEADER' || tag === 'NAV' || tag === 'FOOTER' ||
            node.id === 'search-overlay' || node.id === 'search-highlight-banner') return;
        var children = Array.prototype.slice.call(node.childNodes);
        for (var c = 0; c < children.length; c++) { walk(children[c]); }
      }
    }
    walk(root);
    return count;
  }

  function showHighlightBanner(initialQuery, initialCount) {
    var banner = document.getElementById('search-highlight-banner');
    if (banner) {
      var input = document.getElementById('hl-banner-input');
      if (input) { input.focus(); input.select(); }
      return;
    }
    
    banner = document.createElement('div');
    banner.id = 'search-highlight-banner';
    banner.innerHTML =
      '<span class="hl-banner-icon">🔍</span>' +
      '<input type="text" id="hl-banner-input" class="hl-banner-input" placeholder="Find in page..." autocomplete="off" spellcheck="false" value="' + escHtml(initialQuery||'') + '">' +
      '<span class="hl-banner-text"><strong id="hl-banner-count">' + (initialCount ? '1 / ' + initialCount : '0 / 0') + '</strong> matches</span>' +
      '<div class="hl-banner-nav">' +
      '  <button class="hl-banner-btn" id="hl-banner-prev" title="Previous match">▲</button>' +
      '  <button class="hl-banner-btn" id="hl-banner-next" title="Next match">▼</button>' +
      '</div>' +
      '<button class="hl-banner-clear" id="hl-banner-clear" title="Close">✕</button>';
    document.body.appendChild(banner);

    var input = document.getElementById('hl-banner-input');
    
    input.addEventListener('input', function() {
      clearTimeout(localSearchTimer);
      localSearchTimer = setTimeout(function() {
        highlightPageContent(input.value, true);
      }, 150);
    });
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        scrollToMatch(currentHlIndex + 1);
      } else if (e.key === 'Escape') {
        closeHighlightBanner();
      }
    });

    document.getElementById('hl-banner-prev').addEventListener('click', function() { scrollToMatch(currentHlIndex - 1); });
    document.getElementById('hl-banner-next').addEventListener('click', function() { scrollToMatch(currentHlIndex + 1); });
    document.getElementById('hl-banner-clear').addEventListener('click', function() { closeHighlightBanner(); });
    
    if (!initialQuery) {
      setTimeout(function() { input.focus(); }, 100);
    }
  }

  function closeHighlightBanner() {
    clearPageHighlights();
    var banner = document.getElementById('search-highlight-banner');
    if (banner) {
      banner.style.animation = 'hl-banner-out .3s forwards';
      setTimeout(function(){ if (banner.parentNode) banner.parentNode.removeChild(banner); }, 350);
    }
  }

  function clearPageHighlights() {
    try { sessionStorage.removeItem(HIGHLIGHT_KEY); } catch(e) {}
    var existingMarks = document.querySelectorAll('mark.search-hl');
    for (var i = 0; i < existingMarks.length; i++) {
      var m = existingMarks[i];
      if (m.parentNode) m.parentNode.replaceChild(document.createTextNode(m.textContent), m);
    }
    var target = document.querySelector('main, .learn-content, .cards-grid, #cards-grid, .card-body, article');
    if (target) target.normalize(); // Merge adjacent text nodes so subsequent searches work!
    
    currentMarks = [];
    currentHlIndex = -1;
  }

  // ════════════════════════════════════════════════════════════════
  // RECENT SEARCHES
  // ════════════════════════════════════════════════════════════════
  function getRecent() {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch(e) { return []; }
  }

  function saveRecent(query) {
    if (!query || query.length < 2) return;
    var list = getRecent().filter(function(q){ return q.toLowerCase() !== query.toLowerCase(); });
    list.unshift(query);
    list = list.slice(0, MAX_RECENT);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(list)); } catch(e) {}
  }

  function renderRecent() {
    var list = getRecent();
    var emptyState = document.getElementById('search-empty');
    if (!emptyState) return;

    // Remove old recent block if any
    var old = document.getElementById('search-recent-block');
    if (old) old.parentNode.removeChild(old);

    if (!list.length) return;

    var block = document.createElement('div');
    block.id = 'search-recent-block';
    block.className = 'search-recent-block';
    block.innerHTML =
      '<div class="search-recent-header">' +
        '<span class="search-recent-label">🕐 Recent Searches</span>' +
        '<button class="search-recent-clear-all" id="search-recent-clear-all">Clear all</button>' +
      '</div>' +
      '<div class="search-recent-chips" id="search-recent-chips">' +
        list.map(function(q) {
          return '<button class="search-recent-chip" data-q="' + escHtml(q) + '">' +
                 '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
                 escHtml(q) + '</button>';
        }).join('') +
      '</div>';
    emptyState.appendChild(block);

    // Wire chip clicks
    block.querySelectorAll('.search-recent-chip').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var q = btn.getAttribute('data-q');
        var input = document.getElementById('search-input');
        if (input) { input.value = q; input.dispatchEvent(new Event('input')); input.focus(); }
      });
    });

    // Wire clear all
    document.getElementById('search-recent-clear-all').addEventListener('click', function() {
      try { localStorage.removeItem(RECENT_KEY); } catch(e) {}
      var b = document.getElementById('search-recent-block');
      if (b) b.parentNode.removeChild(b);
    });
  }

  // ════════════════════════════════════════════════════════════════
  // MODAL DOM
  // ════════════════════════════════════════════════════════════════
  function createModal() {
    var ov = document.createElement('div');
    ov.id = 'search-overlay';
    ov.innerHTML = [
      '<div class="search-modal" id="search-modal" role="dialog" aria-modal="true">',
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
      '    <span class="search-footer-brand">🔭 Meta API Explain</span>',
      '    <span class="search-footer-hint">',
      '      <kbd>/</kbd> to open · <kbd>↑↓</kbd> navigate · <kbd>↵</kbd> open',
      '    </span>',
      '  </div>',
      '</div>'
    ].join('');
    document.body.appendChild(ov);
    return ov;
  }

  // ════════════════════════════════════════════════════════════════
  // INDEX LOADING
  // ════════════════════════════════════════════════════════════════
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

  // ════════════════════════════════════════════════════════════════
  // SEARCH LOGIC
  // ════════════════════════════════════════════════════════════════
  function escHtml(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }

  function highlight(text, query) {
    if (!query || !text) return escHtml(text||'');
    var out = escHtml(text);
    var words = query.trim().split(/\s+/).filter(Boolean);
    for (var i = 0; i < words.length; i++) {
      var re = new RegExp('('+escRe(escHtml(words[i]))+')','gi');
      out = out.replace(re,'<mark>$1</mark>');
    }
    return out;
  }

  function scoreItem(item, words) {
    var score = 0;
    var tl = (item.title||'').toLowerCase();
    for (var i = 0; i < words.length; i++) {
      var wl = words[i].toLowerCase();
      if (tl.indexOf(wl)===0) score+=100; else if (tl.indexOf(wl)>-1) score+=60;
      if ((item.category||'').toLowerCase().indexOf(wl)>-1) score+=30;
      if ((item.platform||'').toLowerCase().indexOf(wl)>-1) score+=25;
      if (Array.isArray(item.modules)) { for(var m=0;m<item.modules.length;m++){ if(item.modules[m].toLowerCase().indexOf(wl)>-1){score+=25;break;}}}
      if (Array.isArray(item.headings)){ for(var h=0;h<item.headings.length;h++){ if(item.headings[h].toLowerCase().indexOf(wl)>-1){score+=20;break;}}}
      if ((item.snippet||'').toLowerCase().indexOf(wl)>-1) score+=10;
      if ((item.body   ||'').toLowerCase().indexOf(wl)>-1) score+=5;
    }
    return score;
  }

  function doSearch(query) {
    if (!searchIndex) return [];
    var words = query.trim().split(/\s+/).filter(function(w){ return w.length>1; });
    if (!words.length) return [];
    var scored=[];
    for (var i=0;i<searchIndex.items.length;i++){
      var s=scoreItem(searchIndex.items[i],words);
      if(s>0) scored.push({item:searchIndex.items[i],score:s});
    }
    scored.sort(function(a,b){return b.score-a.score;});
    return scored.slice(0,30).map(function(r){return r.item;});
  }

  // ════════════════════════════════════════════════════════════════
  // RENDER RESULTS
  // ════════════════════════════════════════════════════════════════
  var TYPE_LABELS={changelog:{label:'Changelog',icon:'🔔'},learn:{label:'Learn',icon:'📚'}};

  function renderResults(results, query) {
    var container=document.getElementById('search-results');
    var empty=document.getElementById('search-empty');
    var noRes=document.getElementById('search-no-results');
    currentResults=results; selectedIdx=-1;

    if (!results.length){
      container.style.display='none'; empty.style.display='none'; noRes.style.display='';
      return;
    }
    empty.style.display='none'; noRes.style.display='none'; container.style.display='';

    var groups={};
    for(var i=0;i<results.length;i++){
      var t=results[i].type; if(!groups[t]) groups[t]=[]; groups[t].push(results[i]);
    }

    var html=''; var globalIdx=0; var types=Object.keys(groups);
    for(var ti=0;ti<types.length;ti++){
      var type=types[ti]; var items=groups[type];
      var tl=TYPE_LABELS[type]||{label:type,icon:'📄'};
      html+='<div class="search-group"><div class="search-group-label">'+tl.icon+' '+tl.label+
            ' <span class="search-group-count">'+items.length+'</span></div>';
      for(var ii=0;ii<items.length;ii++){
        var item=items[ii]; var idx=globalIdx++;
        var url=item.url+(item.anchor?'#'+item.anchor:'');
        var mods=Array.isArray(item.modules)?item.modules.slice(0,3):[];
        var modB=mods.map(function(m){return'<span class="sr-badge">'+escHtml(m)+'</span>';}).join('');
        var catB=item.category?'<span class="sr-cat-badge">'+escHtml(item.category)+'</span>':'';
        var plat=item.platform?'<span class="sr-platform">'+escHtml(item.platform)+'</span>':'';
        var date=item.date?'<span class="sr-date">'+escHtml(item.date)+'</span>':'';
        var snip=item.snippet?'<p class="sr-snippet">'+highlight(item.snippet,query)+'</p>':'';
        html+='<a class="search-result-item" href="'+escHtml(BASE+url)+
              '" role="option" data-idx="'+idx+'" data-query="'+escHtml(query)+'" tabindex="-1">'+
              '<div class="sr-main"><div class="sr-title">'+highlight(item.title,query)+'</div>'+
              '<div class="sr-meta">'+plat+catB+modB+date+'</div>'+snip+'</div>'+
              '<span class="sr-arrow">→</span></a>';
      }
      html+='</div>';
    }
    container.innerHTML=html;

    // Wire result clicks: save query + close modal
    container.querySelectorAll('.search-result-item').forEach(function(el){
      el.addEventListener('click', function(){
        var q = el.getAttribute('data-query') || '';
        saveRecent(q);
        try { sessionStorage.setItem(HIGHLIGHT_KEY, q); } catch(e) {}
        closeModal();
      });
    });
  }

  // ════════════════════════════════════════════════════════════════
  // KEYBOARD NAV
  // ════════════════════════════════════════════════════════════════
  function updateSelection(newIdx){
    var items=document.querySelectorAll('.search-result-item');
    if(!items.length) return;
    if(selectedIdx>=0&&items[selectedIdx]) items[selectedIdx].classList.remove('selected');
    selectedIdx=Math.max(0,Math.min(newIdx,items.length-1));
    var el=items[selectedIdx];
    if(el){el.classList.add('selected');el.scrollIntoView({block:'nearest'});}
  }

  // ════════════════════════════════════════════════════════════════
  // OPEN / CLOSE
  // ════════════════════════════════════════════════════════════════
  function openModal(){
    if(!overlay){ overlay=createModal(); wireModal(); }
    overlay.classList.add('open');
    document.body.style.overflow='hidden';
    var input=document.getElementById('search-input');
    if(input){input.focus();input.value='';}
    resetResults();
    renderRecent();
    loadIndex(function(idx){
      var el=document.querySelector('.search-empty-title');
      if(el) el.textContent='Search across '+idx.items.length+' articles & docs';
    });
  }

  function closeModal(){
    if(overlay) overlay.classList.remove('open');
    document.body.style.overflow=''; selectedIdx=-1;
  }

  function resetResults(){
    var c=document.getElementById('search-results');
    var e=document.getElementById('search-empty');
    var n=document.getElementById('search-no-results');
    if(c){c.style.display='none';c.innerHTML='';}
    if(e) e.style.display='';
    if(n) n.style.display='none';
    currentResults=[];
    // Remove old recent block on reset (it'll be re-rendered by openModal)
    var rb=document.getElementById('search-recent-block');
    if(rb) rb.parentNode.removeChild(rb);
  }

  function wireModal(){
    if(wired) return; wired=true;
    var ov=document.getElementById('search-overlay');
    var modal=document.getElementById('search-modal');
    var input=document.getElementById('search-input');
    var escBtn=document.getElementById('search-esc-btn');

    ov.addEventListener('click',function(e){ if(!modal.contains(e.target)) closeModal(); });
    if(escBtn) escBtn.addEventListener('click',closeModal);

    var deb;
    input.addEventListener('input',function(){
      clearTimeout(deb);
      deb=setTimeout(function(){
        var q=input.value.trim();
        if(!q){ resetResults(); renderRecent(); return; }
        loadIndex(function(){ renderResults(doSearch(q),q); });
      },120);
    });

    input.addEventListener('keydown',function(e){
      var items=document.querySelectorAll('.search-result-item');
      if(e.key==='ArrowDown'){e.preventDefault();updateSelection(selectedIdx<0?0:selectedIdx+1);}
      else if(e.key==='ArrowUp'){e.preventDefault();updateSelection(selectedIdx<=0?0:selectedIdx-1);}
      else if(e.key==='Enter'){
        e.preventDefault();
        var target=selectedIdx>=0&&items[selectedIdx]?items[selectedIdx]:(items.length?items[0]:null);
        if(target) target.click();
      } else if(e.key==='Escape'){closeModal();}
    });
  }

  // ════════════════════════════════════════════════════════════════
  // GLOBAL SHORTCUTS
  // ════════════════════════════════════════════════════════════════
  window.addEventListener('keydown',function(e){
    var tag=document.activeElement?document.activeElement.tagName:'';
    var inInput=(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT');

    // Override Ctrl+F, Cmd+F, and F3
    if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') || e.key === 'F3') {
      e.preventDefault();
      showHighlightBanner();
      return;
    }

    if(e.key==='/'&&!inInput){
      e.preventDefault();
      if(overlay&&overlay.classList.contains('open')){closeModal();}else{openModal();}
      return;
    }
    if(e.key==='Escape'&&overlay&&overlay.classList.contains('open')){
      e.preventDefault(); closeModal();
    }
  }, { capture: true });

  // ════════════════════════════════════════════════════════════════
  // WIRE BUTTON
  // ════════════════════════════════════════════════════════════════
  function wireSearchButton(){
    var btn=document.getElementById('search-trigger');
    if(btn){ btn.addEventListener('click',function(e){ e.preventDefault(); e.stopPropagation(); openModal(); }); }
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', function(){ wireSearchButton(); runPageHighlight(); });
  } else {
    wireSearchButton();
    runPageHighlight();
  }

  window.openSearch  = openModal;
  window.closeSearch = closeModal;

})();
