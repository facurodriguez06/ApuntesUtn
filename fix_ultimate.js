const fs = require('fs');
let c = fs.readFileSync('lib/pdfGenerator.ts', 'utf8');

c = c.replace(/pageBreak: 'auto',/g, "pageBreak: 'avoid',");
c = c.replace(/pageBreak: 'avoid',/g, "pageBreak: 'avoid',"); 

// Decrease font size and padding severely to guarantee fitting everything on one page
c = c.replace(/fontSize:\s*7/g, 'fontSize: 6.5');
c = c.replace(/fontStyle:\s*'bold',\s*fontSize:\s*7/g, "fontStyle: 'bold', fontSize: 6.5");
c = c.replace(/cellPadding:\s*\{\s*top:\s*.*?\}/g, 'cellPadding: { top: 1.5, bottom: 1.5, left: 3, right: 3 }');

// Decrease gaps between elements
c = c.replace(/finalY \+= 5; \/\/ Menos espacio entre subtitulo y tabla/g, 'finalY += 1;');
c = c.replace(/finalY = \(doc as any\).lastAutoTable.finalY \+ 4;/g, 'finalY = (doc as any).lastAutoTable.finalY + 1;');
c = c.replace(/finalY \+= 2;/g, 'finalY += 1;');
c = c.replace(/finalY \+= 4;/g, 'finalY += 1;');
c = c.replace(/finalY \+= 10;/g, 'finalY += 3;');
c = c.replace(/finalY \+= 15;/g, 'finalY += 3;');

fs.writeFileSync('lib/pdfGenerator.ts', c);
console.log('Applied ultimate squish.');
