'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Filter,
  AlertCircle,
  CheckCircle,
  Loader2,
  Calendar,
  Plus
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Trial {
  id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  service_name: string;
  service_code: string;
  status: string;
  trial_started_at: string;
  trial_ends_at: string;
  days_remaining: number;
}

export default function TrialsPage() {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTrial, setSelectedTrial] = useState<Trial | null>(null);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extensionDays, setExtensionDays] = useState(7);
  const [isExtending, setIsExtending] = useState(false);

  useEffect(() => {
    loadTrials();
  }, [statusFilter]);

  const loadTrials = async () => {
    setIsLoading(true);
    try {
      const status = statusFilter === 'all' ? undefined : statusFilter;
      const response = await adminApi.getTrials(status);
      setTrials(response.data?.data?.trials || []);
    } catch (error) {
      console.error('Error loading trials:', error);
      toast.error('Error al cargar trials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtend = async () => {
    if (!selectedTrial) return;

    setIsExtending(true);
    try {
      await adminApi.extendTrial(selectedTrial.id, extensionDays);
      toast.success(`Trial extendido por ${extensionDays} días`);
      setShowExtendModal(false);
      setSelectedTrial(null);
      setExtensionDays(7);
      loadTrials();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al extender trial');
    } finally {
      setIsExtending(false);
    }
  };

  const getStatusBadge = (status: string, daysRemaining: number) => {
    if (status === 'expired') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-red-500/20 text-red-400 border-red-500/30">
          <AlertCircle className="w-3.5 h-3.5" />
          Expirado
        </span>
      );
    }

    if (daysRemaining <= 2) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
          <Clock className="w-3.5 h-3.5" />
          Por vencer
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-green-500/20 text-green-400 border-green-500/30">
        <CheckCircle className="w-3.5 h-3.5" />
        Activo
      </span>
    );
  };

  const getDaysRemainingColor = (days: number) => {
    if (days <= 0) return 'text-red-400';
    if (days <= 2) return 'text-yellow-400';
    return 'text-green-400';
  };

  const activeTrials = trials.filter(t => t.status === 'trial' && t.days_remaining > 0);
  const expiringTrials = trials.filter(t => t.status === 'trial' && t.days_remaining <= 2 && t.days_remaining > 0);
  const expiredTrials = trials.filter(t => t.days_remaining <= 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Clock className="w-7 h-7 text-primary-400" />
          Gestión de Trials
        </h1>
        <p className="text-dark-400 mt-1">
          Administra los períodos de prueba de los clientes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl glass">
          <div className="text-xl sm:text-3xl font-bold text-primary-400">{trials.length}</div>
          <div className="text-sm text-dark-400 mt-1">Total Trials</div>
        </div>
        <div className="p-6 rounded-2xl glass">
          <div className="text-xl sm:text-3xl font-bold text-green-400">{activeTrials.length}</div>
          <div className="text-sm text-dark-400 mt-1">Activos</div>
        </div>
        <div className="p-6 rounded-2xl glass">
          <div className="text-xl sm:text-3xl font-bold text-yellow-400">{expiringTrials.length}</div>
          <div className="text-sm text-dark-400 mt-1">Por Vencer</div>
        </div>
        <div className="p-6 rounded-2xl glass">
          <div className="text-xl sm:text-3xl font-bold text-red-400">{expiredTrials.length}</div>
          <div className="text-sm text-dark-400 mt-1">Expirados</div>
        </div>
      </div>

      {/* Filter */}
      <div className="p-6 rounded-2xl glass">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Filter className="w-5 h-5 text-dark-400 hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white"
          >
            <option value="all">Todos los estados</option>
            <option value="trial">Activos</option>
            <option value="expired">Expirados</option>
          </select>
          <button
            onClick={loadTrials}
            className="px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold"
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* Trials Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {trials.map((trial) => (
          <motion.div
            key={trial.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl glass"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white">{trial.client_name}</h3>
                <p className="text-sm text-dark-400">{trial.client_email}</p>
              </div>
              {getStatusBadge(trial.status, trial.days_remaining)}
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-dark-800/50">
                <span className="text-sm text-dark-400">Servicio:</span>
                <span className="text-white font-medium">{trial.service_name}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-dark-800/50">
                <span className="text-sm text-dark-400">Días restantes:</span>
                <span className={`text-2xl font-bold ${getDaysRemainingColor(trial.days_remaining)}`}>
                  {trial.days_remaining > 0 ? trial.days_remaining : 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-dark-800/50">
                <span className="text-sm text-dark-400">Inicio:</span>
                <span className="text-white text-sm">
                  {new Date(trial.trial_started_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-dark-800/50">
                <span className="text-sm text-dark-400">Vencimiento:</span>
                <span className="text-white text-sm">
                  {new Date(trial.trial_ends_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {trial.status === 'trial' && (
              <button
                onClick={() => {
                  setSelectedTrial(trial);
                  setShowExtendModal(true);
                }}
                className="w-full px-4 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Extender Trial
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {trials.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <p className="text-dark-400">No hay trials para mostrar</p>
        </div>
      )}

      {/* Extend Modal */}
      {showExtendModal && selectedTrial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-800 rounded-2xl p-6 max-w-md w-full"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary-400" />
              Extender Trial
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <div className="text-sm text-dark-400 mb-1">Cliente</div>
                <div className="text-white font-medium">{selectedTrial.client_name}</div>
              </div>

              <div>
                <div className="text-sm text-dark-400 mb-1">Servicio</div>
                <div className="text-white">{selectedTrial.service_name}</div>
              </div>

              <div>
                <div className="text-sm text-dark-400 mb-1">Días restantes actuales</div>
                <div className="text-2xl font-bold text-primary-400">
                  {selectedTrial.days_remaining}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Días a extender
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={extensionDays}
                  onChange={(e) => setExtensionDays(parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white text-center text-2xl font-bold"
                />
                <p className="text-xs text-dark-500 mt-2">
                  Nuevo total: {selectedTrial.days_remaining + extensionDays} días
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowExtendModal(false);
                  setSelectedTrial(null);
                  setExtensionDays(7);
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-dark-700 hover:bg-dark-600 text-white font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleExtend}
                disabled={isExtending}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold flex items-center justify-center gap-2"
              >
                {isExtending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Extender
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
