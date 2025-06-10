import { authManager } from './authManager';

class ApiManager {
  constructor() {
    this.baseUrl = 'http://localhost:8000';
    this.csrfToken = this.generateCSRFToken();
  }

  // Generar token CSRF
  generateCSRFToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
  // Obtener headers comunes
  async getHeaders() {
    const token = await authManager.getToken();
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
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });
    return this.handleResponse(response);
  }
  async post(endpoint, data) {
    let options = {
      method: 'POST',
      credentials: 'include',
    };

    if (data instanceof FormData) {
      options.body = data;
      // Solo añade los headers de autorización y CSRF, pero NO Content-Type
      const token = await authManager.getToken();
      options.headers = {
        'Authorization': token ? `Bearer ${token}` : '',
        'X-CSRF-Token': this.csrfToken,
      };
    } else {
      options.body = JSON.stringify(data);
      options.headers = await this.getHeaders();
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);
    return this.handleResponse(response);
  }  async put(endpoint, data) {
    let options = {
      method: 'PUT',
      credentials: 'include',
    };

    if (data instanceof FormData) {
      options.body = data;
      // Solo añade los headers de autorización y CSRF, pero NO Content-Type
      const token = await authManager.getToken();
      options.headers = {
        'Authorization': token ? `Bearer ${token}` : '',
        'X-CSRF-Token': this.csrfToken,
      };
    } else {
      options.body = JSON.stringify(data);
      options.headers = await this.getHeaders();
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);
    return this.handleResponse(response);
  }
  async delete(endpoint, data = null) {
    const options = {
      method: 'DELETE',
      headers: await this.getHeaders(),
      credentials: 'include',
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, options);
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
  }  async updateProfile(userData) {
    // Use PUT method directly to handle FormData properly
    const data = await this.put('/auth/update-profile', userData);
    // Don't automatically set auth data since this is profile update, not login
    return data;
  }

  async followUser(uid, currentUserUid) {
    return await this.post(`/auth/follow/${uid}`, { current_user_uid: currentUserUid });
  }

  async unfollowUser(uid, currentUserUid) {
    return await this.post(`/auth/unfollow/${uid}`, { current_user_uid: currentUserUid });
  }

  async removeFollower(uid, followerUid) {
    return await this.post(`/auth/remove-follower/${uid}`, { current_user_uid: followerUid });
  }

  async getFollowers(uid) {
    return await this.get(`/auth/followers/${uid}`);
  }

  async getFollowing(uid) {
    return await this.get(`/auth/following/${uid}`);
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

  // Obtener información de usuario por UID
  async getUserByUid(uid) {
    return this.get(`/usuarios/uid/${uid}`);
  }

  // Obtener información de usuario por email
  async getUserByEmail(email) {
    return this.get(`/usuarios/email/${encodeURIComponent(email)}`);
  }

  // Métodos para productos favoritos
  async addFavoriteProduct(userEmail, productoId) {
    return this.post(`/usuarios/${encodeURIComponent(userEmail)}/productos-favoritos/${productoId}`);
  }

  async getFavoriteProducts(userEmail) {
    return this.get(`/usuarios/${encodeURIComponent(userEmail)}/productos-favoritos`);
  }

  async removeFavoriteProduct(userEmail, productoId) {
    return this.delete(`/usuarios/${encodeURIComponent(userEmail)}/productos-favoritos/${productoId}`);
  }

  // Métodos para artículos guardados
  async addSavedArticle(userEmail, articuloId) {
    return this.post(`/usuarios/${encodeURIComponent(userEmail)}/articulos-guardados/${articuloId}`);
  }

  async getSavedArticles(userEmail) {
    return this.get(`/usuarios/${encodeURIComponent(userEmail)}/articulos-guardados`);
  }

  async removeSavedArticle(userEmail, articuloId) {
    return this.delete(`/usuarios/${encodeURIComponent(userEmail)}/articulos-guardados/${articuloId}`);
  }
}

// Exportar una única instancia
export const apiManager = new ApiManager();