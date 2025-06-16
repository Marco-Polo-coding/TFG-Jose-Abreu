import React, { useState, useEffect } from 'react';
import { FaSearch, FaTrash, FaEdit, FaPlus, FaSort, FaSortUp, FaSortDown, FaExclamationTriangle, FaEye, FaEyeSlash } from 'react-icons/fa';
import LoadingSpinner from '../LoadingSpinner';
import ConfirmModal from '../ConfirmModal';
import AdminDeleteModal from './AdminDeleteModal';
import ReactDOM from 'react-dom';
import PasswordRequirements from '../PasswordRequirements';
import { apiManager } from '../../utils/apiManager';
import { authManager } from '../../utils/authManager';
import { showAdminToast } from './AdminToast';

// Generador simple de UID si no hay uuid
function generateUID() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

const UserFormModal = ({ isOpen, onClose, onSubmit, initialData, mode }) => {
  const [form, setForm] = React.useState({
    nombre: initialData?.nombre || '',
    email: initialData?.email || '',
    role: initialData?.role || 'user',
    password: ''
  });
  const [error, setError] = React.useState('');
  const foto = initialData?.foto || '';
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    setForm({
      nombre: initialData?.nombre || '',
      email: initialData?.email || '',
      role: initialData?.role || 'user',
      password: ''
    });
    setError('');
  }, [isOpen, initialData]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.role || (mode === 'add' && !form.password)) {
      setError('Todos los campos son obligatorios');
      return;
    }
    setError('');
    await onSubmit(form);
  };

  if (!isOpen) return null;
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-40 z-[1000]" onClick={handleOverlayClick}></div>
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-fade-in relative z-[1010]">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{mode === 'edit' ? 'Editar usuario' : 'Añadir usuario'}</h2>
        {mode === 'edit' && foto && (
          <div className="flex justify-center mb-4">
            <img src={foto} alt="Foto de perfil" className="w-20 h-20 rounded-full object-cover border-4 border-purple-200 shadow" />
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select name="role" value={form.role} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          {mode === 'add' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              <PasswordRequirements password={form.password} />
            </div>
          )}
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition">{mode === 'edit' ? 'Guardar' : 'Añadir'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ErrorModal = ({ open, onClose, message }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-fade-in">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="px-6 py-2 rounded-full bg-red-500 text-white font-semibold shadow hover:bg-red-600 transition"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

// Modal de detalle de usuario
const AdminUsuarioDetalleModal = ({ isOpen, onClose, usuario }) => {
  if (!isOpen || !usuario) return null;
  const inicial = usuario.nombre?.[0]?.toUpperCase() || usuario.email?.[0]?.toUpperCase() || '?';
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={handleOverlayClick}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-fade-in relative">
        <button onClick={onClose} className="absolute top-4 right-6 text-gray-400 hover:text-purple-600 text-2xl font-bold" aria-label="Cerrar">&times;</button>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Detalle de Usuario</h2>
        <div className="flex flex-col items-center mb-4">
          {usuario.foto ? (
            <img src={usuario.foto} alt="Foto de perfil" className="w-24 h-24 rounded-full object-cover border-4 border-purple-200 shadow mb-2" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center mb-2">
              <span className="text-4xl text-purple-600 font-bold">{inicial}</span>
            </div>
          )}
          <div className="text-lg font-semibold text-gray-800">{usuario.nombre || 'Sin nombre'}</div>
          <div className="text-sm text-gray-500">{usuario.email}</div>
        </div>
        <div className="text-left space-y-2 mb-4">
          <div><span className="font-semibold">Rol:</span> {usuario.role}</div>
          <div><span className="font-semibold">UID:</span> {usuario.uid || usuario.id}</div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteUser, setDeleteUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [errorModal, setErrorModal] = useState("");
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState(null);
  const [detalleUsuario, setDetalleUsuario] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);
  const fetchUsers = async () => {
    try {
      const data = await apiManager.get('/admin/users');
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      let userFriendlyMessage = 'Error al cargar los usuarios. Por favor, intenta de nuevo.';
      
      if (err.message.includes('fetch') || err.message.includes('network') || err.message.includes('Failed to fetch')) {
        userFriendlyMessage = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (err.message.includes('401') || err.message.includes('unauthorized')) {
        userFriendlyMessage = 'Sesión expirada. Por favor, inicia sesión de nuevo.';
      } else if (err.message.includes('403') || err.message.includes('forbidden')) {
        userFriendlyMessage = 'No tienes permisos para ver esta información.';
      } else if (err.message.includes('500')) {
        userFriendlyMessage = 'Error del servidor. Por favor, contacta al administrador.';
      }
      
      setError(userFriendlyMessage);
    } finally {
      setLoading(false);
    }
  };  const handleDeleteUser = (user) => {
    // Obtener el usuario actual (admin logueado)
    const currentUser = authManager.getUser();
    const currentUserId = currentUser?.uid;
    const targetUserId = user.uid || user.id;
    
    // Verificar si está intentando eliminarse a sí mismo
    if (currentUserId === targetUserId) {
      showAdminToast('No puedes eliminar tu propia cuenta de administrador mientras tienes una sesión activa', 'error');
      return;
    }
    
    setDeleteUser(user);
  };  const confirmDeleteUser = async () => {
    if (!deleteUser) return;
    
    // Verificación de seguridad adicional
    const currentUser = authManager.getUser();
    const currentUserId = currentUser?.uid;
    const userId = typeof deleteUser === 'object' ? deleteUser.uid : deleteUser;
    
    if (currentUserId === userId) {
      showAdminToast('Error: No puedes eliminar tu propia cuenta de administrador', 'error');
      setDeleteUser(null);
      return;
    }
    
    try {
      const userName = typeof deleteUser === 'object' ? deleteUser.nombre || deleteUser.email : 'Usuario';
      await apiManager.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u.uid !== userId));
      setDeleteUser(null);
      showAdminToast(`Usuario "${userName}" eliminado correctamente`, 'success');
    } catch (err) {
      console.error('Error deleting user:', err);
      let userFriendlyMessage = 'Error al eliminar el usuario. Por favor, intenta de nuevo.';
      
      if (err.message.includes('fetch') || err.message.includes('network')) {
        userFriendlyMessage = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (err.message.includes('401') || err.message.includes('unauthorized')) {
        userFriendlyMessage = 'Sesión expirada. Por favor, inicia sesión de nuevo.';
      } else if (err.message.includes('403') || err.message.includes('forbidden')) {
        userFriendlyMessage = 'No tienes permisos para eliminar usuarios.';
      } else if (err.message.includes('404')) {
        userFriendlyMessage = 'El usuario ya no existe o ha sido eliminado.';
      }
      
      showAdminToast(userFriendlyMessage, 'error');
      setDeleteUser(null);
    }
  };

  const handleEditUser = (user) => {
    setEditUser(user);
  };  const handleUpdateUser = async (form) => {
    try {
      const updated = await apiManager.put(`/admin/users/${editUser.uid || editUser.id}`, {
        nombre: form.nombre,
        email: form.email,
        role: form.role      });
      setUsers(users.map(u => (u.uid || u.id) === (editUser.uid || editUser.id) ? updated : u));
      setEditUser(null);
      showAdminToast(`Usuario "${form.nombre}" actualizado correctamente`, 'success');
    } catch (err) {
      console.error('Error updating user:', err);
      let userFriendlyMessage = 'Error al actualizar el usuario. Por favor, intenta de nuevo.';
      
      if (err.message.includes('fetch') || err.message.includes('network')) {
        userFriendlyMessage = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (err.message.includes('401') || err.message.includes('unauthorized')) {
        userFriendlyMessage = 'Sesión expirada. Por favor, inicia sesión de nuevo.';
      } else if (err.message.includes('403') || err.message.includes('forbidden')) {
        userFriendlyMessage = 'No tienes permisos para editar usuarios.';
      } else if (err.message.includes('409') || err.message.includes('conflict')) {
        userFriendlyMessage = 'El email ya está en uso por otro usuario.';      } else if (err.message.includes('400') || err.message.includes('bad request')) {
        userFriendlyMessage = 'Datos inválidos. Por favor, verifica la información.';
      }
      
      showAdminToast(userFriendlyMessage, 'error');
    }
  };

  const handleAddUser = () => {
    setShowAdd(true);
  };

  const handleCreateUser = async (form) => {
    try {
      const uid = generateUID();
      const created = await apiManager.post('/admin/users', {
        nombre: form.nombre,
        email: form.email,
        role: form.role,
        password: form.password,
        uid      });
      setUsers([...users, created]);
      setShowAdd(false);
      showAdminToast(`Usuario "${form.nombre}" creado correctamente`, 'success');
    } catch (err) {
      showAdminToast(err.message || 'Error al crear el usuario', 'error');
    }
  };

  const handleSort = (field) => {
    if (sortBy !== field) {
      setSortBy(field);
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else if (sortOrder === 'desc') {
      setSortBy('');
      setSortOrder(null);
    } else {
      setSortOrder('asc');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  let sortedUsers = [...filteredUsers];
  if (sortBy && sortOrder) {
    sortedUsers.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  } else {
    sortedUsers = filteredUsers;
  }

  // Añadir función para el icono de ordenación
  const getSortIcon = (order) => {
    if (order === 'asc') return <FaSortUp className="inline ml-1 text-purple-400" />;
    if (order === 'desc') return <FaSortDown className="inline ml-1 text-purple-400" />;
    return <FaSort className="inline ml-1 text-gray-300" />;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-8 py-6 rounded-2xl shadow-lg flex flex-col items-center animate-fade-in">
          <FaExclamationTriangle className="text-4xl text-red-400 mb-2" />
          <p className="text-lg font-semibold mb-1">Error al obtener usuarios</p>
          <span className="text-sm text-red-500">{error}</span>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-5 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestión de Usuarios</h1>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <button onClick={handleAddUser} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <FaPlus /> Añadir
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:text-purple-600 transition" onClick={() => handleSort('nombre')}>
                USUARIO {getSortIcon(sortBy === 'nombre' ? sortOrder : '')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:text-purple-600 transition" onClick={() => handleSort('email')}>
                EMAIL {getSortIcon(sortBy === 'email' ? sortOrder : '')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:text-purple-600 transition" onClick={() => handleSort('role')}>
                ROL {getSortIcon(sortBy === 'role' ? sortOrder : '')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:text-purple-600 transition" onClick={() => handleSort('uid')}>
                UID {getSortIcon(sortBy === 'uid' ? sortOrder : '')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedUsers.map((user) => (
              <tr key={user.uid || user.id} className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition cursor-pointer" onClick={e => { if (!e.target.closest('.acciones-btn')) setDetalleUsuario(user); }}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 relative">
                      {user.foto ? (
                        <img
                          src={user.foto}
                          alt="Foto de perfil"
                          className="h-10 w-10 rounded-full object-cover border-2 border-purple-200"
                          onError={e => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            const fallback = e.target.parentNode.querySelector('.fallback-initial');
                            if (fallback) fallback.style.display = 'flex';
                          }}
                          style={{ display: user.foto ? 'block' : 'none' }}
                        />
                      ) : null}                      <div
                        className="absolute top-0 left-0 w-full h-full rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center fallback-initial"
                        style={{ display: !user.foto ? 'flex' : 'none' }}
                      >
                        <span className="text-purple-600 dark:text-purple-300 font-medium">
                          {user.nombre?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.nombre || 'Sin nombre'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  }`}>
                    {user.role || 'usuario'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-xs text-gray-500">{user.uid || user.id}</div>
                </td>                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2 acciones-btn">
                  <button
                    onClick={e => { e.stopPropagation(); setDetalleUsuario(user); }}
                    className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700 transition"
                    title="Ver detalle"
                  >
                    <FaEye />
                  </button>
                  {(() => {
                    const currentUser = authManager.getUser();
                    const isCurrentUser = currentUser?.uid === (user.uid || user.id);
                    return (
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className={`mr-4 transition ${
                          isCurrentUser 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                        }`}
                        title={isCurrentUser ? 'No puedes eliminar tu propia cuenta' : 'Eliminar usuario'}
                        disabled={isCurrentUser}
                      >
                        <FaTrash />
                      </button>
                    );
                  })()}
                  <button onClick={() => handleEditUser(user)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                    <FaEdit />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modales */}      <AdminDeleteModal
        isOpen={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={confirmDeleteUser}
        title="¿Eliminar usuario?"
        message="¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer."
        itemName={deleteUser ? `${deleteUser.nombre} (${deleteUser.email})` : ''}
      />
      <UserFormModal
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        onSubmit={handleUpdateUser}
        initialData={editUser}
        mode="edit"
      />
      <UserFormModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={handleCreateUser}
        mode="add"
      />
      <ErrorModal open={!!errorModal} onClose={() => setErrorModal("")} message={errorModal} />
      <AdminUsuarioDetalleModal
        isOpen={!!detalleUsuario}
        onClose={() => setDetalleUsuario(null)}
        usuario={detalleUsuario}
      />
    </div>
  );
};

export default UserManagement; 