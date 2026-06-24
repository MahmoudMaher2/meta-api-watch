#!/usr/bin/env node
'use strict';
const fs = require('fs');
let src = fs.readFileSync('scripts/build-learn.js', 'utf8');

// ── Fix buildIndex head ───────────────────────────────────────────────────────
const idx1 = src.lastIndexOf("return `<!DOCTYPE html>");
const HEAD_END = '</head>\n<body>';
const idx2 = src.indexOf(HEAD_END, idx1);
if (idx1 < 0 || idx2 < 0) { console.log('❌ buildIndex not found'); process.exit(1); }

const NEW_IDX_OPEN =
  'return `<!DOCTYPE html>\n' +
  '<html lang="en" data-theme="dark" data-lang="en">\n' +
  '${buildHead(\n' +
  "  'Meta Docs Learn \u2014 WhatsApp & Messenger API Reference',\n" +
  "  'Learn every Meta API feature with exact validation rules, error codes, and CRUD examples.',\n" +
  "  '../style.css'\n" +
  ')}\n' +
  '<body>\n\n' +
  "  ${buildHeader('../', 'learn')}\n";

src = src.slice(0, idx1) + NEW_IDX_OPEN + src.slice(idx2 + HEAD_END.length);
console.log('✅ buildIndex head replaced');

// ── Remove old learn-header from buildIndex ───────────────────────────────────
const LH_OPEN  = '  <header class="learn-header">';
const LH_CLOSE = '  </header>';
const lhStart  = src.lastIndexOf(LH_OPEN);
if (lhStart > 0) {
  const lhEnd = src.indexOf(LH_CLOSE, lhStart) + LH_CLOSE.length;
  // skip trailing newline
  const skip = src[lhEnd] === '\n' ? 1 : 0;
  src = src.slice(0, lhStart) + src.slice(lhEnd + skip);
  console.log('✅ old index header removed');
} else {
  console.log('⚠️  old index header: not found');
}

// ── Fix index CSS/JS copy block ───────────────────────────────────────────────
const CSS_COPY =
  "  // Copy CSS + JS from content-learn if not in site/learn\n" +
  "  const cssSource = path.join(ROOT, 'learn', 'style.css');\n" +
  "  const jsSource  = path.join(ROOT, 'learn', 'app.js');\n" +
  "  const cssDest   = path.join(LEARN_DIR, 'style.css');\n" +
  "  const jsDest    = path.join(LEARN_DIR, 'app.js');\n" +
  "  if (fs.existsSync(cssSource)) fs.copyFileSync(cssSource, cssDest);\n" +
  "  if (fs.existsSync(jsSource))  fs.copyFileSync(jsSource,  jsDest);\n";

if (src.includes(CSS_COPY)) {
  src = src.replace(CSS_COPY, '  // CSS served from site/style.css (shared header)\n');
  console.log('✅ CSS copy block removed');
} else {
  console.log('⚠️  CSS copy block: not found');
}

// ── Fix index script ──────────────────────────────────────────────────────────
const IDX_SCRIPT_OLD = "  <script src=\"app.js\"></script>\n</body>";
const IDX_SCRIPT_NEW = "  \${buildSharedScript()}\n</body>";
if (src.includes(IDX_SCRIPT_OLD)) {
  src = src.replace(IDX_SCRIPT_OLD, IDX_SCRIPT_NEW);
  console.log('✅ index script replaced');
} else {
  console.log('⚠️  index script: not found');
}

fs.writeFileSync('scripts/build-learn.js', src, 'utf8');
console.log('\n✅ Done!');
