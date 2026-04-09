const fs = require('fs');

let c = fs.readFileSync('components/BulkDownloadButton.tsx', 'utf8');

const regex = /try {[\s\S]*catch \(err\) {[\s\S]*showToast\("Quiz[^\"]+", "error"\);[\s\S]*\} finally {[\s\S]*\}/;

const replaceWith = `try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      let hasFiles = false;

      for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        if (!note.fileUrl) continue;
        
        const originalUrl = resolveStorageUrl(note.fileUrl);
        const proxyUrl = \`/api/download?url=\${encodeURIComponent(originalUrl)}\`;
        
        // Asegurarse de la extensión correcta
        let filename = note.title ? note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : \`documento-\${i + 1}\`;
        const ext = note.fileType ? note.fileType.toLowerCase() : "pdf";
        if (!filename.endsWith(\`.\${ext}\`)) {
          filename += \`.\${ext}\`;
        }
        
        try {
          const response = await fetch(proxyUrl);
          if (!response.ok) throw new Error("Fetch failed");
          const blob = await response.blob();
          zip.file(filename, blob);
          hasFiles = true;
        } catch (fetchErr) {
          console.error("Error al obtener el archivo:", filename, fetchErr);
          // Si falla incluso con el proxy, abrimos en pestaña
          window.open(originalUrl, "_blank");
        }
      }

      if (!hasFiles) {
        showToast("Se abrieron los archivos de a uno por error de red.", "warning");
        setDownloaded(false);
        return;
      }

      showToast("Comprimiendo archivos (ZIP)...", "info");
      const content = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(content);
      a.download = \`Apuntes.zip\`;
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

c = c.replace(regex, replaceWith);
fs.writeFileSync('components/BulkDownloadButton.tsx', c);