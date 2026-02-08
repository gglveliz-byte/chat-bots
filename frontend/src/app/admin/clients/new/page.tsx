'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  UserPlus,
  Save,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function NewClientPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    businessName: '',
    industry: '',
    country: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await adminApi.createClient(formData);
      toast.success('Cliente creado correctamente');
      router.push('/admin/clients');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al crear cliente');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/clients"
          className="p-2 rounded-xl hover:bg-dark-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <UserPlus className="w-7 h-7 text-primary-400" />
            Crear Nuevo Cliente
          </h1>
          <p className="text-dark-400 mt-1">Registra un nuevo cliente en el sistema</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="p-6 rounded-2xl glass space-y-6">
          {/* Información de Cuenta */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Información de Cuenta</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Nombre Completo <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Juan Pérez"
                  className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white placeholder-dark-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="juan@ejemplo.com"
                  className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white placeholder-dark-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Contraseña <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  placeholder="••••••••"
                  minLength={8}
                  className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white placeholder-dark-500"
                />
                <p className="text-xs text-dark-500 mt-1">Mínimo 8 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+57 300 1234567"
                  className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white placeholder-dark-500"
                />
              </div>
            </div>
          </div>

          {/* Información del Negocio */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Información del Negocio (Opcional)</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Nombre del Negocio
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="Mi Empresa S.A."
                  className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white placeholder-dark-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Industria
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="Tecnología, Retail, etc."
                  className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white placeholder-dark-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  País
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Colombia"
                  className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white placeholder-dark-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-6 border-t border-dark-700">
            <Link
              href="/admin/clients"
              className="px-6 py-3 rounded-xl bg-dark-700 hover:bg-dark-600 text-white font-semibold"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Crear Cliente
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
