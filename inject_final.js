const fs = require('fs');

const electivas = {
  civil: [
    { name: 'Geología Aplicada', year: 3 },
    { name: 'Sustentabilidad del Recurso Hídrico', year: 4 },
    { name: 'Ferrocarriles', year: 4 },
    { name: 'Tránsito y Transporte', year: 4 },
    { name: 'Prefabricación', year: 4 },
    { name: 'Diseño Estructural', year: 4 },
    { name: 'Gestión Ingenieril', year: 5 },
    { name: 'Dinámica de Estructuras', year: 5 },
    { name: 'Análisis Estructural III', year: 5 },
    { name: 'Saneamiento y Medio Ambiente', year: 5 },
    { name: 'Vialidad Especial', year: 5 },
    { name: 'Caminos y Túneles de Montañas', year: 5 },
    { name: 'Obras Fluviales y Costeras', year: 5 },
    { name: 'Centrales y Máquinas Hidráulicas', year: 5 },
    { name: 'Puentes', year: 5 },
    { name: 'Diseño Sustentable de Edificios', year: 5 }
  ],
  electromecanica: [
    { name: 'Hidrodinámica y Neumática', year: 3 },
    { name: 'Mantenimiento Electromecánico', year: 5 },
    { name: 'Cálculo y Control de Maq. Eléctrica', year: 5 },
    { name: 'Máquinas y Equipos Industriales', year: 5 }
  ],
  electronica: [
    { name: 'Redes de Datos', year: 5 },
    { name: 'Electrónica Industrial', year: 5 },
    { name: 'Sistemas de Comunicaciones II', year: 5 },
    { name: 'Bioelectrónica', year: 5 },
    { name: 'Introducción a los Sist. de Gestión Gerencial', year: 5 },
    { name: 'Sistemas de TV', year: 5 },
    { name: 'Antenas y Propagación Electromagnética', year: 5 },
    { name: 'Centro de Datos: Diseño y Administración', year: 5 },
    { name: 'Sistemas de Comunicaciones III', year: 5 },
    { name: 'Protecciones Digitales y Telecontrol', year: 5 },
    { name: 'Redes de Comunicaciones Móviles', year: 5 },
    { name: 'Evaluación e Innovación de Tecnología desde la perspectiva CTS', year: 5 },
    { name: 'Formación de Emprendedores', year: 5 },
    { name: 'Sistemas de Sonido', year: 5 },
    { name: 'Robótica', year: 5 },
    { name: 'Electrónica Automotriz', year: 5 },
    { name: 'Control de Procesos', year: 5 },
    { name: 'Teleinformática en I o T', year: 5 },
    { name: 'Interoperabilidad', year: 5 },
  ],
  quimica: [
    { name: 'Epistemología', year: 3 },
    { name: 'Metodología de la Investigación', year: 3 },
    { name: 'Utilitarios de Computación', year: 4 },
    { name: 'Gestión de RRHH', year: 4 },
    { name: 'Análisis del Ciclo de Vida (ACV)', year: 4 },
    { name: 'Instalaciones de Maq. térmicas y fluidodinámicas', year: 5 },      
    { name: 'Industrialización de Hidrocarburos', year: 5 },
    { name: 'Gestión Empresarial I', year: 5 },
    { name: 'Bioquímica de los Alimentos', year: 5 },
    { name: 'Ind. Alimentarias', year: 5 },
    { name: 'Ind. de Base Extractiva - Ext., Fracc., Ref.', year: 5 },
    { name: 'Evaluación de Impacto Ambiental', year: 5 },
    { name: 'Gestión Empresarial II', year: 5 },
    { name: 'Ing. Industrial de Recursos Naturales Regionales', year: 5 },      
    { name: 'Formación de Emprendedores', year: 5 }
  ],
  sistemas: [
    { name: 'Administración de Proyectos', year: 3 },
    { name: 'Computación Paralela', year: 3 },
    { name: 'Informática Industrial', year: 4 },
    { name: 'Arquitectura de Microservicios', year: 4 },
    { name: 'Base de Datos Avanzadas', year: 4 },
    { name: 'Desarrollo de Software Dirigido por Modelos', year: 4 },
    { name: 'Gobierno Digital e Innovación', year: 4 },
    { name: 'Diseño de Experiencia de Usuario (UX)', year: 4 },
    { name: 'Seguridad en Redes', year: 5 },
    { name: 'Redes Neuronales Profundas', year: 5 },
    { name: 'Administración de Servicios en Linux', year: 5 },
    { name: 'Evaluación e Innovación de Tecnología desde la perspectiva CTS', year: 5 },
    { name: 'Taller de Auditoría en Sistemas de Información', year: 5 },        
    { name: 'Aprendizaje de Máquinas', year: 5 },
    { name: 'Programación Avanzada', year: 5 },
    { name: 'Taller de Programación Avanzada', year: 5 },
    { name: 'Interoperabilidad', year: 5 },
    { name: 'Formación de Emprendedores', year: 5 }
  ]
};

function generateId() {
  return 10000 + Math.floor(Math.random() * 90000); 
}

let content = fs.readFileSync('app/planes/data.tsx', 'utf8');

for (const [career, subjects] of Object.entries(electivas)) {
    // A robust regex: find the career section `career: {`, then its `curriculum: [`, then the next `    ]\n  }` or `    ]\n  };` and insert before the `    ]`
    
    const careerRegex = new RegExp(`(${career}:\\s*\\{[\\s\\S]*?curriculum:\\s*\\[)([\\s\\S]*?)(\\r?\\n\\s*\\]\\r?\\n\\s*\\}(?:,|;))`, "");
    const match = content.match(careerRegex);
    if (match) {
        let newContent = '';
        for (const s of subjects) {
            newContent += `,
      {
            id: ${generateId()},
            year: ${s.year},
            name: "${s.name}",
            semester: "Electiva",
            weekly_hours: 0,
            total_hours: 0,
            regulares: [],
            aprobadas: [],
            isElectiva: true
      }`;
        }
        
        let curriculumContent = match[2];
        // Now find the LAST `}` inside curriculumContent, which is where the array actually ends. Wait, if we matched the END of the `curriculum` array, `match[2]` is everything inside `curriculum` array, up to the last `}` before `]`.
        // BUT `match[2]` may capture too much if the regex is greedy! Wait, `[\s\S]*?` is lazy. It stops at the FIRST `  ]\n  },`. This could be dangerous if there's nested matching, but there's no `]\n  },` inside curriculum arrays.
        content = content.replace(careerRegex, `$1$2${newContent}$3`);
        console.log(`Injected for ${career}`);
    } else {
        console.log(`Could not find regex match for ${career}`);
    }
}

fs.writeFileSync('app/planes/data.tsx', content);
console.log('Appended successfully');