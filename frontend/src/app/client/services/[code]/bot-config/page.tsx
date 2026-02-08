'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Settings,
  MessageSquare,
  Clock,
  Brain,
  Save,
  Loader2,
  Info,
  ArrowLeft,
  Sparkles,
  Languages
} from 'lucide-react';
import { serviceApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface BotConfig {
  welcome_message: string;
  away_message: string;
  fallback_message: string;
  personality: 'friendly' | 'professional' | 'casual' | 'formal';
  language: string;
  business_hours: {
    enabled: boolean;
    timezone: string;
    schedule: {
      [key: string]: { open: string; close: string; enabled: boolean };
    };
  };
  ai_config: {
    model: string;
    temperature: number;
    max_tokens: number;
  };
}

const defaultConfig: BotConfig = {
  welcome_message: '¡Hola! 👋 Gracias por contactarnos. ¿En qué puedo ayudarte hoy?',
  away_message: 'Actualmente estamos fuera del horario de atención. Te responderemos lo antes posible.',
  fallback_message: 'Disculpa, no entendí tu mensaje. ¿Podrías reformularlo o ser más específico?',
  personality: 'friendly',
  language: 'es',
  business_hours: {
    enabled: false,
    timezone: 'America/Bogota',
    schedule: {
      monday: { open: '09:00', close: '18:00', enabled: true },
      tuesday: { open: '09:00', close: '18:00', enabled: true },
      wednesday: { open: '09:00', close: '18:00', enabled: true },
      thursday: { open: '09:00', close: '18:00', enabled: true },
      friday: { open: '09:00', close: '18:00', enabled: true },
      saturday: { open: '10:00', close: '14:00', enabled: false },
      sunday: { open: '10:00', close: '14:00', enabled: false }
    }
  },
  ai_config: {
    model: 'gpt-4o-mini',
    temperature: 0.7,
    max_tokens: 500
  }
};

const personalities = [
  { value: 'friendly', label: 'Amigable', description: 'Cálido y acogedor, ideal para negocios casuales' },
  { value: 'professional', label: 'Profesional', description: 'Cortés y eficiente, perfecto para servicios corporativos' },
  { value: 'casual', label: 'Casual', description: 'Relajado y cercano, genial para marcas juveniles' },
  { value: 'formal', label: 'Formal', description: 'Serio y respetuoso, adecuado para servicios legales o financieros' }
];

const languages = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'pt', label: 'Português' }
];

const daysOfWeek = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' }
];

