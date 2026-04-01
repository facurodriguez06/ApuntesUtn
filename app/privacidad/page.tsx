export default function Privacidad() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 mt-16">
      <h1 className="text-4xl font-black text-[#3D3229] mb-8 tracking-tight">Política de Privacidad</h1>
      <div className="space-y-6 text-[#3D3229]/80 leading-relaxed font-medium">
        <p>En UTNHub valoramos y respetamos tu información y tiempo, por eso, somos 100% transparentes sobre lo que recolectamos.</p>
        
        <section className="mt-8">
          <h2 className="text-2xl font-bold text-[#3D3229] mb-4">1. Datos que recopilamos</h2>
          <p>Solo recolectamos datos estrictamente necesarios para el funcionamiento del sitio web y sistema de administración:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li><strong>Autenticación (Firebase):</strong> Si utilizas nuestra plataforma como subidor o administrador, podemos requerir un correo y contraseña o acceso mediante Google con el fin de verificar tu identidad.</li>
            <li><strong>Contenidos Subidos:</strong> Cuando subís un apunte, almacenamos el archivo en nuestros servidores y opcionalmente el nombre del autor ingresado para mostrar como referencia.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold text-[#3D3229] mb-4">2. Cookies y Análisis de uso</h2>
          <p>
            UTNHub podría utilizar cookies propias estrictamente técnicas y/o cookies de terceros (como análisis de tráfico) de forma completamente anonimizada. 
            El único fin de recolectar analitos generalizados es conocer qué materias o herramientas resultan más útiles a la comunidad y mejorar el sitio progresivamente.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold text-[#3D3229] mb-4">3. Cuota de almacenamiento</h2>
          <p>Almacenamos y manejamos la subida de los archivos empleando servicios en la nube de terceros (AWS / Google Cloud, Cloudinary, Firebase u otros similares) que a su vez se rigen por políticas de privacidad de alto nivel y cumplimiento internacional. Tu archivo está seguro y no será alterado en forma intencionada por UTNHub.</p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold text-[#3D3229] mb-4">4. Venta y Divulgación</h2>
          <p>
            Jamás venderemos tus datos (correo o identidad) a entidades de terceros, servicios de marketing u otras webs. 
            Queremos que la vida universitaria sea más fácil, no que te lleguen spams promocionando cursos falopa y sospechosos.
          </p>
        </section>

        <p className="pt-8 text-sm italic text-[#3D3229]/60">Última actualización: {new Date().toLocaleDateString('es-AR')}</p>
      </div>
    </div>
  );
}