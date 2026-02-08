'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Building,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  CreditCard,
  DollarSign,
  MessageCircle,
  Send,
  Instagram,
  ChevronRight
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface BankDetails {
  bank_name: string;
  account_holder: string;
  account_number: string;
  account_type: string;
  routing_number: string;
  swift: string;
  reference_instructions: string;
}

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bank_name: '',
    account_holder: '',
    account_number: '',
    account_type: 'Ahorros',
    routing_number: '',
    swift: '',
    reference_instructions: 'Incluye tu email como referencia de la transferencia'
  });

  useEffect(() => {
    loadBankDetails();
  }, []);

  const loadBankDetails = async () => {
    try {
      const response = await adminApi.getBankDetails();
      if (response.data?.data?.bankDetails) {
        setBankDetails(response.data.data.bankDetails);
      }
    } catch (error) {
      console.error('Error loading bank details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bankDetails.bank_name || !bankDetails.account_holder || !bankDetails.account_number) {
      toast.error('Completa los campos requeridos');
      return;
    }

    setIsSaving(true);
    try {
      await adminApi.updateBankDetails(bankDetails);
      toast.success('Datos bancarios actualizados');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Settings className="w-7 h-7 text-primary-400" />
          Configuración del Sistema
        </h1>
        <p className="text-dark-400 mt-1">
          Configura los parámetros generales de la plataforma
        </p>
      </div>

      {/* API Configuration Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid md:grid-cols-3 gap-4"
      >
        {/* Meta API Config */}
        <Link
          href="/admin/settings/meta"
          className="p-6 rounded-2xl glass hover:bg-dark-700/50 transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
              <MessageCircle className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-semibold text-white">Meta API</h3>
          </div>
          <p className="text-sm text-dark-400 mb-4">
            Configura WhatsApp, Messenger e Instagram
          </p>
          <div className="flex items-center text-primary-400 text-sm font-medium">
            Configurar <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </Link>

        {/* Telegram Config */}
        <Link
          href="/admin/settings/telegram"
          className="p-6 rounded-2xl glass hover:bg-dark-700/50 transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-cyan-500/20 group-hover:bg-cyan-500/30 transition-colors">
              <Send className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="font-semibold text-white">Telegram</h3>
          </div>
          <p className="text-sm text-dark-400 mb-4">
            Configura tu bot de Telegram
          </p>
          <div className="flex items-center text-primary-400 text-sm font-medium">
            Configurar <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </Link>

        {/* PayPal Config */}
        <div className="p-6 rounded-2xl glass">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-yellow-500/20">
              <CreditCard className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="font-semibold text-white">PayPal</h3>
          </div>
          <p className="text-sm text-dark-400 mb-4">
            Configura en backend/.env
          </p>
          <div className="text-dark-500 text-sm font-medium">
            Ver SETUP_PAYPAL.md
          </div>
        </div>
      </motion.div>

      {/* Bank Details Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl glass"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-green-500/20">
            <Building className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Datos Bancarios para Transferencias
            </h2>
            <p className="text-sm text-dark-400">
              Estos datos se mostrarán a los clientes cuando elijan pago por transferencia
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre del banco */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Nombre del Banco *
              </label>
              <input
                type="text"
                value={bankDetails.bank_name}
                onChange={(e) => setBankDetails({ ...bankDetails, bank_name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white placeholder-dark-500"
                placeholder="Ej: Banco Nacional"
                required
              />
            </div>

            {/* Titular */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Titular de la Cuenta *
              </label>
              <input
                type="text"
                value={bankDetails.account_holder}
                onChange={(e) => setBankDetails({ ...bankDetails, account_holder: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white placeholder-dark-500"
                placeholder="Nombre completo del titular"
                required
              />
            </div>

            {/* Número de cuenta */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Número de Cuenta *
              </label>
              <input
                type="text"
                value={bankDetails.account_number}
                onChange={(e) => setBankDetails({ ...bankDetails, account_number: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white placeholder-dark-500 font-mono"
                placeholder="1234567890"
                required
              />
            </div>

            {/* Tipo de cuenta */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Tipo de Cuenta
              </label>
              <select
                value={bankDetails.account_type}
                onChange={(e) => setBankDetails({ ...bankDetails, account_type: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white appearance-none cursor-pointer"
              >
                <option value="Ahorros">Cuenta de Ahorros</option>
                <option value="Corriente">Cuenta Corriente</option>
                <option value="Empresarial">Cuenta Empresarial</option>
              </select>
            </div>

            {/* Routing Number */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Routing Number (opcional)
              </label>
              <input
                type="text"
                value={bankDetails.routing_number}
                onChange={(e) => setBankDetails({ ...bankDetails, routing_number: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white placeholder-dark-500 font-mono"
                placeholder="Para transferencias internacionales"
              />
            </div>

            {/* SWIFT */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Código SWIFT (opcional)
              </label>
              <input
                type="text"
                value={bankDetails.swift}
                onChange={(e) => setBankDetails({ ...bankDetails, swift: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white placeholder-dark-500 font-mono"
                placeholder="XXXXXXXX"
              />
            </div>
          </div>

          {/* Instrucciones */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Instrucciones de Referencia
            </label>
            <textarea
              value={bankDetails.reference_instructions}
              onChange={(e) => setBankDetails({ ...bankDetails, reference_instructions: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white placeholder-dark-500 resize-none"
              placeholder="Ej: Incluye tu email como referencia de la transferencia"
            />
            <p className="text-xs text-dark-500 mt-1">
              Este texto se mostrará a los clientes como instrucción adicional
            </p>
          </div>

          {/* Info Card */}
          <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-300 text-sm font-medium">
                  Importante
                </p>
                <p className="text-dark-400 text-sm mt-1">
                  Los clientes verán estos datos al elegir el método de pago por transferencia.
                  Asegúrate de que la información sea correcta para evitar problemas con los pagos.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Guardar Datos Bancarios
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Payment Methods Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl glass"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-blue-500/20">
            <CreditCard className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Estado de Métodos de Pago
            </h2>
            <p className="text-sm text-dark-400">
              Verifica la configuración de los métodos de pago disponibles
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* PayPal Status */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-[#00457C]">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z"/>
              </svg>
              <div>
                <p className="font-medium text-white">PayPal</p>
                <p className="text-sm text-dark-400">
                  Configura PAYPAL_CLIENT_ID y PAYPAL_SECRET en el backend
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm">
                Verificar .env
              </span>
            </div>
          </div>

          {/* Card Payment Status */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-primary-400" />
              <div>
                <p className="font-medium text-white">Tarjeta de Crédito/Débito</p>
                <p className="text-sm text-dark-400">
                  Procesado a través de PayPal (PayPal Checkout)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 text-sm">Vinculado a PayPal</span>
            </div>
          </div>

          {/* Bank Transfer Status */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50">
            <div className="flex items-center gap-3">
              <Building className="w-8 h-8 text-green-400" />
              <div>
                <p className="font-medium text-white">Transferencia Bancaria</p>
                <p className="text-sm text-dark-400">
                  Validación manual por el administrador
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {bankDetails.bank_name ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 text-sm">Configurado</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 text-sm">Pendiente</span>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
