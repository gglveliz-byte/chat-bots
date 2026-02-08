'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Building,
  Receipt,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  AlertCircle,
  Copy,
  Check,
  Loader2,
  CreditCard
} from 'lucide-react';
import { clientApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import {
  PayPalScriptProvider,
  PayPalButtons,
  PayPalCardFieldsProvider,
  PayPalNumberField,
  PayPalExpiryField,
  PayPalCVVField,
  PayPalNameField,
  usePayPalCardFields
} from '@paypal/react-paypal-js';

interface Payment {
  id: string;
  service_name: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  reference?: string;
  paypal_order_id?: string;
  paypal_capture_id?: string;
  created_at: string;
}

interface ServiceToPay {
  client_service_id: string;
  service_name: string;
  service_code: string;
  price_monthly: string;
  status: string;
  expires_at: string;
  days_remaining: number;
}

interface BankDetails {
  bank_name: string;
  account_holder: string;
  account_number: string;
  account_type: string;
  routing_number?: string;
  swift?: string;
  reference_instructions: string;
}

type PaymentMethod = 'paypal' | 'transfer';
type TabType = 'pay' | 'history';

// Componente interno para el botón de pagar con tarjeta (necesita estar dentro del CardFieldsProvider)
function CardFieldsSubmitButton({ isProcessing }: { isProcessing: boolean }) {
  const { cardFieldsForm } = usePayPalCardFields();

  const handleClick = async () => {
    if (!cardFieldsForm) {
      toast.error('Error al cargar los campos de tarjeta');
      return;
    }

    const formState = await cardFieldsForm.getState();
    if (!formState.isFormValid) {
      toast.error('Completa todos los campos de la tarjeta correctamente');
      return;
    }

    cardFieldsForm.submit();
  };

  return (
    <button
      onClick={handleClick}
      disabled={isProcessing}
      className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-primary-500/25"
    >
      {isProcessing ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          <CreditCard className="w-5 h-5" />
          Pagar con Tarjeta
        </>
      )}
    </button>
  );
}

