"use client";

import { Search, X, ChevronRight, FileText, BookMarked } from "lucide-react";
import { useEffect, useState, useMemo, useRef, ReactNode } from "react";
import { createPortal } from "react-dom";
import { subjectsData, careersData, yearConfig } from "@/lib/data";
import { Sprout, BookOpen, Microscope, Rocket, GraduationCap, Award } from "lucide-react";
import Link from "next/link";

const yearIcons: Record<string, React.ElementType> = { Sprout, BookOpen, Microscope, Rocket, GraduationCap, Award };

const tagClass: Record<string, string> = {
  'Resumen': 'tag-resumen',
  'Examen Resuelto': 'tag-examen',
  'Trabajo Práctico': 'tag-tp',
  'Guía de Ejercicios': 'tag-guia',
};

export function GlobalSearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Usamos la tecla "/" (barra diagonal) como atajo rápido universal
      // Verificamos que el usuario no esté escribiendo en un input o textarea
      if (e.key === "/" && e.target instanceof HTMLElement && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") { setIsOpen(false); setQuery(""); }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const subjectMatches = subjectsData
      .filter(s => s.name.toLowerCase().includes(q)).slice(0, 5)
      .map(s => ({ type: 'subject' as const, subject: s }));
    const noteMatches = subjectsData
      .flatMap(s => s.notes.map(n => ({ note: n, subject: s })))
      .filter(({ note }) => note.title.toLowerCase().includes(q) || note.author.toLowerCase().includes(q)).slice(0, 5)
      .map(match => ({ type: 'note' as const, ...match }));
    return [...subjectMatches, ...noteMatches];
  }, [query]);

  return (
    <>
      <div className="w-full max-w-lg mx-auto animate-fade-in-up">
        <button 
          onClick={() => setIsOpen(true)}
          className="relative flex items-center w-full h-12 rounded-2xl border border-[#EDE6DD] bg-white/80 backdrop-blur-sm overflow-hidden hover:border-[#C5DBC9] hover:shadow-md hover:shadow-[#8BAA91]/10 transition-all duration-300 cursor-text group"
        >
          <div className="pl-4 pr-3 flex items-center text-[#A89F95] group-hover:text-[#8BAA91] transition-colors duration-300">
            <Search className="w-5 h-5" />
          </div>
          <span className="flex-1 text-left text-[#A89F95] text-sm">
            Buscar materia o apunte...
          </span>
          <div className="pr-3 hidden sm:flex items-center gap-1">
            <kbd className="px-2 py-0.5 rounded-md bg-[#F5F0EA] text-[11px] font-bold text-[#A89F95] border border-[#EDE6DD]">/</kbd>
          </div>
        </button>
      </div>
      
      {isOpen && typeof document !== "undefined" && createPortal(
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[15vh] bg-black/20 backdrop-blur-sm px-4" 
          onClick={() => { setIsOpen(false); setQuery(""); }}
        >
          <div 
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl shadow-black/10 overflow-hidden border border-[#EDE6DD] animate-fade-in-scale" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center px-4 py-3 border-b border-[#EDE6DD] bg-gradient-to-r from-white to-[#FFFBF7]">
              <Search className="w-4 h-4 text-[#8BAA91] mr-3 shrink-0" />
              <input 
                ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Buscar materia, apunte o autor..."
                className="flex-1 outline-none text-base text-[#3D3229] bg-transparent placeholder:text-[#A89F95]"
              />
              {query && (
                <button onClick={() => setQuery("")} className="p-1 rounded-lg hover:bg-[#F5F0EA] text-[#A89F95] transition-colors mr-2 active:scale-90">
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="px-2 py-0.5 rounded-lg bg-[#F5F0EA] border border-[#EDE6DD] text-[10px] font-bold text-[#A89F95] cursor-pointer hover:bg-[#EDE6DD] transition-all" onClick={() => { setIsOpen(false); setQuery(""); }}>
                ESC
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {query.trim() === "" ? (
                <div className="px-4 py-10 text-center">
                  <Search className="w-8 h-8 text-[#EDE6DD] mx-auto mb-3" />
                  <p className="text-sm text-[#A89F95]">Escribí algo para buscar entre materias y apuntes</p>
                </div>
              ) : results.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <FileText className="w-8 h-8 text-[#EDE6DD] mx-auto mb-3" />
                  <p className="text-sm text-[#A89F95]">No encontramos resultados para &ldquo;{query}&rdquo;</p>
                </div>
              ) : (
                <div className="py-1.5 stagger-children">
                  {results.map((r, i) => {
                    const yr = r.subject.year;
                    const yc = yearConfig[yr];
                    const YearIcon = yearIcons[yc.icon];
                    return (
                      <Link 
                        key={i}
                        href={`/carreras/${r.subject.careerId}/materias/${r.subject.id}`}
                        onClick={() => { setIsOpen(false); setQuery(""); }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F5F0EA] transition-all group cursor-pointer animate-fade-in-up"
                      >
                        <span className={`flex items-center justify-center w-7 h-7 rounded-lg ${yc.bg}`}>
                          {YearIcon && <YearIcon className={`w-3.5 h-3.5 ${yc.text}`} />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#3D3229] truncate group-hover:text-[#4A7A52] transition-colors">
                            {r.type === 'subject' ? r.subject.name : r.note.title}
                          </p>
                          <p className="text-[11px] text-[#A89F95] truncate">
                            {r.type === 'subject' 
                              ? `${careersData.find(c => c.id === r.subject.careerId)?.shortName || ''} · ${yc.label} · ${r.subject.notesCount} apuntes`
                              : `en ${r.subject.name} · por ${r.note.author}`
                            }
                          </p>
                        </div>
                        {r.type === 'note' && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tagClass[r.note.type]}`}>
                            {r.note.type}
                          </span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-[#A89F95] group-hover:text-[#8BAA91] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
