const fs = require('fs');
let code = fs.readFileSync('app/planes/page.tsx', 'utf-8');

const regex = /const subjectsByYear = useMemo\(\(\) => \{[\s\S]*?years\[s\.year\]\.push\(s\);\n\s*\}\n\s*\}\);\n\s*const yearsOptions = \[/;

const replace = `const subjectsByYear = useMemo(() => {
      const years: { [key: string]: Subject[] } = {};
      for (let i = 1; i <= career.years; i++) years[i] = [];
      years['electivas'] = [];
      career.curriculum.forEach(s => {
        if (s.isElectiva) {
          years['electivas'].push(s);
        } else if (years[s.year]) {
          years[s.year].push(s);
        }
      });
      return years;
    }, [career]);

    const yearsOptions = [`;

code = code.replace(regex, replace);
fs.writeFileSync('app/planes/page.tsx', code);
console.log('Fixed useMemo');