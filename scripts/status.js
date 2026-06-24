#!/usr/bin/env node
/**
 * status.js — "What do we have?" summary for Antigravity
 *
 * Outputs a concise status report showing:
 * - Latest snapshot per source (date + first 3 entries)
 * - Published articles count + last 5
 * - What's ready to diff today
 *
 * Antigravity reads this at the start of every session to get context
 * without re-reading all snapshot files.
 *
 * Usage:
 *   node scripts/status.js
 *   node scripts/status.js --full   (include all articles)
 */

const fs   = require('fs');
const path = require('path');

const ROOT       = path.resolve(__dirname, '..');
const SOURCES    = JSON.parse(fs.readFileSync(path.join(ROOT, 'sources.json'), 'utf8')).sources;
const SNAPSHOTS  = path.join(ROOT, 'snapshots');
const CONTENT    = path.join(ROOT, 'content', 'changelog');

const TODAY    = new Date().toISOString().slice(0, 10);
const FULL     = process.argv.includes('--full');

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return {};
  const meta = {};
  for (const line of match[1].split('\n')) {
    const [key, ...rest] = line.split(':');
    if (key?.trim()) meta[key.trim()] = rest.join(':').trim();
  }
  return meta;
}

function getSnapshotFiles(slug) {
  const dir = path.join(SNAPSHOTS, slug);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f)).sort();
}

function excerptSnapshot(slug, date) {
  const file = path.join(SNAPSHOTS, slug, `${date}.md`);
  if (!fs.existsSync(file)) return '';
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  // Find first ## heading after frontmatter
  let inFrontmatter = false, count = 0;
  const entries = [];
  for (const line of lines) {
    if (line === '---') { inFrontmatter = !inFrontmatter; continue; }
    if (inFrontmatter) continue;
    if (line.startsWith('## ')) {
      count++;
      entries.push(line.replace(/^## /, '').trim());
      if (count >= 3) break;
    }
  }
  return entries.join(', ');
}

function getArticles() {
  if (!fs.existsSync(CONTENT)) return [];
  return fs.readdirSync(CONTENT)
    .filter(f => f.endsWith('.md'))
    .sort().reverse()
    .map(f => {
      const raw = fs.readFileSync(path.join(CONTENT, f), 'utf8');
      const m = parseFrontmatter(raw);
      return { file: f, title: m.title, date: m.date, category: m.category, modules: m.sv2_modules };
    });
}

// ── Main output ───────────────────────────────────────────────────────────────
const enabledSources = SOURCES.filter(s => s.enabled);
const articles = getArticles();

console.log(`\n╔══════════════════════════════════════════════════════╗`);
console.log(`║         META API WATCH — SESSION STATUS              ║`);
console.log(`╚══════════════════════════════════════════════════════╝`);
console.log(`\n📅 Today: ${TODAY}\n`);

console.log(`── SNAPSHOT STATUS ─────────────────────────────────────\n`);

for (const source of enabledSources) {
  const files = getSnapshotFiles(source.slug);
  const latest = files[files.length - 1]?.replace('.md', '') || 'NONE';
  const hasToday = files.includes(`${TODAY}.md`);
  const count = files.length;
  const excerpt = latest !== 'NONE' ? excerptSnapshot(source.slug, latest) : '';
  const icon = hasToday ? '✅' : '⚠️ ';
  const needsFetch = hasToday ? '' : ' ← NEEDS FETCH TODAY';

  console.log(`${icon} ${source.name}`);
  console.log(`   Last snapshot: ${latest}${needsFetch}`);
  console.log(`   Total snapshots: ${count}`);
  if (excerpt) console.log(`   Latest entries: ${excerpt}`);
  if (!hasToday && count > 0) {
    console.log(`   → Will DIFF against: ${latest}`);
  } else if (!hasToday && count === 0) {
    console.log(`   → First run: will establish BASELINE`);
  } else {
    const priorFiles = files.filter(f => f < `${TODAY}.md`);
    const prior = priorFiles[priorFiles.length - 1]?.replace('.md', '');
    if (prior) console.log(`   → Already fetched. Prior snapshot: ${prior}`);
  }
  console.log();
}

console.log(`── PUBLISHED ARTICLES ──────────────────────────────────\n`);

if (articles.length === 0) {
  console.log(`   None yet — pipeline hasn't detected changes yet.`);
  console.log(`   (This is normal on the first run — baselines were just established)`);
} else {
  const shown = FULL ? articles : articles.slice(0, 5);
  for (const a of shown) {
    console.log(`   [${a.date}] ${a.category || '?'} — ${a.title || a.file}`);
  }
  if (!FULL && articles.length > 5) {
    console.log(`   ... and ${articles.length - 5} more (run with --full to see all)`);
  }
}

console.log(`\n── NEXT ACTION FOR ANTIGRAVITY ─────────────────────────\n`);

const needsFetch = enabledSources.filter(s => {
  const files = getSnapshotFiles(s.slug);
  return !files.includes(`${TODAY}.md`);
});

if (needsFetch.length > 0) {
  console.log(`⚡ Fetch today's snapshots for:`);
  for (const s of needsFetch) {
    console.log(`   - ${s.name}`);
    console.log(`     URL: ${s.url}`);
  }
  console.log(`\n   Then run: node scripts/diff-snapshots.js <slug>`);
} else {
  console.log(`✅ All sources fetched for today.`);
  console.log(`   Run diff to check for changes:`);
  for (const s of enabledSources) {
    console.log(`   node scripts/diff-snapshots.js ${s.slug}`);
  }
}

console.log(`\n── DEPLOY STATUS ───────────────────────────────────────\n`);
try {
  const { execSync } = require('child_process');
  const status = execSync('git status --short', { cwd: ROOT, encoding: 'utf8' });
  const ahead = execSync('git log --oneline @{u}..HEAD 2>nul || echo "(no upstream set)"', { cwd: ROOT, encoding: 'utf8' }).trim();
  console.log(`   Git working tree: ${status.trim() ? 'has changes' : 'clean'}`);
  if (status.trim()) console.log(status.trim().split('\n').map(l => `   ${l}`).join('\n'));
  console.log(`   Unpushed commits: ${ahead || 'none'}`);
} catch {
  console.log(`   (git status unavailable)`);
}

console.log(`\n═══════════════════════════════════════════════════════\n`);
