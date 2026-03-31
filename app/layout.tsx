import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { InteractiveBackground } from "@/components/InteractiveBackground";
import { Preloader } from "@/components/Preloader";
import { AnnouncementModal } from "@/components/AnnouncementModal";
import { ImagePopupModal } from "@/components/ImagePopupModal";
import { MetricsTracker } from "@/components/MetricsTracker";
import Script from "next/script";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FFFBF7",
};

export const metadata: Metadata = {
  title: "UTNHub",
  description: "Repositorio colaborativo de apuntes universitarios",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

// Anti-devtools protection script (only active in production)
const securityScript = `
(function() {
  var isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  if (!isProd) return;

  // 1. Silenciar consola
  var noop = function() {};
  var methods = ['log', 'debug', 'info', 'warn', 'error', 'table', 'dir'];
  methods.forEach(function(m) { console[m] = noop; });

  // 2. Bloqueo de teclado e inspección
  document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || (e.ctrlKey && e.key === 'u')) {
      e.preventDefault();
      return false;
    }
  });
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="antialiased" suppressHydrationWarning>
      <head>
        <script id="security" dangerouslySetInnerHTML={{ __html: securityScript }} />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FFFBF7] text-[#3D3229] w-full m-0 p-0 relative">
        <MetricsTracker />
        <Preloader />
        <AnnouncementModal />
        <ImagePopupModal />
        <ToastProvider>
          <AuthProvider>
            <InteractiveBackground />
            <Header />
            <main className="relative z-10 flex-1 flex flex-col w-full overflow-x-clip">{children}</main>
            
            <footer className="relative z-10 py-8 border-t border-[#EDE6DD] mt-auto text-center overflow-hidden bg-white/30 backdrop-blur-sm w-full">
              <div className="relative z-10 max-w-xl mx-auto px-4">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <p className="text-xs font-bold text-[#A89F95]">
                    Hecho por <a href="https://alfadigital.pages.dev/" target="_blank" rel="noopener noreferrer" className="text-[#8BAA91] hover:underline underline-offset-4">Alfa digital</a>
                  </p>
                  <div className="w-1 h-1 rounded-full bg-[#EDE6DD]" />
                  <a 
                    href="https://github.com/facurodriguez06/ApuntesUtn.git" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#A89F95] hover:text-[#3D3229] transition-all transform hover:scale-110"
                    aria-label="GitHub Repository"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                      <path d="M9 18c-4.51 2-5-2-7-2" />
                    </svg>
                  </a>
                </div>
                
                <p className="text-[11px] font-medium text-[#C5C0B8]">
                  ¿Encontraste un error? ¿Tenés una idea?{" "}
                  <a 
                    href="https://wa.me/5492614994711?text=Buenas,%20encontre%20un%20fallo%20en%20la%20pagina" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#8BAA91] font-bold hover:underline cursor-pointer transition-colors"
                  >
                    Contanos vía WhatsApp
                  </a>
                </p>
              </div>
            </footer>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
