#!/usr/bin/env node
/**
 * scripts/ci-cron.js — Headless Fetch & Diff for GitHub Actions
 * 
 * This script runs in the daily cron job. It attempts to fetch enabled sources using
 * standard HTTP fetch. If successful, it saves the snapshot and runs the diff.
 * If a diff is found, it logs it so GitHub Actions can open an issue.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SOURCES_FILE = path.join(ROOT, 'sources.json');
const SNAPSHOTS_DIR = path.join(ROOT, 'snapshots');
const DATE = new Date().toISOString().slice(0, 10);

async function fetchSource(source) {
  try {
    console.log(`\nFetching ${source.name}...`);
    const res = await fetch(source.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MetaAPIWatch/1.0'
      }
    });
    
    if (!res.ok) {
      console.log(`❌ Failed: HTTP ${res.status}`);
      return false;
    }
    
    const html = await res.text();
    // Very basic fallback extraction if no browser is available.
    // Meta docs often return a React skeleton, but some content is embedded in JSON.
    // For a robust pipeline, Playwright/Puppeteer is recommended.
    const snapshotContent = `---
source_slug: ${source.slug}
source_url: ${source.url}
fetched_at: ${new Date().toISOString()}
snapshot_date: ${DATE}
note: "Fetched via CI cron (raw HTML/text fallback)"
---

${html.substring(0, 10000)}... (Truncated RAW HTML for Diffing)
`;

    const snapDir = path.join(SNAPSHOTS_DIR, source.slug);
    fs.mkdirSync(snapDir, { recursive: true });
    fs.writeFileSync(path.join(snapDir, `${DATE}.md`), snapshotContent);
    console.log(`✅ Snapshot saved`);
    return true;
  } catch (err) {
    console.log(`❌ Error: ${err.message}`);
    return false;
  }
}

async function main() {
  const sources = JSON.parse(fs.readFileSync(SOURCES_FILE, 'utf8')).sources.filter(s => s.enabled);
  let changesDetected = [];

  for (const source of sources) {
    const snapDir = path.join(SNAPSHOTS_DIR, source.slug);
    const snapFile = path.join(snapDir, `${DATE}.md`);
    
    if (!fs.existsSync(snapFile)) {
      await fetchSource(source);
    }
    
    // Run diff
    if (fs.existsSync(snapFile)) {
      try {
        console.log(`Running diff for ${source.slug}...`);
        execSync(`node scripts/diff-snapshots.js ${source.slug}`, { cwd: ROOT });
        console.log(`   No changes.`);
      } catch (err) {
        if (err.status === 1) {
          console.log(`   🚨 CHANGES DETECTED!`);
          changesDetected.push(source.name);
        } else if (err.status === 3) {
          console.log(`   Baseline established.`);
        } else {
          console.log(`   Diff error: ${err.message}`);
        }
      }
    }
  }

  if (changesDetected.length > 0) {
    console.log(`\n\n::set-output name=has_changes::true`);
    console.log(`::set-output name=changed_sources::${changesDetected.join(', ')}`);
  } else {
    console.log(`\n\n::set-output name=has_changes::false`);
  }
}

main();
