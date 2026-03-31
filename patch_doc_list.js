const fs = require('fs');
let code = fs.readFileSync('components/DocumentListItem.tsx', 'utf8');

code = code.replace(
  'export function DocumentListItem({ note, index = 0 }: { note: Note; index?: number }) {',
  `export type CustomStyle = { color: string; label: string };
export function DocumentListItem({ note, customStyles = {}, index = 0 }: { note: Note; customStyles?: Record<string, CustomStyle>; index?: number }) {`
);

let customStyleLogic = `  const { showToast } = useToast();
  const [downloaded, setDownloaded] = useState(false);
  const authorNorm = normalizeAuthorName(note.author ?? "");
  const customAuthorStyle = customStyles[authorNorm];
  // Fallback a creator logic clásico si no hay custom style general
  const isCreatorNote = !customAuthorStyle && authorNorm === CREATOR_AUTHOR;`;

code = code.replace(
  '  const { showToast } = useToast();\n  const [downloaded, setDownloaded] = useState(false);\n  const isCreatorNote = normalizeAuthorName(note.author ?? "") === CREATOR_AUTHOR;',
  customStyleLogic
);

// Apply custom styles mapping in HTML

code = code.split('className={`group relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-xl hover:-translate-y-[2px] transition-all duration-400 animate-fade-in-up ${getBgClass(note.type, isCreatorNote)}`}')
           .join(`className={\`group relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-xl hover:-translate-y-[2px] transition-all duration-400 animate-fade-in-up \${!customAuthorStyle ? getBgClass(note.type, isCreatorNote) : ''}\`} style={{ animationDelay: \`\${index * 80}ms\`, ...(customAuthorStyle ? { backgroundColor: customAuthorStyle.color + '0a', borderColor: customAuthorStyle.color + '40' } : {}) }}`);

code = code.replace(
  'style={{ animationDelay: `${index * 80}ms` }}',
  ''
);

// We need to inject the inline styles inside the wrapper icon if it has a custom style
code = code.split('className={`mt-0.5 shrink-0 p-2.5 rounded-xl border group-hover:scale-110 group-hover:rotate-[-3deg] transition-transform duration-300 ${')
           .join('style={customAuthorStyle ? { backgroundColor: customAuthorStyle.color + "1A", borderColor: customAuthorStyle.color + "66" } : undefined} className={`mt-0.5 shrink-0 p-2.5 rounded-xl border group-hover:scale-110 group-hover:rotate-[-3deg] transition-transform duration-300 ${');

code = code.split('className={`font-bold text-sm transition-colors truncate ${')
           .join('style={customAuthorStyle ? { color: customAuthorStyle.color } : undefined} className={`font-bold text-sm transition-colors truncate ${');

code = code.split('className={`inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-md ${')
           .join('style={customAuthorStyle ? { backgroundColor: customAuthorStyle.color + "22", color: customAuthorStyle.color } : undefined} className={`inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-md ${');

code = code.split('{isCreatorNote && (')
           .join('{customAuthorStyle && (<span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-sm" style={{ backgroundColor: customAuthorStyle.color }}><Crown className="w-3 h-3" />{customAuthorStyle.label}</span>)}{isCreatorNote && (');

fs.writeFileSync('components/DocumentListItem.tsx', code);
