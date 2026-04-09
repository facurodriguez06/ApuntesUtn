const fs = require('fs');
let code = fs.readFileSync('app/planes/page.tsx', 'utf-8');

code = code.replace(
  /Año \{year\}/g,
  `{year === 'electivas' ? 'Electivas' : \`Año \${year}\`}`
);

fs.writeFileSync('app/planes/page.tsx', code);
console.log('Fixed');