
const fs = require("fs");
let content = fs.readFileSync("components/UploadModule.tsx", "utf8");

const oldCode = /const availableYears = selectedCareer[\s\n]*\? Array\.from\(\{ length: selectedCareer\.maxYears \}, \(_, index\) => index \+ 1\)[\s\n]*: \[\];/;

const newCode = `const availableYears = selectedCareer\n    ? [\n        ...Array.from({ length: selectedCareer.maxYears }, (_, index) => index + 1),\n        ...(carrera !== "basicas" ? [99] : [])\n      ]\n    : [];`;

content = content.replace(oldCode, newCode);
fs.writeFileSync("components/UploadModule.tsx", content, "utf8");
console.log("Fixed availableYears");

