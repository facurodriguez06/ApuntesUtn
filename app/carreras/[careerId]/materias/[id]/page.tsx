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
import { collection, query, where, getDocs } from "firebase/firestore";

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

    // Ordenar primero por tipo de archivo, luego por popularidad
    realNotes.sort((a, b) => {
      if (a.type !== b.type) {
        return (a.type || "").localeCompare(b.type || "");
      }
      return getNoteScore(b) - getNoteScore(a);
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

        <div className="bg-white rounded-2xl border border-[#EDE6DD] overflow-hidden mb-6 animate-fade-in-up">
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
            noteGroups.map((group, groupIndex) => (
              (() => {
                const isCreatorFolder =
                  normalizeAuthorName(group.label) === CREATOR_AUTHOR ||
                  group.notes.every((note) => normalizeAuthorName(note.author) === CREATOR_AUTHOR);

                return (
                  <details
                    key={group.key}
                    open={openFoldersByDefault}
                    className={`animate-fade-in-up rounded-2xl border open:shadow-sm ${
                      isCreatorFolder
                        ? "border-[#E2C15F] bg-gradient-to-r from-[#FFF8E1] to-[#FFF4CC] open:bg-[#FFFDF5]"
                        : "border-[#EDE6DD] bg-[#FCFAF8] open:bg-white"
                    }`}
                    style={{ animationDelay: `${groupIndex * 60}ms` }}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl px-4 py-3">
                      <div className={`flex items-center gap-2 ${isCreatorFolder ? "text-[#7A5A0A]" : "text-[#4A433C]"}`}>
                        <FolderOpen className={`w-4 h-4 ${isCreatorFolder ? "text-[#D4AF37]" : "text-[#8BAA91]"}`} />
                        <h3 className="text-sm font-bold">{group.label}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            isCreatorFolder ? "bg-[#D4AF37] text-white" : `${yc.bg} ${yc.text}`
                          }`}
                        >
                          {group.notes.length}
                        </span>
                        <ChevronDown className={`w-4 h-4 ${isCreatorFolder ? "text-[#B78D28]" : "text-[#A89F95]"}`} />
                      </div>
                    </summary>
                    <div className={`border-t px-3 pb-3 pt-3 ${isCreatorFolder ? "border-[#E7D39A]" : "border-[#EDE6DD]"}`}>
                      <div className="flex flex-col gap-3">
                        {group.notes.map((note, index) => (
                          <DocumentListItem key={note.id} note={note} index={index} />
                        ))}
                      </div>
                    </div>
                  </details>
                );
              })()
            ))
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}
