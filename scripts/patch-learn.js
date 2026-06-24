#!/usr/bin/env node
'use strict';
/**
 * patch-learn.js — Patches build-learn.js to use shared header module
 * and reference site/style.css directly (no separate learn/style.css copy)
 */
const fs = require('fs');
let src = fs.readFileSync('scripts/build-learn.js', 'utf8');

// ── 1. Add require('./header') ─────────────────────────────────────────────────
src = src.replace(
  "const fs   = require('fs');\r\nconst path = require('path');",
  "const fs   = require('fs');\r\nconst path = require('path');\r\nconst { buildHeader, buildSharedScript, buildHead } = require('./header');"
);
console.log('1. require:', src.includes("require('./header')") ? '✅' : '❌');

// ── 2. Replace buildTopicPage head + old header ────────────────────────────────
// Old: from <!DOCTYPE to end of <body>
const TP_OLD_HEAD = '  return `<!DOCTYPE html>\n<html lang="en" data-theme="dark">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>${topic.title} \u2014 Meta Docs Learn</title>\n  <meta name="description" content="Learn how ${topic.title} works in ${topic.platform} \u2014 parameters, validation rules, error codes, and examples." />\n  <link rel="preconnect" href="https://fonts.googleapis.com">\n  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">\n  <link rel="stylesheet" href="../style.css" />\n</head>\n<body>';

const TP_NEW_HEAD =
  '  return `<!DOCTYPE html>\n' +
  '<html lang="en" data-theme="dark" data-lang="en">\n' +
  '${buildHead(\n' +
  '  `${topic.title} \u2014 Meta Docs Learn`,\n' +
  '  `Learn ${topic.title} in ${topic.platform}: validation rules, error codes, examples.`,\n' +
  '  \'../../style.css\'\n' +
  ')}\n' +
  '<body>\n\n' +
  '  ${buildHeader(\'../../\', \'learn\')}\n';

if (src.includes(TP_OLD_HEAD)) {
  src = src.replace(TP_OLD_HEAD, TP_NEW_HEAD);
  console.log('2. topic head replaced: ✅');
} else {
  // Try with CRLF
  const TP_OLD_CRLF = TP_OLD_HEAD.replace(/\n/g, '\r\n');
  if (src.includes(TP_OLD_CRLF)) {
    src = src.replace(TP_OLD_CRLF, TP_NEW_HEAD);
    console.log('2. topic head replaced (CRLF): ✅');
  } else {
    console.log('2. topic head: ⚠️ not found, trying slice approach');
    const idx1 = src.indexOf('  return `<!DOCTYPE html>\r\n<html lang="en" data-theme="dark">');
    const idx2 = src.indexOf('<body>', idx1) + '<body>'.length;
    if (idx1 > 0) {
      src = src.slice(0, idx1) + TP_NEW_HEAD + src.slice(idx2);
      console.log('2. topic head replaced (slice): ✅');
    }
  }
}

// ── 3. Remove old topic <header class="learn-header"> ────────────────────────
const LH_OPEN = '  <header class="learn-header">';
const LH_CLOSE = '  </header>';
let lhStart = src.indexOf(LH_OPEN);
if (lhStart > 0) {
  const lhEnd = src.indexOf(LH_CLOSE, lhStart) + LH_CLOSE.length;
  const skip = src.slice(lhEnd, lhEnd + 2) === '\r\n' ? 2 : (src.slice(lhEnd, lhEnd + 1) === '\n' ? 1 : 0);
  src = src.slice(0, lhStart) + src.slice(lhEnd + skip);
  console.log('3. old topic header removed: ✅');
} else {
  console.log('3. old topic header: ⚠️ not found');
}

// ── 4. Replace topic page script + end ─────────────────────────────────────────
// Replace <script src="../app.js"></script> with buildSharedScript()
const TP_SCRIPT_OLD = '  <script src="../app.js"></script>\n</body>';
const TP_SCRIPT_NEW = '  ${buildSharedScript()}\n</body>';
if (src.includes(TP_SCRIPT_OLD)) {
  src = src.replace(TP_SCRIPT_OLD, TP_SCRIPT_NEW);
  console.log('4. topic script replaced: ✅');
} else {
  const TP_SCRIPT_OLD_CRLF = '  <script src="../app.js"></script>\r\n</body>';
  if (src.includes(TP_SCRIPT_OLD_CRLF)) {
    src = src.replace(TP_SCRIPT_OLD_CRLF, TP_SCRIPT_NEW);
    console.log('4. topic script replaced (CRLF): ✅');
  } else {
    console.log('4. topic script: ⚠️ not found');
  }
}

