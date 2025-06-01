import { authManager } from './authManager';

class ChatManager {
  constructor() {
    this.baseUrl = 'http://localhost:8000';
  }

  // Obtener headers comunes
  async getHeaders() {
    const token = await authManager.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  // Manejar respuesta
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error en la petición');
    }
    return response.json();
  }

  // Enviar mensaje al chat
  async sendMessage(message, history = []) {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message,
        history
      })
    });
    return this.handleResponse(response);
  }

  // Crear nuevo chat
  async createChat(name = null, messages = []) {
    if (!authManager.isAuthenticated()) {
      throw new Error('Debes iniciar sesión para crear un chat');
    }
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}/chats`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: name || `Chat ${new Date().toLocaleString()}`,
        messages
      })
    });
    return this.handleResponse(response);
  }

  // Obtener todos los chats del usuario
  async getChats() {
    if (!authManager.isAuthenticated()) {
      throw new Error('Debes iniciar sesión para ver los chats');
    }
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}/chats`, {
      headers
    });
    return this.handleResponse(response);
  }

  // Obtener un chat específico
  async getChat(chatId) {
    if (!authManager.isAuthenticated()) {
      throw new Error('Debes iniciar sesión para ver el chat');
    }
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}/chats/${chatId}`, {
      headers
    });
    return this.handleResponse(response);
  }

  // Añadir mensaje a un chat
  async addMessage(chatId, message) {
    if (!authManager.isAuthenticated()) {
      throw new Error('Debes iniciar sesión para enviar mensajes');
    }
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}/chats/${chatId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify(message)
    });
    return this.handleResponse(response);
  }

  // Renombrar un chat
  async renameChat(chatId, newName) {
    if (!authManager.isAuthenticated()) {
      throw new Error('Debes iniciar sesión para renombrar el chat');
    }
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}/chats/${chatId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ name: newName })
    });
    return this.handleResponse(response);
  }

  // Eliminar un chat
  async deleteChat(chatId) {
    if (!authManager.isAuthenticated()) {
      throw new Error('Debes iniciar sesión para eliminar el chat');
    }
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}/chats/${chatId}`, {
      method: 'DELETE',
      headers
    });
    return this.handleResponse(response);
  }

  // Migrar chats desde localStorage
  async migrateChats(chats) {
    if (!authManager.isAuthenticated()) {
      throw new Error('Debes iniciar sesión para migrar los chats');
    }
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}/chats/migrate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ chats })
    });
    return this.handleResponse(response);
  }
}

// Exportar una única instancia
export const chatManager = new ChatManager(); 