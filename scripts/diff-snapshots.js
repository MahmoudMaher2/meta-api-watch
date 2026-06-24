#!/usr/bin/env node
/**
 * Step 2 — Diff & Change Detection Agent
 * Compares today's snapshot against the most recent prior snapshot.
 * Outputs structured diff or NO_CHANGE / BASELINE_ONLY.
 *
 * Usage:
 *   node diff-snapshots.js <source-slug> [--date YYYY-MM-DD]
 *
 * Exit codes:
 *   0 = diff found, written to stdout as JSON
 *   1 = error
 *   2 = NO_CHANGE (no meaningful diff)
 *   3 = BASELINE_ONLY (no prior snapshot exists — first run)
 */

const fs   = require('fs');
const path = require('path');

// ── Config ──────────────────────────────────────────────────────────────────
const ROOT      = path.resolve(__dirname, '..');
const SNAPSHOTS = path.join(ROOT, 'snapshots');
const SOURCES_FILE = path.join(ROOT, 'sources.json');

function today() {
  return process.env.PIPELINE_DATE || new Date().toISOString().slice(0, 10);
}

// ── File helpers ─────────────────────────────────────────────────────────────
function getSnapshotFiles(slug) {
  const dir = path.join(SNAPSHOTS, slug);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
    .sort(); // ascending — last item is newest
}

function loadSnapshot(slug, date) {
  const p = path.join(SNAPSHOTS, slug, `${date}.md`);
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, 'utf8');
}

// ── Strip frontmatter for comparison ─────────────────────────────────────────
function stripFrontmatter(content) {
  return content.replace(/^---[\s\S]*?---\n/, '').trim();
}

// ── Normalize whitespace for comparison ──────────────────────────────────────
function normalize(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+$/gm, '')      // trailing whitespace per line
    .replace(/\n{3,}/g, '\n\n')   // collapse multiple blank lines
    .trim();
}

// ── Simple line-level diff ────────────────────────────────────────────────────
function lineDiff(oldText, newText) {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');

  const oldSet = new Set(oldLines.map(l => l.trim()).filter(Boolean));
  const newSet = new Set(newLines.map(l => l.trim()).filter(Boolean));

  const added    = newLines.filter(l => l.trim() && !oldSet.has(l.trim()));
  const removed  = oldLines.filter(l => l.trim() && !newSet.has(l.trim()));

  // Find sections (headings) that changed
  const changedSections = [];
  let currentSection = 'Unknown';
  for (const line of newLines) {
    if (line.startsWith('#')) currentSection = line.replace(/^#+\s*/, '').trim();
    if (added.includes(line)) {
      if (!changedSections.includes(currentSection)) changedSections.push(currentSection);
    }
  }

  return { added, removed, changedSections };
}

// ── Diff summary for the draft agent ─────────────────────────────────────────
function buildDiffSummary(slug, prevDate, todayDate, diff) {
  return {
    meta: {
      source_slug:   slug,
      compared_from: prevDate,
      compared_to:   todayDate,
      generated_at:  new Date().toISOString()
    },
    summary: {
      lines_added:    diff.added.length,
      lines_removed:  diff.removed.length,
      changed_sections: diff.changedSections
    },
    additions: diff.added.slice(0, 200), // cap to avoid huge payloads
    removals:  diff.removed.slice(0, 200),
    changed_sections: diff.changedSections
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────
function main() {
  const args   = process.argv.slice(2);
  const slug   = args[0];
  const date   = args[args.indexOf('--date') > -1 ? args.indexOf('--date') + 1 : -1] || today();

  if (!slug) {
    console.error('Usage: node diff-snapshots.js <source-slug> [--date YYYY-MM-DD]');
    process.exit(1);
  }

  // Verify slug exists
  const sources = JSON.parse(fs.readFileSync(SOURCES_FILE, 'utf8')).sources;
  const source  = sources.find(s => s.slug === slug);
  if (!source) {
    console.error(`Unknown slug: ${slug}`);
    process.exit(1);
  }

  const allFiles = getSnapshotFiles(slug);
  const todayFile = `${date}.md`;

  if (!allFiles.includes(todayFile)) {
    console.error(`No snapshot found for ${date}. Run fetch-snapshot.js first.`);
    process.exit(1);
  }

  // Find most recent PRIOR snapshot
  const priorFiles = allFiles.filter(f => f < todayFile);

  if (priorFiles.length === 0) {
    // First run ever — just establish baseline
    console.log(JSON.stringify({
      status: 'BASELINE_ONLY',
      message: `First snapshot for ${slug}. Baseline established. No article needed.`,
      snapshot_date: date
    }, null, 2));
    process.exit(3);
  }

  const prevFile  = priorFiles[priorFiles.length - 1];
  const prevDate  = prevFile.replace('.md', '');

  const todayRaw = loadSnapshot(slug, date);
  const prevRaw  = loadSnapshot(slug, prevDate);

  const todayNorm = normalize(stripFrontmatter(todayRaw));
  const prevNorm  = normalize(stripFrontmatter(prevRaw));

  if (todayNorm === prevNorm) {
    console.log(JSON.stringify({
      status: 'NO_CHANGE',
      message: `No meaningful diff between ${prevDate} and ${date} for ${slug}.`,
      compared_from: prevDate,
      compared_to: date
    }, null, 2));
    process.exit(2);
  }

  const diff    = lineDiff(prevNorm, todayNorm);
  const summary = buildDiffSummary(slug, prevDate, date, diff);

  console.log(JSON.stringify({ status: 'CHANGES_FOUND', ...summary }, null, 2));
  process.exit(0);
}

main();
