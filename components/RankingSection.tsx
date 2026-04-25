"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Trophy, Medal, Star, ChevronRight } from "lucide-react";
import { RankingModal } from "./RankingModal";

type UploaderStat = {
  name: string;
  count: number;
};

export function RankingSection() {
  const [allUploaders, setAllUploaders] = useState<UploaderStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const notesQuery = query(collection(db, "notes"), where("status", "==", "approved"));

    const unsubscribe = onSnapshot(
      notesQuery,
      (snapshot) => {
        const counts: Record<string, number> = {};
        
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          let author = data.author as string | undefined;
          
          if (author) {
            author = author.trim();
            // Ignorar los que no tienen nombre o son "Anonimo"
            if (author.toLowerCase() !== "anonimo" && author.toLowerCase() !== "anónimo" && author !== "") {
              counts[author] = (counts[author] || 0) + 1;
            }
          }
        });

        const sorted: UploaderStat[] = Object.entries(counts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);

        setAllUploaders(sorted);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching notes for ranking:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  if (loading) return (
    <section className="mb-16 mt-8 animate-pulse">
      <div className="h-8 bg-[#E8F0EA] w-48 rounded mb-6"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-white border border-[#EDE6DD] rounded-2xl"></div>
        ))}
      </div>
    </section>
  );
  
  if (allUploaders.length === 0) return null;

  const topUploaders = allUploaders.slice(0, 5);

  return (
    <section className="mb-16 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#FFF8E6] p-2 rounded-xl border border-[#FDEBBA]">
            <Trophy className="w-6 h-6 text-[#F5B041]" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#3D3229]">Top Colaboradores</h2>
            <p className="text-sm text-[#7A6E62]">Los que más apuntes subieron</p>
          </div>
        </div>
        
        {allUploaders.length > 5 && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="group flex items-center gap-1 text-sm font-bold text-[#8BAA91] hover:text-[#4A7A52] transition-colors bg-[#E8F0EA] hover:bg-[#D6E5D8] px-4 py-2 rounded-xl active:scale-95"
          >
            Ver más <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topUploaders.map((uploader, index) => (
          <div 
            key={uploader.name} 
            className="group/rank flex items-center gap-4 bg-white p-4 rounded-2xl border border-[#EDE6DD] shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-md hover:border-[#8BAA91]/40 hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg transition-transform duration-300 group-hover/rank:scale-110 group-hover/rank:-rotate-3
              ${index === 0 ? 'bg-gradient-to-br from-[#FFF9E6] to-[#FFF0B3] text-[#D49A00] border border-[#FFE066] shadow-sm shadow-[#FFE066]/30' : 
                index === 1 ? 'bg-gradient-to-br from-[#F5F7FA] to-[#E4E7EB] text-[#788291] border border-[#D1D5DB] shadow-sm shadow-[#D1D5DB]/30' : 
                index === 2 ? 'bg-gradient-to-br from-[#FFF3E6] to-[#FFE0B3] text-[#B87A3D] border border-[#FFD199] shadow-sm shadow-[#FFD199]/30' : 
                'bg-[#E8F0EA] text-[#4A7A52] border border-[#C5DBC9]'}`}
            >
              #{index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[#3D3229] truncate group-hover/rank:text-[#4A7A52] transition-colors">{uploader.name}</h3>
              <p className="text-xs font-semibold text-[#8BAA91] bg-[#E8F0EA] inline-block px-2 py-0.5 rounded-md mt-1">
                {uploader.count} {uploader.count === 1 ? 'apunte' : 'apuntes'}
              </p>
            </div>
            <div className="opacity-0 group-hover/rank:opacity-100 transition-opacity duration-300">
              {index < 3 ? (
                <Medal className={`w-5 h-5 animate-pulse-slow
                  ${index === 0 ? 'text-[#F5B041]' : 
                    index === 1 ? 'text-[#A6ACAF]' : 
                    'text-[#E59866]'}`} 
                />
              ) : (
                <Star className="w-5 h-5 text-[#8BAA91]" />
              )}
            </div>
          </div>
        ))}
      </div>

      <RankingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        uploaders={allUploaders} 
      />
    </section>
  );
}
