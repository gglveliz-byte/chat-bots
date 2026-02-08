'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Timer, Play, Loader2, CheckCircle, AlertTriangle,
  RefreshCw, Clock, Trash2, Shield, Zap
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Job {
  id: string;
  name: string;
  description: string;
  schedule: string;
  icon: any;
  color: string;
  category: 'critical' | 'maintenance' | 'cleanup';
}

const jobs: Job[] = [
  {
    id: 'expireTrials',
    name: 'Expirar Trials',
    description: 'Marca como expirados los trials que pasaron su fecha límite.',
    schedule: 'Cada hora (:05)',
    icon: Clock,
    color: '#f59e0b',
    category: 'critical',
  },
  {
    id: 'expireSubscriptions',
    name: 'Expirar Suscripciones',
    description: 'Marca como expiradas las suscripciones que pasaron su fecha de renovación.',
    schedule: 'Cada hora (:10)',
    icon: AlertTriangle,
    color: '#ef4444',
    category: 'critical',
  },
  {
    id: 'notifyExpiringTrials',
    name: 'Notificar Trials por Expirar',
    description: 'Detecta trials que expiran en < 2 días y prepara notificaciones.',
    schedule: 'Cada 6 horas',
    icon: Zap,
    color: '#8b5cf6',
    category: 'critical',
  },
  {
    id: 'refreshTokens',
    name: 'Renovar Tokens Meta',
    description: 'Renueva tokens de Meta API que expiran en < 7 días automáticamente.',
    schedule: 'Cada 12 horas (2AM / 2PM)',
    icon: RefreshCw,
    color: '#3b82f6',
    category: 'maintenance',
  },
  {
    id: 'cleanup',
    name: 'Limpieza General',
    description: 'Elimina tokens JWT expirados, códigos de verificación usados, estados OAuth viejos y sesiones webchat inactivas.',
    schedule: 'Diario (3:00 AM)',
    icon: Trash2,
    color: '#6b7280',
    category: 'cleanup',
  },
];

const categoryLabels: Record<string, { label: string; color: string }> = {
  critical: { label: 'Crítico', color: 'text-red-400' },
  maintenance: { label: 'Mantenimiento', color: 'text-blue-400' },
  cleanup: { label: 'Limpieza', color: 'text-gray-400' },
};

export default function CronJobsPage() {
  const [running, setRunning] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, { success: boolean; message: string; time: string }>>({});

  const runJob = async (jobId: string) => {
    setRunning(prev => ({ ...prev, [jobId]: true }));
    setResults(prev => {
      const copy = { ...prev };
      delete copy[jobId];
      return copy;
    });

    try {
      const res = await adminApi.runJob(jobId);
      setResults(prev => ({
        ...prev,
        [jobId]: {
          success: true,
          message: res.data?.message || 'Ejecutado correctamente',
          time: new Date().toLocaleTimeString('es'),
        }
      }));
      toast.success(`${jobId} ejecutado correctamente`);
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Error al ejecutar';
      setResults(prev => ({
        ...prev,
        [jobId]: {
          success: false,
          message: msg,
          time: new Date().toLocaleTimeString('es'),
        }
      }));
      toast.error(msg);
    } finally {
      setRunning(prev => ({ ...prev, [jobId]: false }));
    }
  };

  const runAll = async () => {
    for (const job of jobs) {
      await runJob(job.id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-white">
            <Timer className="w-7 h-7 text-primary-400" />
            CRON Jobs
          </h1>
          <p className="text-dark-400 mt-1 text-sm md:text-base">
            Tareas automatizadas del sistema. Se ejecutan automáticamente según su horario.
          </p>
        </div>
        <button
          onClick={runAll}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity flex-shrink-0"
        >
          <Play className="w-4 h-4" />
          Ejecutar Todos
        </button>
      </div>

      {/* Info */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-400">
            Los CRON jobs se ejecutan automáticamente en el servidor. Desde aquí puedes ejecutarlos manualmente para pruebas o en caso de emergencia. Los horarios están en zona horaria del servidor (UTC-5 Ecuador).
          </p>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-3">
        {jobs.map((job, index) => {
          const Icon = job.icon;
          const isRunning = running[job.id];
          const result = results[job.id];
          const cat = categoryLabels[job.category];

          return (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-5 rounded-2xl border border-white/5"
              style={{ backgroundColor: 'rgba(30,41,59,0.5)' }}
            >
              <div className="flex flex-col sm:flex-row items-start gap-4">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${job.color}15` }}>
                  <Icon className="w-6 h-6" style={{ color: job.color }} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-white">{job.name}</h3>
                    <span className={`text-xs font-medium ${cat.color}`}>
                      {cat.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{job.description}</p>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {job.schedule}
                    </span>
                    {result && (
                      <span className={`text-xs flex items-center gap-1 ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                        {result.success ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {result.message} ({result.time})
                      </span>
                    )}
                  </div>
                </div>

                {/* Run Button */}
                <button
                  onClick={() => runJob(job.id)}
                  disabled={isRunning}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 flex-shrink-0"
                  style={{
                    backgroundColor: `${job.color}15`,
                    color: job.color,
                  }}
                >
                  {isRunning ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  {isRunning ? 'Ejecutando...' : 'Ejecutar'}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Schedule Overview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-5 rounded-2xl border border-white/5"
        style={{ backgroundColor: 'rgba(30,41,59,0.5)' }}
      >
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-400" />
          Horario Completo
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-2 text-gray-500 font-medium">Job</th>
                <th className="text-left py-2 text-gray-500 font-medium">Frecuencia</th>
                <th className="text-left py-2 text-gray-500 font-medium">Hora</th>
                <th className="text-left py-2 text-gray-500 font-medium">Prioridad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr><td className="py-2.5 text-gray-300">expireTrials</td><td className="py-2.5 text-gray-400">Cada hora</td><td className="py-2.5 text-gray-400">:05</td><td className="py-2.5 text-red-400">Crítico</td></tr>
              <tr><td className="py-2.5 text-gray-300">expireSubscriptions</td><td className="py-2.5 text-gray-400">Cada hora</td><td className="py-2.5 text-gray-400">:10</td><td className="py-2.5 text-red-400">Crítico</td></tr>
              <tr><td className="py-2.5 text-gray-300">notifyExpiringTrials</td><td className="py-2.5 text-gray-400">Cada 6h</td><td className="py-2.5 text-gray-400">0:00, 6:00, 12:00, 18:00</td><td className="py-2.5 text-purple-400">Crítico</td></tr>
              <tr><td className="py-2.5 text-gray-300">refreshTokens</td><td className="py-2.5 text-gray-400">Cada 12h</td><td className="py-2.5 text-gray-400">2:00 AM / 2:00 PM</td><td className="py-2.5 text-blue-400">Mantenimiento</td></tr>
              <tr><td className="py-2.5 text-gray-300">cleanup</td><td className="py-2.5 text-gray-400">Diario</td><td className="py-2.5 text-gray-400">3:00 AM</td><td className="py-2.5 text-gray-400">Limpieza</td></tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
