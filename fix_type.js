const fs = require('fs');
let code = fs.readFileSync('app/planes/page.tsx', 'utf-8');

code = code.replace(
  /const years: \{ \[key: number\]: Subject\[\] \} = \{\};/,
  "const years: { [key: string]: Subject[] } = {};"
);

// We need to make sure we've updated subjectsByYear useMemo logic because it didn't match before
code = code.replace(
  /career\.curriculum\.forEach\(s => \{\n\s*if \(years\[s\.year\]\) \{\n\s*years\[s\.year\]\.push\(s\);\n\s*\}\n\s*\}\);/,
  `years['electivas'] = [];
      career.curriculum.forEach(s => {
        if (s.isElectiva) {
          years['electivas'].push(s);
        } else if (years[s.year]) {
          years[s.year].push(s);
        }
      });`
);


fs.writeFileSync('app/planes/page.tsx', code);
console.log('Fixed subjectsByYear loop');