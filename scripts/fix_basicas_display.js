const fs = require('fs');

// 1. Fix lib/data.ts
let dataFile = fs.readFileSync('lib/data.ts', 'utf8');

const oldGet1 = `export const getSubjectsByCareer = (careerId: string): Subject[] =>
  subjectsData.filter(s => {
    if (s.excludedCareers && s.excludedCareers.includes(careerId)) return false;
    return (s.careerId === careerId || s.careerId === 'basicas' || (s.careerPaths && s.careerPaths.some(p => p.careerId === careerId)));
  });`;

const newGet1 = `export const getSubjectsByCareer = (careerId: string): Subject[] =>
  subjectsData.filter(s => {
    if (s.excludedCareers && s.excludedCareers.includes(careerId)) return false;
    return (s.careerId === careerId || (s.careerPaths && s.careerPaths.some(p => p.careerId === careerId)));
  });`;

const oldGet2 = `export const getSubjectsByCareerAndYear = (careerId: string, year: number): Subject[] =>
  subjectsData.filter(s => {
    if (s.excludedCareers && s.excludedCareers.includes(careerId)) return false;
    if (s.careerPaths && s.careerPaths.some(p => p.careerId === careerId && p.year === year)) return true;
    if (s.careerId === careerId && s.year === year) return true;
    if (s.careerId === 'basicas' && s.year === year && !s.isElective && s.year !== 99) return true;
    return false;
  });`;

const newGet2 = `export const getSubjectsByCareerAndYear = (careerId: string, year: number): Subject[] =>
  subjectsData.filter(s => {
    if (s.excludedCareers && s.excludedCareers.includes(careerId)) return false;
    if (s.careerPaths && s.careerPaths.some(p => p.careerId === careerId && p.year === year)) return true;
    if (s.careerId === careerId && s.year === year) return true;
    return false;
  });`;

dataFile = dataFile.replace(oldGet1, newGet1);
dataFile = dataFile.replace(oldGet2, newGet2);

fs.writeFileSync('lib/data.ts', dataFile);

// 2. Fix components/CareerDashboardClient.tsx
let dashboardFile = fs.readFileSync('components/CareerDashboardClient.tsx', 'utf8');

dashboardFile = dashboardFile.replace(
  'import { careersData, yearConfig, getSubjectsByCareerAndYear } from "@/lib/data";',
  'import { careersData, yearConfig, getSubjectsByCareerAndYear, getSubjectsByCareer } from "@/lib/data";'
);

const oldSubjectsDef = `const yc = yearConfig[activeYear];
  const filteredSubjects = getSubjectsByCareerAndYear(careerId, activeYear);`;

const newSubjectsDef = `const yc = yearConfig[activeYear];
  const isBasicas = careerId === "basicas";
  const filteredSubjects = isBasicas ? getSubjectsByCareer(careerId) : getSubjectsByCareerAndYear(careerId, activeYear);`;
dashboardFile = dashboardFile.replace(oldSubjectsDef, newSubjectsDef);

const oldYearsDef = `const years = Array.from({ length: career.maxYears }, (_, index) => index + 1);
  if (careerId !== 'basicas') years.push(99);
  const CareerIcon = careerIcons[career.icon] || Monitor;
  const isBasicas = careerId === "basicas";`;

const newYearsDef = `const years = isBasicas ? [] : Array.from({ length: career.maxYears }, (_, index) => index + 1);
  if (!isBasicas) years.push(99);
  const CareerIcon = careerIcons[career.icon] || Monitor;`;
dashboardFile = dashboardFile.replace(oldYearsDef, newYearsDef);

// Update label string 
dashboardFile = dashboardFile.replace(
  '{isBasicas ? "Materias comunes a todas las ingenierías" : "Plan 2023"} · {filteredSubjects.length} materias en{" "}\n              {yearLabel(activeYear).toLowerCase()}',
  '{isBasicas ? "Materias comunes a todas las ingenierías" : "Plan 2023"} · {filteredSubjects.length} materias {isBasicas ? "" : `en ${yearLabel(activeYear).toLowerCase()}`}'
);

const oldLabelFallbacks = `{isBasicas ? "Materias comunes a todas las ingenierías" : "Plan 2023"} · {filteredSubjects.length} materias en{" "}
              {yearLabel(activeYear).toLowerCase()}`;
dashboardFile = dashboardFile.replace(oldLabelFallbacks, '{isBasicas ? "Materias comunes a todas las ingenierías" : "Plan 2023"} · {filteredSubjects.length} materias {isBasicas ? "" : `en ${yearLabel(activeYear).toLowerCase()}`}');


fs.writeFileSync('components/CareerDashboardClient.tsx', dashboardFile);
console.log('Script execution finished.');
