const fs = require('fs');
let code = fs.readFileSync('app/planes/page.tsx', 'utf-8');

code = code.replace(
  /interface Subject \{/,
  "interface Subject {\n  isElectiva?: boolean;"
);

fs.writeFileSync('app/planes/page.tsx', code);
console.log('Fixed subject in page.tsx');