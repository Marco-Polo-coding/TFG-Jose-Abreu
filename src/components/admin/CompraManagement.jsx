import React, { useEffect, useState } from 'react';
import { FaEye, FaTrash, FaSearch, FaShoppingCart } from 'react-icons/fa';
import CompraDetalleModal from '../CompraDetalleModal';
import AdminDeleteModal from './AdminDeleteModal';
import LoadingSpinner from '../LoadingSpinner';

const CompraManagement = () => {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCompra, setSelectedCompra] = useState(null);
  const [showDetalle, setShowDetalle] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [compraToDelete, setCompraToDelete] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCompras();
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

  const filteredCompras = compras.filter(c => {
    const productos = c.productos || [];
    const productosStr = productos.map(p => p.nombre).join(' ').toLowerCase();
    return (
      (c.metodo_pago?.tipo || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.metodo_pago?.datos?.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.fecha || '').toLowerCase().includes(search.toLowerCase()) ||
      productosStr.includes(search.toLowerCase())
    );
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-2 md:px-8 animate-fade-in">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2 text-purple-700 dark:text-purple-300">
        <FaShoppingCart className="inline mb-1" /> Gestión de Compras
      </h2>
      <div className="mb-4 flex items-center gap-2">
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="Buscar por producto, email o método..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl shadow mb-4">
          {error}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl shadow border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Método</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Productos</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
              {filteredCompras.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">No hay compras.</td>
                </tr>
              ) : (
                filteredCompras.map(compra => (
                  <tr key={compra.id} className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition">
                    <td className="px-4 py-3 whitespace-nowrap">{compra.fecha ? new Date(compra.fecha).toLocaleString('es-ES') : '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{compra.total ? compra.total + '€' : '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap capitalize">{compra.metodo_pago?.tipo || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {Array.isArray(compra.productos) && compra.productos.length > 0 ? (
                        <span className="text-xs text-gray-700 dark:text-gray-200">
                          {compra.productos.map(p => p.nombre).join(', ')}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap flex gap-2 justify-center">
                      <button
                        className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700"
                        title="Ver detalle"
                        onClick={() => { setSelectedCompra(compra); setShowDetalle(true); }}
                      >
                        <FaEye />
                      </button>
                      <button
                        className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600"
                        title="Eliminar compra"
                        onClick={() => { setCompraToDelete(compra); setShowDelete(true); }}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Modal detalle */}
      <CompraDetalleModal
        isOpen={showDetalle}
        onClose={() => setShowDetalle(false)}
        compra={selectedCompra}
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
  );
};

export default CompraManagement; 