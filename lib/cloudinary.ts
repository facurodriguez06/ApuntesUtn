// Configuración futura para Cloudinary (Almacenamiento de archivos 100% gratuito)

// Aquí inicializaremos el cliente de Cloudinary para gestionar los PDFs y resúmenes
// sin necesidad de usar tarjetas de crédito ni Firebase Storage.

export const cloudinaryConfig = {
  // CLOUDINARY_URL saldrá del .env.local más adelante
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
};
