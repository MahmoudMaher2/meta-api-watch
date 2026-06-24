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

const ROOT        = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content-learn');
const SITE_DIR    = path.join(ROOT, 'site');
const LEARN_DIR   = path.join(SITE_DIR, 'learn');
const TOPICS_DIR  = path.join(LEARN_DIR, 'topics');

// ── Frontmatter parser ────────────────────────────────────────────────────────
function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta = {};
  for (const line of match[1].split('\n')) {
    const [key, ...rest] = line.split(':');
    if (key?.trim()) meta[key.trim()] = rest.join(':').trim();
  }
  return { meta, body: match[2].trim() };
}

// ── Markdown → HTML (minimal, no deps) ───────────────────────────────────────
function md2html(text) {
  return text
    // Code blocks (must come before inline code)
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre class="code-block"><code class="lang-${lang || 'text'}">${escHtml(code.trim())}</code></pre>`)
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
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
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
  return text.toLowerCase().replace(/[^\w\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-');
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
      } else if (entry.name.endsWith('.md')) {
        const raw  = fs.readFileSync(path.join(dir, entry.name), 'utf8');
        const { meta, body } = parseFrontmatter(raw);
        topics.push({
          filename: entry.name,
          slug: meta.slug || entry.name.replace('.md', ''),
          platform: meta.platform || platform || 'Common',
          category: meta.category || 'Core API',
          title: meta.title || 'Untitled',
          priority: meta.priority || 'medium',
          source_url: meta.source_url || '',
          last_verified: meta.last_verified || '',
          meta, body
        });
      }
    }
  }
  walk(CONTENT_DIR);
  return topics;
}

// ── Build a single topic page ─────────────────────────────────────────────────
function buildTopicPage(topic, allTopics) {
  const pc = PLATFORM_COLORS[topic.platform] || PLATFORM_COLORS['Common'];
  const content = md2html(topic.body);
  
  // Extract TOC from headings
  const headings = [...topic.body.matchAll(/^#{2,3}\s(.+)$/gm)].map(m => ({
    level: m[0].startsWith('###') ? 3 : 2,
    text: m[1],
    id: slugH(m[1])
  }));
  const toc = headings.map(h =>
    `<li class="toc-${h.level === 3 ? 'sub' : 'top'}"><a href="#${h.id}">${h.text}</a></li>`
  ).join('');

  // Sibling navigation
  const platformTopics = allTopics.filter(t => t.platform === topic.platform);
  const idx = platformTopics.findIndex(t => t.slug === topic.slug);
  const prev = platformTopics[idx - 1];
  const next = platformTopics[idx + 1];
  const prevLink = prev ? `<a class="nav-prev" href="${prev.slug}.html">← ${prev.title}</a>` : '';
  const nextLink = next ? `<a class="nav-next" href="${next.slug}.html">${next.title} →</a>` : '';

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${topic.title} — Meta Docs Learn</title>
  <meta name="description" content="Learn how ${topic.title} works in ${topic.platform} — parameters, validation rules, error codes, and examples." />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../style.css" />
</head>
<body>

  <header class="learn-header">
    <div class="learn-header-inner">
      <a href="../index.html" class="back-home">
        <span>←</span> Meta Docs Learn
      </a>
      <div class="header-actions">
        <a href="../../changelog.html" class="link-changelog">📋 Changelog</a>
        <button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme">
          <span class="icon-sun">☀️</span>
          <span class="icon-moon">🌙</span>
        </button>
      </div>
    </div>
  </header>

  <div class="learn-layout">

    <!-- Sidebar -->
    <aside class="learn-sidebar" id="sidebar">
      <div class="sidebar-section">
        <span class="sidebar-label">On this page</span>
        <ul class="toc-list">${toc}</ul>
      </div>
      <div class="sidebar-section">
        <span class="sidebar-label">Source</span>
        <a href="${topic.source_url}" target="_blank" rel="noopener" class="source-link">
          📄 Meta Developer Docs ↗
        </a>
        ${topic.last_verified ? `<span class="verified-date">Verified: ${topic.last_verified}</span>` : ''}
      </div>
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
        <span class="platform-badge" style="background:${pc.bg};color:${pc.text};border-color:${pc.border}">${topic.platform}</span>
        <h1 class="topic-title">${topic.title}</h1>
        <p class="topic-meta">${topic.category} · Last verified: ${topic.last_verified || 'N/A'}</p>
      </div>

      <div class="topic-body">
        ${content}
      </div>

      <div class="topic-nav">
        ${prevLink}
        ${nextLink}
      </div>
    </main>

  </div>

  <script src="../app.js"></script>
</body>
</html>`;
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
    const cards = pts.map(t => `
      <a class="topic-card" href="topics/${t.slug}.html">
        <div class="topic-card-header">
          <span class="topic-card-icon">${
            t.category === 'Core API' ? '⚡' :
            t.category === 'Webhooks' ? '🔔' :
            t.category === 'Pricing' ? '💰' :
            t.category === 'Auth' ? '🔐' : '📖'
          }</span>
          <span class="topic-card-platform" style="color:${pc.text}">${platform}</span>
        </div>
        <h3 class="topic-card-title">${t.title}</h3>
        <p class="topic-card-category">${t.category}</p>
        <span class="topic-card-arrow">→</span>
      </a>`).join('');
    return `
      <section class="platform-section">
        <h2 class="platform-heading">
          <span class="platform-dot" style="background:${pc.text}"></span>
          ${platform}
        </h2>
        <div class="topic-cards">${cards}</div>
      </section>`;
  }).join('');

  const buildDate = new Date().toLocaleDateString('en-GB', {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Africa/Cairo'
  });

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Meta Docs Learn — WhatsApp & Messenger API Reference</title>
  <meta name="description" content="Learn every Meta API feature with validation rules, error codes, and CRUD examples for WhatsApp, Messenger, and Instagram APIs." />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css" />
