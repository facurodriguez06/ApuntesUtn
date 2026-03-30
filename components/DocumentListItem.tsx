"use client";

import { Note } from "@/lib/data";
import { FileText, File, FileArchive, Download, Check, User, Eye, Crown } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/context/ToastContext";
import { resolveStorageUrl } from "@/lib/storage";

const tagClass: Record<string, string> = {
  Resumen: "tag-resumen",
  "Examen Resuelto": "tag-examen",
  "Trabajo Práctico": "tag-tp",
  "Guía de Ejercicios": "tag-guia",
};

const CREATOR_AUTHOR = "facundo rodriguez";

const normalizeAuthorName = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const getBgClass = (type: string, isCreator: boolean) => {
  if (isCreator) return "bg-gradient-to-r from-[#FFFDF5] to-[#FFF9E6] border-[#EADAA6] hover:border-[#D4AF37] hover:shadow-[0_8px_24px_rgba(212,175,55,0.15)]";
  switch (type) {
    case "Resumen": return "bg-white border-[#E3DCD2] hover:border-[#8BAA91] hover:shadow-[0_8px_24px_rgba(139,170,145,0.12)]";
    case "Examen Resuelto": return "bg-white border-[#E3DCD2] hover:border-[#D4856A] hover:shadow-[0_8px_24px_rgba(212,133,106,0.12)]";
    case "Trabajo Práctico": return "bg-white border-[#E3DCD2] hover:border-[#9B8BBF] hover:shadow-[0_8px_24px_rgba(155,139,191,0.12)]";
    case "Guía de Ejercicios": return "bg-white border-[#E3DCD2] hover:border-[#7BA7C2] hover:shadow-[0_8px_24px_rgba(123,167,194,0.12)]";
    default: return "bg-white border-[#E3DCD2] hover:border-[#8BAA91] hover:shadow-[0_8px_24px_rgba(139,170,145,0.12)]";
  }
};

const getCreatorTagClass = (type: string) => {
  switch (type) {
    case "Resumen": return "bg-[#4A7A52] text-white border border-[#3A6040]";
    case "Examen Resuelto": return "bg-[#D4856A] text-white border border-[#B36850]";
    case "Trabajo Práctico": return "bg-[#9B8BBF] text-white border border-[#7A6BA3]";
    case "Guía de Ejercicios": return "bg-[#7BA7C2] text-white border border-[#5A87A2]";
    default: return "bg-[#3D3229] text-white";
  }
};

export function DocumentListItem({ note, index = 0 }: { note: Note; index?: number }) {
  const { showToast } = useToast();
  const [downloaded, setDownloaded] = useState(false);
  const isCreatorNote = normalizeAuthorName(note.author ?? "") === CREATOR_AUTHOR;

  const handleVisualizar = () => {
    if (note.fileUrl) {
      window.open(resolveStorageUrl(note.fileUrl), "_blank");
    } else {
      showToast("Este apunte no tiene una URL válida.", "info");
    }
  };

  const handleDownload = () => {
    if (note.fileUrl) {
      setDownloaded(true);

      const link = document.createElement("a");
      link.href = resolveStorageUrl(note.fileUrl);
      link.download = note.title;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => setDownloaded(false), 2500);
    }
  };

  const getIcon = () => {
    switch (note.fileType) {
      case "PDF":
        return <FileText className="w-4 h-4 text-[#D4856A]" />;
      case "ZIP":
        return <FileArchive className="w-4 h-4 text-[#C4A87D]" />;
      case "DOCX":
      default:
        return <File className="w-4 h-4 text-[#7BA7C2]" />;
    }
  };

  return (
    <div
      className={`group relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-xl hover:-translate-y-[2px] transition-all duration-400 animate-fade-in-up ${getBgClass(note.type, isCreatorNote)}`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start gap-3 flex-1 mb-3 sm:mb-0 min-w-0">
        <div
          className={`mt-0.5 shrink-0 p-2.5 rounded-xl border group-hover:scale-110 group-hover:rotate-[-3deg] transition-transform duration-300 ${
            isCreatorNote ? "bg-[#FFF4CC] border-[#E2C15F]" : "bg-[#F5F0EA] border-[#EDE6DD]"
          }`}
        >
          {getIcon()}
        </div>
        <div className="min-w-0">
          <h4
            className={`font-bold text-sm transition-colors truncate ${
              isCreatorNote ? "text-[#7A5A0A] group-hover:text-[#5E4608]" : "text-[#3D3229] group-hover:text-[#4A7A52]"
            }`}
          >
            {note.title}
          </h4>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                isCreatorNote ? "text-[#7A5A0A] bg-[#FFF0B3]" : "text-[#7A6E62] bg-[#F5F0EA]"
              }`}
            >
              <User className="w-2.5 h-2.5" /> {note.author}
            </span>
            {isCreatorNote && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37] text-white shadow-sm">
                <Crown className="w-3 h-3" />
                Creador
              </span>
            )}
            <span className="text-[11px] text-[#A89F95]">{new Date(note.uploadDate).toLocaleDateString("es-AR")}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isCreatorNote ? getCreatorTagClass(note.type) : (tagClass[note.type] || "tag-resumen")}`}>
              {note.type}
            </span>
            {note.fileSize && <span className="text-[11px] text-[#A89F95] font-medium">{note.fileSize}</span>}
          </div>
        </div>
      </div>

      <div className={`flex items-center justify-end w-full sm:w-auto gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 ${isCreatorNote ? "border-[#E7D39A]" : "border-[#EDE6DD]"}`}>
        <button
          onClick={handleVisualizar}
          className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-300 active:scale-95 ${
            isCreatorNote
              ? "bg-[#FFF4CC] text-[#7A5A0A] hover:bg-[#FFE9A3] hover:text-[#5E4608] border border-[#E2C15F]/50"
              : "bg-white text-[#7A6E62] border border-[#EBE3D5] hover:bg-[#FDFBF7] hover:border-[#DED5C7] hover:text-[#3D3229] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
          }`}
          title="Previsualizar"
        >
          <Eye className="w-3.5 h-3.5 mr-1.5" /> Ver
        </button>

        <button
          onClick={handleDownload}
          className={`inline-flex items-center justify-center rounded-lg px-3.5 py-2 text-sm font-semibold border transition-all duration-300 active:scale-95 ${
            downloaded
              ? "bg-[#E8F0EA] text-[#4A7A52] border-[#C5DBC9] shadow-inner"
              : isCreatorNote
                ? "bg-[#D4AF37] text-white border-[#C29D26] shadow-[0_2px_8px_rgba(212,175,55,0.25)] hover:shadow-[0_4px_12px_rgba(212,175,55,0.35)] hover:-translate-y-0.5"
                : "bg-[#8BAA91] text-white border-[#7A9880] shadow-[0_2px_8px_rgba(139,170,145,0.25)] hover:shadow-[0_4px_12px_rgba(139,170,145,0.35)] hover:-translate-y-0.5"
          }`}
        >
          {downloaded ? (
            <>
              <Check className="w-3.5 h-3.5 mr-1 animate-checkmark" /> Listo
            </>
          ) : (
            <>
              Descargar <Download className="w-3.5 h-3.5 ml-1.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
