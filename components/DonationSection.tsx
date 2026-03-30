"use client";

import { useState } from "react";
import { useToast } from "@/context/ToastContext";
import { Heart, DollarSign, ArrowRight, Wallet, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const PRESET_AMOUNTS = [500, 1000, 5000];

export function DonationSection() {
  const { showToast } = useToast();
  const [selectedPreset, setSelectedPreset] = useState<number | null>(1000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePresetClick = (amount: number) => {
    setSelectedPreset(amount);
    setCustomAmount("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmount(value);
    setSelectedPreset(null);
  };

  const currentAmount = selectedPreset || parseInt(customAmount) || 0;

  const handleDonate = async () => {
    if (currentAmount <= 0 || isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: currentAmount }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Error al generar el link:", data.error);
        showToast(`Error al generar el pago: ${data.error}`, "error");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      showToast("Error de conexión con el servidor.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mt-24 mb-16 w-full animate-fade-in-up">
      <div 
        className="relative overflow-hidden rounded-[2.5rem] border border-[#EDE6DD] bg-white p-8 md:p-12 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] transition-all duration-700"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Animated Background Elements */}
        <div className={cn(
          "absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#E8F0EA] opacity-40 blur-3xl transition-all duration-1000 ease-in-out",
          isHovered ? "scale-110 translate-x-4 -translate-y-4" : "scale-100"
        )} />
        <div className={cn(
          "absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#F5EFE5] opacity-40 blur-3xl transition-all duration-1000 ease-in-out",
          isHovered ? "scale-110 -translate-x-4 translate-y-4" : "scale-100"
        )} />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFE5E5] text-[#D84545] text-[10px] font-black uppercase tracking-wider mb-6">
              <Heart className="h-3 w-3 fill-current" />
              Apoyá el proyecto
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-[#3D3229] tracking-tight leading-[1.1] mb-6">
              Ayudanos a seguir <br /> 
              <span className="text-[#8BAA91]">creciendo juntos.</span>
            </h2>
            <p className="text-lg text-[#7A6E62] leading-relaxed mb-8">
              Tu colaboración voluntaria nos permite costear los servidores y seguir mejorando la plataforma para todos. ¡Cualquier monto suma!
            </p>
            
            <div className="flex items-center gap-4 text-sm font-bold text-[#A89F95]">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-[#EDE6DD]" />
                ))}
              </div>
              <span>Más de 500 estudiantes ya colaboraron</span>
            </div>
          </div>

          {/* Donation Control Card */}
          <div className="bg-[#FFFBF7] rounded-[2rem] border border-[#EDE6DD] p-6 md:p-8 shadow-sm">
            <h3 className="text-sm font-bold text-[#3D3229] mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#8BAA91]" /> Elegí un monto para donar
            </h3>

            {/* Grid de montos sugeridos */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {PRESET_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handlePresetClick(amount)}
                  className={cn(
                    "py-3 px-2 rounded-xl text-sm font-bold transition-all duration-300 border",
                    selectedPreset === amount 
                      ? "bg-[#2C2825] text-white border-[#2C2825] shadow-lg shadow-[#2C2825]/20 scale-[1.02]"
                      : "bg-white text-[#7A6E62] border-[#EDE6DD] hover:border-[#C5DBC9] hover:bg-[#F5F0EA]/50"
                  )}
                >
                  ${amount}
                </button>
              ))}
            </div>

            {/* Input Manual */}
            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A89F95] font-bold text-sm">$</span>
              <input
                type="text"
                placeholder="Otro monto..."
                value={customAmount}
                onChange={handleCustomChange}
                className={cn(
                  "w-full pl-8 pr-4 py-3 rounded-xl border bg-white text-sm font-bold transition-all outline-none",
                  !selectedPreset && customAmount 
                    ? "border-[#8BAA91] ring-2 ring-[#8BAA91]/10" 
                    : "border-[#EDE6DD] focus:border-[#C5DBC9]"
                )}
              />
            </div>

            <button
              onClick={handleDonate}
              disabled={currentAmount <= 0 || isLoading}
              className={cn(
                "group w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-sm transition-all duration-500",
                currentAmount > 0 && !isLoading
                  ? "bg-gradient-to-r from-[#8BAA91] to-[#7CC2A8] text-white shadow-xl shadow-[#8BAA91]/30 hover:scale-[1.02] active:scale-95"
                  : "bg-[#EDE6DD] text-[#A89F95] cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Procesando...</span>
                </div>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  Donar con Mercado Pago
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
            
            <p className="mt-4 text-[10px] text-center text-[#A89F95] font-medium uppercase tracking-widest flex items-center justify-center gap-1.5">
              Redirigiendo a sitio seguro <ExternalLink className="w-2.5 h-2.5" />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