</head>
<body>

  <header class="learn-header">
    <div class="learn-header-inner">
      <div class="learn-brand">
        <span class="learn-brand-icon">📚</span>
        <div>
          <h1 class="learn-brand-title">Meta Docs Learn</h1>
          <p class="learn-brand-sub">Validation-first API reference for SEEN V2</p>
        </div>
      </div>
      <div class="header-actions">
        <a href="../changelog.html" class="link-changelog">📋 Changelog</a>
        <button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme">
          <span class="icon-sun">☀️</span>
          <span class="icon-moon">🌙</span>
        </button>
      </div>
    </div>
  </header>

  <main class="learn-home">
    <div class="home-hero">
      <p class="home-hero-desc">
        Every Meta API feature explained with <strong>exact validation rules</strong> — what gets accepted, what gets rejected, and why. Focused on WhatsApp, Messenger, and everything that matters for SEEN V2.
      </p>
      <div class="home-stats">
        <div class="home-stat">
          <span class="home-stat-num">${topics.length}</span>
          <span class="home-stat-label">topics</span>
        </div>
        <div class="home-stat">
          <span class="home-stat-num">${Object.keys(grouped).length}</span>
          <span class="home-stat-label">platforms</span>
        </div>
      </div>
    </div>

    ${platformSections}

    <footer class="learn-footer">
      <p>Meta Docs Learn · Built with Antigravity · Last updated: ${buildDate} (Cairo)</p>
      <p>All content extracted directly from <a href="https://developers.facebook.com" target="_blank">Meta Developer Documentation</a></p>
    </footer>
  </main>

  <script src="app.js"></script>
</body>
</html>`;
}

// ── Main ──────────────────────────────────────────────────────────────────────
function main() {
  fs.mkdirSync(TOPICS_DIR, { recursive: true });

  const topics = getAllTopics();
  console.log(`\n📚 Found ${topics.length} topic(s)\n`);

  // Copy CSS + JS from content-learn if not in site/learn
  const cssSource = path.join(ROOT, 'learn', 'style.css');
  const jsSource  = path.join(ROOT, 'learn', 'app.js');
  const cssDest   = path.join(LEARN_DIR, 'style.css');
  const jsDest    = path.join(LEARN_DIR, 'app.js');
  if (fs.existsSync(cssSource)) fs.copyFileSync(cssSource, cssDest);
  if (fs.existsSync(jsSource))  fs.copyFileSync(jsSource,  jsDest);

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
