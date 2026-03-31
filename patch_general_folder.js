const fs = require('fs');
let code = fs.readFileSync('app/carreras/[careerId]/materias/[id]/page.tsx', 'utf8');

const target = `            noteGroups.map((group, groupIndex) => (
              (() => {
                const normLabel = normalizeAuthorName(group.label);`;

const replacement = `            noteGroups.map((group, groupIndex) => {
              if (group.key === GENERAL_FOLDER_KEY) {
                return group.notes.map((note, index) => (
                  <DocumentListItem key={note.id} note={note} index={index} customStyles={customStyles} />
                ));
              }

              return (() => {
                const normLabel = normalizeAuthorName(group.label);`;

if(code.includes(target)) {
    code = code.replace(target, replacement);

    // Also need to close the added block bracket
    // It currently ends with:
    //                   </details>
    //                 );
    //               })()
    //             ))
    // We changed `noteGroups.map((group, groupIndex) => (` to `.map((group, groupIndex) => {`
    // So we need to change `})()` to `})()` and `))` to `})`

    const targetEnd = `                );
              })()
            ))
          ) : (`;

    const replacementEnd = `                );
              })();
            })
          ) : (`;

    if(code.includes(targetEnd)) {
        code = code.replace(targetEnd, replacementEnd);
        fs.writeFileSync('app/carreras/[careerId]/materias/[id]/page.tsx', code);
        console.log("Replaced successfully!");
    } else {
        console.log("Could not find end block.");
    }
} else {
    console.log("Could not find start block.");
}