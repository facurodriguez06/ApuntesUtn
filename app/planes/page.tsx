"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Calculator, Atom, BookOpen, Binary, Cpu, Network, Database, 
  Code2, LineChart, Briefcase, ShieldCheck, ShieldAlert,
  CheckCircle2, AlertTriangle, Lock, Unlock, X, Info,
  GraduationCap, ChevronRight, Layers, Sparkles, Filter,
  Building2, FlaskConical, Zap, Wrench, Microscope, ArrowLeft, Radio, FileText, Calendar, Star, LogIn
} from 'lucide-react';

import { planesData } from './data';
import Link from 'next/link';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import SubjectRatingModal from '@/components/SubjectRatingModal';
import { useRouter } from 'next/navigation';

export interface Subject {
  isElectiva?: boolean;
  docente?: string;
  horario?: string;
  weekly_hours?: number;
  total_hours?: number;
  id: number;
  year: number;
  semester?: string;
  note?: string;
  name: string;
  regulares: number[];
  aprobadas: number[];
  rendir?: number[];
}

export interface Career {
  id: string;
  name: string;
  shortName: string;
  years: number;
  icon: React.ReactElement;
  color: string; requiredElectiveHours?: number;
  curriculum: Subject[];
}

const SubjectStatusRibbon = ({
  label,
  tone,
}: {
  label: string;
  tone: 'approved' | 'regular';
}) => {
  const toneClasses =
    tone === 'approved'
      ? 'bg-gradient-to-r from-[#43a047] to-[#388E3C] shadow-[#388E3C]/30'
      : 'bg-gradient-to-r from-[#ff9800] to-[#e65100] shadow-[#e65100]/30';

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none transition-opacity duration-300 opacity-100 group-hover:opacity-0 drop-shadow-xl overflow-hidden">
      <div
        className="absolute left-1/2 top-1/2 flex w-[146%] -translate-x-1/2 -translate-y-1/2 items-center justify-center select-none animate-stamp"
      >
        <div
          className={`flex w-full items-center justify-center rounded-[1.35rem] border-t-2 border-b-4 border-white/80 px-4 text-center font-black uppercase whitespace-nowrap text-white drop-shadow-xl ${toneClasses}`}
          style={{
            fontSize: 'clamp(0.72rem, 5.6cqw, 1.75rem)',
            paddingTop: 'clamp(0.35rem, 1cqw, 0.6rem)',
            paddingBottom: 'clamp(0.35rem, 1cqw, 0.6rem)',
            letterSpacing: 'clamp(0.08em, 0.38cqw, 0.11em)',
            textShadow: '0 2px 8px rgba(0,0,0,0.18)',
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};

const InteractiveProgressButtons = ({ subject, userProgress, onToggle, user, setShowLoginPrompt }: any) => {
  const isApproved = user ? userProgress.aprobadas.includes(subject.id) : false;
  const isRegular = user ? userProgress.regulares.includes(subject.id) : false;

  const missingAprobadas = subject.aprobadas.some((id: number) => !userProgress.aprobadas.includes(id));
  const missingRegulares = subject.regulares.some((id: number) => !userProgress.aprobadas.includes(id) && !userProgress.regulares.includes(id));
  const canTake = !missingAprobadas && !missingRegulares;

  const handleAction = (type: 'aprobadas' | 'regulares') => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    onToggle(subject.id, type);
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-[#E8F0EA] shadow-sm flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-bold uppercase text-[#A0A0A0]">Mi Progreso</h4>
          {!isApproved && !isRegular && (
            canTake 
              ? <span className="text-[10px] font-bold px-2 py-0.5 rounded text-[#388E3C] bg-[#E8F5E9] border border-[#388E3C]/20">Puedes cursarla</span>
              : <span className="text-[10px] font-bold px-2 py-0.5 rounded text-[#D4856A] bg-[#FFF9F2] border border-[#D4856A]/20">Aún no podés cursarla</span>
          )}
        </div>
        {(isApproved || isRegular) && user && (
          <button
            onClick={() => handleAction(isApproved ? 'aprobadas' : 'regulares')}
            className="text-[10px] sm:text-xs font-bold text-[#D4856A] hover:bg-[#FFF9F2] px-2 py-1 flex items-center gap-1 rounded-md transition-colors"       
          >
            <X className="w-3 h-3" /> Desmarcar
          </button>
        )}
      </div>
      <div className="flex gap-2 w-full">
        <button
          onClick={() => handleAction('aprobadas')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all
            ${isApproved ? 'bg-[#E8F5E9] text-[#388E3C] ring-1 ring-[#388E3C]/50 shadow-sm' : 'bg-[#FAFAFA] text-[#7A6E62] hover:bg-[#F5F0EA]'}
          `}
        >
          <CheckCircle2 className="w-4 h-4" /> Aprobada
        </button>
        <button
          onClick={() => handleAction('regulares')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all
            ${isRegular ? 'bg-[#FFF3E0] text-[#E65100] ring-1 ring-[#E65100]/50 shadow-sm' : 'bg-[#FAFAFA] text-[#7A6E62] hover:bg-[#F5F0EA]'}
          `}
        >
          <AlertTriangle className="w-4 h-4" /> Regular
        </button>
      </div>
    </div>
  );
};

export default function PlanesPage() {
  const typedPlanesData: Record<string, Career> = planesData as any;
  const [activeCareer, setActiveCareer] = useState<Career>(typedPlanesData.sistemas);
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  
  // Array of available careers
  const careerOptions = Object.values(typedPlanesData);

  // States for Ratings
  const [globalRatings, setGlobalRatings] = useState<Record<string, {diffAvg: number, utilAvg: number, count: number}>>({});
  const [ratingModalSubject, setRatingModalSubject] = useState<{id: string, name: string} | null>(null);
  const [ratingModalCareer, setRatingModalCareer] = useState<string>('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const router = useRouter();

  const fetchGlobalRatings = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'subject_aggregates'));
      const ratings: Record<string, any> = {};
      querySnapshot.forEach((doc) => {
        if (doc.id.startsWith(activeCareer.id + '_')) {
          const subjectId = doc.id.replace(activeCareer.id + '_', '');
          const data = doc.data();
          ratings[subjectId] = {
            diffAvg: data.totalDifficulty / data.count,
            utilAvg: data.totalUtility / data.count,
            count: data.count
          };
        }
      });
      setGlobalRatings(ratings);
    } catch (error) {
      console.error("Error fetching ratings", error);
    }
  };

  useEffect(() => {
    fetchGlobalRatings();
  }, [activeCareer.id]);

  useEffect(() => {
    let ticking = false;
    const handleMouseMove = () => {};

    
    return () => {
      
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden text-[#3D3229] w-full">
      {/* Dynamic Background Effect */}
      <div 
        ref={bgRef}
        className="fixed inset-0 opacity-[0.25] pointer-events-none transition-opacity duration-300 z-0"
        style={{
          background: `radial-gradient(circle 100vh at 50% 0%, ${activeCareer.name === 'Ingeniería en Sistemas' ? 'rgba(139, 170, 145, 0.4)' : activeCareer.name === 'Ingeniería Civil' ? 'rgba(212, 133, 106, 0.3)' : activeCareer.name === 'Ingeniería Química' ? 'rgba(124, 194, 168, 0.3)' : 'rgba(160, 160, 160, 0.3)'}, transparent)`
        }}
      />
      
      {/* Soft Grid Pattern */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.4]  pointer-events-none z-0"></div>

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
          <div className="flex bg-[#FCFBFA] p-2 rounded-2xl flex-wrap justify-start items-center border border-[#E8F0EA] shadow-sm w-fit gap-2 relative z-20">
            {careerOptions.map((career) => {
              const isActive = activeCareer.id === career.id;
              return (
                <button
                  key={career.id}
                  onClick={() => setActiveCareer(career)}
                  className={`
                    relative px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 flex items-center gap-2.5 active:scale-95
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
        <div className="flex-grow relative flex flex-col min-h-[600px] mb-8">
          <div className="absolute inset-0 bg-white border-b shadow-sm rounded-3xl border border-[#E8F0EA] shadow-xl pointer-events-none z-0" />
          <div className="relative z-10 flex-grow flex flex-col min-h-[600px] rounded-3xl overflow-hidden">
            <CurriculumViewer career={activeCareer} globalRatings={globalRatings} setRatingModalSubject={setRatingModalSubject} setRatingModalCareer={setRatingModalCareer} setShowLoginPrompt={setShowLoginPrompt} />
          </div>
        </div>

      </div>

      {/* Modals placed outside main flow */}
      <SubjectRatingModal 
        isOpen={!!ratingModalSubject} 
        onClose={() => setRatingModalSubject(null)} 
        subject={ratingModalSubject} 
        careerId={ratingModalCareer}
        onRatingUpdated={() => {
          fetchGlobalRatings();
        }}
      />

      {/* Login Prompt Modal */}
      {showLoginPrompt && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowLoginPrompt(false)}
          />
          <div className="relative bg-white rounded-3xl border border-[#EDE6DD] shadow-2xl max-w-sm w-full outline-none transform transition-all overflow-hidden animate-fade-in-scale p-6 text-center mx-4">
            <div className="w-14 h-14 bg-[#F5F0EA] rounded-2xl flex items-center justify-center mb-6 shadow-inner text-[#D4856A] mx-auto">
              <LogIn className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-[#3D3229] mb-2 tracking-tight">Iniciá sesión</h3>
            <p className="text-sm font-medium text-[#7A6E62] mb-6">
              Para calificar materias y ayudar a otros estudiantes, necesitas tener una cuenta. ¡Es gratis y rápido!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-[#7A6E62] border border-[#EDE6DD] hover:bg-[#FAFAF8] transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => router.push('/auth')}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white bg-[#1A1A1A] hover:bg-[#3D3229] transition-all shadow-lg active:scale-95"
              >
                Ingresar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// CurriculumViewer & Child Components
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

const CurriculumViewer = ({ career, globalRatings, setRatingModalSubject, setRatingModalCareer, setShowLoginPrompt }: { career: Career, globalRatings: any, setRatingModalSubject: any, setRatingModalCareer: any, setShowLoginPrompt: any }) => {

  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState<{ aprobadas: number[], regulares: number[] }>({ aprobadas: [], regulares: [] });

  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
          setUserProgress(docSnap.data().progress || { aprobadas: [], regulares: [] });
        }
      }).catch((error) => {
        console.error("Error al leer el progreso (¿Firebase Quota Exceeded?):", error);
      });
    } else {
      setUserProgress({ aprobadas: [], regulares: [] });
    }
  }, [user]);

  const handleToggleState = async (subjectId: number, state: 'aprobadas' | 'regulares') => {
    if (!user) return;
    
    setUserProgress(prev => {
      const newState = { ...prev };
      
      if (state === 'aprobadas') {
        if (newState.aprobadas.includes(subjectId)) {
          newState.aprobadas = newState.aprobadas.filter(id => id !== subjectId);
        } else {
          newState.aprobadas = [...newState.aprobadas, subjectId];
          newState.regulares = newState.regulares.filter(id => id !== subjectId);
        }
      } else if (state === 'regulares') {
        if (newState.regulares.includes(subjectId)) {
          newState.regulares = newState.regulares.filter(id => id !== subjectId);
        } else {
          newState.regulares = [...newState.regulares, subjectId];
          newState.aprobadas = newState.aprobadas.filter(id => id !== subjectId);
        }
      }
      
      const userRef = doc(db, 'users', user.uid);
      updateDoc(userRef, { progress: newState }).catch(e => console.error("Error updating progress", e));
      
      return newState;
    });
  };

  const [hoveredSubject, setHoveredSubject] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | 'electivas'>(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset seleccion si cambiamos de carrera
  useEffect(() => {
    setSelectedSubject(null);
    setSelectedYear(1);
  }, [career.id]);

  // Bloquear el scroll de la página en celulares cuando el modal está abierto (Fix iOS)
  // Utilizamos el hook global para tener un comportamiento estandarizado entre Android e iOS
  // y prevenir problemas con el Header donde position=fixed resetearía el scrollY
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 1024);
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useScrollLock(!!selectedSubject && isMobile);

  // Group by year
  const subjectsByYear = useMemo(() => {
    const years: { [key: string]: Subject[] } = {};
    for (let i = 1; i <= career.years; i++) years[i] = [];
    years['electivas'] = [];
    career.curriculum.forEach(s => {
      if (s.isElectiva) {
        years['electivas'].push(s);
      } else if (years[s.year]) {
        years[s.year].push(s);
      }
    });
    return years;
  }, [career]);

  const yearsOptions: (number | 'electivas')[] = [
    ...Array.from({ length: career.years }, (_, i) => i + 1),
    ...(subjectsByYear['electivas'] && subjectsByYear['electivas'].length > 0 ? ['electivas' as const] : [])
  ];

  const displayedYears = Object.entries(subjectsByYear).filter(([yearStr]) =>
    yearStr === 'electivas' ? selectedYear === 'electivas' : Number(yearStr) === selectedYear
  );

    return (
    <div className="flex flex-col lg:flex-row h-full w-full relative overflow-hidden rounded-3xl">
      {/* Main Grid View */}
      <div className="flex-grow overflow-x-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
        
        {/* Simple header inside viewer */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-6 lg:mb-8 pb-6 border-b border-[#E8F0EA] gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-[#F5F0EA] flex items-center justify-center text-[#8BAA91] shadow-inner shrink-0">
                <GraduationCap className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <div>
                <h2 className="text-lg lg:text-xl font-bold text-[#1A1A1A]">Estructura del Plan</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <p className="text-xs lg:text-sm font-medium text-[#5C5C5C]">
                    {career.curriculum.filter(s => !s.isElectiva).length} troncales {career.requiredElectiveHours ? ` + ${career.requiredElectiveHours} hs electivas` : ''}
                  </p>
                  
                  {user ? (
                    <>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#E8F0EA] hidden sm:block"></div>
                      {(() => {
                        const coreSubjects = career.curriculum.filter(s => !s.isElectiva);
                        const electiveSubjects = career.curriculum.filter(s => s.isElectiva);
                        const approvedCore = coreSubjects.filter(s => userProgress.aprobadas.includes(s.id)).length;
                        
                        if (career.requiredElectiveHours) {
                          const approvedHs = electiveSubjects
                            .filter(s => userProgress.aprobadas.includes(s.id))
                            .reduce((acc, s) => acc + (s.weekly_hours || s.total_hours || 0), 0);
                            
                          const remainingCore = coreSubjects.length - approvedCore;
                            
                          return (
                            <div className="flex flex-wrap items-center gap-2">
                               <span className="text-[11px] lg:text-xs font-bold text-[#388E3C] bg-[#E8F5E9] px-2 py-1 rounded-md flex items-center gap-1 shadow-sm border border-[#388E3C]/20"><CheckCircle2 className="w-3.5 h-3.5" /> Troncales: {approvedCore} / {coreSubjects.length}</span>
                               {remainingCore > 0 && <span className="text-[11px] lg:text-xs font-bold text-[#D4856A] bg-[#FFF9F2] px-2 py-1 rounded-md flex items-center gap-1 shadow-sm border border-[#D4856A]/20"><AlertTriangle className="w-3.5 h-3.5" /> {remainingCore} restantes</span>}
                               
                               <span className="text-[11px] lg:text-xs font-bold text-[#8BAA91] bg-[#F5F9F6] px-2 py-1 rounded-md flex items-center gap-1 shadow-sm border border-[#8BAA91]/20"><Atom className="w-3.5 h-3.5" /> Electivas: {approvedHs} / {career.requiredElectiveHours} hs</span>
                            </div>
                          );
                        } else {
                          const careerSubjectIds = new Set(career.curriculum.map(s => s.id));
                          const approvedInCareer = userProgress.aprobadas.filter(id => careerSubjectIds.has(id)).length;
                          const remaining = career.curriculum.length - approvedInCareer;
                          
                          return (
                            <div className="flex flex-wrap items-center gap-2">
                               <span className="text-[11px] lg:text-xs font-bold text-[#388E3C] bg-[#E8F5E9] px-2 py-1 rounded-md flex items-center gap-1 shadow-sm border border-[#388E3C]/20"><CheckCircle2 className="w-3.5 h-3.5" /> {approvedInCareer} aprobadas</span>
                               <span className="text-[11px] lg:text-xs font-bold text-[#D4856A] bg-[#FFF9F2] px-2 py-1 rounded-md flex items-center gap-1 shadow-sm border border-[#D4856A]/20"><AlertTriangle className="w-3.5 h-3.5" /> {remaining} restantes</span>
                            </div>
                          );
                        }
                      })()}
                    </>
                  ) : (
                    <>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#E8F0EA] hidden sm:block"></div>
                      <span className="text-[11px] lg:text-xs font-bold text-[#A0A0A0] bg-[#FAFAFA] px-2 py-1 rounded-md flex items-center gap-1 shadow-sm border border-[#E8F0EA] border-dashed"><LogIn className="w-3.5 h-3.5" /> Logueate para llevar tu progreso y horas electivas</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Year Selector */}
        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 mb-6">
          {yearsOptions.map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`
                px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200
                ${selectedYear === year
                  ? 'bg-[#3D3229] text-white shadow-md shadow-[#3D3229]/20 scale-105'
                  : 'bg-white text-[#7A6E62] border border-[#E8F0EA] hover:bg-[#F5F0EA] hover:text-[#3D3229] hover:border-[#8BAA91]/30'
                }
              `}
            >
              {year === 'electivas' ? 'Electivas' : `${year}º Año`}
            </button>
          ))}
        </div>

        {/* Status References */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-8 px-5 py-3.5 bg-gradient-to-r from-[#F4FBFA]/90 to-[#FFF5F5]/90 rounded-2xl border border-[#E8F0EA] shadow-sm w-fit border-l-4 border-l-[#8BAA91]">
          <span className="text-[10px] font-black text-[#8BAA91] uppercase tracking-[0.15em] mr-2">Referencias</span>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md bg-[#F4FBFA] border-2 border-[#8BAA91] shadow-inner flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#8BAA91]" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#3D3229]">Puedes Cursar</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-[#D4856A]/20 hidden sm:block"></div>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md bg-[#FFF5F5] border-2 border-[#D4856A] shadow-inner flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-[#D4856A]" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#3D3229]">Bloqueada</span>
          </div>
        </div>

        {/* Years Grid */}
        <div className={`flex flex-col gap-6 pb-8 ${selectedSubject ? 'mb-[50vh] lg:mb-0' : ''}`}>
          {(() => {
            const hoveredData = hoveredSubject ? career.curriculum.find(s => s.id === hoveredSubject) : null;
            const hoveredRegulares = new Set(hoveredData?.regulares || []);
            const hoveredAprobadas = new Set(hoveredData?.aprobadas || []);

            return displayedYears.map(([yearStr, subjects]) => (
            <div key={yearStr} className="flex flex-col gap-4 w-full">
              <div className={`grid gap-4 ${
                selectedSubject 
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3' 
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
              }`}>
                {subjects.map((subject, index) => {
                  const isHovered = hoveredSubject === subject.id;
                  const isSelected = selectedSubject?.id === subject.id;

                  // Highlight logic much faster O(1)
                  const isReqOfHovered = hoveredSubject ? hoveredRegulares.has(subject.id) || hoveredAprobadas.has(subject.id) : false;                   const unlocksHovered = hoveredSubject ? subject.regulares.includes(hoveredSubject) || subject.aprobadas.includes(hoveredSubject) : false;
                  let cardStyle = "bg-white border-[#E8F0EA] hover:border-[#8BAA91]/40 hover:shadow-xl hover:shadow-[#8BAA91]/10 hover:-translate-y-1";
                  let iconColor = "text-[#A0A0A0]";
                  let spanClass = "";
                    const isApproved = userProgress.aprobadas.includes(subject.id);
                    const isRegular = userProgress.regulares.includes(subject.id);

                    let canTake = false;
                    if (user && !isApproved && !isRegular && subject.name !== "Materias Electivas") {
                      const missingAprobadas = subject.aprobadas.some((id: number) => !userProgress.aprobadas.includes(id));
                      const missingRegulares = subject.regulares.some((id: number) => !userProgress.aprobadas.includes(id) && !userProgress.regulares.includes(id));
                      canTake = !missingAprobadas && !missingRegulares;
                    }

                    if (isApproved) {
                      cardStyle = "bg-[#E8F5E9] border-[#388E3C]/40 shadow-sm relative overflow-hidden opacity-70 hover:opacity-100 transition-opacity";
                      iconColor = "text-[#388E3C]";
                    } else if (isRegular) {
                      cardStyle = "bg-[#FFF3E0] border-[#E65100]/40 shadow-sm relative overflow-hidden opacity-70 hover:opacity-100 transition-opacity";
                      iconColor = "text-[#E65100]";
                    } else if (user && subject.name !== "Materias Electivas") {
                      if (canTake) {
                        cardStyle = "bg-[#F4FBFA] border-[#8BAA91] border-2 shadow-md hover:-translate-y-1 transition-all relative overflow-hidden";
                        iconColor = "text-[#8BAA91]";
                      } else {
                        cardStyle = "bg-[#FFF5F5] border-[#D4856A] border-2 shadow-sm hover:-translate-y-1 transition-all relative overflow-hidden opacity-90";
                        iconColor = "text-[#D4856A]";
                      }
                    }
                  if (subject.name === "Materias Electivas") {
                    spanClass = "col-span-full bg-[#F5F0EA]/30 border-dashed border-2";
                  }

                  if (isReqOfHovered) {
                    cardStyle = "bg-[#FFF9F2] ring-2 ring-[#D4856A] ring-offset-2 scale-[1.02] transition-all z-10 will-change-transform shadow-lg border-[#D4856A]/50";
                    iconColor = "text-[#D4856A]";
                  } else if (unlocksHovered) {
                    cardStyle = "bg-[#F4FBFA] ring-2 ring-[#8BAA91] ring-offset-2 scale-[1.02] transition-all z-10 will-change-transform shadow-lg border-[#8BAA91]/50";
                    iconColor = "text-[#8BAA91]";
                  } else if (isSelected) {
                    cardStyle += " ring-2 ring-[#8BAA91] ring-offset-2 scale-[1.02] z-10 shadow-lg";
                  }

                  return (
                    <div 
                      key={subject.id}
                      role="button"
                      onMouseEnter={() => setHoveredSubject(subject.id)}
                      onMouseLeave={() => setHoveredSubject(null)}
                      onClick={() => setSelectedSubject(subject)}
                      style={{ animationDelay: `${index * 8}ms`, animationDuration: '250ms' }}
                      className={`
                        relative p-4 rounded-2xl border transition-all duration-100 ease-out group min-h-[120px] flex flex-col overflow-hidden [container-type:inline-size]
                        z-0 hover:z-20 animate-fade-in-up
                        ${cardStyle}
                        ${spanClass}
                      `}
                    >
                      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-current opacity-[0.03] rounded-full group-hover:scale-[2.5] transition-transform duration-150 ease-out z-0 pointer-events-none" />
                      
                      {/* Watermark Labels */}
                      {isApproved && (
                        <SubjectStatusRibbon label="APROBADA" tone="approved" />
                      )}

                      {isRegular && !isApproved && (
                        <SubjectStatusRibbon label="REGULARIZADA" tone="regular" />
                      )}

                      <div className="flex items-start justify-between mb-2 relative z-10 bg-white/40 backdrop-blur-[1px] p-1 -m-1 rounded-lg">
                        <div className="flex items-center gap-1.5">
                          <span className="relative z-10 text-xs font-mono font-medium text-[#A0A0A0] bg-[#F5F5F5] px-2 py-1 rounded-md block w-fit">
                            Cod. {subject.id.toString().padStart(3, '0')}
                          </span>
                          {subject.semester && subject.semester !== 'Electiva' && (
                            <span className={`
                              relative z-10 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 w-fit
                              ${subject.semester === 'Anual'
                                ? 'bg-[#EDE9FE] text-[#7C3AED]'
                                : subject.semester.includes('1')
                                  ? 'bg-[#E8F5E9] text-[#388E3C]'
                                  : 'bg-[#FFF3E0] text-[#E65100]'
                              }
                            `}>
                              <Calendar className="w-3 h-3" />
                              {subject.semester === 'Anual' ? 'Anual' : subject.semester.includes('1') ? '1C' : '2C'}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 items-center relative z-10 shrink-0">{getSubjectIcon(subject.name, `w-5 h-5 ${iconColor} group-hover:text-[#8BAA91] group-hover:scale-125 group-hover:-rotate-12 transition-all duration-100 ease-out`)}</div>
                      </div>

                      <div className="relative z-10 mt-auto flex flex-col gap-1.5">
                        <h4 className="font-semibold text-sm leading-tight text-[#3D3229] transition-colors">
                          {subject.name}
                        </h4>
                        {subject.note && (
                          <p className="text-[9px] uppercase tracking-wide leading-tight text-[#8BAA91] font-bold">
                            *{subject.note}
                          </p>
                        )}
                      </div>

                      {/* Hover action hint & Rating */}
                      <div className="relative z-10 mt-4 flex items-center justify-between">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!user) {
                              setShowLoginPrompt(true);
                            } else {
                              setRatingModalCareer(career.id);
                              setRatingModalSubject({ id: subject.id, name: subject.name });
                            }
                          }}
                          className={`
                            flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-150 z-20 border
                            ${globalRatings[subject.id] 
                              ? 'bg-[#FAFAF8] text-[#3D3229] border-[#EDE6DD] hover:bg-[#F5F0EA] hover:border-[#8BAA91]/50' 
                              : 'bg-transparent text-[#A0A0A0] border-transparent hover:bg-[#FAFAF8] hover:text-[#8BAA91] hover:border-[#EDE6DD]'}
                          `}
                        >
                          {!globalRatings[subject.id] ? (
                            <>
                              <Star className="w-3.5 h-3.5" />
                              <span className="hidden @[160px]:inline">Calificar</span>
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1 text-[#D4856A]">
                                <ShieldAlert className="w-3.5 h-3.5" />
                                {globalRatings[subject.id].diffAvg.toFixed(1)}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-[#E8F0EA]" />
                              <span className="flex items-center gap-1 text-[#8BAA91]">
                                <Sparkles className="w-3.5 h-3.5" />
                                {globalRatings[subject.id].utilAvg.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </button>

                        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-[#8BAA91] opacity-0 group-hover:opacity-100 transition-all duration-150 translate-y-2 group-hover:translate-y-0 text-shadow-sm pointer-events-none whitespace-nowrap overflow-hidden">
                          <Info className="w-3 h-3 flex-shrink-0" /> <span className="hidden @[220px]:inline">Ver correlativas</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            ));
          })()}
        </div>
      </div>

      {/* Sidebar Inspector Mobile (via Portal to escape container constraints) */}
      {selectedSubject && mounted && typeof document !== 'undefined' && createPortal(
        <div className="lg:hidden">
          {/* Mobile Overlay */}
          <div 
            className="fixed inset-0 bg-black/5 z-[100] transition-opacity" 
            onClick={() => setSelectedSubject(null)} 
          />
          
          {/* Mobile Bottom Sheet */}
          <div className="
            fixed bottom-0 left-0 right-0 z-[101] rounded-t-3xl max-h-[85vh] overflow-y-auto scrollbar-hide
            border-t border-[#E8F0EA] bg-[#FAFAFA] px-6 pt-6 pb-8
            transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]
          ">
            <div className="w-12 h-1.5 bg-[#E8F0EA] rounded-full mx-auto mb-6" />

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#A0A0A0]">Detalle de Correlativas</h3>
              <button 
                onClick={() => setSelectedSubject(null)}
                className="p-2 hover:bg-[#E8F0EA] rounded-full text-[#5C5C5C] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6" key={selectedSubject.id}>
              <div className="bg-white p-5 rounded-2xl border border-[#E8F0EA] shadow-sm">
                <h2 className="text-xl font-bold leading-tight mb-2 pr-4">{selectedSubject.name}</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs font-mono font-medium text-[#A0A0A0] bg-[#F5F5F5] px-2 py-1 rounded-md">Cod. {selectedSubject.id.toString().padStart(3, '0')}</span>
                  {selectedSubject.semester && selectedSubject.semester !== 'Electiva' ? (
                    <span className="text-xs font-bold text-[#8BAA91] bg-[#F5F9F6] px-2 py-1 rounded-md">{selectedSubject.semester}</span>
                  ) : null}
                  {selectedSubject.isElectiva ? (
                    <span className="text-xs font-bold text-[#A0A0A0] bg-[#F5F5F5] px-2 py-1 rounded-md">Electiva</span>
                  ) : null}
                </div>
                
                {/* Information Grid Container */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#F5F0EA]">
                  {selectedSubject.weekly_hours ? (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#A0A0A0] mb-1">Horas Semanales</h4>
                      <p className="text-sm font-semibold">{selectedSubject.weekly_hours} hs</p>
                    </div>
                  ) : null}
                  {selectedSubject.total_hours ? (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#A0A0A0] mb-1">Horas Totales</h4>
                      <p className="text-sm font-semibold">{selectedSubject.total_hours} hs</p>
                    </div>
                  ) : null}
                </div>
                
                {(selectedSubject.docente || selectedSubject.horario) && (
                  <div className="grid grid-cols-1 gap-3 pt-3 mt-3 border-t border-[#F5F0EA]">
                    {selectedSubject.docente && (
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#A0A0A0] mb-1">Cátedra / Docente</h4>
                        <p className="text-sm font-semibold">{selectedSubject.docente}</p>
                      </div>
                    )}
                    {selectedSubject.horario && (
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#A0A0A0] mb-1">Régimen y Horarios</h4>
                        <p className="text-sm font-semibold leading-relaxed">{selectedSubject.horario}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <InteractiveProgressButtons 
                subject={selectedSubject} 
                userProgress={userProgress} 
                onToggle={handleToggleState} 
                user={user}
                setShowLoginPrompt={setShowLoginPrompt}
              />

              {selectedSubject?.note && (
                <div className="bg-[#FFF9F2] p-4 rounded-xl border border-[#D4856A]/20">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-[#D4856A] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#D4856A] mb-1">Requisito Especial</h4>
                      <p className="text-sm text-[#3D3229]/80 leading-relaxed font-medium">
                        {selectedSubject.note}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {selectedSubject.regulares && selectedSubject.regulares.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8BAA91] mb-2 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" /> Para Cursar (Regularizar)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubject.regulares.map(reqId => {
                        const reqSub = career.curriculum.find(s => s.id === reqId);
                        return reqSub && (
                          <button key={reqId} onClick={() => setSelectedSubject(reqSub)} className="text-xs px-2.5 py-1.5 bg-white border border-[#E8F0EA] rounded-lg text-[#5C5C5C] shadow-sm flex items-center gap-1.5 font-medium hover:border-[#8BAA91]/40 hover:bg-[#F5F9F6] transition-colors text-left">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E65100]"></span>
                            {reqSub.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedSubject.aprobadas && selectedSubject.aprobadas.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8BAA91] mb-2 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" /> Para Cursar (Aprobar)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubject.aprobadas.map(reqId => {
                        const reqSub = career.curriculum.find(s => s.id === reqId);
                        return reqSub && (
                          <button key={reqId} onClick={() => setSelectedSubject(reqSub)} className="text-xs px-2.5 py-1.5 bg-white border border-[#E8F0EA] rounded-lg text-[#5C5C5C] shadow-sm flex items-center gap-1.5 font-medium hover:border-[#8BAA91]/40 hover:bg-[#F5F9F6] transition-colors text-left">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#388E3C]"></span>
                            {reqSub.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {selectedSubject.rendir && selectedSubject.rendir.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8BAA91] mb-2 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" /> Para Rendir Final (Aprobar)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubject.rendir.map(reqId => {
                        const reqSub = career.curriculum.find(s => s.id === reqId);
                        return reqSub && (
                          <button key={reqId} onClick={() => setSelectedSubject(reqSub)} className="text-xs px-2.5 py-1.5 bg-white border border-[#E8F0EA] rounded-lg text-[#5C5C5C] shadow-sm flex items-center gap-1.5 font-medium hover:border-[#8BAA91]/40 hover:bg-[#F5F9F6] transition-colors text-left">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#388E3C]"></span>
                            {reqSub.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* What does this unlock? */}
                {(() => {
                  const unlocksRegular = career.curriculum.filter(s => s.regulares?.includes(selectedSubject.id));
                  const unlocksAprobada = career.curriculum.filter(s => s.aprobadas?.includes(selectedSubject.id));
                  const unlocksRendir = career.curriculum.filter(s => s.rendir?.includes(selectedSubject.id));
                  
                  const hasUnlocks = unlocksRegular.length > 0 || unlocksAprobada.length > 0 || unlocksRendir.length > 0;
                  
                  if (!hasUnlocks) return null;
                  
                  return (
                    <div className="pt-4 border-t border-[#F5F0EA] mt-4">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#A0A0A0] mb-3 flex items-center gap-1.5">
                        <Unlock className="w-3.5 h-3.5" /> Habilita para
                      </h4>
                      
                      <div className="space-y-3">
                        {unlocksRegular.length > 0 && (
                          <div>
                            <span className="text-[10px] text-[#A0A0A0] font-bold uppercase mb-1.5 block">Cursar (si la regularizás)</span>
                            <div className="flex flex-wrap gap-1.5">
                              {unlocksRegular.map(u => (
                                <button key={u.id} onClick={() => { const sub = career.curriculum.find(s => s.id === u.id); if (sub) setSelectedSubject(sub); }} className="text-[11px] px-2 py-1 bg-[#F5F0EA]/50 rounded text-[#7A6E62] hover:bg-[#E8F0EA] hover:text-[#3D3229] transition-colors text-left">
                                  {u.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {unlocksAprobada.length > 0 && (
                          <div>
                            <span className="text-[10px] text-[#A0A0A0] font-bold uppercase mb-1.5 block">Cursar (si la aprobás)</span>
                            <div className="flex flex-wrap gap-1.5">
                              {unlocksAprobada.map(u => (
                                <button key={u.id} onClick={() => { const sub = career.curriculum.find(s => s.id === u.id); if (sub) setSelectedSubject(sub); }} className="text-[11px] px-2 py-1 bg-[#F5F0EA]/50 rounded text-[#7A6E62] hover:bg-[#E8F0EA] hover:text-[#3D3229] transition-colors text-left">
                                  {u.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {unlocksRendir.length > 0 && (
                          <div>
                            <span className="text-[10px] text-[#A0A0A0] font-bold uppercase mb-1.5 block">Rendir Final de</span>
                            <div className="flex flex-wrap gap-1.5">
                              {unlocksRendir.map(u => (
                                <button key={u.id} onClick={() => { const sub = career.curriculum.find(s => s.id === u.id); if (sub) setSelectedSubject(sub); }} className="text-[11px] px-2 py-1 bg-[#F5F0EA]/50 rounded text-[#7A6E62] hover:bg-[#E8F0EA] hover:text-[#3D3229] transition-colors text-left">
                                  {u.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {!selectedSubject.regulares?.length && !selectedSubject.aprobadas?.length && !selectedSubject.rendir?.length ? (
                  <p className="text-sm text-[#A0A0A0] italic">No requiere materias previas.</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      , document.body)}

      {/* Sidebar Inspector Desktop */}
      <div className={`
        hidden lg:flex flex-col border-l border-[#E8F0EA] bg-[#FAFAFA] transition-all duration-300 ease-in-out relative z-20 overflow-hidden
        ${selectedSubject ? 'w-[380px] opacity-100' : 'w-0 opacity-0 border-none'}
      `}>
        <div className="w-[380px] h-full flex flex-col">
        {selectedSubject && (
          <>
            <div className="p-6 border-b border-[#E8F0EA] bg-white flex items-start justify-between">
              <div className="pr-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-[10px] font-mono font-medium text-[#A0A0A0] bg-[#F5F5F5] px-2 py-1 rounded-md">Cod. {selectedSubject.id.toString().padStart(3, '0')}</span>
                  {selectedSubject.semester && selectedSubject.semester !== 'Electiva' ? (
                    <span className="text-[10px] font-bold text-[#8BAA91] bg-[#F5F9F6] px-2 py-1 rounded-md">{selectedSubject.semester}</span>
                  ) : null}
                  {selectedSubject.isElectiva ? (
                    <span className="text-[10px] font-bold text-[#A0A0A0] bg-[#F5F5F5] px-2 py-1 rounded-md">Electiva</span>
                  ) : null}
                </div>
                <h2 className="text-xl font-bold leading-tight text-[#1A1A1A]">{selectedSubject.name}</h2>
                {globalRatings[selectedSubject.id] && (
                  <div className="mt-2 flex items-center gap-2 text-[11px] font-medium text-[#7A6E62]">
                    <div className="flex items-center gap-1 text-[#D4856A]">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      {globalRatings[selectedSubject.id].diffAvg.toFixed(1)}
                    </div>
                    <span className="w-1 h-1 rounded-full bg-[#E8F0EA]" />
                    <div className="flex items-center gap-1 text-[#8BAA91]">
                      <Sparkles className="w-3.5 h-3.5" />
                      {globalRatings[selectedSubject.id].utilAvg.toFixed(1)}
                    </div>
                    <span className="w-1 h-1 rounded-full bg-[#E8F0EA]" />
                    <span className="bg-[#F5F9F6] px-2 py-0.5 rounded-full border border-[#8BAA91]/20">
                      {globalRatings[selectedSubject.id].count === 1 
                        ? 'Calificada por 1 alumno' 
                        : `Calificada por ${globalRatings[selectedSubject.id].count} alumnos`}
                    </span>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setSelectedSubject(null)}
                className="p-2 hover:bg-[#F5F0EA] rounded-full text-[#A0A0A0] transition-colors shrink-0 -mr-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-8" key={selectedSubject.id}>
              
              <div className="grid grid-cols-2 gap-4">
                {selectedSubject.weekly_hours ? (
                  <div className="bg-white p-3 rounded-xl border border-[#E8F0EA] shadow-sm">
                    <h4 className="text-[9px] font-bold uppercase tracking-wider text-[#A0A0A0] mb-1">Horas Semanales</h4>
                    <p className="text-lg font-bold text-[#3D3229]">{selectedSubject.weekly_hours} <span className="text-sm font-medium text-[#7A6E62]">hs</span></p>
                  </div>
                ) : null}
                {selectedSubject.total_hours ? (
                  <div className="bg-white p-3 rounded-xl border border-[#E8F0EA] shadow-sm">
                    <h4 className="text-[9px] font-bold uppercase tracking-wider text-[#A0A0A0] mb-1">Horas Totales</h4>
                    <p className="text-lg font-bold text-[#3D3229]">{selectedSubject.total_hours} <span className="text-sm font-medium text-[#7A6E62]">hs</span></p>
                  </div>
                ) : null}
              </div>
              
              {(selectedSubject.docente || selectedSubject.horario) && (
                <div className="space-y-3">
                  {selectedSubject.docente && (
                    <div className="bg-white p-3.5 rounded-xl border border-[#E8F0EA] shadow-sm">
                      <h4 className="text-[9px] font-bold uppercase tracking-wider text-[#A0A0A0] mb-1">Cátedra / Docente Titular</h4>
                      <p className="text-sm font-bold text-[#3D3229]">{selectedSubject.docente}</p>
                    </div>
                  )}
                  {selectedSubject.horario && (
                    <div className="bg-white p-3.5 rounded-xl border border-[#E8F0EA] shadow-sm">
                      <h4 className="text-[9px] font-bold uppercase tracking-wider text-[#A0A0A0] mb-1">Régimen y Horarios Disponibles</h4>
                      <p className="text-sm text-[#5C5C5C] leading-relaxed">{selectedSubject.horario}</p>
                    </div>
                  )}
                </div>
              )}

              <InteractiveProgressButtons 
                subject={selectedSubject} 
                userProgress={userProgress} 
                onToggle={handleToggleState} 
                user={user}
                setShowLoginPrompt={setShowLoginPrompt}
              />

              {selectedSubject.note && (
                <div className="bg-[#FFF9F2] p-4 rounded-xl border border-[#D4856A]/20 shadow-sm">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-[#D4856A] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#D4856A] mb-1">Requisito Especial</h4>
                      <p className="text-sm text-[#3D3229]/80 leading-relaxed font-medium">
                        {selectedSubject.note}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#A0A0A0] pb-3 border-b border-[#E8F0EA] mb-4">Condiciones Habilitantes</h3>
                <div className="space-y-5">
                  {selectedSubject.regulares && selectedSubject.regulares.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8BAA91] mb-2 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" /> Para Cursar (Regularizar)
                      </h4>
                      <div className="flex flex-col gap-2">
                        {selectedSubject.regulares.map(reqId => {
                          const reqSub = career.curriculum.find(s => s.id === reqId);
                          return reqSub && (
                            <button key={reqId} onClick={() => setSelectedSubject(reqSub)} className="text-xs px-3 py-2 bg-white border border-[#E8F0EA] rounded-xl text-[#5C5C5C] shadow-sm flex items-center gap-2 font-medium hover:border-[#8BAA91]/40 hover:bg-[#F5F9F6] transition-colors text-left">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#E65100]"></span>
                              {reqSub.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedSubject.aprobadas && selectedSubject.aprobadas.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8BAA91] mb-2 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" /> Para Cursar (Aprobar)
                      </h4>
                      <div className="flex flex-col gap-2">
                        {selectedSubject.aprobadas.map(reqId => {
                          const reqSub = career.curriculum.find(s => s.id === reqId);
                          return reqSub && (
                            <button key={reqId} onClick={() => setSelectedSubject(reqSub)} className="text-xs px-3 py-2 bg-white border border-[#E8F0EA] rounded-xl text-[#5C5C5C] shadow-sm flex items-center gap-2 font-medium hover:border-[#8BAA91]/40 hover:bg-[#F5F9F6] transition-colors text-left">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#388E3C]"></span>
                              {reqSub.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedSubject.rendir && selectedSubject.rendir.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8BAA91] mb-2 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" /> Para Rendir Final (Aprobar)
                      </h4>
                      <div className="flex flex-col gap-2">
                        {selectedSubject.rendir.map(reqId => {
                          const reqSub = career.curriculum.find(s => s.id === reqId);
                          return reqSub && (
                            <button key={reqId} onClick={() => setSelectedSubject(reqSub)} className="text-xs px-3 py-2 bg-white border border-[#E8F0EA] rounded-xl text-[#5C5C5C] shadow-sm flex items-center gap-2 font-medium hover:border-[#8BAA91]/40 hover:bg-[#F5F9F6] transition-colors text-left">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#388E3C]"></span>
                              {reqSub.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* What does this unlock? */}
                  {(() => {
                    const unlocksRegular = career.curriculum.filter(s => s.regulares?.includes(selectedSubject.id));
                    const unlocksAprobada = career.curriculum.filter(s => s.aprobadas?.includes(selectedSubject.id));
                    const unlocksRendir = career.curriculum.filter(s => s.rendir?.includes(selectedSubject.id));
                    
                    const hasUnlocks = unlocksRegular.length > 0 || unlocksAprobada.length > 0 || unlocksRendir.length > 0;
                    
                    if (!hasUnlocks) return null;
                    
                    return (
                      <div className="pt-5 border-t border-[#E8F0EA] mt-6">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#A0A0A0] mb-3 flex items-center gap-1.5">
                          <Unlock className="w-3.5 h-3.5" /> Habilita para
                        </h4>
                        <div className="space-y-4">
                          {unlocksRegular.length > 0 ? (
                            <div>
                              <span className="text-[10px] text-[#A0A0A0] font-bold uppercase mb-2 block">Cursar (si la regularizás)</span>
                              <div className="flex flex-col gap-1.5">
                                {unlocksRegular.map(u => (
                                  <button key={u.id} onClick={() => { const sub = career.curriculum.find(s => s.id === u.id); if (sub) setSelectedSubject(sub); }} className="text-xs px-2.5 py-1.5 bg-[#F5F0EA]/50 rounded-lg text-[#7A6E62] flex items-center gap-2 hover:bg-[#E8F0EA] hover:text-[#3D3229] transition-colors text-left w-full">
                                    <span className="w-1 h-1 rounded-full bg-[#8BAA91]"></span>
                                    {u.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : null}
                          
                          {unlocksAprobada.length > 0 ? (
                            <div>
                              <span className="text-[10px] text-[#A0A0A0] font-bold uppercase mb-2 block">Cursar (si la aprobás)</span>
                              <div className="flex flex-col gap-1.5">
                                {unlocksAprobada.map(u => (
                                  <button key={u.id} onClick={() => { const sub = career.curriculum.find(s => s.id === u.id); if (sub) setSelectedSubject(sub); }} className="text-xs px-2.5 py-1.5 bg-[#F5F0EA]/50 rounded-lg text-[#7A6E62] flex items-center gap-2 hover:bg-[#E8F0EA] hover:text-[#3D3229] transition-colors text-left w-full">
                                    <span className="w-1 h-1 rounded-full bg-[#8BAA91]"></span>
                                    {u.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : null}
                          
                          {unlocksRendir.length > 0 ? (
                            <div>
                              <span className="text-[10px] text-[#A0A0A0] font-bold uppercase mb-2 block">Rendir Final de</span>
                              <div className="flex flex-col gap-1.5">
                                {unlocksRendir.map(u => (
                                  <button key={u.id} onClick={() => { const sub = career.curriculum.find(s => s.id === u.id); if (sub) setSelectedSubject(sub); }} className="text-xs px-2.5 py-1.5 bg-[#F5F0EA]/50 rounded-lg text-[#7A6E62] flex items-center gap-2 hover:bg-[#E8F0EA] hover:text-[#3D3229] transition-colors text-left w-full">
                                    <span className="w-1 h-1 rounded-full bg-[#8BAA91]"></span>
                                    {u.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })()}

                  {!selectedSubject.regulares?.length && !selectedSubject.aprobadas?.length && !selectedSubject.rendir?.length ? (
                    <p className="text-sm text-[#A0A0A0] italic bg-white p-3 rounded-xl border border-dashed border-[#E8F0EA]">Esta materia no requiere correlativas previas para ser cursada.</p>
                  ) : null}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>

    </div>
  );
}
