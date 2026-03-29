"use client";

import {
  UploadCloud,
  Check,
  FileType,
  BookOpen,
  X,
  Upload,
  FileText,
  Pencil,
  Send,
  Building2,
} from "lucide-react";
import { useRef, useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { careersData, yearConfig, getSubjectsByCareerAndYear } from "@/lib/data";
import { db } from "@/lib/firebase/config";

type UploadApiResponse = {
  url?: string;
  error?: string;
};

export function UploadModule() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [carrera, setCarrera] = useState("");
  const [anio, setAnio] = useState("");
  const [materia, setMateria] = useState("");
  const [tipo, setTipo] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sanitize = (input: string, maxLen = 120): string =>
    input.replace(/<[^>]*>/g, "").replace(/[<>'"]/g, "").trim().slice(0, maxLen);

  const ALLOWED_TYPES = [".pdf", ".doc", ".docx", ".xlsx", ".zip"];
  const MAX_SIZE_MB = 50;

  const handleFileSelect = (files: FileList | null) => {
    setError("");
    if (!files || files.length === 0) return;

    const selectedFile = files[0];
    const ext = `.${selectedFile.name.split(".").pop()?.toLowerCase()}`;

    if (!ALLOWED_TYPES.includes(ext)) {
      setError(`Tipo de archivo no permitido. Solo: ${ALLOWED_TYPES.join(", ")}`);
      return;
    }

    if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`El archivo excede los ${MAX_SIZE_MB}MB permitidos.`);
      return;
    }

    setFile(selectedFile);
  };

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setAuthor("");
    setCarrera("");
    setAnio("");
    setMateria("");
    setTipo("");
    setError("");
  };

  const handleSubmit = async () => {
    setError("");

    const cleanTitle = sanitize(title);
    const cleanAuthor = sanitize(author) || "Anonimo";

    if (!file || !cleanTitle || !carrera || !anio || !materia || !tipo) {
      setError("Completa todos los campos antes de subir.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(5);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("title", cleanTitle);

      setUploadProgress(20);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const uploadResult = (await uploadResponse.json().catch(() => null)) as UploadApiResponse | null;

      if (!uploadResponse.ok || !uploadResult?.url) {
        throw new Error(uploadResult?.error || "No se pudo subir el archivo.");
      }

      setUploadProgress(85);

      const today = new Date().toISOString().split("T")[0];
      const fileExt = file.name.split(".").pop()?.toUpperCase() || "PDF";

      const newNote = {
        title: cleanTitle,
        author: cleanAuthor,
        uploadDate: today,
        type:
          tipo === "resumen"
            ? "Resumen"
            : tipo === "examen"
              ? "Examen Resuelto"
              : tipo === "tp"
                ? "Trabajo Práctico"
                : "Guía de Ejercicios",
        fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        fileType: fileExt === "DOC" ? "DOCX" : fileExt,
        fileUrl: uploadResult.url,
        status: "pending",
        careerId: carrera,
        subjectId: materia,
        year: parseInt(anio, 10),
      };

      await addDoc(collection(db, "notes"), newNote);
      setUploadProgress(100);
      setSubmitted(true);

      setTimeout(() => {
        setSubmitted(false);
        resetForm();
      }, 4000);
    } catch (err: unknown) {
      console.error("DETALLE DEL ERROR:", err);
      const message = err instanceof Error ? err.message : "Hubo un problema al subir.";
      setError(message);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 300);
    }
  };

  const isValid = file && sanitize(title) && carrera && (carrera === "basicas" ? true : anio) && materia && tipo;

  const selectedCareer = careersData.find((career) => career.id === carrera);
  const availableYears = selectedCareer
    ? Array.from({ length: selectedCareer.maxYears }, (_, index) => index + 1)
    : [];
  const availableSubjects = carrera && anio ? getSubjectsByCareerAndYear(carrera, parseInt(anio, 10)) : [];

  const handleCarreraChange = (value: string) => {
    setCarrera(value);
    if (value === "basicas") {
      setAnio("1");
    } else {
      setAnio("");
    }
    setMateria("");
  };

  const handleAnioChange = (value: string) => {
    setAnio(value);
    setMateria("");
  };

  if (submitted) {
    return (
      <div className="w-full max-w-lg mx-auto bg-white rounded-2xl border border-[#C5DBC9] overflow-hidden animate-fade-in-scale shadow-lg shadow-[#8BAA91]/10">
        <div className="h-1.5 bg-gradient-to-r from-[#8BAA91] to-[#7CC2A8]" />
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#E8F0EA] flex items-center justify-center mb-4">
            <Check className="w-7 h-7 text-[#4A7A52] animate-checkmark" />
          </div>
          <h2 className="text-xl font-extrabold text-[#3D3229] mb-2">Gracias por colaborar</h2>
          <p className="text-sm text-[#7A6E62] leading-relaxed">
            Tu apunte fue subido con exito.
            <br />
            Tus companeros te lo van a agradecer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="blob w-52 h-52 bg-[#C5DBC9] -top-16 -left-16 animate-blob" />
      <div className="blob w-40 h-40 bg-[#D5CCE5] -bottom-16 -right-16 animate-blob" style={{ animationDelay: "3s" }} />

      <div className="relative bg-white rounded-2xl border border-[#EDE6DD] overflow-hidden shadow-sm z-10">
        <div className="h-1.5 bg-gradient-to-r from-[#8BAA91] via-[#7CC2A8] to-[#7BA7C2]" />

        <div className="p-5 border-b border-[#EDE6DD]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E8F0EA] flex items-center justify-center">
              <Upload className="w-4 h-4 text-[#4A7A52]" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#3D3229]">Subir apunte</h2>
              <p className="text-xs text-[#A89F95]">Comparti tu material y ayuda a la cursada.</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {!file ? (
            <div
              className={`relative flex flex-col items-center justify-center w-full py-10 px-4 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer group ${
                isDragging
                  ? "border-[#8BAA91] bg-[#E8F0EA] scale-[1.01]"
                  : "border-[#EDE6DD] bg-[#FFFBF7] hover:bg-[#F5F0EA] hover:border-[#C5DBC9]"
              }`}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                handleFileSelect(event.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="w-10 h-10 text-[#A89F95] mb-3 group-hover:text-[#8BAA91] transition-colors" />
              <p className="text-sm text-[#7A6E62] font-semibold mb-1">Arrastra un archivo o hace click</p>
              <p className="text-xs text-[#A89F95]">PDF, DOCX, XLSX o ZIP (Max. 50MB)</p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.xlsx,.zip"
                onChange={(event) => handleFileSelect(event.target.files)}
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#E8F0EA] border border-[#C5DBC9] animate-fade-in-scale">
              <FileText className="w-5 h-5 text-[#4A7A52]" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#3D3229] truncate">{file.name}</p>
                <p className="text-xs text-[#4A7A52]">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setFile(null);
                }}
                className="p-1.5 rounded-lg hover:bg-[#C5DBC9] text-[#4A7A52] transition-all active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-[#3D3229] mb-1.5">
                <Pencil className="w-3.5 h-3.5 text-[#A89F95]" /> Titulo
              </label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ej. Resumen completo primer parcial"
                maxLength={120}
                className="w-full rounded-xl border border-[#EDE6DD] px-3.5 py-2.5 text-sm text-[#3D3229] placeholder:text-[#A89F95] focus:border-[#8BAA91] focus:outline-none focus:ring-2 focus:ring-[#8BAA91]/20 bg-white transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-[#3D3229] mb-1.5">
                <Pencil className="w-3.5 h-3.5 text-[#A89F95]" /> Tu nombre (opcional)
              </label>
              <input
                type="text"
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                placeholder="Ej. Juan Perez"
                maxLength={50}
                className="w-full rounded-xl border border-[#EDE6DD] px-3.5 py-2.5 text-sm text-[#3D3229] placeholder:text-[#A89F95] focus:border-[#8BAA91] focus:outline-none focus:ring-2 focus:ring-[#8BAA91]/20 bg-white transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-[#3D3229] mb-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#A89F95]" /> Carrera
              </label>
              <select
                value={carrera}
                onChange={(event) => handleCarreraChange(event.target.value)}
                className="w-full rounded-xl border border-[#EDE6DD] px-3.5 py-2.5 text-sm text-[#3D3229] focus:border-[#8BAA91] focus:outline-none focus:ring-2 focus:ring-[#8BAA91]/20 bg-white transition-all"
              >
                <option value="">Seleccionar...</option>
                {careersData.map((career) => (
                  <option key={career.id} value={career.id}>
                    {career.shortName}
                  </option>
                ))}
              </select>
            </div>

            {carrera !== "basicas" && (
              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-[#3D3229] mb-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#A89F95]" /> Año
                </label>
                <select
                  value={anio}
                  onChange={(event) => handleAnioChange(event.target.value)}
                  disabled={!carrera}
                  className="w-full rounded-xl border border-[#EDE6DD] px-3.5 py-2.5 text-sm text-[#3D3229] focus:border-[#8BAA91] focus:outline-none focus:ring-2 focus:ring-[#8BAA91]/20 bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Seleccionar...</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {yearConfig[year]?.label || `Año ${year}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-[#3D3229] mb-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#A89F95]" /> Materia
              </label>
              <select
                value={materia}
                onChange={(event) => setMateria(event.target.value)}
                disabled={!carrera || !anio}
                className="w-full rounded-xl border border-[#EDE6DD] px-3.5 py-2.5 text-sm text-[#3D3229] focus:border-[#8BAA91] focus:outline-none focus:ring-2 focus:ring-[#8BAA91]/20 bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Seleccionar...</option>
                {availableSubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-[#3D3229] mb-1.5">
                <FileType className="w-3.5 h-3.5 text-[#A89F95]" /> Tipo
              </label>
              <select
                value={tipo}
                onChange={(event) => setTipo(event.target.value)}
                className="w-full rounded-xl border border-[#EDE6DD] px-3.5 py-2.5 text-sm text-[#3D3229] focus:border-[#8BAA91] focus:outline-none focus:ring-2 focus:ring-[#8BAA91]/20 bg-white transition-all"
              >
                <option value="">Seleccionar...</option>
                <option value="resumen">Resumen</option>
                <option value="examen">Examen Resuelto</option>
                <option value="tp">Trabajo Práctico</option>
                <option value="guia">Guia de Ejercicios</option>
              </select>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 flex flex-col gap-3 border-t border-[#EDE6DD] bg-[#FFFBF7]">
          {isUploading && (
            <div className="w-full space-y-1.5 animate-fade-in">
              <div className="flex justify-between text-[11px] font-bold text-[#4A7A52]">
                <span>Subiendo archivo...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#E8F0EA] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#8BAA91] to-[#7CC2A8] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="text-xs font-semibold text-[#8E5A5A] bg-[#F5E8E8] px-3 py-2 rounded-xl border border-[#E2CECE] animate-shake">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={resetForm}
              disabled={isUploading}
              className="px-4 py-2 text-sm font-semibold text-[#7A6E62] hover:text-[#3D3229] rounded-xl hover:bg-[#F5F0EA] transition-all active:scale-95 disabled:opacity-50"
            >
              Limpiar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid || isUploading}
              className={`inline-flex items-center gap-1.5 px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 active:scale-95 ${
                isValid && !isUploading
                  ? "bg-gradient-to-r from-[#8BAA91] to-[#7CC2A8] text-white shadow-md hover:shadow-lg hover:shadow-[#8BAA91]/25 hover:scale-[1.02]"
                  : "bg-[#EDE6DD] text-[#A89F95] cursor-not-allowed"
              }`}
            >
              {isUploading ? "Cargando..." : "Subir apunte"} <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
