#!/usr/bin/env node
/**
 * build-learn.js — Markdown → HTML page generator for the Learn section
 *
 * Reads content-learn/**\/*.md files and generates:
 *   learn/topics/{slug}.html   (individual topic pages)
 *   learn/index.html           (home page — topic card list)
 *
 * Usage:
 *   node scripts/build-learn.js          (build all)
 *   node scripts/build-learn.js --watch  (rebuild on change)
 */

const fs   = require('fs');
const path = require('path');
const { buildHeader, buildSharedScript, buildHead } = require('./header');

const ROOT        = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content-learn');
const SITE_DIR    = path.join(ROOT, 'site');
const LEARN_DIR   = path.join(SITE_DIR, 'learn');
const TOPICS_DIR  = path.join(LEARN_DIR, 'topics');

// ── Frontmatter parser ────────────────────────────────────────────────────────
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta = {};
  for (const line of match[1].split('\n')) {
    const [key, ...rest] = line.split(':');
    if (key?.trim()) meta[key.trim()] = rest.join(':').trim();
  }
  return { meta, body: match[2].trim() };
}

// ── Live preview block processor ─────────────────────────────────────────
function processPreviewBlocks(text) {
  // <!-- preview:accepted --> ... ### ✅ ... → wrap in .preview-accepted
  // <!-- preview:rejected --> ... ### ❌ ... → wrap in .preview-rejected
  text = text.replace(
    /<!--\s*preview:accepted\s*-->\s*([\s\S]*?)(?=<!--\s*preview:|$)/g,
    (_, content) => `<div class="preview-block preview-accepted"><span class="preview-label preview-label-ok">✅ Correct Usage — Live Preview</span>${content}</div>`
  );
  text = text.replace(
    /<!--\s*preview:rejected\s*-->\s*([\s\S]*?)(?=<!--\s*preview:|$)/g,
    (_, content) => `<div class="preview-block preview-rejected"><span class="preview-label preview-label-err">❌ Common Mistake — What Goes Wrong</span>${content}</div>`
  );
  return text;
}

