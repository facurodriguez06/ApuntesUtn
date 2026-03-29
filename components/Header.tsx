"use client";

import Link from "next/link";
import { Upload, Menu, X, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 py-3",
        scrolled 
          ? "bg-white/80 backdrop-blur-xl shadow-[inset_0_-1px_0_0_rgba(237,230,221,0.8),0_4px_30px_-10px_rgba(0,0,0,0.05)]" 
          : "bg-transparent shadow-[inset_0_-1px_0_0_rgba(237,230,221,0)]"
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-12">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3.5 group" onClick={() => setMenuOpen(false)}>
            <div className="relative flex items-center justify-center w-11 h-11 transition-all duration-300 group-hover:scale-105 group-active:scale-95">
              <img 
                src="/icon.png?v=pixelperfect" 
                alt="Logo ApuntesUTN" 
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>
            
            <div className="flex flex-col -gap-0.5">
              <span className="font-extrabold text-[22px] tracking-tight text-[#3D3229] leading-none">
                Apuntes<span className="text-[#8BAA91]">UTN</span>
              </span>
              <span className="text-[9px] font-bold text-[#A89F95] tracking-[0.22em] leading-normal group-hover:text-[#7A6E62] transition-colors uppercase pt-0.5">
                Comunidad Estudiantil
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-2 p-1.5 bg-white/60 backdrop-blur-md rounded-2xl border border-[#EDE6DD]/80 shadow-sm shadow-[#EDE6DD]/30">
            <Link 
              href="/" 
              className="text-[13px] font-bold text-[#7A6E62] hover:text-[#3D3229] px-4 py-2 rounded-xl hover:bg-white hover:shadow-sm transition-all duration-300"
            >
              Explorar
            </Link>
            <Link 
              href="/upload" 
              className="group relative flex items-center gap-2 text-[13px] font-bold text-white bg-gradient-to-b from-[#8BAA91] to-[#6A8F70] shadow-[0_2px_15px_-3px_rgba(106,143,112,0.4)] border border-[#597A5E] px-5 py-2 rounded-xl overflow-hidden active:scale-[0.97] transition-all duration-300"
            >
              {/* Button Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out" />
              <Upload className="w-3.5 h-3.5 text-[#E8F0EA] group-hover:text-white transition-colors relative z-10" strokeWidth={2.5} />
              <span className="relative z-10 text-shadow-sm">Subir apunte</span>
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="flex sm:hidden text-[#7A6E62] bg-white border border-[#EDE6DD] hover:text-[#3D3229] p-2 rounded-xl shadow-sm hover:bg-[#F5F0EA] transition-all active:scale-95"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div className="sm:hidden absolute top-full left-0 w-full px-4 pt-2 pb-4 mt-2 bg-white/95 backdrop-blur-xl border-b border-[#EDE6DD] shadow-xl shadow-black/5 animate-fade-in-up">
            <div className="flex flex-col gap-2 bg-[#FFFBF7] p-2 rounded-2xl border border-[#EDE6DD]">
              <Link 
                href="/" 
                className="flex items-center justify-between text-sm font-bold text-[#7A6E62] hover:text-[#3D3229] px-4 py-3 rounded-xl hover:bg-white transition-all"
                onClick={() => setMenuOpen(false)}
              >
                Explorar materias <ChevronRight className="w-4 h-4 opacity-50" />
              </Link>
              <Link 
                href="/upload" 
                className="flex items-center justify-between text-sm font-bold text-[#4A7A52] bg-[#E8F0EA] px-4 py-3 rounded-xl transition-all"
                onClick={() => setMenuOpen(false)}
              >
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Subir nuevo apunte
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
