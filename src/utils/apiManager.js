import { authManager } from './authManager';

class ApiManager {
  constructor() {
    this.baseUrl = 'http://127.0.0.1:8000';
    this.csrfToken = this.generateCSRFToken();
  }

  // Generar token CSRF
  generateCSRFToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Obtener headers comunes
  getHeaders() {
    const token = authManager.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'X-CSRF-Token': this.csrfToken,
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

  // Métodos HTTP
  async get(endpoint) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  async post(endpoint, data) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async put(endpoint, data) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async delete(endpoint) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse(response);
  }

  // Métodos específicos de la aplicación
  async login(credentials) {
    const data = await this.post('/auth/login', credentials);
    authManager.setAuthData(data);
    return data;
  }

  async register(userData) {
    const data = await this.post('/auth/register', userData);
    authManager.setAuthData(data);
    return data;
  }

  async logout() {
    await this.post('/auth/logout');
    authManager.clearAuthData();
  }

  async resetPassword(email) {
    return this.post('/auth/reset-password', { email });
  }

  async updateProfile(userData) {
    const data = await this.put('/auth/profile', userData);
    authManager.setAuthData(data);
    return data;
  }

  // Métodos para productos
  async getProducts() {
    return this.get('/productos');
  }

  async createProduct(productData) {
    return this.post('/productos', productData);
  }

  async updateProduct(id, productData) {
    return this.put(`/productos/${id}`, productData);
  }

  async deleteProduct(id) {
    return this.delete(`/productos/${id}`);
  }

  // Métodos para artículos
  async getArticles() {
    return this.get('/articulos');
  }

  async createArticle(articleData) {
    return this.post('/articulos', articleData);
  }

  async updateArticle(id, articleData) {
    return this.put(`/articulos/${id}`, articleData);
  }

  async deleteArticle(id) {
    return this.delete(`/articulos/${id}`);
  }
}

// Exportar una única instancia
export const apiManager = new ApiManager(); 