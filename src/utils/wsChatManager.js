// Gestor de WebSocket para chats directos
// Permite conectar, enviar mensajes, emitir eventos y recibir mensajes/eventos en tiempo real

class WSChatManager {
  constructor() {
    this.ws = null;
    this.listeners = {};
    this.chatId = null;
    this.token = null;
    this.isConnected = false;
    this.reconnectTimeout = null;
  }
  connect({ chatId, token }) {
    if (this.ws) {
      this.disconnect();
    }
    this.chatId = chatId;
    this.token = token;
    const wsUrl = `ws://localhost:8000/ws/direct-chats/${chatId}`;
    this.ws = new WebSocket(wsUrl);
    this.ws.onopen = () => {
      this.isConnected = true;
      console.log('WEBSOCKET ABIERTO', wsUrl);
      this.ws.send(JSON.stringify({ event: 'auth', token }));
      this.emit('open');
    };
    this.ws.onmessage = (event) => {
      console.log('WEBSOCKET MENSAJE RECIBIDO:', event.data);
      try {
        const data = JSON.parse(event.data);
        this.emit(data.event, data);
      } catch (e) {
        console.error('ERROR PARSEANDO MENSAJE WS:', e, event.data);
      }
    };
    this.ws.onclose = () => {
      this.isConnected = false;
      console.log('WEBSOCKET CERRADO', wsUrl);
      this.emit('close');
      // Intentar reconectar automáticamente
      if (this.chatId && this.token) {
        this.reconnectTimeout = setTimeout(() => {
          this.connect({ chatId: this.chatId, token: this.token });
        }, 2000);
      }
    };
    this.ws.onerror = (e) => {
      console.error('WEBSOCKET ERROR', e);
      this.emit('error', e);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    }
  }

  sendMessage(content) {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify({ event: 'message', content }));
    }
  }

  sendTyping() {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify({ event: 'typing' }));
    }
  }

  sendStopTyping() {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify({ event: 'stop_typing' }));
    }
  }

  sendRead() {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify({ event: 'read' }));
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
}

export const wsChatManager = new WSChatManager(); 