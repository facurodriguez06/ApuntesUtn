const fs = require('fs');
let code = fs.readFileSync('lib/data.ts', 'utf8');

code = code.replace(/sub\('bas-qg',[^)]+\),/g, "{...sub('bas-qg', 'Química General', 1, 'basicas'), excludedCareers: ['sistemas']},");
code = code.replace(/sub\('bas-fis3',[^)]+\),/g, "{...sub('bas-fis3', 'Física III', 2, 'basicas'), excludedCareers: ['sistemas']},");

fs.writeFileSync('lib/data.ts', code);
