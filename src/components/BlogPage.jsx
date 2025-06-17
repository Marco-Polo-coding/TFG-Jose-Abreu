import React, { useEffect, useState } from "react";
import { FaHeart, FaBookmark, FaHome, FaArrowRight, FaPen, FaSearch, FaSortAlphaDown, FaSortAlphaUp, FaCalendarAlt, FaFilter } from "react-icons/fa";
import CartButton from './CartButton';
import UserButton from './UserButton';
import LoadingSpinner from './LoadingSpinner';
import { apiManager } from '../utils/apiManager';
import { authManager } from '../utils/authManager';
import Toast from './Toast';

const BlogPage = () => {
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState("az"); // az, za
  const [category, setCategory] = useState("");
  const [dateOrder, setDateOrder] = useState("desc"); // desc, asc
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');  const [toastType, setToastType] = useState('success');
  const [savedArticles, setSavedArticles] = useState([]);

  // Función para manejar el click en "Publicar artículo" con autenticación
  const handlePostArticleClick = (e) => {
    e.preventDefault();
    const user = authManager.getUser();
    if (!user || !authManager.isAuthenticated()) {
      setToastMessage('Debes iniciar sesión para publicar artículos');
      setToastType('error');
      setShowToast(true);
      return;
    }
    window.location.href = '/post_article';
  };

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
  };  const fetchSavedArticles = async () => {
    try {
      const user = authManager.getUser();
      const userEmail = user?.email;
      if (!userEmail) return;

      const data = await apiManager.getSavedArticles(userEmail);
      setSavedArticles(data);
    } catch (error) {
      console.error('Error fetching saved articles:', error);
    }
  };  const handleSaveArticle = async (articleId) => {
    const user = authManager.getUser();
    const userEmail = user?.email;
    const uid = user?.uid;
    
    if (!userEmail && !uid) {
      setToastMessage('Debes iniciar sesión para guardar artículos');
      setToastType('error');
      setShowToast(true);
      return;
    }
    
    // Verificar si ya está en guardados
    const isSaved = savedArticles.some(article => article.id === articleId);
    
    if (isSaved) {
      // No hacer nada si ya está guardado
      setToastMessage('Este artículo ya está en tus guardados');
      setToastType('info');
      setShowToast(true);
      return;
    }
    
    try {
      // Añadir a guardados
      await apiManager.addSavedArticle(userEmail, articleId);
      const article = articulos.find(a => a.id === articleId);
      setSavedArticles(prev => [...prev, article]);
      setToastMessage('Artículo guardado correctamente');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      setToastMessage(error.response?.data?.detail || 'Error al guardar el artículo');
      setToastType('error');
      setShowToast(true);
    }
  };
  // Obtener categorías completas (todas las posibles)
  const categoriasCompletas = [
    { value: 'reseña', label: 'Reseña' },
    { value: 'analisis', label: 'Análisis' },
    { value: 'noticia', label: 'Noticia' },
    { value: 'guia', label: 'Guía' },
    { value: 'opinion', label: 'Opinión' }
  ];  // Función para normalizar texto (eliminar acentos, diacríticos y pasar a minúsculas)
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD") // Normalización Unicode
      .replace(/[\u0300-\u036f]/g, "") // Eliminar diacríticos
      .trim();
  };
  
  // Filtrado
  let articulosFiltrados = articulos
    .filter(a => {
      if (!search.trim()) return true; // Devuelve todos los artículos si la búsqueda está vacía
      
      const textoArticulo = normalizeText((a.titulo || '') + " " + (a.autor || '') + " " + (a.contenido || ''));
      const busqueda = normalizeText(search);
      
      return textoArticulo.includes(busqueda);
    })
    .filter(a => (category ? a.categoria === category : true));

  // Ordenado
  if (dateOrder === "desc") {
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
  } else if (order === "az") {
    articulosFiltrados = articulosFiltrados.sort((a, b) => (a.titulo || '').localeCompare(b.titulo || ''));
  } else if (order === "za") {
    articulosFiltrados = articulosFiltrados.sort((a, b) => (b.titulo || '').localeCompare(a.titulo || ''));
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
      </div>      {/* Botón flotante para crear artículo */}
      <a
        href="/post_article"
        onClick={handlePostArticleClick}
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
                className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white"              >
                <option value="">Todas</option>
                {categoriasCompletas.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">              {articulosFiltrados.map((articulo) => (
                <div
                  key={articulo.id}
                  className="bg-gradient-to-br from-white via-purple-50 to-indigo-100 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-white/60 flex flex-col"
                >
                  <div className="relative h-48 bg-gray-200 group">
                    <img
                      src={articulo.imagen && articulo.imagen.startsWith('http') && articulo.imagen !== '/default-article.jpg' ? articulo.imagen : 'https://cataas.com/cat'}
                      alt={articulo.titulo}
                      className="w-full h-full object-cover"
                    />                    <div className={`absolute top-4 right-4 flex gap-2 transition-opacity duration-300 ${
                      savedArticles.some(a => a.id === articulo.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      {(() => {
                        const user = authManager.getUser();
                        const userEmail = user?.email;
                        const isOwnArticle = articulo.autor_email === userEmail;
                        const isSaved = savedArticles.some(a => a.id === articulo.id);
                          return (                          <button
                            onClick={() => handleSaveArticle(articulo.id)}
                            disabled={isOwnArticle || isSaved}
                            className={`p-3 rounded-full transition-colors hover:scale-110 shadow ${
                              isOwnArticle 
                                ? 'bg-white/90 text-gray-400 cursor-not-allowed' 
                                : isSaved
                                ? 'bg-white/90 text-yellow-500'
                                : 'bg-white/90 text-gray-500 hover:text-yellow-500'
                            } disabled:cursor-not-allowed`}
                            title={isOwnArticle ? "No puedes guardar tu propio artículo" : (isSaved ? "Ya está en tus guardados" : "Guardar artículo")}
                          >
                            <FaBookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                          </button>
                        );
                      })()}
                    </div></div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold mb-2 text-gray-900 truncate" title={articulo.titulo}>{articulo.titulo}</h3>
                    <p className="text-gray-600 mb-2 line-clamp-2 flex-grow">{articulo.descripcion}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">{articulo.categoria || 'Sin categoría'}</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-500">
                        Por <a href={`/user/${articulo.autor_email}`} className="hover:text-purple-700 font-semibold">{articulo.autor}</a> • {new Date(articulo.fecha_publicacion).toLocaleDateString()}
                      </div>
                    </div>
                    <a
                      href={`/articulo/${articulo.id}`}
                      className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center py-3 rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 font-semibold shadow mt-auto"
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