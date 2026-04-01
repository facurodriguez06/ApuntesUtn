const fs = require('fs');

let code = fs.readFileSync('app/layout.tsx', 'utf8');

const target = `export const metadata: Metadata = {
  title: "UTNHub",
  description: "Repositorio colaborativo de apuntes universitarios",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};`;

const replacement = `export const metadata: Metadata = {
  title: "UTNHub",
  description: "👉 Encontrá los mejores resúmenes, parciales resueltos y guías de ingeniería. La comunidad que te ayuda a promocionar tus materias. ¡Entrá, descargá y aprobá!",
  openGraph: {
    title: "UTNHub | Salvá el Cuatrimestre",
    description: "📚 Apuntes, resúmenes y exámenes resueltos subidos por y para estudiantes. ¡Sumate a la comunidad y aprobá!",
    type: "website",
    locale: "es_AR",
    siteName: "UTNHub",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};`;

if(code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('app/layout.tsx', code);
    console.log("Metadata updated successfully!");
} else {
    // try softer replace
    const regex = /export const metadata: Metadata = \{[\s\S]*?icons: \{[\s\S]*?\},[\s\S]*?\};/;
    if(regex.test(code)) {
        code = code.replace(regex, replacement);
        fs.writeFileSync('app/layout.tsx', code);
        console.log("Metadata updated via regex!");
    } else {
        console.log("Could not find metadata.");
    }
}
