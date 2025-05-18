import React, { useEffect, useState } from "react";
import { FaHeart, FaBookmark, FaHome, FaShoppingCart, FaArrowRight, FaBoxOpen, FaSearch, FaSortAlphaDown, FaFilter, FaSpinner } from "react-icons/fa";
import CartButton from './CartButton';
import UserButton from './UserButton';
import LoadingSpinner from './LoadingSpinner';
import axios from 'axios';
import Toast from './Toast';

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
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    fetch("http://localhost:8000/productos")
      .then((res) => res.json())
      .then((data) => {
        setProductos(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al obtener productos:", error);
        setLoading(false);
      });
  }, []);

  // Obtener categorías únicas
  const categoriasSet = new Set(productos.map(p => p.categoria || 'Sin categoría'));
  const categoriasUnicas = Array.from(categoriasSet);

  // Filtrado
  let productosFiltrados = productos
    .filter(p => {
      const texto = (p.nombre).toLowerCase();
      return texto.includes(search.toLowerCase());
    })
    .filter(p => (category ? (category === 'Sin categoría' ? !p.categoria : p.categoria === category) : true))
    .filter(p => (estado ? p.estado === estado : true));

  // Ordenado
  if (order === "az") {
    productosFiltrados = productosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } else if (order === "za") {
    productosFiltrados = productosFiltrados.sort((a, b) => b.nombre.localeCompare(a.nombre));
  } else if (priceOrder === "asc") {
    productosFiltrados = productosFiltrados.sort((a, b) => a.precio - b.precio);
  } else if (priceOrder === "desc") {
    productosFiltrados = productosFiltrados.sort((a, b) => b.precio - a.precio);
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
  };

  const handleSaveProduct = async (productoId) => {
    try {
      setIsSaving(prev => ({ ...prev, [productoId]: true }));
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        showNotification('Debes iniciar sesión para guardar productos', 'error');
        return;
      }

      await axios.post(`http://localhost:8000/usuarios/${userEmail}/productos-favoritos/${productoId}`);
      showNotification('Producto guardado correctamente', 'success');
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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-4 right-4 z-50 flex items-center gap-8">
        <CartButton />
        <UserButton />
      </div>
      {/* Botón flotante para subir producto */}
      <a
        href="/upload_product"
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
                className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white"
              >
                <option value="">Todas</option>
                {categoriasUnicas.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
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
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><FaFilter /> Estado</label>
              <select
                value={estado}
                onChange={e => setEstado(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white"
              >
                <option value="">Todos</option>
                <option value="nuevo">Nuevo</option>
                <option value="como nuevo">Como nuevo</option>
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
              {productosFiltrados.map((producto) => (
                <div
                  key={producto.id}
                  className="bg-gradient-to-br from-white via-purple-50 to-indigo-100 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-white/60"
                >
                  <div className="relative h-48 bg-gray-200 group">
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => handleSaveProduct(producto.id)}
                        disabled={isSaving[producto.id]}
                        className="bg-white/90 p-3 rounded-full text-gray-500 hover:text-red-500 transition-colors hover:scale-110 shadow disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Guardar producto"
                      >
                        {isSaving[producto.id] ? (
                          <FaSpinner className="w-5 h-5 animate-spin" />
                        ) : (
                          <FaHeart className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-900 truncate" title={producto.nombre}>{producto.nombre}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">{producto.categoria || 'Sin categoría'}</span>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {producto.descripcion}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-2xl font-extrabold text-purple-700">
                        {producto.precio}€
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <a
                        href={`/producto/${producto.id}`}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center py-3 rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 font-semibold shadow"
                      >
                        Ver más <FaArrowRight className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => {
                          // Lógica para añadir al carrito
                        }}
                        className="bg-purple-100 text-purple-600 p-3 rounded-full hover:bg-purple-200 transition-all duration-300 hover:scale-110 shadow"
                        title="Añadir al carrito"
                      >
                        <FaShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
    </div>
  );
};

export default TiendaPage; 