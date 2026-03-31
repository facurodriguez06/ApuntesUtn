const fs = require('fs');

let content = fs.readFileSync('components/DocumentListItem.tsx', 'utf8');
if (!content.includes('import { resolveStorageUrl }')) {
  content = content.replace('import { useToast } from "@/context/ToastContext";', 'import { useToast } from "@/context/ToastContext";\nimport { resolveStorageUrl } from "@/lib/storage";');
  fs.writeFileSync('components/DocumentListItem.tsx', content, 'utf8');
  console.log('Fixed imports in DocumentListItem');
} else {
  console.log('DocumentListItem already has import');
}

let content2 = fs.readFileSync('app/admin/page.tsx', 'utf8');
if (!content2.includes('import { resolveStorageUrl }')) {
  content2 = content2.replace('import { db } from "@/lib/firebase/config";', 'import { db } from "@/lib/firebase/config";\nimport { resolveStorageUrl } from "@/lib/storage";');
  fs.writeFileSync('app/admin/page.tsx', content2, 'utf8');
  console.log('Fixed imports in admin page');
} else {
  console.log('admin page already has import');
}
