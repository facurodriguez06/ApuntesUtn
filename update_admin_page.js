const fs = require("fs");
let code = fs.readFileSync("app/admin/page.tsx", "utf-8");

// 1. Add imports for new features
if (!code.includes("EditNoteModal")) {
  code = code.replace(
    /import \{ useAuth \} from "@\/context\/AuthContext";/g,
    `import { useAuth } from "@/context/AuthContext";\nimport { EditNoteModal } from "@/components/EditNoteModal";\nimport { Edit, Megaphone } from "lucide-react";`
  );
}

// 2. Add state variables for Editing and Announcements
if (!code.includes("const [editingNote,")) {
  code = code.replace(
    /const \[adminError, setAdminError\] = useState\(""\);/g,
    `const [adminError, setAdminError] = useState("");\n\n  const [editingNote, setEditingNote] = useState<Note | null>(null);\n  const [isAnnouncementActive, setIsAnnouncementActive] = useState(false);\n  const [announcementTitle, setAnnouncementTitle] = useState("");\n  const [announcementMessage, setAnnouncementMessage] = useState("");`
  );
}

// 3. Update unsubscribeSettings to read announcement data
if (!code.includes("setIsAnnouncementActive(")) {
  code = code.replace(
    /setIsDonationPopupActive\(docSnap\.data\(\)\.isDonationPopupActive \?\? true\);/g,
    `setIsDonationPopupActive(docSnap.data().isDonationPopupActive ?? true);\n            setIsAnnouncementActive(docSnap.data().isAnnouncementActive ?? false);\n            setAnnouncementTitle(docSnap.data().announcementTitle ?? "");\n            setAnnouncementMessage(docSnap.data().announcementMessage ?? "");\n`
  );
}

