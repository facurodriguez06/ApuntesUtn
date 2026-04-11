"use client";

import Link from "next/link";
import { Upload, Menu, X, ChevronRight, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { DonationModal } from "@/components/DonationModal";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);

  useEffect(() => {
    // Check initial scroll position immediately on mount
    const checkScrolled = () => setScrolled(window.scrollY > 0 || document.body.style.position === 'fixed');
    
    checkScrolled();
    
    window.addEventListener("scroll", checkScrolled);
    return () => window.removeEventListener("scroll", checkScrolled);
  }, []);

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 py-3",
        scrolled 
          ? "bg-white shadow-sm border-b border-[#EDE6DD]"
          : "bg-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-12">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3.5 group" onClick={() => setMenuOpen(false)}>
            <div className="relative flex items-center justify-center w-11 h-11 transition-all duration-300 group-hover:scale-105 group-active:scale-95">
              <img 
                src="/icon-optimized.webp" 
                alt="Logo UTNHub" 
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>
            
            <div className="flex flex-col -gap-0.5">
              <span className="font-extrabold text-[22px] tracking-tight text-[#3D3229] leading-none">
                UTN<span className="text-[#8BAA91]">Hub</span>
              </span>
              <span className="text-[9px] font-bold text-[#A89F95] tracking-[0.22em] leading-normal group-hover:text-[#7A6E62] transition-colors uppercase pt-0.5">
                Subi tu apunte!
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-2 p-1.5 bg-white/60 shadow-sm rounded-2xl border border-[#EDE6DD]/80 shadow-sm shadow-[#EDE6DD]/30">
            <Link 
              href="/" 
              className="relative text-[13px] font-bold text-[#7A6E62] hover:text-[#3D3229] px-4 py-2 rounded-xl transition-all duration-300 group hover:bg-[#F5F0EA]/50"
            >
              Explorar
              <span className="absolute bottom-1.5 left-4 right-4 h-[2px] bg-[#8BAA91] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center rounded-full opacity-60" />
            </Link>
            <Link 
              href="/planes" 
              className="relative text-[13px] font-bold text-[#7A6E62] hover:text-[#3D3229] px-4 py-2 rounded-xl transition-all duration-300 group hover:bg-[#F5F0EA]/50"
            >
              Planes de Estudio
              <span className="absolute bottom-1.5 left-4 right-4 h-[2px] bg-[#8BAA91] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center rounded-full opacity-60" />
            </Link>
            <button 
              onClick={() => setShowDonationModal(true)}
              className="relative flex items-center gap-1.5 text-[12px] font-bold text-[#8B7355] hover:text-[#3D3229] px-3 py-2 rounded-xl transition-all duration-300 group hover:bg-[#F5EFE5]/50"
            >
              <Heart className="w-3.5 h-3.5 opacity-70 group-hover:scale-110 group-hover:text-red-400 transition-all duration-300" />
              Apoyar
              <span className="absolute bottom-1.5 left-3 right-3 h-[2px] bg-[#8B7355] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center rounded-full opacity-40" />
            </button>
            <Link 
              href="/upload" 
              className="group relative flex items-center gap-2 text-[13px] font-bold text-white bg-gradient-to-b from-[#8BAA91] to-[#6A8F70] shadow-[0_2px_15px_-3px_rgba(106,143,112,0.4)] hover:shadow-[0_4px_20px_-3px_rgba(106,143,112,0.6)] border border-[#597A5E] px-5 py-2 rounded-xl overflow-hidden active:scale-[0.97] transition-all duration-300 hover:-translate-y-[2px]"
            >
              {/* Button Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />
              <Upload className="w-3.5 h-3.5 text-[#E8F0EA] group-hover:text-white group-hover:-translate-y-[1px] transition-all relative z-10" strokeWidth={2.5} />
              <span className="relative z-10 text-shadow-sm group-hover:translate-x-[1px] transition-transform">Subir apunte</span>
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            className="flex sm:hidden text-[#7A6E62] bg-white border border-[#EDE6DD] hover:text-[#3D3229] p-2 rounded-xl shadow-sm hover:bg-[#F5F0EA] transition-all active:scale-95"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div className="sm:hidden absolute top-full left-0 w-full px-4 pt-2 pb-4 mt-2 bg-white/95 shadow-sm border-b border-[#EDE6DD] shadow-xl shadow-black/5 animate-fade-in-up">
            <div className="flex flex-col gap-2 bg-[#FFFBF7] p-2 rounded-2xl border border-[#EDE6DD]">
              <Link 
                href="/" 
                className="flex items-center justify-between text-sm font-bold text-[#7A6E62] hover:text-[#3D3229] px-4 py-3 rounded-xl hover:bg-white transition-all"
                onClick={() => setMenuOpen(false)}
              >
                Explorar materias <ChevronRight className="w-4 h-4 opacity-50" />
              </Link>
              <Link 
                href="/planes" 
                className="flex items-center justify-between text-sm font-bold text-[#7A6E62] hover:text-[#3D3229] px-4 py-3 rounded-xl hover:bg-white transition-all"
                onClick={() => setMenuOpen(false)}
              >
                Planes de Estudio <ChevronRight className="w-4 h-4 opacity-50" />
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
              <button 
                onClick={() => {
                  setMenuOpen(false);
                  setShowDonationModal(true);
                }}
                className="flex w-full items-center justify-between text-sm font-bold text-[#8B7355] bg-[#F5EFE5]/50 px-4 py-3 rounded-xl transition-all"
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4" /> Apoyar proyecto
                </div>
                <ChevronRight className="w-4 h-4 opacity-30" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      <DonationModal 
        isOpen={showDonationModal} 
        onClose={() => setShowDonationModal(false)} 
      />
    </header>
  );
}
