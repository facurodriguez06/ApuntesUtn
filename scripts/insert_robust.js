const fs = require('fs');
let code = fs.readFileSync('lib/data.ts', 'utf8');

const insertElectives = (arrayName, electivesString) => {
  const target = arrayName + ' = [';
  const startIndex = code.indexOf(target);
  if (startIndex === -1) {
      console.log('Could not find', arrayName);
      return;
  }
  
  // Find the closing bracket '];' after startIndex
  let endIndex = code.indexOf('];', startIndex);
  if (endIndex === -1) {
      console.log('Could not find ending bracket for', arrayName);
      return;
  }
  
  // Insert exactly before the closing bracket
  const before = code.slice(0, endIndex);
  const after = code.slice(endIndex);
  code = before + electivesString + '\n  ' + after;
}

insertElectives('const civilSubs: Subject[]', `
    // Materias Electivas (Civil)
    ele('civ-e-geo', 'Geología Aplicada', 99, 'civil', [{careerId: 'civil', year: 99}]),
    ele('civ-e-srh', 'Sustentabilidad del Recurso Hídrico', 99, 'civil', [{careerId: 'civil', year: 99}]),
    ele('civ-e-fer', 'Ferrocarriles', 99, 'civil', [{careerId: 'civil', year: 99}]),
    ele('civ-e-tyt', 'Tránsito y Transporte', 99, 'civil', [{careerId: 'civil', year: 99}]),
    ele('civ-e-pre', 'Prefabricación', 99, 'civil', [{careerId: 'civil', year: 99}]),
    ele('civ-e-des', 'Diseño Estructural', 99, 'civil', [{careerId: 'civil', year: 99}]),
    ele('civ-e-gin', 'Gestión Ingenieril', 99, 'civil', [{careerId: 'civil', year: 99}]),
    ele('civ-e-din', 'Dinámica de Estructuras', 99, 'civil', [{careerId: 'civil', year: 99}]),
    ele('civ-e-ae3', 'Análisis Estructural III', 99, 'civil', [{careerId: 'civil', year: 99}]),
    ele('civ-e-sym', 'Saneamiento y Medio Ambiente', 99, 'civil', [{careerId: 'civil', year: 99}]),
    ele('civ-e-vie', 'Vialidad Especial', 99, 'civil', [{careerId: 'civil', year: 99}]),
    ele('civ-e-cyt', 'Caminos y Túneles de Montañas', 99, 'civil', [{careerId: 'civil', year: 99}]),
    ele('civ-e-ofc', 'Obras Fluviales y Costeras', 99, 'civil', [{careerId: 'civil', year: 99}]),
    ele('civ-e-cmh', 'Centrales y Máquinas Hidráulicas', 99, 'civil', [{careerId: 'civil', year: 99}]),
    ele('civ-e-pue', 'Puentes', 99, 'civil', [{careerId: 'civil', year: 99}]),
    ele('civ-e-dse', 'Diseño Sustentable de Edificios', 99, 'civil', [{careerId: 'civil', year: 99}]),`);

insertElectives('const electromecanicaSubs: Subject[]', `
    // Materias Electivas (Electromecánica)
    ele('elm-e-hyn', 'Hidrodinámica y Neumática', 99, 'electromecanica', [{careerId: 'electromecanica', year: 99}]),
    ele('elm-e-mel', 'Mantenimiento Electromecánico', 99, 'electromecanica', [{careerId: 'electromecanica', year: 99}]),
    ele('elm-e-ccm', 'Cálculo y Control de Maq. Eléctrica', 99, 'electromecanica', [{careerId: 'electromecanica', year: 99}]),
    ele('elm-e-mei', 'Máquinas y Equipos Industriales', 99, 'electromecanica', [{careerId: 'electromecanica', year: 99}]),`);

insertElectives('const electronicaSubs: Subject[]', `
    // Materias Electivas (Electrónica)
    ele('ele-e-rdd', 'Redes de Datos', 99, 'electronica', [{careerId: 'electronica', year: 99}]),
    ele('ele-e-ein', 'Electrónica Industrial', 99, 'electronica', [{careerId: 'electronica', year: 99}]),
    ele('ele-e-sc2', 'Sistemas de Comunicaciones II', 99, 'electronica', [{careerId: 'electronica', year: 99}]),
    ele('ele-e-bio', 'Bioelectrónica', 99, 'electronica', [{careerId: 'electronica', year: 99}]),
    ele('ele-e-isg', 'Introducción a los Sist. de Gestión Gerencial', 99, 'electronica', [{careerId: 'electronica', year: 99}]),
    ele('ele-e-stv', 'Sistemas de TV', 99, 'electronica', [{careerId: 'electronica', year: 99}]),
    ele('ele-e-ape', 'Antenas y Propagación Electromagnética', 99, 'electronica', [{careerId: 'electronica', year: 99}]),
    ele('ele-e-cda', 'Centro de Datos: Diseño y Administración', 99, 'electronica', [{careerId: 'electronica', year: 99}]),
    ele('ele-e-sc3', 'Sistemas de Comunicaciones III', 99, 'electronica', [{careerId: 'electronica', year: 99}]),
    ele('ele-e-pdt', 'Protecciones Digitales y Telecontrol', 99, 'electronica', [{careerId: 'electronica', year: 99}]),
    ele('ele-e-rcm', 'Redes de Comunicaciones Móviles', 99, 'electronica', [{careerId: 'electronica', year: 99}]),
    ele('ele-e-sso', 'Sistemas de Sonido', 99, 'electronica', [{careerId: 'electronica', year: 99}]),
    ele('ele-e-rob', 'Robótica', 99, 'electronica', [{careerId: 'electronica', year: 99}]),
    ele('ele-e-eau', 'Electrónica Automotriz', 99, 'electronica', [{careerId: 'electronica', year: 99}]),
    ele('ele-e-cdp', 'Control de Procesos', 99, 'electronica', [{careerId: 'electronica', year: 99}]),
    ele('ele-e-tiot', 'Teleinformática en IoT', 99, 'electronica', [{careerId: 'electronica', year: 99}]),`);

