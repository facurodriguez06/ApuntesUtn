const fs = require('fs');

let c = fs.readFileSync('components/BulkDownloadButton.tsx', 'utf8');

const search = `    try {
      for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        if (!note.fileUrl) continue;
        
        const url = resolveStorageUrl(note.fileUrl);
        const filename = note.title || \`documento-\${i + 1}\`;
        
        // Descargamos simulando click 
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        link.remove();

        // Pequeño delay de 500ms para evitar que el navegador se sobrecargue
        if (i < notes.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      showToast("Descargas iniciadas.", "success");
    } catch (err) {
      showToast("Quizás tu navegador bloqueó algunas descargas, permitilas arriba a la derecha.", "error");
    } finally {
      setTimeout(() => setDownloaded(false), 2000);
    }`;

const replace = `    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      let hasFiles = false;

      for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        if (!note.fileUrl) continue;
        
        const url = resolveStorageUrl(note.fileUrl);
        
        // Asegurar extensión del archivo
        let filename = note.title ? note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : \`documento-\${i + 1}\`;
        const ext = note.fileType ? note.fileType.toLowerCase() : "pdf";
        if (!filename.endsWith(\`.\${ext}\`)) {
          filename += \`.\${ext}\`;
        }
        
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error("Fetch failed");
          const blob = await response.blob();
          zip.file(filename, blob);
          hasFiles = true;
        } catch (fetchErr) {
          console.error("Error al obtener el archivo:", filename, fetchErr);
          // Si falla por CORS de Cloudinary/S3, abrimos en pestaña nueva como fallback para ese archivo
          window.open(url, "_blank");
        }
      }

      if (!hasFiles) {
        showToast("Se abrieron los archivos en pestañas (error CORS al comprimir).", "info");
        setDownloaded(false);
        return;
      }

      showToast("Comprimiendo archivos...", "info");
      const content = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(content);
      a.download = \`Apuntes_carpeta.zip\`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);

      showToast("¡Descarga completada!", "success");
    } catch (err) {
      showToast("Error crítico al generar el archivo ZIP.", "error");
    } finally {
      setTimeout(() => setDownloaded(false), 2000);
    }`;

c = c.replace(search, replace);
fs.writeFileSync('components/BulkDownloadButton.tsx', c);
