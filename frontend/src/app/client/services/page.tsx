'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  X,
  Check,
  Sparkles,
  Clock,
  CreditCard,
  MessageSquare,
  Bot,
  Zap,
  Shield,
  ArrowRight
} from 'lucide-react';
import { clientApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

// Iconos y colores de plataformas
const platformData: { [key: string]: { icon: string; color: string; name: string; description: string } } = {
  whatsapp: {
    icon: '📱',
    color: '#25D366',
    name: 'WhatsApp Business',
    description: 'Automatiza tus conversaciones de WhatsApp con IA. Responde a tus clientes 24/7.'
  },
  messenger: {
    icon: '💬',
    color: '#0084FF',
    name: 'Facebook Messenger',
    description: 'Conecta con tus clientes de Facebook de forma automática e inteligente.'
  },
  instagram: {
    icon: '📸',
    color: '#E4405F',
    name: 'Instagram DMs',
    description: 'Gestiona los mensajes directos de Instagram con respuestas automáticas.'
  },
  telegram: {
    icon: '✈️',
    color: '#0088CC',
    name: 'Telegram Bot',
    description: 'Crea un bot de Telegram potenciado con IA para tu negocio.'
  },
  webchat: {
    icon: '🌐',
    color: '#6366F1',
    name: 'Web Chat Widget',
    description: 'Agrega un chat en vivo a tu sitio web con respuestas automáticas.'
  }
};

interface Service {
  id: string;
  name: string;
  code: string;
  description: string;
  price_monthly: number;
  icon: string;
  color: string;
}

export default function ServicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contractService = searchParams.get('contract');
  const { services: userServices, checkAuth } = useAuthStore();

  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActivating, setIsActivating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (contractService && services.length > 0) {
      const service = services.find(s => s.code === contractService);
      if (service) {
        setSelectedService(service);
        setShowModal(true);
      }
    }
  }, [contractService, services]);

  const fetchServices = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`);
      const data = await response.json();
      if (data.success) {
        setServices(data.data.services);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateTrial = async () => {
    if (!selectedService) return;

    setIsActivating(true);
    try {
      await clientApi.activateTrial(selectedService.id);
      toast.success(`¡Trial de ${selectedService.name} activado! Tienes 5 días gratis.`);
      await checkAuth(); // Refrescar los servicios del usuario
      setShowModal(false);
      router.push(`/client/services/${selectedService.code}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al activar el trial');
    } finally {
      setIsActivating(false);
    }
  };

  const handleSubscribe = () => {
    if (!selectedService) return;
    setShowModal(false);
    router.push(`/client/payments?service=${selectedService.code}`);
  };

  const isServiceActive = (code: string) => {
    return userServices?.some(s => s.code === code && (s.status === 'active' || s.status === 'trial'));
  };

  const hasUsedTrial = (code: string) => {
    return userServices?.some(s => s.code === code);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Servicios Disponibles</h1>
        <p className="text-dark-400 mt-1">
          Elige las plataformas que quieres automatizar con IA
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => {
          const platform = platformData[service.code];
          const isActive = isServiceActive(service.code);

          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative p-6 rounded-2xl glass border transition-all cursor-pointer hover:scale-[1.02] ${
                isActive
                  ? 'border-green-500/30 bg-green-500/5'
                  : 'border-dark-700/50 hover:border-primary-500/30'
              }`}
              onClick={() => {
                if (isActive) {
                  router.push(`/client/services/${service.code}`);
                } else {
                  setSelectedService(service);
                  setShowModal(true);
                }
              }}
            >
              {/* Status Badge */}
              {isActive && (
                <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Activo
                </div>
              )}

              {/* Icon */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
                style={{ backgroundColor: `${platform?.color}20` }}
              >
                {platform?.icon || '🤖'}
              </div>

              {/* Info */}
              <h3 className="text-lg font-semibold text-white mb-2">
                {platform?.name || service.name}
              </h3>
              <p className="text-dark-400 text-sm mb-4">
                {platform?.description || service.description}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-2xl font-bold text-white">${service.price_monthly}</span>
                <span className="text-dark-500">/mes</span>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2 text-sm text-dark-300">
                  <Bot className="w-4 h-4 text-primary-400" />
                  Respuestas con IA
                </li>
                <li className="flex items-center gap-2 text-sm text-dark-300">
                  <Zap className="w-4 h-4 text-primary-400" />
                  Respuestas instantáneas 24/7
                </li>
                <li className="flex items-center gap-2 text-sm text-dark-300">
                  <MessageSquare className="w-4 h-4 text-primary-400" />
                  2000 mensajes/día
                </li>
              </ul>

              {/* Action Button */}
              <button
                className={`w-full py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                  isActive
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:opacity-90'
                }`}
              >
                {isActive ? (
                  <>
                    <Check className="w-4 h-4" />
                    Ir al Panel
                  </>
                ) : (
                  <>
                    Contratar
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Contract Modal */}
      <AnimatePresence>
        {showModal && selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl glass p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-dark-700/50 text-dark-400"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Service Info */}
              <div className="text-center mb-6">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4"
                  style={{ backgroundColor: `${platformData[selectedService.code]?.color}20` }}
                >
                  {platformData[selectedService.code]?.icon || '🤖'}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {platformData[selectedService.code]?.name || selectedService.name}
                </h2>
                <p className="text-dark-400">
                  {platformData[selectedService.code]?.description}
                </p>
              </div>

              {/* Price Card */}
              <div className="p-4 rounded-xl bg-dark-800/50 border border-dark-700/50 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-dark-400">Precio mensual</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">${selectedService.price_monthly}</span>
                    <span className="text-dark-500">/mes</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-dark-300">
                    <Check className="w-4 h-4 text-green-400" />
                    Respuestas automáticas con IA
                  </li>
                  <li className="flex items-center gap-2 text-sm text-dark-300">
                    <Check className="w-4 h-4 text-green-400" />
                    Panel de control dedicado
                  </li>
                  <li className="flex items-center gap-2 text-sm text-dark-300">
                    <Check className="w-4 h-4 text-green-400" />
                    Estadísticas y análisis
                  </li>
                  <li className="flex items-center gap-2 text-sm text-dark-300">
                    <Check className="w-4 h-4 text-green-400" />
                    Soporte prioritario
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Trial Button */}
                {!hasUsedTrial(selectedService.code) && (
                  <button
                    onClick={handleActivateTrial}
                    disabled={isActivating}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold flex items-center justify-center gap-2 btn-glow disabled:opacity-50"
                  >
                    {isActivating ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Probar 5 días GRATIS
                      </>
                    )}
                  </button>
                )}

                {/* Subscribe Button */}
                <button
                  onClick={handleSubscribe}
                  className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                    hasUsedTrial(selectedService.code)
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white btn-glow'
                      : 'bg-dark-700/50 text-white hover:bg-dark-600/50'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  {hasUsedTrial(selectedService.code) ? 'Suscribirse Ahora' : 'Suscribirse sin trial'}
                </button>

                {/* Trial Info */}
                {!hasUsedTrial(selectedService.code) && (
                  <p className="text-center text-dark-500 text-sm flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4" />
                    No se requiere tarjeta de crédito para el trial
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
