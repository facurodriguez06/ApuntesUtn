# University Notes Hub 📚

Plataforma colaborativa para estudiantes de ingeniería donde podés encontrar y compartir apuntes, exámenes modelos y resúmenes de todas las materias. 

## 🚀 Funcionalidades
- **Gestión de Apuntes**: Subida de archivos reales (PDF, Docx, etc.) almacenados en la nube.
- **Moderación**: Panel de administrador para aprobar o rechazar nuevas publicaciones.
- **Organización**: Filtros por carrera, año y materia (UTN).
- **Previsualización**: Ver los documentos directamente en el navegador antes de descargarlos.

## 🛠️ Tecnologías
- **Frontend**: [Next.js](https://nextjs.org/) (App Router) + Tailwind CSS.
- **Base de Datos**: Firebase Firestore (Tiempo real).
- **Autenticación**: Firebase Auth.
- **Almacenamiento**: Cloudinary (Subida de archivos físicos).

## ⚙️ Configuración
Para correr el proyecto localmente, seguí estos pasos:

1. Cloná el repositorio:
   ```bash
   git clone [tu-repo-url]
   ```
2. Instalá las dependencias:
   ```bash
   npm install
   ```
3. Configurá las variables de entorno en un archivo `.env.local`:
   ```env
   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY="..."
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
   NEXT_PUBLIC_FIREBASE_APP_ID="..."

   # Cloudinary
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="..."
   ```
4. Corré el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## 🔒 Panel de Admin
El panel de moderación se encuentra en `/admin`. Requiere inicio de sesión con una cuenta autorizada en Firebase Auth.

---
Proyecto desarrollado para facilitar el acceso a material de estudio gratuito y organizado.
