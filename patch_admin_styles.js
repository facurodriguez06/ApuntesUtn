const fs = require('fs');

let code = fs.readFileSync('app/admin/page.tsx', 'utf8');

// 1. Add STATE
const stateInjection = `  const [announcementMessage, setAnnouncementMessage] = useState("");

  const [authorStyles, setAuthorStyles] = useState<Record<string, {color: string, label: string}>>({});
  const [newAuthorName, setNewAuthorName] = useState("");
  const [newAuthorColor, setNewAuthorColor] = useState("#4A7A52");
  const [newAuthorLabel, setNewAuthorLabel] = useState("Amigo");`;

code = code.replace(
  '  const [announcementMessage, setAnnouncementMessage] = useState("");',
  stateInjection
);

// 2. Add to snapshot
code = code.replace(
  'setImagePopupLink(docSnap.data().imagePopupLink ?? "");',
  'setImagePopupLink(docSnap.data().imagePopupLink ?? "");\n          setAuthorStyles(docSnap.data().authorStyles || {});'
);

// 3. Add Handler
const handlerLogic = `  const handleSaveAnnouncement = async (e: React.FormEvent) => {`;
const insertHandler = `
  const handleSaveAuthorStyle = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newAuthorName.trim()) return;
    try {
      const normalizedName = newAuthorName
        .normalize("NFD").replace(/[\\u0300-\\u036f]/g, "")
        .replace(/\\s+/g, " ").trim().toLowerCase();
      
      await updateDoc(doc(db, "settings", "global"), {
        [\`authorStyles.\${normalizedName}\`]: {
          color: newAuthorColor,
          label: newAuthorLabel
        }
      });
      setNewAuthorName("");
      setNewAuthorLabel("Amigo");
      showToast("Estilo asignado con éxito.", "success");
    } catch(err) { console.error(err); showToast("Error al guardar.", "error"); }
  };

  const handleDeleteAuthorStyle = async (key: string) => {
    try {
      const { deleteField } = await import("firebase/firestore");
      await updateDoc(doc(db, "settings", "global"), {
        [\`authorStyles.\${key}\`]: deleteField()
      });
      showToast("Estilo eliminado.", "success");
    } catch(err) { console.error(err); showToast("Error.", "error"); }
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {`;

code = code.replace(handlerLogic, insertHandler);

// 4. Add UI section before Popup
const uiInjectionPoint = `      {/* Sistema de Anuncios o Popup Imagen */}`;
const uiHtml = `
      {/* Estilos para autores / Destacados */}
      <section className="mb-10 animate-fade-in-up">
        <div className="bg-white rounded-[2.5rem] border border-[#EDE6DD] p-6 md:p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
            <div className="max-w-xl">
              <h2 className="text-xl font-black text-[#3D3229] mb-2 flex items-center gap-2">
                <span className="p-2 rounded-lg bg-[#E8F0EA] text-[#4A7A52]">
                  <Crown className="w-5 h-5" />
                </span>
                Personalizar Apuntes de Usuarios
              </h2>
              <p className="text-[#7A6E62] text-sm leading-relaxed">
                Asigná un color especial y una etiqueta (ej: "Amigo", "VIP") a los apuntes subidos por alguien específico. Escribí el nombre exacto con el que subió el archivo.
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSaveAuthorStyle} className="flex flex-col sm:flex-row gap-4 mb-6">
            <input 
              type="text" 
              placeholder="Nombre del Autor (ej: Juan Perez)" 
              value={newAuthorName} 
              onChange={(e) => setNewAuthorName(e.target.value)} 
              required
              className="flex-1 px-4 py-2.5 bg-white border border-[#E5DCD3] focus:border-[#4A7A52] rounded-xl outline-none"
            />
            <input 
              type="text" 
              placeholder="Etiqueta (ej: Amigo)" 
              value={newAuthorLabel} 
              onChange={(e) => setNewAuthorLabel(e.target.value)} 
              required
              className="w-full sm:w-1/4 px-4 py-2.5 bg-white border border-[#E5DCD3] focus:border-[#4A7A52] rounded-xl outline-none"
            />
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={newAuthorColor} 
                onChange={(e) => setNewAuthorColor(e.target.value)} 
                className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent p-0"
              />
              <button
                type="submit"
                className="bg-[#4A7A52] hover:bg-[#3d6644] px-6 py-2.5 text-white font-medium rounded-xl transition-all shadow-sm h-[46px]"
              >
                Agregar
              </button>
            </div>
          </form>

          {Object.keys(authorStyles).length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 border-t border-[#EDE6DD] pt-6">
              {Object.entries(authorStyles).map(([key, style]) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-xl border border-[#EDE6DD] bg-[#F9F7F4]">
                  <div className="flex flex-col">
                    <span className="font-bold text-[#3D3229] capitalize">{key}</span>
                    <span 
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 w-max text-white"
                      style={{ backgroundColor: style.color }}
                    >
                      {style.label}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDeleteAuthorStyle(key)}
                    className="p-2 text-[#D84545] hover:bg-[#FFE5E5] rounded-lg transition-colors"
                    title="Remover estilo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sistema de Anuncios o Popup Imagen */}`;

code = code.replace(uiInjectionPoint, uiHtml);

// 5. Add Icon Import
code = code.replace(
  'UserCheck,',
  'UserCheck,\n  Crown,'
);

fs.writeFileSync('app/admin/page.tsx', code);
