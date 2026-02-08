'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2, Clock, Zap, TrendingUp, Sparkles, Rocket,
  Bell, Calendar, Code, Users, MessageSquare, Shield
} from 'lucide-react';
import Footer from '@/components/legal/Footer';

const systemStatus = [
  {
    service: 'API Backend',
    status: 'operational',
    uptime: '99.9%',
    icon: Code,
  },
  {
    service: 'WhatsApp Business',
    status: 'operational',
    uptime: '99.8%',
    icon: MessageSquare,
  },
  {
    service: 'Facebook Messenger',
    status: 'operational',
    uptime: '99.7%',
    icon: MessageSquare,
  },
  {
    service: 'Instagram DMs',
    status: 'operational',
    uptime: '99.7%',
    icon: MessageSquare,
  },
  {
    service: 'Telegram Bot',
    status: 'operational',
    uptime: '99.9%',
    icon: MessageSquare,
  },
  {
    service: 'WebChat Widget',
    status: 'operational',
    uptime: '99.9%',
    icon: MessageSquare,
  },
  {
    service: 'OpenAI Integration',
    status: 'operational',
    uptime: '99.5%',
    icon: Sparkles,
  },
  {
    service: 'Base de Datos',
    status: 'operational',
    uptime: '99.9%',
    icon: Shield,
  },
];

const upcomingFeatures = [
  {
    title: 'Integración con más plataformas',
    description: 'Discord, Slack, y Microsoft Teams próximamente',
    eta: 'Q2 2026',
    icon: Rocket,
  },
  {
    title: 'Análisis avanzado con IA',
    description: 'Insights automáticos sobre tus conversaciones y patrones de clientes',
    eta: 'Q2 2026',
    icon: TrendingUp,
  },
  {
    title: 'Notificaciones personalizadas',
    description: 'Alertas en tiempo real vía email, SMS y push notifications',
    eta: 'Q1 2026',
    icon: Bell,
  },
  {
    title: 'API pública para desarrolladores',
    description: 'Integra nuestro chatbot en tus propias aplicaciones',
    eta: 'Q3 2026',
    icon: Code,
  },
  {
    title: 'Soporte multiidioma nativo',
    description: 'Traducciones automáticas en más de 50 idiomas',
    eta: 'Q2 2026',
    icon: Users,
  },
  {
    title: 'Agendamiento de citas',
    description: 'Permite a tus clientes agendar citas directamente desde el chat',
    eta: 'Q3 2026',
    icon: Calendar,
  },
];

const recentUpdates = [
  {
    date: '2026-02-07',
    title: 'Integración de Telegram mejorada',
    description: 'Deep linking personalizado para cada cliente con un solo bot global.',
  },
  {
    date: '2026-02-06',
    title: 'Base de conocimiento con PDFs',
    description: 'Ahora puedes subir documentos PDF para que el bot aprenda de tu información.',
  },
  {
    date: '2026-02-05',
    title: 'WebSocket en tiempo real',
    description: 'Mensajes instantáneos en tu panel sin necesidad de recargar la página.',
  },
  {
    date: '2026-02-04',
    title: 'Widget de WebChat renovado',
    description: 'Nuevo diseño responsivo y fácil de integrar en cualquier sitio web.',
  },
];

export default function StatusPage() {
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
            Estado del <span className="gradient-text">Sistema</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400"
          >
            Monitoreo en tiempo real de todos nuestros servicios
          </motion.p>

          {/* Overall Status Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-3 mt-8 px-6 py-3 rounded-full bg-green-500/10 border border-green-500/30"
          >
            <CheckCircle2 className="w-6 h-6 text-green-400" />
            <span className="text-lg font-semibold text-green-400">
              Todos los sistemas operativos
            </span>
          </motion.div>
        </div>

        {/* System Status Grid */}
        <div className="max-w-6xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-white mb-8">
            Estado de Servicios
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {systemStatus.map((service, index) => (
              <motion.div
                key={service.service}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-xl p-6 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                    <service.icon className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{service.service}</h3>
                    <p className="text-gray-400 text-sm">Uptime: {service.uptime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 text-sm font-medium">Operativo</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Growth & Development Section */}
        <div className="max-w-6xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-8 h-8 text-indigo-400" />
              <h2 className="text-3xl font-bold text-white">
                En Constante Crecimiento
              </h2>
            </div>
            <p className="text-gray-300 text-lg mb-6">
              NeuroChat está en desarrollo activo. Nuestro equipo de TCSS Programming trabaja constantemente
              para agregar nuevas funcionalidades, mejorar el rendimiento y ofrecer la mejor
              experiencia posible a nuestros usuarios.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                <Zap className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-white mb-1">5+</h3>
                <p className="text-gray-400">Plataformas Soportadas</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                <Users className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-white mb-1">99.9%</h3>
                <p className="text-gray-400">Uptime Promedio</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                <Sparkles className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-white mb-1">IA Avanzada</h3>
                <p className="text-gray-400">OpenAI GPT-4</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Updates */}
        <div className="max-w-6xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-white mb-8">
            Actualizaciones Recientes
          </h2>

          <div className="space-y-4">
            {recentUpdates.map((update, index) => (
              <motion.div
                key={update.date}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-xl p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2 text-indigo-400 min-w-fit">
                    <Clock className="w-5 h-5" />
                    <span className="text-sm font-medium">{update.date}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-2">{update.title}</h3>
                    <p className="text-gray-400 text-sm">{update.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Upcoming Features */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Próximas <span className="gradient-text">Funcionalidades</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Estamos trabajando en nuevas características emocionantes para mejorar tu experiencia
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-6 card-hover"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{feature.description}</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm text-indigo-400 font-medium">{feature.eta}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Subscribe to Updates CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative p-12 rounded-3xl glass overflow-hidden max-w-4xl mx-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10" />

          <div className="relative z-10 text-center">
            <Bell className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
            <h2 className="text-4xl font-bold mb-4 text-white">
              ¿Quieres estar al día?
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Contáctanos para recibir notificaciones sobre nuevas funcionalidades,
              mantenimientos programados y actualizaciones del sistema
            </p>
            <a
              href="https://wa.me/593987865420"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold text-lg btn-glow"
            >
              Contactar por WhatsApp
            </a>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
