"use client";

import { useState } from "react";
import { subjectsData, careersData, yearConfig } from "@/lib/data";
import { SubjectCard } from "@/components/SubjectCard";
import { ChevronRight, Monitor, Sprout, BookOpen, Microscope, Rocket, GraduationCap, FileText } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const years = [1, 2, 3, 4, 5];

const yearIcons: Record<string, React.ElementType> = { Sprout, BookOpen, Microscope, Rocket, GraduationCap };

export default function SistemasDashboard() {
  const [activeYear, setActiveYear] = useState(1);
  const career = careersData.find(c => c.id === 'sistemas');
  const yc = yearConfig[activeYear];
  const filteredSubjects = subjectsData.filter(s => s.year === activeYear);
  const totalNotesThisYear = filteredSubjects.reduce((acc, s) => acc + s.notesCount, 0);

  return (
    <div className="relative flex-1 flex flex-col">
      <div 
        className="blob w-80 h-80 top-10 -right-32 animate-blob transition-colors duration-700" 
        style={{ backgroundColor: yc.accent }} 
      />

      <div className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6">
        
        <div className="mb-5 flex items-center text-sm text-[#A89F95] gap-1.5">
          <Link href="/" className="hover:text-[#4A7A52] transition-colors">Inicio</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#3D3229] font-semibold">{career?.shortName}</span>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <Monitor className="w-6 h-6 text-[#4A7A52]" />
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#3D3229] tracking-tight">
                {career?.shortName}
              </h1>
            </div>
            <p className="text-sm text-[#7A6E62]">
              Plan 2023 · {filteredSubjects.length} materias en {yc.label.toLowerCase()}
            </p>
          </div>
          
          <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-500", yc.bg, yc.text)}>
            <FileText className="w-3 h-3" />
            {totalNotesThisYear} apuntes disponibles
          </div>
        </div>

        {/* Year Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-1">
          {years.map((year) => {
            const yConf = yearConfig[year];
            const isActive = activeYear === year;
            const YearIcon = yearIcons[yConf.icon];
            return (
              <button
                key={year}
                onClick={() => setActiveYear(year)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 shrink-0 active:scale-95",
                  isActive
                    ? "text-white shadow-lg"
                    : "bg-white text-[#7A6E62] border border-[#EDE6DD] hover:shadow-sm"
                )}
                style={isActive ? { backgroundColor: yConf.accent, boxShadow: `0 4px 14px -3px ${yConf.accent}40` } : {}}
              >
                {YearIcon && <YearIcon className="w-4 h-4" />}
                {yConf.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children" key={activeYear}>
          {filteredSubjects.map(subject => (
            <div key={subject.id} className="animate-fade-in-up">
              <SubjectCard subject={subject} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
