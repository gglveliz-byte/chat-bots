'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Globe,
  MapPin,
  Phone,
  Mail,
  Save,
  Upload,
  Briefcase,
  FileText,
  Check,
  AlertCircle,
  Loader2,
  Trash2,
  File
} from 'lucide-react';
import { clientApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

const industries = [
  'Tecnología',
  'E-commerce',
  'Salud',
  'Educación',
  'Finanzas',
  'Inmobiliaria',
  'Restaurantes',
  'Retail',
  'Servicios Profesionales',
  'Turismo',
  'Otro'
];

const countries = [
  'Argentina', 'Bolivia', 'Chile', 'Colombia', 'Costa Rica', 'Cuba',
  'Ecuador', 'El Salvador', 'España', 'Guatemala', 'Honduras', 'México',
  'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 'Puerto Rico', 'República Dominicana',
  'Uruguay', 'Venezuela', 'Estados Unidos', 'Otro'
];

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface KnowledgeFile {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  text_length: number;
  created_at: string;
}

export default function BusinessPage() {
  const { business, checkAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    description: '',
    country: '',
    address: '',
    website: '',
    phone: '',
    email: ''
  });

  // Knowledge files state
  const [knowledgeFiles, setKnowledgeFiles] = useState<KnowledgeFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name || '',
        industry: business.industry || '',
        description: business.description || '',
        country: business.country || '',
        address: business.address || '',
        website: business.website || '',
        phone: business.phone || '',
        email: business.email || ''
      });
    }
    loadKnowledgeFiles();
  }, [business]);

  const loadKnowledgeFiles = async () => {
    try {
      const response = await clientApi.getKnowledgeFiles();
      setKnowledgeFiles(response.data?.data?.files || []);
    } catch (error) {
      console.error('Error loading knowledge files:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('El nombre del negocio es requerido');
      return;
    }

    setIsSaving(true);
    try {
      await clientApi.updateBusiness(formData);
      toast.success('Información del negocio actualizada');
      await checkAuth(); // Refrescar datos
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (knowledgeFiles.length >= MAX_FILES) {
      toast.error(`Máximo ${MAX_FILES} archivos permitidos`);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('El archivo es demasiado grande (máx 10MB)');
      return;
    }
    const allowedTypes = ['application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Solo se permiten archivos PDF y TXT');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await clientApi.uploadKnowledgeFile(formData);
      toast.success('Archivo subido y texto extraído correctamente');
      loadKnowledgeFiles();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al subir archivo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await clientApi.deleteKnowledgeFile(fileId);
      toast.success('Archivo eliminado');
      setKnowledgeFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al eliminar archivo');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleFileUpload(files[0]);
  }, [knowledgeFiles.length]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Building2 className="w-7 h-7 text-primary-400" />
          Mi Negocio
        </h1>
        <p className="text-dark-400 mt-1">
          Configura la información de tu negocio y base de conocimiento para personalizar las respuestas del bot
        </p>
      </div>

      {/* Knowledge Base Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl glass"
      >
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 h-6 text-emerald-400" />
          <div>
            <h2 className="text-xl font-semibold text-white">Base de Conocimiento</h2>
            <p className="text-dark-400 text-sm">Sube archivos PDF o TXT para entrenar tu bot con información específica de tu negocio</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-300 font-medium mb-1">
                Archivos compartidos entre todas las plataformas
              </p>
              <p className="text-sm text-dark-300">
                Los archivos que subas aquí estarán disponibles para todos tus servicios (WhatsApp, Messenger, Instagram, Telegram, WebChat). Solo necesitas subirlos una vez.
              </p>
            </div>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-emerald-400 bg-emerald-500/10'
              : 'border-dark-600 hover:border-dark-500 hover:bg-dark-800/30'
          } ${knowledgeFiles.length >= MAX_FILES ? 'opacity-50 pointer-events-none' : ''}`}
          onClick={() => {
            if (knowledgeFiles.length < MAX_FILES) {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.pdf,.txt';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleFileUpload(file);
              };
              input.click();
            }
          }}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
              <p className="text-sm text-dark-300">Subiendo y extrayendo texto...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload className="w-10 h-10 text-dark-500" />
              <div>
                <p className="text-sm text-dark-300">
                  <span className="text-emerald-400 font-medium">Haz clic para subir</span> o arrastra un archivo aquí
                </p>
                <p className="text-xs text-dark-500 mt-1">PDF o TXT, máximo 10MB por archivo</p>
              </div>
            </div>
          )}
        </div>

        {/* File Count */}
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-dark-500">
            {knowledgeFiles.length} de {MAX_FILES} archivos
          </p>
          {knowledgeFiles.length >= MAX_FILES && (
            <p className="text-xs text-yellow-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Límite alcanzado
            </p>
          )}
        </div>

        {/* File List */}
        {knowledgeFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            {knowledgeFiles.map((file) => (
              <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50 group">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <File className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{file.filename}</p>
                  <div className="flex items-center gap-3 text-xs text-dark-400">
                    <span>{formatFileSize(file.file_size)}</span>
                    <span>{Number(file.text_length).toLocaleString()} caracteres extraídos</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteFile(file.id)}
                  className="p-2 rounded-lg text-dark-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  title="Eliminar archivo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl glass space-y-6"
        >
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Nombre del Negocio *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white placeholder-dark-500 transition-colors"
                  placeholder="Nombre de tu empresa"
                  required
                />
              </div>
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Industria
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white appearance-none cursor-pointer"
                >
                  <option value="">Selecciona una industria</option>
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                País
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white appearance-none cursor-pointer"
                >
                  <option value="">Selecciona un país</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Descripción del Negocio
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-dark-500" />
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white placeholder-dark-500 transition-colors resize-none"
                  placeholder="Describe brevemente a qué se dedica tu negocio, productos o servicios que ofreces..."
                />
              </div>
              <p className="text-xs text-dark-500 mt-1">
                Esta información ayuda al bot a dar respuestas más precisas
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dark-700/50" />

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Información de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Dirección
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white placeholder-dark-500 transition-colors"
                    placeholder="Dirección física del negocio"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Sitio Web
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white placeholder-dark-500 transition-colors"
                    placeholder="https://tu-sitio.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Teléfono de Contacto
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 focus:border-primary-500 text-white placeholder-dark-500 transition-colors"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-primary-300 text-sm font-medium">
                  ¿Por qué es importante esta información?
                </p>
                <p className="text-dark-400 text-sm mt-1">
                  El bot de IA utiliza estos datos para dar respuestas personalizadas a tus clientes.
                  Cuanta más información proporciones, mejores serán las respuestas automáticas.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold flex items-center gap-2 btn-glow disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </motion.div>
      </form>
    </div>
  );
}
