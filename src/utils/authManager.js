import { create } from 'zustand';

// Estado global para la autenticación
const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  token: null,
  setAuth: (user, token) => set({ isAuthenticated: true, user, token }),
  clearAuth: () => set({ isAuthenticated: false, user: null, token: null }),
}));

// Clase para manejar la autenticación de forma segura
class AuthManager {
  constructor() {
    this.store = useAuthStore;
    this.initializeFromStorage();
  }

  // Inicializar desde localStorage (mantener compatibilidad)
  initializeFromStorage() {
    const token = safeGetItem('token');
    const user = {
      email: safeGetItem('userEmail'),
      name: safeGetItem('userName'),
      photo: safeGetItem('userPhoto'),
      role: safeGetItem('userRole'),
      uid: safeGetItem('uid'),
    };

    if (token && user.email) {
      this.store.getState().setAuth(user, token);
    }
  }

  // Guardar datos de autenticación
  setAuthData(data) {
    // Guardar en localStorage (mantener compatibilidad)
    safeSetItem('token', data.idToken);
    safeSetItem('userEmail', data.email);
    safeSetItem('userName', data.nombre || data.email);
    safeSetItem('uid', data.uid);
    if (data.foto) safeSetItem('userPhoto', data.foto);
    if (data.role) safeSetItem('userRole', data.role);

    // Guardar en el store
    this.store.getState().setAuth({
      email: data.email,
      name: data.nombre || data.email,
      photo: data.foto,
      role: data.role,
      uid: data.uid,
    }, data.idToken);

    // Configurar cookie segura (nueva implementación)
    this.setSecureCookie('auth_token', data.idToken);
  }

  // Limpiar datos de autenticación
  clearAuthData() {
    // Limpiar localStorage (mantener compatibilidad)
    safeRemoveItem('token');
    safeRemoveItem('userEmail');
    safeRemoveItem('userName');
    safeRemoveItem('userPhoto');
    safeRemoveItem('userRole');
    safeRemoveItem('uid');

    // Limpiar store
    this.store.getState().clearAuth();

    // Limpiar cookie segura
    this.clearSecureCookie('auth_token');
  }

  // Métodos para cookies seguras
  setSecureCookie(name, value) {
    const secure = window.location.protocol === 'https:';
    document.cookie = `${name}=${value}; Path=/; ${secure ? 'Secure;' : ''} SameSite=Strict`;
  }

  clearSecureCookie(name) {
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }

  // Obtener token actual
  getToken() {
    return this.store.getState().token || safeGetItem('token');
  }

  // Verificar si está autenticado
  isAuthenticated() {
    return this.store.getState().isAuthenticated;
  }

  // Obtener datos del usuario
  getUser() {
    return this.store.getState().user;
  }

  // Verificar si es admin
  isAdmin() {
    return this.store.getState().user?.role === 'admin';
  }
}

function safeGetItem(key) {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(key);
  }
  return null;
}

function safeSetItem(key, value) {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(key, value);
  }
}

function safeRemoveItem(key) {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(key);
  }
}

// Exportar una única instancia
export const authManager = new AuthManager(); 