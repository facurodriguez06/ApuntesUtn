import Link from "next/link";
import { Subject, yearConfig } from "@/lib/data";
import { ChevronRight, FileText, Inbox } from "lucide-react";

export function SubjectCard({ subject, careerId }: { subject: Subject; careerId?: string }) {
  const hasNotes = subject.notesCount > 0;
  const yc = yearConfig[subject.year];

  return (
    <Link
      href={`/carreras/${subject.careerId}/materias/${subject.id}`}
      className="group flex flex-col justify-between rounded-xl border border-[#E3DCD2] bg-white p-4 hover:-translate-y-1 hover:border-[#B2C7B6] hover:shadow-[0_8px_24px_rgba(139,170,145,0.12)] transition-all duration-400 relative overflow-hidden"
    >
      <div 
        className="absolute top-0 right-0 w-16 h-16 rounded-bl-[40px] opacity-[0.12] transition-opacity duration-300 group-hover:opacity-[0.25]" 
        style={{ backgroundColor: yc.accent }}
      />
      
      <div className="relative z-10">
        <h3 className="font-bold text-[#3D3229] text-[15px] leading-snug group-hover:text-[#4A7A52] transition-colors duration-200 mb-3 pr-6">
          {subject.name}
        </h3>
          {subject.isElective && (
            <span className="inline-block mt-0 mb-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 rounded-md border border-purple-200">
              Electiva
            </span>
          )}
        <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
          hasNotes 
            ? `${yc.bg} ${yc.text}` 
            : 'bg-[#F5F0EA] text-[#A89F95]'
        }`}>
          {hasNotes 
            ? <><FileText className="w-3 h-3" /> {subject.notesCount} apuntes</>
            : <><Inbox className="w-3 h-3" /> Sin apuntes</>
          }
        </div>
      </div>
      <div className="flex items-center text-[13px] font-semibold text-[#8BAA91] mt-4 group-hover:text-[#4A7A52] relative z-10">
        Ver material <ChevronRight className="w-3.5 h-3.5 ml-0.5 transition-transform duration-200 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
