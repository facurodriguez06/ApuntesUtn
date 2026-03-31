
const fs = require("fs");
let content = fs.readFileSync("components/UploadModule.tsx", "utf8");
const regex = /\{carrera !== "basicas" && \(\s*(<div[\s\S]*?<\/div>)\s*\)\}/;
content = content.replace(regex, "$1");
fs.writeFileSync("components/UploadModule.tsx", content, "utf8");
console.log("Regex applied");