export default function BotConfigPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [config, setConfig] = useState<BotConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, [code]);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const response = await serviceApi.getBotConfig(code);
      const savedConfig = response.data?.data?.config;

      if (savedConfig) {
        const businessHours = savedConfig.business_hours || {};
        const mergedBusinessHours = {
          enabled: businessHours.enabled || false,
          timezone: businessHours.timezone || defaultConfig.business_hours.timezone,
          schedule: businessHours.schedule || defaultConfig.business_hours.schedule
        };

        setConfig({
          welcome_message: savedConfig.welcome_message || defaultConfig.welcome_message,
          away_message: savedConfig.away_message || defaultConfig.away_message,
          fallback_message: savedConfig.fallback_message || defaultConfig.fallback_message,
          personality: savedConfig.personality || defaultConfig.personality,
          language: savedConfig.language || defaultConfig.language,
          business_hours: mergedBusinessHours,
          ai_config: savedConfig.ai_config || defaultConfig.ai_config
        });
      }
    } catch (error) {
      console.error('Error loading config:', error);
      toast.error('Error al cargar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await serviceApi.updateBotConfig(code, { config });
      toast.success('Configuración del bot guardada correctamente');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al guardar configuración');
    } finally {
      setIsSaving(false);
    }
  };

  const updateBusinessHours = (day: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      business_hours: {
        ...prev.business_hours,
        schedule: {
          ...prev.business_hours.schedule,
          [day]: {
            ...prev.business_hours.schedule[day],
            [field]: value
          }
        }
      }
    }));
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
      <div className="flex items-center gap-4">
        <Link
          href={`/client/services/${code}`}
          className="p-2 rounded-xl hover:bg-dark-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Settings className="w-7 h-7 text-primary-400" />
            Configuración del Bot
          </h1>
          <p className="text-dark-400 mt-1">
            Personaliza el comportamiento y mensajes de tu asistente virtual
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-300 font-medium mb-1">
              Configura tu asistente inteligente
            </p>
            <p className="text-sm text-dark-300">
              Estos ajustes determinan cómo tu bot responderá a tus clientes. La IA utilizará la información de tu negocio y los archivos que subas en "Mi Negocio" para personalizar las respuestas.
            </p>
          </div>
        </div>
      </div>

      {/* Message Templates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl glass"
      >
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-6 h-6 text-primary-400" />
          <div>
            <h2 className="text-xl font-semibold text-white">Mensajes Predefinidos</h2>
            <p className="text-dark-400 text-sm">Configura los mensajes automáticos</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Welcome Message */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Mensaje de Bienvenida
            </label>
            <p className="text-xs text-dark-500 mb-2">
              Primer mensaje que recibirán tus clientes al iniciar una conversación
            </p>
            <textarea
              value={config.welcome_message}
              onChange={(e) => setConfig({ ...config, welcome_message: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white placeholder-dark-500"
              placeholder="¡Hola! ¿En qué puedo ayudarte?"
            />
          </div>

          {/* Away Message */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Mensaje Fuera de Horario
            </label>
            <p className="text-xs text-dark-500 mb-2">
              Mensaje automático cuando contacten fuera del horario de atención
            </p>
            <textarea
              value={config.away_message}
              onChange={(e) => setConfig({ ...config, away_message: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white placeholder-dark-500"
              placeholder="Estamos fuera de horario..."
            />
          </div>

          {/* Fallback Message */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Mensaje de Respaldo
            </label>
            <p className="text-xs text-dark-500 mb-2">
              Respuesta cuando el bot no comprende la consulta
            </p>
            <textarea
              value={config.fallback_message}
              onChange={(e) => setConfig({ ...config, fallback_message: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white placeholder-dark-500"
              placeholder="No entendí tu mensaje..."
            />
          </div>
        </div>
      </motion.div>

      {/* Personality & Language */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl glass"
      >
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-6 h-6 text-secondary-400" />
          <div>
            <h2 className="text-xl font-semibold text-white">Personalidad e Idioma</h2>
            <p className="text-dark-400 text-sm">Define el tono y estilo de tu bot</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Personality */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-3">
              <Sparkles className="w-4 h-4 inline mr-2" />
              Personalidad
            </label>
            <div className="space-y-3">
              {personalities.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setConfig({ ...config, personality: p.value as any })}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    config.personality === p.value
                      ? 'bg-primary-500/20 border-2 border-primary-500'
                      : 'bg-dark-800/50 border-2 border-dark-700 hover:border-dark-600'
                  }`}
                >
                  <div className="font-medium text-white">{p.label}</div>
                  <div className="text-xs text-dark-400 mt-1">{p.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-3">
              <Languages className="w-4 h-4 inline mr-2" />
              Idioma
            </label>
            <div className="space-y-3">
              {languages.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => setConfig({ ...config, language: lang.value })}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    config.language === lang.value
                      ? 'bg-secondary-500/20 border-2 border-secondary-500'
                      : 'bg-dark-800/50 border-2 border-dark-700 hover:border-dark-600'
                  }`}
                >
                  <div className="font-medium text-white">{lang.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Business Hours */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-2xl glass"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-green-400" />
            <div>
              <h2 className="text-xl font-semibold text-white">Horario de Atención</h2>
              <p className="text-dark-400 text-sm">Define cuándo el bot está disponible</p>
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <span className="text-sm text-dark-300">Activar horario</span>
            <input
              type="checkbox"
              checked={config.business_hours.enabled}
              onChange={(e) => setConfig({
                ...config,
                business_hours: { ...config.business_hours, enabled: e.target.checked }
              })}
              className="w-5 h-5 rounded bg-dark-800 border-dark-700 text-primary-500 focus:ring-primary-500"
            />
          </label>
        </div>

        {config.business_hours.enabled && (
          <div className="space-y-3">
            {daysOfWeek.map((day) => {
              const schedule = config.business_hours.schedule[day.key];
              return (
                <div key={day.key} className="flex items-center gap-4 p-4 rounded-xl bg-dark-800/50">
                  <input
                    type="checkbox"
                    checked={schedule.enabled}
                    onChange={(e) => updateBusinessHours(day.key, 'enabled', e.target.checked)}
                    className="w-5 h-5 rounded bg-dark-800 border-dark-700 text-primary-500"
                  />
                  <div className="w-24 font-medium text-white">{day.label}</div>
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="time"
                      value={schedule.open}
                      onChange={(e) => updateBusinessHours(day.key, 'open', e.target.value)}
                      disabled={!schedule.enabled}
                      className="px-3 py-2 rounded-lg bg-dark-800 border border-dark-700 text-white disabled:opacity-50"
                    />
                    <span className="text-dark-400">a</span>
                    <input
                      type="time"
                      value={schedule.close}
                      onChange={(e) => updateBusinessHours(day.key, 'close', e.target.value)}
                      disabled={!schedule.enabled}
                      className="px-3 py-2 rounded-lg bg-dark-800 border border-dark-700 text-white disabled:opacity-50"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t border-dark-700">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold flex items-center gap-2 disabled:opacity-50"
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
    </div>
  );
}
