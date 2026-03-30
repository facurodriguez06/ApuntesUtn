const fs = require('fs');
let code = fs.readFileSync('lib/data.ts', 'utf8');
code = code.replace(/sub\('bas-ing2', 'Ingl.\sII', 1, 'basicas'\),/, "sub('bas-ing2', 'Inglés II', 2, 'basicas'),");
// Let's also check if "Introducción a la programación" or something got added somewhere it shouldn't.

fs.writeFileSync('lib/data.ts', code);
