import React, { useEffect, useState } from "react";
import { FaHeart, FaShoppingCart, FaBookmark, FaArrowLeft, FaHome, FaSpinner } from "react-icons/fa";
import LoadingSpinner from './LoadingSpinner';
import CartButton from './CartButton';
import UserButton from './UserButton';
import Toast from './Toast';
import axios from 'axios';
import useCartStore from '../store/cartStore';


const ProductoDetalle = ({ id }) => {
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    fetch("http://localhost:8000/productos")
      .then((res) => res.json())
      .then((data) => {
        const productoEncontrado = data.find(p => p.id === id);
        setProducto(productoEncontrado);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al obtener el producto:", error);
        setLoading(false);
      });
  }, [id]);

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleSaveProduct = async () => {
    try {
      setIsSaving(true);
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        showNotification('Debes iniciar sesión para guardar productos', 'error');
        return;
      }

      await axios.post(`http://localhost:8000/usuarios/${userEmail}/productos-favoritos/${producto.id}`);
      showNotification('Producto guardado correctamente', 'success');
    } catch (error) {
      if (error.response?.status === 400) {
        showNotification('Este producto ya está en tus favoritos', 'warning');
      } else {
        showNotification('Error al guardar el producto', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const addItem = useCartStore((state) => state.addItem);


  if (loading) {
    return <LoadingSpinner />;
  }

  const handleAddToCart = () => {
    if (!producto || !producto.id) {
      showNotification('Error: producto no válido', 'error');
      return;
    }
    addItem(producto);
    showNotification('Producto añadido al carrito', 'success');
  };

  if (!producto) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🎮</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Producto no encontrado
          </h2>
          <p className="text-gray-600 mb-6">
            Lo sentimos, no pudimos encontrar el producto que buscas.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
          >
            <FaHome className="w-5 h-5" />
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-4 right-4 z-50 flex items-center gap-8">
        <CartButton />
        <UserButton />
      </div>
      
      {/* Hero Section */}
      <section className="relative h-[40vh] bg-gradient-to-r from-purple-900 to-indigo-900 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <a
                href="/"
                className="flex items-center gap-2 text-white hover:text-purple-200 transition-colors"
              >
                <FaHome className="w-5 h-5" />
                <span>Inicio</span>
              </a>
              <span className="text-white/50">/</span>
              <a
                href="/tienda"
                className="text-white hover:text-purple-200 transition-colors"
              >
                Tienda
              </a>
              <span className="text-white/50">/</span>
              <span className="text-white/50">{producto.nombre}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-2 drop-shadow-xl truncate" title={producto.nombre}>
              {producto.nombre}
            </h1>
          </div>
        </div>
      </section>

      {/* Detalles del Producto */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Imagen del Producto */}
            <div className="bg-gradient-to-br from-white via-purple-50 to-indigo-100 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-3xl hover:-translate-y-1 group animate-fade-in">
              <img
                src={producto.imagen}
                alt={producto.nombre}
                className="w-full h-[500px] object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* <button 
                  onClick={() => {
                    // Lógica para dar like
                  }}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-full text-white hover:text-red-200 transition-colors hover:scale-110 shadow-lg"
                  title="Me gusta"
                >
                  <FaHeart className="w-6 h-6" />
                </button> */}
                <button 
                  onClick={handleSaveProduct}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-full text-white hover:text-yellow-200 transition-colors hover:scale-110 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Guardar producto"
                >
                  {isSaving ? (
                    <FaSpinner className="w-6 h-6 animate-spin" />
                  ) : (
                    <FaHeart className="w-6 h-6" />
                    )}
                </button>
              </div>
            </div>

            {/* Información del Producto */}
            <div className="bg-white rounded-2xl shadow-2xl p-10 transition-all duration-500 hover:shadow-3xl hover:-translate-y-1 animate-fade-in">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Descripción
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {producto.descripcion}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-3xl font-extrabold text-purple-700 mb-1">
                      {producto.precio}€
                    </h3>
                    <p className="text-gray-500">Precio final</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={handleAddToCart}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 flex items-center gap-2 font-semibold shadow-lg"
                    >
                      <FaShoppingCart className="w-5 h-5" />
                      Añadir al Carrito
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl p-6 mt-4 shadow">
                  <h4 className="font-semibold text-purple-900 mb-2">
                    Información adicional
                  </h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Envío seguro y rápido</li>
                    <li>• Garantía de 30 días</li>
                    <li>• Soporte técnico incluido</li>
                    <li>• Producto en excelente estado</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

export default ProductoDetalle;