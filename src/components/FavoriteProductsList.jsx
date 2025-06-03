import React, { useState, useEffect } from 'react';
import { FaArrowRight, FaHeart, FaTrash, FaSpinner, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import useLoadingState from '../hooks/useLoadingState';
import Toast from './Toast';
import { apiManager } from '../utils/apiManager';

// Datos de ejemplo (reemplazar por fetch a la API en el futuro)
const favoriteProducts = [];
// Ejemplo de estructura:
// const favoriteProducts = [
//   { id: 1, nombre: 'Producto', precio: 25, imagen: '/ruta.jpg', descripcion: 'Resumen...' },
// ];

const FavoriteProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useLoadingState();
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [imageIndexes, setImageIndexes] = useState({}); // { [productoId]: index }

  useEffect(() => {
    fetchFavoriteProducts();
  }, []);

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const fetchFavoriteProducts = async () => {
    try {
      setLoading(true);
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setError('No se ha encontrado el email del usuario. Por favor, inicia sesión.');
        return;
      }
      const data = await apiManager.get(`/usuarios/email/${userEmail}/productos-favoritos`);
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los productos favoritos. Por favor, intenta de nuevo.');
      console.error('Error fetching favorite products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (productoId) => {
    try {
      setIsDeleting(prev => ({ ...prev, [productoId]: true }));
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        showNotification('No se ha encontrado el email del usuario', 'error');
        return;
      }

      await apiManager.delete(`/usuarios/${userEmail}/productos-favoritos/${productoId}`);
      setProducts(prev => prev.filter(p => p.id !== productoId));
      showNotification('Producto eliminado de favoritos', 'success');
    } catch (error) {
      showNotification('Error al eliminar el producto de favoritos', 'error');
    } finally {
      setIsDeleting(prev => ({ ...prev, [productoId]: false }));
    }
  };

  // Funciones para el slider
  const handlePrevImage = (productoId, total) => {
    setImageIndexes(prev => ({
      ...prev,
      [productoId]: prev[productoId] > 0 ? prev[productoId] - 1 : total - 1
    }));
  };
  const handleNextImage = (productoId, total) => {
    setImageIndexes(prev => ({
      ...prev,
      [productoId]: prev[productoId] < total - 1 ? prev[productoId] + 1 : 0
    }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!products.length) {
    return (
      <div className="text-center py-16">
        <div className="flex justify-center mb-6">
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-full shadow-lg text-4xl">
            <FaHeart />
          </span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No tienes productos favoritos</h2>
        <p className="text-gray-600 mb-6">Cuando marques productos como favoritos, aparecerán aquí para que los encuentres fácilmente.</p>
        <a href="/tienda" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow hover:scale-105 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300">
          Ir a la tienda <FaArrowRight className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((producto) => {
        const imagenes = producto.imagenes && producto.imagenes.length > 0 ? producto.imagenes : ['https://cataas.com/cat'];
        const currentIndex = imageIndexes[producto.id] || 0;
        return (
          <div key={producto.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="relative h-48 bg-gray-200 flex items-center justify-center">
              <img src={imagenes[currentIndex]} alt={producto.nombre} className="w-full h-full object-cover" />
              {imagenes.length > 1 && (
                <>
                  <button
                    onClick={() => handlePrevImage(producto.id, imagenes.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full hover:bg-white transition-colors z-10"
                  >
                    <FaChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={() => handleNextImage(producto.id, imagenes.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full hover:bg-white transition-colors z-10"
                  >
                    <FaChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {imagenes.map((_, idx) => (
                      <span key={idx} className={`w-2 h-2 rounded-full ${currentIndex === idx ? 'bg-purple-600' : 'bg-gray-300'} inline-block`}></span>
                    ))}
                  </div>
                </>
              )}
              <button
                onClick={() => handleRemoveFavorite(producto.id)}
                disabled={isDeleting[producto.id]}
                className="absolute top-4 right-4 bg-white/90 p-3 rounded-full text-gray-500 hover:text-red-500 transition-colors hover:scale-110 shadow disabled:opacity-50 disabled:cursor-not-allowed"
                title="Eliminar de favoritos"
              >
                {isDeleting[producto.id] ? (
                  <FaSpinner className="w-5 h-5 animate-spin" />
                ) : (
                  <FaTrash className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{producto.nombre}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{producto.descripcion}</p>
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl font-bold text-purple-600">{producto.precio}€</div>
              </div>
              <a href={`/producto/${producto.id}`} className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center py-3 rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 font-semibold">
                Ver producto <FaArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        );
      })}

      {/* Toast de notificación */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default FavoriteProductsList; 