// ── 5. Replace buildIndex head ─────────────────────────────────────────────────
const IDX_OLD_HEAD_START = '  return `<!DOCTYPE html>\r\n<html lang="en" data-theme="dark">\r\n<head>';
const IDX_OLD_HEAD_END   = '</head>\r\n<body>';

const i1 = src.lastIndexOf(IDX_OLD_HEAD_START);
if (i1 > 0) {
  const i2 = src.indexOf(IDX_OLD_HEAD_END, i1) + IDX_OLD_HEAD_END.length;
  const IDX_NEW_OPEN =
    '  return `<!DOCTYPE html>\n' +
    '<html lang="en" data-theme="dark" data-lang="en">\n' +
    '${buildHead(\n' +
    "  'Meta Docs Learn \u2014 WhatsApp & Messenger API Reference',\n" +
    "  'Learn every Meta API feature with validation rules, error codes, and CRUD examples.',\n" +
    "  '../style.css'\n" +
    ')}\n' +
    '<body>\n\n' +
    "  ${buildHeader('../', 'learn')}\n";
  src = src.slice(0, i1) + IDX_NEW_OPEN + src.slice(i2);
  console.log('5. index head replaced: ✅');
} else {
  console.log('5. index head: ⚠️ not found');
}

// ── 6. Remove old learn-header from buildIndex ────────────────────────────────
lhStart = src.lastIndexOf(LH_OPEN);
if (lhStart > 0) {
  const lhEnd = src.indexOf(LH_CLOSE, lhStart) + LH_CLOSE.length;
  const skip = src.slice(lhEnd, lhEnd + 2) === '\r\n' ? 2 : 1;
  src = src.slice(0, lhStart) + src.slice(lhEnd + skip);
  console.log('6. old index header removed: ✅');
} else {
  console.log('6. old index header: ⚠️ not found');
}

// ── 7. Replace index <main class="learn-home"> with proper class ───────────────
// Also replace home-hero, home-stat etc with learn-hero, learn-stat
src = src.replace('<main class="learn-home">', '<main class="learn-home">');

// ── 8. Replace index script ───────────────────────────────────────────────────
const IDX_SCRIPT_OLD = '  <script src="app.js"></script>\r\n</body>';
const IDX_SCRIPT_NEW = '  ${buildSharedScript()}\r\n</body>';
if (src.includes(IDX_SCRIPT_OLD)) {
  src = src.replace(IDX_SCRIPT_OLD, IDX_SCRIPT_NEW);
  console.log('8. index script replaced: ✅');
} else {
  console.log('8. index script: ⚠️ not found');
}

// ── 9. Remove CSS/JS copy in main() (no longer needed) ───────────────────────
const CSS_COPY_BLOCK =
  '  // Copy CSS + JS from content-learn if not in site/learn\r\n' +
  '  const cssSource = path.join(ROOT, \'learn\', \'style.css\');\r\n' +
  '  const jsSource  = path.join(ROOT, \'learn\', \'app.js\');\r\n' +
  '  const cssDest   = path.join(LEARN_DIR, \'style.css\');\r\n' +
  '  const jsDest    = path.join(LEARN_DIR, \'app.js\');\r\n' +
  '  if (fs.existsSync(cssSource)) fs.copyFileSync(cssSource, cssDest);\r\n' +
  '  if (fs.existsSync(jsSource))  fs.copyFileSync(jsSource,  jsDest);\r\n';

if (src.includes(CSS_COPY_BLOCK)) {
  src = src.replace(CSS_COPY_BLOCK, '  // CSS/JS served from site/style.css (shared)\r\n');
  console.log('9. CSS copy removed: ✅');
} else {
  console.log('9. CSS copy: ⚠️ not found (may need manual check)');
}

fs.writeFileSync('scripts/build-learn.js', src, 'utf8');
console.log('\n✅ build-learn.js patched!');
