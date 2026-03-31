const fs = require("fs");
let code = fs.readFileSync("app/layout.tsx", "utf-8");

if (!code.includes("AnnouncementModal")) {
  code = code.replace(
    /import \{ Preloader \} from "@\/components\/Preloader";/,
    `import { Preloader } from "@/components/Preloader";\nimport { AnnouncementModal } from "@/components/AnnouncementModal";`
  );
  
  code = code.replace(
    /<Preloader \/>/,
    `<Preloader />\n        <AnnouncementModal />`
  );
}

fs.writeFileSync("app/layout.tsx", code);

