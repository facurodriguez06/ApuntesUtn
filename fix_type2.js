const fs = require('fs');
let code = fs.readFileSync('app/planes/page.tsx', 'utf-8');

const target = `      career.curriculum.forEach(s => {
        if (years[s.year]) {
          years[s.year].push(s);
        }
      });`;

const replacement = `      years['electivas'] = [];
      career.curriculum.forEach(s => {
        if (s.isElectiva) {
          years['electivas'].push(s);
        } else if (years[s.year]) {
          years[s.year].push(s);
        }
      });`;

code = code.replace(target, replacement);

fs.writeFileSync('app/planes/page.tsx', code);
console.log('Fixed subjectsByYear logic directly');