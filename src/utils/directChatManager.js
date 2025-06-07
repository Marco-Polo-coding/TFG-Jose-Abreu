import { authManager } from './authManager';

class DirectChatManager {
  constructor() {
    this.baseUrl = 'http://localhost:8000';
  }
  async getHeaders() {
    const token = await authManager.getToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error en la petición');
    }
    return response.json();
  }

  async createChat(participantId) {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}/direct-chats`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ participant_id: participantId })
    });
    return this.handleResponse(response);
  }

  async getChats() {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}/direct-chats`, {
      headers
    });
    return this.handleResponse(response);
  }

  async sendMessage(chatId, content) {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}/direct-chats/${chatId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        content,
        type: 'text'
      })
    });
    return this.handleResponse(response);
  }

  async getMessages(chatId, { limit = 50, before = null } = {}) {
    const headers = await this.getHeaders();
    let url = `${this.baseUrl}/direct-chats/${chatId}/messages?limit=${limit}`;
    if (before) {
      url += `&before=${encodeURIComponent(before)}`;
    }
    const response = await fetch(url, {
      headers
    });
    return this.handleResponse(response);
  }

  async markChatAsRead(chatId) {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}/direct-chats/${chatId}/read`, {
      method: 'POST',
      headers
    });
    return this.handleResponse(response);
  }

  async editMessage(messageId, content) {
    if (!content || typeof content !== 'string' || !content.trim()) {
      throw new Error('El mensaje no puede estar vacío.');
    }
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}/direct-messages/${messageId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ content: content.trim() })
    });
    return this.handleResponse(response);
  }

  async deleteMessage(messageId) {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}/direct-messages/${messageId}`, {
      method: 'DELETE',
      headers
    });
    return this.handleResponse(response);
  }

  async leaveChat(chatId) {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}/direct-chats/${chatId}/leave`, {
      method: 'PATCH',
      headers
    });
    return this.handleResponse(response);
  }
}

// Exportar una única instancia
export const directChatManager = new DirectChatManager(); 