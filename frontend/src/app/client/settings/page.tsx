'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  User,
  Lock,
  Bell,
  Shield,
  Save,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Mail,
  Phone,
  Trash2
} from 'lucide-react';
import { clientApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, checkAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form
  const [profileData, setProfileData] = useState({
    name: '',
    phone: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Notifications (mock for now)
  const [notifications, setNotifications] = useState({
    emailNewMessage: true,
    emailDailySummary: false,
    emailPaymentReminder: true,
    browserNotifications: true
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    setIsSavingProfile(true);
    try {
      await clientApi.updateProfile(profileData);
      toast.success('Perfil actualizado');
      await checkAuth();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al guardar');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword.length < 8) {
      toast.error('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setIsSavingPassword(true);
    try {
      await clientApi.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Contraseña actualizada');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al cambiar contraseña');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'notifications', label: 'Notificaciones', icon: Bell }
  ];

  const passwordRequirements = [
    { met: passwordData.newPassword.length >= 8, text: 'Mínimo 8 caracteres' },
    { met: /[A-Z]/.test(passwordData.newPassword), text: 'Una mayúscula' },
    { met: /[0-9]/.test(passwordData.newPassword), text: 'Un número' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Settings className="w-7 h-7 text-primary-400" />
          Configuración
        </h1>
        <p className="text-dark-400 mt-1">
          Administra tu cuenta y preferencias
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-dark-700/50 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-primary-500/20 text-primary-400'
                : 'text-dark-400 hover:text-white hover:bg-dark-700/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl glass"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Información Personal</h2>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-800/30 border border-dark-700 text-dark-400 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-dark-500 mt-1">El email no se puede cambiar</p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white placeholder-dark-500 transition-colors"
                    placeholder="Tu nombre"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white placeholder-dark-500 transition-colors"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              {/* Verification Status */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Estado de la cuenta
                </label>
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${
                  user?.email_verified
                    ? 'bg-green-500/10 border border-green-500/20'
                    : 'bg-yellow-500/10 border border-yellow-500/20'
                }`}>
                  {user?.email_verified ? (
                    <>
                      <Check className="w-5 h-5 text-green-400" />
                      <span className="text-green-400">Email verificado</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-400">Email sin verificar</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold flex items-center gap-2 btn-glow disabled:opacity-50"
              >
                {isSavingProfile ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl glass"
        >
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary-400" />
            Cambiar Contraseña
          </h2>

          <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Contraseña Actual
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white placeholder-dark-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300"
                >
                  {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Nueva Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white placeholder-dark-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300"
                >
                  {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Requirements */}
              {passwordData.newPassword && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req) => (
                    <div
                      key={req.text}
                      className={`flex items-center gap-2 text-xs ${
                        req.met ? 'text-green-400' : 'text-dark-500'
                      }`}
                    >
                      <Check className={`w-3 h-3 ${req.met ? 'opacity-100' : 'opacity-30'}`} />
                      {req.text}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className={`w-full pl-10 pr-12 py-3 rounded-xl bg-dark-800/50 border ${
                    passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                      ? 'border-red-500'
                      : 'border-dark-700 focus:border-primary-500'
                  } text-white placeholder-dark-500 transition-colors`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300"
                >
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">Las contraseñas no coinciden</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSavingPassword}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold flex items-center gap-2 btn-glow disabled:opacity-50"
            >
              {isSavingPassword ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Cambiar Contraseña
                </>
              )}
            </button>
          </form>
        </motion.div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl glass"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Preferencias de Notificaciones</h2>

          <div className="space-y-4">
            {/* Email Notifications */}
            <div className="p-4 rounded-xl bg-dark-800/30 border border-dark-700/50">
              <h3 className="font-medium text-white mb-4">Notificaciones por Email</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-dark-300">Nuevos mensajes de clientes</span>
                  <input
                    type="checkbox"
                    checked={notifications.emailNewMessage}
                    onChange={(e) => setNotifications({ ...notifications, emailNewMessage: e.target.checked })}
                    className="w-5 h-5 rounded bg-dark-700 border-dark-600 text-primary-500 focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-dark-300">Resumen diario de actividad</span>
                  <input
                    type="checkbox"
                    checked={notifications.emailDailySummary}
                    onChange={(e) => setNotifications({ ...notifications, emailDailySummary: e.target.checked })}
                    className="w-5 h-5 rounded bg-dark-700 border-dark-600 text-primary-500 focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-dark-300">Recordatorios de pago</span>
                  <input
                    type="checkbox"
                    checked={notifications.emailPaymentReminder}
                    onChange={(e) => setNotifications({ ...notifications, emailPaymentReminder: e.target.checked })}
                    className="w-5 h-5 rounded bg-dark-700 border-dark-600 text-primary-500 focus:ring-primary-500"
                  />
                </label>
              </div>
            </div>

            {/* Browser Notifications */}
            <div className="p-4 rounded-xl bg-dark-800/30 border border-dark-700/50">
              <h3 className="font-medium text-white mb-4">Notificaciones del Navegador</h3>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-dark-300">Activar notificaciones push</span>
                  <p className="text-xs text-dark-500 mt-1">Recibe alertas en tiempo real en tu navegador</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.browserNotifications}
                  onChange={(e) => setNotifications({ ...notifications, browserNotifications: e.target.checked })}
                  className="w-5 h-5 rounded bg-dark-700 border-dark-600 text-primary-500 focus:ring-primary-500"
                />
              </label>
            </div>

            <p className="text-xs text-dark-500">
              Las preferencias de notificación se guardan automáticamente
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
