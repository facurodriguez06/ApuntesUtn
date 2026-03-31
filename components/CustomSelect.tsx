"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
}

export function CustomSelect({ value, onChange, options, placeholder = "Seleccionar...", disabled = false }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === String(value));

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between rounded-xl border border-[#EDE6DD] px-3.5 py-2.5 text-sm transition-all focus:border-[#8BAA91] focus:outline-none focus:ring-2 focus:ring-[#8BAA91]/20 bg-white ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-[#8BAA91]/50 shadow-sm"
        }`}
      >
        <span className={`block truncate pr-2 ${selectedOption ? "text-[#3D3229]" : "text-[#A89F95]"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 shrink-0 text-[#A89F95] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-[60] w-full bottom-full mb-1.5 bg-white border border-[#EDE6DD] rounded-xl shadow-xl overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-100">
          <ul className="max-h-56 overflow-y-auto scroll-smooth">
            {options.length === 0 ? (
              <li className="px-3.5 py-2.5 text-sm text-center text-[#A89F95] italic">No hay opciones</li>
            ) : (
              options.map((option) => (
                <li
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 text-sm cursor-pointer transition-colors ${
                    String(value) === String(option.value) ? "bg-[#E8F0EA] text-[#4A7A52] font-semibold" : "text-[#3D3229] hover:bg-[#FFFBF7]"
                  }`}
                >
                  <span className="truncate pr-2">{option.label}</span>
                  {String(value) === String(option.value) && <Check className="w-4 h-4 shrink-0 text-[#4A7A52]" />}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
