const fs = require('fs');

// 1. Update CareerDashboardClient.tsx
let clientContent = fs.readFileSync('components/CareerDashboardClient.tsx', 'utf-8');
clientContent = clientContent.replace(
  /\\{filteredSubjects.map\\(\\(subject\\) => \\(/g,
  "{filteredSubjects.map((subject, index) => ("
);
clientContent = clientContent.replace(
  /className="animate-fade-in-up flex h-full flex-col w-full"/g,
  \className="animate-in fade-in slide-in-from-bottom-8 opacity-0 fill-mode-forwards duration-500 flex h-full flex-col w-full"
              style={{ animationDelay: \\\\\\ms\\\ }}\
);
clientContent = clientContent.replace(/index \* 40/g, 'index * 40'); // Just safety

fs.writeFileSync('components/CareerDashboardClient.tsx', clientContent);
console.log('Fixed CareerDashboardClient.tsx');
