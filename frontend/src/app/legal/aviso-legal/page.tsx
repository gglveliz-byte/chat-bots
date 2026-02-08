export default function AvisoLegalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="glass rounded-3xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-white mb-8">Aviso Legal</h1>

          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 mb-6">
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">1. Datos Identificativos</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                En cumplimiento con el deber de información recogido en artículo 10 de la Ley 34/2002, de 11 de julio,
                de Servicios de la Sociedad de la Información y del Comercio Electrónico, a continuación se reflejan los siguientes datos:
              </p>
              <div className="bg-gray-800/50 rounded-lg p-6">
                <ul className="space-y-2 text-gray-300">
                  <li><strong>Razón Social:</strong> TCSS Programming</li>
                  <li><strong>Email:</strong> <span className="text-indigo-400">lveliz213@hotmail.com</span></li>
                  <li><strong>WhatsApp:</strong> +593 98 786 5420</li>
                  <li><strong>País:</strong> Ecuador</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">2. Objeto</h2>
              <p className="text-gray-300 leading-relaxed">
                El presente aviso legal regula el uso y utilización de este sitio web, del que es titular TCSS Programming.
                La navegación por este sitio atribuye la condición de usuario del mismo e implica la aceptación plena y sin reservas
                de todas y cada una de las disposiciones incluidas en este Aviso Legal.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">3. Condiciones de Acceso y Utilización</h2>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">3.1 Carácter Gratuito</h3>
              <p className="text-gray-300 leading-relaxed">
                El acceso al sitio web tiene carácter gratuito para los usuarios, salvo en lo relativo al coste de la conexión
                a través de la red de telecomunicaciones suministrada por el proveedor contratado por cada usuario.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">3.2 Registro de Usuario</h3>
              <p className="text-gray-300 leading-relaxed">
                Con carácter general, la prestación de los servicios no exige la previa suscripción o registro de los usuarios.
                No obstante, para utilizar determinados servicios es necesario crear una cuenta de usuario.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">3.3 Veracidad de la Información</h3>
              <p className="text-gray-300 leading-relaxed">
                Toda la información que facilite el usuario deberá ser veraz. A estos efectos, el usuario garantiza la autenticidad
                de los datos comunicados a través de los formularios para la suscripción de los servicios.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Contenidos</h2>

              <p className="text-gray-300 leading-relaxed mb-4">
                Los contenidos incorporados en este sitio web han sido elaborados e incluidos por:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>El propio titular del sitio web</li>
                <li>Terceros que han cedido el uso de dichos contenidos</li>
                <li>Servicios de terceros integrados (OpenAI, Meta, Telegram, PayPal)</li>
              </ul>

              <p className="text-gray-300 leading-relaxed mt-4">
                El titular del sitio web no se hace responsable de los contenidos alojados en sitios web de terceros
                a los que se pueda acceder mediante enlaces desde este sitio.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Propiedad Intelectual e Industrial</h2>

              <p className="text-gray-300 leading-relaxed mb-4">
                Todos los contenidos del sitio web, salvo que se indique lo contrario, son titularidad exclusiva de
                TCSS Programming y, en particular, a título enunciativo que no limitativo:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>El diseño gráfico, código fuente y software</li>
                <li>Las marcas, nombres comerciales y signos distintivos</li>
                <li>Los textos, gráficos, imágenes y fotografías</li>
                <li>La estructura de navegación y presentación de contenidos</li>
              </ul>

              <p className="text-gray-300 leading-relaxed mt-4">
                Queda expresamente prohibida la reproducción, distribución, comunicación pública y transformación de
                los contenidos del sitio web sin la autorización expresa y por escrito del titular.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">6. Responsabilidad</h2>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">6.1 Exclusión de Garantías</h3>
              <p className="text-gray-300 leading-relaxed">
                El titular del sitio web no garantiza la inexistencia de errores en el acceso al sitio web,
                en su contenido, ni que éste se encuentre actualizado, aunque desarrollará sus mejores esfuerzos para evitarlos.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">6.2 Exclusión de Responsabilidad</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                El titular del sitio web no será responsable de:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>La falta de disponibilidad, mantenimiento y efectivo funcionamiento del sitio web</li>
                <li>Los daños y perjuicios derivados de un uso inadecuado del sitio</li>
                <li>La seguridad y actualización de los equipos informáticos del usuario</li>
                <li>Virus o programas dañinos en los contenidos</li>
                <li>Contenidos alojados en sitios enlazados</li>
                <li>Respuestas generadas por la inteligencia artificial (OpenAI)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">7. Enlaces (Links)</h2>

              <p className="text-gray-300 leading-relaxed mb-4">
                El sitio web puede contener enlaces a otros sitios web de terceros. Estos enlaces se proporcionan únicamente
                para conveniencia del usuario. El titular no tiene control sobre dichos sitios y no asume responsabilidad alguna
                por su contenido o funcionalidad.
              </p>

              <p className="text-gray-300 leading-relaxed">
                Si desea establecer un enlace a este sitio web desde su página, debe solicitar autorización previa por escrito.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">8. Protección de Datos</h2>

              <p className="text-gray-300 leading-relaxed">
                Para información sobre cómo recopilamos, usamos y protegemos sus datos personales, consulte nuestra{' '}
                <a href="/legal/privacidad" className="text-indigo-400 hover:underline">Política de Privacidad</a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">9. Modificaciones</h2>

              <p className="text-gray-300 leading-relaxed">
                El titular se reserva el derecho a modificar el presente Aviso Legal en cualquier momento.
                Los cambios entrarán en vigor desde el momento de su publicación en el sitio web.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">10. Legislación Aplicable y Jurisdicción</h2>

              <p className="text-gray-300 leading-relaxed">
                Las presentes condiciones se rigen por la legislación de Ecuador. Para la resolución de cualquier controversia
                que pueda surgir entre el titular del sitio web y el usuario, ambas partes acuerdan someterse a los Juzgados
                y Tribunales competentes de Ecuador, renunciando expresamente a cualquier otro fuero que pudiera corresponderles.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">11. Contacto</h2>

              <p className="text-gray-300 leading-relaxed">
                Para cualquier consulta relacionada con este aviso legal puede contactarnos en:
              </p>
              <p className="text-indigo-400 mt-2">
                Email: lveliz213@hotmail.com<br />
                WhatsApp: +593 98 786 5420<br />
                TCSS Programming
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-700">
            <a href="/" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              ← Volver al inicio
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
