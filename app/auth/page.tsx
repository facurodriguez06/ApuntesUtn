"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, LogIn, Mail, Lock, UserRound } from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
  const { user, loginWithGoogle, loginWithEmail, registerWithEmail, loading } = useAuth();
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isFormLoading, setIsFormLoading] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      router.push("/planes");
    }
  }, [user, loading, router]);

  const handleGoogleLogin = async () => {
    try {
      setAuthError("");
      await loginWithGoogle();
    } catch (error: any) {
      setAuthError("Error al iniciar sesión con Google.");
      console.error(error);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    
    if (!email || !password || (!isLogin && !confirmPassword) || (!isLogin && !fullName.trim())) {
      setAuthError("Por favor completa todos los campos.");
      return;
    }
    
    if (password.length < 6) {
      setAuthError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setAuthError("Las contraseñas no coinciden.");
      return;
    }

    setIsFormLoading(true);
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, fullName.trim());
      }
    } catch (error: any) {
      console.error(error);
      if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        setAuthError("Correo o contraseña incorrectos.");
      } else if (error.code === "auth/email-already-in-use") {
        setAuthError("Este correo ya está registrado.");
      } else {
        setAuthError("Ocurrió un error inesperado.");
      }
    } finally {
      setIsFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#8BAA91] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 relative z-10 w-full mb-20">
      <Link
        href="/"
        className="flex items-center gap-2 text-sm font-bold text-[#7A6E62] hover:text-[#3D3229] transition-colors mb-6 self-center"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al inicio
      </Link>

      <div className="w-full max-w-[420px] bg-white border border-[#EDE6DD] rounded-3xl p-8 shadow-xl shadow-[#EDE6DD]/50 animate-fade-in-up relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-[#F5F0EA] rounded-full blur-2xl opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-40 h-40 bg-[#8BAA91] rounded-full blur-3xl opacity-10 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-[#F5F0EA] rounded-2xl flex items-center justify-center mb-6 shadow-inner text-[#8BAA91]">
            <LogIn className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-extrabold text-[#3D3229] mb-2 tracking-tight">
            {isLogin ? "Bienvenido de nuevo" : "Crea tu cuenta"}
          </h1>
          <p className="text-sm font-medium text-[#A89F95] mb-6 max-w-[280px]">
            {isLogin 
              ? "Ingresa para guardar tu progreso académico en el plan interactivo." 
              : "Regístrate para llevar el control de tus materias fácilmente."}
          </p>

          {authError && (
            <div className="w-full bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] text-xs font-bold p-3 rounded-xl mb-4 text-left">
              {authError}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="w-full space-y-3 mb-6">
            {!isLogin && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <UserRound className="h-4 w-4 text-[#A89F95]" />
                </div>
                <input
                  type="text"
                  placeholder="Nombre completo"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAFAFA] border border-[#EDE6DD] rounded-xl text-sm outline-none transition-all focus:border-[#8BAA91] focus:ring-1 focus:ring-[#8BAA91]/30 placeholder:text-[#A89F95] text-[#3D3229] font-medium"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={!isLogin}
                  autoComplete="name"
                />
              </div>
            )}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-[#A89F95]" />
              </div>
              <input
                type="email"
                placeholder="Correo electrónico"
                className="w-full pl-10 pr-4 py-3 bg-[#FAFAFA] border border-[#EDE6DD] rounded-xl text-sm outline-none transition-all focus:border-[#8BAA91] focus:ring-1 focus:ring-[#8BAA91]/30 placeholder:text-[#A89F95] text-[#3D3229] font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-[#A89F95]" />
              </div>
              <input
                type="password"
                placeholder="Contraseña"
                className="w-full pl-10 pr-4 py-3 bg-[#FAFAFA] border border-[#EDE6DD] rounded-xl text-sm outline-none transition-all focus:border-[#8BAA91] focus:ring-1 focus:ring-[#8BAA91]/30 placeholder:text-[#A89F95] text-[#3D3229] font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {!isLogin && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#A89F95]" />
                </div>
                <input
                  type="password"
                  placeholder="Confirmar contraseña"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAFAFA] border border-[#EDE6DD] rounded-xl text-sm outline-none transition-all focus:border-[#8BAA91] focus:ring-1 focus:ring-[#8BAA91]/30 placeholder:text-[#A89F95] text-[#3D3229] font-medium"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required={!isLogin}
                  minLength={6}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isFormLoading}
              className="w-full bg-[#1A1A1A] hover:bg-[#3D3229] text-white font-bold text-sm px-4 py-3.5 rounded-xl transition-all shadow-lg shadow-[#1A1A1A]/10 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isFormLoading ? "Cargando..." : isLogin ? "Ingresar" : "Registrarme"}
            </button>
          </form>

          <div className="w-full flex items-center justify-between mb-6">
            <div className="flex-1 h-[1px] bg-[#EDE6DD]"></div>
            <span className="px-3 text-[11px] font-bold text-[#A89F95] uppercase tracking-wider">o con</span>
            <div className="flex-1 h-[1px] bg-[#EDE6DD]"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-[#FAFAFA] text-[#3D3229] border border-[#EDE6DD] font-bold text-sm px-4 py-3 rounded-xl transition-all shadow-sm active:scale-[0.98] group"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" className="group-hover:scale-110 transition-transform">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
            Google
          </button>

          <p className="mt-8 text-[13px] text-[#A89F95] font-medium">
            {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setAuthError(""); setFullName(""); setEmail(""); setPassword(""); setConfirmPassword(""); }}
              className="text-[#8BAA91] hover:text-[#6A8F70] font-bold hover:underline underline-offset-2 transition-all cursor-pointer"
            >
              {isLogin ? "Regístrate ahora" : "Ingresa aquí"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
