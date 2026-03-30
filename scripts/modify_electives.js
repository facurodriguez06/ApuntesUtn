const fs = require('fs');
let code = fs.readFileSync('lib/data.ts', 'utf8');

code = code.replace(/sub\('sis-el3', 'Electivas[^']+', 3, 'sistemas'\)/g, "ele('sis-el3', 'Electivas 3º nivel', 99, 'sistemas', [{careerId: 'sistemas', year: 99}])");
code = code.replace(/sub\('sis-el4', 'Electivas[^']+', 4, 'sistemas'\)/g, "ele('sis-el4', 'Electivas 4º nivel', 99, 'sistemas', [{careerId: 'sistemas', year: 99}])");
code = code.replace(/sub\('sis-el5', 'Electivas[^']+', 5, 'sistemas'\)/g, "ele('sis-el5', 'Electivas 5º nivel', 99, 'sistemas', [{careerId: 'sistemas', year: 99}])");
code = code.replace(/sub\('civ-el', 'Electivas', 6, 'civil'\)/g, "ele('civ-el', 'Electivas', 99, 'civil', [{careerId: 'civil', year: 99}])");
code = code.replace(/sub\('qui-el', 'Electivas', 5, 'quimica'\)/g, "ele('qui-el', 'Electivas', 99, 'quimica', [{careerId: 'quimica', year: 99}])");
code = code.replace(/sub\('ele-el', 'Electivas', 6, 'electronica'\)/g, "ele('ele-el', 'Electivas', 99, 'electronica', [{careerId: 'electronica', year: 99}])");
code = code.replace(/sub\('elm-el', 'Electivas', 5, 'electromecanica'\)/g, "ele('elm-el', 'Electivas', 99, 'electromecanica', [{careerId: 'electromecanica', year: 99}])");

fs.writeFileSync('lib/data.ts', code);
console.log('Fixed placeholders!');