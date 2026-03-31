const fs = require('fs');

let code = fs.readFileSync('app/carreras/[careerId]/materias/[id]/page.tsx', 'utf8');

const regex = /noteGroups\.map\(\(group, groupIndex\) => \([\s\S]*?\(\(\) => \{[\s\S]*?const normLabel = normalizeAuthorName\(group\.label\);/;

const replacement = `noteGroups.map((group, groupIndex) => {
              if (group.key === GENERAL_FOLDER_KEY) {
                return (
                  <React.Fragment key={group.key}>
                    {group.notes.map((note, index) => (
                      <DocumentListItem key={note.id} note={note} index={index} customStyles={customStyles} />
                    ))}
                  </React.Fragment>
                );
              }

              return (() => {
                const normLabel = normalizeAuthorName(group.label);`;

if (regex.test(code)) {
    code = code.replace(regex, replacement);
    // Remember to import React if React.Fragment is used, or just use <> </>. Wait, React might not be imported as default, let's just use Fragment notation but need a key. Fragment key requires <Fragment>, but we can just use normal div container or an array. Wait, if I return an array of elements inside map, React accepts it!
    
} else {
    console.error("No match");
}
