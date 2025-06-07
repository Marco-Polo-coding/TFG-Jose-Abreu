import { useEffect } from 'react';
import { authManager } from '../utils/authManager';

const AdminRedirect = () => {    useEffect(() => {
        const user = authManager.getUser();
        const userRole = user?.role;
        const cookies = document.cookie.split(';');
        const userRoleCookie = cookies.find(cookie => cookie.trim().startsWith('userRole='));
        const cookieRole = userRoleCookie ? userRoleCookie.split('=')[1] : null;
        
        console.log('Rol del usuario (authManager):', userRole);
        console.log('Rol del usuario (cookie):', cookieRole);
        
        // Solo redirigir si el usuario es admin y no está ya en la página de admin
        if ((userRole === 'admin' || cookieRole === 'admin') && !window.location.pathname.includes('/admin/')) {
            console.log('Redirigiendo a dashboard de admin...');
            window.location.href = '/admin/dashboard';
        }
    }, []);

    return null;
};

export default AdminRedirect; 