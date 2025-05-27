import { useEffect } from 'react';

const AdminRedirect = () => {
    useEffect(() => {
        const userRole = localStorage.getItem('userRole');
        const cookies = document.cookie.split(';');
        const userRoleCookie = cookies.find(cookie => cookie.trim().startsWith('userRole='));
        const cookieRole = userRoleCookie ? userRoleCookie.split('=')[1] : null;
        
        console.log('Rol del usuario (localStorage):', userRole);
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