"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";

export function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Retraso intencionado de 1.5s para que se vea la animación
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#FFFBF7] transition-opacity duration-500">
      <div className="relative flex flex-col items-center justify-center animate-fade-in-scale">
        <div className="relative flex items-center justify-center w-24 h-24 mb-6">
          <div className="absolute inset-0 bg-[#8BAA91] rounded-full opacity-20 animate-ping"></div>
          <div className="absolute inset-2 bg-[#8BAA91] rounded-full opacity-40 animate-pulse"></div>
          <div className="relative z-10 w-16 h-16 bg-white shadow-xl rounded-[2rem] flex items-center justify-center border-2 border-[#E8F0EA]">
             <img src="/icon.png" alt="UTNHub Logo" className="w-10 h-10 object-contain drop-shadow-sm animate-float" />
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <span className="font-extrabold text-3xl tracking-tight text-[#3D3229] leading-none flex items-center">
            UTN<span className="text-[#8BAA91]">Hub</span>
          </span>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#8BAA91] animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#8BAA91] animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#8BAA91] animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}