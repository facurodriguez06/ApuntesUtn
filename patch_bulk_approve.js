const fs = require('fs');

let code = fs.readFileSync('app/admin/page.tsx', 'utf8');

// 1. Add STATE
const stateTarget = `const [selectedPendingNotes, setSelectedPendingNotes] = useState<string[]>([]);\n  const [bulkFolderInput, setBulkFolderInput] = useState("");`;
if(!code.includes('selectedPendingNotes')) {
  code = code.replace(
    `const [folderInputs, setFolderInputs] = useState<Record<string, string>>({});`,
    `const [folderInputs, setFolderInputs] = useState<Record<string, string>>({});\n  const [selectedPendingNotes, setSelectedPendingNotes] = useState<string[]>([]);\n  const [bulkFolderInput, setBulkFolderInput] = useState("");`
  );
}

// 2. Add handlers
const funcs = `
  const toggleNoteSelection = (id: string) => {
    setSelectedPendingNotes(prev => prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]);
  };

  const handleSelectAllPending = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedPendingNotes(pendingNotes.map(n => n.id));
    else setSelectedPendingNotes([]);
  };

  const handleApplyBulkFolder = () => {
    setFolderInputs(prev => {
      const next = { ...prev };
      selectedPendingNotes.forEach(id => {
        next[id] = bulkFolderInput;
      });
      return next;
    });
    showToast("Carpeta aplicada a los seleccionados", "info");
  };

  const handleBulkApprove = async () => {
    const toApprove = pendingNotes.filter(n => selectedPendingNotes.includes(n.id));
    if(toApprove.length === 0) return;
    setAdminError("");
    try {
      await Promise.all(toApprove.map(async (note) => {
        const folderName = normalizeFolderName(folderInputs[note.id] ?? "");
        await updateDoc(doc(db, "notes", note.id), {
          status: "approved",
          folderName: folderName || null,
        });
      }));
      setFolderInputs((current) => {
        const next = { ...current };
        toApprove.forEach(n => delete next[n.id]);
        return next;
      });
      setSelectedPendingNotes([]);
      setBulkFolderInput("");
      showToast(\`Se aprobaron \${toApprove.length} apuntes masivamente.\`, "success");
    } catch(err) {
      setAdminError("Error al aprobar apuntes masivamente.");
    }
  };
`;

if(!code.includes('handleBulkApprove')) {
  code = code.replace(
    `const handleEditNoteSave = async`,
    funcs + `\n  const handleEditNoteSave = async`
  );
}

// 3. UI Header for Bulk
const topUITarget = `          ) : (
            <div className="grid grid-cols-1 gap-4">`;
const topUIReplacement = `          ) : (
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
              <div className="grid grid-cols-1 gap-4">`;

if(!code.includes('handleApplyBulkFolder')) {
  code = code.replace(topUITarget, topUIReplacement);
}

// 4. Wrap NoteCard inside Map
const wrapTarget = `                return (
                  <NoteCard
                    key={note.id}`;
const wrapReplacement = `                return (
                  <div key={note.id} className="flex gap-3">
                    <div className="pt-6 pl-2 hidden sm:block">
                       <input 
                         type="checkbox" 
                         checked={selectedPendingNotes.includes(note.id)}
                         onChange={() => toggleNoteSelection(note.id)}
                         className="w-5 h-5 cursor-pointer accent-[#4A7A52] rounded"
                         title="Seleccionar apunte"
                       />
                    </div>
                    <div className="flex-1 min-w-0">
                  <NoteCard`;

const wrapEndTarget = `                      </>
                    }
                  />
                );
              })}
            </div>`;
const wrapEndReplacement = `                      </>
                    }
                  />
                    </div>
                  </div>
                );
              })}
              </div>
            </div>`;

if(code.includes(wrapTarget) && code.includes(wrapEndTarget)) {
  code = code.replace(wrapTarget, wrapReplacement);
  code = code.replace(wrapEndTarget, wrapEndReplacement);
}


fs.writeFileSync('app/admin/page.tsx', code);
console.log("Bulk UI applied.");