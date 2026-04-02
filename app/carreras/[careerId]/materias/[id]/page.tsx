import { Fragment } from "react";
import { subjectsData, careersData, yearConfig, type Note } from "@/lib/data";
import { DocumentListItem } from "@/components/DocumentListItem";
import { EmptyState } from "@/components/EmptyState";
import {
  ChevronRight,
  ArrowLeft,
  FileText,
  Plus,
  Sprout,
  BookOpen,
  Microscope,
  Rocket,
  GraduationCap,
  Award,
  FolderOpen,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

const yearIcons: Record<string, React.ElementType> = { Sprout, BookOpen, Microscope, Rocket, GraduationCap, Award };
const GENERAL_FOLDER_KEY = "__general__";
const CREATOR_AUTHOR = "facundo rodriguez";

const getNoteScore = (note: Note) => (note.upvotes ?? 0) - (note.downvotes ?? 0);
const normalizeFolderName = (value?: string | null) => value?.replace(/\s+/g, " ").trim() ?? "";
const normalizeAuthorName = (value?: string | null) =>
  (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

type NoteGroup = {
  key: string;
  label: string;
  notes: Note[];
};

const buildNoteGroups = (notes: Note[]) =>
  Array.from(
    notes.reduce((groups, note) => {
      const folderLabel = normalizeFolderName(note.folderName);
      const key = folderLabel || GENERAL_FOLDER_KEY;
      const existingGroup = groups.get(key);

      if (existingGroup) {
        existingGroup.notes.push(note);
        return groups;
      }

      groups.set(key, {
        key,
        label: folderLabel || "General",
        notes: [note],
      });

      return groups;
    }, new Map<string, NoteGroup>()).values()
  ).sort((a, b) => {
    if (a.key === GENERAL_FOLDER_KEY) return 1;
    if (b.key === GENERAL_FOLDER_KEY) return -1;
    return a.label.localeCompare(b.label, "es-AR");
  });

export default async function SubjectProfile({ params }: { params: Promise<{ careerId: string; id: string }> }) {
  const resolvedParams = await params;
  const subject = subjectsData.find((item) => item.id === resolvedParams.id);
  const career = careersData.find((item) => item.id === resolvedParams.careerId);

  if (!subject || !career) return notFound();

  let realNotes: Note[] = [];
  let customStyles: Record<string, { color: string; label: string }> = {};
  try {
    const globalSnap = await getDoc(doc(db, "settings", "global"));
    if (globalSnap.exists()) customStyles = globalSnap.data().authorStyles || {};
  } catch(e) {}
  
  try {
    const notesQuery = query(
      collection(db, "notes"),
      where("subjectId", "==", resolvedParams.id),
      where("status", "==", "approved")
    );
    const querySnapshot = await getDocs(notesQuery);

    realNotes = querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Note[];

    // Ordenar primero por tipo de archivo, luego por popularidad, luego por título (alfanumérico)
    realNotes.sort((a, b) => {
      if (a.type !== b.type) {
        return (a.type || "").localeCompare(b.type || "");
      }
      
      const scoreDiff = getNoteScore(b) - getNoteScore(a);
      if (scoreDiff !== 0) return scoreDiff;

      return (a.title || "").localeCompare(b.title || "", "es-AR", { numeric: true });
    });
  } catch (err) {
    console.error("Error fetching real notes:", err);
  }

  const yc = yearConfig[subject.year];
  const YearIcon = yearIcons[yc.icon];
  const displayNotes = realNotes;
  const notesCount = displayNotes.length;
  const noteGroups = buildNoteGroups(displayNotes);
  const openFoldersByDefault = noteGroups.length === 1;

  return (
    <div className="relative flex-1 flex flex-col">
      <div className="blob w-72 h-72 top-10 -right-20 animate-blob" style={{ backgroundColor: yc.accent }} />

      <div className="relative z-10 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6">
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center text-sm text-[#A89F95] gap-1.5 flex-wrap">
            <Link href="/" className="hover:text-[#4A7A52] transition-colors">
              Inicio
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/carreras/${career.id}`} className="hover:text-[#4A7A52] transition-colors">
              {career.shortName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#3D3229] font-semibold">{subject.name}</span>
          </div>
          <Link
            href={`/carreras/${career.id}`}
            className="inline-flex items-center text-sm font-semibold text-[#7A6E62] hover:text-[#4A7A52] transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1 group-hover:-translate-x-0.5 transition-transform" /> Volver
          </Link>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-[#EDE6DD] overflow-hidden mb-8 shadow-[0_8px_30px_rgba(61,50,41,0.04)]  z-10 relative">
          <div className="h-1.5 w-full" style={{ background: `linear-gradient(to right, ${yc.accent}, ${yc.accent}88)` }} />
          <div className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${yc.bg}`}>
                  {YearIcon && <YearIcon className={`w-5 h-5 ${yc.text}`} />}
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#3D3229] mb-1">{subject.name}</h1>
                  <p className="text-sm text-[#A89F95]">{career.shortName} · Material compartido por la comunidad</p>
                </div>
              </div>
              <span className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full ${yc.bg} ${yc.text} self-start`}>
                {yc.label}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-[#3D3229] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#8BAA91]" />
            Apuntes
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${yc.bg} ${yc.text}`}>{notesCount}</span>
          </h2>

          <Link
            href="/upload"
            className="inline-flex items-center gap-1 text-sm font-bold text-[#8BAA91] hover:text-[#4A7A52] transition-colors hover:underline underline-offset-2"
          >
            <Plus className="w-3.5 h-3.5" /> Subir nuevo
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {displayNotes.length > 0 ? (
            noteGroups.map((group, groupIndex) => {
              if (group.key === GENERAL_FOLDER_KEY) {
                return group.notes.map((note, index) => {
                  const showSeparator = index === 0 || note.type !== group.notes[index - 1].type;
                  return (
                    <Fragment key={note.id}>
                      {showSeparator && (
                        <div className={`flex items-center gap-3 w-full mb-1 ${index === 0 ? "mt-0" : "mt-4"}`}>
                          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#A89F95] px-3 py-1.5 bg-[#F5F0EA]/80 backdrop-blur-sm rounded-lg border border-[#EDE6DD]">
                            {note.type || "Otros"}
                          </span>
                          <div className="h-[1px] flex-1 bg-gradient-to-r from-[#EDE6DD] to-transparent" />
                        </div>
                      )}
                        <div className="animate-fade-in-up" style={{ animationDelay: `${(index % 10) * 40 + 100}ms` }}>
                          <DocumentListItem note={note} index={index} customStyles={customStyles} />
                        </div>
                      </Fragment>
                  );
                });
              }

              return (() => {
                const normLabel = normalizeAuthorName(group.label);
                const allSameAuthor = group.notes.length > 0 && group.notes.every((note) => normalizeAuthorName(note.author) === normalizeAuthorName(group.notes[0].author)) ? normalizeAuthorName(group.notes[0].author) : null;
                const isCreatorFolder = normLabel === CREATOR_AUTHOR || allSameAuthor === CREATOR_AUTHOR;
                const customStyleFolder = customStyles[normLabel] || (allSameAuthor ? customStyles[allSameAuthor] : null);

                let wrapperClass = "border-[#EDE6DD] bg-[#FCFAF8] open:bg-white";
                let textClass = "text-[#4A433C]";
                let iconClass = "text-[#8BAA91]";
                let badgeClass = `${yc.bg} ${yc.text}`;
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
                  wrapperClass = "border-transparent bg-white"; 
                  textClass = ""; 
                  iconClass = "";
                  badgeClass = "text-white";
                  chevronClass = "";
                  innerBorderClass = "border-transparent"; 
                }

                return (
                  <details
                    key={group.key}
                    open={openFoldersByDefault}
                    className={`animate-fade-in-up rounded-2xl border transition-all hover:shadow-md group/folder z-10 relative ${wrapperClass}`}
                    style={{ 
                      animationDelay: `${groupIndex * 50}ms`,
                      ...(customStyleFolder && !isCreatorFolder ? {
                        backgroundColor: customStyleFolder.color + "10",
                        borderColor: customStyleFolder.color + "40"
                      } : {})
                    }}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl px-4 py-3">
                      <div className={`flex items-center gap-2 ${textClass}`} style={customStyleFolder && !isCreatorFolder ? { color: customStyleFolder.color } : {}}>
                        <FolderOpen className={`w-4 h-4 ${iconClass}`} style={customStyleFolder && !isCreatorFolder ? { color: customStyleFolder.color } : {}} />
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold">{group.label}</h3>
                          {customStyleFolder && !isCreatorFolder && (
                            <span 
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" 
                              style={{ backgroundColor: customStyleFolder.color }}
                            >
                              {customStyleFolder.label}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${badgeClass}`}
                          style={customStyleFolder && !isCreatorFolder ? { backgroundColor: customStyleFolder.color } : {}}
                        >
                          {group.notes.length}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 group-open/folder:rotate-180 ${chevronClass}`} style={customStyleFolder && !isCreatorFolder ? { color: customStyleFolder.color } : {}} />
                      </div>
                    </summary>
                    <div 
                      className={`border-t px-3 pb-3 pt-3 ${innerBorderClass}`}
                      style={customStyleFolder && !isCreatorFolder ? { borderColor: customStyleFolder.color + "33" } : {}}
                    >
                      <div className="flex flex-col gap-3">
                        {group.notes.map((note, index) => {
                          const showSeparator = index === 0 || note.type !== group.notes[index - 1].type;
                          return (
                            <Fragment key={note.id}>
                              {showSeparator && (
                                <div className={`animate-in fade-in fill-mode-forwards opacity-0 duration-500 delay-[200ms] flex items-center gap-3 w-full ${index === 0 ? "mb-1 mt-0" : "my-2"}`}>
                                  <span 
                                    className="text-[10px] font-black uppercase tracking-wider text-[#A89F95] px-2 py-1 bg-[#F5F0EA] rounded-md"
                                    style={customStyleFolder && !isCreatorFolder ? { backgroundColor: customStyleFolder.color + "1A", color: customStyleFolder.color } : {}}
                                  >
                                    {note.type || "Otros"}
                                  </span>
                                  <div 
                                    className="h-[1px] flex-1 bg-gradient-to-r from-[#EDE6DD] to-transparent" 
                                    style={customStyleFolder && !isCreatorFolder ? { backgroundImage: `linear-gradient(to right, ${customStyleFolder.color}40, transparent)` } : {}} 
                                  />
                                </div>
                              )}
                              <div className="animate-fade-in-up" style={{ animationDelay: `${(index % 10) * 40 + 200}ms` }}>
                                <DocumentListItem note={note} index={index} customStyles={customStyles} />
                              </div>
                            </Fragment>
                          );
                        })}
                      </div>
                    </div>
                  </details>
                );
              })();
            })
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}
