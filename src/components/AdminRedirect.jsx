import { useEffect, useState } from 'react';
import { authManager } from '../utils/authManager';

const AdminRedirect = () => {
    const [hasChecked, setHasChecked] = useState(false);    useEffect(() => {
        const checkAdminStatus = () => {
            // Verificar si ya estamos en una página de admin
            if (window.location.pathname.includes('/admin/')) {
                return;
            }

            const user = authManager.getUser();
            
            // Verificar cookie como respaldo
            const cookies = document.cookie.split(';');
            const userRoleCookie = cookies.find(cookie => cookie.trim().startsWith('userRole='));
            const cookieRole = userRoleCookie ? userRoleCookie.split('=')[1] : null;
            
            const isAdmin = (user?.role === 'admin') || (cookieRole === 'admin');
            if (isAdmin) {
                window.location.replace('/admin/dashboard');
                return;
            }
        };        // Escuchar cambios en el estado de autenticación
        const handleAuthStateChanged = (event) => {
            if (event.detail && event.detail.role === 'admin') {
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