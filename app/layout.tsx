import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { InteractiveBackground } from "@/components/InteractiveBackground";
import Script from "next/script";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "ApuntesUTN — Repositorio de apuntes",
  description: "Repositorio colaborativo de apuntes universitarios de la UTN",
};

// Anti-devtools protection script (only active in production)
const securityScript = `
(function() {
  var isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  if (!isProd) return;

  // Disable right-click context menu
  document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
  
  // Detect DevTools via debugger timing
  setInterval(function() {
    var start = performance.now();
    debugger;
    var end = performance.now();
    if (end - start > 160) {
      document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#FFFBF7;color:#3D3229;text-align:center;padding:2rem"><div><h1 style="font-size:2rem;margin-bottom:1rem">Acceso no autorizado</h1><p style="color:#7A6E62">Por favor cerrá las herramientas de desarrollador para continuar usando ApuntesUTN.</p></div></div>';
    }
  }, 1000);
  
  // Disable common keyboard shortcuts for DevTools
  document.addEventListener('keydown', function(e) {
    if (e.key === 'F12') { e.preventDefault(); return false; }
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) { e.preventDefault(); return false; }
    if (e.ctrlKey && e.key === 'u') { e.preventDefault(); return false; }
  });
  
  // Override console methods
  var noop = function() { return undefined; };
  ['log', 'debug', 'info', 'warn', 'error', 'table', 'dir', 'trace'].forEach(function(method) {
    console[method] = noop;
  });
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#FFFBF7] text-[#3D3229]">
        <AuthProvider>
          <Script id="security" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: securityScript }} />
          <InteractiveBackground />
          <Header />
          <main className="relative z-10 flex-1 flex flex-col">{children}</main>
          
          <footer className="relative z-10 py-6 border-t border-[#EDE6DD] mt-auto text-center overflow-hidden">
            <div className="relative z-10">
              <p className="text-xs text-[#A89F95]">
                Hecho con dedicación por estudiantes de la UTN
              </p>
              <p className="text-[11px] text-[#C5C0B8] mt-1">
                ¿Encontraste un error? ¿Tenés una idea? <span className="underline cursor-pointer hover:text-[#8BAA91] transition-colors">Contanos</span>
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