export default function PaymentsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('pay');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('paypal');
  const [servicesToPay, setServicesToPay] = useState<ServiceToPay[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Para transferencia bancaria
  const [transferProof, setTransferProof] = useState<File | null>(null);
  const [transferReference, setTransferReference] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [servicesRes, paymentsRes, bankRes] = await Promise.all([
        clientApi.getServicesToPay(),
        clientApi.getPaymentHistory(),
        clientApi.getBankDetails()
      ]);

      setServicesToPay(servicesRes.data?.data?.services || []);
      setPayments(paymentsRes.data?.data?.payments || []);
      setBankDetails(bankRes.data?.data?.bankDetails || null);

      // Seleccionar primer servicio por defecto
      if (servicesRes.data?.data?.services?.length > 0) {
        setSelectedService(servicesRes.data.data.services[0].client_service_id);
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferSubmit = async () => {
    if (!selectedService) {
      toast.error('Selecciona un servicio para pagar');
      return;
    }

    if (!transferProof) {
      toast.error('Adjunta el comprobante de transferencia');
      return;
    }

    if (!transferReference) {
      toast.error('Ingresa el número de referencia');
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('client_service_id', selectedService);
      formData.append('proof', transferProof);
      formData.append('reference', transferReference);

      await clientApi.submitTransferProof(formData);
      toast.success('Comprobante enviado. Pendiente de validación.');
      loadData();
      setTransferProof(null);
      setTransferReference('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al enviar comprobante');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copiado al portapapeles');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-green-400 text-sm">
            <CheckCircle className="w-4 h-4" /> Completado
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-yellow-400 text-sm">
            <Clock className="w-4 h-4" /> Pendiente
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1 text-red-400 text-sm">
            <XCircle className="w-4 h-4" /> Fallido
          </span>
        );
      default:
        return (
          <span className="text-dark-400 text-sm">{status}</span>
        );
    }
  };

  const getSelectedServicePrice = () => {
    const service = servicesToPay.find(s => s.client_service_id === selectedService);
    return parseFloat(service?.price_monthly || '0');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';

  return (
    <PayPalScriptProvider options={{
      clientId: paypalClientId,
      components: 'buttons,card-fields',
      intent: 'capture',
      currency: 'USD'
    }}>
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 px-2 sm:px-0">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
            <Wallet className="w-6 h-6 sm:w-7 sm:h-7 text-primary-400" />
            Mis Pagos
          </h1>
          <p className="text-dark-400 mt-1 text-sm sm:text-base">
            Gestiona tus pagos y suscripciones
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-dark-800/50 rounded-xl w-full sm:w-fit">
          <button
            onClick={() => setActiveTab('pay')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
              activeTab === 'pay'
                ? 'bg-primary-500 text-white'
                : 'text-dark-400 hover:text-white'
            }`}
          >
            Realizar Pago
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
              activeTab === 'history'
                ? 'bg-primary-500 text-white'
                : 'text-dark-400 hover:text-white'
            }`}
          >
            Historial
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'pay' ? (
            <motion.div
              key="pay"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {servicesToPay.length === 0 ? (
                <div className="p-8 rounded-2xl glass text-center">
                  <Receipt className="w-12 h-12 text-dark-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    No tienes servicios pendientes de pago
                  </h3>
                  <p className="text-dark-400">
                    Todos tus servicios están al día o aún en período de prueba
                  </p>
                </div>
              ) : (
                <>
                  {/* Seleccionar Servicio */}
                  <div className="p-4 sm:p-6 rounded-2xl glass">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
                      Selecciona el servicio a pagar
                    </h3>
                    <div className="grid gap-3">
                      {servicesToPay.map((service) => (
                        <label
                          key={service.client_service_id}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedService === service.client_service_id
                              ? 'border-primary-500 bg-primary-500/10'
                              : 'border-dark-700 hover:border-dark-600'
                          }`}
                        >
                          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                            <input
                              type="radio"
                              name="service"
                              value={service.client_service_id}
                              checked={selectedService === service.client_service_id}
                              onChange={(e) => setSelectedService(e.target.value)}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 mt-0.5 sm:mt-0 shrink-0 rounded-full border-2 flex items-center justify-center ${
                              selectedService === service.client_service_id
                                ? 'border-primary-500'
                                : 'border-dark-600'
                            }`}>
                              {selectedService === service.client_service_id && (
                                <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-white text-sm sm:text-base">
                                {service.service_name}
                              </div>
                              <div className="text-xs sm:text-sm text-dark-400">
                                {service.status === 'trial' ? (
                                  <span className="text-yellow-400">
                                    Prueba - {service.days_remaining} días restantes
                                  </span>
                                ) : (
                                  <span>
                                    Vence: {new Date(service.expires_at).toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' })}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-lg sm:text-xl font-bold text-primary-400 shrink-0">
                              ${parseFloat(service.price_monthly).toFixed(2)}
                              <span className="text-xs sm:text-sm text-dark-400 font-normal">/mes</span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Métodos de Pago */}
                  <div className="p-4 sm:p-6 rounded-2xl glass">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
                      Método de pago
                    </h3>

                    {/* Tabs de método - solo 2: PayPal y Transferencia */}
                    <div className="flex gap-2 mb-4 sm:mb-6">
                      <button
                        onClick={() => setSelectedMethod('paypal')}
                        className={`flex-1 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                          selectedMethod === 'paypal'
                            ? 'border-[#0070ba] bg-[#0070ba]/10'
                            : 'border-dark-700 hover:border-dark-600'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 fill-[#00457C]">
                            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.566 6.082-8.558 6.082h-2.19c-1.717 0-3.146 1.27-3.402 2.94l-1.593 10.102a.647.647 0 0 0 .633.74h4.606c.524 0 .968-.382 1.05-.9l.86-5.45c.082-.52.526-.9 1.05-.9h.66c4.298 0 7.664-1.748 8.647-6.797.323-1.658.065-3.048-.658-4.053-.2-.274-.432-.515-.697-.727z"/>
                          </svg>
                          <span className={`font-medium text-sm sm:text-base ${selectedMethod === 'paypal' ? 'text-[#0070ba]' : 'text-dark-300'}`}>
                            PayPal / Tarjeta
                          </span>
                        </div>
                      </button>

                      <button
                        onClick={() => setSelectedMethod('transfer')}
                        className={`flex-1 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                          selectedMethod === 'transfer'
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-dark-700 hover:border-dark-600'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Building className={`w-5 h-5 sm:w-6 sm:h-6 ${selectedMethod === 'transfer' ? 'text-green-400' : 'text-dark-400'}`} />
                          <span className={`font-medium text-sm sm:text-base ${selectedMethod === 'transfer' ? 'text-green-400' : 'text-dark-300'}`}>
                            Transferencia
                          </span>
                        </div>
                      </button>
                    </div>

                    {/* Contenido según método */}
                    <AnimatePresence mode="wait">
                      {selectedMethod === 'paypal' && (
                        <motion.div
                          key="paypal"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-6"
                        >
                          <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-dark-800/50">
                            <span className="text-dark-400 text-sm sm:text-base">Total a pagar:</span>
                            <span className="text-xl sm:text-2xl font-bold text-white">
                              ${getSelectedServicePrice().toFixed(2)} USD
                            </span>
                          </div>

                          {/* PayPal Buttons */}
                          <div>
                            <div className="p-4 rounded-xl bg-[#0070ba]/10 border border-[#0070ba]/30 mb-4">
                              <p className="text-dark-300 text-sm">
                                Usa tu cuenta PayPal o paga con tarjeta a través de PayPal. Todo se procesa de forma segura sin salir de esta página.
                              </p>
                            </div>
                            <div className="bg-white rounded-xl p-4">
                              <PayPalButtons
                                style={{
                                  layout: 'vertical',
                                  color: 'blue',
                                  shape: 'rect',
                                  label: 'pay',
                                  height: 45
                                }}
                                disabled={!selectedService}
                                createOrder={async () => {
                                  try {
                                    const response = await clientApi.createPayPalOrder(selectedService);
                                    return response.data.data.orderId;
                                  } catch (error: any) {
                                    toast.error(error.response?.data?.error || 'Error al crear orden de PayPal');
                                    throw error;
                                  }
                                }}
                                onApprove={async (data) => {
                                  try {
                                    setIsProcessing(true);
                                    await clientApi.capturePayPalOrder(data.orderID);
                                    toast.success('Pago completado exitosamente');
                                    loadData();
                                  } catch (error: any) {
                                    toast.error(error.response?.data?.error || 'Error al procesar el pago');
                                  } finally {
                                    setIsProcessing(false);
                                  }
                                }}
                                onError={(err) => {
                                  console.error('PayPal error:', err);
                                  toast.error('Error con PayPal. Intenta de nuevo.');
                                }}
                                onCancel={() => {
                                  toast('Pago cancelado', { icon: '⚠️' });
                                }}
                              />
                            </div>
                          </div>

                          {/* Divider */}
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-dark-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                              <span className="px-4 bg-dark-900 text-dark-400">o paga con tarjeta</span>
                            </div>
                          </div>

                          {/* Card Fields */}
                          <div>
                            <PayPalCardFieldsProvider
                              createOrder={async () => {
                                try {
                                  const response = await clientApi.createPayPalOrder(selectedService);
                                  return response.data.data.orderId;
                                } catch (error: any) {
                                  toast.error(error.response?.data?.error || 'Error al crear orden');
                                  throw error;
                                }
                              }}
                              onApprove={async (data) => {
                                try {
                                  setIsProcessing(true);
                                  await clientApi.capturePayPalOrder(data.orderID);
                                  toast.success('Pago con tarjeta completado exitosamente');
                                  loadData();
                                } catch (error: any) {
                                  toast.error(error.response?.data?.error || 'Error al procesar el pago');
                                } finally {
                                  setIsProcessing(false);
                                }
                              }}
                              onError={(err) => {
                                console.error('Card fields error:', err);
                                toast.error('Error al procesar la tarjeta. Verifica los datos.');
                                setIsProcessing(false);
                              }}
                              style={{
                                input: {
                                  'font-size': '16px',
                                  'font-family': 'inherit',
                                  color: '#e2e8f0',
                                  padding: '12px 16px'
                                },
                                'input:focus': {
                                  color: '#e2e8f0'
                                },
                                '.invalid': {
                                  color: '#f87171'
                                }
                              }}
                            >
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-dark-300 mb-2">
                                    Nombre del titular
                                  </label>
                                  <div className="rounded-xl overflow-hidden border border-dark-700 bg-dark-800/50">
                                    <PayPalNameField className="paypal-card-field" />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-dark-300 mb-2">
                                    Número de tarjeta
                                  </label>
                                  <div className="rounded-xl overflow-hidden border border-dark-700 bg-dark-800/50">
                                    <PayPalNumberField className="paypal-card-field" />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">
                                      Vencimiento
                                    </label>
                                    <div className="rounded-xl overflow-hidden border border-dark-700 bg-dark-800/50">
                                      <PayPalExpiryField className="paypal-card-field" />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">
                                      CVV
                                    </label>
                                    <div className="rounded-xl overflow-hidden border border-dark-700 bg-dark-800/50">
                                      <PayPalCVVField className="paypal-card-field" />
                                    </div>
                                  </div>
                                </div>

                                <CardFieldsSubmitButton isProcessing={isProcessing} />
                              </div>
                            </PayPalCardFieldsProvider>

                            <p className="text-xs text-dark-500 text-center mt-3">
                              Pagos procesados de forma segura por PayPal. Tu información está protegida.
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {selectedMethod === 'transfer' && (
                        <motion.div
                          key="transfer"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-4"
                        >
                          {bankDetails ? (
                            <>
                              {/* Datos bancarios */}
                              <div className="p-3 sm:p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                                <h4 className="font-semibold text-green-400 mb-3 text-sm sm:text-base">
                                  Datos para transferencia
                                </h4>
                                <div className="space-y-3">
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                    <span className="text-dark-400 text-xs sm:text-sm">Banco:</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-white font-medium text-sm sm:text-base">{bankDetails.bank_name}</span>
                                      <button
                                        onClick={() => copyToClipboard(bankDetails.bank_name, 'bank')}
                                        className="p-1 hover:bg-dark-700 rounded"
                                      >
                                        {copiedField === 'bank' ? (
                                          <Check className="w-4 h-4 text-green-400" />
                                        ) : (
                                          <Copy className="w-4 h-4 text-dark-400" />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                    <span className="text-dark-400 text-xs sm:text-sm">Titular:</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-white font-medium text-sm sm:text-base">{bankDetails.account_holder}</span>
                                      <button
                                        onClick={() => copyToClipboard(bankDetails.account_holder, 'holder')}
                                        className="p-1 hover:bg-dark-700 rounded"
                                      >
                                        {copiedField === 'holder' ? (
                                          <Check className="w-4 h-4 text-green-400" />
                                        ) : (
                                          <Copy className="w-4 h-4 text-dark-400" />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                    <span className="text-dark-400 text-xs sm:text-sm">Número de cuenta:</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-white font-medium font-mono text-sm sm:text-base break-all">{bankDetails.account_number}</span>
                                      <button
                                        onClick={() => copyToClipboard(bankDetails.account_number, 'account')}
                                        className="p-1 hover:bg-dark-700 rounded shrink-0"
                                      >
                                        {copiedField === 'account' ? (
                                          <Check className="w-4 h-4 text-green-400" />
                                        ) : (
                                          <Copy className="w-4 h-4 text-dark-400" />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                    <span className="text-dark-400 text-xs sm:text-sm">Tipo:</span>
                                    <span className="text-white font-medium text-sm sm:text-base">{bankDetails.account_type}</span>
                                  </div>
                                  {bankDetails.routing_number && (
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                      <span className="text-dark-400 text-xs sm:text-sm">Routing:</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-white font-medium font-mono text-sm sm:text-base">{bankDetails.routing_number}</span>
                                        <button
                                          onClick={() => copyToClipboard(bankDetails.routing_number!, 'routing')}
                                          className="p-1 hover:bg-dark-700 rounded"
                                        >
                                          {copiedField === 'routing' ? (
                                            <Check className="w-4 h-4 text-green-400" />
                                          ) : (
                                            <Copy className="w-4 h-4 text-dark-400" />
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                  {bankDetails.swift && (
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                      <span className="text-dark-400 text-xs sm:text-sm">SWIFT:</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-white font-medium font-mono text-sm sm:text-base">{bankDetails.swift}</span>
                                        <button
                                          onClick={() => copyToClipboard(bankDetails.swift!, 'swift')}
                                          className="p-1 hover:bg-dark-700 rounded"
                                        >
                                          {copiedField === 'swift' ? (
                                            <Check className="w-4 h-4 text-green-400" />
                                          ) : (
                                            <Copy className="w-4 h-4 text-dark-400" />
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {bankDetails.reference_instructions && (
                                  <div className="mt-3 pt-3 border-t border-green-500/30">
                                    <p className="text-xs sm:text-sm text-green-300">
                                      <AlertCircle className="w-4 h-4 inline mr-1" />
                                      {bankDetails.reference_instructions}
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-dark-800/50">
                                <span className="text-dark-400 text-sm sm:text-base">Monto a transferir:</span>
                                <span className="text-xl sm:text-2xl font-bold text-white">
                                  ${getSelectedServicePrice().toFixed(2)} USD
                                </span>
                              </div>

                              {/* Formulario de comprobante */}
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-dark-300 mb-2">
                                    Número de referencia / comprobante
                                  </label>
                                  <input
                                    type="text"
                                    value={transferReference}
                                    onChange={(e) => setTransferReference(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-green-500 text-white placeholder-dark-500"
                                    placeholder="Ej: REF123456789"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-dark-300 mb-2">
                                    Comprobante de transferencia
                                  </label>
                                  <div className="relative">
                                    <input
                                      type="file"
                                      accept="image/*,.pdf"
                                      onChange={(e) => setTransferProof(e.target.files?.[0] || null)}
                                      className="hidden"
                                      id="transfer-proof"
                                    />
                                    <label
                                      htmlFor="transfer-proof"
                                      className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-dark-700 hover:border-green-500 cursor-pointer transition-colors"
                                    >
                                      {transferProof ? (
                                        <span className="text-green-400 flex items-center gap-2">
                                          <CheckCircle className="w-5 h-5" />
                                          {transferProof.name}
                                        </span>
                                      ) : (
                                        <span className="text-dark-400 flex items-center gap-2">
                                          <Upload className="w-5 h-5" />
                                          Subir comprobante (imagen o PDF)
                                        </span>
                                      )}
                                    </label>
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={handleTransferSubmit}
                                disabled={isProcessing || !selectedService || !transferProof || !transferReference}
                                className="w-full py-4 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                              >
                                {isProcessing ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  <>
                                    <Upload className="w-5 h-5" />
                                    Enviar Comprobante
                                  </>
                                )}
                              </button>

                              <p className="text-xs text-dark-500 text-center">
                                Tu pago será validado en un plazo de 24-48 horas hábiles
                              </p>
                            </>
                          ) : (
                            <div className="p-8 text-center">
                              <Building className="w-12 h-12 text-dark-500 mx-auto mb-4" />
                              <h3 className="text-lg font-semibold text-white mb-2">
                                Transferencia no disponible
                              </h3>
                              <p className="text-dark-400">
                                El administrador aún no ha configurado los datos bancarios para transferencias.
                              </p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 sm:p-6 rounded-2xl glass"
            >
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4">
                Historial de Pagos
              </h3>

              {payments.length === 0 ? (
                <div className="p-8 text-center">
                  <Receipt className="w-12 h-12 text-dark-500 mx-auto mb-4" />
                  <p className="text-dark-400">
                    Aún no tienes pagos registrados
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile: Cards */}
                  <div className="sm:hidden space-y-3">
                    {payments.map((payment) => (
                      <div key={payment.id} className="p-4 rounded-xl bg-dark-800/50 border border-dark-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium text-sm">{payment.service_name}</span>
                          {getStatusBadge(payment.status)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-primary-400 font-bold">${Number(payment.amount).toFixed(2)} {payment.currency}</span>
                          <span className="text-dark-400 text-xs">
                            {payment.method === 'paypal' && 'PayPal'}
                            {payment.method === 'card' && 'Tarjeta'}
                            {payment.method === 'transfer' && 'Transferencia'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-dark-400">
                          <span>{new Date(payment.created_at).toLocaleDateString()}</span>
                          <span className="font-mono">{payment.reference || '-'}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop: Table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-dark-400 text-sm border-b border-dark-700">
                          <th className="pb-3 font-medium">Fecha</th>
                          <th className="pb-3 font-medium">Servicio</th>
                          <th className="pb-3 font-medium">Método</th>
                          <th className="pb-3 font-medium">Monto</th>
                          <th className="pb-3 font-medium">Estado</th>
                          <th className="pb-3 font-medium">Referencia</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-700/50">
                        {payments.map((payment) => (
                          <tr key={payment.id} className="text-sm">
                            <td className="py-4 text-dark-300">
                              {new Date(payment.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-4 text-white font-medium">
                              {payment.service_name}
                            </td>
                            <td className="py-4">
                              <span className="capitalize text-dark-300">
                                {payment.method === 'paypal' && 'PayPal'}
                                {payment.method === 'card' && 'Tarjeta'}
                                {payment.method === 'transfer' && 'Transferencia'}
                              </span>
                            </td>
                            <td className="py-4 text-white font-medium">
                              ${parseFloat(payment.amount).toFixed(2)} {payment.currency}
                            </td>
                            <td className="py-4">
                              {getStatusBadge(payment.status)}
                            </td>
                            <td className="py-4 text-dark-400 font-mono text-xs">
                              {payment.reference || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PayPalScriptProvider>
  );
}
