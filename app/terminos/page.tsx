export default function TerminosYCondiciones() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 mt-16">
      <h1 className="text-4xl font-black text-[#3D3229] mb-8 tracking-tight">Términos y Condiciones</h1>
      <div className="space-y-6 text-[#3D3229]/80 leading-relaxed font-medium">
        <p>¡Bienvenido a UTNHub! Por favor, lee esto antes de usar la plataforma. (Tranqui, intentamos hacerlo lo menos aburrido posible).</p>

        <section className="mt-8">
          <h2 className="text-2xl font-bold text-[#3D3229] mb-4">1. Uso del sitio</h2>
          <p>UTNHub es una plataforma pensada por y para estudiantes, donde nuestro objetivo es ayudarnos entre nosotros compartiendo resúmenes, parciales y apuntes. El uso de esta plataforma es gratuito y colaborativo.</p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold text-[#3D3229] mb-4">2. Contenido</h2>
          <p>Todo el contenido (apuntes, resúmenes, exámenes) subido a UTNHub es proporcionado por los mismos estudiantes. Como tal:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>No garantizamos que el material esté 100% libre de errores. ¡Revisá y verificá con los apuntes oficiales de tu profe!</li>
            <li>Si subís un archivo, estás de acuerdo en que pase a ser de consulta pública y gratuita para toda la comunidad de UTNHub.</li>
            <li>UTNHub no es responsable de las calificaciones de tus exámenes (ojalá promociones, pero estudiar sigue dependiendo de vos 📚).</li>
          </ul>
        </section>
        
        <section className="mt-8">
          <h2 className="text-2xl font-bold text-[#3D3229] mb-4">3. Material Inapropiado o Derechos de Autor</h2>
          <p>Si encontrás algún material que infrinja derechos de autor, que contenga datos privados, o simplemente no tenga nada que ver con la facultad, podés notificarnos usando el botón de reporte (en el pie de página). Nos reservamos el derecho de eliminar cualquier contenido que consideremos inapropiado sin previo aviso.</p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold text-[#3D3229] mb-4">4. No oficialidad</h2>
          <p>UTNHub es un proyecto independiente mantenido por alumnos. <strong>No somos una plataforma oficial de la Universidad Tecnológica Nacional (UTN)</strong> ni estamos avalados institucionalmente por la misma.</p>
        </section>

        <p className="pt-8 text-sm italic text-[#3D3229]/60">Última actualización: {new Date().toLocaleDateString('es-AR')}</p>
      </div>
    </div>
  );
}