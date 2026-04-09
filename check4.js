const fs = require('fs');
let code = fs.readFileSync('app/planes/data.tsx', 'utf8');
console.log(code.match(/title:\s*'Formación de Emprendedores'/i));
