const fs = require('fs');
console.log(fs.readFileSync('app/planes/data.tsx', 'utf8').substring(0, 500));
