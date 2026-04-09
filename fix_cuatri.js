const fs = require('fs');
let content = fs.readFileSync('app/planes/page.tsx', 'utf8');

content = content.replace(/subject\.semester === '1º Cuatrimestre'/g, "subject.semester.startsWith('1')");
content = content.replace(/selectedSubject\.semester === '1º Cuatrimestre'/g, "selectedSubject.semester.startsWith('1')");
content = content.replace(/selectedSubject\.semester === '2º Cuatrimestre'/g, "selectedSubject.semester.startsWith('2')");

fs.writeFileSync('app/planes/page.tsx', content);
console.log('Reemplazo hecho');
