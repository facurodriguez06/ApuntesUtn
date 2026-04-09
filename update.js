const fs = require('fs');
let code = fs.readFileSync('app/carreras/[careerId]/materias/[id]/page.tsx', 'utf8');

code = code.replace(
  /className=\{\`border-t px-3 pb-3 pt-2 \$\{innerBorderClass\}\`\}/g,
  "className={`border-t px-3 pb-3 pt-1 ${innerBorderClass}`}"
);

code = code.replace(
  /animate-in fade-in fill-mode-forwards opacity-0 duration-500 delay-\[200ms\] flex items-center gap-3 w-full \$\{index === 0 \? \"mb-1 mt-0\" \: \"my-2\"\}\`/g,
  "animate-in fade-in fill-mode-forwards opacity-0 duration-500 delay-[200ms] flex items-center gap-3 w-full ${index === 0 ? \"mt-1 -mb-1\" : \"my-2\"}`"
);

fs.writeFileSync('app/carreras/[careerId]/materias/[id]/page.tsx', code);
