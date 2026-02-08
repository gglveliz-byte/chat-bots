'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Bot,
  CreditCard,
  Building2,
  Bell,
  Lock,
  Menu,
  X,
  AlertTriangle,
  Link2,
  MessageSquare
} from 'lucide-react';
import { FaWhatsapp, FaFacebookMessenger, FaInstagram, FaTelegram } from 'react-icons/fa';
import { HiGlobeAlt } from 'react-icons/hi';
import { useAuthStore } from '@/stores/authStore';

// Iconos de plataformas
const platformIcons: { [key: string]: any } = {
  whatsapp: FaWhatsapp,
  messenger: FaFacebookMessenger,
  instagram: FaInstagram,
  telegram: FaTelegram,
  webchat: HiGlobeAlt,
};

const platformColors: { [key: string]: string } = {
  whatsapp: '#25D366',
  messenger: '#0084FF',
  instagram: '#E4405F',
  telegram: '#0088CC',
  webchat: '#6366F1',
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, business, services, isAuthenticated, isLoading, logout, checkAuth, _hasHydrated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated && !user) {
      checkAuth();
    }
  }, [_hasHydrated]);

  useEffect(() => {
    if (_hasHydrated && !isLoading && (!isAuthenticated || user?.type !== 'client')) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, user, router, _hasHydrated]);

  if (!_hasHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.type !== 'client') {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/client/dashboard' },
    { icon: Building2, label: 'Mi Negocio', href: '/client/business' },
    { icon: Link2, label: 'Conectar Canales', href: '/client/services/connect' },
    { icon: CreditCard, label: 'Pagos', href: '/client/payments' },
    { icon: Settings, label: 'Configuración', href: '/client/settings' },
  ];

  // Obtener servicios disponibles y el estado de cada uno
  const allServices = [
    { code: 'whatsapp', name: 'WhatsApp' },
    { code: 'messenger', name: 'Messenger' },
    { code: 'instagram', name: 'Instagram' },
    { code: 'telegram', name: 'Telegram' },
    { code: 'webchat', name: 'Web Chat' },
  ];

  const getServiceStatus = (code: string) => {
    const service = services?.find(s => s.code === code);
    if (!service) return 'not_contracted';
    if (service.status === 'active' || service.status === 'trial') return 'active';
    return 'inactive';
  };

  return (
    <div className="min-h-screen flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-dark-800/50 border-r border-dark-700/50 flex flex-col transform transition-transform lg:transform-none ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo */}
        <div className="p-6 border-b border-dark-700/50 flex items-center justify-between">
          <Link href="/client/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-white">{business?.name || 'Mi Negocio'}</span>
              <span className="text-xs text-dark-400 block">Panel de Control</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-dark-700/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Services Navigation */}
        <div className="p-4 border-b border-dark-700/50">
          <p className="text-xs font-medium text-dark-500 uppercase tracking-wider mb-3 px-2">
            Servicios
          </p>
          <div className="flex flex-wrap gap-2">
            {allServices.map((service) => {
              const status = getServiceStatus(service.code);
              const isActive = pathname.includes(`/services/${service.code}`);

              const Icon = platformIcons[service.code];
              return (
                <Link
                  key={service.code}
                  href={status === 'active' ? `/client/services/${service.code}` : `/client/services?contract=${service.code}`}
                  className={`relative group flex items-center justify-center w-12 h-12 rounded-xl transition-all ${
                    isActive
                      ? 'ring-2 ring-primary-500'
                      : status === 'active'
                      ? 'hover:ring-2 hover:ring-primary-500/50'
                      : 'opacity-50 hover:opacity-75'
                  }`}
                  style={{
                    backgroundColor: status === 'active' ? `${platformColors[service.code]}20` : 'rgba(30, 41, 59, 0.5)',
                  }}
                  title={service.name}
                >
                  {Icon && <Icon size={24} style={{ color: status === 'active' ? platformColors[service.code] : '#94a3b8' }} />}
                  {status !== 'active' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-dark-900/50 rounded-xl">
                      <Lock className="w-4 h-4 text-dark-400" />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-white'
                        : 'text-dark-400 hover:text-white hover:bg-dark-700/50'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-400' : ''}`} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-dark-700/50">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-dark-800/50 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-dark-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>

          {/* NeuroChat Branding */}
          <div className="mt-4 pt-4 border-t border-dark-700/50">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                NeuroChat
              </span>
            </div>
            <p className="text-xs text-center text-dark-500">Powered by TCSS Programming</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 border-b border-dark-700/50 flex items-center justify-between px-3 md:px-6 bg-dark-800/30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-dark-700/50"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-xl hover:bg-dark-700/50 text-dark-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Email Verification Banner */}
        {user && !user.email_verified && (
          <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-3 md:px-6 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <p className="text-yellow-200 text-sm truncate sm:whitespace-normal">
                  <span className="hidden sm:inline">Tu email no está verificado. Algunas funciones pueden estar limitadas.</span>
                  <span className="sm:hidden">Email no verificado</span>
                </p>
              </div>
              <Link
                href={`/auth/verify-email?email=${encodeURIComponent(user.email)}`}
                className="text-sm font-medium text-yellow-400 hover:text-yellow-300 transition-colors flex-shrink-0"
              >
                Verificar →
              </Link>
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-3 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
