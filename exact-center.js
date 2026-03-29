const Jimp = require('jimp');
const path = require('path');

async function processImage() {
  const imagePath = "C:\\Users\\facun\\.gemini\\antigravity\\brain\\02a28531-7374-4cb7-ac46-18b91768fba4\\notes_hub_favicon_v4_1774736169240.png";
  const outPath = "C:\\Users\\facun\\Desktop\\Proyectos Facu\\APUNTES\\notes-hub\\app\\icon.png";
  const copyPath = "C:\\Users\\facun\\.gemini\\antigravity\\brain\\02a28531-7374-4cb7-ac46-18b91768fba4\\notes_hub_favicon_v4_real_shift.png";
  
  const image = await Jimp.read(imagePath);
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  
  // Mismo tamaño de "lente"
  const cropSize = Math.floor(Math.min(width, height) * 0.75); 
  const halfSize = Math.floor(cropSize / 2);
  
  // El usuario dice que ve MENOS espacio azul a la DERECHA.
  // Es decir, el libro está muy a la derecha y muy cerca del borde derecho.
  // Para corregir esto, tenemos que MOVER EL LIBRO A LA IZQUIERDA.
  // Para mover el logito a la izquierda dentro del marco, el lente de corte debe moverse a la derecha (+X).
  // Vamos a ser agresivos: 10% a la derecha. (0.10)
  
  const offsetXPercent = 0.12; 
  
  let centerTargetX = Math.floor(width / 2) + Math.floor(width * offsetXPercent);
  let centerTargetY = Math.floor(height / 2); // vertical se mantiene
  
  let startX = centerTargetX - halfSize;
  let startY = centerTargetY - halfSize;
  
  // Evitar romper límites (aunque con 12% puede que lleguemos al borde del azul)
  if (startX < 0) startX = 0;
  if (startY < 0) startY = 0;
  if (startX + cropSize > width) startX = width - cropSize;
  if (startY + cropSize > height) startY = height - cropSize;

  image.crop(startX, startY, cropSize, cropSize);
  
  // Esquinas redondeadas (Squircle) a 22%
  const size = cropSize;
  const radius = Math.floor(size * 0.22);
  
  image.scan(0, 0, size, size, function(posX, posY, idx) {
    let isCorner = false;
    let cx, cy;
    
    if (posX < radius && posY < radius) { cx = radius; cy = radius; isCorner = true; }
    else if (posX >= size - radius && posY < radius) { cx = size - radius - 1; cy = radius; isCorner = true; }
    else if (posX < radius && posY >= size - radius) { cx = radius; cy = size - radius - 1; isCorner = true; }
    else if (posX >= size - radius && posY >= size - radius) { cx = size - radius - 1; cy = size - radius - 1; isCorner = true; }
    
    if (isCorner) {
      const dist = Math.sqrt(Math.pow(posX - cx, 2) + Math.pow(posY - cy, 2));
      if (dist > radius) {
        this.bitmap.data[idx + 3] = 0; 
      } else if (dist > radius - 2) {
        const alphaOut = Math.max(0, Math.min(255, Math.pow((radius - dist) / 2, 0.8) * 255));
        const currentAlpha = this.bitmap.data[idx + 3];
        this.bitmap.data[idx + 3] = Math.round(Math.min(alphaOut, currentAlpha));
      }
    }
  });

  await image.writeAsync(outPath);
  await image.writeAsync(copyPath);
  console.log("Corrección geométrica aplicada con offset fuerte.");
}

processImage().catch(console.error);
