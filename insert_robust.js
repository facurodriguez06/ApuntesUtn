const fs = require('fs');

function processDataTsx() {
  const file = 'app/planes/data.tsx';
  let text = fs.readFileSync(file, 'utf-8');

  // Insertar en emec
  let insertPos = text.lastIndexOf('"name": "Gestión y Mantenimiento Electromecánico"');
  if(insertPos > -1) {
    let blockEnd = text.indexOf(']', insertPos);
    if(blockEnd > -1) {
      let snippet = `,\n          {
            "id": 996,
            "year": 5,
            "semester": "Electiva",
            "name": "Materias Electivas",
            "weekly_hours": 10,
            "total_hours": 240,
            "regulares": [],
            "aprobadas": []
          }\n        `;
      text = text.slice(0, blockEnd) + snippet + text.slice(blockEnd + 9);
      // slice(blockEnd+9) assumes `\n        ]` is 9 chars roughly. 
      // safer:
    }
  }

  // Un método mucho más fácil y seguro: Reemplazar el final del array de cada carrera sabiendo la última materia.
  const careers = [
    {
      c: 'emec',
      lastSubject: '"name": "Gestión y Mantenimiento Electromecánico"',
      inject: `,\n          {\n            "id": 996,\n            "year": 5,\n            "semester": "Electiva",\n            "name": "Materias Electivas",\n            "weekly_hours": 10,\n            "total_hours": 240,\n            "regulares": [],\n            "aprobadas": []\n          }`
    },
    {
      c: 'electronica',
      lastSubject: '"name": "Electrónica de Potencia"',
      inject: `,\n          {\n            "id": 997,\n            "year": 6,\n            "semester": "Electiva",\n            "name": "Materias Electivas",\n            "weekly_hours": 8,\n            "total_hours": 192,\n            "regulares": [],\n            "aprobadas": []\n          }`
    },
    {
      c: 'civil',
      lastSubject: '"name": "Proyecto Final"', // Wait! There are multiple Proyecto Final.
      // Civil project final is: "aprobadas": [\n              15,\n              16,\n              17,\n              18,\n              19,\n              20,\n              22,\n              23,\n              24,\n              25\n            ]\n          }
      
      // better way to match exactly civil's end.
    }
  ];
}
