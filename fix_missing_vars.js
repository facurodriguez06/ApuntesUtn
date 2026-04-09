const fs = require('fs');
let code = fs.readFileSync('app/planes/page.tsx', 'utf-8');

const replacement = `  const subjectsByYear = useMemo(() => {
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

  const yearsOptions = [
    ...Array.from({ length: career.years }, (_, i) => i + 1),
    ...(subjectsByYear['electivas'] && subjectsByYear['electivas'].length > 0 ? ['electivas'] : [])
  ];

  const displayedYears = Object.entries(subjectsByYear).filter(([yearStr]) =>
    yearStr === 'electivas' ? selectedYear === 'electivas' : Number(yearStr) === selectedYear
  );`;

// Let's replace the whole chunk inside CurriculumViewer just before return.
const idxStar = code.indexOf('const subjectsByYear = useMemo');
const idxEnd = code.indexOf('<div className="flex flex-col lg:flex-row h-full w-full relative">');

if (idxStar !== -1 && idxEnd !== -1) {
  // Wait, there's a `return (` just before `idxEnd` that we should preserve or recreate.
  // Actually, I can just replace from `const subjectsByYear` up to `idxEnd` entirely:
  
  // Need to find the inner `return (` that belongs to CurriculumViewer
  // The `idxEnd` is the first div of the return of CurriculumViewer.
  
  const actualEnd = code.lastIndexOf('return (', idxEnd);
  
  if (actualEnd !== -1) {
    code = code.substring(0, idxStar) + replacement + '\n\n    ' + code.substring(actualEnd);
    fs.writeFileSync('app/planes/page.tsx', code);
    console.log('Restored the missing variables');
  } else {
    console.log('actualEnd not found');
  }
} else {
  console.log('Not found marks');
}
