const fs = require('fs');
let code = fs.readFileSync('components/DocumentListItem.tsx', 'utf8');

const target = `  const { showToast } = useToast();
  const [downloaded, setDownloaded] = useState(false);
  const isCreatorNote = normalizeAuthorName(note.author ?? "") === CREATOR_AUTHOR;`;

const replacement = `  const { showToast } = useToast();
  const [downloaded, setDownloaded] = useState(false);
  const isCreatorNote = normalizeAuthorName(note.author ?? "") === CREATOR_AUTHOR;
  const customAuthorStyle = customStyles?.[normalizeAuthorName(note.author ?? "")];`;

code = code.replace(target, replacement);

fs.writeFileSync('components/DocumentListItem.tsx', code);