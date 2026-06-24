#!/usr/bin/env node
/**
 * Step 5 — Publish Agent
 * Saves the verified article to content/changelog/ and rebuilds site/index.html.
 *
 * Usage:
 *   node publish-article.js <article-markdown-file>
 *   node publish-article.js --rebuild-only   (just regenerate the site index)
 *
 * The article file must have YAML frontmatter with at minimum:
 *   title, date, source_slug, source_url, category, sv2_modules[]
 */

const fs   = require('fs');
const path = require('path');

// ── Config ────────────────────────────────────────────────────────────────────
const ROOT     = path.resolve(__dirname, '..');
const CONTENT  = path.join(ROOT, 'content', 'changelog');
const SITE     = path.join(ROOT, 'site');
const CHANGELOG = path.join(SITE, 'changelog.html');
const WELCOME   = path.join(SITE, 'index.html');
const CONTENT_LEARN = path.join(ROOT, 'content-learn');

// ── Frontmatter parser (no external deps) ────────────────────────────────────
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };
  const meta = {};
  for (const line of match[1].split('\n')) {
    const [key, ...rest] = line.split(':');
    if (!key?.trim()) continue;
    let val = rest.join(':').trim();
    // Handle YAML arrays: [a, b, c] or - item
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
    }
    meta[key.trim()] = val;
  }
  return { meta, body: match[2].trim() };
}

// ── Slugify ───────────────────────────────────────────────────────────────────
function slugify(text) {
  return text.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

// ── Read all published articles ───────────────────────────────────────────────
function getAllArticles() {
  if (!fs.existsSync(CONTENT)) return [];
  return fs.readdirSync(CONTENT)
    .filter(f => f.endsWith('.md'))
    .sort()
    .reverse()
    .map(f => {
      const raw = fs.readFileSync(path.join(CONTENT, f), 'utf8');
      const { meta, body } = parseFrontmatter(raw);
      return { filename: f, meta, body };
    });
}

// ── Category badge colors ─────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  'New Feature':          { bg: '#0a3d2e', text: '#4ade80', border: '#166534' },
  'Breaking Change':      { bg: '#3d0a0a', text: '#f87171', border: '#991b1b' },
  'Deprecation':          { bg: '#2d2000', text: '#fbbf24', border: '#92400e' },
  'Policy/Compliance':    { bg: '#0f1d3d', text: '#93c5fd', border: '#1e3a8a' },
  'Pricing/Rate Limit':   { bg: '#2d1a3d', text: '#c084fc', border: '#6b21a8' },
  'Bug Fix/Clarification':{ bg: '#0d2d2d', text: '#67e8f9', border: '#0e7490' },
};

const MODULE_COLORS = {
  'WhatsApp Templates':        '#25D366',
  'Broadcasts':                '#128C7E',
  'Channel Integration/OAuth': '#6366f1',
  'Webhooks':                  '#f59e0b',
  'Instagram Messaging':       '#e1306c',
  'Messenger':                 '#0084ff',
  'Billing':                   '#10b981',
  'RBAC':                      '#8b5cf6',
};

function categoryBadge(cat) {
  const c = CATEGORY_COLORS[cat] || { bg: '#1a1a1a', text: '#aaa', border: '#333' };
  return `<span class="badge cat-badge" style="background:${c.bg};color:${c.text};border-color:${c.border}">${escHtml(cat)}</span>`;
}

function moduleBadge(mod) {
  const color = MODULE_COLORS[mod] || '#666';
  return `<span class="badge mod-badge" style="border-color:${color};color:${color}">${escHtml(mod)}</span>`;
}

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Date helpers ──────────────────────────────────────────────────────────────
function formatDate(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate + 'T00:00:00Z');
  return d.toLocaleDateString('en-GB', {
    year:'numeric', month:'short', day:'numeric', timeZone:'UTC'
  });
}

// Convert ISO date → Meta changelog anchor (e.g. 2026-06-12 → #june-12-2026)
function dateToAnchor(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate + 'T00:00:00Z');
  const months = ['january','february','march','april','may','june',
    'july','august','september','october','november','december'];
  return `#${months[d.getUTCMonth()]}-${d.getUTCDate()}-${d.getUTCFullYear()}`;
}

// Parse a section from article body markdown
function getSection(body, heading) {
  const rx = new RegExp(`## ${heading}\n\n([\\s\\S]*?)(?=\n## |$)`);
  const match = body.match(rx);
  return match ? match[1].trim() : '';
}

// Unique card ID
let _cardIdx = 0;

// ── Arabic summary generator ──────────────────────────────────────────────────
const CATEGORY_AR = {
  'New Feature':           'ميزة جديدة',
  'Bug Fix/Clarification': 'إصلاح أو توضيح',
  'Breaking Change':       'تغيير جذري ⚠️',
  'Deprecation':           'إيقاف دعم',
  'Enhancement':           'تحسين',
  'New API':               'واجهة برمجية جديدة',
  'Documentation':         'تحديث توثيق',
};
const MODULE_AR = {
  'WhatsApp Templates':      'قوالب واتساب',
  'Webhooks':                'ويب هوكس',
  'Broadcasts':              'البث الجماعي',
  'Conversations':           'المحادثات',
  'Contacts':                'جهات الاتصال',
  'Analytics':               'التحليلات',
  'Channel Integration/OAuth': 'تكامل القناة',
  'Messages API':            'API الرسائل',
  'Flows':                   'التدفقات',
  'Commerce':                'التجارة الإلكترونية',
  'Business Management':     'إدارة الأعمال',
  'Phone Numbers':           'أرقام الهاتف',
  'Media':                   'الوسائط',
  'Reactions':               'ردود الفعل',
  'QR Codes':                'رموز QR',
};

