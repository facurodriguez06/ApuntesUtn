"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Calculator, Atom, BookOpen, Binary, Cpu, Network, Database, 
  Code2, LineChart, Briefcase, ShieldCheck, 
  CheckCircle2, AlertTriangle, Lock, Unlock, X, Info,
  GraduationCap, ChevronRight, Layers, Sparkles, Filter,
  Building2, FlaskConical, Zap, Wrench, Microscope, ArrowLeft, Radio, FileText
} from 'lucide-react';

import { planesData } from './data';
import Link from 'next/link';

export default function PlanesPage() {
  const [activeCareer, setActiveCareer] = useState(planesData.sistemas);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Array of available careers
  const careerOptions = Object.values(planesData);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden text-[#3D3229] w-full">
      {/* Dynamic Background Effect */}
      <div 
        className="fixed inset-0 opacity-[0.25] pointer-events-none transition-colors duration-1000 z-0"
        style={{
          background: `radial-gradient(circle 800px at ${mousePos.x}px ${mousePos.y}px, ${activeCareer.name === 'Ingeniería en Sistemas' ? 'rgba(139, 170, 145, 0.4)' : activeCareer.name === 'Ingeniería Civil' ? 'rgba(212, 133, 106, 0.3)' : activeCareer.name === 'Ingeniería Química' ? 'rgba(124, 194, 168, 0.3)' : 'rgba(160, 160, 160, 0.3)'}, transparent)`
        }}
      />
      
      {/* Soft Grid Pattern */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.4] mix-blend-multiply pointer-events-none z-0"></div>

      {/* Main Content */}
      <div ref={containerRef} className="flex-grow flex flex-col pt-12 relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col gap-8 mb-12">
          <div className="space-y-4 max-w-2xl">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#8BAA91] hover:text-[#7CC2A8] font-medium transition-colors mb-2">
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A1A]">
              Planes de <span className={`text-transparent bg-clip-text bg-gradient-to-r ${activeCareer.color}`}>Estudio Interactivos</span>
            </h1>
            <p className="text-lg text-[#5C5C5C] leading-relaxed">
              Explorá la currícula de tu carrera, su estructura por años y el diagrama de correlatividades habilitantes.
            </p>
          </div>
          
          {/* Career Selector */}
          <div className="flex bg-white/70 backdrop-blur-md p-2 rounded-2xl flex-wrap justify-start items-center border border-[#E8F0EA] shadow-sm w-fit gap-2 relative z-20">
            {careerOptions.map((career) => {
              const isActive = activeCareer.id === career.id;
              return (
                <button
                  key={career.id}
                  onClick={() => setActiveCareer(career)}
                  className={`
                    relative px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2.5 active:scale-95
                    ${isActive 
                      ? 'bg-white text-[#3D3229] shadow-md shadow-[#8BAA91]/10 ring-1 ring-[#8BAA91]/40 z-10 scale-[1.02]' 
                      : 'text-[#7A6E62] hover:text-[#3D3229] hover:bg-white/60 hover:-translate-y-0.5'
                    }
                  `}
                >
                  <div className={`flex items-center justify-center p-1.5 rounded-lg transition-colors ${isActive ? `bg-gradient-to-r ${career.color} text-white shadow-sm` : 'bg-[#F5F0EA] text-[#8BAA91]'}`}>
                     {React.cloneElement(career.icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4" })}
                  </div>
                  {career.shortName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Curriculum Viewer Container */}
        <div className="flex-grow bg-white/70 backdrop-blur-xl rounded-3xl border border-[#E8F0EA] shadow-xl overflow-hidden flex flex-col min-h-[600px] mb-8 relative">
          <CurriculumViewer career={activeCareer} />
        </div>

      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// CurriculumViewer & Child Components
// ----------------------------------------------------------------------

interface Subject {
  id: number;
  year: number;
  name: string;
  regulares: number[];
  aprobadas: number[];
}

interface Career {
  id: string;
  name: string;
  shortName: string;
  years: number;
  icon: React.ReactNode;
  color: string;
  curriculum: Subject[];
}

// ----------------------------------------------------------------------
// Icon Mapper Helper
// ----------------------------------------------------------------------
const getSubjectIcon = (name: string, className: string) => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('matemática') || lowerName.includes('álgebra') || lowerName.includes('cálculo') || lowerName.includes('numérico')) return <Calculator className={className} />;
  if (lowerName.includes('física') || lowerName.includes('mecánica') || lowerName.includes('dinámica')) return <Atom className={className} />;
  if (lowerName.includes('química')) return <FlaskConical className={className} />;
  if (lowerName.includes('termodinámica')) return <Zap className={className} />;
  if (lowerName.includes('programación') || lowerName.includes('algoritmo') || lowerName.includes('software')) return <Code2 className={className} />;
  if (lowerName.includes('datos') || lowerName.includes('información')) return <Database className={className} />;
  if (lowerName.includes('redes') || lowerName.includes('comunicación')) return <Network className={className} />;
  if (lowerName.includes('sistemas') || lowerName.includes('arquitectura') || lowerName.includes('operativos')) return <Cpu className={className} />;
  if (lowerName.includes('electrónica') || lowerName.includes('eléctrica') || lowerName.includes('circuitos')) return <Binary className={className} />;
  if (lowerName.includes('civil') || lowerName.includes('estructuras') || lowerName.includes('construcción') || lowerName.includes('materiales')) return <Building2 className={className} />;
  if (lowerName.includes('economía') || lowerName.includes('gestión') || lowerName.includes('administración')) return <LineChart className={className} />;
  if (lowerName.includes('legal') || lowerName.includes('legislación')) return <Briefcase className={className} />;
  if (lowerName.includes('seguridad') || lowerName.includes('calidad')) return <ShieldCheck className={className} />;
  if (lowerName.includes('proyecto') || lowerName.includes('seminario')) return <Layers className={className} />;

  // Default fallback
  return <BookOpen className={className} />;
};

const CurriculumViewer = ({ career }: { career: Career }) => {

  const [hoveredSubject, setHoveredSubject] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(1);

  // Reset seleccion si cambiamos de carrera
  useEffect(() => {
    setSelectedSubject(null);
    setSelectedYear(1);
  }, [career.id]);

  // Group by year
  const subjectsByYear = useMemo(() => {
    const years: { [key: number]: Subject[] } = {};
    for (let i = 1; i <= career.years; i++) years[i] = [];
    career.curriculum.forEach(s => {
      if (years[s.year]) {
        years[s.year].push(s);
      }
    });
    return years;
  }, [career]);

  const yearsOptions = Array.from({ length: career.years }, (_, i) => i + 1);

  const displayedYears = Object.entries(subjectsByYear).filter(([yearStr]) => Number(yearStr) === selectedYear);

  return (
    <div className="flex h-full w-full">
      {/* Main Grid View */}
      <div className="flex-grow overflow-x-auto p-8 custom-scrollbar">
        
        {/* Simple header inside viewer */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-[#E8F0EA] gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F5F0EA] flex items-center justify-center text-[#8BAA91] shadow-inner shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">Estructura del Plan</h2>
              <p className="text-sm font-medium text-[#5C5C5C] mt-1">{career.curriculum.length} materias en total</p>
            </div>
          </div>

          {/* Year Selector */}
          <div className="flex bg-[#F5F0EA]/50 p-1 rounded-xl overflow-x-auto custom-scrollbar">
            {yearsOptions.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`
                  relative px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap active:scale-95
                  ${selectedYear === year 
                    ? 'bg-white text-[#3D3229] shadow-md shadow-[#8BAA91]/10 ring-1 ring-[#8BAA91]/30 z-10 scale-[1.05]' 
                    : 'text-[#7A6E62] hover:text-[#3D3229] hover:bg-white'
                  }
                `}
              >
                Año {year}
              </button>
            ))}
          </div>
        </div>

        {/* Years Grid */}
        <div className="flex flex-col gap-6 pb-8">
          {displayedYears.map(([yearStr, subjects]) => (
            <div key={yearStr} className="flex flex-col gap-4 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {subjects.map((subject, index) => {
                  const isHovered = hoveredSubject === subject.id;
                  const isSelected = selectedSubject?.id === subject.id;
                  
                  // Highlight logic
                  const isReqOfHovered = hoveredSubject ? career.curriculum.find(s => s.id === hoveredSubject)?.regulares.includes(subject.id) || career.curriculum.find(s => s.id === hoveredSubject)?.aprobadas.includes(subject.id) : false;
                  
                  const unlocksHovered = hoveredSubject ? subject.regulares.includes(hoveredSubject) || subject.aprobadas.includes(hoveredSubject) : false;

                  let cardStyle = "bg-white border-[#E8F0EA] hover:border-[#8BAA91]/40 hover:shadow-xl hover:shadow-[#8BAA91]/10 hover:-translate-y-1";
                  let iconColor = "text-[#A0A0A0]";

                  if (isReqOfHovered) {
                    cardStyle = "bg-[#FFF9F2] ring-2 ring-[#D4856A] ring-offset-2 scale-[1.02] transition-all z-10 shadow-lg border-[#D4856A]/50";
                    iconColor = "text-[#D4856A]";
                  } else if (unlocksHovered) {
                    cardStyle = "bg-[#F4FBFA] ring-2 ring-[#8BAA91] ring-offset-2 scale-[1.02] transition-all z-10 shadow-lg border-[#8BAA91]/50";
                    iconColor = "text-[#8BAA91]";
                  } else if (isSelected) {
                    cardStyle += " ring-2 ring-[#8BAA91] ring-offset-2 scale-[1.02] z-10 shadow-lg";
                  }

                  return (
                    <div 
                      key={subject.id}
                      onMouseEnter={() => setHoveredSubject(subject.id)}
                      onMouseLeave={() => setHoveredSubject(null)}
                      onClick={() => setSelectedSubject(subject)}
                      style={{ animationDelay: `${index * 35}ms` }}
                      className={`
                        relative p-4 rounded-2xl border transition-all duration-500 ease-out cursor-pointer group min-h-[120px] flex flex-col overflow-hidden
                        z-0 hover:z-20
                        ${cardStyle}
                      `}
                    >
                      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-current opacity-[0.03] rounded-full group-hover:scale-[2.5] transition-transform duration-700 ease-out z-0 pointer-events-none" />
                      <div className="flex items-start justify-between mb-2">
                        <span className="relative z-10 text-xs font-mono font-medium text-[#A0A0A0] bg-[#F5F5F5] px-2 py-1 rounded-md mb-2 block w-fit">
                          Cod. {subject.id.toString().padStart(3, '0')}
                        </span>
                        {getSubjectIcon(subject.name, `w-5 h-5 ${iconColor} group-hover:text-[#8BAA91] group-hover:scale-125 group-hover:-rotate-12 transition-all duration-500 ease-out shrink-0 relative z-10`)}
                      </div>
                      
                      <h4 className={`relative z-10 font-semibold text-sm leading-tight text-[#3D3229] transition-colors mt-auto`}>
                        {subject.name}
                      </h4>

                      {/* Hover action hint */}
                      <div className="relative z-10 mt-4 flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-[#8BAA91] opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 text-shadow-sm">
                        <Info className="w-3 h-3" /> Ver correlativas
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Inspector */}
      {selectedSubject && (
        <div className="w-[400px] border-l border-[#E8F0EA] bg-[#FAFAFA] p-6 overflow-y-auto hidden lg:block transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#A0A0A0]">Detalle de Correlativas</h3>
            <button 
              onClick={() => setSelectedSubject(null)}
              className="p-2 hover:bg-[#E8F0EA] rounded-full text-[#5C5C5C] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-white border border-[#E8F0EA] rounded-lg text-xs font-mono text-[#5C5C5C] mb-4 shadow-sm">
              Materia #{selectedSubject.id.toString().padStart(3, '0')}
            </span>
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2 leading-tight">
              {selectedSubject.name}
            </h2>
            <p className="text-[#8BAA91] font-medium flex items-center gap-2">
              <Layers className="w-4 h-4" /> Año {selectedSubject.year}
            </p>
          </div>

          <div className="space-y-6">

            {/* Requirements Section */}
            <div className="bg-white p-5 rounded-2xl border border-[#E8F0EA] shadow-sm">
              <h4 className="text-xs font-bold uppercase text-[#A0A0A0] mb-4">Para cursarla necesitás:</h4>
              
              {selectedSubject.regulares.length === 0 && selectedSubject.aprobadas.length === 0 ? (
                <div className="text-sm text-[#5C5C5C] flex items-center gap-2 bg-[#F9F9F9] p-3 rounded-lg border border-dashed border-[#E0E0E0]">
                  <Unlock className="w-4 h-4 text-[#8BAA91]" /> Sin correlativas previas
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedSubject.aprobadas.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-[#8BAA91] mb-2 block">Tener APROBADAS:</span>
                      <ul className="space-y-1">
                        {selectedSubject.aprobadas.map((reqId, index) => {
                          const reqSub = career.curriculum.find(s => s.id === reqId);
                          return (
                            <li 
                              key={reqId} 
                              style={{ animationDelay: `${index * 50 + 100}ms` }}
                              className="flex items-start gap-2 text-sm text-[#3D3229] hover:text-[#8BAA91] hover:bg-[#F4FBFA] p-1.5 -ml-1.5 rounded-lg cursor-pointer transition-colors group"
                              onClick={() => {
                                if (reqSub) {
                                  setSelectedSubject(reqSub);
                                  setSelectedYear(reqSub.year);
                                }
                              }}
                            >
                              <CheckCircle2 className="w-4 h-4 text-[#8BAA91] mt-0.5 shrink-0" />
                              <span className="group-hover:underline underline-offset-2">{reqSub?.name}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {selectedSubject.regulares.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-[#D4856A] mb-2 block">Tener REGULARES:</span>
                      <ul className="space-y-1">
                        {selectedSubject.regulares.map((reqId, index) => {
                          const reqSub = career.curriculum.find(s => s.id === reqId);
                          return (
                            <li 
                              key={reqId} 
                              style={{ animationDelay: `${index * 50 + 200}ms` }}
                              className="flex items-start gap-2 text-sm text-[#3D3229] hover:text-[#D4856A] hover:bg-[#FFF9F2] p-1.5 -ml-1.5 rounded-lg cursor-pointer transition-colors group"
                              onClick={() => {
                                if (reqSub) {
                                  setSelectedSubject(reqSub);
                                  setSelectedYear(reqSub.year);
                                }
                              }}
                            >
                              <AlertTriangle className="w-4 h-4 text-[#D4856A] mt-0.5 shrink-0" />
                              <span className="group-hover:underline underline-offset-2">{reqSub?.name}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Unlocks section (materias que esta habilita) */}
            <div className="bg-white p-5 rounded-2xl border border-[#E8F0EA] shadow-sm">
              <h4 className="text-xs font-bold uppercase text-[#A0A0A0] mb-4">Esta materia te permite:</h4>
              
              {(() => {
                const unlocksAsRegular = career.curriculum.filter(s => s.regulares.includes(selectedSubject.id));
                const unlocksAsApproved = career.curriculum.filter(s => s.aprobadas.includes(selectedSubject.id));
                
                if (unlocksAsRegular.length === 0 && unlocksAsApproved.length === 0) {
                  return <span className="text-sm text-[#A0A0A0] italic">No es correlativa de materias futuras.</span>;
                }

                return (
                  <div className="space-y-4">
                    {unlocksAsRegular.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-[#D4856A] mb-2 block">Si la REGULARIZÁS, podés cursar:</span>
                        <div className="flex flex-wrap gap-2">
                          {unlocksAsRegular.map((unlockedSub, index) => (
                            <span key={unlockedSub.id} 
                                  style={{ animationDelay: `${index * 50 + 100}ms` }}
                                  className="text-xs font-medium bg-[#FFF9F2] border border-[#E8F0EA] text-[#3D3229] px-2.5 py-1.5 rounded-lg hover:border-[#D4856A] hover:bg-[#D4856A]/10 cursor-pointer transition-colors"
                                  onClick={() => {
                                    setSelectedSubject(unlockedSub);
                                    setSelectedYear(unlockedSub.year);
                                  }}>
                              {unlockedSub.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {unlocksAsApproved.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-[#8BAA91] mb-2 block">Si la APROBÁS, podés cursar:</span>
                        <div className="flex flex-wrap gap-2">
                          {unlocksAsApproved.map((unlockedSub, index) => (
                            <span key={unlockedSub.id} 
                                  style={{ animationDelay: `${index * 50 + 200}ms` }}
                                  className="text-xs font-medium bg-[#F4FBFA] border border-[#E8F0EA] text-[#3D3229] px-2.5 py-1.5 rounded-lg hover:border-[#8BAA91] hover:bg-[#8BAA91]/10 cursor-pointer transition-colors"
                                  onClick={() => {
                                    setSelectedSubject(unlockedSub);
                                    setSelectedYear(unlockedSub.year);
                                  }}>
                              {unlockedSub.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