// 4. Add handleEditSave and saveAnnouncementSettings
if (!code.includes("const handleEditNoteSave = async")) {
  code = code.replace(
    /const handleDelete = async \(id: string\) => \{/g,
    `const handleEditNoteSave = async (updatedFields: Partial<Note>) => {\n    if (!editingNote) return;\n    try {\n      const { updateDoc, doc } = await import("firebase/firestore");\n      await updateDoc(doc(db, "notes", editingNote.id), updatedFields);\n      showToast("Apunte editado correctamente.", "success");\n    } catch (error) {\n      console.error(error);\n      showToast("Error al editar apunte.", "error");\n    }\n  };\n\n  const saveAnnouncementSettings = async () => {\n    setIsUpdatingSettings(true);\n    try {\n      const { setDoc, doc } = await import("firebase/firestore");\n      await setDoc(doc(db, "settings", "global"), {\n        isAnnouncementActive,\n        announcementTitle,\n        announcementMessage,\n      }, { merge: true });\n      showToast("Ajustes de anuncio guardados.", "success");\n    } catch (err) {\n      console.error(err);\n      showToast("Error al guardar anuncio.", "error");\n    } finally {\n      setIsUpdatingSettings(false);\n    }\n  };\n\n  const handleDelete = async (id: string) => {`
  );
}

// 5. Replace flat Aprobados map with Grouped Aprobados
const groupedHtml = `
              <div className="flex flex-col gap-8">
                {Object.entries(
                  approvedNotes.reduce((acc, note) => {
                    const subjectName = subjectsData.find(s => s.id === note.subjectId)?.name || note.subjectId || "General";
                    if (!acc[subjectName]) acc[subjectName] = [];
                    acc[subjectName].push(note);
                    return acc;
                  }, {} as Record<string, Note[]>)
                ).sort((a, b) => a[0].localeCompare(b[0])).map(([subject, notes]) => (
                  <div key={subject} className="space-y-4">
                    <h3 className="text-lg font-bold text-[#4A433C] border-b border-[#EDE6DD] pb-2">
                       {subject} <span className="text-[#A89F95] text-sm font-normal">({notes.length} apuntes)</span>
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {notes.map((note) => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          actions={
                            <>
                              <button
                                onClick={() => handleOpenFile(note)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white border border-[#EDE6DD] hover:bg-[#F9F7F4] text-[#7A6E62] rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Ver archivo"
                                disabled={!note.fileUrl}
                              >
                                <ExternalLink className="w-4 h-4" />
                                <span className="text-xs">Ver</span>
                              </button>
                              <button
                                onClick={() => setEditingNote(note)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white border border-[#EDE6DD] hover:bg-[#F9F7F4] text-[#8BAA91] rounded-xl font-medium transition-all duration-200"
                                title="Editar apunte"
                              >
                                <Edit className="w-4 h-4" />
                                <span className="text-xs">Editar</span>
                              </button>
                              <button
                                onClick={() => handleDelete(note.id)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#FFF0F0] hover:bg-[#FFE5E5] text-[#D84545] border border-[#FFDCDC] rounded-xl font-semibold transition-all duration-200"
                                title="Eliminar apunte aprobado"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-xs">Eliminar</span>
                              </button>
                            </>
                          }
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>`;

if (!code.includes("Object.entries(")) { // crude check to see if we already did it
  // We need to replace the old flat map. Looking back at grep results, it looks like:
  const mapRegex = /<div className="grid grid-cols-1 gap-4">\s*\{approvedNotes\.map\(\(note\) => \([\s\S]*?\}\s*<\/div>/;
  code = code.replace(mapRegex, groupedHtml);
}

// 6. Add Announcement Config UI under Donation settings
const announcementUi = `
          {/* Anuncio Global */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#EDE6DD]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-[#F5EFE5] text-[#8B7355] rounded-xl flex items-center justify-center border border-[#E2D6C2]">
                <Megaphone className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-[#2C2825]">Anuncio Global</h2>
                <p className="text-[#7A6E62] text-sm">Gestioná una alerta flotante o notificación general.</p>
              </div>
              <button
                onClick={() => setIsAnnouncementActive(!isAnnouncementActive)}
                disabled={isUpdatingSettings}
                className={\`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none \${isAnnouncementActive ? "bg-[#8BAA91]" : "bg-[#D5CAC0]"} disabled:opacity-50\`}
              >
                <span className={\`inline-block h-5 w-5 transform rounded-full bg-white transition-transform \${isAnnouncementActive ? "translate-x-6" : "translate-x-1"}\`} />
              </button>
            </div>
            
            <div className="space-y-4">
               <div>
                  <label className="text-sm font-semibold text-[#4A433C]">Título del anuncio</label>
                  <input type="text" value={announcementTitle} onChange={e => setAnnouncementTitle(e.target.value)} placeholder="Ej. ¡Estamos buscando apuntes!" className="w-full mt-1.5 rounded-xl border border-[#EDE6DD] px-3.5 py-2.5 text-sm focus:border-[#8BAA91] focus:ring-2 focus:ring-[#8BAA91]/20 outline-none transition-all" />
               </div>
               <div>
                  <label className="text-sm font-semibold text-[#4A433C]">Texto (Mensaje)</label>
                  <input type="text" value={announcementMessage} onChange={e => setAnnouncementMessage(e.target.value)} placeholder="Agrega más detalles..." className="w-full mt-1.5 rounded-xl border border-[#EDE6DD] px-3.5 py-2.5 text-sm focus:border-[#8BAA91] focus:ring-2 focus:ring-[#8BAA91]/20 outline-none transition-all" />
               </div>
               <div className="flex justify-end pt-2">
                 <button onClick={saveAnnouncementSettings} disabled={isUpdatingSettings} className="px-5 py-2 bg-[#8BAA91] hover:bg-[#7A9980] text-white text-sm font-bold rounded-xl transition-all shadow-sm">
                   Guardar Anuncio
                 </button>
               </div>
            </div>
          </div>
`;

if (!code.includes("Anuncio Global")) {
  code = code.replace(
    /<\/section>\s*<section className="space-y-6">/g,
    `</section>\n\n        ${announcementUi}\n\n        <section className="space-y-6">`
  );
}

// 7. Inject <EditNoteModal /> before the last </div> exactly at the bottom of AdminPage return.
if (!code.includes("<EditNoteModal")) {
  code = code.replace(
    /<\/div>\s*<\/div>\s*\);\s*\}\s*$/g,
    `      <EditNoteModal\n        isOpen={!!editingNote}\n        onClose={() => setEditingNote(null)}\n        note={editingNote}\n        onSave={handleEditNoteSave}\n      />\n    </div>\n    </div>\n  );\n}\n`
  );
}

fs.writeFileSync("app/admin/page.tsx", code);
console.log("Updated app/admin/page.tsx successfully.");

