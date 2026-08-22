import { apiRequest } from './api';

export interface MessageContact { id: number; name: string; email: string; role: string; unread_count: number; }
export interface DirectMessage { id: number; sender_id: number; recipient_id: number; body: string; created_at: string; read_at?: string | null; }

export const messageService = {
  getContacts: () => apiRequest<MessageContact[]>('/messages/contacts'),
  getConversation: (peerId: number | string) => apiRequest<DirectMessage[]>(`/messages/${peerId}`),
  send: (recipientId: number | string, body: string) => apiRequest<DirectMessage>('/messages', { method: 'POST', body: JSON.stringify({ recipientId, body }) }),
};
