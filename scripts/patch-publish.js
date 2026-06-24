#!/usr/bin/env node
'use strict';
const fs = require('fs');

let src = fs.readFileSync('scripts/publish-article.js', 'utf8');

// ── 1. Add require('./header') ─────────────────────────────────────────────────
const REQ_OLD = "const fs   = require('fs');\r\nconst path = require('path');";
const REQ_NEW = "const fs   = require('fs');\r\nconst path = require('path');\r\nconst { buildHeader, buildSharedScript, buildHead } = require('./header');";
src = src.replace(REQ_OLD, REQ_NEW);
console.log('1. require:', src.includes("require('./header')") ? '✅' : '❌');

// ── 2. Replace buildIndex head block ───────────────────────────────────────────
// Find from the backtick return to end of </head>\r\n<body>
const RET_MARK = 'return `<!DOCTYPE html>';
const HEAD_END = '</head>\r\n<body>';
const si = src.indexOf(RET_MARK);
const ei = src.indexOf(HEAD_END, si) + HEAD_END.length;
console.log('2. buildIndex block:', si, '->', ei, si > 0 && ei > si ? '✅' : '❌');

const NEW_OPEN = 'return `<!DOCTYPE html>\n' +
  '<html lang="en" data-theme="dark" data-lang="en">\n' +
  '${buildHead(\n' +
  "  'Meta API Watch \u2014 SEEN V2 Changelog Tracker',\n" +
  "  'Daily tracker for Meta Developer API changes for SEEN V2.',\n" +
  "  'style.css'\n" +
  ')}\n' +
  '<body>\n\n' +
  '  ${buildHeader(\'\', \'changelog\')}\n';

src = src.slice(0, si) + NEW_OPEN + src.slice(ei);

// ── 3. Remove old <header class="site-header">...</header> ─────────────────────
const SH_OPEN = '  <header class="site-header">';
const SH_CLOSE = '  </header>';
const shOpen = src.indexOf(SH_OPEN);
if (shOpen > 0) {
  const shClose = src.indexOf(SH_CLOSE, shOpen) + SH_CLOSE.length;
  // Skip trailing \r\n
  const nextChar = src.slice(shClose, shClose + 2) === '\r\n' ? shClose + 2 : shClose;
  src = src.slice(0, shOpen) + src.slice(nextChar);
  console.log('3. old header removed: ✅');
} else {
  console.log('3. old header: ⚠️ not found');
}

// ── 4. Add buildSharedScript() before </body> in buildIndex ───────────────────
const SCRIPT_OLD = '  <script src="app.js"></script>\r\n</body>\r\n</html>`;\r\n}\r\n\r\n// \u2500\u2500 Read learn topics';
const SCRIPT_NEW = '  <script src="app.js"></script>\r\n  ${buildSharedScript()}\r\n</body>\r\n</html>`;\r\n}\r\n\r\n// \u2500\u2500 Read learn topics';
if (src.includes(SCRIPT_OLD)) {
  src = src.replace(SCRIPT_OLD, SCRIPT_NEW);
  console.log('4. buildSharedScript in buildIndex: ✅');
} else {
  console.log('4. buildSharedScript: ⚠️ old pattern not found');
}

// ── 5. Replace buildWelcome ────────────────────────────────────────────────────
const WEL_MARK = '// \u2500\u2500 Welcome / Landing Page';
const MAIN_MARK = '// \u2500\u2500 Main';
const wi = src.indexOf(WEL_MARK);
const mi = src.indexOf(MAIN_MARK);
console.log('5. buildWelcome block:', wi, '->', mi, wi > 0 && mi > wi ? '✅' : '❌');

