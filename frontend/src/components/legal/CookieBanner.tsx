'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Verificar si el usuario ya aceptó las cookies
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (!cookiesAccepted) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setShowBanner(false);
  };

  const rejectCookies = () => {
    localStorage.setItem('cookiesAccepted', 'essential-only');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-gray-900 to-gray-800 border-t border-gray-700 shadow-2xl">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Texto */}
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1">🍪 Este sitio utiliza cookies</h3>
            <p className="text-gray-300 text-sm">
              Utilizamos cookies para mejorar su experiencia, mantener su sesión segura y analizar el uso de nuestro sitio.
              Al continuar navegando, acepta nuestro uso de cookies según nuestra{' '}
              <Link href="/legal/cookies" className="text-indigo-400 hover:underline">
                Política de Cookies
              </Link>
              {' '}y{' '}
              <Link href="/legal/privacidad" className="text-indigo-400 hover:underline">
                Política de Privacidad
              </Link>
              .
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={rejectCookies}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Solo esenciales
            </button>
            <button
              onClick={acceptCookies}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Aceptar todas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
