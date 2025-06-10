import { useEffect, useState } from 'react';
import { authManager } from '../utils/authManager';

const AdminRedirect = () => {
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        // Solo ejecutar una vez
        if (hasChecked) return;

        const checkAdminStatus = () => {
            console.log('AdminRedirect: Verificando estado de admin...');
            
            // Verificar si ya estamos en una página de admin
            if (window.location.pathname.includes('/admin/')) {
                console.log('AdminRedirect: Ya estamos en página de admin, no hacer nada');
                setHasChecked(true);
                return;
            }

            const user = authManager.getUser();
            console.log('AdminRedirect: Usuario en store:', user);
            
            // Verificar cookie como respaldo
            const cookies = document.cookie.split(';');
            const userRoleCookie = cookies.find(cookie => cookie.trim().startsWith('userRole='));
            const cookieRole = userRoleCookie ? userRoleCookie.split('=')[1] : null;
            console.log('AdminRedirect: Rol en cookie:', cookieRole);
            
            const isAdmin = (user?.role === 'admin') || (cookieRole === 'admin');
            console.log('AdminRedirect: ¿Es admin?', isAdmin);
            
            if (isAdmin) {
                console.log('AdminRedirect: Redirigiendo a dashboard de admin...');
                window.location.href = '/admin/dashboard';
            }
            
            setHasChecked(true);
        };

        // Esperar un poco para que se establezcan las cookies después del login
        const timeoutId = setTimeout(checkAdminStatus, 500);

        return () => clearTimeout(timeoutId);
    }, [hasChecked]);

    return null;
};

export default AdminRedirect;