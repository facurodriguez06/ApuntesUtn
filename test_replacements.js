const fs = require('fs');

function updateFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (let [oldStr, newStr] of replacements) {
    content = content.replace(oldStr, newStr);
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

updateFile('components/UploadModule.tsx', [
  [
    'fileUrl: uploadResult.url || uploadResult.secure_url,',
    'fileUrl: uploadResult.path || uploadResult.url || uploadResult.secure_url,'
  ]
]);

updateFile('components/DocumentListItem.tsx', [
  [
    'import { FileIcon, ExternalLink, Download } from "lucide-react";',
    'import { FileIcon, ExternalLink, Download } from "lucide-react";\nimport { resolveStorageUrl } from "@/lib/storage";'
  ],
  [
    'window.open(note.fileUrl, "_blank");',
    'window.open(resolveStorageUrl(note.fileUrl), "_blank");'
  ],
  [
    'link.href = note.fileUrl;',
    'link.href = resolveStorageUrl(note.fileUrl);'
  ]
]);

updateFile('app/admin/page.tsx', [
  [
    'import { db } from "@/lib/firebase/config";',
    'import { db } from "@/lib/firebase/config";\nimport { resolveStorageUrl } from "@/lib/storage";'
  ],
  [
    'window.open(note.fileUrl, "_blank");',
    'window.open(resolveStorageUrl(note.fileUrl), "_blank");'
  ]
]);

console.log("Done");
