const fs = require('fs');

let dt = fs.readFileSync('app/planes/data.tsx', 'utf-8');

const careers = ['sistemas', 'electromecanica', 'electronica', 'quimica', 'civil'];
let hasError = false;

careers.forEach(c => {
  const p1 = dt.indexOf(`${c}: {`);
  if (p1 === -1) return;
  const p2 = dt.indexOf('    ]\n  },', p1) > -1 ? dt.indexOf('    ]\n  },', p1) : dt.indexOf('    ]\n  }', p1);
  if (p2 === -1) return;
  
  const block = dt.slice(p1, p2);
  const regex = /"year":\s*(\d)/g;
  let match;
  let lastYear = 0;
  while ((match = regex.exec(block)) !== null) {
      const year = parseInt(match[1]);
      if (year < lastYear) {
         console.log(`ORDER ERROR in ${c}: Found year ${year} after year ${lastYear}`);
         hasError = true;
      }
      lastYear = year;
  }
});

if (!hasError) {
  console.log("All careers are perfectly sorted by year in data.tsx!");
}
