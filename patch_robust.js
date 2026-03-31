const fs = require('fs');

let code = fs.readFileSync('components/DocumentListItem.tsx', 'utf8');

const t2 = `  const isCreatorNote = normalizeAuthorName(note.author ?? "") === CREATOR_AUTHOR;`;
const r2 = `  const isCreatorNote = normalizeAuthorName(note.author ?? "") === CREATOR_AUTHOR;
  const customAuthorStyle = customStyles?.[normalizeAuthorName(note.author ?? "")];`;

code = code.replace(t2, r2);

fs.writeFileSync('components/DocumentListItem.tsx', code);