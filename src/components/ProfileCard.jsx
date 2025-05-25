import React, { useEffect } from 'react';
import { FaBook, FaShoppingBag, FaChartLine, FaPlus, FaArrowRight, FaHistory } from 'react-icons/fa';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';
import useLoadingState from '../hooks/useLoadingState';
import CompraDetalleModal from './CompraDetalleModal';

function getInitials(email) {
  if (!email) return '';
  return email.charAt(0).toUpperCase();
}

function getRandomColor(email) {
  const colors = [
    'from-purple-500 to-indigo-500',
    'from-pink-500 to-purple-500',
    'from-blue-500 to-teal-500',
    'from-green-500 to-teal-500',
    'from-yellow-500 to-orange-500',
    'from-red-500 to-pink-500',
  ];
  const index = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

const ProfileCard = () => {
  const [userEmail, setUserEmail] = React.useState('');
  const [userName, setUserName] = React.useState('');
  const [userPhoto, setUserPhoto] = React.useState('');
  const [token, setToken] = React.useState('');
  const [articles, setArticles] = React.useState([]);
  const [loadingArticles, setLoadingArticles] = React.useState(true);
  const [errorArticles, setErrorArticles] = React.useState(null);
  const [ventas, setVentas] = React.useState([]);
  const [loadingVentas, setLoadingVentas] = React.useState(true);
  const [errorVentas, setErrorVentas] = React.useState(null);
  const [loading, setLoading] = useLoadingState();
  const [userBio, setUserBio] = React.useState('');
  const [compras, setCompras] = React.useState([]);
  const [loadingCompras, setLoadingCompras] = React.useState(true);
  const [errorCompras, setErrorCompras] = React.useState(null);
  const [selectedCompra, setSelectedCompra] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const t = localStorage.getItem('token');
      const email = localStorage.getItem('userEmail');
      const name = localStorage.getItem('userName');
      const photo = localStorage.getItem('userPhoto');
      const bio = localStorage.getItem('userBio') || '';
      setToken(t);
      setUserEmail(email);
      setUserName(name);
      setUserPhoto(photo);
      setUserBio(bio);
      if (!t) {
        window.location.href = '/';
      }
      setLoading(false);
    }
    // Escuchar cambios en localStorage
    const handleStorage = (e) => {
      if (e.key === 'userPhoto') {
        setUserPhoto(e.newValue);
      }
      if (e.key === 'userName') {
        setUserName(e.newValue);
      }
      if (e.key === 'userEmail') {
        setUserEmail(e.newValue);
      }
      if (e.key === 'userBio') {
        setUserBio(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  React.useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoadingArticles(true);
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
          setErrorArticles('No se ha encontrado el email del usuario');
          setLoadingArticles(false);
          return;
        }
        const response = await axios.get('http://localhost:8000/articulos');
        const filtered = response.data.filter(a => a.autor_email === userEmail);
        setArticles(filtered);
        setErrorArticles(null);
      } catch (err) {
        setErrorArticles('Error al cargar los artículos.');
      } finally {
        setLoadingArticles(false);
      }
    };
    fetchArticles();
  }, []);

  React.useEffect(() => {
    const fetchVentas = async () => {
      try {
        setLoadingVentas(true);
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
          setErrorVentas('No se ha encontrado el email del usuario');
          setLoadingVentas(false);
          return;
        }
        const response = await axios.get('http://localhost:8000/productos');
        // Filtrar productos donde el usuario es el vendedor (por email)
        const ventasUsuario = response.data.filter(p => p.usuario_email === userEmail);
        setVentas(ventasUsuario);
        setErrorVentas(null);
      } catch (err) {
        setErrorVentas('Error al cargar las ventas.');
      } finally {
        setLoadingVentas(false);
      }
    };
    fetchVentas();
  }, [userEmail]);

  React.useEffect(() => {
    const fetchCompras = async () => {
      try {
        setLoadingCompras(true);
        const uid = localStorage.getItem('uid');
        if (!uid) {
          setErrorCompras('No se ha encontrado el ID del usuario');
          setLoadingCompras(false);
          return;
        }
        const response = await axios.get(`http://localhost:8000/compras?uid=${uid}`);
        setCompras(response.data);
        setErrorCompras(null);
      } catch (err) {
        setErrorCompras('Error al cargar el historial de compras.');
      } finally {
        setLoadingCompras(false);
      }
    };
    fetchCompras();
  }, []);

  // Utilidad para saber si la foto es válida
  const isValidPhoto = userPhoto && !userPhoto.includes('googleusercontent.com') && userPhoto !== '';

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!token) return null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tarjeta principal con efecto glassmorphism */}
      <div className="relative flex flex-col md:flex-row items-center md:items-end justify-center gap-8 mb-16 bg-white/60 dark:bg-gray-800 backdrop-blur-lg rounded-2xl shadow-2xl p-10 border border-white/30 dark:border-gray-700 ring-2 ring-purple-100">
        {/* Avatar con borde animado y gradiente */}
        <div className="flex-shrink-0 flex justify-center w-full md:w-auto">
          <div className={`w-36 h-36 rounded-full flex items-center justify-center text-white text-6xl font-extrabold shadow-xl border-4 border-white dark:border-gray-700 bg-gradient-to-br ${getRandomColor(userEmail)} animate-avatar-glow relative`}>
            {isValidPhoto ? (
              <img
                src={userPhoto}
                alt={userName || userEmail}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              getInitials(userName || userEmail)
            )}
            <span className="absolute -bottom-2 right-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full px-3 py-1 text-xs font-semibold shadow-lg animate-bounce z-10">Tú</span>
          </div>
        </div>
        {/* Info usuario */}
        <div className="text-center md:text-left w-full">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-2 drop-shadow-lg">{userName || userEmail}</h2>
          <p className="text-lg text-gray-500 dark:text-gray-300 mb-2">{userEmail}</p>
          {userBio && (
            <p className="text-base text-gray-700 dark:text-gray-200 mb-2 whitespace-pre-line bg-white/70 dark:bg-gray-900/70 rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-700 shadow-sm max-w-xl mx-auto md:mx-0">
              {userBio}
            </p>
          )}
          <a href="/edit_profile" className="mt-2 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow hover:scale-105 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300">
            <FaPlus className="w-4 h-4" /> Editar perfil
          </a>
        </div>
      </div>

      {/* Secciones de Artículos y Ventas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Artículos publicados */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 border border-white/40 dark:border-gray-700 shadow-lg flex flex-col items-start w-full">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-lg text-2xl">
              <FaBook />
            </span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Artículos publicados</h3>
          </div>
          {loadingArticles ? (
            <div className="flex justify-center items-center w-full py-8">
              <span className="animate-spin text-2xl text-purple-500 mr-2">⏳</span>
              <span className="text-gray-500">Cargando artículos...</span>
            </div>
          ) : errorArticles ? (
            <div className="text-red-600 py-4">{errorArticles}</div>
          ) : articles.length === 0 ? (
            <>
              <p className="text-gray-500 text-base mb-4">No has publicado ningún artículo todavía</p>
              <a href="/post_article" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow hover:scale-105 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300">
                <FaPlus className="w-4 h-4" /> Publicar artículo
              </a>
            </>
          ) : (
            <div className="w-full">
              <div className="grid grid-cols-1 gap-4 w-full">
                {articles.slice(0, 3).map(article => (
                  <div key={article.id} className="flex items-center gap-4 bg-white/80 rounded-xl shadow p-4 border border-white/60 hover:shadow-lg transition-all">
                    <img src={article.imagen && article.imagen !== '/default-article.jpg' ? article.imagen : 'https://cataas.com/cat'} alt={article.titulo} className="w-16 h-16 object-cover rounded-lg border border-purple-100" />
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1 truncate max-w-[180px]">{article.titulo}</h4>
                      <p className="text-xs text-gray-500 mb-1">{new Date(article.fecha_publicacion).toLocaleDateString()}</p>
                    </div>
                    <a href={`/articulo/${article.id}`} className="text-purple-600 hover:text-indigo-700 font-bold text-sm">Ver</a>
                  </div>
                ))}
              </div>
              {articles.length > 3 && (
                <a href="/my_articles" className="mt-4 inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold">
                  Ver todos mis artículos <FaArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>
        {/* Ventas en curso */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 border border-white/40 dark:border-gray-700 shadow-lg flex flex-col items-start w-full">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-lg text-2xl">
              <FaShoppingBag />
            </span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Ventas en curso</h3>
          </div>
          {loadingVentas ? (
            <div className="flex justify-center items-center w-full py-8">
              <span className="animate-spin text-2xl text-purple-500 mr-2">⏳</span>
              <span className="text-gray-500">Cargando ventas...</span>
            </div>
          ) : errorVentas ? (
            <div className="text-red-600 py-4">{errorVentas}</div>
          ) : ventas.length === 0 ? (
            <>
              <p className="text-gray-500 text-base mb-4">No tienes ventas en curso todavía</p>
              <a href="/post_product" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow hover:scale-105 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300">
                <FaPlus className="w-4 h-4" /> Publicar producto
              </a>
            </>
          ) : (
            <div className="w-full">
              <div className="grid grid-cols-1 gap-4 w-full">
                {ventas.slice(0, 3).map(producto => (
                  <div key={producto.id} className="flex items-center gap-4 bg-white/80 rounded-xl shadow p-4 border border-white/60 hover:shadow-lg transition-all">
                    <img src={producto.imagen && producto.imagen !== '/default-product.jpg' ? producto.imagen : 'https://cataas.com/cat'} alt={producto.nombre} className="w-16 h-16 object-cover rounded-lg border border-purple-100" />
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1 truncate max-w-[180px]">{producto.nombre}</h4>
                      <p className="text-xs text-gray-500 mb-1">{new Date(producto.fecha_publicacion).toLocaleDateString()}</p>
                    </div>
                    <a href={`/producto/${producto.id}`} className="text-purple-600 hover:text-indigo-700 font-bold text-sm">Ver</a>
                  </div>
                ))}
              </div>
              {ventas.length > 3 && (
                <a href="/my_products" className="mt-4 inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold">
                  Ver todos mis productos <FaArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Historial de compras */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 border border-white/40 dark:border-gray-700 shadow-lg flex flex-col items-start w-full mb-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-lg text-2xl">
            <FaHistory />
          </span>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Historial de compras</h3>
        </div>
        {loadingCompras ? (
          <div className="flex justify-center items-center w-full py-8">
            <span className="animate-spin text-2xl text-purple-500 mr-2">⏳</span>
            <span className="text-gray-500">Cargando historial de compras...</span>
          </div>
        ) : errorCompras ? (
          <div className="text-red-600 py-4">{errorCompras}</div>
        ) : compras.length === 0 ? (
          <p className="text-gray-500 text-base mb-4">No has realizado ninguna compra todavía</p>
        ) : (
          <div className="w-full">
            <div className="grid grid-cols-1 gap-4 w-full">
              {compras.map(compra => {
                const fechaBonita = compra.fecha ? new Date(compra.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
                let nombreProducto = compra.productos && compra.productos.length > 0 ? compra.productos[0].nombre : '';
                // Truncar el nombre si es muy largo
                const MAX_LEN = 25;
                if (nombreProducto && nombreProducto.length > MAX_LEN) {
                  nombreProducto = nombreProducto.slice(0, MAX_LEN) + '...';
                }
                return (
                  <button
                    key={compra.id}
                    className="w-full text-left bg-white/90 hover:bg-purple-100 transition rounded-xl p-5 border border-white/60 shadow flex flex-col gap-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400"
                    onClick={() => { setSelectedCompra(compra); setModalOpen(true); }}
                  >
                    <div className="font-semibold text-lg text-gray-800 truncate">
                      Compra del {fechaBonita}{nombreProducto ? ` - ${nombreProducto}` : ''}
                    </div>
                    <div className="text-sm text-gray-500">{fechaBonita}</div>
                    <div className="text-base text-gray-700 font-medium">Total: {compra.total}€</div>
                  </button>
                );
              })}
            </div>
            <CompraDetalleModal isOpen={modalOpen} onClose={() => setModalOpen(false)} compra={selectedCompra} />
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-10 border border-white/30 shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-lg text-2xl">
            <FaChartLine />
          </span>
          <h3 className="text-2xl font-bold text-gray-900">Estadísticas</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl p-8 text-center shadow-lg border border-white/40 hover:scale-105 transition-transform duration-300">
            <p className="text-4xl font-extrabold text-purple-700 mb-2">{articles.length}</p>
            <p className="text-base text-gray-600 flex items-center justify-center gap-2"><FaBook className="w-5 h-5" /> Artículos</p>
          </div>
          <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl p-8 text-center shadow-lg border border-white/40 hover:scale-105 transition-transform duration-300">
            <p className="text-4xl font-extrabold text-purple-700 mb-2">{ventas.length}</p>
            <p className="text-base text-gray-600 flex items-center justify-center gap-2"><FaShoppingBag className="w-5 h-5" /> Ventas</p>
          </div>
          <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl p-8 text-center shadow-lg border border-white/40 hover:scale-105 transition-transform duration-300">
            <p className="text-4xl font-extrabold text-purple-700 mb-2">0</p>
            <p className="text-base text-gray-600 flex items-center justify-center gap-2"><FaArrowRight className="w-5 h-5" /> Likes</p>
          </div>
        </div>
      </div>
      {/* Animación avatar (tailwind custom):
      .animate-avatar-glow {
        box-shadow: 0 0 0 0 rgba(139,92,246,0.7);
        animation: avatar-glow 2s infinite alternate;
      }
      @keyframes avatar-glow {
        0% { box-shadow: 0 0 0 0 rgba(139,92,246,0.7); }
        100% { box-shadow: 0 0 40px 10px rgba(139,92,246,0.3); }
      }
      */}
    </div>
  );
};

export default ProfileCard; 