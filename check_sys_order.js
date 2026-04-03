const fs = require('fs');

let dt = fs.readFileSync('app/planes/data.tsx', 'utf-8');
const p1 = dt.indexOf('sistemas: {');
const p2 = dt.indexOf('    ]\n  },', p1);
const curr = dt.slice(p1, p2);
const regex = /"year":\s*(\d)/g;
let m;
let last = 0;
while((m = regex.exec(curr)) !== null) {
  const y = parseInt(m[1]);
  if(y < last) console.log('Sistemas: found year', y, 'after year', last, 'around index', m.index, curr.slice(m.index-20, m.index+20));
  last = y;
}
