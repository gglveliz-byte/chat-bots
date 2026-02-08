'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, Zap, Shield, ArrowRight, Bot } from 'lucide-react';
import { FaWhatsapp, FaFacebookMessenger, FaInstagram, FaTelegram } from 'react-icons/fa';
import { HiGlobeAlt } from 'react-icons/hi';
import Footer from '@/components/legal/Footer';
import CookieBanner from '@/components/legal/CookieBanner';

const features = [
  {
    icon: MessageSquare,
    title: 'Multi-Plataforma',
    description: 'WhatsApp, Messenger, Instagram, Telegram y Chat Web en un solo lugar.',
    color: 'from-green-400 to-emerald-600',
  },
  {
    icon: Bot,
    title: 'IA Conversacional',
    description: 'Respuestas naturales e inteligentes con OpenAI.',
    color: 'from-purple-400 to-violet-600',
  },
  {
    icon: Zap,
    title: 'Automatización',
    description: 'Atiende a tus clientes 24/7 sin esfuerzo.',
    color: 'from-yellow-400 to-orange-600',
  },
  {
    icon: Shield,
    title: 'Seguro',
    description: 'Tus datos y conversaciones siempre protegidos.',
    color: 'from-blue-400 to-cyan-600',
  },
];

const platforms = [
  { name: 'WhatsApp', color: '#25D366', Icon: FaWhatsapp },
  { name: 'Messenger', color: '#0084FF', Icon: FaFacebookMessenger },
  { name: 'Instagram', color: '#E4405F', Icon: FaInstagram },
  { name: 'Telegram', color: '#0088CC', Icon: FaTelegram },
  { name: 'Web Chat', color: '#6366F1', Icon: HiGlobeAlt },
];

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Video Background */}
      <div className="fixed inset-0 pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        >
          <source src="/fondo.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900/80 via-dark-900/60 to-dark-900/90" />
      </div>

      {/* Header */}
      <header className="relative z-10">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <Image
                src="/neurochat-logo.png"
                alt="NeuroChat Logo"
                width={40}
                height={40}
                className="rounded-xl"
              />
              <span className="text-xl font-bold gradient-text">NeuroChat</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <Link
                href="/auth/login"
                className="text-dark-300 hover:text-white transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/auth/register"
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium hover:opacity-90 transition-opacity"
              >
                Comenzar Gratis
              </Link>
            </motion.div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="container mx-auto px-6 pt-20 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-dark-300">Prueba gratuita de 5 días</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-6"
            >
              Automatiza tus{' '}
              <span className="gradient-text">conversaciones</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-dark-400 mb-10 max-w-2xl mx-auto"
            >
              Chatbots inteligentes para WhatsApp, Messenger, Instagram, Telegram y tu sitio web.
              Atiende a tus clientes 24/7 con respuestas naturales impulsadas por IA.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/auth/register"
                className="group px-8 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold text-lg btn-glow flex items-center gap-2"
              >
                Comenzar Gratis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 rounded-xl glass text-white font-medium hover:bg-dark-700/50 transition-colors"
              >
                Ver características
              </Link>
            </motion.div>
          </div>

          {/* Platform Icons */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-6 mt-16"
          >
            {platforms.map((platform, index) => (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="group relative"
              >
                <div
                  className="w-16 h-16 rounded-2xl glass flex items-center justify-center cursor-pointer card-hover"
                  style={{ borderColor: `${platform.color}30` }}
                >
                  <platform.Icon size={32} style={{ color: platform.color }} />
                </div>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-dark-400 whitespace-nowrap">{platform.name}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Todo lo que necesitas
            </h2>
            <p className="text-dark-400 max-w-2xl mx-auto">
              Una plataforma completa para gestionar todas tus conversaciones automatizadas
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl glass card-hover"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-dark-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative p-12 rounded-3xl glass overflow-hidden"
          >
            {/* Video Background for CTA */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover rounded-3xl opacity-10"
            >
              <source src="/fondo-contacto.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10" />

            <div className="relative z-10 text-center">
              <h2 className="text-4xl font-bold mb-4">
                ¿Listo para automatizar tu negocio?
              </h2>
              <p className="text-dark-400 mb-8 max-w-xl mx-auto">
                Únete a cientos de empresas que ya están ahorrando tiempo y mejorando su atención al cliente
              </p>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold text-lg btn-glow"
              >
                Empezar prueba gratuita
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Cookie Banner */}
      <CookieBanner />
    </div>
  );
}
