'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Loader2,
  CheckCircle,
  XCircle,
  Filter
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
  business_name: string;
  created_at: string;
  email_verified: boolean;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadClients();
  }, [currentPage, statusFilter]);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: 20,
        search: searchTerm
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await adminApi.getClients(params);
      setClients(response.data?.data?.clients || []);
      setTotalPages(response.data?.data?.pagination?.pages || 1);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast.error('Error al cargar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadClients();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;

    try {
      await adminApi.deleteClient(id);
      toast.success('Cliente eliminado');
      loadClients();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al eliminar cliente');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      inactive: 'bg-red-500/20 text-red-400 border-red-500/30',
      suspended: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.inactive}`}>
        {status}
      </span>
    );
  };

  if (isLoading && clients.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Users className="w-7 h-7 text-primary-400" />
            Gestión de Clientes
          </h1>
          <p className="text-dark-400 mt-1">
            Administra todos los clientes del sistema
          </p>
        </div>
        <Link
          href="/admin/clients/new"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Cliente
        </Link>
      </div>

      {/* Filters */}
      <div className="p-6 rounded-2xl glass">
        <div className="grid md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Buscar por nombre o email..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white placeholder-dark-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
              <option value="suspended">Suspendidos</option>
            </select>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="px-4 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Buscar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl glass">
          <div className="text-3xl font-bold text-primary-400">{clients.length}</div>
          <div className="text-sm text-dark-400 mt-1">Total Clientes</div>
        </div>
        <div className="p-6 rounded-2xl glass">
          <div className="text-3xl font-bold text-green-400">
            {clients.filter(c => c.status === 'active').length}
          </div>
          <div className="text-sm text-dark-400 mt-1">Activos</div>
        </div>
        <div className="p-6 rounded-2xl glass">
          <div className="text-3xl font-bold text-yellow-400">
            {clients.filter(c => !c.email_verified).length}
          </div>
          <div className="text-sm text-dark-400 mt-1">Sin Verificar</div>
        </div>
        <div className="p-6 rounded-2xl glass">
          <div className="text-3xl font-bold text-red-400">
            {clients.filter(c => c.status !== 'active').length}
          </div>
          <div className="text-sm text-dark-400 mt-1">Inactivos</div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="rounded-2xl glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Cliente</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Negocio</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Teléfono</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Verificado</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-dark-300">Registro</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-dark-300">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {clients.map((client) => (
                <motion.tr
                  key={client.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-dark-800/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-white">{client.name}</div>
                      <div className="text-sm text-dark-400">{client.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white">{client.business_name || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-dark-300">{client.phone || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(client.status)}
                  </td>
                  <td className="px-6 py-4">
                    {client.email_verified ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-dark-400">
                      {new Date(client.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="p-2 rounded-lg hover:bg-dark-700 text-primary-400"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/clients/${client.id}/edit`}
                        className="p-2 rounded-lg hover:bg-dark-700 text-blue-400"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="p-2 rounded-lg hover:bg-dark-700 text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-dark-700 flex items-center justify-between">
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
    </div>
  );
}
