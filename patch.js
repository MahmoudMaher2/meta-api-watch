const fs = require('fs');

// Fix header.js
let header = fs.readFileSync('scripts/header.js', 'utf-8');
header = header.replace(/el\.textContent\s*=\s*el\.getAttribute\(l==='ar'\?'data-ar':'data-en'\);/g, `var val = el.getAttribute(l==='ar'?'data-ar':'data-en');
      if (el.tagName==='INPUT' || el.tagName==='TEXTAREA') {
        el.placeholder = val;
      } else {
        el.innerHTML = val;
      }`);
fs.writeFileSync('scripts/header.js', header, 'utf-8');

// Fix style.css
let style = fs.readFileSync('site/style.css', 'utf-8');
style = style.replace(/\/\* Last Build Time badge \*\/[\s\S]*?\}\s*\.build-icon[^\n]*\n\.build-label[\s\S]*?\}\s*\.build-value[\s\S]*?\}/, `/* Last Build Time badge */
.header-build-time {
  display:       flex;
  align-items:   center;
  gap:           6px;
  background:    rgba(99,102,241,0.08);
  border:        1px solid rgba(99,102,241,0.2);
  border-radius: 50px;
  padding:       6px 14px 6px 10px;
  flex-shrink:   0;
  backdrop-filter: blur(8px);
}
.build-icon { font-size: .9rem; line-height: 1; }
.build-label {
  font-size:   .65rem;
  font-weight: 700;
  color:       var(--accent);
  text-transform: uppercase;
  letter-spacing: .05em;
  white-space: nowrap;
}
.build-value {
  font-size:   .75rem;
  font-weight: 600;
  color:       var(--text);
  white-space: nowrap;
  font-family: 'JetBrains Mono', monospace;
}`);

style = style.replace(/\[data-lang="ar"\] \.header-inner \{ flex-direction: row-reverse; \}\s*\[data-lang="ar"\] \.header-nav\s*\{ flex-direction: row-reverse; \}/, '/* RTL header handled natively by HTML dir="rtl" */');

fs.writeFileSync('site/style.css', style, 'utf-8');
console.log('Patch applied successfully.');
