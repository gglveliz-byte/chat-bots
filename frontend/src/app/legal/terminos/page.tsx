export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="glass rounded-3xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-white mb-8">Términos y Condiciones</h1>

          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 mb-6">
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">1. Aceptación de los Términos</h2>
              <p className="text-gray-300 leading-relaxed">
                Al acceder y utilizar esta plataforma de NeuroChat, usted acepta estar sujeto a estos Términos y Condiciones.
                Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestro servicio.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">2. Descripción del Servicio</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Nuestra plataforma proporciona servicios de chatbot con inteligencia artificial para múltiples plataformas de mensajería, incluyendo:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>WhatsApp Business</li>
                <li>Facebook Messenger</li>
                <li>Instagram Direct Messages</li>
                <li>Telegram</li>
                <li>Chat Web Widget</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">3. Registro y Cuenta</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Para utilizar nuestros servicios, debe:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Proporcionar información precisa y completa durante el registro</li>
                <li>Mantener la seguridad de su contraseña</li>
                <li>Notificarnos inmediatamente sobre cualquier uso no autorizado de su cuenta</li>
                <li>Ser responsable de todas las actividades que ocurran bajo su cuenta</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Uso Aceptable</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Usted se compromete a NO utilizar el servicio para:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Enviar spam o mensajes no solicitados</li>
                <li>Distribuir contenido ilegal, ofensivo o inapropiado</li>
                <li>Violar derechos de propiedad intelectual</li>
                <li>Realizar actividades fraudulentas</li>
                <li>Intentar acceder sin autorización a sistemas o datos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Planes y Pagos</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Los planes de suscripción incluyen:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong>Plan Trial:</strong> Gratuito con limitaciones (100 mensajes/día)</li>
                <li><strong>Planes Pagos:</strong> Según tarifa seleccionada, con facturación mensual</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                Los pagos se procesan mediante PayPal. Las tarifas son no reembolsables excepto según lo exigido por la ley.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">6. Integración con Plataformas de Terceros</h2>
              <p className="text-gray-300 leading-relaxed">
                Nuestro servicio se integra con plataformas de terceros (Meta/Facebook, Telegram, etc.).
                Usted es responsable de cumplir con los términos de servicio de estas plataformas.
                No somos responsables de cambios en las APIs o políticas de terceros que puedan afectar el funcionamiento del servicio.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">7. Propiedad Intelectual</h2>
              <p className="text-gray-300 leading-relaxed">
                Todo el contenido, diseño, código y materiales de esta plataforma son propiedad exclusiva nuestra o de nuestros licenciantes.
                El uso del servicio no le otorga ningún derecho de propiedad sobre el mismo.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">8. Limitación de Responsabilidad</h2>
              <p className="text-gray-300 leading-relaxed">
                El servicio se proporciona "tal cual" sin garantías de ningún tipo. No seremos responsables por:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Interrupciones del servicio</li>
                <li>Pérdida de datos o información</li>
                <li>Errores en las respuestas de IA</li>
                <li>Daños indirectos o consecuentes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">9. Cancelación y Suspensión</h2>
              <p className="text-gray-300 leading-relaxed">
                Nos reservamos el derecho de suspender o cancelar su cuenta si:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Viola estos Términos y Condiciones</li>
                <li>No paga las tarifas correspondientes</li>
                <li>Utiliza el servicio de manera fraudulenta o abusiva</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                Usted puede cancelar su suscripción en cualquier momento desde su panel de control.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">10. Modificaciones</h2>
              <p className="text-gray-300 leading-relaxed">
                Nos reservamos el derecho de modificar estos términos en cualquier momento.
                Las modificaciones entrarán en vigor inmediatamente después de su publicación en esta página.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">11. Ley Aplicable</h2>
              <p className="text-gray-300 leading-relaxed">
                Estos términos se rigen por las leyes de Ecuador.
                Cualquier disputa será resuelta en los tribunales competentes de Ecuador.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">12. Contacto</h2>
              <p className="text-gray-300 leading-relaxed">
                Para cualquier pregunta sobre estos términos, contáctenos en:
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
