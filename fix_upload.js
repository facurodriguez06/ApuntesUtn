const fs = require('fs');

let content = fs.readFileSync('components/UploadModule.tsx', 'utf8');

// 1. Fix submit validation
content = content.replace(
  'if (files.length === 0 || isTitleInvalid || !carrera || (carrera !== "basicas" && !anio) || !materia || !tipo) {',
  'if (files.length === 0 || isTitleInvalid || !carrera || !anio || !materia || !tipo) {'
);

// 2. Fix isValid const
content = content.replace(
  'const isValid = files.length > 0 && (files.length > 1 ? true : sanitize(title) !== "") && carrera && (carrera === "basicas" ? true : anio) && materia && tipo;',
  'const isValid = files.length > 0 && (files.length > 1 ? true : sanitize(title) !== "") && carrera && anio && materia && tipo;'
);

// 3. Fix availableYears array
content = content.replace(
  'const availableYears = selectedCareer\n    ? Array.from({ length: selectedCareer.maxYears }, (_, index) => index + 1)\n    : [];',
  'const availableYears = selectedCareer\n    ? [\n        ...Array.from({ length: selectedCareer.maxYears }, (_, index) => index + 1),\n        ...(carrera !== "basicas" ? [99] : [])\n      ]\n    : [];'
);

// 4. Fix handleCarreraChange
content = content.replace(
  '  const handleCarreraChange = (value: string) => {\n    setCarrera(value);\n    if (value === "basicas") {\n      setAnio("1");\n    } else {\n      setAnio("");\n    }\n    setMateria("");\n  };',
  '  const handleCarreraChange = (value: string) => {\n    setCarrera(value);\n    setAnio("");\n    setMateria("");\n  };'
);

// 5. Fix JSX hiding the year select
content = content.replace(
  '{carrera !== "basicas" && (\n              <div>',
  '{\n              <div>'
);
// note: the matching closing brace } for the condition might be hanging. Let's fix that too.
// Wait, replacing {carrera !== "basicas" && (\n              <div> with just <div> will leave a closing )} below.
// Let's use regex to replace the whole block dynamically or just use simple replaces.

fs.writeFileSync('components/UploadModule.tsx', content, 'utf8');
console.log('Fixed initial 4 items');
