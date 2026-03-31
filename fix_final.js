const fs = require("fs");

let fileStr = fs.readFileSync("components/GlobalSearchBar.tsx", "utf8");

fileStr = fileStr.replace(
  'import { useEffect, useState, useMemo, useRef, ReactNode } from "react";',
  `import { useEffect, useState, useMemo, useRef, ReactNode } from "react";
import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useScrollLock } from "@/hooks/useScrollLock";`
);

const oldState = `  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);`;
  
const newState = `  const [isOpen, setIsOpen] = useState(false);
  const [queryState, setQueryState] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [notes, setNotes] = useState([]);

  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      const fetchNotes = async () => {
        try {
          const notesRef = collection(db, "notes");
          const q = query(notesRef, where("status", "==", "approved"));
          const snapshot = await getDocs(q);
          const notesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setNotes(notesList);
        } catch (error) {
          console.error("Error fetching notes:", error);
        }
      };
      fetchNotes();
    }
  }, [isOpen]);`;

fileStr = fileStr.replace(oldState, newState);
fileStr = fileStr.replace(/query,/g, "queryState,");
fileStr = fileStr.replace(/setQuery\(/g, "setQueryState(");
fileStr = fileStr.replace(/query \? /g, "queryState ? ");
fileStr = fileStr.replace(/value=\{query\}/g, "value={queryState}");


const repNewRes = `  const { subjectMatches, noteMatches } = useMemo(() => {
    if (!queryState.trim()) return { subjectMatches: [], noteMatches: [] };
    const qText = queryState.toLowerCase();
    
    const subMatches = subjectsData
      .filter(s => s.name.toLowerCase().includes(qText)).slice(0, 5)
      .map(s => {
        const count = notes.filter(n => n.subjectId === s.id).length;
        return { type: "subject", subject: { ...s, notesCount: count } };
      });
      
    const notMatches = notes
      .filter(note => note.title?.toLowerCase().includes(qText) || note.author?.toLowerCase().includes(qText))
      .slice(0, 5)
      .map(note => {
        const subject = subjectsData.find(s => s.id === note.subjectId) || subjectsData[0];
        return { type: "note", note, subject };
      });
      
    return { subjectMatches: subMatches, noteMatches: notMatches };
  }, [queryState, notes]);
  
  const hasResults = subjectMatches.length > 0 || noteMatches.length > 0;`;

fileStr = fileStr.replace(/const results = useMemo\(\(\) => \{[\s\S]*?return \[\.\.\.subjectMatches, \.\.\.noteMatches\];\r?\n  \}, \[query\]\);/, repNewRes);
fileStr = fileStr.replace(/results\.length === 0/g, "!hasResults");

const startText = "{results.map((r, i) => {";
const endText = "                  })}";
const sIdx = fileStr.indexOf(startText);
const eIdx = fileStr.indexOf(endText, sIdx);

if (sIdx !== -1 && eIdx !== -1) {
  const replaceUI = fileStr.substring(sIdx, eIdx + endText.length);
  const inject = `                  {subjectMatches.length > 0 && (
                    <div className="px-4 py-1.5 text-[10px] font-extrabold text-[#A89F95] uppercase tracking-wider bg-[#F9F7F4] border-y border-[#EDE6DD] mt-1 mb-1 first:mt-0">
                      Materias
                    </div>
                  )}
                  {subjectMatches.map((r, i) => {
                    const yr = r.subject.year;
                    const yc = yearConfig[yr];
                    const YearIcon = yearIcons[yc.icon];
                    return (
                      <Link
                        key={"sub-" + i}
                        href={\`/carreras/\${r.subject.careerId}/materias/\${r.subject.id}\`}
                        onClick={() => { setIsOpen(false); setQueryState(""); }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F5F0EA] transition-all group cursor-pointer animate-fade-in-up"
                      >
                        <span className={\`flex items-center justify-center w-7 h-7 rounded-lg \${yc.bg}\`}>
                          {YearIcon && <YearIcon className={\`w-3.5 h-3.5 \${yc.text}\`} />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#3D3229] truncate group-hover:text-[#4A7A52] transition-colors">
                            {r.subject.name}
                          </p>
                          <p className="text-[11px] text-[#A89F95] truncate">
                            {\`\${careersData.find(c => c.id === r.subject.careerId)?.shortName || ""} \${r.subject.careerId === "basicas" ? "" : \`· \${yc.label}\`} · \${r.subject.notesCount} apunte\${r.subject.notesCount !== 1 ? "s" : ""}\`}
                          </p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-[#A89F95] group-hover:text-[#8BAA91] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </Link>
                    );
                  })}
                  
                  {noteMatches.length > 0 && (
                    <div className="px-4 py-1.5 text-[10px] font-extrabold text-[#A89F95] uppercase tracking-wider bg-[#F9F7F4] border-y border-[#EDE6DD] mt-2 mb-1 first:mt-0">
                      Apuntes
                    </div>
                  )}
                  {noteMatches.map((r, i) => {
                    const yr = r.subject.year;
                    const yc = yearConfig[yr];
                    const YearIcon = yearIcons[yc.icon];
                    return (
                      <Link
                        key={"not-" + i}
                        href={\`/carreras/\${r.subject.careerId}/materias/\${r.subject.id}\`}
                        onClick={() => { setIsOpen(false); setQueryState(""); }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F5F0EA] transition-all group cursor-pointer animate-fade-in-up"
                      >
                        <span className={\`flex items-center justify-center w-7 h-7 rounded-lg \${yc.bg}\`}>
                          {YearIcon && <YearIcon className={\`w-3.5 h-3.5 \${yc.text}\`} />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#3D3229] truncate group-hover:text-[#4A7A52] transition-colors">
                            {r.note.title}
                          </p>
                          <p className="text-[11px] text-[#A89F95] truncate">
                            {\`en \${r.subject.name} · por \${r.note.author}\`}
                          </p>
                        </div>
                        <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full \${tagClass[r.note.type] || "bg-[#F5F5F5] text-[#A89F95]"}\`}>
                          {r.note.type}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#A89F95] group-hover:text-[#8BAA91] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </Link>
                    );
                  })}`;
  fileStr = fileStr.replace(replaceUI, inject);
  fs.writeFileSync("components/GlobalSearchBar.tsx", fileStr);
  console.log("SUCCESS!");
} else {
  console.log("UI no encontrada");
}
