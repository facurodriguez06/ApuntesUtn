const Jimp = require('jimp');

async function processImage() {
  const transparentImagePath = "C:\\Users\\facun\\.gemini\\antigravity\\brain\\02a28531-7374-4cb7-ac46-18b91768fba4\\notes_hub_favicon_v4_transparent.png";
  const originalBackgroundPath = "C:\\Users\\facun\\.gemini\\antigravity\\brain\\02a28531-7374-4cb7-ac46-18b91768fba4\\notes_hub_favicon_v4_1774736169240.png";
  const outPath = "C:\\Users\\facun\\Desktop\\Proyectos Facu\\APUNTES\\notes-hub\\app\\icon.png";
  const copyPath = "C:\\Users\\facun\\.gemini\\antigravity\\brain\\02a28531-7374-4cb7-ac46-18b91768fba4\\notes_hub_favicon_v4_pixelperfect.png";
  
  // 1. Cargamos el libro SIN FONDO (transparente)
  const book = await Jimp.read(transparentImagePath);
  
  // 2. Lo recortamos automáticamente a sus píxeles extremos reales (sin márgenes invisibles)
  book.autocrop(); 
  
  // 3. Tomamos el color de fondo exacto de la imagen original (el azul oscuro del borde)
  const bgImage = await Jimp.read(originalBackgroundPath);
  const bgColor = bgImage.getPixelColor(0, 0); // Tomamos el pixel superior izquierdo
  
  // 4. Creamos un lienzo cuadrado perfecto de 800x800
  const size = 800;
  const canvas = await new Jimp(size, size, bgColor);
  
  // 5. Escala el libro para que quepa bien dentro del lienzo (ej: dejándolo al 87% del estricto tamaño simétrico final)
  const targetBookSize = Math.floor(size * 0.87);
  book.scaleToFit(targetBookSize, targetBookSize);
  
  // 6. Colocamos el libro EXACTAMENTE en el medio milimétrico del lienzo
  const bookW = book.bitmap.width;
  const bookH = book.bitmap.height;
  const targetX = Math.floor((size - bookW) / 2);
  const targetY = Math.floor((size - bookH) / 2);
  
  canvas.composite(book, targetX, targetY);
  
  // 7. Aplicamos el redondeo iOS Squircle
  const radius = Math.floor(size * 0.22);
  
  canvas.scan(0, 0, size, size, function(posX, posY, idx) {
    let isCorner = false;
    let cx, cy;
    
    if (posX < radius && posY < radius) { cx = radius; cy = radius; isCorner = true; }
    else if (posX >= size - radius && posY < radius) { cx = size - radius - 1; cy = radius; isCorner = true; }
    else if (posX < radius && posY >= size - radius) { cx = radius; cy = size - radius - 1; isCorner = true; }
    else if (posX >= size - radius && posY >= size - radius) { cx = size - radius - 1; cy = size - radius - 1; isCorner = true; }
    
    if (isCorner) {
      const dist = Math.sqrt(Math.pow(posX - cx, 2) + Math.pow(posY - cy, 2));
      if (dist > radius) {
        this.bitmap.data[idx + 3] = 0; // Fuera del radio, invisible
      } else if (dist > radius - 2) {
        // Antialiasing suave del borde
        const alphaOut = Math.max(0, Math.min(255, Math.pow((radius - dist) / 2, 0.8) * 255));
        const currentAlpha = this.bitmap.data[idx + 3];
        this.bitmap.data[idx + 3] = Math.round(Math.min(alphaOut, currentAlpha));
      }
    }
  });

  await canvas.writeAsync(outPath);
  await canvas.writeAsync(copyPath);
  console.log("Composición perfecta finalizada.");
}

processImage().catch(console.error);
