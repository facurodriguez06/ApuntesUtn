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
  DollarSign,
  Mail,
  UserCheck,
  Crown,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveStorageUrl } from "@/lib/storage";
import type { Note } from "@/lib/data";
import { careersData, subjectsData, yearConfig } from "@/lib/data";
import { useAuth } from "@/context/AuthContext";
import { EditNoteModal } from "@/components/EditNoteModal";
import { Edit, Megaphone, ChevronDown } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { auth, app as primaryApp, db } from "@/lib/firebase/config";
import { initializeApp, getApps } from "firebase/app";
import { collection, query, where, onSnapshot, updateDoc, deleteDoc, doc, setDoc } from "firebase/firestore";

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
              <span className="w-1 h-1 rounded-full bg-[#D5CAC0]"></span>
              <span className="font-bold text-[#4A7A52] bg-[#E8F0EA] px-2 py-0.5 rounded-lg text-xs">
                {careersData.find(c => c.id === note.careerId)?.shortName || note.careerId}
              </span>
              <span className="w-1 h-1 rounded-full bg-[#D5CAC0]"></span>
              <span className="font-bold text-[#8B7355] bg-[#F5EFE5] px-2 py-0.5 rounded-lg text-xs">
                {subjectsData.find(s => s.id === note.subjectId)?.name || note.subjectId}
              </span>
              <span className="w-1 h-1 rounded-full bg-[#D5CAC0]"></span>
              <span className="font-bold text-[#4A6E82] bg-[#E5EFF5] px-2 py-0.5 rounded-lg text-xs">
                {yearConfig[note.year || 0]?.label || `Año ${note.year}`}
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

