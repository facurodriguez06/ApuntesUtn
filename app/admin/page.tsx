"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { FirebaseError } from "firebase/app";
import {
  Check,
  X,
  FileText,
  ShieldAlert,
  Lock,
  ExternalLink,
  LogOut,
  UserPlus,
  Loader2,
  Trash2,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Note } from "@/lib/data";
import { useAuth } from "@/context/AuthContext";
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { auth, app as primaryApp, db } from "@/lib/firebase/config";
import { initializeApp, getApps } from "firebase/app";
import { collection, query, where, onSnapshot, updateDoc, deleteDoc, doc } from "firebase/firestore";

type AuthError = Partial<FirebaseError> & {
  message?: string;
};

const toAuthError = (error: unknown): AuthError =>
  (typeof error === "object" && error !== null ? error : {}) as AuthError;

const normalizeFolderName = (value: string) =>
  value.replace(/<[^>]*>/g, "").replace(/[<>"']/g, "").replace(/\s+/g, " ").trim().slice(0, 60);

const getFolderLabel = (note: Note) => normalizeFolderName(note.folderName ?? "");

const mapSnapshotToNotes = (snapshot: { docs: Array<{ id: string; data: () => object }> }) =>
  (snapshot.docs
    .map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Note[]).sort(
    (a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
  );

function NoteCard({
  note,
  actions,
  extraContent,
}: {
  note: Note;
  actions: ReactNode;
  extraContent?: ReactNode;
}) {
  const folderLabel = getFolderLabel(note);

  return (
    <div className="group flex flex-col gap-4 p-5 rounded-2xl border border-[#EDE6DD] hover:border-[#C4A87D] hover:shadow-md transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#F5EFE5] text-[#8B7355] rounded-xl flex items-center justify-center shrink-0 border border-[#E2D6C2]">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#2C2825] leading-tight mb-1">{note.title}</h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#7A6E62]">
              <span className="font-medium text-[#8B7355]">{note.type}</span>
              <span className="w-1 h-1 rounded-full bg-[#D5CAC0]"></span>
              <span>
                Subido por: <strong className="text-[#4A433C]">{note.author}</strong>
              </span>
              <span className="w-1 h-1 rounded-full bg-[#D5CAC0]"></span>
              <span>{note.uploadDate}</span>
              <span className="w-1 h-1 rounded-full bg-[#D5CAC0]"></span>
              <span>
                {note.fileType} ({note.fileSize})
              </span>
              {folderLabel && (
                <>
                  <span className="w-1 h-1 rounded-full bg-[#D5CAC0]"></span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F0EA] px-2 py-0.5 text-xs font-semibold text-[#4A7A52]">
                    <FolderOpen className="w-3 h-3" />
                    {folderLabel}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex w-full sm:w-auto items-center gap-2 mt-2 sm:mt-0 pt-4 sm:pt-0 border-t border-[#EDE6DD] sm:border-0">
          {actions}
        </div>
      </div>

      {extraContent}
    </div>
  );
}

function EmptySection({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="text-center py-16 animate-fade-in">
      <div className="w-20 h-20 bg-[#F9F7F4] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#EDE6DD]">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-[#2C2825] mb-2">{title}</h3>
      <p className="text-[#7A6E62]">{description}</p>
    </div>
  );
}

export default function AdminPage() {
  const { user, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [pendingNotes, setPendingNotes] = useState<Note[]>([]);
  const [approvedNotes, setApprovedNotes] = useState<Note[]>([]);
  const [folderInputs, setFolderInputs] = useState<Record<string, string>>({});

  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [createAdminMsg, setCreateAdminMsg] = useState({ text: "", type: "" });
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [adminError, setAdminError] = useState("");

  useEffect(() => {
    if (!user) {
      setPendingNotes([]);
      setApprovedNotes([]);
      return;
    }

    const pendingQuery = query(collection(db, "notes"), where("status", "==", "pending"));
    const approvedQuery = query(collection(db, "notes"), where("status", "==", "approved"));

    const unsubscribePending = onSnapshot(
      pendingQuery,
      (snapshot) => {
        setPendingNotes(mapSnapshotToNotes(snapshot));
      },
      (error) => {
        console.error("Error fetching notes:", error);
      }
    );

    const unsubscribeApproved = onSnapshot(
      approvedQuery,
      (snapshot) => {
        setApprovedNotes(mapSnapshotToNotes(snapshot));
      },
      (error) => {
        console.error("Error fetching approved notes:", error);
      }
    );

    return () => {
      unsubscribePending();
      unsubscribeApproved();
    };
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      const authError = toAuthError(err);
      console.error(err);
      if (
        authError.code === "auth/invalid-credential" ||
        authError.code === "auth/user-not-found" ||
        authError.code === "auth/wrong-password"
      ) {
        setLoginError("Correo o contraseña incorrectos.");
      } else {
        setLoginError("Ocurrió un error al iniciar sesión.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateAdminMsg({ text: "", type: "" });
    setIsCreatingAdmin(true);

    try {
      const secondaryApp =
        getApps().find((app) => app.name === "SecondaryApp") ||
        initializeApp(primaryApp.options, "SecondaryApp");
      const secondaryAuth = getAuth(secondaryApp);

      await createUserWithEmailAndPassword(secondaryAuth, newAdminEmail, newAdminPassword);
      await secondaryAuth.signOut();

      setCreateAdminMsg({ text: "Administrador creado con éxito.", type: "success" });
      setNewAdminEmail("");
      setNewAdminPassword("");

      setTimeout(() => setShowCreateAdmin(false), 3000);
    } catch (err: unknown) {
      const authError = toAuthError(err);
      console.error(err);
      if (authError.code === "auth/email-already-in-use") {
        setCreateAdminMsg({ text: "Ese correo ya está registrado.", type: "error" });
      } else if (authError.code === "auth/weak-password") {
        setCreateAdminMsg({ text: "La contraseña debe tener al menos 6 caracteres.", type: "error" });
      } else {
        setCreateAdminMsg({ text: "Error al crear administrador.", type: "error" });
      }
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleFolderInputChange = (noteId: string, value: string) => {
    setFolderInputs((current) => ({
      ...current,
      [noteId]: value,
    }));
  };

  const handleUseAuthorFolder = (note: Note) => {
    const authorFolder = normalizeFolderName(note.author ?? "");
    if (!authorFolder || authorFolder.toLowerCase() === "anónimo" || authorFolder.toLowerCase() === "anonimo") {
      setAdminError("Para crear una carpeta por alumno, este apunte necesita un autor identificado.");
      return;
    }

    setAdminError("");
    handleFolderInputChange(note.id, authorFolder);
  };

  const getFolderSuggestions = (note: Note) =>
    Array.from(
      new Set(
        approvedNotes
          .filter((approvedNote) => approvedNote.subjectId === note.subjectId)
          .map((approvedNote) => normalizeFolderName(approvedNote.folderName ?? ""))
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b, "es-AR"));

  const handleApprove = async (note: Note) => {
    setAdminError("");
    const folderName = normalizeFolderName(folderInputs[note.id] ?? "");

    try {
      await updateDoc(doc(db, "notes", note.id), {
        status: "approved",
        folderName: folderName || null,
      });

      setFolderInputs((current) => {
        const next = { ...current };
        delete next[note.id];
        return next;
      });
    } catch (err: unknown) {
      const authError = toAuthError(err);
      console.error("No se pudo aprobar:", err);
      setAdminError(`Error al aprobar (${authError.code || "unknown"}). Verificá las reglas de Firebase.`);
    }
  };

  const handleDelete = async (id: string) => {
    setAdminError("");
    try {
      await deleteDoc(doc(db, "notes", id));
    } catch (err: unknown) {
      const authError = toAuthError(err);
      console.error("No se pudo eliminar:", err);
      setAdminError(`Error al eliminar (${authError.code || "unknown"}). Verificá las reglas de Firebase.`);
    }
  };

  const handleOpenFile = (note: Note) => {
    setAdminError("");

    if (!note.fileUrl) {
      setAdminError("Este apunte no tiene una URL válida para abrir.");
      return;
    }

    window.open(note.fileUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#C4A87D] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#EDE6DD] p-8 md:p-10 animate-fade-in-up">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#F5EFE5] rounded-full flex items-center justify-center border border-[#E2D6C2] shadow-sm">
              <Lock className="w-8 h-8 text-[#8B7355]" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-[#2C2825] mb-2 tracking-tight">Acceso Restringido</h1>
          <p className="text-center text-[#7A6E62] mb-8 text-sm">
            Panel de administración de Notes Hub. Ingresá con tus credenciales autorizadas.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-[#4A433C]">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#FCFAF8] border border-[#E5DCD3] focus:border-[#C4A87D] focus:ring-4 focus:ring-[#C4A87D]/10 text-[#4A433C] rounded-xl outline-none transition-all"
                placeholder="admin@noteshub.com"
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pass" className="text-sm font-semibold text-[#4A433C]">
                Contraseña
              </label>
              <input
                id="pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "w-full px-4 py-3 bg-[#FCFAF8] border rounded-xl outline-none transition-all",
                  loginError
                    ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                    : "border-[#E5DCD3] focus:border-[#C4A87D] focus:ring-4 focus:ring-[#C4A87D]/10 text-[#4A433C]"
                )}
                placeholder="••••••••"
                required
              />
              {loginError && <p className="text-red-500 text-sm mt-1 animate-fade-in">{loginError}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-[#2C2825] hover:bg-[#1A1816] text-[#FDFCFB] font-medium py-3 rounded-xl transition-all duration-300 shadow-md transform active:scale-[0.98] flex justify-center items-center mt-2 disabled:opacity-70 disabled:active:scale-100"
            >
              {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#2C2825] tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-[#C4A87D]" />
            Panel de Moderación
          </h1>
          <p className="text-[#7A6E62] mt-2">
            Revisá los aportes pendientes y ubicá los apuntes en carpetas para que cada materia quede más ordenada.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowCreateAdmin(!showCreateAdmin)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-[#4A433C] border border-[#EDE6DD] hover:bg-[#F9F7F4] rounded-xl font-medium transition-all shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Nuevo Admin
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#FDFCFB] text-[#D84545] border border-[#FFDCDC] hover:bg-[#FFF0F0] rounded-xl font-medium transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>
      </div>

      {showCreateAdmin && (
        <div className="bg-[#FFFDFB] rounded-3xl p-6 shadow-sm border border-[#C4A87D]/30 mb-8 animate-fade-in-up">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#2C2825]">Invitar a un Moderador</h2>
            <button onClick={() => setShowCreateAdmin(false)} className="text-[#A89F95] hover:text-[#4A433C]">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[#7A6E62] text-sm mb-5">
            Completá este formulario para crearle una cuenta nueva a un colega administrador.
          </p>

          <form onSubmit={handleCreateAdmin} className="flex flex-col sm:flex-row gap-4 items-start">
            <input
              type="email"
              placeholder="Correo electrónico"
              required
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="flex-1 w-full px-4 py-2.5 bg-white border border-[#E5DCD3] focus:border-[#C4A87D] rounded-xl outline-none"
            />
            <input
              type="password"
              placeholder="Contraseña (mín 6)"
              required
              value={newAdminPassword}
              onChange={(e) => setNewAdminPassword(e.target.value)}
              className="flex-1 w-full px-4 py-2.5 bg-white border border-[#E5DCD3] focus:border-[#C4A87D] rounded-xl outline-none"
            />
            <button
              type="submit"
              disabled={isCreatingAdmin}
              className="w-full sm:w-auto bg-[#2C2825] hover:bg-[#1A1816] px-6 py-2.5 text-white font-medium rounded-xl transition-all disabled:opacity-70 flex justify-center h-[46px]"
            >
              {isCreatingAdmin ? <Loader2 className="w-5 h-5 animate-spin" /> : "Añadir Moderador"}
            </button>
          </form>
          {createAdminMsg.text && (
            <p
              className={cn(
                "mt-3 text-sm font-medium animate-fade-in",
                createAdminMsg.type === "error" ? "text-red-500" : "text-green-600"
              )}
            >
              {createAdminMsg.text}
            </p>
          )}
        </div>
      )}

      {adminError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-medium animate-fade-in">
          {adminError}
        </div>
      )}

      <section className="mb-8">
        <h2 className="text-xl font-bold text-[#4A433C] mb-4 ml-1 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C4A87D]"></span>
          Bandeja de Pendientes ({pendingNotes.length})
        </h2>

        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#EDE6DD] min-h-[300px]">
          {pendingNotes.length === 0 ? (
            <EmptySection
              title="¡Todo al día!"
              description="No hay apuntes pendientes de moderación en este momento."
              icon={<Check className="w-10 h-10 text-[#A8B8A0]" />}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingNotes.map((note) => {
                const folderSuggestions = getFolderSuggestions(note);
                const datalistId = `folders-${note.id}`;
                const authorFolder = normalizeFolderName(note.author ?? "");
                const canUseAuthorFolder =
                  authorFolder.length > 0 &&
                  authorFolder.toLowerCase() !== "anónimo" &&
                  authorFolder.toLowerCase() !== "anonimo";

                return (
                  <NoteCard
                    key={note.id}
                    note={note}
                    extraContent={
                      <div className="rounded-2xl border border-[#EDE6DD] bg-[#FFFBF7] p-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-bold text-[#3D3229]">
                            Carpeta en esta materia
                          </label>
                          <div className="flex flex-col lg:flex-row gap-2">
                            <input
                              list={folderSuggestions.length > 0 ? datalistId : undefined}
                              value={folderInputs[note.id] ?? ""}
                              onChange={(event) => handleFolderInputChange(note.id, event.target.value)}
                              placeholder="Ej. Juan Pérez"
                              className="flex-1 rounded-xl border border-[#E5DCD3] bg-white px-3.5 py-2.5 text-sm text-[#3D3229] placeholder:text-[#A89F95] focus:border-[#8BAA91] focus:outline-none focus:ring-2 focus:ring-[#8BAA91]/20"
                            />
                            <button
                              type="button"
                              onClick={() => handleUseAuthorFolder(note)}
                              disabled={!canUseAuthorFolder}
                              className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold border border-[#D5E8DB] bg-[#F2F8F4] text-[#2E7D32] hover:bg-[#E6F0E9] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Usar autor
                            </button>
                          </div>
                          {folderSuggestions.length > 0 && (
                            <datalist id={datalistId}>
                              {folderSuggestions.map((folderName) => (
                                <option key={folderName} value={folderName} />
                              ))}
                            </datalist>
                          )}
                          <p className="text-xs text-[#7A6E62]">
                            Si completás una carpeta, este apunte va a quedar agrupado con otros de la misma carpeta dentro de la materia.
                          </p>
                        </div>
                      </div>
                    }
                    actions={
                      <>
                        <button
                          onClick={() => handleOpenFile(note)}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white border border-[#EDE6DD] hover:bg-[#F9F7F4] text-[#7A6E62] rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Ver archivo"
                          disabled={!note.fileUrl}
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span className="sm:hidden text-xs">Ver</span>
                          <span className="hidden sm:inline text-xs">Ver</span>
                        </button>
                        <button
                          onClick={() => handleDelete(note.id)}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#FFF0F0] hover:bg-[#FFE5E5] text-[#D84545] border border-[#FFDCDC] rounded-xl font-semibold transition-all duration-200"
                          title="Rechazar y borrar"
                        >
                          <X className="w-4 h-4" />
                          <span className="sm:hidden">Rechazar</span>
                        </button>
                        <button
                          onClick={() => handleApprove(note)}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#F2F8F4] hover:bg-[#E6F0E9] text-[#2E7D32] border border-[#D5E8DB] rounded-xl font-semibold transition-all duration-200"
                          title="Aprobar apunte"
                        >
                          <Check className="w-4 h-4" />
                          <span className="sm:hidden">Aprobar</span>
                        </button>
                      </>
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-[#4A433C] mb-4 ml-1 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#8BAA91]"></span>
          Apuntes Aprobados ({approvedNotes.length})
        </h2>

        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#EDE6DD] min-h-[300px]">
          {approvedNotes.length === 0 ? (
            <EmptySection
              title="Sin aprobados para revisar"
              description="Cuando apruebes apuntes, también vas a poder eliminarlos y ver en qué carpeta quedaron."
              icon={<FileText className="w-10 h-10 text-[#A8B8A0]" />}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {approvedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  actions={
                    <>
                      <button
                        onClick={() => handleOpenFile(note)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white border border-[#EDE6DD] hover:bg-[#F9F7F4] text-[#7A6E62] rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Ver archivo"
                        disabled={!note.fileUrl}
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className="text-xs">Ver</span>
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#FFF0F0] hover:bg-[#FFE5E5] text-[#D84545] border border-[#FFDCDC] rounded-xl font-semibold transition-all duration-200"
                        title="Eliminar apunte aprobado"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-xs">Eliminar</span>
                      </button>
                    </>
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
