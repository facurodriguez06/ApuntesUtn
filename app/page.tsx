import { GlobalSearchBar } from "@/components/GlobalSearchBar";
import { CareerCard } from "@/components/CareerCard";
import { LiveNotesCount } from "@/components/LiveNotesCount";
import { careersData, subjectsData } from "@/lib/data";
import { BookOpen, Layers, School } from "lucide-react";

export default function Home() {
  const totalSubjects = subjectsData.length;

  return (
    <div className="relative flex-1 flex flex-col">
      
      {/* Decorative blobs — soft ambient light */}
      <div className="blob w-96 h-96 bg-[#C5DBC9] -top-20 -left-40 animate-blob" />
      <div className="blob w-72 h-72 bg-[#E8CFC3] top-60 -right-32 animate-blob" style={{ animationDelay: '2s' }} />
      <div className="blob w-56 h-56 bg-[#D5CCE5] bottom-20 left-1/4 animate-blob" style={{ animationDelay: '4s' }} />

      <div className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 md:py-14">
        
        {/* Hero Section */}
        <section className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-3xl md:text-[2.75rem] font-extrabold text-[#3D3229] tracking-tight mb-4 leading-[1.15]">
            Tus apuntes, {' '}
            <span className="bg-gradient-to-r from-[#8BAA91] via-[#7CC2A8] to-[#7BA7C2] bg-clip-text text-transparent animate-gradient">
              en un solo lugar
            </span>
          </h1>
          <p className="text-base text-[#7A6E62] mb-8 leading-relaxed max-w-md mx-auto">
            Resúmenes, finales y guías compartidos por estudiantes de la UTN. Buscá o subí los tuyos.
          </p>
          
          <GlobalSearchBar />

          {/* Live stats */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-2 bg-[#E8F0EA] px-3 py-1.5 rounded-full">
              <BookOpen className="w-3 h-3 text-[#4A7A52]" />
              <span className="text-xs font-bold text-[#4A7A52]">
                <LiveNotesCount /> apuntes
              </span>
            </div>
            <div className="flex items-center gap-2 bg-[#EFEBF5] px-3 py-1.5 rounded-full">
              <Layers className="w-3 h-3 text-[#6B5A8E]" />
              <span className="text-xs font-bold text-[#6B5A8E]">{totalSubjects} materias</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-[#FFF0E5] px-3 py-1.5 rounded-full">
              <School className="w-3 h-3 text-[#9B6B3D]" />
              <span className="text-xs font-bold text-[#9B6B3D]">{careersData.length} carreras</span>
            </div>
          </div>
        </section>

        {/* Careers Grid */}
        <section>
          <h2 className="text-xl font-extrabold text-[#3D3229] mb-6">Elegí tu carrera</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {careersData.map((career) => (
              <div key={career.id} className="animate-fade-in-up">
                <CareerCard career={career} />
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
