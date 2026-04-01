const fs = require('fs');
let code = fs.readFileSync('lib/data.ts', 'utf8');

const target = `  // 2do Año Básicas
  sub('bas-am2', 'Análisis Matemático II', 2, 'basicas'),`;

const replacement = `  // 2do Año Básicas
  sub('bas-am2', 'Análisis Matemático II', 2, 'basicas'),
  sub('bas-fis2', 'Física II', 2, 'basicas'),`;

if(code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('lib/data.ts', code);
    console.log("Fisica II inserted successfully!");
} else {
    console.log("Could not find the target text.");
}