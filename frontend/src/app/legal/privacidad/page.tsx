export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="glass rounded-3xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-white mb-8">Política de Privacidad</h1>

          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 mb-6">
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">1. Información que Recopilamos</h2>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">1.1 Información de Cuenta</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Nombre y apellidos</li>
                <li>Dirección de correo electrónico</li>
                <li>Contraseña (encriptada)</li>
                <li>Información de la empresa</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">1.2 Datos de Uso</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Mensajes procesados por el chatbot</li>
                <li>Conversaciones almacenadas</li>
                <li>Configuraciones del bot (personalidad, instrucciones)</li>
                <li>Archivos de conocimiento subidos (PDFs)</li>
                <li>Métricas de uso y rendimiento</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">1.3 Información de Pago</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Transacciones procesadas vía PayPal (no almacenamos datos de tarjetas)</li>
                <li>Historial de pagos y facturas</li>
                <li>Comprobantes de pago</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">1.4 Credenciales de Terceros</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Tokens de acceso de Meta (Facebook/WhatsApp/Instagram)</li>
                <li>IDs de cuentas de plataformas conectadas</li>
                <li>Tokens de Telegram (si aplica)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">2. Cómo Utilizamos su Información</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong>Proveer el Servicio:</strong> Procesar mensajes, generar respuestas de IA, gestionar conversaciones</li>
                <li><strong>Mejorar el Servicio:</strong> Analizar uso para optimizar funcionalidades</li>
                <li><strong>Comunicación:</strong> Enviar notificaciones importantes, actualizaciones del servicio</li>
                <li><strong>Soporte:</strong> Resolver problemas técnicos y atender consultas</li>
                <li><strong>Facturación:</strong> Procesar pagos y generar facturas</li>
                <li><strong>Cumplimiento Legal:</strong> Cumplir con obligaciones legales y regulatorias</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">3. Compartir Información con Terceros</h2>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">3.1 Proveedores de Servicios</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Compartimos datos con terceros solo cuando es necesario:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong>OpenAI:</strong> Para generar respuestas del chatbot</li>
                <li><strong>Meta (Facebook):</strong> Para WhatsApp, Messenger, Instagram</li>
                <li><strong>Telegram:</strong> Para mensajería de Telegram</li>
                <li><strong>PayPal:</strong> Para procesar pagos</li>
                <li><strong>Hosting (Render/otro):</strong> Para almacenar datos en servidores seguros</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">3.2 Cumplimiento Legal</h3>
              <p className="text-gray-300 leading-relaxed">
                Podemos divulgar información si lo requiere la ley, orden judicial, o para proteger nuestros derechos legales.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Seguridad de los Datos</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Implementamos medidas de seguridad para proteger su información:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Encriptación SSL/TLS para todas las comunicaciones</li>
                <li>Contraseñas hasheadas con bcrypt</li>
                <li>Tokens JWT para autenticación segura</li>
                <li>Validación de webhooks con firmas criptográficas</li>
                <li>Acceso restringido a datos sensibles</li>
                <li>Copias de seguridad regulares de la base de datos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Retención de Datos</h2>
              <p className="text-gray-300 leading-relaxed">
                Conservamos su información mientras su cuenta esté activa o según sea necesario para cumplir con obligaciones legales.
                Puede solicitar la eliminación de su cuenta y datos asociados en cualquier momento.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">6. Sus Derechos (GDPR)</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Si se encuentra en la Unión Europea, tiene derecho a:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong>Acceso:</strong> Solicitar una copia de sus datos personales</li>
                <li><strong>Rectificación:</strong> Corregir datos inexactos</li>
                <li><strong>Eliminación:</strong> Solicitar la eliminación de sus datos ("derecho al olvido")</li>
                <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
                <li><strong>Oposición:</strong> Oponerse al procesamiento de sus datos</li>
                <li><strong>Limitación:</strong> Restringir el procesamiento en ciertos casos</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                Para ejercer estos derechos, contáctenos en: <span className="text-indigo-400">lveliz213@hotmail.com</span>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">7. Cookies y Tecnologías Similares</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Utilizamos cookies para:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Mantener su sesión activa</li>
                <li>Recordar sus preferencias</li>
                <li>Analizar el uso del servicio</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                Consulte nuestra <a href="/legal/cookies" className="text-indigo-400 hover:underline">Política de Cookies</a> para más detalles.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">8. Transferencias Internacionales</h2>
              <p className="text-gray-300 leading-relaxed">
                Sus datos pueden ser transferidos y procesados en países fuera de su jurisdicción.
                Aseguramos que estas transferencias cumplan con las leyes de protección de datos aplicables,
                utilizando mecanismos como Cláusulas Contractuales Estándar.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">9. Menores de Edad</h2>
              <p className="text-gray-300 leading-relaxed">
                Nuestro servicio no está dirigido a menores de 18 años.
                No recopilamos intencionalmente información de menores.
                Si descubrimos que un menor nos ha proporcionado información, la eliminaremos de inmediato.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">10. Cambios a esta Política</h2>
              <p className="text-gray-300 leading-relaxed">
                Podemos actualizar esta política ocasionalmente. Le notificaremos sobre cambios significativos
                mediante un aviso en nuestro sitio web o por correo electrónico.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">11. Contacto</h2>
              <p className="text-gray-300 leading-relaxed">
                Para preguntas sobre esta política de privacidad:
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
