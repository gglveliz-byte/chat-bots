'use client';

import { useState, useEffect } from 'react';
import { Info, ExternalLink } from 'lucide-react';
import ChatPanel from '@/components/chat/ChatPanel';
import { oauthApi } from '@/lib/api';

export default function WhatsAppPanel() {
  const [connectionStatus, setConnectionStatus] = useState<any>(null);

  useEffect(() => {
    oauthApi.getStatus('whatsapp')
      .then(res => {
        const data = res.data.data;
        setConnectionStatus({
          connected: data.connected,
          tokenStatus: data.tokenStatus,
          accountName: data.credentials?.display_phone || data.credentials?.verified_name,
        });
      })
      .catch(() => setConnectionStatus({ connected: false, tokenStatus: 'disconnected' }));
  }, []);

  const isDisconnected = connectionStatus && !connectionStatus.connected;

  return (
    <div className="space-y-0">
      {isDisconnected && (
        <div className="mx-0 mb-3 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Info className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-green-300 mb-1">Requisitos para conectar WhatsApp</h4>
              <ul className="text-xs text-dark-300 space-y-1">
                <li>1. Necesitas una cuenta de <strong className="text-white">WhatsApp Business</strong> vinculada a <strong className="text-white">Meta Business Suite</strong></li>
                <li>2. Configura tu app en <strong className="text-white">Meta for Developers</strong> con el producto WhatsApp</li>
                <li>3. Conecta desde la sección de <a href="/client/services/connect" className="text-green-400 underline hover:text-green-300">Vincular Cuentas</a></li>
              </ul>
            </div>
          </div>
        </div>
      )}
      <ChatPanel platform="whatsapp" connectionStatus={connectionStatus} />
    </div>
  );
}