function SubjectGroup({
  subject,
  notes,
  onOpenFile,
  onEditNote,
  onDeleteNote,
}: {
  subject: string;
  notes: Note[];
  onOpenFile: (note: Note) => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white/50 rounded-2xl border border-[#EDE6DD] overflow-hidden transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-[#F9F7F4] hover:bg-[#F5EFE5] transition-colors"
      >
        <h3 className="text-lg font-bold text-[#4A433C] flex items-center gap-2">
          {subject} <span className="text-[#A89F95] text-sm font-normal">({notes.length} {notes.length === 1 ? 'apunte' : 'apuntes'})</span>
        </h3>
        <span
          className={cn(
            "transform transition-transform duration-300 w-8 h-8 flex items-center justify-center bg-white rounded-full border border-[#EDE6DD] text-[#8B7355]",
            isOpen ? "rotate-180" : "rotate-0"
          )}
        >
          <ChevronDown className="w-5 h-5" />
        </span>
      </button>
      
      {isOpen && (
        <div className="p-4 grid grid-cols-1 gap-4 bg-white border-t border-[#EDE6DD] animate-fade-in-up">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              actions={
                <>
                  <button
                    onClick={() => onOpenFile(note)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white border border-[#EDE6DD] hover:bg-[#F9F7F4] text-[#7A6E62] rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Ver archivo"
                    disabled={!note.fileUrl}
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-xs">Ver</span>
                  </button>
                  <button
                    onClick={() => onEditNote(note)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white border border-[#EDE6DD] hover:bg-[#F9F7F4] text-[#8BAA91] rounded-xl font-medium transition-all duration-200"
                    title="Editar apunte"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-xs">Editar</span>
                  </button>
                  <button
                    onClick={() => onDeleteNote(note.id)}
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
  );
}

export default function AdminPage() {
  const { user, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [metrics, setMetrics] = useState({ pageViews: 0, uniqueVisitors: 0, todayViews: 0 });

  const [pendingNotes, setPendingNotes] = useState<Note[]>([]);
  const [approvedNotes, setApprovedNotes] = useState<Note[]>([]);
  const [folderInputs, setFolderInputs] = useState<Record<string, string>>({});

  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [isDonationActive, setIsDonationActive] = useState(true);
  const [isDonationPopupActive, setIsDonationPopupActive] = useState(true);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [createAdminMsg, setCreateAdminMsg] = useState({ text: "", type: "" });
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const { showToast } = useToast();
  const [adminList, setAdminList] = useState<any[]>([]);
  const [adminError, setAdminError] = useState("");

  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isImagePopupActive, setIsImagePopupActive] = useState(false);
  const [imagePopupUrl, setImagePopupUrl] = useState("");
  const [imagePopupLink, setImagePopupLink] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isAnnouncementActive, setIsAnnouncementActive] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");

  const [authorStyles, setAuthorStyles] = useState<Record<string, {color: string, label: string}>>({});
  const [newAuthorName, setNewAuthorName] = useState("");
  const [newAuthorColor, setNewAuthorColor] = useState("#4A7A52");
  const [newAuthorLabel, setNewAuthorLabel] = useState("Amigo");

  // Custom confirmation state
  const [confirmDeleteAdmin, setConfirmDeleteAdmin] = useState<{ isOpen: boolean; adminMail: string }>({
    isOpen: false,
    adminMail: "",
  });

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

    // Listen for global settings
    const unsubscribeSettings = onSnapshot(
      doc(db, "settings", "global"),
      (docSnap) => {
        if (docSnap.exists()) {
          setIsDonationActive(docSnap.data().isDonationActive ?? true);
          setIsDonationPopupActive(docSnap.data().isDonationPopupActive ?? true);
            setIsAnnouncementActive(docSnap.data().isAnnouncementActive ?? false);
            setAnnouncementTitle(docSnap.data().announcementTitle ?? "");
            setAnnouncementMessage(docSnap.data().announcementMessage ?? "");          setIsImagePopupActive(docSnap.data().isImagePopupActive ?? false);
          setImagePopupUrl(docSnap.data().imagePopupUrl ?? "");
          setImagePopupLink(docSnap.data().imagePopupLink ?? "");
          setAuthorStyles(docSnap.data().authorStyles || {});
        }
      }
    );

    // Listen for admin list
    const unsubscribeAdmins = onSnapshot(
      collection(db, "admins"),
      (snapshot) => {
        setAdminList(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    );

    // Listen for metrics
    const unsubscribeMetrics = onSnapshot(collection(db, "metrics"), (snapshot) => {
      let totalViews = 0;
      let totalUnique = 0;
      let todayViews = 0;
      const todayString = new Date().toISOString().split('T')[0];

      snapshot.forEach(d => {
        const data = d.data();
        if (d.id === "total") {
          totalViews = data.pageViews || 0;
          totalUnique = data.uniqueVisitors || 0;
        } else if (d.id === todayString) {
          todayViews = data.pageViews || 0;
        }
      });
      setMetrics({ pageViews: totalViews, uniqueVisitors: totalUnique, todayViews });
    });

    return () => {
      unsubscribePending();
      unsubscribeApproved();
      unsubscribeSettings();
      unsubscribeAdmins();
      unsubscribeMetrics();
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

      // Guardar en Firestore para poder listarlo
      const { setDoc } = await import("firebase/firestore");
      await setDoc(doc(db, "admins", newAdminEmail.toLowerCase()), {
        email: newAdminEmail.toLowerCase(),
        createdAt: new Date().toISOString(),
      });

      setCreateAdminMsg({ text: "Administrador creado y registrado.", type: "success" });
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

  const handleEditNoteSave = async (updatedFields: Partial<Note>) => {
    if (!editingNote) return;
    try {
      const { updateDoc, doc } = await import("firebase/firestore");
      await updateDoc(doc(db, "notes", editingNote.id), updatedFields);
      showToast("Apunte editado correctamente.", "success");
    } catch (error) {
      console.error(error);
      showToast("Error al editar apunte.", "error");
    }
  };

  const saveImagePopupSettings = async () => {
    setIsUpdatingSettings(true);
    try {
      await setDoc(doc(db, "settings", "global"), {
        isImagePopupActive,
        imagePopupUrl,
        imagePopupLink,
      }, { merge: true });
      showToast("Ajustes de popup de imagen guardados.", "success");
    } catch (err) {
      console.error(err);
      showToast("Error al guardar popup de imagen.", "error");
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "image");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Error al subir imagen");

      const data = await res.json();
      setImagePopupUrl(data.url);
      showToast("Imagen subida con éxito", "success");
    } catch (error) {
      console.error(error);
      showToast("Error al subir imagen", "error");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const saveAnnouncementSettings = async () => {
    setIsUpdatingSettings(true);
    try {
      await setDoc(doc(db, "settings", "global"), {
        isAnnouncementActive,
        announcementTitle,
        announcementMessage,
      }, { merge: true });
      showToast("Ajustes de anuncio guardados.", "success");
    } catch (err) {
      console.error(err);
      showToast("Error al guardar anuncio.", "error");
    } finally {
      setIsUpdatingSettings(false);
    }
  };


  const handleSaveAuthorStyle = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newAuthorName.trim()) return;
    try {
      const normalizedName = newAuthorName
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ").trim().toLowerCase();
      
      await updateDoc(doc(db, "settings", "global"), {
        [`authorStyles.${normalizedName}`]: {
          color: newAuthorColor,
          label: newAuthorLabel
        }
      });
      setNewAuthorName("");
      setNewAuthorLabel("Amigo");
      showToast("Estilo asignado con éxito.", "success");
    } catch(err) { console.error(err); showToast("Error al guardar.", "error"); }
  };

  const handleDeleteAuthorStyle = async (key: string) => {
    try {
      const { deleteField } = await import("firebase/firestore");
      await updateDoc(doc(db, "settings", "global"), {
        [`authorStyles.${key}`]: deleteField()
      });
      showToast("Estilo eliminado.", "success");
    } catch(err) { console.error(err); showToast("Error.", "error"); }
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

    window.open(resolveStorageUrl(note.fileUrl), "_blank");
  };

  const toggleDonation = async (type: 'section' | 'popup') => {
    setIsUpdatingSettings(true);
    try {
      const field = type === 'section' ? 'isDonationActive' : 'isDonationPopupActive';
      const currentVal = type === 'section' ? isDonationActive : isDonationPopupActive;
      const newValue = !currentVal;
      
      if (type === 'section') setIsDonationActive(newValue);
      else setIsDonationPopupActive(newValue);
      
      await setDoc(doc(db, "settings", "global"), {
        [field]: newValue,
      }, { merge: true });
    } catch (err) {
      console.error("Error updating settings:", err);
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const toggleImagePopupState = async () => {
    setIsUpdatingSettings(true);
    const newValue = !isImagePopupActive;
    setIsImagePopupActive(newValue);
    try {
      await setDoc(doc(db, "settings", "global"), {
        isImagePopupActive: newValue,
      }, { merge: true });
      showToast(
        newValue ? "Anuncio con imagen activado" : "Anuncio con imagen desactivado", 
        "success"
      );
    } catch (err) {
      console.error("Error updating settings:", err);
      setIsImagePopupActive(!newValue); // revert on error
      showToast("Error al cambiar estado", "error");
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const toggleAnnouncementState = async () => {
    setIsUpdatingSettings(true);
    const newValue = !isAnnouncementActive;
    setIsAnnouncementActive(newValue);
    try {
      await setDoc(doc(db, "settings", "global"), {
        isAnnouncementActive: newValue,
      }, { merge: true });
      showToast(
        newValue ? "Aviso de texto activado" : "Aviso de texto desactivado", 
        "success"
      );
    } catch (err) {
      console.error("Error updating settings:", err);
      setIsAnnouncementActive(!newValue); // revert on error
      showToast("Error al cambiar estado", "error");
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleDeleteAdmin = (adminMail: string) => {
    setConfirmDeleteAdmin({ isOpen: true, adminMail });
  };

  const confirmDeleteAdminAction = async () => {
    const adminMail = confirmDeleteAdmin.adminMail;
    try {
      await deleteDoc(doc(db, "admins", adminMail));
      showToast("Moderador eliminado correctamente", "success");
    } catch (err) {
      console.error("Error deleting admin:", err);
      showToast("Error al eliminar administrador", "error");
    } finally {
      setConfirmDeleteAdmin({ isOpen: false, adminMail: "" });
    }
  };

  const handleResetPassword = async (email: string) => {
    const { sendPasswordResetEmail } = await import("firebase/auth");
    try {
      await sendPasswordResetEmail(auth, email);
      showToast(`Correo de restablecimiento enviado a ${email}`, "success");
    } catch (err) {
      console.error("Error resetting password:", err);
      showToast("Error al enviar el correo de restablecimiento.", "error");
    }
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
          {/* Métricas */}
          <div className="flex gap-4 sm:mr-4 bg-white border border-[#EDE6DD] rounded-xl p-3 shadow-sm min-w-max hidden lg:flex">
            <div className="pr-4 border-r border-[#EDE6DD]">
              <p className="text-[10px] font-extrabold text-[#A89F95] uppercase tracking-wider mb-0.5">Visitas Hoy</p>
              <p className="text-xl font-black text-[#2C2825] leading-none">{metrics.todayViews}</p>
            </div>
            <div className="pr-4 border-r border-[#EDE6DD]">
              <p className="text-[10px] font-extrabold text-[#A89F95] uppercase tracking-wider mb-0.5">Vistas Totales</p>
              <p className="text-xl font-black text-[#2C2825] leading-none">{metrics.pageViews}</p>
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-[#A89F95] uppercase tracking-wider mb-0.5">Visitas ÚNICA</p>
              <p className="text-xl font-black text-[#4A7A52] leading-none">{metrics.uniqueVisitors}</p>
            </div>
          </div>

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

          {/* List of admins */}
          <div className="mt-8 border-t border-[#EDE6DD] pt-6">
            <h3 className="text-sm font-black text-[#3D3229] uppercase tracking-widest mb-4 flex items-center gap-2">
              <UserCheck className="w-4 h-4" /> Moderadores Registrados
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminList.map((adm) => (
                <div key={adm.id} className="bg-white p-4 rounded-2xl border border-[#EDE6DD] shadow-sm flex flex-col gap-3 group transition-all hover:border-[#C4A87D]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#F5EFE5] text-[#8B7355]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-bold text-[#3D3229] truncate">{adm.email}</span>
                      <span className="text-[10px] text-[#A89F95] flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(adm.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <button 
                      onClick={() => handleResetPassword(adm.email)}
                      className="flex-1 py-1.5 px-3 rounded-lg border border-[#EDE6DD] text-[10px] font-black uppercase tracking-wider text-[#7A6E62] hover:bg-[#F9F7F4] transition-all"
                    >
                      Reset Clave
                    </button>
                    <button 
                      onClick={() => handleDeleteAdmin(adm.id)}
                      className="p-1.5 rounded-lg border border-[#FFDCDC] text-[#D84545] hover:bg-[#FFF0F0] transition-all"
                      title="Eliminar de la lista"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {adminList.length === 0 && (
                <p className="text-xs text-[#A89F95] italic">No hay otros administradores registrados en Firestore.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {adminError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-medium animate-fade-in">
          {adminError}
        </div>
      )}

      {/* Global Settings Section */}
      <section className="mb-10 animate-fade-in-up">
        <div className="bg-white rounded-[2.5rem] border border-[#EDE6DD] p-6 md:p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="max-w-xl">
              <h2 className="text-xl font-black text-[#3D3229] mb-2 flex items-center gap-2">
                <span className="p-2 rounded-lg bg-[#F5EFE5] text-[#8B7355]">
                  <DollarSign className="w-5 h-5" />
                </span>
                Configuración General
              </h2>
              <p className="text-[#7A6E62] text-sm leading-relaxed">
                Controlá la visibilidad de elementos globales del sitio. Activá o desactivá la sección de donaciones según lo necesites.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 w-full md:w-auto">
              {/* Toggle Sección */}
              <div className="flex items-center gap-4 bg-[#F9F7F4] p-4 rounded-2xl border border-[#EDE6DD] flex-1">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#3D3229]">Donación (Sección)</span>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-wider",
                    isDonationActive ? "text-[#4A7A52]" : "text-[#D84545]"
                  )}>
                    {isDonationActive ? "Visible" : "Oculto"}
                  </span>
                </div>
                
                <button
                  onClick={() => toggleDonation('section')}
                  disabled={isUpdatingSettings}
                  className={cn(
                    "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8BAA91] focus-visible:ring-offset-2 disabled:opacity-50",
                    isDonationActive ? "bg-[#8BAA91]" : "bg-[#D5CAC0]"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-300",
                      isDonationActive ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              {/* Toggle Popup */}
              <div className="flex items-center gap-4 bg-[#F9F7F4] p-4 rounded-2xl border border-[#EDE6DD] flex-1">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#3D3229]">Donación (Popup)</span>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-wider",
                    isDonationPopupActive ? "text-[#4A7A52]" : "text-[#D84545]"
                  )}>
                    {isDonationPopupActive ? "Activo" : "Inactivo"}
                  </span>
                </div>
                
                <button
                  onClick={() => toggleDonation('popup')}
                  disabled={isUpdatingSettings}
                  className={cn(
                    "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8BAA91] focus-visible:ring-offset-2 disabled:opacity-50",
                    isDonationPopupActive ? "bg-[#4A6E82]" : "bg-[#D5CAC0]"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-300",
                      isDonationPopupActive ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>


      

      {/* Estilos para autores / Destacados */}
      <section className="mb-10 animate-fade-in-up">
        <div className="bg-white rounded-[2.5rem] border border-[#EDE6DD] p-6 md:p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
            <div className="max-w-xl">
              <h2 className="text-xl font-black text-[#3D3229] mb-2 flex items-center gap-2">
                <span className="p-2 rounded-lg bg-[#E8F0EA] text-[#4A7A52]">
                  <Crown className="w-5 h-5" />
                </span>
                Personalizar Apuntes de Usuarios
              </h2>
              <p className="text-[#7A6E62] text-sm leading-relaxed">
                Asigná un color especial y una etiqueta (ej: "Amigo", "VIP") a los apuntes subidos por alguien específico. Escribí el nombre exacto con el que subió el archivo.
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSaveAuthorStyle} className="flex flex-col sm:flex-row gap-4 mb-6">
            <input 
              type="text" 
              placeholder="Nombre del Autor (ej: Juan Perez)" 
              value={newAuthorName} 
              onChange={(e) => setNewAuthorName(e.target.value)} 
              required
              className="flex-1 px-4 py-2.5 bg-white border border-[#E5DCD3] focus:border-[#4A7A52] rounded-xl outline-none"
            />
            <input 
              type="text" 
              placeholder="Etiqueta (ej: Amigo)" 
              value={newAuthorLabel} 
              onChange={(e) => setNewAuthorLabel(e.target.value)} 
              required
              className="w-full sm:w-1/4 px-4 py-2.5 bg-white border border-[#E5DCD3] focus:border-[#4A7A52] rounded-xl outline-none"
            />
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={newAuthorColor} 
                onChange={(e) => setNewAuthorColor(e.target.value)} 
                className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent p-0"
              />
              <button
                type="submit"
                className="bg-[#4A7A52] hover:bg-[#3d6644] px-6 py-2.5 text-white font-medium rounded-xl transition-all shadow-sm h-[46px]"
              >
                Agregar
              </button>
            </div>
          </form>

          {Object.keys(authorStyles).length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 border-t border-[#EDE6DD] pt-6">
              {Object.entries(authorStyles).map(([key, style]) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-xl border border-[#EDE6DD] bg-[#F9F7F4]">
                  <div className="flex flex-col">
                    <span className="font-bold text-[#3D3229] capitalize">{key}</span>
                    <span 
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 w-max text-white"
                      style={{ backgroundColor: style.color }}
                    >
                      {style.label}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDeleteAuthorStyle(key)}
                    className="p-2 text-[#D84545] hover:bg-[#FFE5E5] rounded-lg transition-colors"
                    title="Remover estilo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sistema de Anuncios o Popup Imagen */}
      <section className="mb-10 animate-fade-in-up">
        <div className="bg-white rounded-[2.5rem] border border-[#EDE6DD] p-6 md:p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
            <div className="max-w-xl">
              <h2 className="text-xl font-black text-[#3D3229] mb-2 flex items-center gap-2">
                <span className="p-2 rounded-lg bg-[#F5EFE5] text-[#8B7355]">
                  <Megaphone className="w-5 h-5" />
                </span>
                Popup de Imagen Promocional
              </h2>
              <p className="text-[#7A6E62] text-sm leading-relaxed">
                Mostrá una imagen emergente. El usuario solo lo verá 1 vez por imagen.
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-[#F9F7F4] p-4 rounded-2xl border border-[#EDE6DD]">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#3D3229]">Estado</span>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-wider",
                  isImagePopupActive ? "text-[#4A7A52]" : "text-[#D84545]"
                )}>
                  {isImagePopupActive ? "Activo" : "Inactivo"}
                </span>
              </div>
              
              <button
                onClick={toggleImagePopupState}
                disabled={isUpdatingSettings}
                className={cn(
                  "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8BAA91] disabled:opacity-50",
                  isImagePopupActive ? "bg-[#8BAA91]" : "bg-[#D5CAC0]"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-300",
                    isImagePopupActive ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>
          </div>

          {isImagePopupActive && (
            <div className="flex flex-col gap-4 bg-[#F9F7F4] p-5 rounded-2xl border border-[#EDE6DD] animate-fade-in-up">
              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-[#4A433C]">Imagen del Anuncio</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#D5CAC0m border-dashed rounded-xl cursor-pointer bg-[#F5EFE5] hover:bg-[#EAE4D9] transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {isUploadingImage ? (
                        <Loader2 className="w-6 h-6 mb-2 text-[#8BAA91] animate-spin" />
                      ) : (
                        <p className="mb-2 text-sm text-[#7A6E62]">Click para subir</p>
                      )}
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} />
                  </label>
                </div>
                {imagePopupUrl && (
                  <div className="mt-2 text-center">
                    <div className="p-2 bg-white rounded-lg border border-[#EDE6DD] relative inline-block">
                      <button
                        onClick={async () => {
                          const { setDoc } = await import("firebase/firestore");
                          await setDoc(doc(db, "settings", "global"), {
                            imagePopupUrl: "",
                          }, { merge: true });
                          setImagePopupUrl("");
                          showToast("Imagen eliminada.", "success");
                        }}
                        className="absolute -top-3 -right-3 z-10 w-8 h-8 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg"
                        title="Eliminar imagen"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <img 
                        src={imagePopupUrl.startsWith("http") ? imagePopupUrl : `https://pub-be009cc7cdca400cb717da8a110bcaa8.r2.dev/${imagePopupUrl}`} 
                        alt="Preview" 
                        className="max-h-48 mx-auto rounded-md object-contain" 
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#4A433C]">Link (Opcional)</label>
                <input
                  type="url"
                  value={imagePopupLink}
                  onChange={(e) => setImagePopupLink(e.target.value)}
                  className="w-full bg-white border border-[#D5CAC0] rounded-xl p-4 py-2.5 text-[#3D3229] focus:outline-none focus:ring-2 focus:ring-[#8BAA91]"
                />
              </div>

              <button
                onClick={saveImagePopupSettings}
                disabled={isUpdatingSettings}
                className="mt-2 w-full sm:w-auto py-2.5 p-6 rounded-xl bg-[#4A433C] text-white font-bold hover:bg-[#2C2825] transition-colors disabled:opacity-50 self-end"
              >
                {isUpdatingSettings ? <Loader2 className="w-5 h-5 animate-spin" /> : "Guardar Configuración"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Sistema de Anuncios de Texto */}
      <section className="mb-10 animate-fade-in-up">
        <div className="bg-white rounded-[2.5rem] border border-[#EDE6DD] p-6 md:p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
            <div className="max-w-xl">
              <h2 className="text-xl font-black text-[#3D3229] mb-2 flex items-center gap-2">
                <span className="p-2 rounded-lg bg-[#F5EFE5] text-[#8B7355]">
                  <Megaphone className="w-5 h-5" />
                </span>
                Sistema de Anuncios: Popup Global
              </h2>
              <p className="text-[#7A6E62] text-sm leading-relaxed">
                Mostrá un aviso temporal importante. El usuario podrá cerrarlo y no volverá a aparecer hasta que cambies el mensaje.
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-[#F9F7F4] p-4 rounded-2xl border border-[#EDE6DD]">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#3D3229]">Estado del Aviso</span>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-wider",
                  isAnnouncementActive ? "text-[#4A7A52]" : "text-[#D84545]"
                )}>
                  {isAnnouncementActive ? "Activo" : "Inactivo"}
                </span>
              </div>

              <button
                onClick={toggleAnnouncementState}
                disabled={isUpdatingSettings}
                className={cn(
                  "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8BAA91] focus-visible:ring-offset-2 disabled:opacity-50",
                  isAnnouncementActive ? "bg-[#8BAA91]" : "bg-[#D5CAC0]"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-300",
                    isAnnouncementActive ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>
          </div>

          {isAnnouncementActive && (
            <div className="flex flex-col gap-4 bg-[#F9F7F4] p-5 rounded-2xl border border-[#EDE6DD] animate-fade-in-up">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#4A433C]">Título del Aviso</label>
                <input
                  type="text"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="Ej: ¡Nuevo contenido!"
                  className="w-full bg-white border border-[#D5CAC0] rounded-xl px-4 py-2.5 text-[#3D3229] focus:outline-none focus:ring-2 focus:ring-[#8BAA91]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#4A433C]">Mensaje</label>
                <textarea
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  placeholder="Detalles del aviso..."
                  rows={3}
                  className="w-full bg-white border border-[#D5CAC0] rounded-xl px-4 py-2.5 text-[#3D3229] focus:outline-none focus:ring-2 focus:ring-[#8BAA91] resize-none"
                />
              </div>

              <button
                onClick={saveAnnouncementSettings}
                disabled={isUpdatingSettings}
                className="mt-2 w-full sm:w-auto py-2.5 px-6 rounded-xl bg-[#4A433C] text-white font-bold hover:bg-[#2C2825] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 self-end"
              >
                {isUpdatingSettings ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Guardar Anuncio"
                )}
              </button>
            </div>
          )}
        </div>
      </section>

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
            
              <div className="flex flex-col gap-8">
                {Object.entries(
                  approvedNotes.reduce((acc, note) => {
                    const subjectName = subjectsData.find(s => s.id === note.subjectId)?.name || note.subjectId || "General";
                    if (!acc[subjectName]) acc[subjectName] = [];
                    acc[subjectName].push(note);
                    return acc;
                  }, {} as Record<string, Note[]>)
                ).sort((a, b) => a[0].localeCompare(b[0])).map(([subject, notes]) => (
                  <SubjectGroup key={subject} subject={subject} notes={notes} onOpenFile={handleOpenFile} onEditNote={setEditingNote} onDeleteNote={handleDelete} />
                ))}
              </div>
          )}
        </div>
      </section>

      {/* CUSTOM CONFIRMATION MODAL */}
      {confirmDeleteAdmin.isOpen && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-[#2C2825]/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-[2rem] border-2 border-[#EDE6DD] p-8 shadow-2xl animate-fade-in-up">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-[#2C2825] text-center mb-3">¿Confirmar eliminación?</h3>
            <p className="text-[#7A6E62] text-center text-sm mb-8 leading-relaxed">
              Estás por quitar a <strong className="text-[#3D3229]">{confirmDeleteAdmin.adminMail}</strong> de la lista de moderadores.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmDeleteAdminAction}
                className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl transition-all shadow-lg shadow-red-500/20 active:scale-95"
              >
                Eliminar Moderador
              </button>
              <button
                onClick={() => setConfirmDeleteAdmin({ isOpen: false, adminMail: "" })}
                className="w-full py-3.5 bg-[#F9F7F4] text-[#7A6E62] font-bold rounded-2xl border border-[#EDE6DD] hover:bg-[#EDE6DD] transition-all active:scale-95"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {editingNote && (
        <EditNoteModal
          isOpen={!!editingNote}
          onClose={() => setEditingNote(null)}
          onSave={handleEditNoteSave}
          note={editingNote}
        />
      )}
    </div>
  );
}
