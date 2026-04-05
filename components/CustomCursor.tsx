"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Detect touch logic
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    let isHovering = false;

    const setPosition = (x: number, y: number) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      }
    };

    const updateAppearance = () => {
      if (cursorRef.current && dotRef.current) {
        if (isHovering) {
          cursorRef.current.className = cn(
            "fixed top-0 left-0 rounded-full pointer-events-none z-[99999]",
            "transition-[width,height,background-color,border-color,backdrop-filter] duration-[200ms] ease-out flex items-center justify-center",
            "w-8 h-8 bg-[#8BAA91]/20 border border-[#8BAA91]/80 backdrop-blur-[1px]"
          );
          dotRef.current.className = cn(
            "fixed top-0 left-0 rounded-full pointer-events-none z-[100000]",
            "transition-[width,height,background-color,opacity] duration-[150ms]",
            "w-1 h-1 bg-[#2C2825] opacity-80"
          );
        } else {
          cursorRef.current.className = cn(
            "fixed top-0 left-0 rounded-full pointer-events-none z-[99999]",
            "transition-[width,height,background-color,border-color,backdrop-filter] duration-[200ms] ease-out flex items-center justify-center",
            "w-5 h-5 bg-[#8BAA91] border border-[#7A9980] shadow-sm"
          );
          dotRef.current.className = cn(
            "fixed top-0 left-0 rounded-full pointer-events-none z-[100000]",
            "transition-[width,height,background-color,opacity] duration-[150ms]",
            "w-[3px] h-[3px] bg-[#F5F0EA] opacity-90"
          );
        }
      }
    };

    let ticking = false;
    let localX = 0;
    let localY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      // Detect if mouse is over native scrollbars
      const isOverScrollbar = 
        e.clientX >= document.documentElement.clientWidth || 
        e.clientY >= document.documentElement.clientHeight;

      if (isOverScrollbar) {
        if (isVisible) setIsVisible(false);
        return;
      }

      if (!isVisible) setIsVisible(true);
      
      localX = e.clientX;
      localY = e.clientY;

      if (!ticking) {
        requestAnimationFrame(() => {
          setPosition(localX, localY);
          ticking = false;
        });
        ticking = true;
      }

      const target = e.target as HTMLElement;
      // Detect if we are hovering over something clickable (optimized)
      const clickedElement = target.tagName ? target.tagName.toLowerCase() : "";
      const isClickable = 
        clickedElement === "a" ||
        clickedElement === "button" ||
        target.closest("a") || 
        target.closest("button") ||
        target.closest("[role='button']");
        
      if (Boolean(isClickable) !== isHovering) {
        isHovering = Boolean(isClickable);
        updateAppearance();
      }
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
        /* Ocultar el cursor nativo enteramente en TODA LA PÁGINA, incluso en inputs */
        * { cursor: none !important; }
      `}} />
      
      {/* Cursor principal adaptado al estilo y paleta de la página */}
      <div 
        ref={cursorRef}
        className={cn(
          "fixed top-0 left-0 rounded-full pointer-events-none z-[99999]",
          "transition-[width,height,background-color,border-color,backdrop-filter] duration-[200ms] ease-out flex items-center justify-center",
          "w-5 h-5 bg-[#8BAA91] border border-[#7A9980] shadow-sm"
        )}
      />
      
      {/* Punto de precisión estático */}
      <div 
        ref={dotRef}
        className={cn(
          "fixed top-0 left-0 rounded-full pointer-events-none z-[100000]",
          "transition-[width,height,background-color,opacity] duration-[150ms]",
          "w-[3px] h-[3px] bg-[#F5F0EA] opacity-90"
        )}
      />
    </>
  );
}