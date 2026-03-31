const fs = require('fs');
let code = fs.readFileSync('app/admin/page.tsx', 'utf8');

const uiInjection = `
      {/* Sistema de Anuncios o Popup Imagen */}
      <section className="mb-10 animate-fade-in-up">
        <div className="bg-white rounded-[2.5rem] border border-[#EDE6DD] p-6 md:p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
            <div className="max-w-xl">
              <h2 className="text-xl font-black text-[#3D3229] mb-2 flex items-center gap-2">
                <span className="p-2 rounded-lg bg-[#F5EFE5] text-[#8B7355]">
                  <Megaphone className="w-5 h-5" />
                </span>
                Popup de Imagen Promocional
              </h2>
              <p className="text-[#7A6E62] text-sm leading-relaxed">
                Mostrá una imagen emergente. El usuario solo lo verá 1 vez por imagen.
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-[#F9F7F4] p-4 rounded-2xl border border-[#EDE6DD]">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#3D3229]">Estado</span>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-wider",
                  isImagePopupActive ? "text-[#4A7A52]" : "text-[#D84545]"
                )}>
                  {isImagePopupActive ? "Activo" : "Inactivo"}
                </span>
              </div>
              
              <button
                onClick={() => setIsImagePopupActive(!isImagePopupActive)}
                disabled={isUpdatingSettings}}
                className={cn(
                  "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8BAA91] disabled:opacity-50",
                  isImagePopupActive ? "bg-[#8BAA91]" : "bg-[#D5CAC0]"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-300",
                    isImagePopupActive ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>
          </div>

          {isImagePopupActive && (
            <div className="flex flex-col gap-4 bg-[#F9F7F4] p-5 rounded-2xl border border-[#EDE6DD] animate-fade-in-up">
              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-[#4A433C]">Imagen del Anuncio</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#D5CAC0m border-dashed rounded-xl cursor-pointer bg-[#F5EFE5] hover:bg-[#EAE4D9] transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {isUploadingImage ? (
                        <Loader2 className="w-6 h-6 mb-2 text-[#8BAA91] animate-spin" />
                      ) : (
                        <p className="mb-2 text-sm text-[#7A6E62]">Click para subir</p>
                      )}
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} />
                  </label>
                </div>
                {imagePopupUrl && (
                  <div className="mt-2 p-2 bg-white rounded-lg border border-[#EDE6DD]">
                    <img src={imagePopupUrl} alt="Preview" className="max-h-48 mx-auto rounded-md object-contain" />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#4A433C]">Link (Opcional)</label>
                <input
                  type="url"
                  value={imagePopupLink}
                  onChange={(e) => setImagePopupLink(e.target.value)}
                  className="w-full bg-white border border-[#D5CAC0] rounded-xl p-4 py-2.5 text-[#3D3229] focus:outline-none focus:ring-2 focus:ring-[#8BAA91]"
                />
              </div>

              <button
                onClick={saveImagePopupSettings}
                disabled={isUpdatingSettings}
                className="mt-2 w-full sm:w-auto py-2.5 p-6 rounded-xl bg-[#4A433C] text-white font-bold hover:bg-[#2C2825] transition-colors disabled:opacity-50 self-end"
              >
                {isUpdatingSettings ? <Loader2 className="w-5 h-5 animate-spin" /> : "Guardar Configuración"}
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="mb-8">
`;

code = code.replace('<section className="mb-8">', uiInjection);
fs.writeFileSync('app/admin/page.tsx', code);
