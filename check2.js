const fs = require('fs');
let code = fs.readFileSync('components/CareerDashboardClient.tsx', 'utf8');
console.log(code.match(/<div className="flex justify-between items-center bg-\[\#FDFDFB\]/g));
console.log(code.includes('isElective'));
