export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="glass rounded-3xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-white mb-8">Política de Cookies</h1>

          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 mb-6">
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">¿Qué son las Cookies?</h2>
              <p className="text-gray-300 leading-relaxed">
                Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita un sitio web.
                Nos permiten recordar sus preferencias y mejorar su experiencia de usuario.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Cookies que Utilizamos</h2>

              <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-white mb-3">1. Cookies Estrictamente Necesarias</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Estas cookies son esenciales para el funcionamiento del sitio. No pueden desactivarse.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-gray-300">
                    <thead className="border-b border-gray-700">
                      <tr>
                        <th className="text-left py-2 px-4">Nombre</th>
                        <th className="text-left py-2 px-4">Propósito</th>
                        <th className="text-left py-2 px-4">Duración</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-700/50">
                        <td className="py-2 px-4 font-mono text-xs">accessToken</td>
                        <td className="py-2 px-4">Mantener su sesión activa</td>
                        <td className="py-2 px-4">8 horas</td>
                      </tr>
                      <tr className="border-b border-gray-700/50">
                        <td className="py-2 px-4 font-mono text-xs">refreshToken</td>
                        <td className="py-2 px-4">Renovar su sesión automáticamente</td>
                        <td className="py-2 px-4">30 días</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-white mb-3">2. Cookies de Funcionalidad</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Permiten recordar sus preferencias y configuraciones.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-gray-300">
                    <thead className="border-b border-gray-700">
                      <tr>
                        <th className="text-left py-2 px-4">Nombre</th>
                        <th className="text-left py-2 px-4">Propósito</th>
                        <th className="text-left py-2 px-4">Duración</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-700/50">
                        <td className="py-2 px-4 font-mono text-xs">auth-storage</td>
                        <td className="py-2 px-4">Guardar estado de autenticación (Zustand)</td>
                        <td className="py-2 px-4">Persistente</td>
                      </tr>
                      <tr className="border-b border-gray-700/50">
                        <td className="py-2 px-4 font-mono text-xs">theme</td>
                        <td className="py-2 px-4">Recordar preferencias de tema</td>
                        <td className="py-2 px-4">Persistente</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-white mb-3">3. Cookies de Terceros</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Algunas cookies son colocadas por servicios de terceros:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-gray-300">
                    <thead className="border-b border-gray-700">
                      <tr>
                        <th className="text-left py-2 px-4">Servicio</th>
                        <th className="text-left py-2 px-4">Propósito</th>
                        <th className="text-left py-2 px-4">Más información</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-700/50">
                        <td className="py-2 px-4">PayPal</td>
                        <td className="py-2 px-4">Procesar pagos de forma segura</td>
                        <td className="py-2 px-4">
                          <a href="https://www.paypal.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                            Política de PayPal
                          </a>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-700/50">
                        <td className="py-2 px-4">Meta (Facebook)</td>
                        <td className="py-2 px-4">OAuth para WhatsApp/Messenger/Instagram</td>
                        <td className="py-2 px-4">
                          <a href="https://www.facebook.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                            Política de Meta
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Almacenamiento Local (LocalStorage)</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Además de cookies, utilizamos el almacenamiento local del navegador para:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Guardar el estado de la aplicación (Zustand persist)</li>
                <li>Cachear datos del usuario para mejorar el rendimiento</li>
                <li>Recordar preferencias de la interfaz</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Cómo Gestionar las Cookies</h2>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">En su Navegador</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Puede configurar su navegador para rechazar cookies o alertarle cuando se envíen:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>
                  <strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies y otros datos de sitios
                </li>
                <li>
                  <strong>Firefox:</strong> Preferencias → Privacidad y seguridad → Cookies y datos del sitio
                </li>
                <li>
                  <strong>Safari:</strong> Preferencias → Privacidad → Gestionar datos de sitios web
                </li>
                <li>
                  <strong>Edge:</strong> Configuración → Cookies y permisos del sitio
                </li>
              </ul>

              <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-4 mt-6">
                <p className="text-amber-300 text-sm">
                  ⚠️ <strong>Advertencia:</strong> Bloquear las cookies estrictamente necesarias puede impedir el funcionamiento correcto del sitio,
                  especialmente las funciones de inicio de sesión y autenticación.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Cookies del Widget de Chat</h2>
              <p className="text-gray-300 leading-relaxed">
                Nuestro widget de chat embebido utiliza cookies mínimas para mantener la sesión de conversación.
                Estas cookies solo se almacenan mientras la página está abierta y se eliminan al cerrar el navegador.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Actualizaciones de esta Política</h2>
              <p className="text-gray-300 leading-relaxed">
                Podemos actualizar esta política de cookies ocasionalmente para reflejar cambios en las cookies que utilizamos
                o por razones operativas, legales o reglamentarias.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Contacto</h2>
              <p className="text-gray-300 leading-relaxed">
                Si tiene preguntas sobre nuestra política de cookies:
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
