'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gray-950 border-t border-gray-800 mt-auto">
      {/* Fondo sólido con gradiente sutil */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900 to-gray-900" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Columna 1: Sobre Nosotros */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Image
                src="/neurochat-logo.png"
                alt="NeuroChat Logo"
                width={28}
                height={28}
                className="rounded-lg"
              />
              <h3 className="text-white font-semibold text-lg">NeuroChat</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-2">
              Plataforma de chatbots con IA para WhatsApp, Messenger, Instagram, Telegram y WebChat.
              Automatiza tu atención al cliente 24/7.
            </p>
            <p className="text-gray-500 text-xs italic">
              by TCSS Programming
            </p>
          </div>

          {/* Columna 2: Producto */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Producto</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">
                  Precios
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">
                  Características
                </Link>
              </li>
              <li>
                <Link href="/status" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">
                  Estado del Sistema
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Legal */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/legal/terminos" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/legal/privacidad" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">
                  Política de Cookies
                </Link>
              </li>
              <li>
                <Link href="/legal/aviso-legal" className="text-gray-400 hover:text-indigo-400 text-sm transition-colors">
                  Aviso Legal
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Email: <a href="mailto:lveliz213@hotmail.com" className="text-indigo-400 hover:underline">lveliz213@hotmail.com</a></li>
              <li>WhatsApp: <a href="https://wa.me/593987865420" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">+593 98 786 5420</a></li>
              <li className="text-xs mt-2 text-gray-500">Soporte disponible 24/7</li>
            </ul>

            {/* Redes Sociales */}
            <div className="flex gap-4 mt-6">
              <a href="https://www.facebook.com/share/1GKr44SAYy/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors" title="Facebook">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://www.tiktok.com/@tcss.programming?_r=1&_t=ZS-93jWSKAgxt2" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors" title="TikTok">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} NeuroChat by TCSS Programming. Todos los derechos reservados.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Hecho con ❤️ usando Next.js, Express, PostgreSQL y OpenAI
          </p>
        </div>
      </div>
    </footer>
  );
}
