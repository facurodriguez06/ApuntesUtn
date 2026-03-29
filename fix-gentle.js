const Jimp = require('jimp');

async function processImage() {
  const imagePath = "C:\\Users\\facun\\.gemini\\antigravity\\brain\\02a28531-7374-4cb7-ac46-18b91768fba4\\notes_hub_favicon_v4_1774736169240.png";
  const outPath = "C:\\Users\\facun\\Desktop\\Proyectos Facu\\APUNTES\\notes-hub\\app\\icon.png";
  
  const image = await Jimp.read(imagePath);
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  
  // Alejar el zoom de la cámara al 82% (antes era 75% muy apretado)
  // Al darle más aire, evitamos que los bordes del libro se corten y queda más elegante.
  const cropSize = Math.floor(Math.min(width, height) * 0.82); 
  const halfSize = Math.floor(cropSize / 2);
  
  // Desplazamiento muy suave del 2.5% (antes fue del 12% y cortó el libro)
  const offsetXPercent = 0.025; 
  
  let centerTargetX = Math.floor(width / 2) + Math.floor(width * offsetXPercent);
  let centerTargetY = Math.floor(height / 2); 
  
  let startX = centerTargetX - halfSize;
  let startY = centerTargetY - halfSize;
  
  if (startX < 0) startX = 0;
  if (startY < 0) startY = 0;
  if (startX + cropSize > width) startX = width - cropSize;
  if (startY + cropSize > height) startY = height - cropSize;

  image.crop(startX, startY, cropSize, cropSize);
  
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
  console.log("Nueva corrección guardada en app/icon.png");
}

processImage().catch(console.error);
