import Link from "next/link";
import { Career } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Monitor, Cpu, Building2, Cog, FlaskConical, Radio, BookMarked } from "lucide-react";

const iconMap: Record<string, React.ElementType> = { Monitor, Cpu, Building2, Cog, FlaskConical, Radio, BookMarked };

export function CareerCard({ career }: { career: Career }) {
  const IconComponent = iconMap[career.icon];

  const content = (
    <div className={cn(
      "relative group border-2 border-[#3D3229] overflow-hidden transition-all duration-300",
      career.implemented
        ? "shadow-[5px_5px_0px_#EDE6DD] hover:shadow-[2px_2px_0px_#EDE6DD] hover:translate-x-[3px] hover:translate-y-[3px] cursor-pointer"
        : "border-[#EDE6DD] opacity-60 cursor-not-allowed"
    )}>
      <div className={cn("h-1.5 w-full", career.pastelAccent)} />
      
      <div className="p-5 bg-white">
        {!career.implemented && (
          <div className="absolute top-5 right-4">
            <span className="inline-flex items-center rounded-full bg-[#F5F0EA] px-2 py-0.5 text-[10px] font-medium text-[#A89F95] border border-[#EDE6DD]">
              Próximamente
            </span>
          </div>
        )}

        <div className={cn(
          "w-12 h-12 rounded-2xl mb-4 flex items-center justify-center transition-transform duration-300",
          career.pastelBg,
          career.implemented && "group-hover:scale-110 group-hover:rotate-[-3deg]"
        )}>
          {IconComponent && <IconComponent className={cn("w-5 h-5", career.pastelText)} />}
        </div>

        <h3 className={cn(
          "text-base font-bold leading-tight mb-1.5 transition-colors", 
          career.implemented ? "text-[#3D3229]" : "text-[#A89F95]"
        )}>
          {career.shortName}
        </h3>
        <p className="text-[13px] text-[#A89F95] leading-relaxed">
          {career.description}
        </p>
        
        {career.implemented && (
          <div className="mt-4 flex items-center">
            <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full", career.pastelBg, career.pastelText)}>
              Explorar →
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (!career.implemented) return content;
  return <Link href={`/carreras/${career.id}`}>{content}</Link>;
}
