const fs = require('fs');
let code = fs.readFileSync('lib/data.ts', 'utf8');

// Update getSubjectsByCareer function
let newFunc1 = `export const getSubjectsByCareer = (careerId: string): Subject[] =>
  subjectsData.filter(s => {
    if (s.excludedCareers?.includes(careerId)) return false;
    return (
      s.careerId === careerId ||
      s.careerId === 'basicas' ||
      (s.careerPaths && s.careerPaths.some(p => p.careerId === careerId))
    );
  });`;
  
code = code.replace(/export const getSubjectsByCareer =[^;]+;\s*\n?\s*\);\s*\n/m, newFunc1 + "\n\n");
code = code.replace(/export const getSubjectsByCareer = \([\s\S]+?\)     \n      \);/m, newFunc1); // regex target fallback, let's just make it simpler.

fs.writeFileSync('lib/data.ts', code);