function generateArabicSummary(meta) {
  const rawText = (meta.summary_short || meta.title || '')
    .replace(/^,\s*\*[^*]+\*\s*/g, '').trim();
  const modules = Array.isArray(meta.sv2_modules) ? meta.sv2_modules
    : (meta.sv2_modules ? meta.sv2_modules.split(',').map(s=>s.trim()) : []);
  const catText = CATEGORY_AR[meta.category] || meta.category || '';
  const modAr   = modules.map(m => MODULE_AR[m] || m).join(' و ');
  const area    = modAr || 'Meta API';

  if (/added.*new.*field|new.*field.*added/i.test(rawText))
    return `تمت إضافة حقل جديد في ${area}. (${catText})`;
  if (/added.*new.*parameter|new.*parameter/i.test(rawText))
    return `تمت إضافة معامل جديد في ${area}. (${catText})`;
  if (/added.*support|support.*added/i.test(rawText))
    return `تمت إضافة دعم لميزة جديدة في ${area}. (${catText})`;
  if (/added.*feature|new.*feature/i.test(rawText))
    return `تمت إضافة ميزة جديدة في ${area}. (${catText})`;
  if (/^Added/i.test(rawText))
    return `تمت إضافة تحديث في ${area}. (${catText})`;
  if (/updated.*api|api.*updated/i.test(rawText))
    return `تم تحديث واجهة API الخاصة بـ ${area}. (${catText})`;
  if (/^Updated/i.test(rawText))
    return `تم تحديث ${area}. (${catText})`;
  if (/Clarified/i.test(rawText))
    return `تم توضيح معلومات في توثيق ${area}. (${catText})`;
  if (/Corrected/i.test(rawText))
    return `تم تصحيح معلومات في ${area}. (${catText})`;
  if (/Deprecated/i.test(rawText))
    return `تم إيقاف دعم ميزة في ${area}.`;
  if (/Removed/i.test(rawText))
    return `تمت إزالة ميزة من ${area}. (${catText})`;
  if (/Fixed/i.test(rawText))
    return `تم إصلاح خطأ في ${area}. (${catText})`;
  if (/Introduced/i.test(rawText))
    return `تم تقديم ميزة جديدة في ${area}. (${catText})`;
  if (/New guide|guide for/i.test(rawText))
    return `دليل جديد لاستخدام ${area}. (${catText})`;
  if (/webhook/i.test(rawText))
    return `تحديث في ويب هوكس ${area}. (${catText})`;
  if (/template/i.test(rawText))
    return `تحديث في قوالب ${area}. (${catText})`;
  return `${catText} في موديول ${area}.`;
}

