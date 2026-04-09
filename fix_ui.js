const fs = require('fs');
let code = fs.readFileSync('app/planes/page.tsx', 'utf-8');

code = code.replace(
  /const \[selectedYear, setSelectedYear\] = useState<number>\(1\);/,
  "const [selectedYear, setSelectedYear] = useState<number | 'electivas'>(1);"
);

code = code.replace(
  /const subjectsByYear = useMemo\(\(\) => \{[\s\S]*?return years;\n    \}, \[career\]\);/,
  `const subjectsByYear = useMemo(() => {
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
    }, [career]);`
);

code = code.replace(
  /const yearsOptions = Array.from\(\{ length: career\.years \}, \(_, i\) => i \+ 1\);/,
  `const yearsOptions = [
      ...Array.from({ length: career.years }, (_, i) => i + 1),
      ...(subjectsByYear['electivas'] && subjectsByYear['electivas'].length > 0 ? ['electivas'] : [])
    ];`
);

code = code.replace(
  /const displayedYears = Object\.entries\(subjectsByYear\)\.filter\(\(\[yearStr\]\) => Number\(yearStr\) === selectedYear\);/,
  `const displayedYears = Object.entries(subjectsByYear).filter(([yearStr]) => 
      yearStr === 'electivas' ? selectedYear === 'electivas' : Number(yearStr) === selectedYear
    );`
);

code = code.replace(
  /setSelectedYear\(reqSub\.year\);/g,
  `setSelectedYear(reqSub.isElectiva ? 'electivas' : reqSub.year);`
);

code = code.replace(
  /setSelectedYear\(unlockedSub\.year\);/g,
  `setSelectedYear(unlockedSub.isElectiva ? 'electivas' : unlockedSub.year);`
);

code = code.replace(
  /\{year\}º Año/g,
  `{year === 'electivas' ? 'Electivas' : \`\${year}º Año\`}`
);


fs.writeFileSync('app/planes/page.tsx', code);
console.log('Done mapping.');