#!/usr/bin/env node
/**
 * backfill.js — Convert existing snapshot content into published articles
 *
 * Reads every snapshot file and parses each changelog entry into a
 * separate article in content/changelog/. Used to populate the site
 * with historical data on first run.
 *
 * Usage:
 *   node scripts/backfill.js                    (all enabled sources)
 *   node scripts/backfill.js whatsapp-changelog  (single source)
 *   node scripts/backfill.js --since 2026-01-01  (only entries from this date)
 *   node scripts/backfill.js --limit 20          (max N entries per source)
 *   node scripts/backfill.js --dry-run           (preview without writing)
 */

const fs   = require('fs');
const path = require('path');

const ROOT       = path.resolve(__dirname, '..');
const SOURCES    = JSON.parse(fs.readFileSync(path.join(ROOT, 'sources.json'), 'utf8')).sources;
const SNAPSHOTS  = path.join(ROOT, 'snapshots');
const CONTENT    = path.join(ROOT, 'content', 'changelog');

// ── CLI args ─────────────────────────────────────────────────────────────────
const args     = process.argv.slice(2);
const dryRun   = args.includes('--dry-run');
const sinceIdx = args.indexOf('--since');
const sinceArg = sinceIdx >= 0 ? args[sinceIdx + 1] : null;
const limitIdx = args.indexOf('--limit');
const limitArg = limitIdx >= 0 ? parseInt(args[limitIdx + 1]) || 999 : 999;
// slugArg: first non-flag, non-value arg
const flagValues = new Set([sinceArg, limitIdx >= 0 ? args[limitIdx + 1] : null].filter(Boolean));
const slugArg  = args.find(a => !a.startsWith('--') && !flagValues.has(a)) || null;


// ── Tag → Category mapping ────────────────────────────────────────────────────
function detectCategory(text, tags) {
  const t = (text + ' ' + tags).toLowerCase();
  if (/no longer supported|removed|deprecated|deprecat/i.test(t)) return 'Deprecation';
  if (/pricing|rate card|billing|currency|rates|price/i.test(t))  return 'Pricing/Rate Limit';
  if (/error code|corrected|fixed the|fix|bug/i.test(t))           return 'Bug Fix/Clarification';
  if (/breaking|must update|migration required/i.test(t))          return 'Breaking Change';
  if (/policy|tos|terms of service|compliance|enforcement/i.test(t)) return 'Policy/Compliance';
  return 'New Feature';
}

// ── Tag → SV2 Modules mapping ─────────────────────────────────────────────────
function detectModules(text, tags, sourceSlug) {
  const t = (text + ' ' + tags).toLowerCase();
  const mods = new Set();

  if (/template|hsm|message template|coupon|carousel|authentication template/i.test(t)) mods.add('WhatsApp Templates');
  if (/marketing message|broadcast|campaign|mm lite|marketing_message/i.test(t))         mods.add('Broadcasts');
  if (/embedded signup|oauth|channel|onboarding|in-app signup/i.test(t))                 mods.add('Channel Integration/OAuth');
  if (/webhook|account_update|status message|subscription/i.test(t))                     mods.add('Webhooks');
  if (/instagram|messenger api for instagram/i.test(t))                                  mods.add('Instagram Messaging');
  if (/messenger/i.test(t) || sourceSlug === 'messenger-changelog')                      mods.add('Messenger');
  if (/billing|rate card|pricing|currency|payment/i.test(t))                             mods.add('Billing');
  if (/rbac|permission|role|access|admin/i.test(t))                                      mods.add('RBAC');

  // Default: at least tag the source's primary modules
  if (mods.size === 0) {
    if (sourceSlug === 'whatsapp-changelog') mods.add('WhatsApp Templates');
    if (sourceSlug === 'messenger-changelog') mods.add('Messenger');
  }

  return [...mods];
}

