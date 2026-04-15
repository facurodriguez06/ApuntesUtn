"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Trash2, AlertTriangle, User, Shield, BookOpen, CheckCircle2, Mail, Lock, Save, Eye, EyeOff, Pencil } from "lucide-react";
import Link from "next/link";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useToast } from "@/context/ToastContext";
import { updateEmail, updatePassword, updateProfile, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

export default function ConfiguracionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [progressStats, setProgressStats] = useState<{ aprobadas: number; regulares: number }>({ aprobadas: 0, regulares: 0 });
  const [showConfirmDialog, setShowConfirmDialog] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Estado para cambio de email
  const [newEmail, setNewEmail] = useState("");
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  // Estado para cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Estado para cambio de nombre
  const [newName, setNewName] = useState("");
  const [isChangingName, setIsChangingName] = useState(false);
  const [showNameForm, setShowNameForm] = useState(false);

  // Verificar si el usuario usa email/password (no Google)
  const isEmailProvider = user?.providerData[0]?.providerId === "password";

  // Redirigir si no está logueado
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  // Cargar estadísticas del progreso actual
  useEffect(() => {
    if (!user) return;

    const loadProgress = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const progress = userDoc.data().progress || { aprobadas: [], regulares: [] };
          setProgressStats({
            aprobadas: progress.aprobadas?.length || 0,
            regulares: progress.regulares?.length || 0,
          });
        }
      } catch (error) {
        console.error("Error al cargar el progreso:", error);
      }
    };

    loadProgress();
  }, [user]);

  // Cambiar nombre
  const handleChangeName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newName.trim()) return;

    setIsChangingName(true);
    try {
      await updateProfile(user, { displayName: newName.trim() });

      // Actualizar también en Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { displayName: newName.trim() });

      showToast("Nombre actualizado correctamente.", "success");
      setNewName("");
      setShowNameForm(false);
    } catch (error) {
      console.error("Error al cambiar nombre:", error);
      showToast("Error al actualizar el nombre.", "error");
    } finally {
      setIsChangingName(false);
    }
  };

  // Cambiar email
  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newEmail || !emailCurrentPassword) return;

    setIsChangingEmail(true);
    try {
      // Reautenticar al usuario primero
      const credential = EmailAuthProvider.credential(user.email!, emailCurrentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Actualizar el email
      await updateEmail(user, newEmail);
      
      // Actualizar también en Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { email: newEmail });

      showToast("Correo electrónico actualizado correctamente.", "success");
      setNewEmail("");
      setEmailCurrentPassword("");
      setShowEmailForm(false);
    } catch (error: any) {
      console.error("Error al cambiar email:", error);
      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        showToast("Contraseña actual incorrecta.", "error");
      } else if (error.code === "auth/email-already-in-use") {
        showToast("Ese correo ya está en uso por otra cuenta.", "error");
      } else if (error.code === "auth/invalid-email") {
        showToast("El formato del correo no es válido.", "error");
      } else if (error.code === "auth/requires-recent-login") {
        showToast("Por seguridad, cerrá sesión y volvé a ingresar antes de cambiar el email.", "error");
      } else {
        showToast("Error al actualizar el correo electrónico.", "error");
      }
    } finally {
      setIsChangingEmail(false);
    }
  };

  // Cambiar contraseña
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentPassword || !newPassword || !confirmNewPassword) return;

    if (newPassword.length < 6) {
      showToast("La nueva contraseña debe tener al menos 6 caracteres.", "error");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showToast("Las contraseñas no coinciden.", "error");
      return;
    }

    setIsChangingPassword(true);
    try {
      // Reautenticar al usuario primero
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Actualizar la contraseña
      await updatePassword(user, newPassword);

      showToast("Contraseña actualizada correctamente.", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setShowPasswordForm(false);
    } catch (error: any) {
      console.error("Error al cambiar contraseña:", error);
      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        showToast("Contraseña actual incorrecta.", "error");
      } else if (error.code === "auth/weak-password") {
        showToast("La contraseña es demasiado débil.", "error");
      } else if (error.code === "auth/requires-recent-login") {
        showToast("Por seguridad, cerrá sesión y volvé a ingresar antes de cambiar la contraseña.", "error");
      } else {
        showToast("Error al actualizar la contraseña.", "error");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Borrar solo las materias aprobadas
  const handleClearAprobadas = async () => {
    if (!user) return;
    setIsProcessing(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const currentProgress = userDoc.data().progress || { aprobadas: [], regulares: [] };
        await updateDoc(userRef, {
          progress: { ...currentProgress, aprobadas: [] }
        });
        setProgressStats(prev => ({ ...prev, aprobadas: 0 }));
        showToast("Materias aprobadas eliminadas correctamente.", "success");
      }
    } catch (error) {
      console.error("Error al borrar aprobadas:", error);
      showToast("Error al borrar las materias aprobadas.", "error");
    } finally {
      setIsProcessing(false);
      setShowConfirmDialog(null);
    }
  };

  // Borrar solo las materias regularizadas
  const handleClearRegulares = async () => {
    if (!user) return;
    setIsProcessing(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const currentProgress = userDoc.data().progress || { aprobadas: [], regulares: [] };
        await updateDoc(userRef, {
          progress: { ...currentProgress, regulares: [] }
        });
        setProgressStats(prev => ({ ...prev, regulares: 0 }));
        showToast("Materias regularizadas eliminadas correctamente.", "success");
      }
    } catch (error) {
      console.error("Error al borrar regulares:", error);
      showToast("Error al borrar las materias regularizadas.", "error");
    } finally {
      setIsProcessing(false);
      setShowConfirmDialog(null);
    }
  };

  // Borrar todo el progreso (aprobadas + regulares)
  const handleClearAllProgress = async () => {
    if (!user) return;
    setIsProcessing(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        progress: { aprobadas: [], regulares: [] }
      });
      setProgressStats({ aprobadas: 0, regulares: 0 });
      showToast("Todo tu progreso fue reiniciado.", "success");
    } catch (error) {
      console.error("Error al borrar progreso:", error);
      showToast("Error al reiniciar el progreso.", "error");
    } finally {
      setIsProcessing(false);
      setShowConfirmDialog(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#8BAA91] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  const displayName = user.displayName || user.email?.split("@")[0] || "Usuario";

  return (
    <div className="min-h-[85vh] flex flex-col items-center p-4 relative z-10 w-full mb-20 mt-6">
      {/* Botón volver */}
      <div className="w-full max-w-2xl">
        <Link
          href="/planes"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#8BAA91] hover:text-[#6A8F70] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
      </div>

      <div className="w-full max-w-2xl space-y-6 animate-fade-in-up">
        {/* Encabezado */}
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8BAA91] to-[#6A8F70] flex items-center justify-center text-white text-xl font-black uppercase shadow-lg">
            {displayName.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#3D3229] tracking-tight">Configuración</h1>
            <p className="text-sm font-medium text-[#A89F95]">{user.email}</p>
          </div>
        </div>

        {/* Sección: Información de la cuenta */}
        <div className="bg-white border border-[#EDE6DD] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-[#FAFAF8] border-b border-[#EDE6DD]">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#8BAA91]" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#A0A0A0]">Cuenta</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#3D3229]">Nombre</p>
                  <p className="text-[13px] text-[#7A6E62]">{displayName}</p>
                </div>
                <button
                  onClick={() => { setShowNameForm(!showNameForm); setNewName(displayName); }}
                  className="text-[12px] font-bold text-[#8BAA91] hover:text-[#6A8F70] px-3 py-1.5 rounded-lg hover:bg-[#F5F0EA] transition-all"
                >
                  {showNameForm ? "Cancelar" : "Cambiar"}
                </button>
              </div>

              {/* Formulario para cambiar nombre */}
              {showNameForm && (
                <form onSubmit={handleChangeName} className="bg-[#FAFAF8] p-4 rounded-xl border border-[#EDE6DD] space-y-3 animate-fade-in-up">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Pencil className="h-4 w-4 text-[#A89F95]" />
                    </div>
                    <input
                      type="text"
                      placeholder="Nuevo nombre"
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#EDE6DD] rounded-xl text-sm outline-none transition-all focus:border-[#8BAA91] focus:ring-1 focus:ring-[#8BAA91]/30 placeholder:text-[#A89F95] text-[#3D3229] font-medium"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isChangingName || !newName.trim() || newName.trim() === displayName}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#8BAA91] hover:bg-[#6A8F70] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isChangingName ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        Guardar nombre
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
            <div className="h-[1px] bg-[#EDE6DD]" />
            
            {/* Email - con opción de cambiar */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#3D3229]">Correo electrónico</p>
                  <p className="text-[13px] text-[#7A6E62]">{user.email || "No disponible"}</p>
                </div>
                {isEmailProvider && (
                  <button
                    onClick={() => { setShowEmailForm(!showEmailForm); setNewEmail(""); setEmailCurrentPassword(""); }}
                    className="text-[12px] font-bold text-[#8BAA91] hover:text-[#6A8F70] px-3 py-1.5 rounded-lg hover:bg-[#F5F0EA] transition-all"
                  >
                    {showEmailForm ? "Cancelar" : "Cambiar"}
                  </button>
                )}
              </div>

              {/* Formulario para cambiar email */}
              {showEmailForm && isEmailProvider && (
                <form onSubmit={handleChangeEmail} className="bg-[#FAFAF8] p-4 rounded-xl border border-[#EDE6DD] space-y-3 animate-fade-in-up">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-[#A89F95]" />
                    </div>
                    <input
                      type="email"
                      placeholder="Nuevo correo electrónico"
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#EDE6DD] rounded-xl text-sm outline-none transition-all focus:border-[#8BAA91] focus:ring-1 focus:ring-[#8BAA91]/30 placeholder:text-[#A89F95] text-[#3D3229] font-medium"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-[#A89F95]" />
                    </div>
                    <input
                      type="password"
                      placeholder="Contraseña actual (para confirmar)"
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#EDE6DD] rounded-xl text-sm outline-none transition-all focus:border-[#8BAA91] focus:ring-1 focus:ring-[#8BAA91]/30 placeholder:text-[#A89F95] text-[#3D3229] font-medium"
                      value={emailCurrentPassword}
                      onChange={(e) => setEmailCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isChangingEmail || !newEmail || !emailCurrentPassword}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#8BAA91] hover:bg-[#6A8F70] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isChangingEmail ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        Guardar nuevo email
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            <div className="h-[1px] bg-[#EDE6DD]" />

            {/* Contraseña - con opción de cambiar */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#3D3229]">Contraseña</p>
                  <p className="text-[13px] text-[#7A6E62]">••••••••</p>
                </div>
                {isEmailProvider && (
                  <button
                    onClick={() => { setShowPasswordForm(!showPasswordForm); setCurrentPassword(""); setNewPassword(""); setConfirmNewPassword(""); }}
                    className="text-[12px] font-bold text-[#8BAA91] hover:text-[#6A8F70] px-3 py-1.5 rounded-lg hover:bg-[#F5F0EA] transition-all"
                  >
                    {showPasswordForm ? "Cancelar" : "Cambiar"}
                  </button>
                )}
              </div>

              {/* Formulario para cambiar contraseña */}
              {showPasswordForm && isEmailProvider && (
                <form onSubmit={handleChangePassword} className="bg-[#FAFAF8] p-4 rounded-xl border border-[#EDE6DD] space-y-3 animate-fade-in-up">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-[#A89F95]" />
                    </div>
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      placeholder="Contraseña actual"
                      className="w-full pl-9 pr-10 py-2.5 bg-white border border-[#EDE6DD] rounded-xl text-sm outline-none transition-all focus:border-[#8BAA91] focus:ring-1 focus:ring-[#8BAA91]/30 placeholder:text-[#A89F95] text-[#3D3229] font-medium"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                    <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#A89F95] hover:text-[#7A6E62] transition-colors">
                      {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-[#A89F95]" />
                    </div>
                    <input
                      type={showNewPass ? "text" : "password"}
                      placeholder="Nueva contraseña (mín. 6 caracteres)"
                      className="w-full pl-9 pr-10 py-2.5 bg-white border border-[#EDE6DD] rounded-xl text-sm outline-none transition-all focus:border-[#8BAA91] focus:ring-1 focus:ring-[#8BAA91]/30 placeholder:text-[#A89F95] text-[#3D3229] font-medium"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#A89F95] hover:text-[#7A6E62] transition-colors">
                      {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-[#A89F95]" />
                    </div>
                    <input
                      type={showNewPass ? "text" : "password"}
                      placeholder="Confirmar nueva contraseña"
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#EDE6DD] rounded-xl text-sm outline-none transition-all focus:border-[#8BAA91] focus:ring-1 focus:ring-[#8BAA91]/30 placeholder:text-[#A89F95] text-[#3D3229] font-medium"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  {newPassword && confirmNewPassword && newPassword !== confirmNewPassword && (
                    <p className="text-[11px] font-bold text-[#E57A7A] pl-1">Las contraseñas no coinciden.</p>
                  )}
                  <button
                    type="submit"
                    disabled={isChangingPassword || !currentPassword || !newPassword || !confirmNewPassword || newPassword !== confirmNewPassword}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#8BAA91] hover:bg-[#6A8F70] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isChangingPassword ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        Guardar nueva contraseña
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            <div className="h-[1px] bg-[#EDE6DD]" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#3D3229]">Proveedor de inicio de sesión</p>
                <p className="text-[13px] text-[#7A6E62]">
                  {user.providerData[0]?.providerId === "google.com" ? "Google" : "Email/Contraseña"}
                </p>
              </div>
              <Shield className="w-4 h-4 text-[#8BAA91]" />
            </div>
            {!isEmailProvider && (
              <div className="bg-[#F5F0EA] p-3 rounded-xl border border-[#EDE6DD]">
                <p className="text-[12px] text-[#7A6E62] leading-relaxed">
                  Iniciaste sesión con <strong>Google</strong>. El email y la contraseña se administran desde tu cuenta de Google.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sección: Progreso académico */}
        <div className="bg-white border border-[#EDE6DD] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-[#FAFAF8] border-b border-[#EDE6DD]">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#8BAA91]" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#A0A0A0]">Progreso académico</h2>
            </div>
          </div>
          <div className="p-6 space-y-5">
            {/* Resumen del progreso */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-[#E8F5E9] text-[#388E3C] px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm border border-[#388E3C]/20">
                <CheckCircle2 className="w-4 h-4" />
                {progressStats.aprobadas} aprobada{progressStats.aprobadas !== 1 ? "s" : ""}
              </div>
              <div className="flex items-center gap-2 bg-[#FFF3E0] text-[#E65100] px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm border border-[#E65100]/20">
                <AlertTriangle className="w-4 h-4" />
                {progressStats.regulares} regularizada{progressStats.regulares !== 1 ? "s" : ""}
              </div>
            </div>

            <div className="h-[1px] bg-[#EDE6DD]" />

            {/* Borrar aprobadas */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[#3D3229]">Borrar aprobadas</p>
                <p className="text-[12px] text-[#A89F95]">Elimina solo las materias marcadas como aprobadas.</p>
              </div>
              <button
                onClick={() => setShowConfirmDialog("aprobadas")}
                disabled={progressStats.aprobadas === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold text-[#E57A7A] bg-[#FEF5F5] border border-[#F5E5E5] hover:bg-[#FCECEC] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Borrar aprobadas
              </button>
            </div>

            <div className="h-[1px] bg-[#EDE6DD]" />

            {/* Borrar regulares */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[#3D3229]">Borrar regularizadas</p>
                <p className="text-[12px] text-[#A89F95]">Elimina solo las materias marcadas como regularizadas.</p>
              </div>
              <button
                onClick={() => setShowConfirmDialog("regulares")}
                disabled={progressStats.regulares === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold text-[#E57A7A] bg-[#FEF5F5] border border-[#F5E5E5] hover:bg-[#FCECEC] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Borrar regularizadas
              </button>
            </div>

            <div className="h-[1px] bg-[#EDE6DD]" />

            {/* Borrar todo el progreso */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFF5F5] p-4 -m-1 rounded-xl border border-[#F5E5E5]">
              <div>
                <p className="text-sm font-bold text-[#C55A5A]">Reiniciar todo el progreso</p>
                <p className="text-[12px] text-[#D4856A]">Borra tanto aprobadas como regularizadas. Esta acción no se puede deshacer.</p>
              </div>
              <button
                onClick={() => setShowConfirmDialog("todo")}
                disabled={progressStats.aprobadas === 0 && progressStats.regulares === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold text-white bg-[#E57A7A] hover:bg-[#D46A6A] border border-[#C55A5A] transition-all active:scale-95 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Borrar todo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Diálogo de confirmación */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/30 transition-opacity"
            onClick={() => !isProcessing && setShowConfirmDialog(null)}
          />
          <div className="relative bg-white rounded-2xl border border-[#EDE6DD] shadow-2xl max-w-sm w-full p-6 animate-fade-in-up z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#FEF5F5] flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[#E57A7A]" />
              </div>
              <h3 className="text-lg font-bold text-[#3D3229]">¿Estás seguro?</h3>
            </div>

            <p className="text-sm text-[#7A6E62] mb-6 leading-relaxed">
              {showConfirmDialog === "aprobadas" && (
                <>Vas a eliminar todas las materias marcadas como <strong className="text-[#388E3C]">aprobadas</strong>. Esta acción no se puede deshacer.</>
              )}
              {showConfirmDialog === "regulares" && (
                <>Vas a eliminar todas las materias marcadas como <strong className="text-[#E65100]">regularizadas</strong>. Esta acción no se puede deshacer.</>
              )}
              {showConfirmDialog === "todo" && (
                <>Vas a <strong className="text-[#C55A5A]">reiniciar todo tu progreso</strong> (aprobadas y regularizadas). Esta acción no se puede deshacer.</>
              )}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(null)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-[#7A6E62] border border-[#EDE6DD] hover:bg-[#F5F0EA] transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (showConfirmDialog === "aprobadas") handleClearAprobadas();
                  else if (showConfirmDialog === "regulares") handleClearRegulares();
                  else if (showConfirmDialog === "todo") handleClearAllProgress();
                }}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#E57A7A] hover:bg-[#D46A6A] transition-all disabled:opacity-70 shadow-sm"
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Confirmar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
