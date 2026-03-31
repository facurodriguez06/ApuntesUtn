const fs = require('fs');
let code = fs.readFileSync('app/carreras/[careerId]/materias/[id]/page.tsx', 'utf8');

// Insert getDoc import
code = code.replace(
  'import { collection, query, where, getDocs } from "firebase/firestore";',
  'import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";'
);

// Fetch global settings
code = code.replace(
  '  let realNotes: Note[] = [];\n  try {\n    const notesQuery = query(',
  `  let realNotes: Note[] = [];\n  let customStyles = {};\n  try {\n    const globalSnap = await getDoc(doc(db, "settings", "global"));\n    if (globalSnap.exists()) customStyles = globalSnap.data().authorStyles || {};\n  } catch(e) {}\n  \n  try {\n    const notesQuery = query(`
);

// Pass to DocumentListItem
code = code.replace(
  '<DocumentListItem key={note.id} note={note} index={index} />',
  '<DocumentListItem key={note.id} note={note} index={index} customStyles={customStyles} />'
);

fs.writeFileSync('app/carreras/[careerId]/materias/[id]/page.tsx', code);
