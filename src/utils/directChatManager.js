import { authManager } from './authManager';

class DirectChatManager {
  constructor() {
    this.baseUrl = 'http://localhost:8000';
  }

  async getHeaders() {
    const token = await authManager.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
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

  async getMessages(chatId) {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}/direct-chats/${chatId}/messages`, {
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
}

// Exportar una única instancia
export const directChatManager = new DirectChatManager(); 