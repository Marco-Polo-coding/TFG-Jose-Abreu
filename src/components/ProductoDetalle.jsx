import React, { useEffect, useState } from "react";
import { FaHeart, FaShoppingCart, FaBookmark, FaArrowLeft, FaHome, FaSpinner, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import LoadingSpinner from './LoadingSpinner';
import CartButton from './CartButton';
import UserButton from './UserButton';
import Toast from './Toast';
import useCartStore from '../store/cartStore';
import { apiManager } from '../utils/apiManager';
import { authManager } from '../utils/authManager';

const ProductoDetalle = ({ id }) => {
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');  const [currentImageIndex, setCurrentImageIndex] = useState(0);  const addItem = useCartStore(state => state.addItem);
  const isInCart = useCartStore(state => state.isInCart);
  const cartItems = useCartStore(state => state.items);
  const [addingToCart, setAddingToCart] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  useEffect(() => {
    const fetchProducto = async () => {
      try {        const data = await apiManager.get(`/productos/${id}`);
        setProducto(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchFavoriteProducts = async () => {
      try {
        const user = authManager.getUser();
        const userEmail = user?.email;
        if (!userEmail) return;

        const data = await apiManager.getFavoriteProducts(userEmail);
        setFavoriteProducts(data);
      } catch (error) {
        console.error('Error fetching favorite products:', error);
      }
    };

    fetchProducto();
    fetchFavoriteProducts();
  }, [id]);  const handleSaveProduct = async () => {
    try {
      setIsSaving(true);
      const user = authManager.getUser();
      const userEmail = user?.email;
      
      if (!userEmail) {
        showNotification('Debes iniciar sesión para guardar productos', 'error');
        return;
      }

      // Verificar si ya está en favoritos
      const isFavorite = favoriteProducts.some(product => product.id === producto.id);
      
      if (isFavorite) {
        // No hacer nada si ya está en favoritos
        showNotification('Este producto ya está en tus favoritos', 'info');
        return;
      }
      
      // Añadir a favoritos
      await apiManager.addFavoriteProduct(userEmail, producto.id);
      setFavoriteProducts(prev => [...prev, producto]);
      showNotification('Producto guardado en favoritos', 'success');
    } catch (error) {
      if (error.message && error.message.includes('ya está en favoritos')) {
        showNotification('Este producto ya está en tus favoritos', 'warning');
      } else {
        showNotification('Error al guardar el producto', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };const handleAddToCart = async () => {
    if (!producto) return;
    
    // Verificar si el usuario es el vendedor del producto
    const user = authManager.getUser();
    const userEmail = user?.email;
    
    if (producto.usuario_email === userEmail) {
      showNotification('No puedes comprar tu propio producto', 'error');
      return;
    }
    
    // Verificar stock antes de añadir
    if (producto.stock === 0) {
      showNotification('Este producto está agotado', 'error');
      return;
    }
    
    setAddingToCart(true);
    try {
      addItem(producto);
      showNotification('Producto añadido al carrito', 'success');
    } catch (error) {
      showNotification(error.message || 'Error al añadir al carrito', 'error');
    } finally {
      setAddingToCart(false);
    }
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
            <div className="bg-white rounded-2xl shadow-2xl p-6 transition-all duration-500 hover:shadow-3xl hover:-translate-y-1 animate-fade-in">              <div className="relative aspect-w-4 aspect-h-3 mb-4 group">
                <img
                  src={imagenes[currentImageIndex]}
                  alt={producto.nombre}
                  className="w-full h-full object-cover rounded-xl"
                />                {(() => {
                  // Determinamos si el producto está en favoritos fuera del JSX para mayor claridad
                  const isFavorite = favoriteProducts.some(product => product.id === producto.id);
                  const isOwnProduct = producto.usuario_email === authManager.getUser()?.email;
                    return (                    <button
                      onClick={handleSaveProduct}
                      disabled={isSaving || isOwnProduct || isFavorite}
                      className={`absolute top-4 right-4 w-12 h-12 flex items-center justify-center rounded-full shadow-lg z-20 transition-all duration-300 hover:scale-110 disabled:cursor-not-allowed ${
                        isFavorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      } ${
                        isOwnProduct
                          ? 'bg-gray-400' 
                          : isFavorite
                          ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                      }`}
                      title={
                        isOwnProduct 
                          ? "No puedes guardar tu propio producto" 
                          : isFavorite 
                          ? "Ya está en tus favoritos"
                          : "Guardar en favoritos"
                      }
                      style={{ boxShadow: '0 4px 24px 0 rgba(80,0,180,0.15)' }}
                    >
                      {isSaving ? (
                        <FaSpinner className="w-6 h-6 text-white animate-spin" />
                      ) : (
                        <FaHeart className={`w-6 h-6 transition-colors duration-200 ${
                          isOwnProduct
                            ? 'text-gray-200'
                            : isFavorite
                            ? 'text-white fill-current'
                            : 'text-white group-hover:text-yellow-200'
                        }`} />
                      )}
                    </button>
                  );
                })()}

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

              <div className="border-t border-gray-200 pt-8">                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-3xl font-extrabold text-purple-700 mb-1">
                      {producto.precio}€
                    </h3>
                    <p className="text-gray-500">Precio final</p>
                  </div>
                  <div className="flex items-center gap-4">
                  </div>
                </div>                {/* Indicadores de stock */}
                {producto.stock !== undefined && (
                  <div className="mb-6">
                    {(() => {
                      const user = authManager.getUser();
                      const userEmail = user?.email;
                      const isOwnProduct = producto.usuario_email === userEmail;
                      
                      if (isOwnProduct) {
                        return (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                            <span className="text-blue-600 font-bold text-lg">
                              Tu Producto
                            </span>
                            <p className="text-blue-500 text-sm mt-1">Este es uno de tus productos en venta</p>
                          </div>
                        );
                      }
                      
                      if (producto.stock === 0) {
                        return (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                            <span className="text-red-600 font-bold text-lg">
                              Agotado
                            </span>
                            <p className="text-red-500 text-sm mt-1">Este producto no está disponible</p>
                          </div>
                        );
                      }
                      
                      if (producto.stock < 3) {
                        return (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center animate-bounce">
                            <span className="text-orange-600 font-bold text-lg">
                              ¡Queda poco stock!
                            </span>
                            <p className="text-orange-500 text-sm mt-1">Solo quedan {producto.stock} unidades</p>
                          </div>
                        );
                      }
                      
                      return (
                        <div className="text-center">
                          <p className="text-green-600 font-semibold">
                            ✓ Disponible ({producto.stock} unidades)
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}

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
              </div>              <div className="flex justify-center mt-8">
                {(() => {
                  const user = authManager.getUser();
                  const userEmail = user?.email;
                  const isOwnProduct = producto.usuario_email === userEmail;
                  const inCart = isInCart(producto.id);
                  
                  return (
                    <button
                      onClick={handleAddToCart}
                      disabled={addingToCart || producto.stock === 0 || isOwnProduct || inCart}
                      className={`px-8 py-3 rounded-full transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                        producto.stock === 0 
                          ? 'bg-gray-400 text-white cursor-not-allowed' 
                          : isOwnProduct
                          ? 'bg-blue-400 text-white cursor-not-allowed'
                          : inCart
                          ? 'bg-green-500 text-white cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
                      }`}
                    >
                      {addingToCart ? (
                        <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5" />
                      ) : (
                        <FaShoppingCart className="mr-2 h-5 w-5" />
                      )}
                      {addingToCart ? 'Añadiendo...' : 
                       producto.stock === 0 ? 'Producto agotado' :
                       isOwnProduct ? 'Tu producto' :
                       inCart ? 'Ya en carrito' : 'Añadir al carrito'}
                    </button>
                  );
                })()}
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