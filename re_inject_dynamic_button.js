const fs = require('fs');

let c = fs.readFileSync('components/BulkDownloadButton.tsx', 'utf8');

const regex = /className=\{\`inline-flex items-[^`]+\`\}/;

const newStyle = `className={\`inline-flex items-center justify-center transition-all duration-300 active:scale-95 rounded-lg border group/btn
        \${compact ? "px-2.5 py-1.5 text-[11px] font-bold gap-1.5" : "px-3 py-2 text-sm font-semibold gap-2"}
        \${downloading 
          ? "bg-[var(--sage-light)] text-[var(--sage-text)] border-[var(--sage-light)] opacity-70 cursor-not-allowed" 
          : (compact && customHex)
            ? "text-[color:var(--dynamic-color)] bg-[color:var(--dynamic-bg)] border-[color:var(--dynamic-border)] hover:bg-[color:var(--dynamic-hover)] hover:border-[color:var(--dynamic-color)] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
            : "bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-warm)] shadow-sm text-[var(--text-secondary)] border-[var(--border-soft)] hover:from-[var(--bg-cream)] hover:to-[var(--bg-warm)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)] hover:-translate-y-0.5 hover:shadow-md"}
      \`}
      style={compact && customHex && !downloading ? {
        "--dynamic-color": customHex,
        "--dynamic-bg": \`\${customHex}\` + "1A", // 10% opacity in hex
        "--dynamic-border": \`\${customHex}\` + "40", // 25% opacity
        "--dynamic-hover": \`\${customHex}\` + "26" // 15% opacity
      } as React.CSSProperties : undefined}`;

c = c.replace(regex, newStyle);
fs.writeFileSync('components/BulkDownloadButton.tsx', c);
