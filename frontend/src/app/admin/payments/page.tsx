'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  DollarSign,
  FileText,
  Download
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Payment {
  id: string;
  client_name: string;
  client_email: string;
  service_name: string;
  amount: string;
  currency: string;
  method: string;
  status: string;
  reference: string;
  receipt_url: string;
  paypal_order_id: string;
  paypal_capture_id: string;
  notes: string;
  created_at: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [validationNotes, setValidationNotes] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    loadPayments();
  }, [currentPage, statusFilter, methodFilter]);

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: 20
      };

      if (statusFilter !== 'all') params.status = statusFilter;
      if (methodFilter !== 'all') params.method = methodFilter;

      const response = await adminApi.getPayments(params);
      setPayments(response.data?.data?.payments || []);
      setTotalPages(response.data?.data?.pagination?.pages || 1);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Error al cargar pagos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidate = async (approved: boolean) => {
    if (!selectedPayment) return;

    setIsValidating(true);
    try {
      await adminApi.validatePayment(selectedPayment.id, approved, validationNotes);
      toast.success(approved ? 'Pago aprobado' : 'Pago rechazado');
      setShowModal(false);
      setSelectedPayment(null);
      setValidationNotes('');
      loadPayments();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al validar pago');
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', icon: Clock },
      approved: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', icon: CheckCircle },
      rejected: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', icon: XCircle },
      completed: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', icon: CheckCircle }
    };

    const style = styles[status as keyof typeof styles] || styles.pending;
    const Icon = style.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
        <Icon className="w-3.5 h-3.5" />
        {status}
      </span>
    );
  };

  const getMethodBadge = (method: string) => {
    const styles: any = {
      paypal: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'PayPal' },
      transfer: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Transferencia' },
      card: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Tarjeta' }
    };

    const style = styles[method] || { bg: 'bg-gray-500/20', text: 'text-gray-400', label: method };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);
  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const approvedCount = payments.filter(p => p.status === 'approved' || p.status === 'completed').length;

  if (isLoading && payments.length === 0) {
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
          <CreditCard className="w-7 h-7 text-primary-400" />
          Gestión de Pagos
        </h1>
        <p className="text-dark-400 mt-1">
          Administra y valida los pagos de los clientes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl glass">
          <div className="text-xl sm:text-3xl font-bold text-primary-400">${totalAmount.toFixed(2)}</div>
          <div className="text-sm text-dark-400 mt-1">Total Pagos</div>
        </div>
        <div className="p-6 rounded-2xl glass">
          <div className="text-xl sm:text-3xl font-bold text-yellow-400">{pendingCount}</div>
          <div className="text-sm text-dark-400 mt-1">Pendientes</div>
        </div>
        <div className="p-6 rounded-2xl glass">
          <div className="text-xl sm:text-3xl font-bold text-green-400">{approvedCount}</div>
          <div className="text-sm text-dark-400 mt-1">Aprobados</div>
        </div>
        <div className="p-6 rounded-2xl glass">
          <div className="text-xl sm:text-3xl font-bold text-white">{payments.length}</div>
          <div className="text-sm text-dark-400 mt-1">Total Transacciones</div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 rounded-2xl glass">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobados</option>
              <option value="rejected">Rechazados</option>
              <option value="completed">Completados</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Método</label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white"
            >
              <option value="all">Todos</option>
              <option value="paypal">PayPal</option>
              <option value="transfer">Transferencia</option>
              <option value="card">Tarjeta</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={loadPayments}
              className="w-full px-4 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold flex items-center justify-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filtrar
            </button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-2xl glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-dark-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Cliente</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Servicio</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Monto</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Método</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Fecha</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-dark-300">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {payments.map((payment) => (
                <motion.tr
                  key={payment.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-dark-800/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-white">{payment.client_name}</div>
                      <div className="text-sm text-dark-400">{payment.client_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white">{payment.service_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-primary-400">
                      ${parseFloat(payment.amount).toFixed(2)} {payment.currency}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getMethodBadge(payment.method)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(payment.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-dark-400">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowModal(true);
                        }}
                        className="p-2 rounded-lg hover:bg-dark-700 text-primary-400"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {payment.receipt_url && (
                        <a
                          href={`${process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001'}${payment.receipt_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg hover:bg-dark-700 text-blue-400"
                        >
                          <FileText className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-dark-700 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-dark-400">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Validation Modal */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold text-white mb-4">Detalles del Pago</h2>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-dark-400">Cliente</div>
                  <div className="text-white font-medium">{selectedPayment.client_name}</div>
                </div>
                <div>
                  <div className="text-sm text-dark-400">Email</div>
                  <div className="text-white">{selectedPayment.client_email}</div>
                </div>
                <div>
                  <div className="text-sm text-dark-400">Servicio</div>
                  <div className="text-white">{selectedPayment.service_name}</div>
                </div>
                <div>
                  <div className="text-sm text-dark-400">Monto</div>
                  <div className="text-primary-400 font-bold">
                    ${parseFloat(selectedPayment.amount).toFixed(2)} {selectedPayment.currency}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-dark-400">Método</div>
                  <div>{getMethodBadge(selectedPayment.method)}</div>
                </div>
                <div>
                  <div className="text-sm text-dark-400">Estado</div>
                  <div>{getStatusBadge(selectedPayment.status)}</div>
                </div>
                {selectedPayment.reference && (
                  <div className="col-span-2">
                    <div className="text-sm text-dark-400">Referencia</div>
                    <div className="text-white">{selectedPayment.reference}</div>
                  </div>
                )}
                {selectedPayment.notes && (
                  <div className="col-span-2">
                    <div className="text-sm text-dark-400">Notas</div>
                    <div className="text-white">{selectedPayment.notes}</div>
                  </div>
                )}
              </div>

              {selectedPayment.receipt_url && (
                <div>
                  <div className="text-sm text-dark-400 mb-2">Comprobante</div>
                  {/\.(pdf)$/i.test(selectedPayment.receipt_url) ? (
                    <a
                      href={`${process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001'}${selectedPayment.receipt_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      Ver comprobante PDF
                    </a>
                  ) : (
                    <img
                      src={`${process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001'}${selectedPayment.receipt_url}`}
                      alt="Comprobante de pago"
                      className="max-w-full max-h-96 rounded-xl border border-dark-700 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML += '<p class="text-red-400 text-sm">No se pudo cargar la imagen del comprobante</p>';
                      }}
                    />
                  )}
                </div>
              )}

              {selectedPayment.paypal_capture_id && (
                <div>
                  <div className="text-sm text-dark-400">ID Transacción PayPal</div>
                  <div className="text-white font-mono text-sm">{selectedPayment.paypal_capture_id}</div>
                </div>
              )}

              {selectedPayment.status === 'pending' && (
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Notas de Validación
                  </label>
                  <textarea
                    value={validationNotes}
                    onChange={(e) => setValidationNotes(e.target.value)}
                    rows={3}
                    placeholder="Agrega notas sobre la validación (opcional)"
                    className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white placeholder-dark-500"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {selectedPayment.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleValidate(true)}
                    disabled={isValidating}
                    className="flex-1 px-4 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold flex items-center justify-center gap-2"
                  >
                    {isValidating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Aprobar
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleValidate(false)}
                    disabled={isValidating}
                    className="flex-1 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold flex items-center justify-center gap-2"
                  >
                    {isValidating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        Rechazar
                      </>
                    )}
                  </button>
                </div>
              )}
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedPayment(null);
                  setValidationNotes('');
                }}
                className="w-full px-4 py-3 rounded-xl bg-dark-700 hover:bg-dark-600 text-white font-semibold"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
