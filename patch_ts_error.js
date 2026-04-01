const fs = require('fs');

let code = fs.readFileSync('app/carreras/[careerId]/materias/[id]/page.tsx', 'utf8');

const target = `  let realNotes: Note[] = [];
  let customStyles = {};`;

const replacement = `  let realNotes: Note[] = [];
  let customStyles: Record<string, { color: string; label: string }> = {};`;

if(code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('app/carreras/[careerId]/materias/[id]/page.tsx', code);
    console.log("Patched successfully");
} else {
    console.log("Could not find the target to patch");
}
