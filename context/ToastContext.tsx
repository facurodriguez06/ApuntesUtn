"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((current) => [...current, { id, message, type }]);

    // Auto-remove after 4 seconds
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast List Container */}
      <div className="fixed bottom-6 right-6 z-[10001] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] border-2 transition-all duration-500 animate-fade-in-up",
              toast.type === "success" && "bg-white border-[#8BAA91]/50 text-[#3D3229]",
              toast.type === "error" && "bg-white border-red-100 text-[#3D3229]",
              toast.type === "info" && "bg-white border-[#EDE6DD] text-[#3D3229]"
            )}
          >
            <div className={cn(
              "p-2 rounded-xl",
              toast.type === "success" && "bg-[#E8F0EA] text-[#4A7A52]",
              toast.type === "error" && "bg-red-50 text-red-500",
              toast.type === "info" && "bg-[#F5EFE5] text-[#8B7355]"
            )}>
              {toast.type === "success" && <CheckCircle2 className="w-5 h-5" />}
              {toast.type === "error" && <AlertCircle className="w-5 h-5" />}
              {toast.type === "info" && <Info className="w-5 h-5" />}
            </div>
            
            <p className="text-sm font-bold tracking-tight pr-4">
              {toast.message}
            </p>

            <button 
              onClick={() => removeToast(toast.id)}
              className="ml-auto p-1.5 hover:bg-gray-50 rounded-lg text-[#A89F95] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
