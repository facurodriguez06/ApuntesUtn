const fs = require('fs');

let c = fs.readFileSync('app/carreras/[careerId]/materias/[id]/page.tsx','utf8');
const search = `                let wrapperClass = "border-[#EDE6DD] bg-[#FCFAF8] open:bg-white";
                let textClass = "text-[#4A433C]";`;
const replace = `                let buttonHex = yc.accent;
                if (isCreatorFolder) buttonHex = "#D4AF37";
                else if (customStyleFolder) buttonHex = customStyleFolder.color;

                let wrapperClass = "border-[#EDE6DD] bg-[#FCFAF8] open:bg-white";
                let textClass = "text-[#4A433C]";`;
c = c.replace(search, replace);

const btnSearch = `<BulkDownloadButton notes={group.notes} label="Descargar" compact={true} />`;
const btnReplace = `<BulkDownloadButton notes={group.notes} label="Descargar" compact={true} customHex={buttonHex} />`;
c = c.replace(btnSearch, btnReplace);

fs.writeFileSync('app/carreras/[careerId]/materias/[id]/page.tsx', c);

// BulkDownloadButton.tsx
let btnContent = fs.readFileSync('components/BulkDownloadButton.tsx', 'utf8');

// replace interface
btnContent = btnContent.replace(
  `export function BulkDownloadButton({ notes, label = "Descargar todo", compact = false }: { notes: Note[]; label?: string; compact?: boolean }) {`,
  `export function BulkDownloadButton({ notes, label = "Descargar todo", compact = false, customHex }: { notes: Note[]; label?: string; compact?: boolean; customHex?: string }) {`
);

// replace className logic
const oldStyleClass = `className=\`inline-flex items-center justify-center transition-all duration-300 active:scale-95 rounded-lg border group/btn
        \${compact ? "px-2.5 py-1.5 text-[11px] font-bold gap-1.5" : "px-3 py-2 text-sm font-semibold gap-2"}
        \${downloading 
          ? "bg-[var(--sage-light)] text-[var(--sage-text)] border-[var(--sage-light)] opacity-70 cursor-not-allowed" 
          : "bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-warm)] shadow-sm text-[var(--text-secondary)] border-[var(--border-soft)] hover:from-[var(--bg-cream)] hover:to-[var(--bg-warm)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)] hover:-translate-y-0.5 hover:shadow-md"}
      \``;

const newStyleClass = `className={\`inline-flex items-center justify-center transition-all duration-300 active:scale-95 rounded-lg border group/btn
        \${compact ? "px-2.5 py-1.5 text-[11px] font-bold gap-1.5" : "px-3 py-2 text-sm font-semibold gap-2"}
        \${downloading 
          ? "bg-[var(--sage-light)] text-[var(--sage-text)] border-[var(--sage-light)] opacity-70 cursor-not-allowed" 
          : (compact && customHex)
            ? "text-[color:var(--dynamic-color)] bg-[color:var(--dynamic-bg)] border-[color:var(--dynamic-border)] hover:bg-[color:var(--dynamic-hover)] hover:border-[color:var(--dynamic-color)] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
            : "bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-warm)] shadow-sm text-[var(--text-secondary)] border-[var(--border-soft)] hover:from-[var(--bg-cream)] hover:to-[var(--bg-warm)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)] hover:-translate-y-0.5 hover:shadow-md"}
      \`}
      style={compact && customHex && !downloading ? {
        "--dynamic-color": customHex,
        "--dynamic-bg": \`\${customHex}18\`,
        "--dynamic-border": \`\${customHex}40\`,
        "--dynamic-hover": \`\${customHex}25\`,
      } as React.CSSProperties : undefined}`;

btnContent = btnContent.replace(oldStyleClass, newStyleClass);
fs.writeFileSync('components/BulkDownloadButton.tsx', btnContent);
