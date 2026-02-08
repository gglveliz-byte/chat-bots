'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Save,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Info,
  RefreshCw,
  Send
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface TelegramConfig {
  bot_token: string;
  bot_username: string;
  webhook_url: string;
}

export default function TelegramConfigPage() {
  const [config, setConfig] = useState<TelegramConfig>({
    bot_token: '',
    bot_username: '',
    webhook_url: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getTelegramConfig();
      if (response.data?.data) {
        setConfig(response.data.data);
      }
    } catch (error) {
      console.error('Error loading Telegram config:', error);
      toast.error('Error al cargar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await adminApi.updateTelegramConfig(config);
      toast.success('Configuración de Telegram guardada correctamente');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al guardar configuración');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (key: keyof TelegramConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      const response = await adminApi.testTelegramConnection();
      if (response.data?.success) {
        const botInfo = response.data.data?.bot;
        toast.success(`Conexión exitosa! Bot: @${botInfo?.username}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al probar la conexión');
    } finally {
      setIsTestingConnection(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Send className="w-7 h-7 text-[#0088CC]" />
          Configuración de Telegram
        </h1>
        <p className="text-dark-400 mt-1">
          Configura el bot de Telegram para todos tus clientes
        </p>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-300 font-medium mb-2">
              Configuración Centralizada
            </p>
            <p className="text-sm text-dark-300 mb-2">
              Este bot será usado por TODOS tus clientes. Cada cliente solo necesitará proporcionar su chat ID o vincularse al bot para comenzar a usar el servicio.
            </p>
            <div className="text-xs text-dark-400 space-y-1">
              <p>• Crea tu bot con <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">@BotFather</a> en Telegram</p>
              <p>• Usa /newbot para crear un nuevo bot</p>
              <p>• Guarda el token que te proporciona BotFather</p>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl glass"
      >
        <div className="flex items-start gap-3 mb-6">
          <Send className="w-6 h-6 flex-shrink-0 text-[#0088CC]" />
          <div>
            <h2 className="text-xl font-semibold text-white">Credenciales del Bot</h2>
            <p className="text-dark-400 text-sm mt-1">Configura tu bot de Telegram</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Bot Token */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Bot Token
              <span className="text-red-400 ml-1">*</span>
            </label>
            <p className="text-xs text-dark-500 mb-2">
              Token proporcionado por @BotFather (ej: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz)
            </p>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={config.bot_token || ''}
                onChange={(e) => handleFieldChange('bot_token', e.target.value)}
                placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white placeholder-dark-500 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-dark-700 rounded-lg transition-colors"
              >
                {showToken ? (
                  <EyeOff className="w-4 h-4 text-dark-400" />
                ) : (
                  <Eye className="w-4 h-4 text-dark-400" />
                )}
              </button>
            </div>
          </div>

          {/* Bot Username */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Bot Username (opcional)
            </label>
            <p className="text-xs text-dark-500 mb-2">
              Nombre de usuario del bot (ej: MiChatBot)
            </p>
            <input
              type="text"
              value={config.bot_username || ''}
              onChange={(e) => handleFieldChange('bot_username', e.target.value)}
              placeholder="MiChatBot"
              className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white placeholder-dark-500"
            />
          </div>

          {/* Webhook URL */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Webhook URL (opcional)
            </label>
            <p className="text-xs text-dark-500 mb-2">
              URL donde Telegram enviará las actualizaciones. Se configurará automáticamente al probar la conexión.
            </p>
            <input
              type="text"
              value={config.webhook_url || ''}
              onChange={(e) => handleFieldChange('webhook_url', e.target.value)}
              placeholder="https://tudominio.com/api/v1/webhook/telegram"
              className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white placeholder-dark-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-6 border-t border-dark-700">
        <button
          onClick={testConnection}
          disabled={isTestingConnection || !config.bot_token}
          className="px-6 py-3 rounded-xl bg-dark-800 border border-dark-700 text-white font-semibold flex items-center gap-2 hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTestingConnection ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Probando...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              Probar Conexión
            </>
          )}
        </button>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Guardar Configuración
            </>
          )}
        </button>
      </div>

      {/* Instructions */}
      <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-300 font-medium mb-2">
              Instrucciones de configuración
            </p>
            <ol className="text-sm text-dark-300 space-y-1 list-decimal list-inside">
              <li>Abre Telegram y busca <span className="text-primary-400">@BotFather</span></li>
              <li>Envía el comando <span className="text-primary-400">/newbot</span></li>
              <li>Sigue las instrucciones para crear tu bot</li>
              <li>Copia el token que te proporciona y pégalo aquí</li>
              <li>Guarda y prueba la conexión</li>
              <li>Tus clientes podrán vincular sus chats con el bot</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
