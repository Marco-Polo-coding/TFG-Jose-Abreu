import React, { useEffect, useState } from 'react';
import { FaEye, FaTrash, FaSearch, FaShoppingCart, FaSort, FaSortUp, FaSortDown, FaExclamationTriangle } from 'react-icons/fa';
import AdminCompraDetalleModal from '../AdminCompraDetalleModal';
import AdminDeleteModal from './AdminDeleteModal';
import LoadingSpinner from '../LoadingSpinner';
import ReactDOM from 'react-dom';

const columns = [
  { key: 'fecha', label: 'FECHA' },
  { key: 'total', label: 'TOTAL' },
  { key: 'metodo', label: 'MÉTODO' },
  { key: 'productos', label: 'PRODUCTOS' },
  { key: 'usuario_email', label: 'USUARIO (EMAIL)' },
];

const getSortIcon = (order) => {
  if (order === 'asc') return <FaSortUp className="inline ml-1 text-purple-400" />;
  if (order === 'desc') return <FaSortDown className="inline ml-1 text-purple-400" />;
  return <FaSort className="inline ml-1 text-gray-300" />;
};

const AdminCompraDetalleNuevoModal = ({ isOpen, onClose, compra, usuario }) => {
  if (!isOpen || !compra) return null;
  const fechaObj = compra.fecha ? new Date(compra.fecha) : null;
  const fechaStr = fechaObj ? fechaObj.toLocaleDateString('es-ES') : '-';
  const horaStr = fechaObj ? fechaObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '-';
  // Handler para cerrar al hacer click fuera
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={handleOverlayClick}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center animate-fade-in relative">
        <button onClick={onClose} className="absolute top-4 right-6 text-gray-400 hover:text-purple-600 text-2xl font-bold" aria-label="Cerrar">&times;</button>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Detalle de Compra</h2>
        <div className="mb-4 text-left">
          <div className="mb-1"><span className="font-semibold">Fecha:</span> {fechaStr}, {horaStr}</div>
          <div className="mb-1"><span className="font-semibold">Total:</span> {compra.total ? compra.total + '€' : '-'}</div>
          <div className="mb-1"><span className="font-semibold">Método de pago:</span> {compra.metodo_pago?.tipo || '-'}</div>
        </div>
        <div className="mb-4 text-left">
          <div className="font-semibold mb-1">Usuario que realizó la compra:</div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-xl font-bold text-purple-600">
              {usuario?.nombre ? usuario.nombre[0].toUpperCase() : (usuario?.email ? usuario.email[0].toUpperCase() : '?')}
            </div>
            <div>
              <div className="font-semibold text-gray-800">{usuario?.nombre || <span className='italic text-gray-400'>Desconocido</span>}</div>
              <div className="text-gray-500 text-sm">{usuario?.email || <span className='italic text-gray-400'>Desconocido</span>}</div>
            </div>
          </div>
        </div>
        <div className="mb-2 text-left">
          <div className="font-semibold mb-2">Productos comprados:</div>
          <div className="space-y-2">
            {Array.isArray(compra.productos) && compra.productos.length > 0 ? compra.productos.map((p, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-purple-50 rounded-xl p-3">
                {p.imagen ? (
                  <img src={p.imagen} alt={p.nombre} className="w-14 h-14 rounded-lg object-cover border-2 border-purple-200" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-purple-100 flex items-center justify-center text-lg font-bold text-purple-600">{p.nombre ? p.nombre[0].toUpperCase() : '?'}</div>
                )}
                <div>
                  <div className="font-semibold text-gray-800 truncate max-w-[180px]">{p.nombre}</div>
                  <div className="text-xs text-gray-500">Cantidad: {p.quantity || 1}</div>
                  <div className="text-xs text-gray-500">Precio: {p.precio}€</div>
                </div>
              </div>
            )) : <div className="text-gray-400 italic">No hay productos</div>}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const CompraManagement = () => {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCompra, setSelectedCompra] = useState(null);
  const [showDetalle, setShowDetalle] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [compraToDelete, setCompraToDelete] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState(''); // '', 'asc', 'desc'
  const [usuarios, setUsuarios] = useState([]);
  const [showNuevoDetalle, setShowNuevoDetalle] = useState(false);
  const [compraDetalle, setCompraDetalle] = useState(null);

  useEffect(() => {
    fetchCompras();
    fetchUsuarios();
  }, []);

  const fetchCompras = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:8000/admin/compras', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al obtener compras');
      const data = await res.json();
      setCompras(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:8000/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al obtener usuarios');
      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      // No bloquea la vista de compras si falla
    }
  };

  const handleDelete = async () => {
    if (!compraToDelete) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:8000/admin/compras/${compraToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al eliminar compra');
      setShowDelete(false);
      setCompraToDelete(null);
      fetchCompras();
    } catch (err) {
      alert('Error al eliminar compra: ' + err.message);
    }
  };

  const handleSort = (key) => {
    if (sortBy !== key) {
      setSortBy(key);
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else if (sortOrder === 'desc') {
      setSortBy('');
      setSortOrder('');
    } else {
      setSortOrder('asc');
    }
  };

  // Ordenar compras según columna y orden
  const getSortedCompras = () => {
    if (!sortBy || !sortOrder) return filteredCompras;
    return [...filteredCompras].sort((a, b) => {
      let aValue, bValue;
      if (sortBy === 'fecha') {
        aValue = a.fecha ? new Date(a.fecha).getTime() : 0;
        bValue = b.fecha ? new Date(b.fecha).getTime() : 0;
      } else if (sortBy === 'total') {
        aValue = parseFloat(a.total) || 0;
        bValue = parseFloat(b.total) || 0;
      } else if (sortBy === 'metodo') {
        aValue = (a.metodo_pago?.tipo || '').toLowerCase();
        bValue = (b.metodo_pago?.tipo || '').toLowerCase();
      } else if (sortBy === 'productos') {
        aValue = Array.isArray(a.productos) && a.productos.length > 0 ? a.productos[0].nombre?.toLowerCase() : '';
        bValue = Array.isArray(b.productos) && b.productos.length > 0 ? b.productos[0].nombre?.toLowerCase() : '';
      } else if (sortBy === 'usuario_email') {
        const userA = usuarios.find(u => (u.uid || u.id) === a.uid);
        const userB = usuarios.find(u => (u.uid || u.id) === b.uid);
        aValue = (userA?.email || '').toLowerCase();
        bValue = (userB?.email || '').toLowerCase();
      }
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const filteredCompras = compras.filter(c => {
    const productos = c.productos || [];
    const productosStr = productos.map(p => p.nombre).join(' ').toLowerCase();
    const usuario = usuarios.find(u => (u.uid || u.id) === c.uid);
    return (
      (c.metodo_pago?.tipo || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.metodo_pago?.datos?.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.fecha || '').toLowerCase().includes(search.toLowerCase()) ||
      productosStr.includes(search.toLowerCase()) ||
      (c.total ? c.total.toString().includes(search) : false) ||
      (usuario?.email?.toLowerCase().includes(search.toLowerCase()) || false)
    );
  });

  const sortedCompras = getSortedCompras();

  return (
    error ? (
      <div className="flex min-h-screen justify-center items-center w-full">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-6 rounded-xl shadow flex flex-col items-center max-w-md animate-fade-in">
          <FaExclamationTriangle className="text-4xl text-red-400 mb-2" />
          <p className="text-xl font-semibold mb-1">Error al obtener compras</p>
          <span className="text-sm text-red-500 mb-4">{error}</span>
          <button
            onClick={fetchCompras}
            className="px-6 py-2 rounded-lg bg-red-500 text-white font-semibold shadow hover:bg-red-600 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    ) : (
      <div className="max-w-7xl mx-auto py-6 px-1 sm:px-2 md:px-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-2 sm:gap-4">
          <h2 className="text-3xl font-bold flex items-center gap-2 text-grey-800 dark:text-purple-300 mb-0">
            Gestión de Compras
          </h2>
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="Buscar compras..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto rounded-2xl shadow border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <table className="min-w-full text-xs sm:text-sm divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {columns.map(col => (
                    <th
                      key={col.key}
                      className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase cursor-pointer select-none hover:text-purple-600 transition"
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label} {sortBy === col.key ? getSortIcon(sortOrder) : getSortIcon('')}
                    </th>
                  ))}
                  <th className="px-2 py-2 sm:px-4 sm:py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                {sortedCompras.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="text-center py-8 text-gray-400">No hay compras.</td>
                  </tr>
                ) : (
                  sortedCompras.map(compra => {
                    const usuario = usuarios.find(u => (u.uid || u.id) === compra.uid);
                    return (
                      <tr key={compra.id} className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition cursor-pointer" onClick={e => { if (!e.target.closest('.acciones-btn')) { setCompraDetalle({ compra, usuario }); setShowNuevoDetalle(true); } }}>
                        <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap">{
                          compra.fecha ? (() => {
                            const fechaObj = new Date(compra.fecha);
                            const fechaStr = fechaObj.toLocaleDateString('es-ES');
                            const horaStr = fechaObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                            return `${fechaStr}, ${horaStr}`;
                          })() : '-'
                        }</td>
                        <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap">{compra.total ? compra.total + '€' : '-'}</td>
                        <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap capitalize">{compra.metodo_pago?.tipo || '-'}</td>
                        <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap">
                          {Array.isArray(compra.productos) && compra.productos.length > 0 ? (
                            <span className="text-xs text-gray-700 dark:text-gray-200">
                              {compra.productos.map(p => p.nombre).join(', ')}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap">{usuario ? usuario.email : <span className="text-gray-400 italic">Desconocido</span>}</td>
                        <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap flex gap-2 justify-center acciones-btn">
                          <button
                            className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700 transition"
                            title="Ver detalle"
                            onClick={e => { e.stopPropagation(); setCompraDetalle({ compra, usuario }); setShowNuevoDetalle(true); }}
                          >
                            <FaEye />
                          </button>
                          <button
                            className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition"
                            title="Eliminar compra"
                            onClick={() => { setCompraToDelete(compra); setShowDelete(true); }}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* Modal detalle */}
        <AdminCompraDetalleNuevoModal
          isOpen={showNuevoDetalle}
          onClose={() => setShowNuevoDetalle(false)}
          compra={compraDetalle?.compra}
          usuario={compraDetalle?.usuario}
        />
        {/* Modal eliminar */}
        <AdminDeleteModal
          isOpen={showDelete}
          onClose={() => setShowDelete(false)}
          onConfirm={handleDelete}
          title="¿Eliminar compra?"
          message="¿Estás seguro de que quieres eliminar esta compra? Esta acción no se puede deshacer."
          itemName={compraToDelete ? (compraToDelete.fecha ? new Date(compraToDelete.fecha).toLocaleString('es-ES') : compraToDelete.id) : ''}
        />
      </div>
    )
  );
};

export default CompraManagement; 