const fs = require('fs');

let content = fs.readFileSync('app/carreras/[careerId]/materias/[id]/page.tsx', 'utf-8');

// Fix header
content = content.replace(
  /animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out/g,
  ""
);

// Fix group folder details
content = content.replace(
  /animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards opacity-0 /g,
  "animate-fade-in-up "
);

// Fix separators
content = content.replace(
  /className=\\\nimate-in fade-in fill-mode-forwards opacity-0 duration-500 delay-\\[200ms\\]/g,
  "className=\nimate-fade-in-up"
);

// Fix list items wrapping div
content = content.replace(
  /className="animate-in fade-in slide-in-from-left-4 opacity-0 duration-500 fill-mode-forwards"/g,
  "className=\"animate-fade-in-up\""
);

fs.writeFileSync('app/carreras/[careerId]/materias/[id]/page.tsx', content);
console.log('Fixed opacity-0 issue in page.tsx');
