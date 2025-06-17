import React, { useEffect, useState } from "react";
import { FaHeart, FaBookmark, FaHome, FaShoppingCart, FaArrowRight, FaBoxOpen, FaSearch, FaSortAlphaDown, FaFilter, FaSpinner, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import CartButton from './CartButton';
import UserButton from './UserButton';
import LoadingSpinner from './LoadingSpinner';
import { apiManager } from '../utils/apiManager';
import { authManager } from '../utils/authManager';
import Toast from './Toast';
import useCartStore from '../store/cartStore';
import AuthModal from './AuthModal';

const TiendaPage = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState("az"); // az, za
  const [category, setCategory] = useState("");
  const [priceOrder, setPriceOrder] = useState(""); // asc, desc
  const [estado, setEstado] = useState(""); // nuevo, usado, etc.
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');  const [imageIndexes, setImageIndexes] = useState({}); // { [productoId]: index }
  const [showAuthModal, setShowAuthModal] = useState(false);  const [authMode, setAuthMode] = useState('login');
  const [favoriteProducts, setFavoriteProducts] = useState([]);

  const addItem = useCartStore((state) => state.addItem);
  const isInCart = useCartStore((state) => state.isInCart);
  const cartItems = useCartStore((state) => state.items);

  // Función para manejar el click en "Subir producto" con autenticación
  const handleUploadProductClick = (e) => {
    e.preventDefault();
    const user = authManager.getUser();
    if (!user || !authManager.isAuthenticated()) {
      setToastMessage('Debes iniciar sesión para subir productos');
      setToastType('error');
      setShowToast(true);
      return;
    }
    window.location.href = '/upload_product';
  };
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await apiManager.getProducts();        setProductos(data);
        setLoading(false);
      } catch (error) {
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
    
    fetchProducts();
    fetchFavoriteProducts();
  }, []);// Obtener categorías completas (todas las posibles)
  const categoriasCompletas = [
    { value: 'juego', label: 'Juego' },
    { value: 'consola', label: 'Consola' },
    { value: 'accesorio', label: 'Accesorio' },
    { value: 'merchandising', label: 'Merchandising' },
    { value: 'otros', label: 'Otros' }
  ];
  // Filtrado
  let productosFiltrados = productos
    .filter(p => {
      const texto = (p.nombre || '').toLowerCase();
      return texto.includes(search.toLowerCase());
    })
    .filter(p => (category ? p.categoria === category : true))
    .filter(p => (estado ? p.estado === estado : true));
  // Ordenado
  if (priceOrder === "asc") {
    productosFiltrados = productosFiltrados.sort((a, b) => a.precio - b.precio);
  } else if (priceOrder === "desc") {
    productosFiltrados = productosFiltrados.sort((a, b) => b.precio - a.precio);
  } else if (order === "az") {
    productosFiltrados = productosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } else if (order === "za") {
    productosFiltrados = productosFiltrados.sort((a, b) => b.nombre.localeCompare(a.nombre));
  }

  // Reset filtros
  const resetFiltros = () => {
    setSearch("");
    setOrder("az");
    setCategory("");
    setPriceOrder("");
    setEstado("");
  };

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };  const handleSaveProduct = async (productoId) => {
    const user = authManager.getUser();
    const userEmail = user?.email;
    const uid = user?.uid;
    
    if (!userEmail && !uid) {
      showNotification('Debes iniciar sesión para guardar productos en favoritos', 'error');
      return;
    }
    
    try {
      setIsSaving(prev => ({ ...prev, [productoId]: true }));
      
      // Verificar si ya está en favoritos
      const isFavorite = favoriteProducts.some(product => product.id === productoId);
      
      if (isFavorite) {
        // Eliminar de favoritos
        await apiManager.removeFavoriteProduct(userEmail, productoId);
        setFavoriteProducts(prev => prev.filter(product => product.id !== productoId));
        showNotification('Producto eliminado de favoritos', 'success');
      } else {
        // Añadir a favoritos
        await apiManager.addFavoriteProduct(userEmail, productoId);
        const product = productos.find(p => p.id === productoId);
        setFavoriteProducts(prev => [...prev, product]);
        showNotification('Producto guardado en favoritos', 'success');
      }
    } catch (error) {
      if (error.response?.status === 400) {
        showNotification('Este producto ya está en tus favoritos', 'warning');
      } else {
        showNotification('Error al guardar el producto', 'error');
      }
    } finally {
      setIsSaving(prev => ({ ...prev, [productoId]: false }));
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
  };  const handleAddToCart = (producto) => {
    const user = authManager.getUser();
    const userEmail = user?.email;
    const uid = user?.uid;
    
    if (!userEmail && !uid) {
      setToastMessage('Debes iniciar sesión para añadir productos al carrito');
      setToastType('error');
      setShowToast(true);
      return;
    }
    
    // Verificar si el usuario es el vendedor del producto
    if (producto.usuario_email === userEmail) {
      setToastMessage('No puedes comprar tus propios productos');
      setToastType('error');
      setShowToast(true);
      return;
    }
    
    // Verificar stock antes de añadir
    if (producto.stock === 0) {
      setToastMessage('Este producto está agotado');
      setToastType('error');
      setShowToast(true);
      return;
    }
    
    try {
      addItem(producto);
      setToastMessage('Producto añadido al carrito');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      setToastMessage(error.message);
      setToastType('error');
      setShowToast(true);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-4 right-4 z-50 flex items-center gap-8">
        <CartButton onOpenLoginModal={() => { setAuthMode('login'); setShowAuthModal(true); }} />
        <UserButton />
      </div>      {/* Botón flotante para subir producto */}
      <a
        href="/upload_product"
        onClick={handleUploadProductClick}
        className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 group overflow-hidden px-6 py-4 hover:scale-105 hover:shadow-xl"
        title="Subir nuevo producto"
        style={{ boxShadow: '0 4px 24px 0 rgba(80,0,180,0.25)' }}
      >
        <span className="flex items-center justify-center w-8 h-8 text-2xl font-bold transition-all duration-300 group-hover:mr-2">
          <FaBoxOpen />
        </span>
        <span className="whitespace-nowrap opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-xs group-hover:pl-2 transition-all duration-300 text-base font-semibold">
          Subir un nuevo producto
        </span>
      </a>
      
      {/* Hero Section */}
      <section className="relative h-[40vh] bg-gradient-to-r from-purple-900 to-indigo-900 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
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
              <span className="text-white/50">Tienda</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-xl">
              Tienda de Segunda Mano
            </h1>
            <p className="text-xl md:text-2xl font-medium text-gray-200 drop-shadow">
              Descubre juegos clásicos a precios increíbles
            </p>
          </div>
        </div>
      </section>

      {/* Barra de búsqueda y filtros */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex flex-col md:flex-row md:items-end gap-4 md:gap-8 bg-white/80 rounded-2xl shadow p-6 border border-white/60">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><FaSearch /> Buscar por nombre</label>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><FaSortAlphaDown /> Orden alfabético</label>
              <select
                value={order}
                onChange={e => { setOrder(e.target.value); setPriceOrder(""); }}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white"
              >
                <option value="az">A-Z</option>
                <option value="za">Z-A</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><FaFilter /> Categoría</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white"              >
                <option value="">Todas</option>
                {categoriasCompletas.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><FaShoppingCart /> Precio</label>
              <select
                value={priceOrder}
                onChange={e => { setPriceOrder(e.target.value); setOrder(""); }}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white"
              >
                <option value="">Sin ordenar</option>
                <option value="asc">Menor precio</option>
                <option value="desc">Mayor precio</option>
              </select>
            </div>            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><FaFilter /> Estado</label>
              <select
                value={estado}
                onChange={e => setEstado(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white"
              >
                <option value="">Todos</option>
                <option value="nuevo">Nuevo</option>
                <option value="como_nuevo">Como nuevo</option>
                <option value="bueno">Bueno</option>
                <option value="aceptable">Aceptable</option>
              </select>
            </div>
            <div className="flex flex-col gap-2 justify-end">
              <button
                onClick={resetFiltros}
                className="mt-6 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold shadow hover:scale-105 transition-all duration-300"
              >
                Resetear filtros
              </button>
            </div>
          </div>
          {productosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🎮</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                No hay productos disponibles
              </h2>
              <p className="text-gray-600">
                Por ahora no tenemos productos en la tienda. ¡Vuelve pronto!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {productosFiltrados.map((producto) => {
                const imagenes = producto.imagenes && producto.imagenes.length > 0 ? producto.imagenes : ['https://cataas.com/cat'];
                const currentIndex = imageIndexes[producto.id] || 0;
                return (                  <div
                    key={producto.id}
                    className="bg-gradient-to-br from-white via-purple-50 to-indigo-100 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-white/60 flex flex-col"
                  >
                    <div className="relative h-48 bg-gray-200 group flex items-center justify-center">
                      <img
                        src={imagenes[currentIndex]}
                        alt={producto.nombre}
                        className="w-full h-full object-cover"
                      />
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
                      )}                      <div className={`absolute top-4 right-4 flex gap-2 transition-opacity duration-300 ${
                        favoriteProducts.some(product => product.id === producto.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        {(() => {
                          const user = authManager.getUser();
                          const userEmail = user?.email;
                          const isOwnProduct = producto.usuario_email === userEmail;
                          const isFavorite = favoriteProducts.some(product => product.id === producto.id);
                          
                          return (
                            <button
                              onClick={() => handleSaveProduct(producto.id)}
                              disabled={isSaving[producto.id] || isOwnProduct}
                              className={`p-3 rounded-full transition-colors hover:scale-110 shadow disabled:opacity-50 disabled:cursor-not-allowed ${
                                isOwnProduct 
                                  ? 'bg-white/90 text-gray-400 cursor-not-allowed' 
                                  : isFavorite
                                  ? 'bg-white/90 text-red-500 hover:text-red-600'
                                  : 'bg-white/90 text-gray-500 hover:text-red-500'
                              }`}
                              title={
                                isOwnProduct 
                                  ? "No puedes guardar tu propio producto" 
                                  : isFavorite 
                                  ? "Eliminar de favoritos"
                                  : "Guardar en favoritos"
                              }
                            >
                              {isSaving[producto.id] ? (
                                <FaSpinner className="w-5 h-5 animate-spin" />
                              ) : (
                                <FaHeart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                              )}
                            </button>
                          );
                        })()}
                      </div></div>
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold mb-2 text-gray-900 truncate" title={producto.nombre}>{producto.nombre}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">{producto.categoria || 'Sin categoría'}</span>
                      </div>
                      <p className="text-gray-600 mb-4 line-clamp-2 flex-grow">
                        {producto.descripcion}
                      </p>                      <div className="flex items-center justify-between mb-4">
                        <p className="text-2xl font-extrabold text-purple-700">
                          {producto.precio}€
                        </p>
                      </div>
                      
                      {/* Indicadores de stock */}
                      <div className="mb-4 min-h-[20px]">
                        {producto.stock !== undefined && (
                          <>
                            {producto.stock === 0 ? (
                              <span className="text-red-600 font-bold text-sm">
                                Agotado
                              </span>
                            ) : producto.stock < 3 ? (
                              <span className="text-orange-500 font-semibold text-sm animate-bounce">
                                ¡Queda poco stock!
                              </span>
                            ) : null}
                          </>
                        )}
                      </div>
                      
                      {/* Botones fijos en la parte inferior */}
                      <div className="flex gap-4 mt-auto">
                        <a
                          href={`/producto/${producto.id}`}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center py-3 rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 font-semibold shadow"
                        >
                          Ver más <FaArrowRight className="w-4 h-4" />
                        </a>                        {(() => {
                          const user = authManager.getUser();
                          const userEmail = user?.email;
                          const isOwnProduct = producto.usuario_email === userEmail;
                          const inCart = isInCart(producto.id);
                          
                          return (
                            <button
                              onClick={() => handleAddToCart(producto)}
                              disabled={producto.stock === 0 || isOwnProduct || inCart}
                              className={`p-3 rounded-full transition-all duration-300 hover:scale-110 shadow ${
                                producto.stock === 0 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                  : isOwnProduct
                                  ? 'bg-blue-100 text-blue-400 cursor-not-allowed'
                                  : inCart
                                  ? 'bg-green-100 text-green-500 cursor-not-allowed'
                                  : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                              }`}
                              title={
                                producto.stock === 0 
                                  ? 'Producto agotado' 
                                  : isOwnProduct 
                                  ? 'No puedes comprar tu propio producto'
                                  : inCart
                                  ? 'Ya está en tu carrito'
                                  : 'Añadir al carrito'
                              }
                            >
                              <FaShoppingCart className="w-5 h-5" />
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
    </div>
  );
};

export default TiendaPage; 