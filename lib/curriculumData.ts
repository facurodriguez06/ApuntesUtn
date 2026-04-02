export type SubjectStatus = 'pending' | 'regular' | 'approved';

export interface SubjectCurriculum {
  id: string;
  name: string;
  year: number;
  level: number; // For placing in grid correctly
  prerequisites: string[]; // ids of subjects needed
}

export interface CareerCurriculum {
  id: string;
  name: string;
  subjects: SubjectCurriculum[];
}

export const curriculumData: CareerCurriculum[] = [
  {
    id: 'sistemas',
    name: 'Ingeniería en Sistemas',
    subjects: [
      { id: '1', name: 'Análisis Matemático I', year: 1, level: 1, prerequisites: [] },
      { id: '2', name: 'Álgebra y Geometría Analítica', year: 1, level: 1, prerequisites: [] },
      { id: '3', name: 'Matemática Discreta', year: 1, level: 1, prerequisites: [] },
      { id: '4', name: 'Sistemas y Organizaciones', year: 1, level: 1, prerequisites: [] },
      { id: '5', name: 'Algoritmos y Estructuras de Datos', year: 1, level: 1, prerequisites: [] },
      { id: '6', name: 'Arquitectura de Computadoras', year: 1, level: 1, prerequisites: [] },
      { id: '7', name: 'Física I', year: 1, level: 1, prerequisites: [] },
      { id: '8', name: 'Inglés I', year: 1, level: 1, prerequisites: [] },
      { id: '9', name: 'Análisis Matemático II', year: 2, level: 2, prerequisites: ['1', '2'] },
      { id: '10', name: 'Física II', year: 2, level: 2, prerequisites: ['1', '7'] },
      { id: '11', name: 'Probabilidad y Estadística', year: 2, level: 2, prerequisites: ['1', '2'] },
      { id: '12', name: 'Diseño de Sistemas', year: 2, level: 2, prerequisites: ['4', '5'] },
      { id: '13', name: 'Sistemas de Representación', year: 2, level: 2, prerequisites: [] },
      { id: '14', name: 'Química', year: 2, level: 2, prerequisites: [] },
      { id: '15', name: 'Sintaxis y Semántica de los Lenguajes', year: 2, level: 2, prerequisites: ['3', '5'] },
      { id: '16', name: 'Paradigmas de Programación', year: 2, level: 2, prerequisites: ['3', '5'] },
      { id: '17', name: 'Inglés II', year: 2, level: 2, prerequisites: ['8'] },
      { id: '18', name: 'Matemática Superior', year: 3, level: 3, prerequisites: ['9'] },
      { id: '19', name: 'Gestión de Datos', year: 3, level: 3, prerequisites: ['12', '15', '16'] },
      { id: '20', name: 'Sistemas Operativos', year: 3, level: 3, prerequisites: ['6', '12'] },
      { id: '21', name: 'Análisis de Sistemas', year: 3, level: 3, prerequisites: ['12'] },
      { id: '22', name: 'Economía', year: 3, level: 3, prerequisites: ['12'] },
      { id: '23', name: 'Redes de Información', year: 4, level: 4, prerequisites: ['20'] },
      { id: '24', name: 'Administración de Recursos', year: 4, level: 4, prerequisites: ['21', '22'] },
      { id: '25', name: 'Investigación Operativa', year: 4, level: 4, prerequisites: ['11', '18'] },
      { id: '26', name: 'Simulación', year: 4, level: 4, prerequisites: ['11'] },
      { id: '27', name: 'Ingeniería de Software', year: 4, level: 4, prerequisites: ['19', '21'] },
      { id: '28', name: 'Teoría de Control', year: 4, level: 4, prerequisites: ['10', '18'] },
      { id: '29', name: 'Comunicaciones', year: 4, level: 4, prerequisites: ['10', '20'] },
      { id: '30', name: 'Proyecto Final', year: 5, level: 5, prerequisites: ['23', '24', '27'] },
      { id: '31', name: 'Inteligencia Artificial', year: 5, level: 5, prerequisites: ['25', '26'] },
      { id: '32', name: 'Administración Gerencial', year: 5, level: 5, prerequisites: ['24'] },
      { id: '33', name: 'Sistemas de Gestión', year: 5, level: 5, prerequisites: ['24', '25', '27'] },
    ]
  }
];