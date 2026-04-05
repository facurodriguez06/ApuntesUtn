import { FolderOpen, Upload } from "lucide-react";
import Link from "next/link";

export function EmptyState({ careerId, subjectId, year }: { careerId?: string, subjectId?: string, year?: number } = {}) {
  const uploadHref = careerId && subjectId && year ? `/upload?carrera=${careerId}&materia=${subjectId}&anio=${year}` : "/upload";
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border-2 border-dashed border-[#EDE6DD] rounded-2xl animate-fade-in-up">
      <div className="w-14 h-14 rounded-2xl bg-[#F5F0EA] flex items-center justify-center mb-4">
        <FolderOpen className="w-7 h-7 text-[#A89F95]" />
      </div>
      <h3 className="text-lg font-extrabold text-[#3D3229] mb-2">
        Todavía no hay nada acá
      </h3>
      <p className="text-sm text-[#A89F95] mb-6 max-w-xs leading-relaxed">
        Sé el primero en subir material. Tus compañeros te lo van a agradecer.
      </p>
      <Link 
        href={uploadHref}
        className="inline-flex items-center gap-2 justify-center rounded-xl bg-gradient-to-r from-[#8BAA91] to-[#7CC2A8] px-6 py-2.5 text-sm font-bold text-white hover:shadow-lg hover:shadow-[#8BAA91]/25 transition-all duration-300 hover:scale-[1.03] active:scale-95"
      >
        <Upload className="w-4 h-4" /> Subir un apunte
      </Link>
    </div>
  );
}
