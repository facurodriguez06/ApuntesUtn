const fs = require('fs');

// 1. BulkDownloadButton
let file1 = 'components/BulkDownloadButton.tsx';
let c1 = fs.readFileSync(file1, 'utf8');
const search1 = 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-soft)] hover:bg-[var(--bg-cream)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]';
const replace1 = 'bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-warm)] shadow-sm text-[var(--text-secondary)] border-[var(--border-soft)] hover:from-[var(--bg-cream)] hover:to-[var(--bg-warm)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)] hover:-translate-y-0.5 hover:shadow-md';

c1 = c1.replace(search1, replace1);
fs.writeFileSync(file1, c1);


// 2. Subir Nuevo
let file2 = 'app/carreras/[careerId]/materias/[id]/page.tsx';
let c2 = fs.readFileSync(file2, 'utf8');
const search2 = 'bg-[var(--bg-card)] border border-[var(--border-soft)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-cream)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all duration-300 active:scale-95 group/btn hover:-translate-y-0.5';
const replace2 = 'bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-warm)] shadow-sm border border-[var(--border-soft)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:from-[var(--bg-cream)] hover:to-[var(--bg-warm)] hover:shadow-md transition-all duration-300 active:scale-95 group/btn hover:-translate-y-0.5';

c2 = c2.replace(search2, replace2);
fs.writeFileSync(file2, c2);
