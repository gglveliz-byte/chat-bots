'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Send, Bot, User, ArrowLeft, Check, CheckCheck,
  Clock, MessageSquare, Settings, MoreVertical, Wifi, WifiOff,
  AlertTriangle, Link2, Phone, Smile
} from 'lucide-react';
import { serviceApi } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import toast from 'react-hot-toast';
import Link from 'next/link';

// ─── Tipos ───
interface Conversation {
  id: string;
  contact_id: string;
  contact_name: string;
  contact_phone: string;
  is_bot_active: boolean;
  unread_count: number;
  last_message_at: string;
  last_message?: string;
  last_sender?: string;
  status?: string;
}

interface Message {
  id: string;
  sender_type: 'contact' | 'bot' | 'human';
  content: string;
  message_type: string;
  status: string;
  created_at: string;
}

interface PlatformConfig {
  code: string;
  name: string;
  icon: string;
  color: string;
  bgDark: string;
  bgHeader: string;
  bgInput: string;
  bgMyMsg: string;
  bgBotMsg: string;
  bgTheirMsg: string;
  showConnectionStatus?: boolean;
}

// ─── Platform configs ───
export const platformConfigs: Record<string, PlatformConfig> = {
  whatsapp: {
    code: 'whatsapp',
    name: 'WhatsApp Business',
    icon: '📱',
    color: '#25D366',
    bgDark: '#0b141a',
    bgHeader: '#202c33',
    bgInput: '#2a3942',
    bgMyMsg: '#005c4b',
    bgBotMsg: '#005c4b',
    bgTheirMsg: '#202c33',
    showConnectionStatus: true,
  },
  messenger: {
    code: 'messenger',
    name: 'Facebook Messenger',
    icon: '💬',
    color: '#0084FF',
    bgDark: '#0a0e14',
    bgHeader: '#1c1e21',
    bgInput: '#2c2e33',
    bgMyMsg: '#0084FF',
    bgBotMsg: '#0084FF',
    bgTheirMsg: '#303236',
    showConnectionStatus: true,
  },
  instagram: {
    code: 'instagram',
    name: 'Instagram DMs',
    icon: '📸',
    color: '#E4405F',
    bgDark: '#0a0a0a',
    bgHeader: '#1a1a1a',
    bgInput: '#2a2a2a',
    bgMyMsg: '#3797f0',
    bgBotMsg: '#3797f0',
    bgTheirMsg: '#262626',
    showConnectionStatus: true,
  },
  telegram: {
    code: 'telegram',
    name: 'Telegram',
    icon: '✈️',
    color: '#0088CC',
    bgDark: '#0e1621',
    bgHeader: '#17212b',
    bgInput: '#242f3d',
    bgMyMsg: '#2b5278',
    bgBotMsg: '#2b5278',
    bgTheirMsg: '#182533',
    showConnectionStatus: false,
  },
  webchat: {
    code: 'webchat',
    name: 'Web Chat',
    icon: '🌐',
    color: '#6366F1',
    bgDark: '#0f172a',
    bgHeader: '#1e293b',
    bgInput: '#334155',
    bgMyMsg: '#4f46e5',
    bgBotMsg: '#4f46e5',
    bgTheirMsg: '#1e293b',
    showConnectionStatus: false,
  },
};

// ─── Platform icons map ───
const platformIconMap: Record<string, string> = {
  whatsapp: '📱',
  messenger: '💬',
  instagram: '📸',
  telegram: '✈️',
  webchat: '🌐',
};

interface ChatPanelProps {
  platform: string;
  connectionStatus?: {
    connected: boolean;
    tokenStatus: string;
    accountName?: string;
  } | null;
}

// ─── Typing Indicator Component ───
function TypingIndicator({ color }: { color: string }) {
  return (
    <div className="flex justify-start px-4 py-1">
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/5 flex items-center gap-1.5">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
        <span className="text-xs text-gray-400 ml-2">escribiendo...</span>
      </div>
    </div>
  );
}