// ── Markdown → HTML (minimal, no deps) ───────────────────────────────────────
function md2html(text) {
  // Process live preview blocks first (before markdown parsing)
  text = processPreviewBlocks(text);
  return text
    // Code blocks (must come before inline code)
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      const language = lang || 'text';
      return `<div class="mac-editor">
        <div class="mac-editor-header">
          <div class="mac-editor-dots">
            <span class="dot close"></span>
            <span class="dot minimize"></span>
            <span class="dot maximize"></span>
          </div>
          <div class="mac-editor-lang">SEEN V2 — ${language.toUpperCase()} Snippet</div>
        </div>
        <div class="mac-editor-body">
          <pre class="code-block language-${language}"><code class="language-${language}">${escHtml(code.trim())}</code></pre>
        </div>
        <div class="mac-editor-footer">
          <div class="mac-editor-desc">Use this code snippet directly in your project.</div>
          <button class="mac-editor-copy" onclick="navigator.clipboard.writeText(this.parentElement.previousElementSibling.innerText); this.innerText='Copied!'; setTimeout(()=>this.innerText='Copy', 2000)">Copy</button>
        </div>
      </div>`;
    })
    // Tables
    .replace(/\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)+)/g, (_, header, rows) => {
      const ths = header.split('|').filter(c => c.trim()).map(c => `<th>${inlineHtml(c.trim())}</th>`).join('');
      const trs = rows.trim().split('\n').map(row => {
        const tds = row.split('|').filter(c => c.trim()).map(c => `<td>${inlineHtml(c.trim())}</td>`).join('');
        return `<tr>${tds}</tr>`;
      }).join('');
      return `<div class="table-wrap"><table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></div>`;
    })
    // Headings
    .replace(/^######\s(.+)$/gm, '<h6>$1</h6>')
    .replace(/^#####\s(.+)$/gm, '<h5>$1</h5>')
    .replace(/^####\s(.+)$/gm, '<h4 id="$1">$1</h4>')
    .replace(/^###\s(.+)$/gm, (_, t) => `<h3 id="${slugH(t)}">${t}</h3>`)
    .replace(/^##\s(.+)$/gm,  (_, t) => `<h2 id="${slugH(t)}">${t}</h2>`)
    .replace(/^#\s(.+)$/gm,   (_, t) => `<h1>${t}</h1>`)
    // Blockquotes
    .replace(/^>\s\*\*⚠️[^*]*\*\*\s(.+)$/gm, '<div class="callout callout-warn"><span>⚠️</span><p>$1</p></div>')
    .replace(/^>\s\*\*([^*]+)\*\*\s(.+)$/gm, '<div class="callout callout-info"><strong>$1</strong><p>$2</p></div>')
    .replace(/^>\s(.+)$/gm, '<blockquote><p>$1</p></blockquote>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr>')
    // Lists
    .replace(/^(\s*)-\s(.+)$/gm, (_, indent, item) =>
      `<li style="margin-left:${indent.length * 8}px">${inlineHtml(item)}</li>`)
    .replace(/(<li[^>]*>[\s\S]+?<\/li>)(?!\s*<li)/g, '<ul>$1</ul>')
    // Paragraphs (wrap non-element lines)
    .replace(/^(?!<[a-z]|$)(.+)$/gm, (_, line) => `<p>${inlineHtml(line)}</p>`)
    // Clean up extra newlines
    .replace(/\n{3,}/g, '\n\n');
}

function inlineHtml(text) {
  return text
    .replace(/`([^`]+)`/g, (_, codeStr) => {
      let cssClass = '';
      const s = codeStr.toLowerCase();
      if (/(?:^|\s|_|-)(red|error|failed|reject|rejected|احمر)(?:\s|_|-|$)/.test(s)) cssClass = 'code-red';
      else if (/(?:^|\s|_|-)(green|success|accept|accepted|valid|اخضر)(?:\s|_|-|$)/.test(s)) cssClass = 'code-green';
      else if (/(?:^|\s|_|-)(blue|info|ازرق)(?:\s|_|-|$)/.test(s)) cssClass = 'code-blue';
      else if (/(?:^|\s|_|-)(yellow|warning|warn|اصفر)(?:\s|_|-|$)/.test(s)) cssClass = 'code-yellow';
      return `<code${cssClass ? ` class="${cssClass}"` : ''}>${codeStr}</code>`;
    })
    .replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^\*]+)\*/g, '<em>$1</em>')
    .replace(/~~([^~]+)~~/g, '<del>$1</del>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/❌/g, '<span class="icon-reject">❌</span>')
    .replace(/✅/g, '<span class="icon-accept">✅</span>')
    .replace(/⚠️/g, '<span class="icon-warn">⚠️</span>');
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function slugH(text) {
  return text.trim().toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu,'').replace(/\s+/g,'-').replace(/^-+|-+$/g,'') || 'section';
}

// ── Platform badge colors ─────────────────────────────────────────────────────
const PLATFORM_COLORS = {
  'WhatsApp': { bg: '#0a3d2e', text: '#4ade80', border: '#166534' },
  'Messenger': { bg: '#0f1d3d', text: '#93c5fd', border: '#1e3a8a' },
  'Instagram': { bg: '#3d0a2a', text: '#f9a8d4', border: '#9d174d' },
  'Common': { bg: '#1a1a24', text: '#a78bfa', border: '#4c1d95' },
};

const CATEGORY_COLORS = {
  'Core API':    { bg: '#1a1a24', text: '#818cf8', border: '#312e81' },
  'Webhooks':    { bg: '#2d1a3d', text: '#c084fc', border: '#6b21a8' },
  'Pricing':     { bg: '#2d2000', text: '#fbbf24', border: '#92400e' },
  'Auth':        { bg: '#0f2d2d', text: '#67e8f9', border: '#0e7490' },
};

// ── Collect all topics ────────────────────────────────────────────────────────
function getAllTopics() {
  const topics = [];
  function walk(dir, platform) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), entry.name);
      } else if (entry.name.endsWith('.md') && !entry.name.endsWith('-ar.md')) {
        const raw  = fs.readFileSync(path.join(dir, entry.name), 'utf8');
        const { meta, body } = parseFrontmatter(raw);
        
        let body_ar = null;
        let meta_ar = null;
        const arPath = path.join(dir, entry.name.replace('.md', '-ar.md'));
        if (fs.existsSync(arPath)) {
          const rawAr = fs.readFileSync(arPath, 'utf8');
          const parsedAr = parseFrontmatter(rawAr);
          meta_ar = parsedAr.meta;
          body_ar = parsedAr.body;
        }

        topics.push({
          filename: entry.name,
          slug: meta.slug || entry.name.replace('.md', ''),
          platform: meta.platform || platform || 'Common',
          category: meta.category || 'Core API',
          title: meta.title || 'Untitled',
          title_ar: meta_ar && meta_ar.title ? meta_ar.title : (meta.title || 'Untitled'),
          priority: meta.priority || 'medium',
          source_url: meta.source_url || '',
          last_verified: meta.last_verified || '',
          isNew: meta.new === 'true' || meta.new === true,
          newSince: meta.new_since || '',
          changelogArticle: meta.changelog_article || '',
          date: meta.date ? String(meta.date).replace(/"/g, '').trim() : '',
          meta, body, meta_ar, body_ar
        });
      }
    }
  }
  walk(CONTENT_DIR);
  return topics;
}

// ── Interactive Panels Parser ──────────────────────────────────────────────────
function extractPanels(text) {
  const panels = [];
  let mainText = text;
  
  const regex = /<!--\s*panel:([a-zA-Z0-9_-]+)\s*-->([\s\S]*?)<!--\s*endpanel\s*-->/g;
  
  mainText = text.replace(regex, (match, type, content) => {
    panels.push({ type: type.trim().toLowerCase(), content: content.trim() });
    return ''; // Remove from main text
  });
  
  return { mainText, panels };
}

function getPanelTitle(type, lang) {
  const dict = {
    'comparison': { en: 'Comparison', ar: 'مقارنة' },
    'quiz': { en: 'Test Your Knowledge', ar: 'اختبر فهمك' },
    'example': { en: 'Examples', ar: 'أمثلة' },
    'note': { en: 'Note', ar: 'ملاحظة' }
  };
  const map = dict[type] || { en: type, ar: type };
  return lang === 'ar' ? map.ar : map.en;
}

function renderPanels(panels, lang) {
  if (!panels || panels.length === 0) return '';
  const html = panels.map((p, idx) => {
    const title = getPanelTitle(p.type, lang);
    let icon = '📌';
    if (p.type === 'comparison') icon = '⚖️';
    if (p.type === 'quiz') icon = '🧠';
    if (p.type === 'example') icon = '💡';
    
    let bodyHtml = md2html(p.content);
    
    if (p.type === 'quiz') {
      const lines = p.content.split('\n');
      let questionHtml = '';
      let optionsHtml = '';
      const quizId = 'q_' + lang + '_' + idx;
      
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('- [x]')) {
          const optText = trimmed.replace('- [x]', '').trim();
          optionsHtml += `
            <label class="mcq-option">
              <input type="radio" name="${quizId}" value="correct" onclick="handleMcqClick(this)">
              <span class="mcq-text">${inlineHtml(optText)}</span>
            </label>
          `;
        } else if (trimmed.startsWith('- ')) {
          const optText = trimmed.replace('- ', '').trim();
          optionsHtml += `
            <label class="mcq-option">
              <input type="radio" name="${quizId}" value="wrong" onclick="handleMcqClick(this)">
              <span class="mcq-text">${inlineHtml(optText)}</span>
            </label>
          `;
        } else if (trimmed.length > 0) {
          questionHtml += `<p>${inlineHtml(trimmed)}</p>`;
        }
      });
      
      const progressText = lang === 'ar' ? 'السؤال 1 من 1' : 'Question 1 of 1';
      
      bodyHtml = `
        <div class="mcq-widget" id="${quizId}_widget">
          <div class="mcq-progress">
            <div class="mcq-progress-text">
              <span class="mcq-pct">0%</span> 
              <span class="mcq-count" style="float:${lang==='ar'?'left':'right'}">${progressText}</span>
            </div>
            <div class="mcq-progress-bar-bg">
              <div class="mcq-progress-bar-fill" style="width: 0%"></div>
            </div>
          </div>
          <div class="mcq-question">${questionHtml}</div>
          <div class="mcq-options">${optionsHtml}</div>
        </div>
      `;
    }

    return `
      <div class="panel-card panel-${p.type}">
        <div class="panel-header">
          <span class="panel-icon">${icon}</span>
          <span class="panel-title">${title}</span>
        </div>
        <div class="panel-body">
          ${bodyHtml}
        </div>
      </div>
    `;
  }).join('');
  return `<aside class="interactive-panel lang-${lang}">${html}</aside>`;
}

// ── Build a single topic page ─────────────────────────────────────────────────
function buildTopicPage(topic, allTopics) {
  const pc = PLATFORM_COLORS[topic.platform] || PLATFORM_COLORS['Common'];
  
  const extEn = extractPanels(topic.body);
  const content = md2html(extEn.mainText);
  
  let content_ar = '';
  let extAr = { mainText: '', panels: [] };
  if (topic.body_ar) {
    extAr = extractPanels(topic.body_ar);
    content_ar = md2html(extAr.mainText);
  }

  const hasPanels = extEn.panels.length > 0 || extAr.panels.length > 0;
  const panelsHtmlEn = renderPanels(extEn.panels, 'en');
  const panelsHtmlAr = renderPanels(extAr.panels, 'ar');

  const lastBuildLabel = new Date().toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
    timeZone: 'Africa/Cairo'
  }) + ' 🇪🇬';
  
  // Extract TOC from headings
  const headingsEn = [...extEn.mainText.matchAll(/^#{2,3}\s(.+)$/gm)].map(m => ({
    level: m[0].startsWith('###') ? 3 : 2,
    text: m[1],
    id: slugH(m[1])
  }));
  const headingsAr = topic.body_ar ? [...extAr.mainText.matchAll(/^#{2,3}\s(.+)$/gm)].map(m => ({
    level: m[0].startsWith('###') ? 3 : 2,
    text: m[1],
    id: slugH(m[1])
  })) : [];
  
  const tocHtml = `
    <div class="lang-en">
      <ul class="toc-list">${headingsEn.map(h => `<li class="toc-${h.level === 3 ? 'sub' : 'top'}"><a href="#${h.id}">${h.text}</a></li>`).join('')}</ul>
    </div>
    ${topic.body_ar ? `
    <div class="lang-ar">
      <ul class="toc-list">${headingsAr.map(h => `<li class="toc-${h.level === 3 ? 'sub' : 'top'}"><a href="#${h.id}">${h.text}</a></li>`).join('')}</ul>
    </div>` : ''}
  `;

  // Sibling navigation
  const platformTopics = allTopics.filter(t => t.platform === topic.platform);
  const idx = platformTopics.findIndex(t => t.slug === topic.slug);
  const prev = platformTopics[idx - 1];
  const next = platformTopics[idx + 1];
  const prevLink = prev ? `<a class="nav-prev" href="${prev.slug}.html">← ${prev.title}</a>` : '';
  const nextLink = next ? `<a class="nav-next" href="${next.slug}.html">${next.title} →</a>` : '';

  const newBadgeHero = topic.isNew
    ? `<span class="new-badge-hero" title="Detected: ${topic.newSince}">✦ NEW</span>` : '';
  const changelogLink = topic.changelogArticle
    ? `<div class="sidebar-section"><span class="sidebar-label">📰 From Changelog</span><a href="../../changelog.html" class="source-link changelog-back-link">📋 View Changelog Entry ↗<br><small>${topic.changelogArticle}</small></a></div>` : '';

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark" data-lang="en">
${buildHead(
  `${topic.title} — Meta Docs Learn`,
  `Learn ${topic.title} in ${topic.platform}: validation rules, error codes, examples.`,
  '../../style.css'
)}
<body>

  ${buildHeader('../../', 'learn', lastBuildLabel)}



  <div class="learn-layout${hasPanels ? ' has-panels' : ''}">

    <!-- Sidebar -->
    <aside class="learn-sidebar" id="sidebar">
      <div class="sidebar-section">
        <span class="sidebar-label" data-en="On this page" data-ar="على هذه الصفحة">On this page</span>
        ${tocHtml}
      </div>
      <div class="sidebar-section">
        <span class="sidebar-label">Source</span>
        <a href="${topic.source_url}" target="_blank" rel="noopener" class="source-link">
          📄 Meta Developer Docs ↗
        </a>
        ${topic.last_verified ? `<span class="verified-date">Verified: ${topic.last_verified}</span>` : ''}
      </div>
      ${changelogLink}
    </aside>

    <!-- Main Content -->
    <main class="learn-content" id="main-content">
      <div class="topic-breadcrumb">
        <a href="../index.html">Learn</a>
        <span>›</span>
        <span style="color:${pc.text}">${topic.platform}</span>
        <span>›</span>
        <span>${topic.title}</span>
      </div>

      <div class="topic-hero">
        <div class="topic-hero-badges">
          <span class="platform-badge" style="background:${pc.bg};color:${pc.text};border-color:${pc.border}">${topic.platform}</span>
          ${newBadgeHero}
        </div>
        <h1 class="topic-title" data-en="${topic.title}" data-ar="${topic.title_ar}">${topic.title}</h1>
        <p class="topic-meta"><span data-en="${topic.category}" data-ar="${topic.category}">${topic.category}</span> · <span data-en="Last verified:" data-ar="آخر مراجعة:">Last verified:</span> ${topic.last_verified || 'N/A'}</p>
      </div>

      <div class="topic-body lang-en">
        ${content}
      </div>
      ${topic.body_ar ? `<div class="topic-body lang-ar">${content_ar}</div>` : ''}

      <div class="topic-nav">
        ${prevLink}
        ${nextLink}
      </div>
    </main>

    <!-- Interactive Panels -->
    ${hasPanels ? `
    <div class="learn-right-sidebar">
      ${panelsHtmlEn}
      ${panelsHtmlAr}
    </div>
    ` : ''}

  </div>

  ${buildSharedScript('../../')}
</body>
</html>`;
}

// ── Translation Helpers ───────────────────────────────────────────────────────
function translatePlatform(platform) {
  const dict = {
    'WhatsApp': 'واتساب',
    'Messenger': 'مسنجر',
    'Instagram': 'إنستغرام',
    'Common': 'عام'
  };
  return dict[platform] || platform;
}

function translateCategory(category) {
  const dict = {
    'Core API': 'الأساسية (Core API)',
    'Webhooks': 'ويب هوكس (Webhooks)',
    'Pricing': 'التسعير والرسوم',
    'Auth': 'المصادقة والتفويض'
  };
  return dict[category] || category;
}

function escSearchText(text) {
  return text
    .toLowerCase()
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/\\/g, '\\\\');
}

function formatTopicDate(dateStr) {
  if (!dateStr) return '';
  const m = String(dateStr).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return dateStr;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m[2],10)-1]} ${parseInt(m[3],10)}, ${m[1]}`;
}

// ── Build home index ──────────────────────────────────────────────────────────
function buildIndex(topics) {
  const grouped = {};
  for (const t of topics) {
    if (!grouped[t.platform]) grouped[t.platform] = [];
    grouped[t.platform].push(t);
  }

  const platformSections = Object.entries(grouped).map(([platform, pts]) => {
    const pc = PLATFORM_COLORS[platform] || PLATFORM_COLORS['Common'];
    const cards = pts.map(t => {
      const searchTxt = escSearchText(`${t.title} ${t.category} ${platform} ${t.body.substring(0, 300)}`);
      return `
      <a class="topic-card${t.isNew ? ' topic-card-new' : ''}" 
         href="topics/${t.slug}.html"
         data-platform="${platform.toLowerCase()}"
         data-category="${t.category.toLowerCase()}"
         data-search-text="${searchTxt}">
        <div class="topic-card-header">
          <span class="topic-card-icon">${
            t.category === 'Core API' ? '⚡' :
            t.category === 'Webhooks' ? '🔔' :
            t.category === 'Pricing' ? '💰' :
            t.category === 'Auth' ? '🔐' : '📖'
          }</span>
          <div style="display:flex;align-items:center;gap:6px">
            <span class="topic-card-platform" style="color:${pc.text}" data-en="${platform}" data-ar="${translatePlatform(platform)}">${platform}</span>
            ${t.isNew ? '<span class="new-badge" data-en="NEW" data-ar="جديد">NEW</span>' : ''}
          </div>
        </div>
        <h3 class="topic-card-title">${t.title}</h3>
        <div class="topic-card-footer">
          <p class="topic-card-category" data-en="${t.category}" data-ar="${translateCategory(t.category)}">${t.category}</p>
          ${t.date ? `<span class="topic-card-date">🗓 ${formatTopicDate(t.date)}</span>` : ''}
        </div>
        <span class="topic-card-arrow">→</span>
      </a>`;
    }).join('');
    return `
      <section class="platform-section" data-sect-id="${platform.toLowerCase()}">
        <h2 class="platform-heading">
          <span class="platform-dot" style="background:${pc.text}"></span>
          <span data-en="${platform}" data-ar="${translatePlatform(platform)}">${platform}</span>
        </h2>
        <div class="topic-cards">${cards}</div>
      </section>`;
  }).join('');



  const searchJs = `
  var searchInput = document.getElementById('learn-search');
  var clearBtn = document.getElementById('search-clear');
  var platformButtons = document.querySelectorAll('#platform-filters .filter-pill');
  var categoryButtons = document.querySelectorAll('#category-filters .filter-pill');
  var cards = document.querySelectorAll('.topic-card');
  var sections = document.querySelectorAll('.platform-section');
  var resultsInfo = document.getElementById('search-results-info');
  var resultsCount = document.getElementById('results-count');
  
  var activePlatform = 'all';
  var activeCategory = 'all';
  var searchQuery = '';

  function filterCards() {
    var visibleCount = 0;
    var sectionsHasVisible = {};

    cards.forEach(function(card) {
      var text = card.getAttribute('data-search-text') || '';
      var platform = (card.getAttribute('data-platform') || '').toLowerCase();
      var category = (card.getAttribute('data-category') || '').toLowerCase();

      var matchSearch = !searchQuery || text.indexOf(searchQuery) !== -1;
      var matchPlatform = activePlatform === 'all' || platform === activePlatform;
      var matchCategory = activeCategory === 'all' || category === activeCategory;

      if (matchSearch && matchPlatform && matchCategory) {
        card.style.display = '';
        visibleCount++;
        var sect = card.closest('.platform-section');
        if (sect) {
          sectionsHasVisible[sect.getAttribute('data-sect-id')] = true;
        }
      } else {
        card.style.display = 'none';
      }
    });

    sections.forEach(function(section) {
      var sectId = section.getAttribute('data-sect-id');
      if (sectionsHasVisible[sectId]) {
        section.style.display = '';
      } else {
        section.style.display = 'none';
      }
    });

    if (searchQuery || activePlatform !== 'all' || activeCategory !== 'all') {
      resultsInfo.style.display = 'block';
      resultsCount.textContent = visibleCount;
    } else {
      resultsInfo.style.display = 'none';
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', function() {
      searchQuery = searchInput.value.toLowerCase().trim();
      clearBtn.style.display = searchQuery ? 'inline-block' : 'none';
      filterCards();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      searchInput.value = '';
      clearBtn.style.display = 'none';
      searchQuery = '';
      filterCards();
      searchInput.focus();
    });
  }

  platformButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      platformButtons.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      activePlatform = btn.getAttribute('data-platform').toLowerCase();
      filterCards();
    });
  });
  categoryButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      categoryButtons.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-category').toLowerCase();
      filterCards();
    });
  });
  `;

  const buildDate = new Date().toLocaleDateString('en-GB', {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Africa/Cairo'
  });
  const buildTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Africa/Cairo'
  });
  const lastBuildLabel = `${buildDate} · ${buildTime} 🇪🇬`;

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark" data-lang="en">
${buildHead(
  'Meta Docs Learn — WhatsApp & Messenger API Reference',
  'Learn every Meta API feature with exact validation rules, error codes, and CRUD examples.',
  '../style.css'
)}
<body>

  ${buildHeader('../', 'learn', lastBuildLabel)}

  <main class="learn-home">
    <div class="learn-hero">
      <h1 class="learn-hero-title">
        <span data-en="Meta Docs Learn Hub" data-ar="تعلّم · مرجع واجهة برمجة تطبيقات Meta">Meta Docs Learn Hub</span>
      </h1>
      <p class="learn-hero-desc" 
         data-en="Every Meta API feature explained with <strong>exact validation rules</strong> — what gets accepted, what gets rejected, and why. Focused on WhatsApp, Messenger, and everything that matters for SEEN V2." 
         data-ar="شرح مفصل لكل ميزة في واجهة برمجة تطبيقات Meta مع <strong>قواعد التحقق الدقيقة</strong> — ما يتم قبوله، وما يتم رفضه، والسبب. يركز على WhatsApp و Messenger وكل ما يهم الإصدار الثاني من SEEN.">
        Every Meta API feature explained with <strong>exact validation rules</strong> — what gets accepted, what gets rejected, and why. Focused on WhatsApp, Messenger, and everything that matters for SEEN V2.
      </p>
      
      <div class="learn-stats">
        <div class="learn-stat">
          <div class="learn-stat-icon">📚</div>
          <div class="learn-stat-content">
            <span class="learn-stat-num">${topics.length}</span>
            <span class="learn-stat-label" data-en="topics" data-ar="موضوعاً">topics</span>
          </div>
        </div>
        <div class="learn-stat">
          <div class="learn-stat-icon">🔌</div>
          <div class="learn-stat-content">
            <span class="learn-stat-num">${Object.keys(grouped).length}</span>
            <span class="learn-stat-label" data-en="platforms" data-ar="منصات">platforms</span>
          </div>
        </div>
      </div>
    </div>

    <div class="learn-search-section">
      <div class="search-box-container">
        <span class="search-icon">🔍</span>
        <input type="text" id="learn-search" class="search-input" data-en="Search topics..." data-ar="ابحث عن المواضيع..." placeholder="Search topics...">
        <button id="search-clear" class="search-clear-btn" style="display:none">✕</button>
      </div>
      <div class="filter-group">
        <div class="filter-pills" id="platform-filters">
          <button class="filter-pill active" data-platform="all" data-en="All Platforms" data-ar="جميع المنصات">All Platforms</button>
          <button class="filter-pill" data-platform="whatsapp" data-en="WhatsApp" data-ar="واتساب">WhatsApp</button>
          <button class="filter-pill" data-platform="messenger" data-en="Messenger" data-ar="مسنجر">Messenger</button>
          <button class="filter-pill" data-platform="instagram" data-en="Instagram" data-ar="إنستغرام">Instagram</button>
          <button class="filter-pill" data-platform="common" data-en="Common" data-ar="عام">Common</button>
        </div>
        <div class="filter-pills" id="category-filters">
          <button class="filter-pill active" data-category="all" data-en="All Categories" data-ar="جميع الفئات">All Categories</button>
          <button class="filter-pill" data-category="core api" data-en="Core API" data-ar="الأساسية">Core API</button>
          <button class="filter-pill" data-category="webhooks" data-en="Webhooks" data-ar="ويب هوكس">Webhooks</button>
          <button class="filter-pill" data-category="pricing" data-en="Pricing" data-ar="التسعير">Pricing</button>
          <button class="filter-pill" data-category="auth" data-en="Auth" data-ar="المصادقة">Auth</button>
        </div>
      </div>
      <div class="search-results-count" id="search-results-info" style="display:none">
        <span data-en="Found" data-ar="تم العثور على">Found</span> 
        <span id="results-count">0</span> 
        <span data-en="topics" data-ar="موضوعاً">topics</span>
      </div>
    </div>

    ${platformSections}

    <footer class="learn-footer">
      <p data-en="Meta Docs Learn · Built with Antigravity · Last updated: ${buildDate} 🇪🇬" 
         data-ar="تعلّم Meta Docs · تم التطوير بواسطة Antigravity · آخر تحديث: ${buildDate} (القاهرة)">
        Meta Docs Learn · Built with Antigravity · Last updated: ${buildDate} 🇪🇬
      </p>
      <p data-en="All content extracted directly from Meta Developer Documentation" 
         data-ar="تم استخراج كافة المحتويات مباشرة من مستندات مطوري Meta">
        All content extracted directly from <a href="https://developers.facebook.com" target="_blank">Meta Developer Documentation</a>
      </p>
    </footer>
  </main>

  ${buildSharedScript('../', searchJs)}
</body>
</html>`;
}

// ── Main ──────────────────────────────────────────────────────────────────────
function main() {
  fs.mkdirSync(TOPICS_DIR, { recursive: true });

  const topics = getAllTopics();
  console.log(`\n📚 Found ${topics.length} topic(s)\n`);

  // CSS served from site/style.css (shared header)

  // Build each topic page
  for (const topic of topics) {
    const html = buildTopicPage(topic, topics);
    const outPath = path.join(TOPICS_DIR, `${topic.slug}.html`);
    fs.writeFileSync(outPath, html);
    console.log(`  ✅ ${topic.platform.padEnd(12)} ${topic.title}`);
  }

  // Build home index
  const indexHtml = buildIndex(topics);
  fs.writeFileSync(path.join(LEARN_DIR, 'index.html'), indexHtml);
  console.log(`\n✅ site/learn/index.html generated (${topics.length} topics)`);
  console.log(`✅ site/learn/topics/ — ${topics.length} pages`);
}

main();
