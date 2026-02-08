'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Check, Zap, Loader2, MessageSquare } from 'lucide-react';
import { FaWhatsapp, FaFacebookMessenger, FaInstagram, FaTelegram } from 'react-icons/fa';
import { HiGlobeAlt } from 'react-icons/hi';
import { publicApi } from '@/lib/api';
import Footer from '@/components/legal/Footer';

const platformIcons: { [key: string]: any } = {
  whatsapp: FaWhatsapp,
  messenger: FaFacebookMessenger,
  instagram: FaInstagram,
  telegram: FaTelegram,
  webchat: HiGlobeAlt,
};

const platformColors: { [key: string]: string } = {
  whatsapp: '#25D366',
  messenger: '#0084FF',
  instagram: '#E4405F',
  telegram: '#0088CC',
  webchat: '#6366F1',
};

export default function PricingPage() {
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await publicApi.getServices();
      // La API ya devuelve solo servicios activos (is_active = true)
      setServices(response.data?.data?.services || []);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const trialFeatures = [
    '100 mensajes por día por plataforma',
    'Todas las plataformas disponibles',
    'Inteligencia Artificial con OpenAI',
    'Panel de administración completo',
    'Configuración de personalidad del bot',
    'Archivos de conocimiento (PDFs)',
    'Horarios de atención personalizados',
    'Soporte por email',
  ];

  const proFeatures = [
    '2000 mensajes por día',
    'Inteligencia Artificial avanzada con OpenAI',
    'Configuración de personalidad del bot',
    'Archivos de conocimiento ilimitados (PDFs)',
    'Horarios de atención personalizados',
    'Respuestas automáticas 24/7',
    'Soporte prioritario por WhatsApp',
    'Estadísticas y métricas detalladas',
    'Conversaciones ilimitadas',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/neurochat-logo.png"
                alt="NeuroChat Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-xl font-bold gradient-text">NeuroChat</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/auth/register"
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium hover:opacity-90 transition-opacity"
              >
                Comenzar Gratis
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-white mb-4"
          >
            Precios <span className="gradient-text">simples y transparentes</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400"
          >
            Comienza gratis y escala cuando lo necesites. Sin sorpresas, sin tarifas ocultas.
          </motion.p>
        </div>

        {/* Trial Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mb-16 p-8 rounded-3xl bg-gradient-to-br from-amber-900/40 to-orange-900/40 border-2 border-amber-500/50"
        >
          <div className="text-center mb-6">
            <div className="inline-block px-4 py-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mb-4">
              <span className="text-white text-sm font-semibold flex items-center gap-1">
                <Zap className="w-4 h-4" /> Prueba Gratis
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">5 Días de Trial Gratuito</h3>
            <p className="text-gray-300 text-lg">Prueba cualquier servicio sin costo y sin tarjeta de crédito</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <h4 className="text-white font-semibold mb-3">Incluye:</h4>
              <ul className="space-y-2">
                {trialFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                    <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-amber-900/30 rounded-2xl p-4 border border-amber-600/30">
              <p className="text-amber-300 text-sm font-semibold mb-2">Limitaciones del Trial:</p>
              <ul className="space-y-1 text-amber-200 text-sm">
                <li>• Máximo 100 mensajes por día por plataforma</li>
                <li>• Duración: 5 días desde la activación</li>
                <li>• Al finalizar, debes contratar el servicio para continuar</li>
              </ul>
            </div>
          </div>

          <Link
            href="/auth/register"
            className="block w-full text-center py-4 px-6 rounded-xl font-semibold transition-all bg-gradient-to-r from-amber-500 to-orange-500 text-white btn-glow text-lg"
          >
            Comenzar Trial Gratis
          </Link>
        </motion.div>

        {/* Services Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Servicios por Plataforma
          </h2>
          <p className="text-gray-400 text-lg">
            Contrata solo las plataformas que necesitas. Cada servicio es independiente.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center mb-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
          </div>
        )}

        {/* Service Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-16">
          {services.map((service, index) => {
            const Icon = platformIcons[service.code];
            const color = platformColors[service.code];

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative rounded-3xl p-6 glass hover:border-primary-500/50 transition-all"
              >
                {/* Service Icon */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    {Icon && <Icon size={28} style={{ color }} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{service.name}</h3>
                    <p className="text-gray-400 text-xs">/{service.code}</p>
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-4">{service.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">
                      ${parseFloat(service.price_monthly).toFixed(2)}
                    </span>
                    <span className="text-gray-400">/mes</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">+ 5 días gratis de trial</p>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {proFeatures.slice(0, 6).map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300 text-xs">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href="/auth/register"
                  className="block w-full text-center py-3 px-6 rounded-xl font-semibold transition-all glass text-white hover:bg-gradient-to-r hover:from-primary-500 hover:to-secondary-500"
                >
                  Probar Gratis
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Preguntas Frecuentes
          </h2>
          <div className="space-y-4">
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                ¿Puedo contratar solo una plataforma?
              </h3>
              <p className="text-gray-400 text-sm">
                Sí, cada servicio es independiente. Puedes contratar solo WhatsApp, solo Messenger, o cualquier combinación
                que necesites. Pagas únicamente por las plataformas que uses.
              </p>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                ¿Cómo funciona el trial gratuito?
              </h3>
              <p className="text-gray-400 text-sm">
                Al registrarte, puedes activar un trial de 5 días para cualquier servicio. Durante el trial tienes
                acceso completo con un límite de 100 mensajes diarios. No necesitas tarjeta de crédito para probarlo.
              </p>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                ¿Qué métodos de pago aceptan?
              </h3>
              <p className="text-gray-400 text-sm">
                Aceptamos PayPal y transferencias bancarias. El pago es mensual por cada servicio contratado.
              </p>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                ¿Puedo cancelar en cualquier momento?
              </h3>
              <p className="text-gray-400 text-sm">
                Sí, puedes cancelar cualquier servicio desde tu panel de control en cualquier momento.
                El servicio seguirá activo hasta el final del periodo pagado.
              </p>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                ¿Los archivos de conocimiento se comparten entre plataformas?
              </h3>
              <p className="text-gray-400 text-sm">
                Sí, cuando subes archivos PDF o TXT en "Mi Negocio", estos se comparten automáticamente entre
                todas las plataformas que tengas contratadas. Solo necesitas subirlos una vez.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
