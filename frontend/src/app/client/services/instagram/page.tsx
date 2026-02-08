'use client';

import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import ChatPanel from '@/components/chat/ChatPanel';
import { oauthApi } from '@/lib/api';

export default function InstagramPanel() {
  const [connectionStatus, setConnectionStatus] = useState<any>(null);

  useEffect(() => {
    oauthApi.getStatus('instagram')
      .then(res => {
        const data = res.data.data;
        setConnectionStatus({
          connected: data.connected,
          tokenStatus: data.tokenStatus,
          accountName: data.credentials?.instagram_username,
        });
      })
      .catch(() => setConnectionStatus({ connected: false, tokenStatus: 'disconnected' }));
  }, []);

  const isDisconnected = connectionStatus && !connectionStatus.connected;

  return (
    <div className="space-y-0">
      {isDisconnected && (
        <div className="mx-0 mb-3 p-4 rounded-xl bg-pink-500/5 border border-pink-500/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Info className="w-4 h-4 text-pink-400" />
            </div>
            <div>
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
      <ChatPanel platform="instagram" connectionStatus={connectionStatus} />
    </div>
  );
}
