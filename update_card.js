const fs = require('fs');

let content = fs.readFileSync('components/SubjectCard.tsx', 'utf-8');

// Use proper powershell escaping for regex
