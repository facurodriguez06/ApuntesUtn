const fs = require('fs');
const content = fs.readFileSync('app/planes/data.tsx', 'utf8');
const regex = /semester:\s*['"`](.*?)['"`]/g;
const uniqueSemesters = new Set();
let match;
while ((match = regex.exec(content)) !== null) {
  uniqueSemesters.add(match[1]);
}
console.log(Array.from(uniqueSemesters));
