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
    }),    {
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
    this.expirationTimer = null;
    this.warningShown = false;
    this.isMonitoring = false;
  }  // Guardar datos de autenticación
  setAuthData(data) {
    // Guardar en el store de Zustand únicamente
    const userData = {
      email: data.email,
      name: data.nombre || data.email,
      photo: data.foto,
      role: data.role,
      uid: data.uid,
      biografia: data.biografia || '',
    };
    
    this.store.getState().setAuth(userData, data.idToken, data.refreshToken);    // Configurar cookies con expiración de 7 días
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);
    
    // En desarrollo no usar Secure para que funcione en HTTP
    const isProduction = window.location.protocol === 'https:';
    const cookieOptions = `Path=/; Expires=${expirationDate.toUTCString()}; SameSite=Strict${isProduction ? '; Secure' : ''}`;
      document.cookie = `auth_token=${data.idToken}; ${cookieOptions}`;
    document.cookie = `userRole=${data.role}; ${cookieOptions}`;

    // Disparar evento personalizado para notificar cambios
    window.dispatchEvent(new CustomEvent('authStateChanged', { detail: userData }));

    // Iniciar monitoreo de expiración
    this.startExpirationMonitoring();
  }
  // Limpiar datos de autenticación
  clearAuthData() {    // Limpiar store únicamente
    this.store.getState().clearAuth();

    // Limpiar cookies seguras
    this.clearSecureCookie('auth_token');
    this.clearSecureCookie('userRole');

    // Detener monitoreo de expiración
    this.stopExpirationMonitoring();

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
      const refreshToken = this.store.getState().refreshToken;
      
      if (refreshToken) {
        try {
          const newToken = await this.refreshIdToken(refreshToken);
          token = newToken;
        } catch (e) {
          this.clearAuthData();
          return null;
        }
      } else {
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

  // Verificar si es admin con respaldo en cookies
  isAdminWithCookieBackup() {
    // Primero verificar el store
    if (this.store.getState().user?.role === 'admin') {
      return true;
    }

    // Si no está en el store, verificar la cookie como respaldo
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      const userRoleCookie = cookies.find(cookie => cookie.trim().startsWith('userRole='));
      const cookieRole = userRoleCookie ? userRoleCookie.split('=')[1] : null;
      return cookieRole === 'admin';
    }

    return false;
  }

  // Inicializar monitoreo para usuarios ya autenticados
  initializeForExistingAuth() {
    // Solo ejecutar si estamos en el navegador
    if (typeof window === 'undefined') return;
      // Verificar si ya hay un usuario autenticado
    if (this.isAuthenticated() && this.isTokenValid()) {
      this.startExpirationMonitoring();
    }
  }
  // Cerrar sesión
  logout() {
    this.clearAuthData();
  }

  // Iniciar monitoreo de expiración del token
  startExpirationMonitoring() {
    // Detener cualquier monitoreo previo
    this.stopExpirationMonitoring();
    
    // Resetear flag de advertencia
    this.warningShown = false;
    this.isMonitoring = true;
    
    // Verificar cada 30 segundos
    this.expirationTimer = setInterval(() => {
      this.checkTokenExpiration();
    }, 30000); // 30 segundos
    
    // Verificar inmediatamente
    this.checkTokenExpiration();
  }

  // Detener monitoreo de expiración
  stopExpirationMonitoring() {
    if (this.expirationTimer) {
      clearInterval(this.expirationTimer);
      this.expirationTimer = null;
    }
    this.isMonitoring = false;
    this.warningShown = false;
  }

  // Verificar si el token está cerca de expirar o ya expiró
  checkTokenExpiration() {
    const token = this.store.getState().token;
    if (!token || !this.isAuthenticated()) {
      this.stopExpirationMonitoring();
      return;
    }

    const payload = parseJwt(token);
    if (!payload || !payload.exp) {
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiration = payload.exp - now;    // Si el token ya expiró, cerrar sesión y redirigir
    if (timeUntilExpiration <= 0) {
      this.handleTokenExpired();
      return;
    }

    // Si faltan 3 minutos o menos (180 segundos) y no se ha mostrado la advertencia
    if (timeUntilExpiration <= 180 && !this.warningShown) {
      this.showExpirationWarning(timeUntilExpiration);
      this.warningShown = true;
    }
  }

  // Manejar token expirado
  handleTokenExpired() {
    // Detener monitoreo
    this.stopExpirationMonitoring();
    
    // Limpiar datos de autenticación
    this.clearAuthData();
    
    // Mostrar notificación de sesión expirada
    this.showSessionExpiredNotification();
    
    // Redirigir a la página principal después de un breve delay
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  }

  // Mostrar advertencia de expiración próxima
  showExpirationWarning(timeUntilExpiration) {
    const minutes = Math.ceil(timeUntilExpiration / 60);
    const message = `Tu sesión expirará en ${minutes} minuto${minutes !== 1 ? 's' : ''}. ¿Deseas continuar?`;
    
    // Crear evento personalizado para mostrar notificación
    window.dispatchEvent(new CustomEvent('tokenExpirationWarning', { 
      detail: { 
        message,
        timeUntilExpiration,
        onContinue: () => this.refreshTokenManually()
      }
    }));
  }

  // Mostrar notificación de sesión expirada
  showSessionExpiredNotification() {
    const message = 'Tu sesión ha expirado. Serás redirigido a la página principal.';
    
    // Crear evento personalizado para mostrar notificación
    window.dispatchEvent(new CustomEvent('sessionExpired', { 
      detail: { message }
    }));
  }

  // Refrescar token manualmente cuando el usuario elige continuar
  async refreshTokenManually() {
    try {
      const refreshToken = this.store.getState().refreshToken;
      if (refreshToken) {
        await this.refreshIdToken(refreshToken);
        this.warningShown = false; // Permitir mostrar advertencia nuevamente si es necesario
        
        // Notificar que la sesión se extendió
        window.dispatchEvent(new CustomEvent('sessionExtended', { 
          detail: { message: 'Sesión extendida exitosamente' }
        }));      } else {
        throw new Error('No se encontró refresh token');
      }
    } catch (error) {
      this.handleTokenExpired();
    }
  }
}

// Exportar una única instancia
export const authManager = new AuthManager();

// Inicializar monitoreo automáticamente si ya hay un usuario autenticado
// Solo ejecutar en el lado del cliente
if (typeof window !== 'undefined') {
  // Usar un pequeño delay para asegurar que el store esté hidratado
  setTimeout(() => {
    authManager.initializeForExistingAuth();
  }, 100);
}