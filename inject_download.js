const fs = require('fs');
const FILE_PATH = 'app/carreras/[careerId]/materias/[id]/page.tsx';

let content = fs.readFileSync(FILE_PATH, 'utf8');

// 1. Add import
if (!content.includes('BulkDownloadButton')) {
  content = content.replace(
    'import { DocumentListItem } from "@/components/DocumentListItem";',
    'import { DocumentListItem } from "@/components/DocumentListItem";\nimport { BulkDownloadButton } from "@/components/BulkDownloadButton";'
  );
}

// 2. Replace the Subir nuevo segment
const oldSubirNuevoBlock = `<div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--sage)]" />
            Apuntes
            <span className={\`text-xs font-bold px-2.5 py-0.5 rounded-full \${yc.bg} \${yc.text}\`}>{notesCount}</span>
          </h2>

          <Link
            href={\`/upload?carrera=\${career.id}&materia=\${subject.id}&anio=\${subject.year}\`}
            className="inline-flex items-center gap-1 text-sm font-bold text-[var(--sage)] hover:text-[var(--sage-text)] transition-colors hover:underline underline-offset-2"
          >
            <Plus className="w-3.5 h-3.5" /> Subir nuevo
          </Link>
        </div>`;
        
const newSubirNuevoBlock = `<div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--sage)]" />
            Apuntes
            <span className={\`text-xs font-bold px-2.5 py-0.5 rounded-full \${yc.bg} \${yc.text}\`}>{notesCount}</span>
          </h2>

          <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
            {displayNotes.length > 0 && (
              <BulkDownloadButton notes={displayNotes} label="Descargar todos" />
            )}
            <Link
              href={\`/upload?carrera=\${career.id}&materia=\${subject.id}&anio=\${subject.year}\`}
              className="inline-flex items-center gap-1 text-sm font-bold text-[var(--sage)] hover:text-[var(--sage-text)] transition-colors hover:underline underline-offset-2"
            >
              <Plus className="w-3.5 h-3.5" /> Subir nuevo
            </Link>
          </div>
        </div>`;

if (content.includes('className="mb-4 flex items-center justify-between"')) {
  // It still has the old version
  let parts = content.split('<div className="mb-4 flex items-center justify-between">');
  // Only replace the first one which is usually the Apuntes header
  content = parts[0] + newSubirNuevoBlock + parts[1].substring(parts[1].indexOf('</div>') + 6);
}

// Custom split replace if the string is slightly different
if (content.includes('Apuntes')) {
  const match = content.match(/<div className="mb-4 flex (?:items-center justify-between|flex-col sm:flex-row [^>]+)>[\s\S]*?<Plus className="w-3\.5 h-3\.5" \/> Subir nuevo\s*<\/Link>\s*<\/div>/);
  if (match) {
    content = content.replace(match[0], newSubirNuevoBlock);
  }
}


// 3. Inject in folder summary:
if (!content.includes('BulkDownloadButton notes={group.notes}')) {
  const oldSummaryEnd = `<div className="flex items-center gap-2">
                        <span
                          className={\`text-xs font-bold px-2.5 py-1 rounded-full \${badgeClass}\`}`;
  const newSummaryEnd = `<div className="flex items-center gap-2">
                        <div onClick={(e) => { e.stopPropagation(); }} className="mr-1">
                           <BulkDownloadButton notes={group.notes} label="Carpeta" />
                        </div>
                        <span
                          className={\`text-xs font-bold px-2.5 py-1 rounded-full \${badgeClass}\`}`;
  content = content.replace(oldSummaryEnd, newSummaryEnd);
}

fs.writeFileSync(FILE_PATH, content);
