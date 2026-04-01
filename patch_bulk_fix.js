const fs = require('fs');

let code = fs.readFileSync('app/admin/page.tsx', 'utf8');

const regex = /          \) : \(\n            <div className="grid grid-cols-1 gap-4">\n              \{pendingNotes\.map\(\(note\) => \{/;

const replacement = `          ) : (
            <div className="flex flex-col">
              <div className="mb-4 p-4 bg-[#F9F7F4] border border-[#ede6dd] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedPendingNotes.length > 0 && selectedPendingNotes.length === pendingNotes.length}
                    onChange={handleSelectAllPending}
                    className="w-5 h-5 cursor-pointer accent-[#4A7A52] rounded"
                    title="Seleccionar todos"
                  />
                  <span className="text-sm font-bold text-[#4A433C]">
                    {selectedPendingNotes.length} seleccionados
                  </span>
                </div>
                
                {selectedPendingNotes.length > 0 && (
                  <div className="flex flex-1 w-full sm:w-auto items-center gap-2">
                    <input
                      type="text"
                      placeholder="Carpeta masiva..."
                      value={bulkFolderInput}
                      onChange={(e) => setBulkFolderInput(e.target.value)}
                      className="flex-1 min-w-[120px] max-w-[200px] border border-[#E5DCD3] rounded-xl px-3 py-2 text-sm focus:border-[#4A7A52] outline-none"
                    />
                    <button
                      onClick={handleApplyBulkFolder}
                      className="text-xs bg-white border border-[#EDE6DD] px-4 py-2.5 rounded-xl font-bold hover:bg-[#F5EFE5] transition-colors"
                    >
                      Aplicar a todos
                    </button>
                    <button
                      onClick={handleBulkApprove}
                      className="ml-auto text-xs bg-[#4A7A52] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#3A6040] shadow-sm transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Aprobar {selectedPendingNotes.length}
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4">
              {pendingNotes.map((note) => {`;

if (regex.test(code)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('app/admin/page.tsx', code);
    console.log("Fixed opening div tags successfully!");
} else {
    console.error("No match found for opening div tag fix. Maybe it's already there?");
}