// ── Article card HTML ─────────────────────────────────────────────────────────
function articleCard(article) {
  const m = article.meta;
  const body = article.body || '';
  const modules = Array.isArray(m.sv2_modules) ? m.sv2_modules
    : (m.sv2_modules ? m.sv2_modules.split(',').map(s => s.trim()) : []);

  // Parse body sections
  const whatChanged  = getSection(body, 'Summary')  || m.summary_short || m.summary || '';
  const sv2Impact    = getSection(body, 'Why it Matters for SV2');
  const qaAction     = getSection(body, 'Suggested QA Action');

  // Build direct link to the specific dated changelog section
  const anchor      = dateToAnchor(m.date);
  const changelogUrl = (m.source_url || '').replace(/\/$/, '') + anchor;

  // Format date nicely
  const dateDisplay = formatDate(m.date);

  // Card ID
  const uid = `card-${_cardIdx++}`;
  const detId = `det-${uid}`;

  // Audit note (skip backfill notes — they're noise)
  const isBackfill = (m.audit_corrections || '').startsWith('backfill');
  const auditNote = (!isBackfill && m.audit_corrections && m.audit_corrections !== 'none')
    ? `<div class="audit-note">🔍 <span data-en="Audit" data-ar="مراجعة">Audit</span>: ${escHtml(m.audit_corrections)}</div>` : '';

  return `<article class="card"
    id="${uid}"
    data-date="${escHtml(m.date)}"
    data-category="${escHtml(m.category)}"
    data-modules="${escHtml(modules.join(','))}">

    <div class="card-header">
      <time class="card-date">${escHtml(dateDisplay)}</time>
      ${categoryBadge(m.category)}
    </div>

    <h2 class="card-title"
        data-en="${escHtml(m.title || '')}"
        data-ar="${escHtml(generateArabicSummary(m))}">${escHtml(m.title || '')}</h2>
    <div class="card-badges">${modules.map(moduleBadge).join('')}</div>
    <p class="card-summary"
       data-en="${escHtml((m.summary_short || whatChanged).slice(0,180))}"
       data-ar="${escHtml(generateArabicSummary(m))}">${escHtml((m.summary_short || whatChanged).slice(0,180))}</p>

    <!-- Expandable detail panel -->
    <div class="card-details" id="${detId}" aria-hidden="true">

      ${whatChanged ? `<div class="detail-section detail-changed">
        <h4 class="detail-label">
          <span class="detail-icon">📌</span>
          <span data-en="What Changed" data-ar="ما الذي تغيّر">What Changed</span>
        </h4>
        <p>${escHtml(whatChanged)}</p>
      </div>` : ''}

      ${sv2Impact ? `<div class="detail-section detail-impact">
        <h4 class="detail-label">
          <span class="detail-icon">🎯</span>
          <span data-en="Impact on SEEN V2" data-ar="التأثير على SEEN V2">Impact on SEEN V2</span>
        </h4>
        <p>${escHtml(sv2Impact)}</p>
      </div>` : ''}

      ${qaAction ? `<div class="detail-section detail-qa">
        <h4 class="detail-label">
          <span class="detail-icon">✅</span>
          <span data-en="Suggested QA Action" data-ar="إجراء QA المقترح">Suggested QA Action</span>
        </h4>
        <p>${escHtml(qaAction)}</p>
      </div>` : ''}

      ${auditNote}
    </div>

    <div class="card-footer">
      <button class="btn-expand"
        data-det="${detId}"
        aria-expanded="false"
        aria-controls="${detId}">
        <span class="lbl-more" data-en="Show details" data-ar="عرض التفاصيل">Show details</span>
        <span class="lbl-less" data-en="Hide details" data-ar="إخفاء التفاصيل">Hide details</span>
        <span class="expand-chevron">▾</span>
      </button>
      <a class="card-source" href="${escHtml(changelogUrl)}" target="_blank" rel="noopener">
        📄 <span data-en="View in Changelog" data-ar="رابط في سجل التغييرات">View in Changelog</span> ↗
      </a>
    </div>
  </article>`.trim();
}

// ── Full site index HTML ──────────────────────────────────────────────────────
function buildIndex(articles) {
  _cardIdx = 0; // reset card IDs each build
  const allCategories = [...new Set(articles.map(a => a.meta.category).filter(Boolean))];
  const allModules    = [...new Set(articles.flatMap(a => {
    const mods = a.meta.sv2_modules;
    return Array.isArray(mods) ? mods : (mods ? mods.split(',').map(s=>s.trim()) : []);
  }).filter(Boolean))];

  const catOptions = allCategories
    .map(c => `<option value="${escHtml(c)}">${escHtml(c)}</option>`).join('');
  const modOptions = allModules
    .map(m => `<option value="${escHtml(m)}">${escHtml(m)}</option>`).join('');

  const cards = articles.map(articleCard).join('\n\n');
  const buildDate = new Date();
  const buildDateISO = buildDate.toISOString();
  const buildDateDisplay = buildDate.toLocaleDateString('en-GB', {
    year: 'numeric', month: 'short', day: 'numeric',
    timeZone: 'Africa/Cairo'
  });
  const buildTimeDisplay = buildDate.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
    timeZone: 'Africa/Cairo'
  }) + ' (Cairo)';

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark" data-lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Meta API Watch — SEEN V2 Changelog Tracker</title>
  <meta name="description" content="Daily tracker for Meta Developer API changes relevant to SEEN V2 (WhatsApp, Messenger, Instagram Messaging). Never get blindsided by an API update again." />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css" />
