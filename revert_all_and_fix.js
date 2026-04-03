const fs = require('fs');

let code = fs.readFileSync('lib/pdfGenerator.ts', 'utf8');

// 1. Force strict 1 year = 1 page
const dynamicYearBreakRegex = /const estimatedYearHeight = 35 \+[\s\S]*?finalY = 18;\n\s*\}/m;
code = code.replace(dynamicYearBreakRegex, `    // Forzar siempre 1 año por hoja
    if (year > 1) {
      doc.addPage();
      doc.setFillColor(254, 253, 250);
      doc.rect(0, 0, 210, 297, 'F');
      
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 8, 'F');
      finalY = 18;
    }`);

// 2. Remove semester dynamic breaks, reduce spaces significantly between semesters
const dynamicSemBreakRegex = /\s*\/\/\s*Estimar altura de este semestre[\s\S]*?finalY = 18;\n\s*\}/g;
code = code.replace(dynamicSemBreakRegex, `      // Sin saltos dinámicos en medio de un año`);

// 3. Compact year-padding to save space
code = code.replace(/finalY \+= 15;/g, 'finalY += 6;'); 
code = code.replace(/finalY = \(doc as any\).lastAutoTable.finalY \+ 8;/g, 'finalY = (doc as any).lastAutoTable.finalY + 3;');
code = code.replace(/\/\/ Espacio extra al finalizar un año completo\n\s*finalY \+= 8;\n\n\s*if \(finalY > 250\) \{/g, `finalY += 4;
    // Skip old pagination block
    if (false) {`);

// 4. Inline the requirements string to save massive vertical space
const getNamesRegex = /const getNames = \(ids: number\[\], type: string\) => \{[\s\S]*?\}\);/;
code = code.replace(getNamesRegex, `const regNames = s.regulares.length 
          ? '[Reg] ' + s.regulares.map(id => curriculum.find(c => c.id === id)?.name).filter(Boolean).join(', ')
          : '';
        const aprNames = s.aprobadas.length 
          ? '[Apr] ' + s.aprobadas.map(id => curriculum.find(c => c.id === id)?.name).filter(Boolean).join(', ')
          : '';
        
        const allReqs = [regNames, aprNames].filter(Boolean).join('\\n');

        let emptyReqsText = 'LIBRE DE CORRELATIVAS';
        if (s.semester === 'Electiva') {
          emptyReqsText = 'CONSULTAR MATERIA';
        }
        
        let hsText = '';
        if (s.weekly_hours || s.total_hours) {
          hsText = \` | \${s.weekly_hours || '-'} hs/sem - \${s.total_hours || '-'} tot\`;
        }`);

const textBuilderRegex = /const regText[\s\S]*?hsText ="";\n\s*\}/m;
code = code.replace(textBuilderRegex, '');

// Clean the rogue newlines in map return
code = code.replace(/content: \`Código \$\{s\.id.*?\}\$\{hsText\}\`,/g, "content: `Cód. ${s.id.toString().padStart(3, '0')} - ${s.name.toUpperCase()}${hsText}`,");

// 5. Adjust AutoTable styles dynamically depending on subjects length to ensure it ALWAYS fits
code = code.replace(/styles: \{\s*font: 'helvetica',\s*fontSize: 6\.5,\s*cellPadding: \{ top: 2\.5, bottom: 2\.5, left: 4, right: 4 \},\s*valign: 'middle',\s*\}/m, 
`styles: {
        font: 'helvetica',
        fontSize: subjects.length > 9 ? 6 : 7,
        cellPadding: subjects.length > 9 ? { top: 1.5, bottom: 1.5, left: 4, right: 4 } : { top: 2, bottom: 2, left: 4, right: 4 },
        valign: 'middle',
      }`);

// Prevent tables from pushing entirely to a new page
code = code.replace(/pageBreak: 'avoid',/g, "pageBreak: 'auto',");

fs.writeFileSync('lib/pdfGenerator.ts', code);
console.log('Restaurado y limpiado, a ver...');