insertElectives('const quimicaSubs: Subject[]', `
    // Materias Electivas (Química)
    ele('qui-e-epi', 'Epistemología', 99, 'quimica', [{careerId: 'quimica', year: 99}]),
    ele('qui-e-mdi', 'Metodología de la Investigación', 99, 'quimica', [{careerId: 'quimica', year: 99}]),
    ele('qui-e-udc', 'Utilitarios de Computación', 99, 'quimica', [{careerId: 'quimica', year: 99}]),
    ele('qui-e-grh', 'Gestión de RRHH', 99, 'quimica', [{careerId: 'quimica', year: 99}]),
    ele('qui-e-acv', 'Análisis del Ciclo de Vida (ACV)', 99, 'quimica', [{careerId: 'quimica', year: 99}]),
    ele('qui-e-imf', 'Instalaciones de Máquinas térmicas y fluidodinámicas', 99, 'quimica', [{careerId: 'quimica', year: 99}]),
    ele('qui-e-idh', 'Industrialización de Hidrocarburos', 99, 'quimica', [{careerId: 'quimica', year: 99}]),
    ele('qui-e-ge1', 'Gestión Empresarial I', 99, 'quimica', [{careerId: 'quimica', year: 99}]),
    ele('qui-e-bda', 'Bioquímica de los Alimentos', 99, 'quimica', [{careerId: 'quimica', year: 99}]),
    ele('qui-e-ial', 'Industrias Alimentarias', 99, 'quimica', [{careerId: 'quimica', year: 99}]),
    ele('qui-e-ibe', 'Industria de Base Extractiva - Extracción, Fraccionamiento, Refinación', 99, 'quimica', [{careerId: 'quimica', year: 99}]),
    ele('qui-e-eia', 'Evaluación de Impacto Ambiental', 99, 'quimica', [{careerId: 'quimica', year: 99}]),
    ele('qui-e-ge2', 'Gestión Empresarial II', 99, 'quimica', [{careerId: 'quimica', year: 99}]),
    ele('qui-e-iir', 'Ingeniería Industrial de Recursos Naturales Regionales', 99, 'quimica', [{careerId: 'quimica', year: 99}]),`);

insertElectives('const sistemasSubs: Subject[]', `
    // Materias Electivas (Sistemas)
    ele('sis-e-adm', 'Aprendizaje de Máquinas', 99, 'sistemas', [{careerId: 'sistemas', year: 99}]),
    ele('sis-e-pra', 'Programación Avanzada', 99, 'sistemas', [{careerId: 'sistemas', year: 99}]),
    ele('sis-e-sre', 'Seguridad en Redes', 99, 'sistemas', [{careerId: 'sistemas', year: 99}]),
    ele('sis-e-tpa', 'Taller de Programación Avanzada', 99, 'sistemas', [{careerId: 'sistemas', year: 99}]),
    ele('sis-e-iin', 'Informática Industrial', 99, 'sistemas', [{careerId: 'sistemas', year: 99}]),
    ele('sis-e-adp', 'Administración de Proyectos', 99, 'sistemas', [{careerId: 'sistemas', year: 99}]),
    ele('sis-e-bda', 'Base de Datos Avanzadas', 99, 'sistemas', [{careerId: 'sistemas', year: 99}]),
    ele('sis-e-dsd', 'Desarrollo de software dirigido por modelos', 99, 'sistemas', [{careerId: 'sistemas', year: 99}]),
    ele('sis-e-gdi', 'Gobierno digital e Innovación', 99, 'sistemas', [{careerId: 'sistemas', year: 99}]),
    ele('sis-e-ami', 'Arquitectura de Microservicios', 99, 'sistemas', [{careerId: 'sistemas', year: 99}]),
    ele('sis-e-rnp', 'Redes neuronales profundas', 99, 'sistemas', [{careerId: 'sistemas', year: 99}]),
    ele('sis-e-asl', 'Administración de servicios en Linux', 99, 'sistemas', [{careerId: 'sistemas', year: 99}]),
    ele('sis-e-cpa', 'Computación Paralela', 99, 'sistemas', [{careerId: 'sistemas', year: 99}]),`);

fs.writeFileSync('lib/data.ts', code);
console.log('Appended securely!');