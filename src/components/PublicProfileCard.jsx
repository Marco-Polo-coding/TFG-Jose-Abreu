import React, { useEffect, useState } from 'react';
import { FaBook, FaShoppingBag, FaHome, FaUserPlus, FaUserMinus, FaUsers } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
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

const PublicProfileCard = ({ userEmail }) => {
  const [userData, setUserData] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [errorArticles, setErrorArticles] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [loadingVentas, setLoadingVentas] = useState(true);
  const [errorVentas, setErrorVentas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(true);
  const [loadingFollowing, setLoadingFollowing] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userUid, setUserUid] = useState(null);
  const [loadingFollow, setLoadingFollow] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const encodedEmail = encodeURIComponent(userEmail);
        const data = await apiManager.get(`/usuarios/${encodedEmail}`);
        setUserData(data);
        setUserUid(data.id);
        const currentUserData = authManager.getUser();
        setCurrentUser(currentUserData);
        if (currentUserData && data.seguidores) {
          setIsFollowing(data.seguidores.includes(currentUserData.uid));
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userEmail]);

  useEffect(() => {
    const fetchUserArticles = async () => {
      if (!userUid) return;
      try {
        const data = await apiManager.get(`/usuarios/${userUid}/articulos`);
        setArticles(data);
        setLoadingArticles(false);
      } catch (error) {
        console.error('Error fetching user articles:', error);
        setErrorArticles('Error al cargar los artículos');
        setLoadingArticles(false);
      }
    };

    fetchUserArticles();
  }, [userUid]);

  useEffect(() => {
    const fetchUserVentas = async () => {
      if (!userUid) return;
      try {
        const data = await apiManager.get(`/usuarios/${userUid}/ventas`);
        setVentas(data);
        setLoadingVentas(false);
      } catch (error) {
        console.error('Error fetching user sales:', error);
        setErrorVentas('Error al cargar las ventas');
        setLoadingVentas(false);
      }
    };

    fetchUserVentas();
  }, [userUid]);

  useEffect(() => {
    const fetchFollowers = async () => {
      if (!userData) return;
      try {
        const data = await apiManager.get(`/auth/followers/${userData.uid}`);
        setFollowers(data);
        setLoadingFollowers(false);
      } catch (error) {
        console.error('Error fetching followers:', error);
        setLoadingFollowers(false);
      }
    };

    const fetchFollowing = async () => {
      if (!userData) return;
      try {
        const data = await apiManager.get(`/auth/following/${userData.uid}`);
        setFollowing(data);
        setLoadingFollowing(false);
      } catch (error) {
        console.error('Error fetching following:', error);
        setLoadingFollowing(false);
      }
    };

    fetchFollowers();
    fetchFollowing();
  }, [userData]);

  const handleFollow = async () => {
    if (!currentUser || !userData) return;
    setLoadingFollow(true);
    try {
      await apiManager.post(`/auth/follow/${userData.uid}`, { current_user_uid: currentUser.uid });
      setIsFollowing(true);
      const updatedFollowers = await apiManager.get(`/auth/followers/${userData.uid}`);
      setFollowers(updatedFollowers);
      const refreshedUser = await apiManager.get(`/usuarios/${encodeURIComponent(userEmail)}`);
      setUserData(refreshedUser);
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setLoadingFollow(false);
    }
  };

  const handleUnfollow = async () => {
    if (!currentUser || !userData) return;
    setLoadingFollow(true);
    try {
      await apiManager.post(`/auth/unfollow/${userData.uid}`, { current_user_uid: currentUser.uid });
      setIsFollowing(false);
      const updatedFollowers = await apiManager.get(`/auth/followers/${userData.uid}`);
      setFollowers(updatedFollowers);
      const refreshedUser = await apiManager.get(`/usuarios/${encodeURIComponent(userEmail)}`);
      setUserData(refreshedUser);
    } catch (error) {
      console.error('Error unfollowing user:', error);
    } finally {
      setLoadingFollow(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!userData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-2xl p-10 border border-white/30 dark:border-gray-700 ring-2 ring-purple-100 text-center">
          <div className="text-gray-400 text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Usuario no encontrado
          </h2>
          <p className="text-gray-600 mb-6">
            Lo sentimos, no pudimos encontrar el perfil que buscas.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 font-semibold shadow-lg"
          >
            <FaHome className="w-5 h-5" />
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  const isValidPhoto = userData.foto && !userData.foto.includes('googleusercontent.com') && userData.foto !== '';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tarjeta principal con efecto glassmorphism */}
      <div className="relative flex flex-col md:flex-row items-center md:items-end justify-center gap-8 mb-16 bg-white/60 backdrop-blur-lg rounded-2xl shadow-2xl p-10 border border-white/30 ring-2 ring-purple-100">
        {/* Avatar con borde animado y gradiente */}
        <div className="flex-shrink-0 flex justify-center w-full md:w-auto">
          <div className={`w-36 h-36 rounded-full flex items-center justify-center text-white text-6xl font-extrabold shadow-xl border-4 border-white bg-gradient-to-br ${getRandomColor(userEmail)} animate-avatar-glow relative`}>
            {isValidPhoto ? (
              <img
                src={userData.foto}
                alt={userData.nombre || userEmail}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              getInitials(userData.nombre || userEmail)
            )}
          </div>
        </div>
        {/* Info usuario */}
        <div className="text-center md:text-left w-full">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2 drop-shadow-lg">{userData.nombre || userEmail}</h2>
          <p className="text-lg text-gray-500 mb-2">{userEmail}</p>
          {userData.biografia && (
            <p className="text-base text-gray-700 mb-2 whitespace-pre-line bg-white/70 rounded-lg px-4 py-2 border border-gray-200 shadow-sm max-w-xl mx-auto md:mx-0">
              {userData.biografia}
            </p>
          )}
          {currentUser && currentUser.uid !== userData.uid && (
            <>
              <button
                onClick={isFollowing ? handleUnfollow : handleFollow}
                className={`mt-2 inline-flex items-center gap-2 px-5 py-2 rounded-full ${
                  isFollowing
                    ? 'bg-gray-600 hover:bg-gray-700'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                } text-white font-semibold shadow hover:scale-105 transition-all duration-300`}
                disabled={loadingFollow}
              >
                {isFollowing ? (
                  <>
                    <FaUserMinus className="w-4 h-4" /> Dejar de seguir
                  </>
                ) : (
                  <>
                    <FaUserPlus className="w-4 h-4" /> Seguir
                  </>
                )}
              </button>
              <button
                onClick={async () => {
                  try {
                    const chat = await import('../utils/directChatManager').then(m => m.directChatManager.createChat(userData.uid));
                    if (chat && chat.id) {
                      window.location.href = `/chat?id=${chat.id}&user=${userData.uid}`;
                    }
                  } catch (err) {
                    alert('Error al iniciar el chat');
                  }
                }}
                className="mt-2 ml-2 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow hover:scale-105 transition-all duration-300"
              >
                <FaUsers className="w-4 h-4" /> Iniciar chat
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sección de seguidores y seguidos */}
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
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No sigue a nadie</p>
          )}
        </div>
      </div>

      {/* Sección de Artículos */}
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl p-8 mb-8 border border-white/30">
        <div className="flex items-center gap-3 mb-6">
          <FaBook className="w-6 h-6 text-purple-600" />
          <h3 className="text-2xl font-bold text-gray-900">Artículos publicados</h3>
        </div>
        {loadingArticles ? (
          <LoadingSpinner />
        ) : errorArticles ? (
          <p className="text-red-500">{errorArticles}</p>
        ) : articles.length === 0 ? (
          <p className="text-gray-500">No hay artículos publicados</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {articles.map(article => (
              <div key={article.id} className="flex items-center gap-4 bg-white/80 rounded-xl shadow p-4 border border-white/60 hover:shadow-lg transition-all">
                <img 
                  src={article.imagen && article.imagen !== '/default-article.jpg' ? article.imagen : 'https://cataas.com/cat'} 
                  alt={article.titulo} 
                  className="w-16 h-16 object-cover rounded-lg border border-purple-100" 
                />
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1 truncate max-w-[180px]">{article.titulo}</h4>
                  <p className="text-xs text-gray-500 mb-1">{new Date(article.fecha_publicacion).toLocaleDateString()}</p>
                </div>
                <a href={`/articulo/${article.id}`} className="text-purple-600 hover:text-indigo-700 font-bold text-sm">Ver</a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sección de Productos en Venta */}
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/30">
        <div className="flex items-center gap-3 mb-6">
          <FaShoppingBag className="w-6 h-6 text-purple-600" />
          <h3 className="text-2xl font-bold text-gray-900">Productos en venta</h3>
        </div>
        {loadingVentas ? (
          <LoadingSpinner />
        ) : errorVentas ? (
          <p className="text-red-500">{errorVentas}</p>
        ) : ventas.length === 0 ? (
          <p className="text-gray-500">No hay productos en venta</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {ventas.map(producto => (
              <div key={producto.id} className="flex items-center gap-4 bg-white/80 rounded-xl shadow p-4 border border-white/60 hover:shadow-lg transition-all">
                <img 
                  src={producto.imagenes && producto.imagenes.length > 0 ? producto.imagenes[0] : 'https://cataas.com/cat'} 
                  alt={producto.nombre} 
                  className="w-16 h-16 object-cover rounded-lg border border-purple-100" 
                />
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1 truncate max-w-[180px]">{producto.nombre}</h4>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-purple-600 font-bold">{producto.precio}€</p>
                    <span className="text-xs text-gray-500">•</span>
                    <p className="text-xs text-gray-500 capitalize">En venta</p>
                  </div>
                </div>
                <a href={`/producto/${producto.id}`} className="text-purple-600 hover:text-indigo-700 font-bold text-sm">Ver</a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfileCard; 