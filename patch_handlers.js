const fs = require('fs');

let code = fs.readFileSync('app/admin/page.tsx', 'utf8');

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

  const handleDelete = async (id: string) => {`;

code = code.replace(
  '  const handleDelete = async (id: string) => {',
  insertHandler
);

fs.writeFileSync('app/admin/page.tsx', code);