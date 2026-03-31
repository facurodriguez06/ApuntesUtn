"use client";

import { useEffect } from "react";

export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    // Detectar iOS
    const isIOS = typeof window !== 'undefined' && 
      (/iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

    const scrollY = window.scrollY;

    if (isIOS) {
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    }
    
    // Bloqueo estándar que funciona bien en Android/Desktop
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      if (isIOS) {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
      }
      
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      
      if (isIOS) {
        window.scrollTo(0, scrollY);
      }
    };
  }, [isLocked]);
}
