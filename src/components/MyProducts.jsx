import React, { useState, useEffect } from 'react';
import { FaBox, FaEdit, FaTrash, FaPlus, FaSpinner, FaHome } from 'react-icons/fa';
import axios from 'axios';
import PropTypes from 'prop-types';
import CartButton from './CartButton';
import UserButton from './UserButton';
import EditProductModal from './EditProductModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import Notification from './Notification';
import LoadingSpinner from './LoadingSpinner';
import useLoadingState from '../hooks/useLoadingState';

const MyProducts = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useLoadingState();
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [productoToDelete, setProductoToDelete] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [productoToEdit, setProductoToEdit] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setError('No se ha encontrado el email del usuario. Por favor, inicia sesión.');
        setProductos([]);
        return;
      }
      const response = await axios.get(`http://localhost:8000/usuarios/${userEmail}/productos`);
      setProductos(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los productos. Por favor, intenta de nuevo.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!productoToDelete) return;
    try {
      await axios.delete(`http://localhost:8000/productos/${productoToDelete.id}`);
      setProductos(prev => prev.filter(p => p.id !== productoToDelete.id));
      setModalOpen(false);
      setProductoToDelete(null);
      setNotification({
        type: 'success',
        message: 'Producto eliminado correctamente'
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Error al eliminar el producto. Por favor, intenta de nuevo.'
      });
      console.error('Error deleting product:', err);
    }
  };

  const handleEditSave = async (updatedProduct) => {
    setProductos(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    setEditModalOpen(false);
    setProductoToEdit(null);
    setNotification({
      type: 'success',
      message: '¡Producto editado correctamente!'
    });
    setTimeout(() => setNotification(null), 3000);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Botones flotantes de usuario y carrito */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-8">
        <CartButton />
        <UserButton />
      </div>
      {/* Hero Section
      <section className="relative h-[30vh] bg-gradient-to-r from-purple-900 to-indigo-900 flex items-center mb-12 shadow-xl">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
          Breadcrumb
          <div className="flex items-center gap-4 mb-4">
            <a href="/" className="flex items-center gap-2 text-white hover:text-purple-200 transition-colors">
              <FaHome className="w-5 h-5" />
              <span>Inicio</span>
            </a>
            <span className="text-white/50">/</span>
            <span className="text-white/50">Mis Productos</span>
          </div>
          <div className="flex items-center gap-4 text-white">
            <FaBox className="text-5xl md:text-6xl drop-shadow-xl" />
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold mb-2 drop-shadow-xl">Mis Productos</h1>
              <p className="text-lg md:text-xl text-gray-200 drop-shadow">Gestiona tus productos subidos a la tienda</p>
            </div>
          </div>
        </div>
      </section> */}

      <div className="container mx-auto px-4 pb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <FaBox className="text-purple-500" />
            Tus productos
          </h2>
          <a
            href="/upload_product"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg hover:scale-105"
          >
            <FaPlus />
            Nuevo Producto
          </a>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-4xl text-purple-500" />
          </div>
        ) : productos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-xl">
            <FaBox className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No tienes productos subidos aún.</p>
            <a 
              href="/upload_product"
              className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
            >
              ¡Sube tu primer producto!
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {productos.map(producto => (
              <div key={producto.id} className="bg-gradient-to-br from-white via-purple-50 to-indigo-100 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-white/60">
                <div className="aspect-w-16 aspect-h-9 mb-4">
                  <img 
                    src={producto.imagen || 'https://cataas.com/cat'} 
                    alt={producto.nombre}
                    className="object-cover rounded-xl w-full h-48"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 truncate max-w-[180px]">{producto.nombre}</h3>
                <p className="text-gray-600 mb-2 line-clamp-2">{producto.descripcion}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-purple-700 font-extrabold text-lg">{producto.precio}€</span>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar producto"
                    onClick={() => { setProductoToEdit(producto); setEditModalOpen(true); }}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar producto"
                    onClick={() => { setProductoToDelete(producto); setModalOpen(true); }}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmación de borrado */}
      <ConfirmDeleteModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setProductoToDelete(null); }}
        onConfirm={handleDelete}
        articleTitle={productoToDelete?.nombre || ''}
      />

      {/* Modal de edición de producto */}
      <EditProductModal
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setProductoToEdit(null); }}
        onSave={handleEditSave}
        initialData={productoToEdit || {}}
      />

      {/* Notificación */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

MyProducts.propTypes = {
  // No hay props por ahora, pero podemos añadirlas si es necesario
};

export default MyProducts; 