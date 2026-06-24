#!/usr/bin/env node
/**
 * scripts/build-search-index.js
 * Builds site/search-index.json from:
 *   - content/changelog/*.md   → changelog articles
 *   - content-learn/**\/*.md   → learn topics
 *
 * Run after publish-article.js and build-learn.js
 */

'use strict';
const fs   = require('fs');
const path = require('path');

const ROOT          = path.resolve(__dirname, '..');
const CONTENT_DIR   = path.join(ROOT, 'content', 'changelog');
const LEARN_DIR     = path.join(ROOT, 'content-learn');
const OUT_FILE      = path.join(ROOT, 'site', 'search-index.json');

// ── Frontmatter parser ────────────────────────────────────────────────────────
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta = {};
  for (const line of match[1].split('\n')) {
    const [key, ...rest] = line.split(':');
    if (!key?.trim()) continue;
    let val = rest.join(':').trim();
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1,-1).split(',').map(v => v.trim().replace(/^["']|["']$/g,''));
    }
    meta[key.trim()] = val;
  }
  return { meta, body: match[2].trim() };
}

// Strip markdown formatting to get plain text for searching
function stripMarkdown(text) {
  return text
    .replace(/```[\s\S]*?```/g, '') // code blocks
    .replace(/`[^`]+`/g, '')         // inline code
    .replace(/^#{1,6}\s+/gm, '')     // headings
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/\*([^*]+)\*/g, '$1')   // italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/<!--.*?-->/gs, '')     // html comments
    .replace(/\|[^\n]+\|/g, '')      // table rows
    .replace(/[-*+]\s+/g, '')        // list bullets
    .replace(/\s{2,}/g, ' ')         // collapse whitespace
    .trim();
}

// Extract a snippet around the first match
function getSnippet(text, length = 160) {
  const clean = stripMarkdown(text);
  return clean.length > length ? clean.slice(0, length).trimEnd() + '…' : clean;
}

// ── Read changelog articles ───────────────────────────────────────────────────
function readChangelog() {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const entries = [];

  for (const f of fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md')).sort().reverse()) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, f), 'utf8');
    const { meta, body } = parseFrontmatter(raw);
    const slug = f.replace('.md','');

    entries.push({
      type:     'changelog',
      id:       `changelog-${slug}`,
      title:    meta.title || slug,
      date:     meta.date || '',
      category: meta.category || '',
      modules:  Array.isArray(meta.sv2_modules)
                  ? meta.sv2_modules
                  : (meta.sv2_modules || '').split(',').map(m => m.trim()).filter(Boolean),
      snippet:  getSnippet(body),
      url:      `changelog.html`,
      anchor:   `card-${slug}`,
    });
  }

  return entries;
}

// ── Read learn topics ─────────────────────────────────────────────────────────
function readLearnTopics() {
  if (!fs.existsSync(LEARN_DIR)) return [];
  const entries = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) { walk(path.join(dir, entry.name)); continue; }
      if (!entry.name.endsWith('.md')) continue;

      const raw = fs.readFileSync(path.join(dir, entry.name), 'utf8');
      const { meta, body } = parseFrontmatter(raw);
      if (!meta.slug) continue;

      // Extract headings as searchable tags
      const headings = [...body.matchAll(/^#{2,3}\s(.+)$/gm)].map(m => m[1]);

      entries.push({
        type:     'learn',
        id:       `learn-${meta.slug}`,
        title:    meta.title || meta.slug,
        platform: meta.platform || 'Common',
        category: meta.category || '',
        headings: headings,
        snippet:  getSnippet(body),
        // Full body for searching (stripped) – not stored in index, search is client-side
        body:     stripMarkdown(body).slice(0, 3000),
        url:      `learn/topics/${meta.slug}.html`,
      });
    }
  }

  walk(LEARN_DIR);
  return entries;
}

// ── Main ──────────────────────────────────────────────────────────────────────
function main() {
  const changelog = readChangelog();
  const learn     = readLearnTopics();
  const index     = { version: 1, built: new Date().toISOString(), items: [...changelog, ...learn] };

  fs.writeFileSync(OUT_FILE, JSON.stringify(index, null, 2), 'utf8');

  console.log(`\n🔍 Search index built:`);
  console.log(`   Changelog entries : ${changelog.length}`);
  console.log(`   Learn topics      : ${learn.length}`);
  console.log(`   Total items       : ${index.items.length}`);
  console.log(`   Output            : site/search-index.json\n`);
}

main();