// ── Parse a snapshot into individual entries ──────────────────────────────────
function parseSnapshot(content, sourceSlug, sourceMeta) {
  // Remove frontmatter
  const body = content.replace(/^---[\s\S]*?---\n/, '').trim();

  // Split by horizontal rule (---)
  const rawEntries = body.split(/\n---\n/);
  const entries = [];

  for (const raw of rawEntries) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    // Find the date heading (## Month DD, YYYY)
    const dateMatch = trimmed.match(/^##\s+((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4})/m);
    if (!dateMatch) continue;

    const rawDate  = dateMatch[1]; // e.g. "June 12, 2026"
    const isoDate  = new Date(rawDate).toISOString().slice(0, 10);
    if (isNaN(new Date(isoDate))) continue;
    if (sinceArg && isoDate < sinceArg) continue;

    // Extract tags line
    const tagsMatch = trimmed.match(/Tags?:\s*\*([^*\n]+)\*/i);
    const tagsRaw   = tagsMatch ? tagsMatch[1] : '';
    const tags      = tagsRaw.split(',').map(t => t.replace(/\*/g, '').trim()).filter(Boolean);

    // Get body text (everything after the first Tags: line or after the heading)
    let bodyText = trimmed
      .replace(/^##[^\n]+\n/, '')               // remove date heading
      .replace(/^[A-Z][^\n]*\n/gm, (m) => {    // remove section titles (non-Tags lines)
        return /^Tags?:/i.test(m) ? m : '';
      })
      .replace(/Tags?:\s*\*[^*\n]+\*/gi, '')    // remove tag lines
      .replace(/!\[image\]\([^)]+\)/g, '')       // remove image markdown
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!bodyText || bodyText.length < 20) continue;

    // Generate title from first sentence of body
    const firstSentence = bodyText
      .replace(/\[[^\]]+\]\([^)]+\)/g, (m) => m.match(/\[([^\]]+)\]/)?.[1] || m) // flatten links
      .split(/[.!?]/)[0]
      .replace(/\n/g, ' ')
      .trim()
      .slice(0, 90);

    const category  = detectCategory(bodyText, tagsRaw);
    const sv2modules = detectModules(bodyText, tagsRaw, sourceSlug);
    const summary   = bodyText.replace(/\[[^\]]+\]\([^)]+\)/g, (m) => m.match(/\[([^\]]+)\]/)?.[1] || m)
                               .replace(/`([^`]+)`/g, '$1')
                               .replace(/\*\*([^*]+)\*\*/g, '$1')
                               .replace(/\n/g, ' ')
                               .trim()
                               .slice(0, 400);

    entries.push({
      isoDate,
      rawDate,
      tags,
      title: firstSentence,
      category,
      sv2_modules: sv2modules,
      summary_short: summary.slice(0, 140),
      summary,
      body: bodyText,
      source_slug: sourceSlug,
      source_name: sourceMeta.name,
      source_url:  sourceMeta.url,
    });
  }

  // Sort newest first
  return entries.sort((a, b) => b.isoDate.localeCompare(a.isoDate));
}

// ── Slugify ───────────────────────────────────────────────────────────────────
function slugify(text) {
  return text.toLowerCase()
    .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 60).replace(/-$/, '');
}

// ── Write article markdown ────────────────────────────────────────────────────
function writeArticle(entry) {
  const slug     = slugify(entry.title);
  const filename = `${entry.isoDate}-${entry.source_slug}-${slug}.md`;
  const destPath = path.join(CONTENT, filename);

  if (fs.existsSync(destPath)) return { filename, skipped: true };

  const mods = entry.sv2_modules.join(', ');
  const content = `---
title: ${entry.title}
date: ${entry.isoDate}
source_slug: ${entry.source_slug}
source_name: ${entry.source_name}
source_url: ${entry.source_url}
category: ${entry.category}
sv2_modules: [${mods}]
summary_short: ${entry.summary_short}
audit_corrections: backfill (historical entry, not diff-detected)
---

## Summary

