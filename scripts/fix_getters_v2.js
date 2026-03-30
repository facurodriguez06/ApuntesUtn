const fs = require('fs');
let code = fs.readFileSync('lib/data.ts', 'utf8');

const target1Regex = /export const getSubjectsByCareer = [\s\S]*?\n\s*\);/;
const newFunc1 = `export const getSubjectsByCareer = (careerId: string): Subject[] =>
  subjectsData.filter(s => {
    if (s.excludedCareers && s.excludedCareers.includes(careerId)) return false;
    return (s.careerId === careerId || s.careerId === 'basicas' || (s.careerPaths && s.careerPaths.some(p => p.careerId === careerId)));
  });`;

const target2Regex = /export const getSubjectsByCareerAndYear = [\s\S]*?return false;\n\s*\}\);/;
const newFunc2 = `export const getSubjectsByCareerAndYear = (careerId: string, year: number): Subject[] =>
  subjectsData.filter(s => {
    if (s.excludedCareers && s.excludedCareers.includes(careerId)) return false;
    if (s.careerPaths && s.careerPaths.some(p => p.careerId === careerId && p.year === year)) return true;
    if (s.careerId === careerId && s.year === year) return true;
    if (s.careerId === 'basicas' && s.year === year && !s.isElective && s.year !== 99) return true;
    return false;
  });`;

code = code.replace(target1Regex, newFunc1).replace(target2Regex, newFunc2);
fs.writeFileSync('lib/data.ts', code);
console.log('Update Complete');