const fs = require('fs');

let c = fs.readFileSync('app/carreras/[careerId]/materias/[id]/page.tsx','utf8');
const searchReg = /let wrapperClass\s*=\s*"[^"]+";\s*let textClass/;
const replace = `
                let buttonHex = yc.accent;
                if (isCreatorFolder) buttonHex = "#D4AF37";
                else if (customStyleFolder) buttonHex = customStyleFolder.color;

                let wrapperClass = "border-[#EDE6DD] bg-[#FCFAF8] open:bg-white";
                let textClass`;

c = c.replace(searchReg, replace);
fs.writeFileSync('app/carreras/[careerId]/materias/[id]/page.tsx', c);
