import { create } from 'zustand';

// Estado global para la autenticación
const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  token: null,
  setAuth: (user, token) => set({ isAuthenticated: true, user, token }),
  clearAuth: () => set({ isAuthenticated: false, user: null, token: null }),
}));

// Añadir función para decodificar JWT y obtener la expiración
function parseJwt (token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

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
    safeSetItem('refreshToken', data.refreshToken);
    safeSetItem('userEmail', data.email);
    safeSetItem('userName', data.nombre || data.email);
    safeSetItem('uid', data.uid);
    if (data.foto) safeSetItem('userPhoto', data.foto);
    if (data.role) safeSetItem('userRole', data.role);

    // Guardar en el store
    const userData = {
      email: data.email,
      name: data.nombre || data.email,
      photo: data.foto,
      role: data.role,
      uid: data.uid,
    };
    
    this.store.getState().setAuth(userData, data.idToken);

    // Configurar cookie segura con expiración de 7 días
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);
    document.cookie = `auth_token=${data.idToken}; Path=/; Expires=${expirationDate.toUTCString()}; Secure; SameSite=Strict`;

    // Disparar evento personalizado para notificar cambios
    window.dispatchEvent(new CustomEvent('authStateChanged', { detail: userData }));
  }

  // Limpiar datos de autenticación
  clearAuthData() {
    // Limpiar localStorage (mantener compatibilidad)
    safeRemoveItem('token');
    safeRemoveItem('refreshToken');
    safeRemoveItem('userEmail');
    safeRemoveItem('userName');
    safeRemoveItem('userPhoto');
    safeRemoveItem('userRole');
    safeRemoveItem('uid');

    // Limpiar store
    this.store.getState().clearAuth();

    // Limpiar cookie segura
    this.clearSecureCookie('auth_token');

    // Disparar evento personalizado para notificar cambios
    window.dispatchEvent(new CustomEvent('authStateChanged', { detail: null }));
  }

  // Métodos para cookies seguras
  setSecureCookie(name, value) {
    const secure = window.location.protocol === 'https:';
    document.cookie = `${name}=${value}; Path=/; ${secure ? 'Secure;' : ''} SameSite=Strict`;
  }

  clearSecureCookie(name) {
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }

  // Obtener token actual (con refresco automático)
  async getToken() {
    let token = this.store.getState().token || safeGetItem('token');
    if (!token) return null;
    
    const payload = parseJwt(token);
    const now = Math.floor(Date.now() / 1000);
    
    // Si el token expira en menos de 5 minutos, refrescarlo
    if (payload && payload.exp && payload.exp - now < 300) {
      console.log('Token expirando pronto, intentando refrescar...');
      const refreshToken = safeGetItem('refreshToken');
      
      if (refreshToken) {
        try {
          const newToken = await this.refreshIdToken(refreshToken);
          console.log('Token refrescado exitosamente');
          token = newToken;
        } catch (e) {
          console.error('Error al refrescar token:', e);
          this.clearAuthData();
          return null;
        }
      } else {
        console.error('No se encontró refreshToken');
        this.clearAuthData();
        return null;
      }
    }
    return token;
  }

  // Refrescar el idToken usando el refreshToken de Firebase
  async refreshIdToken(refreshToken) {
    const apiKey = process.env.REACT_APP_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || '';
    const url = `https://securetoken.googleapis.com/v1/token?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=refresh_token&refresh_token=${refreshToken}`
    });
    const data = await res.json();
    if (!res.ok) throw new Error('No se pudo refrescar el token');
    // Guardar el nuevo token
    safeSetItem('token', data.id_token);
    safeSetItem('refreshToken', data.refresh_token);
    this.store.getState().setAuth(this.getUser(), data.id_token);
    this.setSecureCookie('auth_token', data.id_token);
    return data.id_token;
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