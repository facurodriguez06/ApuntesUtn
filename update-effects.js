const fs = require('fs');

let fileContent = fs.readFileSync('app/planes/page.tsx', 'utf-8');

// 1. Update Career Selector buttons
fileContent = fileContent.replace(
  /className=\\\[\\s\\S]*?hover:bg-white\\/60'[\\s\\S]*?\\}\\s*\\\/g,
  \className={\\\
                    relative px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2.5 active:scale-95
                    \\\
                  \\\}\
);

// 2. Update Year Selector buttons
fileContent = fileContent.replace(
  /className=\\\[\\s\\S]*?hover:bg-white\\/50'\\}\\s*\\\/g,
  \className={\\\
                  relative px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap active:scale-95
                  \\\
                \\\}\
);

// 3. Update Subjects mapping to include index for animation delay
fileContent = fileContent.replace(
  /\\{subjects\\.map\\(subject => \\{/g,
  \{subjects.map((subject, index) => {\
);

// 4. Update the Subject Cards classes and icon hover rotation
fileContent = fileContent.replace(
  /let cardStyle = "bg-white border-\\[#E8F0EA\\] hover:border-\\[#8BAA91\\]\\/40 hover:shadow-md hover:-translate-y-0\\.5";/,
  \let cardStyle = "bg-white border-[#E8F0EA] hover:border-[#8BAA91]/40 hover:shadow-xl hover:shadow-[#8BAA91]/10 hover:-translate-y-1";\
);

// Inject animation styles
fileContent = fileContent.replace(
  /className=\\\[\\s\\S]*?cursor-pointer group min-h-\\[120px\\][\\s\\S]*?\\$\\{cardStyle\\}\\s*\\\/g,
  \className={\\\
                        relative p-4 rounded-2xl border transition-all duration-500 ease-out cursor-pointer group min-h-[120px] flex flex-col overflow-hidden
                        animate-in slide-in-from-bottom-6 fade-in fill-mode-forwards opacity-0 z-0 hover:z-20
                        \\\
                      \\\}
                      style={{ animationDelay: \\\\\\ms\\\ }}\
);

// Decorative blob + Icon rotation
fileContent = fileContent.replace(
  /\\{getSubjectIcon\\(subject.name,[\\s\\S]*?\\)\\}/g,
  \<div className="absolute -bottom-6 -right-6 w-24 h-24 bg-current opacity-[0.03] rounded-full group-hover:scale-[2.5] transition-transform duration-700 ease-out z-0 pointer-events-none" />\n                        {getSubjectIcon(subject.name, \\\w-5 h-5 \\\ group-hover:text-[#8BAA91] group-hover:scale-125 group-hover:-rotate-12 transition-all duration-500 ease-out shrink-0 relative z-10\\\)}\
);

// Bring code label and title above the decorative blob
fileContent = fileContent.replace(
  /<span className="text-xs font-mono font-medium text-\\[#A0A0A0\\] bg-\\[#F5F5F5\\] px-2 py-1/g,
  \<span className="relative z-10 text-xs font-mono font-medium text-[#A0A0A0] bg-[#F5F5F5] px-2 py-1\
);

fileContent = fileContent.replace(
  /<h4 className=\\{\\\ont-semibold text-sm leading-tight text-\\[#3D3229\\] transition-colors mt-auto\\\\\}>/g,
  \<h4 className={\\\elative z-10 font-semibold text-sm leading-tight text-[#3D3229] transition-colors mt-auto\\\}>\
);
fileContent = fileContent.replace(
  /<div className="mt-4 flex items-center gap-1 text-\\[10px\\] uppercase tracking-wider font-bold text-\\[#8BAA91\\] opacity-0 group-hover:opacity-100 transition-opacity">/g,
  \<div className="relative z-10 mt-4 flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-[#8BAA91] opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 text-shadow-sm">\
);

// 5. Sidebar enhancements - change to cubic-bezier duration
fileContent = fileContent.replace(
  /animate-in slide-in-from-right-8 duration-300"/g,
  \nimate-in slide-in-from-right-8 fade-in duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[-10px_0_30px_rgba(0,0,0,0.02)]"\
);

// Add stagger to Requirements list items
fileContent = fileContent.replace(
  /className="p-3 bg-\\[#F9F9F9\\] border border-\\[#E0E0E0\\] rounded-xl flex items-center justify-between group\\/item/g,
  \className="animate-in slide-in-from-right-4 fade-in duration-700 fill-mode-forwards opacity-0 p-3 bg-[#F9F9F9] border border-[#E0E0E0] rounded-xl flex items-center justify-between group/item hover:bg-[#F4FBFA]/60 hover:shadow-sm"\
);

fs.writeFileSync('app/planes/page.tsx', fileContent);
console.log('Effects added to page.tsx');
