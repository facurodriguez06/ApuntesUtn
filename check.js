const fs = require('fs');
let code = fs.readFileSync('lib/data.ts', 'utf8');

// Busquemos dónde se añaden al final del array subjectsData
const idx = code.indexOf('export const subjectsData: Subject[] = [');
if (idx > -1) {
    const endIdx = code.indexOf('];', idx);
    console.log(code.substring(idx, endIdx + 2));
}

// Verifiquemos si la constante de quimicaSubs incluye los ele agregados
const idx2 = code.indexOf('const quimicaSubs: Subject[] = [');
if (idx2 > -1) {
    const endIdx2 = code.indexOf('];', idx2);
    console.log(code.substring(endIdx2 - 300, endIdx2 + 2));
}
