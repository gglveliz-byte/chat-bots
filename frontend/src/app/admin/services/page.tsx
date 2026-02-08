'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Edit,
  Save,
  X,
  Loader2,
  DollarSign,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { FaWhatsapp, FaFacebookMessenger, FaInstagram, FaTelegram } from 'react-icons/fa';
import { HiGlobeAlt } from 'react-icons/hi';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Service {
  id: string;
  name: string;
  code: string;
  description: string;
  price_monthly: string;
  icon: string;
  color: string;
  is_active: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Service>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getServices();
      setServices(response.data?.data?.services || []);
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Error al cargar servicios');
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (service: Service) => {
    setEditingId(service.id);
    setEditForm({ ...service });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (id: string) => {
    setIsSaving(true);
    try {
      const payload = {
        name: editForm.name,
        description: editForm.description,
        priceMonthly: editForm.price_monthly,
        isActive: editForm.is_active
      };
      await adminApi.updateService(id, payload);
      toast.success('Servicio actualizado');
      setEditingId(null);
      setEditForm({});
      loadServices();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al actualizar servicio');
    } finally {
      setIsSaving(false);
    }
  };

  const platformIcons: { [key: string]: { Icon: any; color: string } } = {
    whatsapp: { Icon: FaWhatsapp, color: '#25D366' },
    messenger: { Icon: FaFacebookMessenger, color: '#0084FF' },
    instagram: { Icon: FaInstagram, color: '#E4405F' },
    telegram: { Icon: FaTelegram, color: '#0088CC' },
    webchat: { Icon: HiGlobeAlt, color: '#6366F1' },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Package className="w-7 h-7 text-primary-400" />
          Gestión de Servicios
        </h1>
        <p className="text-dark-400 mt-1">
          Administra los servicios disponibles y sus precios
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl glass">
          <div className="text-3xl font-bold text-primary-400">{services.length}</div>
          <div className="text-sm text-dark-400 mt-1">Total Servicios</div>
        </div>
        <div className="p-6 rounded-2xl glass">
          <div className="text-3xl font-bold text-green-400">
            {services.filter(s => s.is_active).length}
          </div>
          <div className="text-sm text-dark-400 mt-1">Activos</div>
        </div>
        <div className="p-6 rounded-2xl glass">
          <div className="text-3xl font-bold text-yellow-400">
            ${services.reduce((sum, s) => sum + parseFloat(s.price_monthly || '0'), 0).toFixed(2)}
          </div>
          <div className="text-sm text-dark-400 mt-1">Precio Total/mes</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {services.map((service) => {
          const isEditing = editingId === service.id;

          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl glass"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${service.color}20` }}
                  >
                    {(() => {
                      const platform = platformIcons[service.code];
                      if (platform) {
                        const PlatformIcon = platform.Icon;
                        return <PlatformIcon size={28} style={{ color: platform.color }} />;
                      }
                      return <span className="text-2xl">{service.icon}</span>;
                    })()}
                  </div>
                  <div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="px-3 py-1 rounded-lg bg-dark-800 border border-dark-700 text-white font-semibold"
                      />
                    ) : (
                      <h3 className="font-semibold text-white">{service.name}</h3>
                    )}
                    <p className="text-sm text-dark-400">{service.code}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleSave(service.id)}
                        disabled={isSaving}
                        className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white"
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEdit(service)}
                      className="p-2 rounded-lg hover:bg-dark-700 text-primary-400"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-4">
                {isEditing ? (
                  <textarea
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-dark-800 border border-dark-700 text-white text-sm"
                  />
                ) : (
                  <p className="text-sm text-dark-300">{service.description}</p>
                )}
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50 mb-4">
                <span className="text-dark-400 text-sm">Precio Mensual:</span>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-dark-400" />
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.price_monthly || ''}
                      onChange={(e) => setEditForm({ ...editForm, price_monthly: e.target.value })}
                      className="w-24 px-3 py-1 rounded-lg bg-dark-800 border border-dark-700 text-white font-bold"
                    />
                  </div>
                ) : (
                  <span className="text-xl font-bold text-primary-400">
                    ${parseFloat(service.price_monthly).toFixed(2)}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50">
                <span className="text-dark-400 text-sm">Estado:</span>
                {isEditing ? (
                  <button
                    onClick={() => setEditForm({ ...editForm, is_active: !editForm.is_active })}
                    className="flex items-center gap-2"
                  >
                    {editForm.is_active ? (
                      <>
                        <ToggleRight className="w-6 h-6 text-green-400" />
                        <span className="text-green-400 font-medium">Activo</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-6 h-6 text-red-400" />
                        <span className="text-red-400 font-medium">Inactivo</span>
                      </>
                    )}
                  </button>
                ) : (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      service.is_active
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {service.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
