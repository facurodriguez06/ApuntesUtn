const fs = require('fs');
let code = fs.readFileSync('components/SubjectCard.tsx', 'utf8');

const target = '</h3>';
const addition = `</h3>
          {subject.isElective && (
            <span className="inline-block mt-0 mb-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 rounded-md border border-purple-200">
              Electiva
            </span>
          )}`;
code = code.replace(target, addition);
fs.writeFileSync('components/SubjectCard.tsx', code);
console.log('Done!');