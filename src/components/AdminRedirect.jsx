import { useEffect, useState } from 'react';
import { authManager } from '../utils/authManager';

const AdminRedirect = () => {
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        const checkAdminStatus = () => {
            console.log('AdminRedirect: Verificando estado de admin...');
            
            // Verificar si ya estamos en una página de admin
            if (window.location.pathname.includes('/admin/')) {
                console.log('AdminRedirect: Ya estamos en página de admin, no hacer nada');
                return;
            }

            const user = authManager.getUser();
            console.log('AdminRedirect: Usuario en store:', user);
            
            // Verificar cookie como respaldo
            const cookies = document.cookie.split(';');
            const userRoleCookie = cookies.find(cookie => cookie.trim().startsWith('userRole='));
            const cookieRole = userRoleCookie ? userRoleCookie.split('=')[1] : null;
            console.log('AdminRedirect: Rol en cookie:', cookieRole);
            console.log('AdminRedirect: Todas las cookies:', document.cookie);
            
            const isAdmin = (user?.role === 'admin') || (cookieRole === 'admin');
            console.log('AdminRedirect: ¿Es admin?', isAdmin);
              if (isAdmin) {
                console.log('AdminRedirect: Redirigiendo a dashboard de admin...');
                window.location.replace('/admin/dashboard');
                return;
            }
        };

        // Escuchar cambios en el estado de autenticación
        const handleAuthStateChanged = (event) => {
            console.log('AdminRedirect: Estado de auth cambió:', event.detail);            if (event.detail && event.detail.role === 'admin') {
                console.log('AdminRedirect: Detectado usuario admin, redirigiendo inmediatamente...');
                window.location.replace('/admin/dashboard');
                return;
            }
            // Dar un pequeño delay para que las cookies se establezcan
            setTimeout(checkAdminStatus, 100);
        };

        // Verificar inmediatamente
        checkAdminStatus();

        // Verificar nuevamente después de un delay por si no había usuario al cargar
        const timeoutId = setTimeout(checkAdminStatus, 1000);

        // Escuchar cambios de autenticación
        window.addEventListener('authStateChanged', handleAuthStateChanged);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('authStateChanged', handleAuthStateChanged);
        };
    }, []); // Remover hasChecked de las dependencias para que pueda ejecutarse múltiples veces

    return null;
};

export default AdminRedirect;