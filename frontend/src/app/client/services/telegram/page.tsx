'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Link2,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  ExternalLink,
  Share2,
  QrCode
} from 'lucide-react';
import ChatPanel from '@/components/chat/ChatPanel';
import { serviceApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface TelegramData {
  configured: boolean;
  bot_username: string | null;
  bot_first_name: string | null;
  bot_link: string | null;
  client_service_id?: string;
  message?: string;
}

export default function TelegramPanel() {
  const [data, setData] = useState<TelegramData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const res = await serviceApi.getTelegramStatus('telegram');
      setData(res.data?.data || null);
    } catch (error) {
      console.error('Error loading telegram status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyBotLink = () => {
    if (data?.bot_link) {
      navigator.clipboard.writeText(data.bot_link);
      setCopied(true);
      toast.success('Link copiado al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareBotLink = () => {
    if (data?.bot_link && navigator.share) {
      navigator.share({
        title: `Chatea con nosotros en Telegram`,
        text: `Escribenos por Telegram a traves de @${data.bot_username}`,
        url: data.bot_link
      });
    } else if (data?.bot_link) {
      copyBotLink();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  // Si Telegram no esta configurado por el admin
  if (!data?.configured) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center p-8 rounded-2xl glass max-w-md">
          <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Telegram no disponible</h3>
          <p className="text-dark-400 text-sm">
            {data?.message || 'El servicio de Telegram aun no esta configurado. Contacta al administrador.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-[#0088cc]/5 border border-[#0088cc]/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0088cc]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Send className="w-4 h-4 text-[#0088cc]" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#0088cc] mb-1">Tu bot de Telegram está listo</h4>
            <p className="text-xs text-dark-300">
              Comparte el link de tu bot con tus clientes para que puedan iniciar una conversación. Solo necesitan hacer clic y presionar <strong className="text-white">Iniciar</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Bot Info & Link */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-6 rounded-2xl glass"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#0088cc]/20 flex items-center justify-center">
              <Send className="w-6 h-6 text-[#0088cc]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-lg">@{data.bot_username}</span>
                <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full">
                  <Check className="w-3 h-3" /> Activo
                </span>
              </div>
              <p className="text-dark-400 text-sm">{data.bot_first_name} - Tu asistente en Telegram</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={data.bot_link!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#0088cc] text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#0077b3] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir Bot
            </a>
            <button
              onClick={shareBotLink}
              className="px-4 py-2.5 rounded-xl bg-dark-700 text-dark-300 text-sm flex items-center gap-2 hover:bg-dark-600 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Compartir</span>
            </button>
          </div>
        </div>

        {/* Shareable Link */}
        <div className="mt-4 p-4 rounded-xl bg-dark-800/80 border border-dark-700">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs text-dark-400 font-medium uppercase tracking-wider">Link de tu bot</span>
            <button
              onClick={copyBotLink}
              className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                copied
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copiar
                </>
              )}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-[#0088cc] shrink-0" />
            <span className="text-sm text-[#0088cc] font-mono truncate">{data.bot_link}</span>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 p-3 rounded-xl bg-[#0088cc]/10 border border-[#0088cc]/20">
          <p className="text-[#0088cc]/80 text-xs leading-relaxed">
            Comparte este link con tus clientes. Cuando lo abran en Telegram, se conectaran directamente contigo y el bot de IA les atendera automaticamente. Puedes ver y responder todos los chats aqui abajo.
          </p>
        </div>
      </motion.div>

      {/* Chat Panel */}
      <ChatPanel platform="telegram" connectionStatus={null} />
    </div>
  );
}
