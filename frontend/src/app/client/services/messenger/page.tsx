'use client';

import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import ChatPanel from '@/components/chat/ChatPanel';
import { oauthApi } from '@/lib/api';

export default function MessengerPanel() {
  const [connectionStatus, setConnectionStatus] = useState<any>(null);

  useEffect(() => {
    oauthApi.getStatus('messenger')
      .then(res => {
        const data = res.data.data;
        setConnectionStatus({
          connected: data.connected,
          tokenStatus: data.tokenStatus,
          accountName: data.credentials?.page_name,
        });
      })
      .catch(() => setConnectionStatus({ connected: false, tokenStatus: 'disconnected' }));
  }, []);

  const isDisconnected = connectionStatus && !connectionStatus.connected;

  return (
    <div className="space-y-0">
      {isDisconnected && (
        <div className="mx-0 mb-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Info className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-300 mb-1">Requisitos para conectar Messenger</h4>
              <ul className="text-xs text-dark-300 space-y-1">
                <li>1. Necesitas una <strong className="text-white">Página de Facebook</strong> vinculada a <strong className="text-white">Meta Business Suite</strong></li>
                <li>2. Tu página debe tener <strong className="text-white">Messenger activado</strong> en la configuración</li>
                <li>3. Conecta desde la sección de <a href="/client/services/connect" className="text-blue-400 underline hover:text-blue-300">Vincular Cuentas</a></li>
              </ul>
            </div>
          </div>
        </div>
      )}
      <ChatPanel platform="messenger" connectionStatus={connectionStatus} />
    </div>
  );
}
