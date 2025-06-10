import React, { useEffect } from 'react';
import { FaBook, FaShoppingBag, FaChartLine, FaPlus, FaArrowRight, FaHistory, FaUsers } from 'react-icons/fa';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';
import useLoadingState from '../hooks/useLoadingState';
import CompraDetalleModal from './CompraDetalleModal';
import { apiManager } from '../utils/apiManager';
import { authManager } from '../utils/authManager';

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
  const [user, setUser] = React.useState(authManager.getUser() || {});
  const [token, setToken] = React.useState(authManager.store.getState().token);
  const userEmail = user?.email || '';
  const userName = user?.name || '';
  const userPhoto = user?.photo || '';
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
  const [showAllCompras, setShowAllCompras] = React.useState(false);
  const [followers, setFollowers] = React.useState([]);
  const [following, setFollowing] = React.useState([]);
  const [loadingFollowers, setLoadingFollowers] = React.useState(true);
  const [loadingFollowing, setLoadingFollowing] = React.useState(true);
  const [uid, setUid] = React.useState('');
  const [loadingUnfollow, setLoadingUnfollow] = React.useState(null);
  const [loadingRemoveFollower, setLoadingRemoveFollower] = React.useState(null);
  useEffect(() => {
    // Suscribirse a cambios en el store global de autenticación
    const unsub = authManager.store.subscribe((state) => {
      setUser(state.user || {});
      setToken(state.token);
    });
    setUser(authManager.getUser() || {});
    setToken(authManager.store.getState().token);
    setLoading(false);
    return () => unsub();
  }, []);

  // Actualizar userBio cuando el usuario cambia
  useEffect(() => {
    setUserBio(user?.biografia || '');
  }, [user]);
  React.useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoadingArticles(true);
        const user = authManager.getUser();
        const userEmail = user?.email;
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
        const user = authManager.getUser();
        const userEmail = user?.email;
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
        const user = authManager.getUser();
        const uid = user?.uid;
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
  // Obtener UID del usuario autenticado
  useEffect(() => {
    const user = authManager.getUser();
    const uid = user?.uid;
    setUid(uid);
  }, []);

  // Obtener seguidores y seguidos
  useEffect(() => {
    if (!uid) return;
    const fetchFollowers = async () => {
      setLoadingFollowers(true);
      try {
        const data = await apiManager.get(`/auth/followers/${uid}`);
        setFollowers(data);
      } catch (error) {
        setFollowers([]);
      } finally {
        setLoadingFollowers(false);
      }
    };
    const fetchFollowing = async () => {
      setLoadingFollowing(true);
      try {
        const data = await apiManager.get(`/auth/following/${uid}`);
        setFollowing(data);
      } catch (error) {
        setFollowing([]);
      } finally {
        setLoadingFollowing(false);
      }
    };
    fetchFollowers();
    fetchFollowing();
  }, [uid]);

  // Utilidad para saber si la foto es válida
  const isValidPhoto = userPhoto && !userPhoto.includes('googleusercontent.com') && userPhoto !== '';

  // Función para dejar de seguir a un usuario
  const handleUnfollow = async (followedUid) => {
    setLoadingUnfollow(followedUid);
    try {
      await apiManager.unfollowUser(followedUid, uid);
      // Actualizar la lista de seguidos
      const data = await apiManager.get(`/auth/following/${uid}`);
      setFollowing(data);
    } catch (error) {
      // Opcional: mostrar error
    } finally {
      setLoadingUnfollow(null);
    }
  };

  // Función para eliminar un seguidor
  const handleRemoveFollower = async (followerUid) => {
    setLoadingRemoveFollower(followerUid);
    try {
      await apiManager.removeFollower(uid, followerUid);
      // Actualizar la lista de seguidores
      const data = await apiManager.get(`/auth/followers/${uid}`);
      setFollowers(data);
    } catch (error) {
      // Opcional: mostrar error
    } finally {
      setLoadingRemoveFollower(null);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!token) return null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tarjeta principal con efecto glassmorphism */}
      <div className="relative flex flex-col md:flex-row items-center md:items-end justify-center gap-8 mb-16 bg-white/60 backdrop-blur-lg rounded-2xl shadow-2xl p-10 border border-white/30 ring-2 ring-purple-100">
        {/* Avatar con borde animado y gradiente */}
        <div className="flex-shrink-0 flex justify-center w-full md:w-auto">
          <div className={`w-36 h-36 rounded-full flex items-center justify-center text-white text-6xl font-extrabold shadow-xl border-4 border-white bg-gradient-to-br ${getRandomColor(userEmail)} animate-avatar-glow relative`}>
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
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2 drop-shadow-lg">{userName || userEmail}</h2>
          <p className="text-lg text-gray-500 mb-2">{userEmail}</p>
          {userBio && (
            <p className="text-base text-gray-700 mb-2 whitespace-pre-line bg-white/70 rounded-lg px-4 py-2 border border-gray-200 shadow-sm max-w-xl mx-auto md:mx-0">
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
        <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl p-8 border border-white/40 shadow-lg flex flex-col items-start w-full">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-lg text-2xl">
              <FaBook />
            </span>
            <h3 className="text-xl font-bold text-gray-900">Artículos publicados</h3>
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
        <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl p-8 border border-white/40 shadow-lg flex flex-col items-start w-full">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-lg text-2xl">
              <FaShoppingBag />
            </span>
            <h3 className="text-xl font-bold text-gray-900">Ventas en curso</h3>
          </div>
          {loadingVentas ? (
            <div className="flex justify-center items-center w-full py-8">
              <span className="animate-spin text-2xl text-purple-500 mr-2">⏳</span>
              <span className="text-gray-500">Cargando ventas...</span>
            </div>
          ) : errorVentas ? (
            <div className="text-red-600 py-4">{errorVentas}</div>
          ) : ventas.length === 0 ? (            <>
              <p className="text-gray-500 text-base mb-4">No tienes ventas en curso todavía</p>
              <a href="/upload_product" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow hover:scale-105 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300">
                <FaPlus className="w-4 h-4" /> Publicar producto
              </a>
            </>
          ) : (
            <div className="w-full">
              <div className="grid grid-cols-1 gap-4 w-full">
                {ventas.slice(0, 3).map(producto => (
                  <div key={producto.id} className="flex items-center gap-4 bg-white/80 rounded-xl shadow p-4 border border-white/60 hover:shadow-lg transition-all">
                    <img 
                      src={producto.imagenes[0] && producto.imagenes[0] !== '/default-product.jpg' ? producto.imagenes[0] : 'https://cataas.com/cat'} 
                      alt={producto.nombre} 
                      className="w-16 h-16 object-cover rounded-lg border border-purple-100" 
                    />
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1 truncate max-w-[180px]">{producto.nombre}</h4>
                      <p className="text-xs text-gray-500 mb-1">{
                        producto.fecha_publicacion && !isNaN(new Date(producto.fecha_publicacion))
                          ? new Date(producto.fecha_publicacion).toLocaleDateString()
                          : "En venta"
                      }</p>
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
      <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl p-8 border border-white/40 shadow-lg flex flex-col items-start w-full mb-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-lg text-2xl">
            <FaHistory />
          </span>
          <h3 className="text-xl font-bold text-gray-900">Historial de compras</h3>
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
              {(showAllCompras ? compras : compras.slice(0, 3)).map(compra => {
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
            {compras.length > 3 && (
              <button
                onClick={() => setShowAllCompras(!showAllCompras)}
                className="mt-4 inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold"
              >
                {showAllCompras ? 'Mostrar menos' : 'Ver todas las compras'} <FaArrowRight className={`w-4 h-4 transition-transform ${showAllCompras ? 'rotate-90' : ''}`} />
              </button>
            )}
            <CompraDetalleModal isOpen={modalOpen} onClose={() => setModalOpen(false)} compra={selectedCompra} />
          </div>
        )}
      </div>

      {/* Sección de Seguidores y Seguidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {/* Seguidores */}
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/30">
          <div className="flex items-center gap-3 mb-4">
            <FaUsers className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-semibold text-gray-900">Seguidores</h3>
          </div>
          {loadingFollowers ? (
            <LoadingSpinner />
          ) : followers.length > 0 ? (
            <div className="space-y-4">
              {followers.map((follower) => (
                <div key={follower.uid} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <a href={`/user/${follower.email}`} className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold bg-gradient-to-br ${getRandomColor(follower.email)} transition hover:scale-105`}>
                    {follower.foto ? (
                      <img src={follower.foto} alt={follower.nombre} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      getInitials(follower.nombre || follower.email)
                    )}
                  </a>
                  <div>
                    <a href={`/user/${follower.email}`} className="font-medium text-gray-900 hover:text-purple-700 transition-colors">{follower.nombre || follower.email}</a>
                    <p className="text-sm text-gray-500">{follower.email}</p>
                  </div>
                  <button
                    className="ml-auto px-3 py-1 rounded-full bg-red-500 text-white text-xs font-semibold shadow hover:bg-red-600 transition-all duration-200"
                    onClick={() => handleRemoveFollower(follower.uid)}
                    disabled={loadingRemoveFollower === follower.uid}
                  >
                    {loadingRemoveFollower === follower.uid ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No tiene seguidores</p>
          )}
        </div>
        {/* Seguidos */}
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/30">
          <div className="flex items-center gap-3 mb-4">
            <FaUsers className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-semibold text-gray-900">Siguiendo</h3>
          </div>
          {loadingFollowing ? (
            <LoadingSpinner />
          ) : following.length > 0 ? (
            <div className="space-y-4">
              {following.map((followed) => (
                <div key={followed.uid} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <a href={`/user/${followed.email}`} className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold bg-gradient-to-br ${getRandomColor(followed.email)} transition hover:scale-105`}>
                    {followed.foto ? (
                      <img src={followed.foto} alt={followed.nombre} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      getInitials(followed.nombre || followed.email)
                    )}
                  </a>
                  <div>
                    <a href={`/user/${followed.email}`} className="font-medium text-gray-900 hover:text-purple-700 transition-colors">{followed.nombre || followed.email}</a>
                    <p className="text-sm text-gray-500">{followed.email}</p>
                  </div>
                  <button
                    className="ml-auto px-3 py-1 rounded-full bg-gray-500 text-white text-xs font-semibold shadow hover:bg-gray-700 transition-all duration-200"
                    onClick={() => handleUnfollow(followed.uid)}
                    disabled={loadingUnfollow === followed.uid}
                  >
                    {loadingUnfollow === followed.uid ? 'Dejando de seguir...' : 'Dejar de seguir'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No sigue a nadie</p>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-10 border border-white/30 shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-lg text-2xl">
            <FaChartLine />
          </span>
          <h3 className="text-2xl font-bold text-gray-900">Estadísticas</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl p-8 text-center shadow-lg border border-white/40 hover:scale-105 transition-transform duration-300">
            <p className="text-4xl font-extrabold text-purple-700 mb-2">{articles.length}</p>
            <p className="text-base text-gray-600 flex items-center justify-center gap-2"><FaBook className="w-5 h-5" /> Artículos</p>
          </div>
          <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl p-8 text-center shadow-lg border border-white/40 hover:scale-105 transition-transform duration-300">
            <p className="text-4xl font-extrabold text-purple-700 mb-2">{ventas.length}</p>
            <p className="text-base text-gray-600 flex items-center justify-center gap-2"><FaShoppingBag className="w-5 h-5" /> Ventas</p>
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