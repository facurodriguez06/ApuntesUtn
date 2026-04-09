const fs = require('fs');
let code = fs.readFileSync('components/BulkDownloadButton.tsx', 'utf8');
code += `
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className={\`relative overflow-hidden group font-medium rounded-xl transition-all w-full truncate border \${
        customHex 
          ? "text-[color:var(--dynamic-color)] border-[color:var(--dynamic-border)] bg-[color:var(--dynamic-bg)] hover:bg-[color:var(--dynamic-hover)]" 
          : "text-[var(--text-primary)] bg-[var(--bg-card)] border-[var(--border-color)] hover:bg-[var(--bg-card-hover)]"
      } \${
        compact 
          ? "px-3 py-1.5 text-xs shadow-sm" 
          : "px-4 py-2.5 sm:px-5 sm:py-3 text-sm sm:text-base shadow-sm hover:shadow-md"
      }\`}
      style={customHex ? {
        '--dynamic-color': customHex,
        '--dynamic-border': customHex + '40',
        '--dynamic-bg': customHex + '10',
        '--dynamic-hover': customHex + '20'
      } as React.CSSProperties : undefined}
      title={label}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-white/5 to-transparent" />
      <span className="relative z-10 flex items-center justify-center gap-2">
        <Download className={\`\${compact ? "w-3.5 h-3.5" : "w-4 h-4 sm:w-5 sm:h-5"} \${downloading ? "animate-bounce" : "group-hover:-translate-y-0.5 transition-transform duration-300"}\`} />
        <span className="truncate">{downloading ? "Descargando..." : label}</span>
      </span>
    </button>
  );
}
`;
fs.writeFileSync('components/BulkDownloadButton.tsx', code);