const NEW_WELCOME =
`// \u2500\u2500 Welcome / Landing Page (clean hero) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function buildWelcome(articles, learnTopics) {
  const buildDate = new Date().toLocaleDateString('en-GB', {
    year:'numeric', month:'short', day:'numeric', timeZone:'Africa/Cairo'
  });
  const buildTime = new Date().toLocaleTimeString('en-US', {
    hour:'numeric', minute:'2-digit', hour12:true, timeZone:'Africa/Cairo'
  });
  const breaking = articles.filter(a=>a.meta.category==='Breaking Change').length;
  return \`<!DOCTYPE html>
<html lang="en" data-theme="dark" data-lang="en">
\${buildHead(
  'Meta API Watch \u2014 SEEN V2 Developer Hub',
  'Track every Meta API change. Learn every feature with validation rules. Built for SEEN V2.',
  'style.css'
)}
<body>

  \${buildHeader('', 'home')}

  <main class="welcome-page">
    <div class="welcome-container">
      <div class="welcome-badge">&#x1F52D; Meta API Watch</div>
      <h1 class="welcome-h1">
        <span data-en="Track Changes." data-ar="\u062a\u062a\u0628\u0651\u0639 \u0627\u0644\u062a\u063a\u064a\u064a\u0631\u0627\u062a.">Track Changes.</span><br>
        <span data-en="Master the API." data-ar="\u0623\u062a\u0642\u0646 \u0627\u0644\u0640 API.">Master the API.</span>
      </h1>
      <p class="welcome-desc"
         data-en="Every change Meta pushes to their developer docs. Every API feature explained with exact validation rules. Built for SEEN V2."
         data-ar="\u0643\u0644 \u062a\u063a\u064a\u064a\u0631 \u064a\u062f\u0641\u0639\u0647 Meta \u0644\u0648\u062b\u0627\u0626\u0642 \u0627\u0644\u0645\u0637\u0648\u0631\u064a\u0646. \u0643\u0644 \u0645\u064a\u0632\u0629 API \u0645\u0634\u0631\u0648\u062d\u0629 \u0628\u0642\u0648\u0627\u0639\u062f \u0627\u0644\u062a\u062d\u0642\u0642 \u0627\u0644\u062f\u0642\u064a\u0642\u0629. \u0645\u0628\u0646\u064a \u0644\u0640 SEEN V2.">Every change Meta pushes to their developer docs. Every API feature explained with exact validation rules. Built for SEEN V2.</p>
      <div class="welcome-stats">
        <div class="welcome-stat">
          <span class="welcome-stat-num">\${articles.length}</span>
          <span class="welcome-stat-label" data-en="Updates" data-ar="\u062a\u062d\u062f\u064a\u062b\u0627\u062a">Updates</span>
        </div>
        <div class="welcome-stat">
          <span class="welcome-stat-num">\${learnTopics.length}</span>
          <span class="welcome-stat-label" data-en="Learn Topics" data-ar="\u0645\u0648\u0636\u0648\u0639 \u062a\u0639\u0644\u064a\u0645\u064a">Learn Topics</span>
        </div>
        <div class="welcome-stat">
          <span class="welcome-stat-num">\${breaking}</span>
          <span class="welcome-stat-label" data-en="Breaking Changes" data-ar="\u062a\u063a\u064a\u064a\u0631\u0627\u062a \u062c\u0630\u0631\u064a\u0629">Breaking Changes</span>
        </div>
      </div>
      <div class="welcome-build">
        <span class="welcome-build-label" data-en="Last Updated" data-ar="\u0622\u062e\u0631 \u062a\u062d\u062f\u064a\u062b">Last Updated</span>
        <span>\${buildDate} &middot; \${buildTime} (Cairo)</span>
      </div>
      <div class="welcome-cta">
        <a href="changelog.html" class="cta-primary">
          <span data-en="&#x1F514; View Latest Updates" data-ar="&#x1F514; \u0622\u062e\u0631 \u0627\u0644\u062a\u062d\u062f\u064a\u062b\u0627\u062a">&#x1F514; View Latest Updates</span>
        </a>
        <a href="learn/index.html" class="cta-secondary">
          <span data-en="&#x1F4DA; Start Learning" data-ar="&#x1F4DA; \u0627\u0628\u062f\u0623 \u0627\u0644\u062a\u0639\u0644\u0645">&#x1F4DA; Start Learning</span>
        </a>
      </div>
    </div>
  </main>

  <footer class="site-footer">
    <p>
      Meta API Watch &middot; SEEN V2 &middot;
      <a href="changelog.html" data-en="Changelog" data-ar="\u0633\u062c\u0644 \u0627\u0644\u062a\u063a\u064a\u064a\u0631\u0627\u062a">Changelog</a> &middot;
      <a href="learn/index.html" data-en="Learn" data-ar="\u062a\u0639\u0644\u0651\u0645">Learn</a>
    </p>
  </footer>

  \${buildSharedScript()}
</body>
</html>\`;
}

`;

src = src.slice(0, wi) + NEW_WELCOME + src.slice(mi);

// ── Write ──────────────────────────────────────────────────────────────────────
fs.writeFileSync('scripts/publish-article.js', src, 'utf8');
console.log('✅ Done! File written.');
