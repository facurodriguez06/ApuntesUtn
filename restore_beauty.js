const fs = require('fs');

let code = fs.readFileSync('lib/pdfGenerator.ts', 'utf8');

// The text is escaping because the cellPadding is too small to cover 2-3 lines of text.
// We must give the cell breathing room internally so data.row.height scales naturally.
code = code.replace(/cellPadding:\s*\{.*?top.*?\}\s*,\s*$/m, "cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },");
code = code.replace(/cellPadding:\s*\{.*?top.*?\}\s*$/m, "cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 }");

// And we make the box hug the full height perfectly:
code = code.replace(/doc\.roundedRect\(data\.cell\.x \+ 0\.8, data\.cell\.y \+ 1\.5, 182, data\.row\.height - [0-9.]+, 3, 3, 'F'\);/g, 
"doc.roundedRect(data.cell.x + 0.8, data.cell.y + 1.5, 182, data.row.height - 3, 3, 3, 'F');");

code = code.replace(/doc\.roundedRect\(data\.cell\.x, data\.cell\.y \+ 1, 182, data\.row\.height - [0-9.]+, 3, 3, 'FD'\);/g, 
"doc.roundedRect(data.cell.x, data.cell.y + 1, 182, data.row.height - 3, 3, 3, 'FD');");

code = code.replace(/doc\.rect\(data\.cell\.x \+ 0\.2, data\.cell\.y \+ 1\.2, 4, data\.row\.height - [0-9.]+, 'F'\);/g, 
"doc.rect(data.cell.x + 0.2, data.cell.y + 1.2, 4, data.row.height - 3.4, 'F');");

// Put the font size back to something legible and beautiful
code = code.replace(/fontSize:\s*6\.5/g, "fontSize: 7.5");

// Restore dynamic page breaks smoothly so we NEVER have awkward blank chunks!
// We'll let jsPDF handle page turning automatically, but ensure no split rows!
code = code.replace(/pageBreak:\s*'avoid',/g, "pageBreak: 'auto',");
code = code.replace(/pageBreak:\s*'auto',/g, "pageBreak: 'auto', rowPageBreak: 'avoid',");

fs.writeFileSync('lib/pdfGenerator.ts', code);
console.log('Restored cell heights and dynamic page turning!');
