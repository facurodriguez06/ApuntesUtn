const fs = require('fs');

let css = fs.readFileSync('app/globals.css', 'utf8');

// Inject the missing variables in light mode :root
if (!css.includes('--bg-card:')) {
  css = css.replace('--bg-warm: #FFFBF7;', '--bg-warm: #FFFBF7;\n  --bg-card: #FFFFFF;\n  --bg-cream: #F5F0EA;\n  --sage-text: #4A7A52;');
}

// Ensure dark mode block exists, if not create it
if (!css.includes(':root[class~="dark"]')) {
  const darkBlock = `
:root[class~="dark"] {
  --bg-warm: #181512;
  --bg-card: #201D1A;
  --bg-cream: #26221E;
  --sage-text: #E8F0EA;
  --sage: #7A9880;
  --text-primary: #EDE6DD;
  --text-secondary: #C8B9A6;
  --text-muted: #847C75;
  --border-soft: #302A25;
  --sage-light: #2A362D;
  --coral-light: #3D2620;
  --lavender-light: #282433;
  --sand-light: #383025;
  --sky-light: #1D2A33;
  --rose-light: #3A2323;
  --peach-light: #3D2D20;
  --mint-light: #1E382D;
}

.dark {
  color-scheme: dark;
}
.dark body {
  background-color: var(--bg-warm);
  color: var(--text-primary);
}
.dark .shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.5);
}
.dark .interactive-bg-pattern {
  opacity: 0.05 !important;
}
`;
  css += darkBlock;
}

fs.writeFileSync('app/globals.css', css);