</head>
<body>

  <header class="site-header">
    <div class="header-inner">
      <div class="header-logo">
        <span class="logo-icon">🔭</span>
        <div>
          <h1 class="site-title">Meta API Watch</h1>
          <p class="site-subtitle"
             data-en="SEEN V2 · Developer Docs Tracker"
             data-ar="SEEN V2 · متتبّع تحديثات المطورين">SEEN V2 · Developer Docs Tracker</p>
        </div>
      </div>
      <div class="header-center">
        <div class="last-build">
          <span class="last-build-label"
                data-en="Last Build" data-ar="آخر بناء">Last Build</span>
          <span class="last-build-date">${buildDateDisplay}</span>
          <span class="last-build-time">${buildTimeDisplay}</span>
        </div>
      </div>
      <div class="header-right">
        <div class="header-stats">
          <div class="stat">
            <span class="stat-num" id="total-count">${articles.length}</span>
            <span class="stat-label"
                  data-en="updates tracked" data-ar="تحديث مرصود">updates tracked</span>
          </div>
          <div class="stat">
            <span class="stat-num">${articles.filter(a=>a.meta.category==='Breaking Change').length}</span>
            <span class="stat-label"
                  data-en="breaking changes" data-ar="تغيير جذري">breaking changes</span>
          </div>
        </div>
        <!-- Language toggle -->
        <button id="lang-toggle" class="lang-toggle" aria-label="Toggle language">
          <span class="lang-en">EN</span>
          <span class="lang-sep">·</span>
          <span class="lang-ar">عربي</span>
        </button>
        <button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme" title="Toggle light/dark mode">
          <span class="icon-sun">☀️</span>
          <span class="icon-moon">🌙</span>
        </button>
        <a href="learn/index.html" class="btn-learn">
          <span data-en="📚 Learn" data-ar="📚 تعلّم">📚 Learn</span>
        </a>
      </div>
    </div>
  </header>

  <div class="filters-bar">
    <div class="filters-inner">
      <div class="filter-group">
        <label for="filter-category"
               data-en="Category" data-ar="الفئة">Category</label>
        <select id="filter-category">
          <option value=""
                  data-en="All categories" data-ar="جميع الفئات">All categories</option>
          ${catOptions}
        </select>
      </div>
      <div class="filter-group">
        <label for="filter-module"
               data-en="SV2 Module" data-ar="موديول SV2">SV2 Module</label>
        <select id="filter-module">
          <option value=""
                  data-en="All modules" data-ar="جميع الموديولات">All modules</option>
          ${modOptions}
        </select>
      </div>
      <button id="clear-filters" class="btn-clear"
              data-en="Clear filters" data-ar="مسح الفلاتر">Clear filters</button>
      <div class="filter-results">
        <span id="filtered-count">${articles.length}</span>
        <span data-en="results" data-ar="نتيجة">results</span>
      </div>
    </div>
  </div>

  <main class="main-content">
    <div class="cards-grid" id="cards-grid">
      ${cards || `<div class="empty-state">
        <span>📭</span>
        <p data-en="No updates published yet." data-ar="لا توجد تحديثات منشورة بعد.">No updates published yet.</p>
        <p class="empty-sub"
           data-en="Run the pipeline to fetch the latest Meta API changes."
           data-ar="شغّل البايبلاين لجلب أحدث تغييرات Meta API.">Run the pipeline to fetch the latest Meta API changes.</p>
      </div>`}
    </div>
  </main>

  <footer class="site-footer">
    <p>
      <span data-en="Built with" data-ar="مبني بـ">Built with</span>
      <a href="https://antigravity.dev" target="_blank" rel="noopener">Antigravity</a> ·
      <span data-en="Sources:" data-ar="المصادر:">Sources:</span>
      <a href="https://developers.facebook.com/docs" target="_blank" rel="noopener">Meta for Developers</a> ·
      <time datetime="${buildDateISO}">${buildDateDisplay} ${buildTimeDisplay}</time>
    </p>
  </footer>

  <script src="app.js"></script>
