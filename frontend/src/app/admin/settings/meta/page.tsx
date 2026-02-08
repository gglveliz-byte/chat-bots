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
  RefreshCw
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface MetaConfig {
  meta_app_id: string;
  meta_app_secret: string;
  meta_verify_token: string;
}

export default function MetaConfigPage() {
  const [config, setConfig] = useState<MetaConfig>({
    meta_app_id: '',
    meta_app_secret: '',
    meta_verify_token: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getMetaConfig();
      if (response.data?.data) {
        const data = response.data.data;
        setConfig({
          meta_app_id: data.meta_app_id || '',
          meta_app_secret: data.meta_app_secret || '',
          meta_verify_token: data.meta_verify_token || '',
        });
      }
    } catch (error) {
      console.error('Error loading Meta config:', error);
      toast.error('Error al cargar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await adminApi.updateMetaConfig(config as any);
      toast.success('Configuración de Meta API guardada correctamente');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al guardar configuración');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (key: keyof MetaConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const togglePasswordVisibility = (fieldKey: string) => {
    setShowPasswords(prev => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      const response = await adminApi.testMetaConnection();
      if (response.data?.success) {
        toast.success('Conexión exitosa con Meta API');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al probar la conexión');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const fields = [
    {
      key: 'meta_app_id' as keyof MetaConfig,
      label: 'Meta App ID',
      type: 'text',
      placeholder: '123456789012345',
      required: true,
      description: 'ID de tu aplicación en Meta for Developers'
    },
    {
      key: 'meta_app_secret' as keyof MetaConfig,
      label: 'Meta App Secret',
      type: 'password',
      placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxx',
      required: true,
      description: 'Secreto de tu aplicación (Settings → Basic)'
    },
    {
      key: 'meta_verify_token' as keyof MetaConfig,
      label: 'Webhook Verify Token',
      type: 'password',
      placeholder: 'chatbot_saas_verify_token',
      required: true,
      description: 'Token personalizado para verificar webhooks'
    }
  ];

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
          <Settings className="w-7 h-7 text-primary-400" />
          Configuración de Meta API
        </h1>
        <p className="text-dark-400 mt-1">
          Credenciales globales de tu aplicación Meta para WhatsApp, Messenger e Instagram
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
            <p className="text-sm text-dark-300">
              Estas son las credenciales GLOBALES de tu aplicación Meta. Los clientes conectan sus propias cuentas de WhatsApp, Messenger e Instagram
              automáticamente via <strong className="text-blue-300">Facebook Login (OAuth)</strong> desde su panel de control.
              No es necesario configurar tokens individuales por plataforma.
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Fields */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl glass"
      >
        <div className="flex items-start gap-3 mb-6">
          <Settings className="w-6 h-6 flex-shrink-0 text-[#1877F2]" />
          <div>
            <h2 className="text-xl font-semibold text-white">Credenciales de la Aplicación</h2>
            <p className="text-dark-400 text-sm mt-1">Credenciales principales de tu aplicación en Meta for Developers</p>
          </div>
        </div>

        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </label>
              {field.description && (
                <p className="text-xs text-dark-500 mb-2">{field.description}</p>
              )}
              <div className="relative">
                <input
                  type={field.type === 'password' && !showPasswords[field.key] ? 'password' : 'text'}
                  value={config[field.key] || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white placeholder-dark-500 pr-12"
                  required={field.required}
                />
                {field.type === 'password' && (
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility(field.key)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-dark-700 rounded-lg transition-colors"
                  >
                    {showPasswords[field.key] ? (
                      <EyeOff className="w-4 h-4 text-dark-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-dark-400" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-6 border-t border-dark-700">
        <button
          onClick={testConnection}
          disabled={isTestingConnection || !config.meta_app_id}
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

      {/* Setup Instructions */}
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">1</div>
            <div className="flex-1">
              <p className="text-blue-300 font-medium mb-2">
                Crear Aplicación en Meta for Developers
              </p>
              <ul className="text-sm text-dark-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Ve a <a href="https://developers.facebook.com/apps/create/" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline font-medium">Meta for Developers - Crear App</a></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Selecciona tipo: <strong className="text-white">"Business"</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Agrega productos: <strong className="text-white">WhatsApp</strong>, <strong className="text-white">Messenger</strong>, <strong className="text-white">Instagram</strong></span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">2</div>
            <div className="flex-1">
              <p className="text-purple-300 font-medium mb-2">
                Obtener App ID y App Secret
              </p>
              <ul className="text-sm text-dark-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span>En tu aplicación, ve a <strong className="text-white">Settings → Basic</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span>Copia el <strong className="text-white">App ID</strong> y <strong className="text-white">App Secret</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span>Inventa un <strong className="text-white">Verify Token</strong> seguro (ej: chatbot_saas_2024)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">3</div>
            <div className="flex-1">
              <p className="text-green-300 font-medium mb-2">
                Los clientes se conectan solos
              </p>
              <ul className="text-sm text-dark-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span>Los clientes conectan sus cuentas via <strong className="text-white">OAuth (Facebook Login)</strong> desde su panel</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span>Los tokens se generan y renuevan <strong className="text-white">automáticamente</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span>No es necesario configurar tokens individuales por cliente o plataforma</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-300 font-medium mb-2">
                Importante
              </p>
              <ul className="text-sm text-dark-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  <span>Estas 3 credenciales son <strong className="text-white">globales</strong> para toda la plataforma</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  <span>Sin ellas, los clientes no podrán conectar sus cuentas via OAuth</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  <span>Guarda y prueba la conexión antes de activar servicios</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
