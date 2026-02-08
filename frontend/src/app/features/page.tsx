'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  MessageSquare, Brain, Clock, Shield, Zap, Globe,
  BarChart3, Settings, FileText, Users, Sparkles, Bot
} from 'lucide-react';
import { FaWhatsapp, FaFacebookMessenger, FaInstagram, FaTelegram } from 'react-icons/fa';
import { HiGlobeAlt } from 'react-icons/hi';
import Footer from '@/components/legal/Footer';

const features = [
  {
    icon: Brain,
    title: 'Inteligencia Artificial Avanzada',
    description: 'Utiliza OpenAI (ChatGPT) para entender preguntas naturales y generar respuestas coherentes y contextuales. El bot aprende del contexto de cada conversación para ofrecer respuestas más precisas.',
    color: 'from-purple-400 to-violet-600',
  },
  {
    icon: MessageSquare,
    title: 'Multi-Plataforma',
    description: 'Conecta WhatsApp Business, Facebook Messenger, Instagram DMs, Telegram y un widget de chat web. Todo desde un solo panel de administración centralizado.',
    color: 'from-green-400 to-emerald-600',
  },
  {
    icon: Clock,
    title: 'Atención 24/7',
    description: 'Tu chatbot nunca duerme. Atiende a tus clientes en cualquier momento del día o de la noche, incluso en fines de semana y días festivos, sin necesidad de intervención humana.',
    color: 'from-blue-400 to-cyan-600',
  },
  {
    icon: Sparkles,
    title: 'Personalidad Configurable',
    description: 'Define cómo quieres que tu bot se comporte: amigable, profesional, técnico, casual. Personaliza el tono, el lenguaje y el estilo de las respuestas para que coincida con la voz de tu marca.',
    color: 'from-pink-400 to-rose-600',
  },
  {
    icon: FileText,
    title: 'Base de Conocimiento con PDFs',
    description: 'Sube documentos PDF con información de tus productos, servicios o políticas. El bot extraerá automáticamente la información y la usará para responder preguntas específicas de tu negocio.',
    color: 'from-orange-400 to-red-600',
  },
  {
    icon: Settings,
    title: 'Horarios de Atención',
    description: 'Configura horarios específicos para que el bot esté activo. Fuera de horario, envía mensajes automáticos personalizados indicando cuándo volverás a estar disponible.',
    color: 'from-yellow-400 to-amber-600',
  },
  {
    icon: Users,
    title: 'Gestión de Conversaciones',
    description: 'Panel completo para ver todas las conversaciones en tiempo real. Activa o desactiva el bot por conversación si necesitas intervenir manualmente. Historial completo de mensajes.',
    color: 'from-teal-400 to-cyan-600',
  },
  {
    icon: Zap,
    title: 'Respuestas en Tiempo Real',
    description: 'Los mensajes aparecen instantáneamente en tu panel gracias a WebSockets. Ve las conversaciones en vivo mientras suceden y responde cuando sea necesario.',
    color: 'from-indigo-400 to-blue-600',
  },
  {
    icon: BarChart3,
    title: 'Métricas y Estadísticas',
    description: 'Monitorea el rendimiento de tu bot: cantidad de mensajes procesados, conversaciones activas, tiempos de respuesta y más. Toma decisiones basadas en datos reales.',
    color: 'from-violet-400 to-purple-600',
  },
  {
    icon: Shield,
    title: 'Seguridad Garantizada',
    description: 'Encriptación SSL/TLS en todas las comunicaciones, contraseñas hasheadas con bcrypt, validación de webhooks con firmas criptográficas. Tus datos y los de tus clientes están protegidos.',
    color: 'from-red-400 to-pink-600',
  },
  {
    icon: Globe,
    title: 'Widget Web Embebible',
    description: 'Agrega un chat en vivo a tu sitio web con un simple script. Funciona en cualquier sitio: WordPress, HTML estático, React, etc. Totalmente personalizable y responsivo.',
    color: 'from-lime-400 to-green-600',
  },
  {
    icon: Bot,
    title: 'Sin Código Requerido',
    description: 'Configura todo desde una interfaz visual intuitiva. No necesitas saber programar. Conecta tus cuentas con OAuth en 1 click, configura tu bot y listo.',
    color: 'from-cyan-400 to-teal-600',
  },
];

const platforms = [
  {
    name: 'WhatsApp Business',
    Icon: FaWhatsapp,
    description: 'Conecta tu número de WhatsApp Business mediante OAuth de Meta. Soporta texto, imágenes, videos, documentos, ubicaciones y más.',
    color: '#25D366',
  },
  {
    name: 'Facebook Messenger',
    Icon: FaFacebookMessenger,
    description: 'Integración nativa con tu página de Facebook. Responde automáticamente a mensajes y comentarios.',
    color: '#0084FF',
  },
  {
    name: 'Instagram DMs',
    Icon: FaInstagram,
    description: 'Atiende mensajes directos de Instagram Business. Ideal para comercio electrónico y marcas visuales.',
    color: '#E4405F',
  },
  {
    name: 'Telegram',
    Icon: FaTelegram,
    description: 'Bot de Telegram con deep linking personalizado para cada cliente. Rápido, seguro y con soporte para grupos.',
    color: '#0088CC',
  },
  {
    name: 'WebChat Widget',
    Icon: HiGlobeAlt,
    description: 'Chat embebible para tu sitio web. Fácil de instalar con un script. Compatible con cualquier plataforma web.',
    color: '#6366F1',
  },
];

export default function FeaturesPage() {
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

      {/* Hero */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-white mb-4"
          >
            Características <span className="gradient-text">Potentes</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400"
          >
            Todo lo que necesitas para automatizar y mejorar la atención a tus clientes
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="glass rounded-2xl p-6 card-hover"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Platforms Section */}
        <div className="max-w-6xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            Plataformas <span className="gradient-text">Soportadas</span>
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Conecta todas las plataformas que usas para comunicarte con tus clientes
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map((platform, index) => (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-6 card-hover"
                style={{ borderColor: `${platform.color}30` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <platform.Icon size={40} style={{ color: platform.color }} />
                  <h3 className="text-xl font-bold text-white">{platform.name}</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{platform.description}</p>
              </motion.div>
            ))}

            {/* CTA Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: platforms.length * 0.1 }}
              className="glass rounded-2xl p-6 flex flex-col items-center justify-center text-center"
            >
              <Sparkles className="w-12 h-12 text-indigo-400 mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">¿Y más por venir?</h3>
              <p className="text-gray-400 text-sm mb-4">
                Continuamente agregamos nuevas plataformas y funcionalidades
              </p>
            </motion.div>
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative p-12 rounded-3xl glass overflow-hidden max-w-4xl mx-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10" />

          <div className="relative z-10 text-center">
            <h2 className="text-4xl font-bold mb-4 text-white">
              ¿Listo para comenzar?
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Prueba gratis durante 5 días. Sin tarjeta de crédito requerida.
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold text-lg btn-glow"
            >
              Empezar Prueba Gratuita
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
