import React, { useEffect, useState } from "react";
import { FaHeart, FaBookmark, FaHome, FaArrowRight, FaPen, FaSearch, FaSortAlphaDown, FaSortAlphaUp, FaCalendarAlt, FaFilter } from "react-icons/fa";
import CartButton from './CartButton';
import UserButton from './UserButton';
import LoadingSpinner from './LoadingSpinner';
import { apiManager } from '../utils/apiManager';
import Toast from './Toast';

const BlogPage = () => {
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState("az"); // az, za
  const [category, setCategory] = useState("");
  const [dateOrder, setDateOrder] = useState("desc"); // desc, asc
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [savedArticles, setSavedArticles] = useState([]);

  useEffect(() => {
    fetchArticles();
    fetchSavedArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const data = await apiManager.getArticles();
      setArticulos(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setLoading(false);
    }
  };

  const fetchSavedArticles = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) return;

      const data = await apiManager.get(`/usuarios/${userEmail}/articulos-guardados`);
      setSavedArticles(data);
    } catch (error) {
      console.error('Error fetching saved articles:', error);
    }
  };

  const handleSaveArticle = async (articleId) => {
    const userEmail = localStorage.getItem('userEmail');
    const uid = localStorage.getItem('uid');
    if (!userEmail && !uid) {
      setToastMessage('Debes iniciar sesión para guardar artículos');
      setToastType('error');
      setShowToast(true);
      return;
    }
    try {
      const isSaved = savedArticles.some(article => article.id === articleId);
      if (isSaved) {
        await apiManager.delete(`/usuarios/${userEmail}/articulos-guardados/${articleId}`);
        setSavedArticles(prev => prev.filter(article => article.id !== articleId));
        setToastMessage('Artículo eliminado de guardados');
        setToastType('success');
        setShowToast(true);
      } else {
        await apiManager.post(`/usuarios/${userEmail}/articulos-guardados/${articleId}`);
        const article = articulos.find(a => a.id === articleId);
        setSavedArticles(prev => [...prev, article]);
        setToastMessage('Artículo guardado correctamente');
        setToastType('success');
        setShowToast(true);
      }
    } catch (error) {
      setToastMessage(error.response?.data?.detail || 'Error al guardar el artículo');
      setToastType('error');
      setShowToast(true);
    }
  };

  // Obtener categorías únicas (incluyendo 'Sin categoría' si aplica)
  const categoriasSet = new Set(articulos.map(a => a.categoria || 'Sin categoría'));
  const categoriasUnicas = Array.from(categoriasSet);

  // Filtrado
  let articulosFiltrados = articulos
    .filter(a => {
      const texto = (a.titulo + " " + a.autor).toLowerCase();
      return texto.includes(search.toLowerCase());
    })
    .filter(a => (category ? (category === 'Sin categoría' ? !a.categoria : a.categoria === category) : true));

  // Ordenado
  if (order === "az") {
    articulosFiltrados = articulosFiltrados.sort((a, b) => a.titulo.localeCompare(b.titulo));
  } else if (order === "za") {
    articulosFiltrados = articulosFiltrados.sort((a, b) => b.titulo.localeCompare(a.titulo));
  } else if (dateOrder === "desc") {
    articulosFiltrados = articulosFiltrados.sort((a, b) => {
      const da = new Date(a.fecha_publicacion);
      const db = new Date(b.fecha_publicacion);
      return db - da;
    });
  } else if (dateOrder === "asc") {
    articulosFiltrados = articulosFiltrados.sort((a, b) => {
      const da = new Date(a.fecha_publicacion);
      const db = new Date(b.fecha_publicacion);
      return da - db;
    });
  }

  // Reset filtros
  const resetFiltros = () => {
    setSearch("");
    setOrder("az");
    setCategory("");
    setDateOrder("desc");
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
      {/* Botón flotante para crear artículo */}
      <a
        href="/post_article"
        className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 group overflow-hidden px-6 py-4 hover:scale-105 hover:shadow-xl"
        title="Crear nuevo artículo"
        style={{ boxShadow: '0 4px 24px 0 rgba(80,0,180,0.25)' }}
      >
        <span className="flex items-center justify-center w-8 h-8 text-2xl font-bold transition-all duration-300 group-hover:mr-2">
          <FaPen />
        </span>
        <span className="whitespace-nowrap opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-xs group-hover:pl-2 transition-all duration-300 text-base font-semibold">
          Publicar un nuevo artículo
        </span>
      </a>
      
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
              <span className="text-white/50">Blog</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-xl">
              Blog de CRPGs
            </h1>
            <p className="text-xl md:text-2xl font-medium text-gray-200 drop-shadow">
              Descubre artículos, reseñas y análisis de juegos clásicos
            </p>
          </div>
        </div>
      </section>

      {/* Artículos Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Barra de búsqueda y filtros */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end gap-4 md:gap-8 bg-white/80 rounded-2xl shadow p-6 border border-white/60">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><FaSearch /> Buscar por título o autor</label>
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
                onChange={e => { setOrder(e.target.value); setDateOrder(""); }}
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
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><FaCalendarAlt /> Fecha</label>
              <select
                value={dateOrder}
                onChange={e => { setDateOrder(e.target.value); setOrder(""); }}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white"
              >
                <option value="desc">Más reciente</option>
                <option value="asc">Más antiguo</option>
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
          {articulosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                No se encontraron artículos con los filtros o búsqueda seleccionados
              </h2>
              <p className="text-gray-600">
                Prueba a cambiar los filtros o a resetearlos para ver más resultados.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {articulosFiltrados.map((articulo) => (
                <div
                  key={articulo.id}
                  className="bg-gradient-to-br from-white via-purple-50 to-indigo-100 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-white/60"
                >
                  <div className="relative h-48 bg-gray-200 group">
                    <img
                      src={articulo.imagen && articulo.imagen.startsWith('http') && articulo.imagen !== '/default-article.jpg' ? articulo.imagen : 'https://cataas.com/cat'}
                      alt={articulo.titulo}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => handleSaveArticle(articulo.id)}
                        className={`bg-white/90 p-3 rounded-full text-gray-500 hover:text-yellow-500 transition-colors hover:scale-110 shadow ${savedArticles.some(a => a.id === articulo.id) ? 'text-yellow-500' : ''}`}
                        title={savedArticles.some(a => a.id === articulo.id) ? "Eliminar de guardados" : "Guardar artículo"}
                      >
                        <FaBookmark className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-900 truncate" title={articulo.titulo}>{articulo.titulo}</h3>
                    <p className="text-gray-600 mb-2 line-clamp-2">{articulo.descripcion}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">{articulo.categoria || 'Sin categoría'}</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-500">
                        Por {articulo.autor} • {new Date(articulo.fecha_publicacion).toLocaleDateString()}
                      </div>
                    </div>
                    <a
                      href={`/articulo/${articulo.id}`}
                      className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center py-3 rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 font-semibold shadow"
                    >
                      Leer más
                    </a>
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

export default BlogPage;