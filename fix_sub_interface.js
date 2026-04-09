const fs = require('fs');
let code = fs.readFileSync('lib/data.ts', 'utf-8');

code = code.replace(
  /export interface Subject \{/,
  `export interface Subject {\n  isElectiva?: boolean;`
);

fs.writeFileSync('lib/data.ts', code);
console.log('Fixed interface');