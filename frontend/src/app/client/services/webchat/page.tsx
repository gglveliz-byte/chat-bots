'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Copy, Check, X, Loader2, ExternalLink } from 'lucide-react';
import ChatPanel from '@/components/chat/ChatPanel';
import { clientApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function WebChatPanel() {
  const [showEmbed, setShowEmbed] = useState(false);
  const [clientServiceId, setClientServiceId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';
  const frontendUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  useEffect(() => {
    loadServiceInfo();
  }, []);

  const loadServiceInfo = async () => {
    try {
      const res = await clientApi.getServiceDetail('webchat');
      if (res.data?.data?.service) {
        setClientServiceId(res.data.data.service.id);
      }
    } catch (error) {
      console.error('Error loading webchat service:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const embedCode = `<script
  src="${frontendUrl}/widget/loader.js"
  data-chatbot-id="${clientServiceId}"
  data-api-url="${backendUrl}/api/v1"
  data-widget-url="${frontendUrl}/widget/chat-widget.js"
  async>
</script>`;

  const copyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success('Codigo copiado al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      {/* Info Banner */}
      <div className="mb-3 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Code className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-indigo-300 mb-1">Integra el chat en tu sitio web</h4>
            <p className="text-xs text-dark-300">
              Haz clic en <strong className="text-white">Codigo embed</strong> para obtener el script. Solo pega el codigo en tu pagina web antes de <code className="text-indigo-400 text-[11px]">{'</body>'}</code> y el widget aparecera automaticamente.
            </p>
          </div>
        </div>
      </div>

      {/* Embed Code Floating Button */}
      <button
        onClick={() => setShowEmbed(!showEmbed)}
        className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-medium flex items-center gap-1.5 hover:bg-indigo-500/30 transition-colors"
      >
        <Code className="w-3.5 h-3.5" />
        Codigo embed
      </button>

      {/* Embed Code Modal */}
      <AnimatePresence>
        {showEmbed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            onClick={() => setShowEmbed(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-2xl p-6 rounded-2xl bg-dark-800 border border-dark-700"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Code className="w-5 h-5 text-indigo-400" />
                  Codigo de Integracion - WebChat
                </h3>
                <button onClick={() => setShowEmbed(false)} className="p-1 rounded-lg hover:bg-dark-700">
                  <X className="w-5 h-5 text-dark-400" />
                </button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
                </div>
              ) : !clientServiceId ? (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  No se encontro tu servicio de WebChat. Asegurate de tener el servicio activo.
                </div>
              ) : (
                <>
                  <p className="text-dark-400 text-sm mb-4">
                    Copia este codigo y pegalo antes de <code className="text-indigo-400">{'</body>'}</code> en tu sitio web. El widget aparecera automaticamente.
                  </p>

                  <div className="relative">
                    <pre className="text-sm text-green-400 bg-dark-900 rounded-xl p-4 overflow-x-auto font-mono leading-relaxed border border-dark-700">
                      {embedCode}
                    </pre>
                    <button
                      onClick={copyCode}
                      className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-medium flex items-center gap-1.5 hover:bg-indigo-500/30 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copiar
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                    <p className="text-indigo-300 text-xs">
                      Este codigo es unico para tu negocio. Cualquier visitante de tu sitio web podra chatear contigo a traves del widget.
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <ChatPanel platform="webchat" connectionStatus={null} />
    </div>
  );
}
