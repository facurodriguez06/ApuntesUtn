import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { InteractiveBackground } from "@/components/InteractiveBackground";
import { Preloader } from "@/components/Preloader";
import { CustomCursor } from "@/components/CustomCursor";
import { AnnouncementModal } from "@/components/AnnouncementModal";
import { ImagePopupModal } from "@/components/ImagePopupModal";
import { MetricsTracker } from "@/components/MetricsTracker";
import { AntiDevtools } from "@/components/AntiDevtools";
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
  description: "Relajá tu semestre. La comunidad definitiva de resúmenes.",
  openGraph: {
    title: "UTNHub",
    description: "Relajá tu semestre. La comunidad definitiva de resúmenes.",
    type: "website",
    url: "https://www.utnhub.com",
    locale: "es_AR",
    siteName: "UTNHub",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="antialiased" suppressHydrationWarning>
      <head>
        {process.env.NODE_ENV === "production" && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "w6gvp91zen");
              `
            }}
          />
        )}
      </head>
      <body className="min-h-screen flex flex-col bg-[#FFFBF7] text-[#3D3229] w-full m-0 p-0 relative">
        <AntiDevtools />
        <ToastProvider>
          <MetricsTracker />
          <Preloader />
          <CustomCursor />
          <AnnouncementModal />
          <ImagePopupModal />
          <AuthProvider>
            <InteractiveBackground />
            <Header />
            <main className="relative z-10 flex-1 flex flex-col w-full overflow-x-clip">{children}</main>

            <div className="w-full text-center py-6 mt-8 relative z-10">
              <p className="text-[11px] text-[#A89F95]/80 font-medium tracking-wide">
                Repositorio orientado a la UTN FRM (Facultad Regional Mendoza)
              </p>
            </div>
            
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
                  <a
                    href="https://www.instagram.com/alfadigital.ar/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#A89F95] hover:text-[#3D3229] transition-all transform hover:scale-110"
                    aria-label="Instagram Alfa Digital"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
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

                <div className="mt-5 flex items-center justify-center gap-4 text-[11px] font-medium text-[#C5C0B8]">
                  <a href="/terminos" className="hover:text-[#3D3229] transition-colors">Términos y Condiciones</a>
                  <span className="w-1 h-1 rounded-full bg-[#EDE6DD]" />
                  <a href="/privacidad" className="hover:text-[#3D3229] transition-colors">Políticas de Privacidad</a>
                </div>
              </div>
            </footer>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
