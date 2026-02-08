'use client';

import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';
import Link from 'next/link';

export default function PayPalCancelPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-5 sm:p-8 rounded-2xl glass text-center max-w-md w-full"
      >
        <XCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">
          Pago cancelado
        </h1>
        <p className="text-dark-400 mb-6">
          Has cancelado el proceso de pago. No se ha realizado ningún cargo a tu cuenta.
        </p>
        <div className="space-y-3">
          <Link
            href="/client/payments"
            className="block w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold"
          >
            Volver a intentar
          </Link>
          <Link
            href="/client/dashboard"
            className="block w-full py-3 rounded-xl border border-dark-700 text-dark-300 hover:text-white transition-colors"
          >
            Ir al Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
