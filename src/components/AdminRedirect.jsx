import { useEffect } from 'react';

const AdminRedirect = () => {
    useEffect(() => {
        const userRole = localStorage.getItem('userRole');
        console.log('Rol del usuario:', userRole); // Log para depuración
        
        if (userRole === 'admin') {
            console.log('Redirigiendo a dashboard de admin...'); // Log para depuración
            window.location.href = '/admin/dashboard';
        }
    }, []);

    return null;
};

export default AdminRedirect; 