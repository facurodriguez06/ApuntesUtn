const fs = require('fs');

let code = fs.readFileSync('app/carreras/[careerId]/materias/[id]/page.tsx', 'utf8');

const target = `                const isCreatorFolder =
                  normalizeAuthorName(group.label) === CREATOR_AUTHOR ||        
                  group.notes.every((note) => normalizeAuthorName(note.author) === CREATOR_AUTHOR);

                return (
                  <details
                    key={group.key}
                    open={openFoldersByDefault}
                    className={\`animate-fade-in-up rounded-2xl border open:shadow-sm \${
                      isCreatorFolder
                        ? "border-[#E2C15F] bg-gradient-to-r from-[#FFF8E1] to-[#FFF4CC] open:bg-[#FFFDF5]"
                        : "border-[#EDE6DD] bg-[#FCFAF8] open:bg-white"
                    }\`}
                    style={{ animationDelay: \`\${groupIndex * 60}ms\` }}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl px-4 py-3">
                      <div className={\`flex items-center gap-2 \${isCreatorFolder ? "text-[#7A5A0A]" : "text-[#4A433C]"}\`}>
                        <FolderOpen className={\`w-4 h-4 \${isCreatorFolder ? "text-[#D4AF37]" : "text-[#8BAA91]"}\`} />
                        <h3 className="text-sm font-bold">{group.label}</h3>    
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={\`text-xs font-bold px-2.5 py-1 rounded-full \${
                            isCreatorFolder ? "bg-[#D4AF37] text-white" : \`\${yc.bg} \${yc.text}\`
                          }\`}
                        >
                          {group.notes.length}
                        </span>
                        <ChevronDown className={\`w-4 h-4 \${isCreatorFolder ? "text-[#B78D28]" : "text-[#A89F95]"}\`} />
                      </div>
                    </summary>
                    <div className={\`border-t px-3 pb-3 pt-3 \${isCreatorFolder ? "border-[#E7D39A]" : "border-[#EDE6DD]"}\`}>`;

const replacement = `                const normLabel = normalizeAuthorName(group.label);
                const allSameAuthor = group.notes.length > 0 && group.notes.every((note) => normalizeAuthorName(note.author) === normalizeAuthorName(group.notes[0].author)) ? normalizeAuthorName(group.notes[0].author) : null;
                const isCreatorFolder = normLabel === CREATOR_AUTHOR || allSameAuthor === CREATOR_AUTHOR;
                const customStyleFolder = customStyles[normLabel] || (allSameAuthor ? customStyles[allSameAuthor] : null);

                let wrapperClass = "border-[#EDE6DD] bg-[#FCFAF8] open:bg-white";
                let textClass = "text-[#4A433C]";
                let iconClass = "text-[#8BAA91]";
                let badgeClass = \`\${yc.bg} \${yc.text}\`;
                let chevronClass = "text-[#A89F95]";
                let innerBorderClass = "border-[#EDE6DD]";

                if (isCreatorFolder) {
                  wrapperClass = "border-[#E2C15F] bg-gradient-to-r from-[#FFF8E1] to-[#FFF4CC] open:bg-[#FFFDF5]";
                  textClass = "text-[#7A5A0A]";
                  iconClass = "text-[#D4AF37]";
                  badgeClass = "bg-[#D4AF37] text-white";
                  chevronClass = "text-[#B78D28]";
                  innerBorderClass = "border-[#E7D39A]";
                } else if (customStyleFolder) {
                  wrapperClass = "border-transparent bg-white/50"; // We'll override with inline styles
                  textClass = ""; // Will use inline style
                  iconClass = "";
                  badgeClass = "text-white"; // bg will be inline
                  chevronClass = "";
                  innerBorderClass = "border-transparent"; // Will use inline
                }

                return (
                  <details
                    key={group.key}
                    open={openFoldersByDefault}
                    className={\`animate-fade-in-up rounded-2xl border open:shadow-sm \${wrapperClass}\`}
                    style={{ 
                      animationDelay: \`\${groupIndex * 60}ms\`,
                      ...(customStyleFolder && !isCreatorFolder ? {
                        backgroundColor: customStyleFolder.color + "15",
                        borderColor: customStyleFolder.color + "40"
                      } : {})
                    }}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl px-4 py-3">
                      <div className={\`flex items-center gap-2 \${textClass}\`} style={customStyleFolder && !isCreatorFolder ? { color: customStyleFolder.color } : {}}>
                        <FolderOpen className={\`w-4 h-4 \${iconClass}\`} style={customStyleFolder && !isCreatorFolder ? { color: customStyleFolder.color } : {}} />
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold">{group.label}</h3>
                          {customStyleFolder && !isCreatorFolder && (
                            <span 
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" 
                              style={{ backgroundColor: customStyleFolder.color }}
                            >
                              {customStyleFolder.label}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={\`text-xs font-bold px-2.5 py-1 rounded-full \${badgeClass}\`}
                          style={customStyleFolder && !isCreatorFolder ? { backgroundColor: customStyleFolder.color } : {}}
                        >
                          {group.notes.length}
                        </span>
                        <ChevronDown className={\`w-4 h-4 \${chevronClass}\`} style={customStyleFolder && !isCreatorFolder ? { color: customStyleFolder.color } : {}} />
                      </div>
                    </summary>
                    <div 
                      className={\`border-t px-3 pb-3 pt-3 \${innerBorderClass}\`}
                      style={customStyleFolder && !isCreatorFolder ? { borderColor: customStyleFolder.color + "33" } : {}}
                    >`;

code = code.replace(target, replacement);

fs.writeFileSync('app/carreras/[careerId]/materias/[id]/page.tsx', code);