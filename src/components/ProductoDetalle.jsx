import React, { useEffect, useState } from "react";
import { FaHeart, FaShoppingCart, FaBookmark, FaArrowLeft, FaHome, FaSpinner, FaChevronLeft, FaChevronRight } from "react-icons/fa";
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const addItem = useCartStore(state => state.addItem);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const response = await fetch(`http://localhost:8000/productos/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProducto(data);
        } else {
          throw new Error('Error al cargar el producto');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducto();
  }, [id]);

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

  const handleAddToCart = () => {
    if (addingToCart) return;
    const userEmail = localStorage.getItem('userEmail');
    const uid = localStorage.getItem('uid');
    if (!userEmail && !uid) {
      showNotification('Debes iniciar sesión para añadir productos al carrito', 'error');
      return;
    }
    setAddingToCart(true);
    setTimeout(() => {
      const cartItems = useCartStore.getState().items;
      if (cartItems.some(item => item.id === producto.id)) {
        showNotification('El producto ya está en el carrito', 'warning');
        setAddingToCart(false);
        return;
      }
      try {
        addItem(producto);
        showNotification('Producto añadido al carrito', 'success');
      } catch (e) {
        showNotification('Error al añadir al carrito', 'error');
      }
      setAddingToCart(false);
    }, 1200);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === producto.imagenes.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? producto.imagenes.length - 1 : prev - 1
    );
  };

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

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

  const imagenes = Array.isArray(producto.imagenes) && producto.imagenes.length > 0
    ? producto.imagenes
    : (producto.imagen ? [producto.imagen] : ['https://cataas.com/cat']);

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
            <div className="flex items-center gap-4 text-purple-200">
              <a 
                href={`/user/${producto.usuario_email}`}
                className="hover:text-white transition-colors"
              >
                Vendido por {producto.usuario_nombre || producto.usuario_email}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Detalles del Producto */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Galería de Imágenes */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 transition-all duration-500 hover:shadow-3xl hover:-translate-y-1 animate-fade-in">
              <div className="relative aspect-w-4 aspect-h-3 mb-4">
                <img
                  src={imagenes[currentImageIndex]}
                  alt={producto.nombre}
                  className="w-full h-full object-cover rounded-xl"
                />
                <button
                  onClick={handleSaveProduct}
                  disabled={isSaving}
                  className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg z-20 transition-colors hover:scale-110 text-white disabled:opacity-50 disabled:cursor-not-allowed group"
                  title="Guardar producto"
                  style={{ boxShadow: '0 4px 24px 0 rgba(80,0,180,0.15)' }}
                >
                  {isSaving ? (
                    <FaSpinner className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <FaHeart className="w-6 h-6 text-white transition-colors duration-200 group-hover:text-yellow-200" />
                  )}
                </button>

                {imagenes.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
                    >
                      <FaChevronLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
                    >
                      <FaChevronRight className="w-6 h-6 text-gray-700" />
                    </button>
                  </>
                )}
              </div>
              {imagenes.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {imagenes.map((imagen, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-w-1 aspect-h-1 rounded-lg overflow-hidden ${
                        currentImageIndex === index ? 'ring-2 ring-purple-500' : ''
                      }`}
                    >
                      <img
                        src={imagen}
                        alt={`${producto.nombre} - Imagen ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
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
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingToCart ? (
                    <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  ) : (
                    <FaShoppingCart className="mr-2 h-5 w-5" />
                  )}
                  {addingToCart ? 'Añadiendo...' : 'Añadir al carrito'}
                </button>
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