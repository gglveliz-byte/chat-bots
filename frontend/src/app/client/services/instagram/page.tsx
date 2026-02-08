'use client';

import { useState, useEffect } from 'react';
import { Info, AlertCircle, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import ChatPanel from '@/components/chat/ChatPanel';
import { oauthApi, serviceApi } from '@/lib/api';

export default function InstagramPanel() {
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [diagnostic, setDiagnostic] = useState<any>(null);
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      // Obtener status OAuth
      const statusRes = await oauthApi.getStatus('instagram');
      const data = statusRes.data.data;
      setConnectionStatus({
        connected: data.connected,
        tokenStatus: data.tokenStatus,
        accountName: data.credentials?.instagram_username,
      });

      // Obtener diagnóstico
      const diagRes = await serviceApi.getDiagnostic('instagram');
      setDiagnostic(diagRes.data.data);

      // Mostrar automáticamente si hay problemas
      if (diagRes.data.data.recommendations.some((r: any) => r.type === 'error' || r.type === 'warning')) {
        setShowDiagnostic(true);
      }
    } catch (error) {
      setConnectionStatus({ connected: false, tokenStatus: 'disconnected' });
    }
  };

  const isDisconnected = connectionStatus && !connectionStatus.connected;

  return (
    <div className="space-y-0">
      {isDisconnected && (
        <div className="mx-0 mb-3 p-4 rounded-xl bg-pink-500/5 border border-pink-500/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Info className="w-4 h-4 text-pink-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-pink-300 mb-1">Requisitos para conectar Instagram</h4>
              <ul className="text-xs text-dark-300 space-y-1">
                <li>1. Tu cuenta de Instagram debe ser <strong className="text-white">Profesional</strong> (negocio o creador)</li>
                <li>2. Debe estar vinculada a una <strong className="text-white">Página de Facebook</strong> en <strong className="text-white">Meta Business Suite</strong></li>
                <li>3. Conecta desde la sección de <a href="/client/services/connect" className="text-pink-400 underline hover:text-pink-300">Vincular Cuentas</a></li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {diagnostic && (
        <div className="mx-0 mb-3">
          <button
            onClick={() => setShowDiagnostic(!showDiagnostic)}
            className="w-full text-left p-3 rounded-lg bg-dark-800/50 border border-dark-700 hover:bg-dark-800 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-pink-400" />
              <span className="text-sm font-medium text-white">Diagnóstico de Instagram</span>
            </div>
            <span className="text-xs text-dark-400">
              {showDiagnostic ? 'Ocultar' : 'Ver detalles'}
            </span>
          </button>

          {showDiagnostic && (
            <div className="mt-3 p-4 rounded-lg bg-dark-800/30 border border-dark-700 space-y-4">
              {/* Recomendaciones */}
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-dark-300 uppercase">Estado</h5>
                {diagnostic.recommendations.map((rec: any, idx: number) => (
                  <div key={idx} className={`flex items-start gap-2 p-3 rounded-lg ${
                    rec.type === 'error' ? 'bg-red-500/10 border border-red-500/20' :
                    rec.type === 'warning' ? 'bg-yellow-500/10 border border-yellow-500/20' :
                    rec.type === 'success' ? 'bg-green-500/10 border border-green-500/20' :
                    'bg-blue-500/10 border border-blue-500/20'
                  }`}>
                    {rec.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
                    {rec.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />}
                    {rec.type === 'success' && <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />}
                    {rec.type === 'info' && <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />}
                    <p className="text-xs text-dark-200">{rec.message}</p>
                  </div>
                ))}
              </div>

              {/* Detalles de configuración */}
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-dark-300 uppercase">Configuración</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-dark-900/50">
                    <span className="text-dark-400">OAuth conectado:</span>
                    <span className={`ml-2 font-medium ${diagnostic.platform.oauth_completed ? 'text-green-400' : 'text-red-400'}`}>
                      {diagnostic.platform.oauth_completed ? 'Sí' : 'No'}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-dark-900/50">
                    <span className="text-dark-400">Cuenta de Instagram:</span>
                    <span className={`ml-2 font-medium ${diagnostic.platform.has_instagram_connected ? 'text-green-400' : 'text-red-400'}`}>
                      {diagnostic.platform.has_instagram_connected ? 'Conectada' : 'No conectada'}
                    </span>
                  </div>
                  {diagnostic.platform.instagram_username && (
                    <div className="p-2 rounded bg-dark-900/50 col-span-2">
                      <span className="text-dark-400">Usuario:</span>
                      <span className="ml-2 font-medium text-white">@{diagnostic.platform.instagram_username}</span>
                    </div>
                  )}
                  {diagnostic.platform.page_name && (
                    <div className="p-2 rounded bg-dark-900/50 col-span-2">
                      <span className="text-dark-400">Página de Facebook:</span>
                      <span className="ml-2 font-medium text-white">{diagnostic.platform.page_name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Estadísticas */}
              {diagnostic.stats.total_conversations > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-dark-300 uppercase">Estadísticas</h5>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded bg-dark-900/50 text-center">
                      <div className="text-2xl font-bold text-white">{diagnostic.stats.total_conversations}</div>
                      <div className="text-dark-400">Conversaciones</div>
                    </div>
                    <div className="p-2 rounded bg-dark-900/50 text-center">
                      <div className="text-2xl font-bold text-green-400">{diagnostic.stats.active_conversations}</div>
                      <div className="text-dark-400">Activas</div>
                    </div>
                    <div className="p-2 rounded bg-dark-900/50 text-center">
                      <div className="text-2xl font-bold text-pink-400">{diagnostic.stats.bot_active_conversations}</div>
                      <div className="text-dark-400">Bot activo</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Enlaces útiles */}
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-dark-300 uppercase">Recursos útiles</h5>
                <div className="flex flex-col gap-2">
                  <a
                    href="https://developers.facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Meta for Developers (Configurar webhooks)
                  </a>
                  <a
                    href="https://business.facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Meta Business Suite (Vincular Instagram)
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <ChatPanel platform="instagram" connectionStatus={connectionStatus} />
    </div>
  );
}
