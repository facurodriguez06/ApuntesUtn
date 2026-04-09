const fs = require('fs');

let c = fs.readFileSync('app/carreras/[careerId]/materias/[id]/page.tsx','utf8');
c = c.replace(
  'className="inline-flex items-center gap-1 text-sm font-bold text-[var(--sage)] hover:text-[var(--sage-text)] transition-colors hover:underline underline-offset-2"',
  'className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold text-[var(--sage-text)] bg-[var(--bg-card)] border border-[var(--border-soft)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-cream)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all duration-300 active:scale-95 group/btn hover:-translate-y-0.5"'
);

// We should also replace the plus icon slightly
c = c.replace(
  '<Plus className="w-3.5 h-3.5" /> Subir nuevo',
  '<Plus className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> Subir nuevo'
);

fs.writeFileSync('app/carreras/[careerId]/materias/[id]/page.tsx', c);
