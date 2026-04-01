import Link from "next/link";
import { Career } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Monitor, Cpu, Building2, Cog, FlaskConical, Radio, BookMarked, ArrowUpRight } from "lucide-react";

const iconMap: Record<string, React.ElementType> = { Monitor, Cpu, Building2, Cog, FlaskConical, Radio, BookMarked };

export function CareerCard({ career }: { career: Career }) {
  const IconComponent = iconMap[career.icon];

  const content = (
    <div className={cn(
      "group relative flex flex-col h-full w-full rounded-[24px] box-border border overflow-hidden",
      "transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
      career.implemented
        ? "bg-white border-[#EAE4DB] hover:border-[#D5CFC6] shadow-[0_4px_24px_-8px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.06)] cursor-pointer hover:-translate-y-1"
        : "bg-[#FCFBFA] border-[#E8E2D9] opacity-70 cursor-not-allowed"
    )}>
      
      {/* Background gentle color fill on hover */}
      {career.implemented && (
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-[0.02] transition-opacity duration-700 pointer-events-none",
          career.pastelBg
        )} />
      )}

      {/* Main card content inside wrapper */}
      <div className="p-7 sm:p-8 flex flex-col flex-1 relative z-10 box-border">
        
        <div className="flex justify-between items-start mb-auto">
          
          {/* App-like rounded squircle for icon */}
          <div className={cn(
            "w-[52px] h-[52px] rounded-[15px] flex items-center justify-center transition-all duration-500 relative overflow-hidden",
            career.implemented ? "bg-white border border-[#EAE4DB] group-hover:shadow-[0_8px_16px_-6px_rgba(0,0,0,0.06)] group-hover:border-transparent" : "bg-transparent border border-[#E8E2D9] grayscale"
          )}>
            <div className={cn("absolute inset-0 opacity-[0.15] transition-opacity duration-500 group-hover:opacity-[0.25]", career.pastelBg)} />
            {IconComponent && <IconComponent className={cn("w-6 h-6 relative z-10 transition-transform duration-500 group-hover:scale-105", career.implemented ? career.pastelText : "text-[#B3A89D]")} strokeWidth={1.75} />}
          </div>

          {!career.implemented && (
            <span className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-[9px] font-bold tracking-[0.15em] text-[#9E9387] uppercase border border-[#EAE4DB] shadow-sm">    
              Próximamente
            </span>
          )}

          {/* Minimalist Top Right 'Open' symbol */}
          {career.implemented && (
            <div className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-500 relative overflow-hidden",
              "bg-[#FAFAF9] border-[#EAE4DB] text-[#9E9387]",
              "group-hover:bg-white group-hover:shadow-[0_8px_16px_-6px_rgba(0,0,0,0.06)] group-hover:border-transparent group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            )}>
              <span className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500", career.pastelBg)} />
              <ArrowUpRight className={cn(
                "w-[18px] h-[18px] transition-all duration-500 relative z-10",
                "group-hover:scale-110",
                career.implemented ? `group-hover:${career.pastelText.replace('text-', '')}` : "" 
                // We'll just define the color to appear via CSS trick or direct usage:
              )} color={career.implemented ? "currentColor" : undefined} style={career.implemented ? { color: 'inherit' } : {}} strokeWidth={2} />
              
              {/* Force the hover color using a layered approach */}
              <div className={cn("absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500", career.pastelText)}>
                <ArrowUpRight className="w-[18px] h-[18px] scale-110" strokeWidth={2} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-500">
                <ArrowUpRight className="w-[18px] h-[18px]" strokeWidth={2} />
              </div>
            </div>
          )}
        </div>

        {/* Text area is pushed to the bottom logically since mb-auto on header wrapper */}
        <div className="mt-16 flex-1">
          <h3 className={cn(
            "text-xl font-bold tracking-tight mb-2.5 transition-colors duration-300",
            career.implemented ? "text-[#2C2825]" : "text-[#9E9387]"
          )}>
            {career.shortName}
          </h3>
          <p className={cn(
            "text-[14px] leading-relaxed font-medium",
            career.implemented ? "text-[#7A6E62]" : "text-[#B3A89D]"
          )}>       
            {career.description}
          </p>
        </div>
      </div>

      {/* Decorative animated base line */}
      {career.implemented && (
        <div className="px-7 sm:px-8 pb-7 relative mt-1">
          <div className="h-1 w-10 rounded-full bg-[#EAE4DB] transition-all duration-500 overflow-hidden relative group-hover:w-full group-hover:opacity-50">
            <div className={cn(
              "absolute inset-0 w-full h-full -translate-x-full group-hover:translate-x-0 transition-transform duration-[800ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
              career.pastelBg
            )} />
          </div>
        </div>
      )}
    </div>
  );

  if (!career.implemented) return <div className="h-full w-full">{content}</div>;
  return <Link href={`/carreras/${career.id}`} className="h-full w-full block outline-none">{content}</Link>;
}
