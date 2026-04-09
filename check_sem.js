const fs = require('fs');
const txt = fs.readFileSync('app/planes/data.tsx', 'utf8');
const matches = txt.match(/semester\s*:\s*["']([^"']+)["']/g);
const s = new Set();
if(matches) matches.forEach(m => {
    s.add(m.split(':')[1].trim().replace(/['"]/g, ''));
});
console.log(Array.from(s));
