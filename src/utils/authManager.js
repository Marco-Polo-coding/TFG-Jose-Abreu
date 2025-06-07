import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Estado global para la autenticación con persistencia opcional
const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
      setAuth: (user, token, refreshToken = null) => set({ 
        isAuthenticated: true, 
        user, 
        token,
        refreshToken: refreshToken || null
      }),
      clearAuth: () => set({ 
        isAuthenticated: false, 
        user: null, 
        token: null,
        refreshToken: null
      }),
      updateToken: (token, refreshToken = null) => set((state) => ({ 
        ...state, 
        token,
        refreshToken: refreshToken || state.refreshToken
      })),
    }),
    {
      name: 'auth-storage', // clave única para el storage
      // Solo persistir si no quieres usar localStorage, comentar la siguiente línea
      // storage: createJSONStorage(() => sessionStorage),
    }
  )
);

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
  }

  // Guardar datos de autenticación
  setAuthData(data) {
    // Guardar en el store de Zustand únicamente
    const userData = {
      email: data.email,
      name: data.nombre || data.email,
      photo: data.foto,
      role: data.role,
      uid: data.uid,
    };
    
    this.store.getState().setAuth(userData, data.idToken, data.refreshToken);

    // Configurar cookie segura con expiración de 7 días (opcional)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);
    document.cookie = `auth_token=${data.idToken}; Path=/; Expires=${expirationDate.toUTCString()}; Secure; SameSite=Strict`;

    // Disparar evento personalizado para notificar cambios
    window.dispatchEvent(new CustomEvent('authStateChanged', { detail: userData }));
  }

  // Limpiar datos de autenticación
  clearAuthData() {
    // Limpiar store únicamente
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
  }  // Obtener token actual (con refresco automático)
  async getToken() {
    let token = this.store.getState().token;
    
    if (!token) {
      return null;
    }
    
    const payload = parseJwt(token);
    const now = Math.floor(Date.now() / 1000);
    
    // Si el token expira en menos de 5 minutos, refrescarlo
    if (payload && payload.exp && payload.exp - now < 300) {
      console.log('Token expirando pronto, intentando refrescar...');
      const refreshToken = this.store.getState().refreshToken;
      
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
    
    // Actualizar tokens en el store
    this.store.getState().updateToken(data.id_token, data.refresh_token);
    this.setSecureCookie('auth_token', data.id_token);
    return data.id_token;
  }
  // Verificar si está autenticado
  isAuthenticated() {
    return this.store.getState().isAuthenticated && !!this.store.getState().token;
  }

  // Verificar si el token es válido (no expirado)
  isTokenValid() {
    const token = this.store.getState().token;
    if (!token) return false;
    
    const payload = parseJwt(token);
    if (!payload || !payload.exp) return false;
    
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  }
  // Obtener datos del usuario
  getUser() {
    return this.store.getState().user;
  }

  // Verificar si es admin
  isAdmin() {
    return this.store.getState().user?.role === 'admin';
  }

  // Cerrar sesión
  logout() {
    this.clearAuthData();
  }
}

// Exportar una única instancia
export const authManager = new AuthManager();