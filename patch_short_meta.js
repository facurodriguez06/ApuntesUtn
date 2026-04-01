const fs = require('fs');

let code = fs.readFileSync('app/layout.tsx', 'utf8');

const regex = /export const metadata: Metadata = \{[\s\S]*?icons: \{[\s\S]*?\},[\s\S]*?\};/;

const replacement = `export const metadata: Metadata = {
  title: "UTNHub | Apuntes de Ingeniería",
  description: "Desbloqueá el cuatrimestre. Los mejores resúmenes y exámenes resueltos por la comunidad para que apruebes.",
  openGraph: {
    title: "UTNHub ⚡️ Salvá la cursada",
    description: "La biblioteca definitiva. Encontrá ese resumen o parcial que te falta para promocionar.",
    type: "website",
    locale: "es_AR",
    siteName: "UTNHub",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};`;

if (regex.test(code)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('app/layout.tsx', code);
    console.log("Metadata shorten update successfully!");
} else {
    console.log("Could not find metadata block.");
}