#!/usr/bin/env node
/**
 * Step 1 — Fetch & Snapshot Agent
 * Opens source URL via browser (not plain HTTP), extracts main content,
 * saves as dated markdown snapshot.
 *
 * Usage:
 *   node fetch-snapshot.js <source-slug> [--date YYYY-MM-DD]
 *
 * Environment:
 *   PIPELINE_DATE  override today's date (YYYY-MM-DD)
 */

const fs   = require('fs');
const path = require('path');

// ── Config ──────────────────────────────────────────────────────────────────
const ROOT        = path.resolve(__dirname, '..');
const SOURCES_FILE = path.join(ROOT, 'sources.json');
const SNAPSHOTS   = path.join(ROOT, 'snapshots');
const FAILURES    = path.join(ROOT, 'logs', 'failures.log');

// ── Helpers ──────────────────────────────────────────────────────────────────
function today() {
  const d = process.env.PIPELINE_DATE || new Date().toISOString().slice(0, 10);
  return d;
}

function logFailure(slug, url, reason) {
  const line = `[${new Date().toISOString()}] FETCH_FAIL slug=${slug} url=${url} reason=${reason}\n`;
  fs.appendFileSync(FAILURES, line);
  console.error(`❌ FETCH FAIL: ${reason}`);
}

function loadSources() {
  return JSON.parse(fs.readFileSync(SOURCES_FILE, 'utf8')).sources;
}

function snapshotPath(slug, date) {
  return path.join(SNAPSHOTS, slug, `${date}.md`);
}

// ── Main content extractor prompt (used by Antigravity browser subagent) ────
function buildBrowserPrompt(url, slug, date, outputPath) {
  return `
You are the Fetch & Snapshot Agent for Meta API Explain.

Task:
1. Open this URL using the browser tool (real browser rendering — NOT a plain HTTP request):
   ${url}

2. Wait for the page to fully render (including any client-side JavaScript).

3. Extract the MAIN CONTENT ONLY:
   - Include: changelog entries, version headings, feature descriptions, dates, API changes
   - Exclude: navigation menus, sidebars, footers, cookie banners, login prompts, ads
   - Preserve heading hierarchy (use ## for h2, ### for h3, etc.)
   - Preserve dates and version numbers exactly as shown

4. Convert the extracted content to clean Markdown.

5. At the top of the output, add this frontmatter block:
---
source_slug: ${slug}
source_url: ${url}
fetched_at: ${new Date().toISOString()}
snapshot_date: ${date}
---

6. Save the full Markdown content to this exact file path:
   ${outputPath}

7. If the page fails to load even with the browser tool:
   - Retry ONCE after 10 seconds
   - If it fails again, output the text: FETCH_FAILED: <reason>
   - Do NOT save a file in that case

Report back: "SNAPSHOT_SAVED: ${outputPath}" on success, or "FETCH_FAILED: <reason>" on failure.
`.trim();
}

// ── CLI ──────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const slugArg = args[0];
  const date = today();

  if (!slugArg) {
    console.error('Usage: node fetch-snapshot.js <source-slug>');
    process.exit(1);
  }

  const sources = loadSources();
  const source = sources.find(s => s.slug === slugArg);

  if (!source) {
    console.error(`Unknown slug: ${slugArg}`);
    console.error('Available slugs:', sources.map(s => s.slug).join(', '));
    process.exit(1);
  }

  if (!source.enabled) {
    console.log(`Source "${slugArg}" is disabled (phase ${source.phase}). Skipping.`);
    process.exit(0);
  }

  const outPath = snapshotPath(source.slug, date);

  // Don't re-fetch if we already have today's snapshot
  if (fs.existsSync(outPath)) {
    console.log(`✅ Snapshot already exists for ${date}: ${outPath}`);
    process.exit(0);
  }

  // Ensure output directory exists
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  console.log(`\n🔍 Fetching: ${source.name}`);
  console.log(`   URL:    ${source.url}`);
  console.log(`   Output: ${outPath}`);
  console.log(`\n── Browser Agent Prompt ──────────────────────────────────────`);
  console.log(buildBrowserPrompt(source.url, source.slug, date, outPath));
  console.log(`─────────────────────────────────────────────────────────────\n`);
  console.log('ACTION_REQUIRED: Run the above prompt via Antigravity browser tool.');
  console.log(`Expected output file: ${outPath}`);
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
