'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  ArrowRight,
  AlertTriangle,
  Check,
  Lock,
  Zap,
  Link2,
  Wifi,
  WifiOff,
  Building2,
  CreditCard
} from 'lucide-react';
import { FaWhatsapp, FaFacebookMessenger, FaInstagram, FaTelegram } from 'react-icons/fa';
import { HiGlobeAlt } from 'react-icons/hi';
import { useAuthStore } from '@/stores/authStore';
import { clientApi, oauthApi } from '@/lib/api';
import toast from 'react-hot-toast';

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

interface ServiceData {
  id: string;
  code: string;
  name: string;
  price_monthly: number;
  description: string;
  contracted: boolean;
  contractInfo: {
    status: string;
    trial_ends_at?: string;
    subscription_ends_at?: string;
  } | null;
}

export default function ClientDashboard() {
  const { user, business, services: userServices } = useAuthStore();
  const [services, setServices] = useState<ServiceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activatingTrial, setActivatingTrial] = useState<string | null>(null);
  const [connections, setConnections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchServices();
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    const metaPlatforms = ['whatsapp', 'messenger', 'instagram'];
    const results: Record<string, boolean> = {};
    await Promise.all(
      metaPlatforms.map(async (p) => {
        try {
          const res = await oauthApi.getStatus(p);
          results[p] = res.data.data?.connected || false;
        } catch { results[p] = false; }
      })
    );
    setConnections(results);
  };

  const fetchServices = async () => {
    try {
      const response = await clientApi.getMyServices();
      setServices(response.data.data.services);
    } catch (error) {
      toast.error('Error al cargar los servicios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateTrial = async (serviceId: string) => {
    if (!business) {
      toast.error('Debes completar los datos de tu negocio primero');
      return;
    }

    setActivatingTrial(serviceId);
    try {
      await clientApi.activateTrial(serviceId);
      toast.success('¡Trial activado! Tienes 5 días para probarlo.');
      fetchServices();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al activar el trial');
    } finally {
      setActivatingTrial(null);
    }
  };

  const getServiceStatus = (service: ServiceData) => {
    if (!service.contracted || !service.contractInfo) return 'not_contracted';
    const status = service.contractInfo.status;
    if (status === 'trial' || status === 'active') return 'active';
    return 'inactive';
  };

  const getDaysRemaining = (service: ServiceData) => {
    if (!service.contractInfo) return 0;
    const endDate = service.contractInfo.status === 'trial'
      ? service.contractInfo.trial_ends_at
      : service.contractInfo.subscription_ends_at;
    if (!endDate) return 0;
    const diff = new Date(endDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 rounded-2xl glass skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl glass skeleton" />
          ))}
        </div>
      </div>
    );
  }

  const activeServices = services.filter(s => getServiceStatus(s) === 'active');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            ¡Hola, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-dark-400">
            {business ? `Bienvenido al panel de ${business.name}` : 'Completa los datos de tu negocio para comenzar'}
          </p>
        </div>
        <div className="hidden md:flex flex-col items-end">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              NeuroChat
            </span>
          </div>
          <p className="text-xs text-dark-500 mt-1">Powered by TCSS Programming</p>
        </div>
      </div>

      {/* Alert: Complete Business Data */}
      {!business && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-4"
        >
          <AlertTriangle className="w-6 h-6 text-orange-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-orange-200">Completa tu información</p>
            <p className="text-sm text-orange-300/70">
              Para activar servicios, primero debes completar los datos de tu negocio.
            </p>
          </div>
          <Link
            href="/client/business"
            className="px-4 py-2 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors flex items-center gap-2"
          >
            Completar
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}

      {/* Active Services Summary */}
      {activeServices.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl glass">
            <MessageSquare className="w-6 h-6 text-primary-400 mb-2" />
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-dark-400">Mensajes hoy</p>
          </div>
          <div className="p-4 rounded-xl glass">
            <Users className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-dark-400">Conversaciones</p>
          </div>
          <div className="p-4 rounded-xl glass">
            <TrendingUp className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-2xl font-bold">{activeServices.length}</p>
            <p className="text-sm text-dark-400">Servicios activos</p>
          </div>
          <div className="p-4 rounded-xl glass">
            <Zap className="w-6 h-6 text-yellow-400 mb-2" />
            <p className="text-2xl font-bold">24/7</p>
            <p className="text-sm text-dark-400">Bot activo</p>
          </div>
        </div>
      )}

      {/* Services Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Tus Servicios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const status = getServiceStatus(service);
            const daysRemaining = getDaysRemaining(service);
            const isTrial = service.contractInfo?.status === 'trial';

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-2xl glass card-hover relative overflow-hidden ${
                  status === 'active' ? '' : 'opacity-75'
                }`}
              >
                {/* Status Badge */}
                {status === 'active' && (
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${
                    isTrial
                      ? 'bg-orange-500/20 text-orange-400'
                      : daysRemaining <= 5
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-green-500/20 text-green-400'
                  }`}>
                    {isTrial
                      ? `Trial: ${daysRemaining} días`
                      : daysRemaining <= 5
                        ? `⚠️ Vence en ${daysRemaining} días`
                        : `${daysRemaining} días restantes`
                    }
                  </div>
                )}

                {/* Service Icon */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${platformColors[service.code]}20` }}
                >
                  {(() => {
                    const Icon = platformIcons[service.code];
                    return Icon ? (
                      <Icon size={32} style={{ color: platformColors[service.code] }} />
                    ) : (
                      <MessageSquare size={32} style={{ color: platformColors[service.code] }} />
                    );
                  })()}
                </div>

                {/* Service Info */}
                <h3 className="text-xl font-semibold mb-1">{service.name}</h3>
                <p className="text-sm text-dark-400 mb-4">{service.description}</p>

                {/* Price */}
                <p className="text-2xl font-bold mb-1">
                  ${service.price_monthly}
                  <span className="text-sm text-dark-400 font-normal">/mes</span>
                </p>
                {status === 'active' && !isTrial && service.contractInfo?.subscription_ends_at && (
                  <p className={`text-xs mb-4 ${daysRemaining <= 5 ? 'text-red-400' : 'text-dark-400'}`}>
                    Vence: {new Date(service.contractInfo.subscription_ends_at).toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
                {status === 'active' && isTrial && service.contractInfo?.trial_ends_at && (
                  <p className="text-xs text-orange-400 mb-4">
                    Trial hasta: {new Date(service.contractInfo.trial_ends_at).toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
                {status !== 'active' && <div className="mb-4" />}

                {/* Action Button */}
                {status === 'active' ? (
                  <Link
                    href={`/client/services/${service.code}`}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold flex items-center justify-center gap-2 btn-glow"
                  >
                    Ir al Panel
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                ) : status === 'inactive' ? (
                  <Link
                    href="/client/payments"
                    className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold flex items-center justify-center gap-2"
                  >
                    <Clock className="w-5 h-5" />
                    Renovar Suscripción
                  </Link>
                ) : (
                  <button
                    onClick={() => handleActivateTrial(service.id)}
                    disabled={activatingTrial === service.id || !business}
                    className="w-full py-3 rounded-xl border-2 border-primary-500 text-primary-400 font-semibold flex items-center justify-center gap-2 hover:bg-primary-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {activatingTrial === service.id ? (
                      <div className="w-5 h-5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Activar Trial Gratis
                      </>
                    )}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      {activeServices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-2xl glass"
          >
            <h3 className="text-lg font-semibold mb-4">Conexiones</h3>
            <div className="space-y-2">
              {['whatsapp', 'messenger', 'instagram'].map((p) => {
                const connected = connections[p];
                const hasService = activeServices.some(s => s.code === p);
                if (!hasService) return null;
                const Icon = platformIcons[p];
                return (
                  <div key={p} className="flex items-center justify-between p-3 rounded-xl bg-dark-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${platformColors[p]}20` }}>
                        <Icon size={18} style={{ color: platformColors[p] }} />
                      </div>
                      <span className="text-sm font-medium text-white capitalize">{p}</span>
                    </div>
                    {connected ? (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <Wifi className="w-3 h-3" /> Conectado
                      </span>
                    ) : (
                      <Link href="/client/services/connect"
                        className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300">
                        <WifiOff className="w-3 h-3" /> Conectar →
                      </Link>
                    )}
                  </div>
                );
              })}
              <Link href="/client/services/connect"
                className="flex items-center gap-2 p-3 rounded-xl bg-primary-500/10 text-primary-400 hover:bg-primary-500/15 transition-colors text-sm font-medium">
                <Link2 className="w-4 h-4" />
                Gestionar conexiones
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-6 rounded-2xl glass"
          >
            <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <Link
                href="/client/business"
                className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50 hover:bg-dark-700/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="font-medium">Editar negocio</p>
                  <p className="text-sm text-dark-400">Actualiza la información de tu negocio</p>
                </div>
              </Link>
              <Link
                href="/client/payments"
                className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50 hover:bg-dark-700/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="font-medium">Ver pagos</p>
                  <p className="text-sm text-dark-400">Historial y métodos de pago</p>
                </div>
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
