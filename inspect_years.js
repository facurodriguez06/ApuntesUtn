const fs = require('fs');

let dt = fs.readFileSync('app/planes/data.tsx', 'utf-8');

dt = dt.replace(/,\s*\{\s*"id": 99[6-9][\s\S]*?"aprobadas": \[\]\s*\}/g, '');

const careers = ['electromecanica', 'electronica', 'quimica', 'civil'];
careers.forEach(c => {
  const p1 = dt.indexOf(c + ': {');
  let p2 = dt.indexOf('    ]\n  },', p1);
  if (p2 === -1) p2 = dt.indexOf('    ]\n  }', p1);
  
  if (p1 > -1 && p2 > -1) {
    const block = dt.slice(p1, p2);
    let mxYear = 0;
    const regex = /"year": (\d)/g;
    let m;
    while ((m = regex.exec(block)) !== null) {
      if (parseInt(m[1]) > mxYear) mxYear = parseInt(m[1]);
    }
    console.log(`${c} max year: ${mxYear}`);
  }
});
