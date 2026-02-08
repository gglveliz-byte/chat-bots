'use client';

import './globals.css';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);

  useEffect(() => {
    if (_hasHydrated) {
      checkAuth();
    }
  }, [_hasHydrated, checkAuth]);

  return (
    <html lang="es" className="dark">
      <head>
        <title>NeuroChat - Sistema de Chatbots Multi-Plataforma con IA</title>
        <meta name="description" content="NeuroChat: Chatbots inteligentes para WhatsApp, Messenger, Instagram, Telegram y WebChat. Automatiza tu atención al cliente 24/7 con IA." />
        <link rel="icon" href="/neurochat-logo.png" />
      </head>
      <body className="bg-dark-900 text-dark-50 antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1E293B',
              color: '#F1F5F9',
              border: '1px solid rgba(99, 102, 241, 0.2)',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#F1F5F9',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#F1F5F9',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
