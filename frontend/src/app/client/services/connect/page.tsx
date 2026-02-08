'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2, Unlink, CheckCircle, AlertTriangle, Clock, Loader2,
  RefreshCw, ChevronDown, ExternalLink, Shield, Wifi, WifiOff,
  MessageCircle, Send, Instagram, Globe, Settings
} from 'lucide-react';
import { oauthApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface PlatformInfo {
  code: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  oauthSupported: boolean;
}

const platforms: PlatformInfo[] = [
  {
    code: 'whatsapp',
    name: 'WhatsApp Business',
    icon: '📱',
    color: '#25D366',
    description: 'Conecta tu cuenta de WhatsApp Business para enviar y recibir mensajes automáticos.',
    oauthSupported: true,
  },
  {
    code: 'messenger',
    name: 'Facebook Messenger',
    icon: '💬',
    color: '#0084FF',
    description: 'Conecta tu página de Facebook para responder automáticamente en Messenger.',
    oauthSupported: true,
  },
  {
    code: 'instagram',
    name: 'Instagram DMs',
    icon: '📸',
    color: '#E4405F',
    description: 'Conecta tu cuenta empresarial de Instagram para gestionar DMs con IA.',
    oauthSupported: true,
  },
  {
    code: 'webchat',
    name: 'Web Chat',
    icon: '🌐',
    color: '#6366F1',
    description: 'Widget de chat para tu sitio web. No requiere conexión externa.',
    oauthSupported: false,
  },
];

interface ConnectionInfo {
  connected: boolean;
  tokenStatus: string;
  tokenValid: boolean;
  tokenExpiresAt: string | null;
  serviceStatus: string;
  credentials: {
    page_name?: string;
    waba_name?: string;
    display_phone?: string;
    verified_name?: string;
    instagram_username?: string;
    webhook_subscribed?: boolean;
  };
  connectedAt?: string;
}

interface AccountOption {
  id: string;
  name: string;
  verifiedName?: string;
  category?: string;
  instagram?: string;
  selected: boolean;
}

export default function ConnectPage() {
  const searchParams = useSearchParams();
  const callbackStatus = searchParams.get('status');
  const callbackService = searchParams.get('service');
  const callbackName = searchParams.get('name');
  const callbackReason = searchParams.get('reason');

  const [connections, setConnections] = useState<Record<string, ConnectionInfo | null>>({});
  const [accounts, setAccounts] = useState<Record<string, AccountOption[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const [showAccountSelector, setShowAccountSelector] = useState<string | null>(null);

  // Manejar callback de OAuth
  useEffect(() => {
    if (callbackStatus === 'success') {
      toast.success(`¡${callbackName || callbackService} conectado exitosamente!`);
      loadAllConnections();
    } else if (callbackStatus === 'denied') {
      toast.error('Conexión cancelada. No se otorgaron los permisos necesarios.');
    } else if (callbackStatus === 'error') {
      toast.error(`Error al conectar: ${callbackReason || 'Intenta de nuevo'}`);
    }
  }, [callbackStatus]);

  useEffect(() => {
    loadAllConnections();
  }, []);

  const loadAllConnections = async () => {
    setInitialLoading(true);
    const results: Record<string, ConnectionInfo | null> = {};

    await Promise.all(
      platforms.filter(p => p.oauthSupported).map(async (p) => {
        try {
          const res = await oauthApi.getStatus(p.code);
          results[p.code] = res.data.data;
        } catch {
          results[p.code] = null;
        }
      })
    );

    setConnections(results);
    setInitialLoading(false);
  };

  const handleConnect = async (serviceCode: string) => {
    setLoading(prev => ({ ...prev, [serviceCode]: true }));
    try {
      const res = await oauthApi.startOAuth(serviceCode);
      const { authUrl } = res.data.data;
      // Redirigir a Facebook Login
      window.location.href = authUrl;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al iniciar conexión');
      setLoading(prev => ({ ...prev, [serviceCode]: false }));
    }
  };

  const handleDisconnect = async (serviceCode: string) => {
    if (!confirm('¿Seguro que quieres desconectar esta cuenta? Los bots dejarán de funcionar.')) return;

    setLoading(prev => ({ ...prev, [serviceCode]: true }));
    try {
      await oauthApi.disconnect(serviceCode);
      toast.success('Cuenta desconectada');
      loadAllConnections();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al desconectar');
    } finally {
      setLoading(prev => ({ ...prev, [serviceCode]: false }));
    }
  };

  const loadAccounts = async (serviceCode: string) => {
    try {
      const res = await oauthApi.getAvailableAccounts(serviceCode);
      setAccounts(prev => ({ ...prev, [serviceCode]: res.data.data.accounts }));
      setShowAccountSelector(serviceCode);
    } catch {
      toast.error('Error cargando cuentas');
    }
  };

  const selectAccount = async (serviceCode: string, accountId: string) => {
    try {
      await oauthApi.selectAccount(serviceCode, accountId);
      toast.success('Cuenta actualizada');
      loadAllConnections();
      setShowAccountSelector(null);
    } catch {
      toast.error('Error cambiando cuenta');
    }
  };

  const getStatusBadge = (conn: ConnectionInfo | null) => {
    if (!conn || !conn.connected) {
      return { text: 'Desconectado', color: 'text-gray-400', bg: 'bg-gray-500/10', icon: WifiOff };
    }
    switch (conn.tokenStatus) {
      case 'active':
        return { text: 'Conectado', color: 'text-green-400', bg: 'bg-green-500/10', icon: CheckCircle };
      case 'expiring_soon':
        return { text: 'Por expirar', color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: Clock };
      case 'expired':
      case 'refresh_failed':
        return { text: 'Reconectar', color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertTriangle };
      default:
        return { text: 'Conectado', color: 'text-green-400', bg: 'bg-green-500/10', icon: CheckCircle };
    }
  };

  const formatExpiration = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Expirado';
    if (diffDays === 0) return 'Expira hoy';
    if (diffDays === 1) return 'Expira mañana';
    return `Expira en ${diffDays} días`;
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3 text-white">
          <Link2 className="w-7 h-7 text-indigo-400" />
          Conectar Plataformas
        </h1>
        <p className="text-gray-400 mt-1">
          Conecta tus cuentas para activar los bots automáticos
        </p>
      </div>

      {/* Info */}
      <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-indigo-300 font-medium text-sm">Conexión segura con Facebook Login</p>
            <p className="text-xs text-gray-400 mt-1">
              Utilizamos OAuth oficial de Meta. No almacenamos tu contraseña. Solo necesitamos permisos de mensajería para que el bot funcione.
            </p>
          </div>
        </div>
      </div>

      {/* Platform Cards */}
      <div className="space-y-4">
        {platforms.map((platform) => {
          const conn = connections[platform.code];
          const status = getStatusBadge(conn);
          const StatusIcon = status.icon;
          const isLoading = loading[platform.code];
          const isExpanded = expandedPlatform === platform.code;
          const isConnected = conn?.connected;

          return (
            <motion.div
              key={platform.code}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/5 overflow-hidden"
              style={{ backgroundColor: 'rgba(30,41,59,0.5)' }}
            >
              {/* Main Row */}
              <div
                className="p-5 flex items-center gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() => platform.oauthSupported && setExpandedPlatform(isExpanded ? null : platform.code)}
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ backgroundColor: `${platform.color}15` }}>
                  {platform.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-white">{platform.name}</h3>
                    {platform.oauthSupported && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${status.bg} ${status.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.text}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isConnected && conn?.credentials
                      ? (conn.credentials.display_phone || conn.credentials.page_name || conn.credentials.instagram_username || conn.credentials.verified_name)
                      : platform.description
                    }
                  </p>
                  {isConnected && conn?.tokenExpiresAt && (
                    <p className="text-xs text-gray-600 mt-0.5">{formatExpiration(conn.tokenExpiresAt)}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {platform.oauthSupported ? (
                    <>
                      {isConnected ? (
                        <Link
                          href={`/client/services/${platform.code}`}
                          className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors"
                          style={{ backgroundColor: `${platform.color}30`, color: platform.color }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Ir al Panel
                        </Link>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleConnect(platform.code); }}
                          disabled={isLoading}
                          className="px-4 py-2 rounded-xl text-sm font-medium text-white flex items-center gap-2 disabled:opacity-50"
                          style={{ backgroundColor: platform.color }}
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Link2 className="w-4 h-4" />
                          )}
                          Conectar
                        </button>
                      )}
                      <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </>
                  ) : (
                    <Link
                      href={`/client/services/${platform.code}`}
                      className="px-4 py-2 rounded-xl text-sm font-medium bg-white/5 text-gray-300 hover:bg-white/10 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Configurar
                    </Link>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {isExpanded && platform.oauthSupported && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-0 border-t border-white/5">
                      <div className="pt-4 space-y-3">
                        {isConnected ? (
                          <>
                            {/* Connection Details */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 rounded-xl bg-white/[0.03]">
                                <p className="text-xs text-gray-500 mb-0.5">Estado</p>
                                <p className={`text-sm font-medium ${status.color}`}>{status.text}</p>
                              </div>
                              <div className="p-3 rounded-xl bg-white/[0.03]">
                                <p className="text-xs text-gray-500 mb-0.5">Webhooks</p>
                                <p className="text-sm font-medium text-gray-300">
                                  {conn?.credentials?.webhook_subscribed ? '✅ Activos' : '⚠️ Pendiente'}
                                </p>
                              </div>
                              {conn?.connectedAt && (
                                <div className="p-3 rounded-xl bg-white/[0.03]">
                                  <p className="text-xs text-gray-500 mb-0.5">Conectado desde</p>
                                  <p className="text-sm font-medium text-gray-300">
                                    {new Date(conn.connectedAt).toLocaleDateString('es')}
                                  </p>
                                </div>
                              )}
                              {conn?.tokenExpiresAt && (
                                <div className="p-3 rounded-xl bg-white/[0.03]">
                                  <p className="text-xs text-gray-500 mb-0.5">Token expira</p>
                                  <p className="text-sm font-medium text-gray-300">
                                    {formatExpiration(conn.tokenExpiresAt)}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Account Selector */}
                            {showAccountSelector === platform.code && accounts[platform.code] && (
                              <div className="p-3 rounded-xl bg-white/[0.03] space-y-2">
                                <p className="text-xs text-gray-500 font-medium">Seleccionar cuenta:</p>
                                {accounts[platform.code].map(acc => (
                                  <button
                                    key={acc.id}
                                    onClick={() => selectAccount(platform.code, acc.id)}
                                    className={`w-full text-left p-2.5 rounded-lg text-sm transition-colors ${
                                      acc.selected ? 'bg-white/10 border border-white/10' : 'hover:bg-white/5'
                                    }`}
                                  >
                                    <span className="text-white font-medium">{acc.name}</span>
                                    {acc.selected && <span className="ml-2 text-green-400 text-xs">✓ Activa</span>}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => loadAccounts(platform.code)}
                                className="px-3 py-2 rounded-xl text-xs font-medium bg-white/5 text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-1.5"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Cambiar cuenta
                              </button>
                              <button
                                onClick={() => handleConnect(platform.code)}
                                disabled={isLoading}
                                className="px-3 py-2 rounded-xl text-xs font-medium bg-white/5 text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-1.5"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Reconectar
                              </button>
                              <button
                                onClick={() => handleDisconnect(platform.code)}
                                disabled={isLoading}
                                className="px-3 py-2 rounded-xl text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-1.5 ml-auto"
                              >
                                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlink className="w-3.5 h-3.5" />}
                                Desconectar
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-sm text-gray-400 mb-4">
                              Haz clic en &quot;Conectar&quot; para vincular tu cuenta con Facebook Login.
                              Se abrirá una ventana de Meta donde autorizarás los permisos necesarios.
                            </p>
                            <button
                              onClick={() => handleConnect(platform.code)}
                              disabled={isLoading}
                              className="px-6 py-3 rounded-xl text-sm font-semibold text-white flex items-center gap-2 mx-auto disabled:opacity-50"
                              style={{ backgroundColor: platform.color }}
                            >
                              {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Link2 className="w-5 h-5" />
                              )}
                              Conectar con Facebook
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