${entry.summary}

## Why it Matters for SV2

${entry.category === 'Pricing/Rate Limit' ? 'Billing module may need to reflect updated rates. Verify cost assumptions in Broadcasts for affected markets.' :
  entry.category === 'Breaking Change'    ? 'Review the change carefully — integration points for ' + mods + ' may be affected.' :
  entry.category === 'Deprecation'        ? 'Check whether SEEN V2 relies on the deprecated feature. Plan migration before end-of-life.' :
  'Monitor ' + mods + ' integration for any behavioural impact.'}

## Suggested QA Action

${entry.category === 'Pricing/Rate Limit' ? 'Verify rate card assumptions in Billing module test cases.' :
  entry.category === 'Breaking Change'    ? 'Regression test ' + mods + ' integration flows.' :
  entry.category === 'Deprecation'        ? 'Audit usage of deprecated API/feature in SEEN V2 codebase.' :
  'Informational — no immediate action required. Monitor in future test runs.'}

## Source Details

- **Source**: [${entry.source_name}](${entry.source_url})
- **Original date**: ${entry.rawDate}
- **Tags**: ${entry.tags.join(', ') || 'N/A'}

---
*Backfilled from snapshot on ${new Date().toISOString().slice(0, 10)}.*
`;

  fs.writeFileSync(destPath, content, 'utf8');
  return { filename, skipped: false };
}

// ── Main ──────────────────────────────────────────────────────────────────────
function main() {
  fs.mkdirSync(CONTENT, { recursive: true });

  const sources = SOURCES.filter(s => s.enabled && (!slugArg || s.slug === slugArg));

  if (sources.length === 0) {
    console.error(`No enabled sources found${slugArg ? ` for slug "${slugArg}"` : ''}.`);
    process.exit(1);
  }

  let totalWritten = 0, totalSkipped = 0;

  for (const source of sources) {
    const snapshotDir = path.join(SNAPSHOTS, source.slug);
    if (!fs.existsSync(snapshotDir)) {
      console.log(`⚠️  No snapshots found for ${source.slug} — run the pipeline first.`);
      continue;
    }

    // Use the latest snapshot
    const files = fs.readdirSync(snapshotDir).filter(f => f.endsWith('.md')).sort();
    if (files.length === 0) { console.log(`⚠️  No snapshot files in ${source.slug}.`); continue; }

    const latestFile    = files[files.length - 1];
    const snapshotPath  = path.join(snapshotDir, latestFile);
    const snapshotContent = fs.readFileSync(snapshotPath, 'utf8');

    console.log(`\n📄 ${source.name}`);
    console.log(`   Snapshot: ${latestFile}`);

    const entries = parseSnapshot(snapshotContent, source.slug, source).slice(0, limitArg);
    console.log(`   Found ${entries.length} entries`);

    let written = 0, skipped = 0;
    for (const entry of entries) {
      if (dryRun) {
        console.log(`   [DRY] ${entry.isoDate} — ${entry.category} — ${entry.title.slice(0,60)}`);
        written++;
        continue;
      }
      const result = writeArticle(entry);
      if (result.skipped) { skipped++; }
      else {
        console.log(`   ✅ ${entry.isoDate} — ${entry.category.padEnd(22)} ${entry.title.slice(0,55)}`);
        written++;
      }
    }

    totalWritten += written;
    totalSkipped += skipped;
    console.log(`   → Wrote: ${written}, Skipped (already exist): ${skipped}`);
  }

  console.log(`\n${'─'.repeat(60)}`);
  if (dryRun) {
    console.log(`DRY RUN complete. Would write ${totalWritten} articles.`);
  } else {
    console.log(`✅ Backfill complete: ${totalWritten} articles written, ${totalSkipped} skipped.`);
    if (totalWritten > 0) {
      console.log(`\nNext step: rebuild the site`);
      console.log(`  node scripts/publish-article.js --rebuild-only`);
    }
  }
}

main();
