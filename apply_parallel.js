const fs = require('fs');
let code = fs.readFileSync('components/BulkDownloadButton.tsx', 'utf8');

const regex = /try\s*\{\s*const JSZip = \(await import\("jszip"\)\)\.default;\s*const zip = new JSZip\(\);\s*let hasFiles = false;\s*for \(let i = 0; i < notes\.length; i\+\+\) \{[\s\S]*?\}\s*if \(\!hasFiles\) \{/;

const replace = `try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      let hasFiles = false;

      // Fetch all files in parallel
      const downloadPromises = notes.map(async (note, i) => {
        if (!note.fileUrl) return null;

        const originalUrl = resolveStorageUrl(note.fileUrl);
        const proxyUrl = \`/api/download?url=\${encodeURIComponent(originalUrl)}\`;

        let filename = note.title ? note.title.replace(/[\\\\/:*?"<>|]/g, '_') : \`documento-\${i + 1}\`;
        const ext = note.fileType ? note.fileType.toLowerCase() : "pdf";        
        if (!filename.toLowerCase().endsWith(\`.\${ext}\`)) {
          filename += \`.\${ext}\`;
        }

        try {
          const response = await fetch(proxyUrl);
          if (!response.ok) throw new Error("Fetch failed");
          const blob = await response.blob();
          return { filename, blob, originalUrl, success: true };
        } catch (fetchErr) {
          console.error("Error al obtener el archivo:", filename, fetchErr);    
          return { filename, blob: null, originalUrl, success: false };
        }
      });

      const results = await Promise.all(downloadPromises);

      for (const result of results) {
        if (!result) continue;
        
        if (result.success && result.blob) {
          zip.file(result.filename, result.blob);
          hasFiles = true;
        } else {
          window.open(result.originalUrl, "_blank");
        }
      }

      if (!hasFiles) {`;

code = code.replace(regex, replace);
fs.writeFileSync('components/BulkDownloadButton.tsx', code);
