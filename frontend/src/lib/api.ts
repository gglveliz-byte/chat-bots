import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: agregar token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: refresh token en 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = Cookies.get('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          Cookies.set('accessToken', accessToken, { expires: 1 });
          Cookies.set('refreshToken', newRefreshToken, { expires: 30 });
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        if (typeof window !== 'undefined') window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================

export const authApi = {
  login: (email: string, password: string, userType: string = 'client') =>
    api.post('/auth/login', { email, password, userType }),

  register: (data: { email: string; password: string; name: string; phone?: string }) =>
    api.post('/auth/register', data),

  verifyEmail: (email: string, code: string) =>
    api.post('/auth/verify-email', { email, code }),

  resendVerification: (email: string) =>
    api.post('/auth/resend-verification', { email }),

  forgotPassword: (email: string, userType: string = 'client') =>
    api.post('/auth/forgot-password', { email, userType }),

  resetPassword: (email: string, code: string, newPassword: string, userType: string = 'client') =>
    api.post('/auth/reset-password', { email, code, newPassword, userType }),

  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),

  getMe: () => api.get('/auth/me'),

  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

// ==================== ADMIN ====================

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),

  // Clientes
  getClients: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    api.get('/admin/clients', { params }),
  getClient: (id: string) => api.get(`/admin/clients/${id}`),
  createClient: (data: {
    email: string; name: string; password: string;
    phone?: string; businessName?: string; industry?: string; country?: string;
  }) => api.post('/admin/clients', data),
  updateClient: (id: string, data: any) => api.put(`/admin/clients/${id}`, data),
  deleteClient: (id: string) => api.delete(`/admin/clients/${id}`),

  // Servicios de cliente
  assignService: (clientId: string, serviceId: string, config?: any) =>
    api.post(`/admin/clients/${clientId}/services`, { serviceId, config }),
  updateClientService: (clientId: string, serviceId: string, data: any) =>
    api.put(`/admin/clients/${clientId}/services/${serviceId}`, data),

  // Pagos
  getPayments: (params?: { page?: number; limit?: number; status?: string; method?: string }) =>
    api.get('/admin/payments', { params }),
  validatePayment: (id: string, approved: boolean, notes?: string) =>
    api.put(`/admin/payments/${id}/validate`, { approved, notes }),

  // Trials
  getTrials: (status?: string) => api.get('/admin/trials', { params: { status } }),
  extendTrial: (id: string, days: number) => api.put(`/admin/trials/${id}/extend`, { days }),

  // Servicios (catálogo)
  getServices: () => api.get('/admin/services'),
  updateService: (id: string, data: any) => api.put(`/admin/services/${id}`, data),

  // Configuración
  getSystemConfig: () => api.get('/admin/config'),
  getBankDetails: () => api.get('/admin/config/bank'),
  updateBankDetails: (data: {
    bank_name: string; account_holder: string; account_number: string;
    account_type?: string; routing_number?: string; swift?: string; reference_instructions?: string;
  }) => api.put('/admin/config/bank', data),

  // Meta API
  getMetaConfig: () => api.get('/admin/config/meta'),
  updateMetaConfig: (data: {
    meta_app_id: string; meta_app_secret: string; meta_verify_token: string;
    whatsapp_business_account_id?: string; whatsapp_access_token?: string;
    messenger_page_id?: string; messenger_page_access_token?: string;
    instagram_account_id?: string; instagram_access_token?: string;
  }) => api.put('/admin/config/meta', data),
  testMetaConnection: () => api.post('/admin/config/meta/test'),

  // Telegram
  getTelegramConfig: () => api.get('/admin/config/telegram'),
  updateTelegramConfig: (data: { bot_token: string; bot_username?: string; webhook_url?: string }) =>
    api.put('/admin/config/telegram', data),
  testTelegramConnection: () => api.post('/admin/config/telegram/test'),

  // CRON Jobs (ejecución manual)
  runJob: (jobName: string) => api.post(`/admin/jobs/${jobName}`),
};

// ==================== OAUTH (Meta) ====================

