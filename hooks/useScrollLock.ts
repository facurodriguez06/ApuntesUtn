"use client";

import { useEffect } from "react";

export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    // Save current scroll Y
    const scrollY = window.scrollY;

    // Apply fixed positioning and offset it by current scroll
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    
    // Add overflow hidden just in case
    document.documentElement.style.overflow = "hidden";

    return () => {
      // Revert styles
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      
      document.documentElement.style.overflow = "";
      
      // Restore scroll Y
      window.scrollTo(0, scrollY);
    };
  }, [isLocked]);
}
