"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function CustomCursor() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Detect touch logic
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement;
      // Detect if we are hovering over something clickable
      const isClickable = 
        window.getComputedStyle(target).cursor === "pointer" ||
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button" ||
        target.closest("a") || target.closest("button");
        
      setIsHovering(Boolean(isClickable));
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isVisible]);

  // Do not render on server or if hidden
  if (typeof window === "undefined" || !isVisible) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        /* Ocultar el cursor nativo globalmente excepto en inputs */
        * { cursor: none !important; }
        input, textarea, [contenteditable="true"] { cursor: text !important; }
      `}} />
      
      {/* Cursor principal adaptado al estilo y paleta de la página */}
      <div 
        className={cn(
          "fixed top-0 left-0 rounded-full pointer-events-none z-[9999]",
          "transition-[width,height,background-color,border-color,backdrop-filter] duration-[200ms] ease-out flex items-center justify-center",
          isHovering 
            ? "w-12 h-12 bg-[#8BAA91]/20 border border-[#8BAA91]/80 backdrop-blur-[1px]" 
            : "w-7 h-7 bg-[#8BAA91] border border-[#7A9980] shadow-sm"
        )}
        style={{ 
          transform: `translate(${mousePos.x}px, ${mousePos.y}px) translate(-50%, -50%)`,
        }}
      />
      
      {/* Punto de precisión estático */}
      <div 
        className={cn(
          "fixed top-0 left-0 rounded-full pointer-events-none z-[10000]",
          "transition-[width,height,background-color,opacity] duration-[150ms]",
          isHovering 
            ? "w-1.5 h-1.5 bg-[#2C2825] opacity-80" // Punto oscuro al hacer hover
            : "w-[5px] h-[5px] bg-[#F5F0EA] opacity-90" // Punto cremita en estado normal
        )}
        style={{ 
          transform: `translate(${mousePos.x}px, ${mousePos.y}px) translate(-50%, -50%)`,
        }}
      />
    </>
  );
}