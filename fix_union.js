const fs = require('fs');
let code = fs.readFileSync('app/planes/page.tsx', 'utf-8');

code = code.replace(
  /onClick=\{\(\) => setSelectedYear\(year\)\}/g,
  `onClick={() => setSelectedYear(year as number | 'electivas')}`
);

fs.writeFileSync('app/planes/page.tsx', code);
console.log('Fixed union text');