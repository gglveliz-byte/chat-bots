'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { clientApi } from '@/lib/api';
import Link from 'next/link';

export default function PayPalSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      capturePayment(token);
    } else {
      setStatus('error');
      setMessage('Token de pago no encontrado');
    }
  }, [searchParams]);

  const capturePayment = async (orderId: string) => {
    try {
      const response = await clientApi.capturePayPalOrder(orderId);

      if (response.data.success) {
        setStatus('success');
        setTransactionId(response.data.data.transactionId);
        setMessage('Tu pago ha sido procesado exitosamente');
      } else {
        throw new Error(response.data.error);
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Error al procesar el pago');
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-5 sm:p-8 rounded-2xl glass text-center max-w-md w-full"
      >
        {status === 'processing' && (
          <>
            <Loader2 className="w-16 h-16 text-primary-400 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-white mb-2">
              Procesando pago...
            </h1>
            <p className="text-dark-400">
              Por favor espera mientras confirmamos tu pago con PayPal
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10 }}
            >
              <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2">
              ¡Pago exitoso!
            </h1>
            <p className="text-dark-400 mb-4">
              {message}
            </p>
            {transactionId && (
              <p className="text-sm text-dark-500 mb-6">
                ID de transacción: <span className="font-mono text-dark-300">{transactionId}</span>
              </p>
            )}
            <div className="space-y-3">
              <Link
                href="/client/dashboard"
                className="block w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold"
              >
                Ir al Dashboard
              </Link>
              <Link
                href="/client/payments"
                className="block w-full py-3 rounded-xl border border-dark-700 text-dark-300 hover:text-white transition-colors"
              >
                Ver mis pagos
              </Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">
              Error en el pago
            </h1>
            <p className="text-dark-400 mb-6">
              {message}
            </p>
            <div className="space-y-3">
              <Link
                href="/client/payments"
                className="block w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold"
              >
                Intentar de nuevo
              </Link>
              <Link
                href="/client/dashboard"
                className="block w-full py-3 rounded-xl border border-dark-700 text-dark-300 hover:text-white transition-colors"
              >
                Ir al Dashboard
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
