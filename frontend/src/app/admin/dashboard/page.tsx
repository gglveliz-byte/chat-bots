'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  DollarSign,
  MessageSquare,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalTrials: number;
  expiringTrials: number;
  monthlyIncome: number;
  pendingPayments: number;
  newClientsThisWeek: number;
}

interface TopService {
  name: string;
  code: string;
  total: number;
}

interface LatestClient {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface PendingPayment {
  id: string;
  amount: number;
  client_name: string;
  client_email: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topServices, setTopServices] = useState<TopService[]>([]);
  const [latestClients, setLatestClients] = useState<LatestClient[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await adminApi.getDashboard();
      const data = response.data.data;
      setStats(data.stats);
      setTopServices(data.topServices);
      setLatestClients(data.latestClients);
      setPendingPayments(data.pendingValidation);
    } catch (error) {
      toast.error('Error al cargar el dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidatePayment = async (paymentId: string, approved: boolean) => {
    try {
      await adminApi.validatePayment(paymentId, approved);
      toast.success(approved ? 'Pago aprobado' : 'Pago rechazado');
      fetchDashboard();
    } catch (error) {
      toast.error('Error al procesar el pago');
    }
  };

  const statCards = [
    {
      label: 'Clientes Activos',
      value: stats?.activeClients || 0,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      change: stats?.newClientsThisWeek || 0,
      changeLabel: 'nuevos esta semana',
    },
    {
      label: 'Trials Activos',
      value: stats?.totalTrials || 0,
      icon: Clock,
      color: 'from-orange-500 to-yellow-500',
      change: stats?.expiringTrials || 0,
      changeLabel: 'por vencer',
      isWarning: true,
    },
    {
      label: 'Ingresos del Mes',
      value: `$${stats?.monthlyIncome?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Pagos Pendientes',
      value: stats?.pendingPayments || 0,
      icon: AlertTriangle,
      color: 'from-red-500 to-pink-500',
      isWarning: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 rounded-2xl glass skeleton h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-dark-400">Resumen general del sistema</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-2xl glass card-hover"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-dark-400 text-sm">{card.label}</p>
                <p className="text-3xl font-bold mt-1">{card.value}</p>
                {card.change !== undefined && (
                  <p className={`text-sm mt-2 flex items-center gap-1 ${
                    card.isWarning ? 'text-orange-400' : 'text-green-400'
                  }`}>
                    {card.isWarning ? (
                      <AlertTriangle className="w-3 h-3" />
                    ) : (
                      <TrendingUp className="w-3 h-3" />
                    )}
                    {card.change} {card.changeLabel}
                  </p>
                )}
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pagos Pendientes de Validación */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl glass"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Pagos Pendientes</h2>
            <Link href="/admin/payments" className="text-primary-400 text-sm hover:underline flex items-center gap-1">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {pendingPayments.length === 0 ? (
            <p className="text-dark-500 text-center py-8">No hay pagos pendientes</p>
          ) : (
            <div className="space-y-3">
              {pendingPayments.map((payment) => (
                <div key={payment.id} className="p-4 rounded-xl bg-dark-800/50 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{payment.client_name}</p>
                    <p className="text-sm text-dark-400">{payment.client_email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-green-400">${payment.amount}</span>
                    <button
                      onClick={() => handleValidatePayment(payment.id, true)}
                      className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleValidatePayment(payment.id, false)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Últimos Clientes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl glass"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Últimos Registros</h2>
            <Link href="/admin/clients" className="text-primary-400 text-sm hover:underline flex items-center gap-1">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {latestClients.length === 0 ? (
            <p className="text-dark-500 text-center py-8">No hay clientes registrados</p>
          ) : (
            <div className="space-y-3">
              {latestClients.map((client) => (
                <Link
                  key={client.id}
                  href={`/admin/clients/${client.id}`}
                  className="p-4 rounded-xl bg-dark-800/50 flex items-center gap-4 hover:bg-dark-700/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{client.name}</p>
                    <p className="text-sm text-dark-400 truncate">{client.email}</p>
                  </div>
                  <span className="text-xs text-dark-500">
                    {new Date(client.created_at).toLocaleDateString()}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Servicios Populares */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="p-6 rounded-2xl glass"
      >
        <h2 className="text-lg font-semibold mb-4">Servicios Más Contratados</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {topServices.map((service, index) => (
            <div key={service.code} className="p-4 rounded-xl bg-dark-800/50 text-center">
              <p className="text-2xl font-bold text-primary-400">{service.total}</p>
              <p className="text-sm text-dark-400 mt-1">{service.name}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