</body>
</html>`;
}

// ── Read learn topics for welcome page ─────────────────────────────────────────
function getLearnTopics() {
  const topics = [];
  if (!fs.existsSync(CONTENT_LEARN)) return topics;
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) { walk(path.join(dir, entry.name)); }
      else if (entry.name.endsWith('.md')) {
        const raw = fs.readFileSync(path.join(dir, entry.name), 'utf8');
        const { meta } = parseFrontmatter(raw);
        topics.push(meta);
      }
    }
  }
  walk(CONTENT_LEARN);
  return topics;
}

// ── Welcome / Landing Page ──────────────────────────────────────────────────────
function buildWelcome(articles, learnTopics) {
  const recent   = articles.slice(0, 8);
  const buildDate = new Date().toLocaleDateString('en-GB', {
    year:'numeric', month:'short', day:'numeric', timeZone:'Africa/Cairo'
  });
  const buildTime = new Date().toLocaleTimeString('en-US', {
    hour:'numeric', minute:'2-digit', hour12:true, timeZone:'Africa/Cairo'
  });

  const PLATFORM_COLORS = {
    'WhatsApp':  { bg:'#0a3d2e', text:'#4ade80', border:'#166534' },
    'Messenger': { bg:'#0f1d3d', text:'#93c5fd', border:'#1e3a8a' },
    'Common':    { bg:'#1a1a24', text:'#a78bfa', border:'#4c1d95' },
  };
  const CAT_ICONS = { 'Core API':'⚡','Webhooks':'🔔','Pricing':'💰','Auth':'🔐' };

  // Recent updates mini-cards
  const recentCards = recent.map(a => {
    const m = a.meta;
    const mods = Array.isArray(m.sv2_modules) ? m.sv2_modules
      : (m.sv2_modules ? m.sv2_modules.split(',').map(s=>s.trim()) : []);
    const anchor  = dateToAnchor(m.date);
    const link    = `changelog.html${anchor}`;
    const cc      = CATEGORY_COLORS[m.category] || { bg:'#1a1a1a', text:'#aaa', border:'#333' };
    const modHtml = mods.slice(0,2).map(mod => {
      const color = MODULE_COLORS[mod] || '#666';
      return `<span class="wmb" style="border-color:${color};color:${color}">${escHtml(mod)}</span>`;
    }).join('');

    return `<a class="w-card" href="${escHtml(link)}">
      <div class="w-card-top">
        <time class="w-card-date">${escHtml(formatDate(m.date))}</time>
        <span class="w-cat-badge" style="background:${cc.bg};color:${cc.text};border-color:${cc.border}">${escHtml(m.category)}</span>
      </div>
      <h3 class="w-card-title">${escHtml((m.title || '').slice(0, 80))}</h3>
      <div class="w-card-mods">${modHtml}</div>
      <p class="w-card-snippet"
         data-en="${escHtml((m.summary_short||'').replace(/^,\s*\*[^*]+\*\s*/g,'').slice(0,120))}"
         data-ar="${escHtml(generateArabicSummary(m))}">${escHtml((m.summary_short||'').replace(/^,\s*\*[^*]+\*\s*/g,'').slice(0,120))}</p>
      <span class="w-card-arrow">→</span>
    </a>`;
  }).join('');

  // Learn topic cards
  const learnCards = learnTopics.map(t => {
    const pc = PLATFORM_COLORS[t.platform] || { bg:'#1a1a24', text:'#a78bfa', border:'#4c1d95' };
    const icon = CAT_ICONS[t.category] || '📖';
    const slug = t.slug || '';
    return `<a class="w-learn-card" href="learn/topics/${escHtml(slug)}.html">
      <div class="w-learn-top">
        <span class="w-learn-icon">${icon}</span>
        <span class="w-learn-platform" style="color:${pc.text}">${escHtml(t.platform || '')}</span>
      </div>
      <h3 class="w-learn-title">${escHtml(t.title || '')}</h3>
      <p class="w-learn-cat">${escHtml(t.category || '')}</p>
      <span class="w-card-arrow">→</span>
    </a>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark" data-lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Meta API Watch — SEEN V2 Hub</title>
  <meta name="description" content="Your unified hub for Meta Developer API changes and learning resources for SEEN V2." />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root,[data-theme="dark"]{
      --bg:#0a0a0f;--bg2:#111118;--bg3:#1a1a24;
      --border:rgba(255,255,255,0.08);
      --text:#e2e8f0;--text-muted:#8892a4;--text-dim:#5a647a;
      --accent:#6366f1;--accent2:#818cf8;
      --shadow:0 8px 32px rgba(0,0,0,0.5);
      --glow:0 0 40px rgba(99,102,241,0.18);
      --radius:12px;
    }
    [data-theme="light"]{
      --bg:#f4f6fb;--bg2:#ffffff;--bg3:#eef0f7;
      --border:rgba(0,0,0,0.09);
      --text:#1a1a2e;--text-muted:#6b7280;--text-dim:#9ca3af;
      --accent:#4f46e5;--accent2:#6366f1;
      --shadow:0 8px 32px rgba(0,0,0,0.1);
      --glow:0 0 40px rgba(99,102,241,0.08);
    }
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    body{background:var(--bg);color:var(--text);font-family:'Inter',-apple-system,sans-serif;
         font-size:15px;line-height:1.6;min-height:100vh;transition:background .2s,color .2s}
    a{text-decoration:none}

    /* Header */
    .w-header{background:var(--bg2);border-bottom:1px solid var(--border);
      padding:14px 24px;position:sticky;top:0;z-index:100;backdrop-filter:blur(12px);
      transition:background .2s}
    .w-header-inner{max-width:1280px;margin:0 auto;display:flex;
      align-items:center;justify-content:space-between;gap:16px}
    .w-brand{display:flex;align-items:center;gap:12px}
    .w-brand-icon{font-size:1.5rem;animation:glow-pulse 3s ease-in-out infinite}
    @keyframes glow-pulse{
      0%,100%{filter:drop-shadow(0 0 6px rgba(99,102,241,.4))}
      50%{filter:drop-shadow(0 0 16px rgba(99,102,241,.8))}
    }
    .w-brand-name{font-size:1.1rem;font-weight:700;
      background:linear-gradient(135deg,var(--text),var(--accent2));
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
    .w-brand-sub{font-size:.7rem;color:var(--text-muted);font-family:'JetBrains Mono',monospace;margin-top:1px}
    .w-header-actions{display:flex;align-items:center;gap:10px}

    /* Buttons */
    .w-btn{background:var(--bg3);border:1px solid var(--border);border-radius:50px;
      padding:5px 12px;font-size:.75rem;font-weight:600;color:var(--text-muted);
      cursor:pointer;font-family:'Inter',sans-serif;transition:all .2s;display:flex;
      align-items:center;gap:5px}
    .w-btn:hover{border-color:var(--accent);color:var(--text)}
    .lang-en,.lang-ar{transition:color .2s}
    [data-lang="ar"] .lang-en{color:var(--text-muted)}
    [data-lang="ar"] .lang-ar{color:var(--text)}
    [data-lang="en"] .lang-en{color:var(--text)}
    [data-lang="en"] .lang-ar{color:var(--text-muted)}
    .theme-toggle{background:var(--bg3);border:1px solid var(--border);border-radius:50px;
      width:48px;height:28px;cursor:pointer;position:relative;transition:all .2s}
    .theme-toggle:hover{border-color:var(--accent)}
    .i-sun,.i-moon{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
      font-size:.85rem;transition:opacity .2s,transform .3s}
    [data-theme="dark"] .i-sun{opacity:0;transform:translate(-50%,-50%) rotate(90deg) scale(.5)}
    [data-theme="dark"] .i-moon{opacity:1}
    [data-theme="light"] .i-sun{opacity:1}
    [data-theme="light"] .i-moon{opacity:0;transform:translate(-50%,-50%) rotate(-90deg) scale(.5)}

    /* Hero */
    .w-hero{max-width:1280px;margin:0 auto;padding:52px 24px 40px;text-align:center}
    .w-hero-badge{display:inline-flex;align-items:center;gap:6px;
      background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.25);
      border-radius:100px;padding:5px 14px;font-size:.72rem;font-weight:600;
      color:var(--accent2);margin-bottom:20px;letter-spacing:.04em;text-transform:uppercase}
    .w-hero h1{font-size:clamp(2rem,5vw,3.2rem);font-weight:800;letter-spacing:-.03em;
      line-height:1.1;margin-bottom:14px;
      background:linear-gradient(135deg,var(--text) 40%,var(--accent2));
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
    .w-hero-desc{font-size:1.05rem;color:var(--text-muted);max-width:580px;
      margin:0 auto 32px;line-height:1.7}
    .w-hero-stats{display:flex;justify-content:center;gap:36px;flex-wrap:wrap;margin-bottom:32px}
    .w-stat{text-align:center}
    .w-stat-num{display:block;font-size:2.1rem;font-weight:700;color:var(--accent2);
      font-family:'JetBrains Mono',monospace;line-height:1}
    .w-stat-label{font-size:.7rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:.07em}
    .w-build{display:inline-flex;align-items:center;gap:8px;
      background:rgba(99,102,241,.07);border:1px solid rgba(99,102,241,.18);
      border-radius:8px;padding:6px 14px;font-size:.72rem;
      font-family:'JetBrains Mono',monospace;color:var(--text-muted)}
    .w-build-label{color:var(--accent2);font-weight:600}

    /* Tabs */
    .w-tabs-wrap{max-width:1280px;margin:0 auto;padding:0 24px}
    .w-tabs{display:flex;gap:4px;border-bottom:2px solid var(--border)}
    .w-tab{background:none;border:none;cursor:pointer;font-family:'Inter',sans-serif;
      font-size:.9rem;font-weight:600;color:var(--text-muted);padding:14px 22px;
      border-bottom:2px solid transparent;margin-bottom:-2px;
      transition:all .2s;display:flex;align-items:center;gap:8px;white-space:nowrap}
    .w-tab:hover{color:var(--text);background:rgba(99,102,241,.04)}
    .w-tab.active{color:var(--accent2);border-bottom-color:var(--accent2);
      background:rgba(99,102,241,.06)}
    .w-tab-count{background:var(--bg3);border-radius:100px;padding:2px 8px;
      font-size:.65rem;font-weight:700;color:var(--text-muted)}
    .w-tab.active .w-tab-count{background:rgba(99,102,241,.15);color:var(--accent2)}

    /* Tab panels */
    .w-panel{display:none;max-width:1280px;margin:0 auto;padding:28px 24px 64px}
    .w-panel.active{display:block}

    /* Update cards */
    .w-updates-grid{display:grid;
      grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:14px;margin-bottom:24px}
    .w-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);
      padding:18px;display:flex;flex-direction:column;gap:10px;
      transition:transform .2s,box-shadow .2s,border-color .2s;position:relative;color:inherit}
    .w-card:hover{transform:translateY(-3px);box-shadow:var(--shadow);
      border-color:rgba(99,102,241,.3);text-decoration:none}
    .w-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
    .w-card-date{font-family:'JetBrains Mono',monospace;font-size:.72rem;color:var(--text-dim)}
    .w-cat-badge{font-size:.63rem;font-weight:700;padding:2px 8px;border-radius:100px;
      border:1px solid;letter-spacing:.02em;white-space:nowrap}
    .w-card-title{font-size:.88rem;font-weight:600;line-height:1.4;color:var(--text)}
    .w-card-mods{display:flex;gap:5px;flex-wrap:wrap}
    .wmb{font-size:.63rem;font-weight:600;padding:2px 7px;border-radius:100px;border:1px solid;white-space:nowrap}
    .w-card-snippet{font-size:.78rem;color:var(--text-muted);line-height:1.5;
      display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    .w-card-arrow{position:absolute;bottom:14px;right:14px;color:var(--text-dim);
      font-size:.85rem;transition:transform .2s,color .2s}
    .w-card:hover .w-card-arrow{color:var(--accent2);transform:translateX(3px)}

    /* View all */
    .w-view-all{display:inline-flex;align-items:center;gap:8px;
      background:linear-gradient(135deg,rgba(99,102,241,.15),rgba(129,140,248,.08));
      border:1px solid rgba(99,102,241,.3);border-radius:10px;
      padding:11px 22px;font-size:.85rem;font-weight:600;color:var(--accent2);
      transition:all .2s}
    .w-view-all:hover{background:rgba(99,102,241,.22);transform:translateY(-1px);
      box-shadow:var(--glow)}

    /* Learn cards */
    .w-learn-grid{display:grid;
      grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px;margin-bottom:28px}
    .w-learn-card{background:var(--bg2);border:1px solid var(--border);
      border-radius:var(--radius);padding:20px;display:flex;flex-direction:column;
      gap:8px;transition:transform .2s,box-shadow .2s,border-color .2s;
      position:relative;color:inherit}
    .w-learn-card:hover{transform:translateY(-3px);box-shadow:var(--shadow);
      border-color:rgba(99,102,241,.3);text-decoration:none}
    .w-learn-top{display:flex;align-items:center;justify-content:space-between}
    .w-learn-icon{font-size:1.2rem}
    .w-learn-platform{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em}
    .w-learn-title{font-size:.92rem;font-weight:600;color:var(--text);line-height:1.3}
    .w-learn-cat{font-size:.72rem;color:var(--text-dim);font-family:'JetBrains Mono',monospace}

    /* Section headings */
    .w-section-head{display:flex;align-items:center;gap:12px;margin-bottom:20px}
    .w-section-title{font-size:.78rem;font-weight:700;text-transform:uppercase;
      letter-spacing:.09em;color:var(--text-muted);white-space:nowrap}
    .w-section-line{flex:1;height:1px;background:var(--border)}

    /* RTL */
    [data-lang="ar"]{direction:rtl;font-family:'Noto Sans Arabic','Inter',sans-serif}
    [data-lang="ar"] .w-card-arrow{right:auto;left:14px}
    [data-lang="ar"] .w-card:hover .w-card-arrow{transform:translateX(-3px)}
    [data-lang="ar"] .w-section-head{flex-direction:row-reverse}

    @media(max-width:768px){
      .w-hero{padding:36px 20px 28px}
      .w-updates-grid,.w-learn-grid{grid-template-columns:1fr}
      .w-tabs{overflow-x:auto}
      .w-tab{font-size:.82rem;padding:10px 14px}
    }
  </style>
</head>
<body>

  <header class="w-header">
    <div class="w-header-inner">
      <div class="w-brand">
        <span class="w-brand-icon">🔭</span>
        <div>
          <div class="w-brand-name">Meta API Watch</div>
          <div class="w-brand-sub"
               data-en="SEEN V2 · Developer Docs Hub"
               data-ar="SEEN V2 · مركز مطوري Meta">SEEN V2 · Developer Docs Hub</div>
        </div>
      </div>
      <div class="w-header-actions">
        <button class="w-btn" id="lang-toggle" aria-label="Toggle language">
          <span class="lang-en">EN</span><span style="color:var(--text-dim)">·</span><span class="lang-ar">عربي</span>
        </button>
        <button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme">
          <span class="i-sun">☀️</span><span class="i-moon">🌙</span>
        </button>
      </div>
    </div>
  </header>

  <div class="w-hero">
    <div class="w-hero-badge">🔭 Meta API Watch</div>
    <h1 data-en="Your Meta API Command Center"
        data-ar="مركز تحكم Meta API الخاص بك">Your Meta API Command Center</h1>
    <p class="w-hero-desc"
       data-en="Track every change Meta pushes to their developer docs. Learn every API feature with exact validation rules. All in one place for SEEN V2."
       data-ar="تتبّع كل تغيير يدفعه Meta لوثائق المطورين. تعلّم كل ميزة API مع قواعد التحقق الدقيقة. كل شيء في مكان واحد لـ SEEN V2.">Track every change Meta pushes to their developer docs. Learn every API feature with exact validation rules. All in one place for SEEN V2.</p>
    <div class="w-hero-stats">
      <div class="w-stat">
        <span class="w-stat-num">${articles.length}</span>
        <span class="w-stat-label" data-en="Updates Tracked" data-ar="تحديثات">Updates Tracked</span>
      </div>
      <div class="w-stat">
        <span class="w-stat-num">${learnTopics.length}</span>
        <span class="w-stat-label" data-en="Learn Topics" data-ar="مواضيع تعليمية">Learn Topics</span>
      </div>
      <div class="w-stat">
        <span class="w-stat-num">${articles.filter(a=>a.meta.category==='Breaking Change').length}</span>
        <span class="w-stat-label" data-en="Breaking Changes" data-ar="تغييرات جذرية">Breaking Changes</span>
      </div>
    </div>
    <div class="w-build">
      <span class="w-build-label" data-en="Last Build" data-ar="آخر بناء">Last Build</span>
      <span>${buildDate} · ${buildTime} (Cairo)</span>
    </div>
  </div>

  <!-- Tabs -->
  <div class="w-tabs-wrap">
    <div class="w-tabs" role="tablist">
      <button class="w-tab active" id="tab-btn-updates" role="tab"
              aria-selected="true" aria-controls="panel-updates">
        <span data-en="🔔 Latest Updates" data-ar="🔔 آخر التحديثات">🔔 Latest Updates</span>
        <span class="w-tab-count">${articles.length}</span>
      </button>
      <button class="w-tab" id="tab-btn-learn" role="tab"
              aria-selected="false" aria-controls="panel-learn">
        <span data-en="📚 Learn &amp; Reference" data-ar="📚 تعلّم ومرجع">📚 Learn &amp; Reference</span>
        <span class="w-tab-count">${learnTopics.length}</span>
      </button>
    </div>
  </div>

  <!-- Updates panel -->
  <div class="w-panel active" id="panel-updates" role="tabpanel" aria-labelledby="tab-btn-updates">
    <div class="w-section-head">
      <span class="w-section-title" data-en="Most recent changes from Meta Docs" data-ar="أحدث التغييرات من Meta Docs">Most recent changes from Meta Docs</span>
      <div class="w-section-line"></div>
    </div>
    ${recent.length ? `<div class="w-updates-grid">${recentCards}</div>` : '<p style="color:var(--text-dim);padding:20px 0">📭 Run the pipeline to fetch changes.</p>'}
    <a class="w-view-all" href="changelog.html">
      <span data-en="View all ${articles.length} updates →" data-ar="عرض جميع التحديثات (${articles.length}) →">View all ${articles.length} updates →</span>
    </a>
  </div>

  <!-- Learn panel -->
  <div class="w-panel" id="panel-learn" role="tabpanel" aria-labelledby="tab-btn-learn">
    <div class="w-section-head">
      <span class="w-section-title" data-en="Validation-first API reference for SEEN V2" data-ar="مرجع API بالتحقّق أولاً لـ SEEN V2">Validation-first API reference for SEEN V2</span>
      <div class="w-section-line"></div>
    </div>
    ${learnTopics.length ? `<div class="w-learn-grid">${learnCards}</div>` : '<p style="color:var(--text-dim);padding:20px 0">📚 Run node scripts/build-learn.js first.</p>'}
    <a class="w-view-all" href="learn/index.html">
      <span data-en="Open full reference →" data-ar="فتح المرجع الكامل →">Open full reference →</span>
    </a>
  </div>

  <script>
    (function(){
      const html = document.documentElement;
      const THEME_KEY = 'maw-theme', LANG_KEY = 'maw-lang';

      // Theme
      function applyTheme(t){html.setAttribute('data-theme',t);localStorage.setItem(THEME_KEY,t)}
      applyTheme(localStorage.getItem(THEME_KEY)||(window.matchMedia('(prefers-color-scheme:light)').matches?'light':'dark'));
      document.getElementById('theme-toggle').addEventListener('click',()=>{
        applyTheme(html.getAttribute('data-theme')==='dark'?'light':'dark')
      });

      // Language
      function applyLang(l){
        html.setAttribute('data-lang',l);
        html.setAttribute('lang',l==='ar'?'ar':'en');
        html.setAttribute('dir',l==='ar'?'rtl':'ltr');
        localStorage.setItem(LANG_KEY,l);
        document.querySelectorAll('[data-en][data-ar]').forEach(el=>{
          el.textContent=el.getAttribute(l==='ar'?'data-ar':'data-en');
        });
      }
      applyLang(localStorage.getItem(LANG_KEY)||'en');
      document.getElementById('lang-toggle').addEventListener('click',()=>{
        applyLang(html.getAttribute('data-lang')==='ar'?'en':'ar')
      });

      // Tabs
      document.querySelectorAll('.w-tab').forEach(btn=>{
        btn.addEventListener('click',()=>{
          document.querySelectorAll('.w-tab').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-selected','false')});
          document.querySelectorAll('.w-panel').forEach(p=>p.classList.remove('active'));
          btn.classList.add('active');
          btn.setAttribute('aria-selected','true');
          const target=document.getElementById(btn.getAttribute('aria-controls'));
          if(target) target.classList.add('active');
        });
      });
    })();
  </script>
</body>
</html>`;
}

// ── Main ──────────────────────────────────────────────────────────────────────
function main() {
  const args = process.argv.slice(2);
  fs.mkdirSync(CONTENT, { recursive: true });
  fs.mkdirSync(SITE,    { recursive: true });

  if (args[0] !== '--rebuild-only') {
    const articleFile = args[0];
    if (!articleFile) {
      console.error('Usage: node publish-article.js <article.md> | --rebuild-only');
      process.exit(1);
    }
    if (!fs.existsSync(articleFile)) {
      console.error(`File not found: ${articleFile}`);
      process.exit(1);
    }

    const raw = fs.readFileSync(articleFile, 'utf8');
    const { meta } = parseFrontmatter(raw);

    if (!meta.title || !meta.date) {
      console.error('Article must have title and date in frontmatter.');
      process.exit(1);
    }

    const slug     = slugify(meta.title);
    const filename = `${meta.date}-${slug}.md`;
    const destPath = path.join(CONTENT, filename);

    fs.writeFileSync(destPath, raw);
    console.log(`✅ Article saved: ${destPath}`);
  }

  const articles    = getAllArticles();
  const learnTopics = getLearnTopics();

  // 1. Changelog page
  const changelogHtml = buildIndex(articles);
  fs.writeFileSync(CHANGELOG, changelogHtml);
  console.log(`✅ Changelog rebuilt: ${CHANGELOG} (${articles.length} articles)`);

  // 2. Welcome page
  const welcomeHtml = buildWelcome(articles, learnTopics);
  fs.writeFileSync(WELCOME, welcomeHtml);
  console.log(`✅ Welcome page rebuilt: ${WELCOME}`);
}

main();