export default function ChatPanel({ platform, connectionStatus }: ChatPanelProps) {
  const config = platformConfigs[platform];
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Helper: Validar y agregar mensaje sin duplicados
  const addMessageIfValid = useCallback((newMsg: any) => {
    if (!newMsg || !newMsg.id) return;

    // Asegurar que tenga created_at
    if (!newMsg.created_at) {
      newMsg.created_at = new Date().toISOString();
    }

    setMessages(prev => {
      // Evitar duplicados
      const exists = prev.some(m => m.id === newMsg.id);
      if (exists) return prev;

      return [...prev, newMsg];
    });
  }, []);

  // WebSocket
  const { isConnected: socketConnected } = useSocket({
    serviceCode: platform,
    conversationId: selectedConversation?.id,
    onNewMessage: (data) => {
      console.log('📨 Mensaje nuevo recibido:', data);

      // SIEMPRE actualizar lista de conversaciones cuando llega mensaje
      fetchConversations();

      // Si es la conversación seleccionada, agregar mensaje
      if (data.conversationId === selectedConversation?.id && data.message) {
        console.log('✅ Agregando mensaje a conversación actual');
        addMessageIfValid(data.message);
        setIsBotTyping(false);
      } else {
        console.log('ℹ️ Mensaje de otra conversación, solo actualizar lista');
      }
    },
    onBotResponse: (data) => {
      console.log('🤖 Respuesta bot recibida:', data);

      // SIEMPRE actualizar lista de conversaciones
      fetchConversations();

      // Si es la conversación seleccionada, agregar mensaje
      if (data.conversationId === selectedConversation?.id && data.message) {
        console.log('✅ Agregando respuesta del bot a conversación actual');
        addMessageIfValid(data.message);
        setIsBotTyping(false);
      } else {
        console.log('ℹ️ Respuesta del bot de otra conversación');
      }
    },
    onNewConversation: (data) => {
      console.log('🆕 Nueva conversación:', data);
      fetchConversations();
    },
    onTyping: (data) => {
      if (data.conversationId === selectedConversation?.id) {
        setIsBotTyping(true);
        setTimeout(() => setIsBotTyping(false), 3000);
      }
    },
  });

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isBotTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await serviceApi.getConversations(platform);
      setConversations(response.data.data.conversations || []);
    } catch (error) {
      // No conversations yet
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await serviceApi.getMessages(platform, conversationId);
      setMessages(response.data.data.messages || []);
    } catch (error) {
      toast.error('Error al cargar mensajes');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    setIsSending(true);
    const msgContent = newMessage;
    setNewMessage('');

    try {
      await serviceApi.sendMessage(platform, selectedConversation.id, msgContent);
      fetchMessages(selectedConversation.id);
      fetchConversations();
    } catch (error) {
      toast.error('Error al enviar mensaje');
      setNewMessage(msgContent);
    } finally {
      setIsSending(false);
    }
  };

  const handleToggleBot = async () => {
    if (!selectedConversation) return;
    try {
      const response = await serviceApi.toggleBot(platform, selectedConversation.id);
      const newState = response.data.data.is_bot_active;
      setSelectedConversation({ ...selectedConversation, is_bot_active: newState });
      toast.success(newState ? 'Bot activado' : 'Control manual activado');
      fetchConversations();
    } catch (error) {
      toast.error('Error al cambiar estado del bot');
    }
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contact_phone?.includes(searchTerm)
  );

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Hoy';
    if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
    return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'sent': return <Check className="w-3.5 h-3.5 text-gray-500" />;
      case 'delivered': return <CheckCheck className="w-3.5 h-3.5 text-gray-500" />;
      case 'read': return <CheckCheck className="w-3.5 h-3.5" style={{ color: config.color }} />;
      case 'failed': return <AlertTriangle className="w-3.5 h-3.5 text-red-400" />;
      default: return <Clock className="w-3.5 h-3.5 text-gray-500" />;
    }
  };

  // Group messages by date
  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';

    // Filtrar mensajes inválidos
    const validMessages = msgs.filter(msg => msg && msg.created_at);

    validMessages.forEach((msg) => {
      try {
        const msgDate = new Date(msg.created_at).toDateString();
        if (msgDate !== currentDate) {
          currentDate = msgDate;
          groups.push({ date: msg.created_at, messages: [msg] });
        } else {
          groups[groups.length - 1]?.messages.push(msg);
        }
      } catch (err) {
        console.error('Error agrupando mensaje:', err, msg);
      }
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  // Connection banners
  const showDisconnected = config.showConnectionStatus && connectionStatus && !connectionStatus.connected;
  const showExpiring = config.showConnectionStatus && connectionStatus?.tokenStatus === 'expiring_soon';

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-5rem)] md:h-[calc(100vh-8rem)] rounded-2xl overflow-hidden flex items-center justify-center" style={{ backgroundColor: config.bgDark }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: `${config.color}40`, borderTopColor: config.color }} />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-5rem)] md:h-[calc(100vh-8rem)] rounded-2xl overflow-hidden flex flex-col" style={{ backgroundColor: config.bgDark }}>
      {/* Connection Warning Banners */}
      {showDisconnected && (
        <div className="px-4 py-2.5 bg-red-500/10 border-b border-red-500/20 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300 flex-1">
            Cuenta no conectada.{' '}
            <Link href="/client/services/connect" className="underline font-medium hover:text-red-200">
              Conectar ahora
            </Link>
          </p>
        </div>
      )}
      {showExpiring && (
        <div className="px-4 py-2.5 bg-yellow-500/10 border-b border-yellow-500/20 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <p className="text-sm text-yellow-300 flex-1">
            Tu conexión expira pronto.
            <Link href="/client/services/connect" className="underline font-medium hover:text-yellow-200 ml-1">
              Renovar
            </Link>
          </p>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        {/* ─── Conversations List (Left Panel) ─── */}
        <div className={`w-full md:w-[380px] lg:w-[420px] border-r border-white/5 flex flex-col flex-shrink-0 ${
          selectedConversation ? 'hidden md:flex' : 'flex'
        }`} style={{ backgroundColor: config.bgDark }}>

          {/* Header */}
          <div className="p-4 flex items-center justify-between" style={{ backgroundColor: config.bgHeader }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                style={{ backgroundColor: `${config.color}20` }}>
                {config.icon}
              </div>
              <div>
                <span className="font-semibold text-white">{config.name}</span>
                {connectionStatus?.accountName && (
                  <p className="text-xs text-gray-400">{connectionStatus.accountName}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {socketConnected && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-[10px] text-green-400 font-medium">En vivo</span>
                </div>
              )}
              <Link href={`/client/services/${platform}/bot-config`}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <Settings className="w-5 h-5 text-gray-400 hover:text-white" />
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar conversación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none"
                style={{ backgroundColor: config.bgInput, color: '#e9edef' }}
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                <MessageSquare className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-center text-sm">
                  {searchTerm ? 'Sin resultados' : 'No hay conversaciones aún'}
                </p>
                <p className="text-xs text-center mt-2 text-gray-600">
                  Aparecerán aquí cuando tus clientes te escriban
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-white/[0.03] ${
                    selectedConversation?.id === conv.id ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium"
                      style={{ backgroundColor: `${config.color}15`, color: config.color }}>
                      {conv.contact_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    {/* Platform badge */}
                    <div className="absolute -bottom-0.5 -right-0.5 text-[10px] w-5 h-5 flex items-center justify-center rounded-full bg-gray-800 border border-gray-700">
                      {platformIconMap[platform]}
                    </div>
                  </div>

                  {/* Conversation info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate text-white text-sm">
                        {conv.contact_name || conv.contact_phone || 'Sin nombre'}
                      </p>
                      <span className="text-[11px] text-gray-500 flex-shrink-0 ml-2">
                        {conv.last_message_at && formatDate(conv.last_message_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                        {conv.last_sender === 'bot' && <Bot className="w-3 h-3 flex-shrink-0" />}
                        {conv.last_sender === 'human' && <User className="w-3 h-3 flex-shrink-0" />}
                        {conv.last_message || 'Sin mensajes'}
                      </p>
                      {conv.unread_count > 0 && (
                        <span className="ml-2 min-w-[20px] h-5 px-1.5 rounded-full text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: config.color }}>
                          {conv.unread_count > 99 ? '99+' : conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ─── Chat Area (Right Panel) ─── */}
        <div className={`flex-1 flex flex-col min-w-0 ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="px-4 py-3 flex items-center gap-3 border-b border-white/5" style={{ backgroundColor: config.bgHeader }}>
                <button onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-white/10">
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>

                {/* Contact avatar */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium"
                  style={{ backgroundColor: `${config.color}15`, color: config.color }}>
                  {selectedConversation.contact_name?.charAt(0).toUpperCase() || '?'}
                </div>

                {/* Contact info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-white">
                    {selectedConversation.contact_name || selectedConversation.contact_phone || 'Sin nombre'}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px]" style={{ color: config.color }}>
                      {platformIconMap[platform]} {config.name}
                    </span>
                    {selectedConversation.contact_phone && (
                      <span className="text-[11px] text-gray-500">{selectedConversation.contact_phone}</span>
                    )}
                  </div>
                </div>

                {/* Bot toggle */}
                <button
                  onClick={handleToggleBot}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border"
                  style={{
                    backgroundColor: selectedConversation.is_bot_active ? `${config.color}15` : 'rgba(249,115,22,0.1)',
                    borderColor: selectedConversation.is_bot_active ? `${config.color}40` : 'rgba(249,115,22,0.3)',
                    color: selectedConversation.is_bot_active ? config.color : '#fb923c',
                  }}
                >
                  {selectedConversation.is_bot_active ? (
                    <><Bot className="w-3.5 h-3.5" /> Bot ON</>
                  ) : (
                    <><User className="w-3.5 h-3.5" /> Manual</>
                  )}
                </button>
              </div>

              {/* Messages Area - with WhatsApp-style pattern background */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto"
                style={{
                  backgroundColor: config.bgDark,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              >
                <div className="p-4 space-y-1 min-h-full flex flex-col justify-end">
                  {messageGroups.map((group, groupIndex) => (
                    <div key={groupIndex}>
                      {/* Date separator */}
                      <div className="flex items-center justify-center my-4">
                        <span className="px-3 py-1 rounded-lg bg-white/5 text-[11px] text-gray-400 font-medium shadow-sm">
                          {formatDate(group.date)}
                        </span>
                      </div>

                      {/* Messages */}
                      {group.messages.map((msg, msgIndex) => {
                        const isContact = msg.sender_type === 'contact';
                        const isBot = msg.sender_type === 'bot';
                        const isHuman = msg.sender_type === 'human';

                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.15 }}
                            className={`flex ${isContact ? 'justify-start' : 'justify-end'} mb-1`}
                          >
                            <div
                              className="max-w-[75%] sm:max-w-[65%] px-3 py-2 rounded-2xl shadow-sm relative"
                              style={{
                                backgroundColor: isContact
                                  ? config.bgTheirMsg
                                  : isBot ? config.bgBotMsg : config.bgMyMsg,
                                borderTopLeftRadius: isContact ? '4px' : undefined,
                                borderTopRightRadius: !isContact ? '4px' : undefined,
                              }}
                            >
                              {/* Sender label for bot/human */}
                              {!isContact && (
                                <div className="flex items-center gap-1 mb-0.5">
                                  {isBot ? (
                                    <span className="text-[10px] font-medium flex items-center gap-1 opacity-70 text-emerald-300">
                                      <Bot className="w-3 h-3" /> Bot
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-medium flex items-center gap-1 opacity-70 text-blue-300">
                                      <User className="w-3 h-3" /> Tú
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Message content */}
                              <p className="text-[13.5px] leading-relaxed text-gray-100 whitespace-pre-wrap break-words">
                                {msg.content}
                              </p>

                              {/* Time and status */}
                              <div className="flex items-center justify-end gap-1 mt-1 -mb-0.5">
                                <span className="text-[10px] text-gray-400 opacity-70">{formatTime(msg.created_at)}</span>
                                {!isContact && <StatusIcon status={msg.status} />}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ))}

                  {/* Typing indicator */}
                  <AnimatePresence>
                    {isBotTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                      >
                        <TypingIndicator color={config.color} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="p-3 flex items-center gap-3" style={{ backgroundColor: config.bgHeader }}>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Escribe un mensaje..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none text-gray-100 placeholder-gray-500"
                    style={{ backgroundColor: config.bgInput }}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: config.color }}
                >
                  {isSending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </>
          ) : (
            /* No conversation selected */
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500" style={{ backgroundColor: config.bgHeader }}>
              <div className="text-7xl mb-6 opacity-30">{config.icon}</div>
              <h2 className="text-xl font-light text-gray-300 mb-2">{config.name}</h2>
              <p className="text-center text-sm max-w-sm text-gray-500">
                Selecciona una conversación para ver los mensajes
              </p>
              {conversations.length === 0 && (
                <p className="text-center text-xs max-w-sm text-gray-600 mt-4">
                  Las conversaciones aparecerán aquí cuando tus clientes te escriban
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
