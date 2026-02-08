'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';
import { useAuthStore } from '@/stores/authStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

interface UseSocketOptions {
  serviceCode?: string;
  conversationId?: string;
  onNewMessage?: (data: any) => void;
  onBotResponse?: (data: any) => void;
  onNewConversation?: (data: any) => void;
  onTyping?: (data: any) => void;
}

export function useSocket(options: UseSocketOptions = {}) {
  const { serviceCode, conversationId, onNewMessage, onBotResponse, onNewConversation, onTyping } = options;
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuthStore();
  const previousConversationId = useRef<string | undefined>(undefined);

  // Mantener referencias actualizadas de los callbacks
  const callbacksRef = useRef({ onNewMessage, onBotResponse, onNewConversation, onTyping });
  useEffect(() => {
    callbacksRef.current = { onNewMessage, onBotResponse, onNewConversation, onTyping };
  }, [onNewMessage, onBotResponse, onNewConversation, onTyping]);

  useEffect(() => {
    const token = Cookies.get('accessToken');
    if (!token || !user) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket conectado');
      setIsConnected(true);

      // Unirse a sala del servicio
      if (serviceCode && user.id) {
        const joinData = { clientId: user.id, serviceCode };
        console.log('📌 Uniéndose a sala:', joinData);
        socket.emit('join_service', joinData);
      }

      // Unirse a sala de conversación
      if (conversationId) {
        console.log('💬 Uniéndose a conversación:', conversationId);
        socket.emit('join_conversation', { conversationId });
        previousConversationId.current = conversationId;
      }
    });

    socket.on('disconnect', () => setIsConnected(false));

    // Eventos de mensajes (usar refs para callbacks actualizados)
    socket.on('new_message', (data) => {
      console.log('🔔 Evento new_message:', data);
      callbacksRef.current.onNewMessage?.(data);
    });

    socket.on('bot_response', (data) => {
      console.log('🔔 Evento bot_response:', data);
      callbacksRef.current.onBotResponse?.(data);
    });

    socket.on('new_conversation', (data) => {
      console.log('🔔 Evento new_conversation:', data);
      callbacksRef.current.onNewConversation?.(data);
    });

    socket.on('typing', (data) => {
      callbacksRef.current.onTyping?.(data);
    });

    // Eventos de confirmación
    socket.on('joined_service', (data) => {
      console.log('✅ Unido a servicio:', data);
    });

    return () => {
      console.log('🔌 Socket desconectado');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [serviceCode, user?.id]);

  // Efecto separado para manejar cambios de conversación
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !isConnected) return;

    // Si cambió la conversación
    if (conversationId !== previousConversationId.current) {
      // Salir de la conversación anterior
      if (previousConversationId.current) {
        console.log('📤 Saliendo de conversación:', previousConversationId.current);
        socket.emit('leave_conversation', { conversationId: previousConversationId.current });
      }

      // Unirse a la nueva conversación
      if (conversationId) {
        console.log('💬 Uniéndose a conversación:', conversationId);
        socket.emit('join_conversation', { conversationId });
      }

      previousConversationId.current = conversationId;
    }
  }, [conversationId, isConnected]);

  const emitTyping = useCallback((convId: string) => {
    socketRef.current?.emit('typing', { conversationId: convId });
  }, []);

  return { socket: socketRef.current, isConnected, emitTyping };
}
