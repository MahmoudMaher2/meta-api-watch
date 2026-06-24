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
const { buildHeader, buildSharedScript, buildHead } = require('./header');

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
  }) + ' 🇪🇬';
  const lastBuildLabel = `${buildDateDisplay} · ${buildTimeDisplay}`;

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark" data-lang="en">
${buildHead(
  'Meta API Explain — SEEN V2 Changelog Tracker',
  'Daily tracker for Meta Developer API changes for SEEN V2.',
  'style.css'
)}
<body>

  ${buildHeader('', 'changelog', lastBuildLabel)}



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
  <script>var _SEARCH_BASE_='';</script>
  <script src="search.js"></script>
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

// ── Welcome / Landing Page (clean hero) ─────────────────────────────────
function buildWelcome(articles, learnTopics) {
  const buildDate = new Date().toLocaleDateString('en-GB', {
    year:'numeric', month:'short', day:'numeric', timeZone:'Africa/Cairo'
  });
  const buildTime = new Date().toLocaleTimeString('en-US', {
    hour:'numeric', minute:'2-digit', hour12:true, timeZone:'Africa/Cairo'
  });
  const lastBuildLabel = `${buildDate} · ${buildTime} 🇪🇬`;
  const breaking = articles.filter(a=>a.meta.category==='Breaking Change').length;
  return `<!DOCTYPE html>
<html lang="en" data-theme="dark" data-lang="en">
${buildHead(
  'Meta API Explain — SEEN V2 Developer Hub',
  'Track every Meta API change. Learn every feature with validation rules. Built for SEEN V2.',
  'style.css'
)}
<body>

  ${buildHeader('', 'home', lastBuildLabel)}

  <main class="welcome-page">
    <div class="welcome-container">
      <div class="welcome-badge">&#x1F52D; Meta API Explain</div>
      <h1 class="welcome-h1">
        <span data-en="Track Changes." data-ar="تتبّع التغييرات.">Track Changes.</span><br>
        <span data-en="Master the API." data-ar="أتقن الـ API.">Master the API.</span>
      </h1>
      <p class="welcome-desc"
         data-en="Every change Meta pushes to their developer docs. Every API feature explained with exact validation rules. Built for SEEN V2."
         data-ar="كل تغيير يدفعه Meta لوثائق المطورين. كل ميزة API مشروحة بقواعد التحقق الدقيقة. مبني لـ SEEN V2.">Every change Meta pushes to their developer docs. Every API feature explained with exact validation rules. Built for SEEN V2.</p>
      <div class="welcome-stats">
        <div class="welcome-stat">
          <span class="welcome-stat-num">${articles.length}</span>
          <span class="welcome-stat-label" data-en="Updates" data-ar="تحديثات">Updates</span>
        </div>
        <div class="welcome-stat">
          <span class="welcome-stat-num">${learnTopics.length}</span>
          <span class="welcome-stat-label" data-en="Learn Topics" data-ar="موضوع تعليمي">Learn Topics</span>
        </div>
        <div class="welcome-stat">
          <span class="welcome-stat-num">${breaking}</span>
          <span class="welcome-stat-label" data-en="Breaking Changes" data-ar="تغييرات جذرية">Breaking Changes</span>
        </div>
      </div>
      <div class="welcome-build">
        <span class="welcome-build-label" data-en="Last Updated" data-ar="آخر تحديث">Last Updated</span>
        <span>${buildDate} &middot; ${buildTime} 🇪🇬</span>
      </div>
      <div class="welcome-cta">
        <a href="changelog.html" class="cta-primary">
          <span data-en="&#x1F514; View Latest Updates" data-ar="&#x1F514; آخر التحديثات">&#x1F514; View Latest Updates</span>
        </a>
        <a href="learn/index.html" class="cta-secondary">
          <span data-en="&#x1F4DA; Start Learning" data-ar="&#x1F4DA; ابدأ التعلم">&#x1F4DA; Start Learning</span>
        </a>
      </div>
    </div>
  </main>

  <footer class="site-footer">
    <p>
      Meta API Explain &middot; SEEN V2 &middot;
      <a href="changelog.html" data-en="Changelog" data-ar="سجل التغييرات">Changelog</a> &middot;
      <a href="learn/index.html" data-en="Learn" data-ar="تعلّم">Learn</a>
    </p>
  </footer>

  <script src="app.js"></script>
  <script>var _SEARCH_BASE_='';</script>
  <script src="search.js"></script>
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

  // 3. Rebuild Learn section (picks up any new content-learn topics from Step 3.5)
  const buildLearnScript = path.join(__dirname, 'build-learn.js');
  if (fs.existsSync(buildLearnScript)) {
    try {
      require(buildLearnScript);
      console.log(`✅ Learn section rebuilt`);
    } catch(e) {
      // build-learn calls main() immediately on require — run as child process instead
      const { execSync } = require('child_process');
      execSync(`node "${buildLearnScript}"`, { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
      console.log(`✅ Learn section rebuilt`);
    }
  }
}

main();
