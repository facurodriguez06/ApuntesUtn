const fs = require('fs');

let code = fs.readFileSync('app/admin/page.tsx', 'utf8');

// 1. Add state activeTab
const stateHookTarget = `const [announcementTitle, setAnnouncementTitle] = useState("");`;
const stateHookReplacement = `const [activeTab, setActiveTab] = useState("apuntes");\n  const [announcementTitle, setAnnouncementTitle] = useState("");`;
code = code.replace(stateHookTarget, stateHookReplacement);

// 2. Add Tabs navigation + 'sistema' wrapper
const target2 = `{/* Global Settings Section */}`;
const replacement2 = `{/* TABS NAVIGATION */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl border border-[#EDE6DD] shadow-sm">
        <button 
          onClick={() => setActiveTab('apuntes')} 
          className={cn("flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap", activeTab === 'apuntes' ? 'bg-[#4A7A52] text-white shadow-md' : 'text-[#7A6E62] hover:bg-[#F5F0EA]')}
        >
          Apuntes
        </button>
        <button 
          onClick={() => setActiveTab('autores')} 
          className={cn("flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap", activeTab === 'autores' ? 'bg-[#4A7A52] text-white shadow-md' : 'text-[#7A6E62] hover:bg-[#F5F0EA]')}
        >
          Autores
        </button>
        <button 
          onClick={() => setActiveTab('avisos')} 
          className={cn("flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap", activeTab === 'avisos' ? 'bg-[#4A7A52] text-white shadow-md' : 'text-[#7A6E62] hover:bg-[#F5F0EA]')}
        >
          Avisos
        </button>
        <button 
          onClick={() => setActiveTab('sistema')} 
          className={cn("flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap", activeTab === 'sistema' ? 'bg-[#4A7A52] text-white shadow-md' : 'text-[#7A6E62] hover:bg-[#F5F0EA]')}
        >
          Sistema
        </button>
      </div>

      {activeTab === 'sistema' && (
      <div className="animate-fade-in">
      {/* Global Settings Section */}`;
code = code.replace(target2, replacement2);

// 3. 'autores' wrapper
const target3 = `{/* Estilos para autores / Destacados */}`;
const replacement3 = `</div>
      )}

      {activeTab === 'autores' && (
      <div className="animate-fade-in">
      {/* Estilos para autores / Destacados */}`;
code = code.replace(target3, replacement3);

// 4. 'avisos' wrapper
const target4 = `{/* Sistema de Anuncios o Popup Imagen */}`;
const replacement4 = `</div>
      )}

      {activeTab === 'avisos' && (
      <div className="animate-fade-in">
      {/* Sistema de Anuncios o Popup Imagen */}`;
code = code.replace(target4, replacement4);

// 5. 'apuntes' wrapper
const target5 = `<section className="mb-8">

        <h2 className="text-xl font-bold text-[#4A433C] mb-4 ml-1 flex items-center gap-2">`;
const replacement5 = `</div>
      )}

      {activeTab === 'apuntes' && (
      <div className="animate-fade-in">
      <section className="mb-8">

        <h2 className="text-xl font-bold text-[#4A433C] mb-4 ml-1 flex items-center gap-2">`;
code = code.replace(target5, replacement5);


// 6. Close the last wrapper before Custom Confirmation Modal
const target6 = `              </div>
          )}
        </div>
      </section>

      {/* CUSTOM CONFIRMATION MODAL */}`;
const replacement6 = `              </div>
          )}
        </div>
      </section>
      </div>
      )}

      {/* CUSTOM CONFIRMATION MODAL */}`;
code = code.replace(target6, replacement6);

fs.writeFileSync('app/admin/page.tsx', code);
console.log("Tab patches applied successfully.");