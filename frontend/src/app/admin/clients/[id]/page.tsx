'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  CheckCircle,
  XCircle,
  Edit,
  ArrowLeft,
  Loader2,
  Package,
  CreditCard
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  email_verified: boolean;
  created_at: string;
  business_name: string;
  business_industry: string;
  business_description: string;
  services: any[];
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClient();
  }, [clientId]);

  const loadClient = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getClient(clientId);
      setClient(response.data?.data?.client);
    } catch (error) {
      console.error('Error loading client:', error);
      toast.error('Error al cargar cliente');
      router.push('/admin/clients');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  if (!client) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/clients"
            className="p-2 rounded-xl hover:bg-dark-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <User className="w-7 h-7 text-primary-400" />
              {client.name}
            </h1>
            <p className="text-dark-400 mt-1">Detalles del cliente</p>
          </div>
        </div>
        <Link
          href={`/admin/clients/${clientId}/edit`}
          className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold flex items-center gap-2"
        >
          <Edit className="w-5 h-5" />
          Editar Cliente
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Información Personal */}
        <div className="p-6 rounded-2xl glass">
          <h2 className="text-lg font-semibold text-white mb-4">Información Personal</h2>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-dark-400 mb-1">Nombre</div>
              <div className="flex items-center gap-2 text-white">
                <User className="w-4 h-4 text-primary-400" />
                {client.name}
              </div>
            </div>
            <div>
              <div className="text-sm text-dark-400 mb-1">Email</div>
              <div className="flex items-center gap-2 text-white">
                <Mail className="w-4 h-4 text-primary-400" />
                {client.email}
              </div>
            </div>
            <div>
              <div className="text-sm text-dark-400 mb-1">Teléfono</div>
              <div className="flex items-center gap-2 text-white">
                <Phone className="w-4 h-4 text-primary-400" />
                {client.phone || 'No registrado'}
              </div>
            </div>
            <div>
              <div className="text-sm text-dark-400 mb-1">Email Verificado</div>
              <div className="flex items-center gap-2">
                {client.email_verified ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">Verificado</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400">No verificado</span>
                  </>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-dark-400 mb-1">Fecha de Registro</div>
              <div className="flex items-center gap-2 text-white">
                <Calendar className="w-4 h-4 text-primary-400" />
                {new Date(client.created_at).toLocaleDateString('es', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Información del Negocio */}
        <div className="p-6 rounded-2xl glass">
          <h2 className="text-lg font-semibold text-white mb-4">Información del Negocio</h2>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-dark-400 mb-1">Nombre del Negocio</div>
              <div className="flex items-center gap-2 text-white">
                <Building2 className="w-4 h-4 text-primary-400" />
                {client.business_name || 'No configurado'}
              </div>
            </div>
            <div>
              <div className="text-sm text-dark-400 mb-1">Industria</div>
              <div className="text-white">
                {client.business_industry || 'No especificada'}
              </div>
            </div>
            <div>
              <div className="text-sm text-dark-400 mb-1">Descripción</div>
              <div className="text-white">
                {client.business_description || 'Sin descripción'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Servicios */}
      <div className="p-6 rounded-2xl glass">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary-400" />
          Servicios Contratados
        </h2>
        {client.services && client.services.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-4">
            {client.services.map((service: any) => (
              <div key={service.id} className="p-4 rounded-xl bg-dark-800/50">
                <div className="font-medium text-white">{service.name}</div>
                <div className="text-sm text-dark-400 mt-1">Estado: {service.status}</div>
                <div className="text-sm text-primary-400 mt-2">
                  ${parseFloat(service.price_monthly).toFixed(2)}/mes
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-dark-400">No tiene servicios contratados</p>
        )}
      </div>
    </div>
  );
}