export const oauthApi = {
  startOAuth: (serviceCode: string) =>
    api.post('/oauth/meta/start', { serviceCode }),

  getStatus: (serviceCode: string) =>
    api.get('/oauth/meta/status', { params: { serviceCode } }),

  disconnect: (serviceCode: string) =>
    api.post('/oauth/meta/disconnect', { serviceCode }),

  selectAccount: (serviceCode: string, accountId: string) =>
    api.post('/oauth/meta/select-account', { serviceCode, accountId }),

  getAvailableAccounts: (serviceCode: string) =>
    api.get('/oauth/meta/available-accounts', { params: { serviceCode } }),
};

// ==================== CLIENT ====================

export const clientApi = {
  // Perfil
  getProfile: () => api.get('/client/profile'),
  updateProfile: (data: { name?: string; phone?: string }) => api.put('/client/profile', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/client/password', { currentPassword, newPassword }),

  // Negocio
  getBusiness: () => api.get('/client/business'),
  updateBusiness: (data: {
    name: string; industry?: string; description?: string;
    country?: string; address?: string; website?: string; phone?: string; email?: string;
  }) => api.put('/client/business', data),

  // Servicios
  getMyServices: () => api.get('/client/services'),
  getServiceDetail: (code: string) => api.get(`/client/services/${code}`),
  activateTrial: (serviceId: string) => api.post('/client/services/trial', { serviceId }),

  // Pagos
  getMyPayments: () => api.get('/client/payments'),
  getPaymentHistory: () => api.get('/client/payments/history'),
  getServicesToPay: () => api.get('/client/payments/services'),
  getBankDetails: () => api.get('/client/payments/bank-details'),
  createPayPalOrder: (clientServiceId: string) =>
    api.post('/client/payments/paypal/create', { clientServiceId }),
  capturePayPalOrder: (orderId: string) =>
    api.post('/client/payments/paypal/capture', { orderId }),
  submitTransferProof: (formData: FormData) =>
    api.post('/client/payments/transfer', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  createPayment: (serviceId: string, method: 'paypal' | 'transfer') =>
    api.post('/client/payments', { serviceId, method }),
  uploadReceipt: (paymentId: string, receiptUrl: string) =>
    api.put(`/client/payments/${paymentId}/receipt`, { receiptUrl }),

  // Suscripción
  getSubscriptionStatus: () => api.get('/client/subscription'),

  // Knowledge files (globales por cliente)
  getKnowledgeFiles: () => api.get('/client/business/knowledge-files'),
  uploadKnowledgeFile: (formData: FormData) =>
    api.post('/client/business/knowledge-files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  deleteKnowledgeFile: (fileId: string) =>
    api.delete(`/client/business/knowledge-files/${fileId}`),
};

// ==================== SERVICE ====================

export const serviceApi = {
  // Conversaciones
  getConversations: (code: string, params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    api.get(`/service/${code}/conversations`, { params }),
  getConversation: (code: string, conversationId: string) =>
    api.get(`/service/${code}/conversations/${conversationId}`),
  getMessages: (code: string, conversationId: string, params?: { page?: number; limit?: number }) =>
    api.get(`/service/${code}/conversations/${conversationId}/messages`, { params }),
  sendMessage: (code: string, conversationId: string, content: string, messageType: string = 'text') =>
    api.post(`/service/${code}/conversations/${conversationId}/messages`, { content, messageType }),
  toggleBot: (code: string, conversationId: string, active?: boolean) =>
    api.put(`/service/${code}/conversations/${conversationId}/bot`, { active }),

  // Bot config
  getBotConfig: (code: string) => api.get(`/service/${code}/config`),
  updateBotConfig: (code: string, data: any) => api.put(`/service/${code}/config`, data),

  // Stats
  getStats: (code: string, period?: string) =>
    api.get(`/service/${code}/stats`, { params: { period } }),

  // Telegram status
  getTelegramStatus: (code: string) => api.get(`/service/${code}/telegram-status`),

  // Diagnostic
  getDiagnostic: (code: string) => api.get(`/service/${code}/diagnostic`),
};

// ==================== PUBLIC ====================

export const publicApi = {
  getServices: () => api.get('/services'),
};

export default api;
