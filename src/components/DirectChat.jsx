import React, { useState, useEffect, useRef } from 'react';
import { directChatManager } from '../utils/directChatManager';
import { authManager } from '../utils/authManager';
import { apiManager } from '../utils/apiManager';
import { FaSpinner, FaEdit, FaTrash, FaCheck, FaTimes, FaEllipsisV, FaInfoCircle } from 'react-icons/fa';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import Toast from './Toast';
import { wsChatManager } from '../utils/wsChatManager';

const DirectChat = ({ chatId, otherUserId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendLoading, setSendLoading] = useState(false);
  const [error, setError] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const messagesEndRef = useRef(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const menuRef = useRef(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [editError, setEditError] = useState(null);  const [toast, setToast] = useState({ open: false, message: '', type: 'error' });
  const [typingUsers, setTypingUsers] = useState([]); // Array de {uid, name}
  const [typingTimeout, setTypingTimeout] = useState(null);

  // Cargar información del otro usuario (simulada, ya que no hay acceso directo a Firestore)
  useEffect(() => {
    const loadOtherUser = async () => {
      try {        // Obtener la info real del usuario desde el backend
        const userData = await apiManager.getUserByUid(otherUserId);
        setOtherUser({ name: userData.nombre || userData.email || otherUserId });
      } catch (err) {
        setOtherUser({ name: otherUserId }); // fallback al UID
      }
    };
    if (otherUserId) {
      loadOtherUser();
    }
  }, [otherUserId]);  // Función reutilizable para cargar mensajes
  const loadMessages = async (opts = {}) => {
    try {
      // Marcar como leído antes de cargar mensajes
      await directChatManager.markChatAsRead(chatId);
      const chatMessages = await directChatManager.getMessages(chatId, opts);
      if (opts.before) {
        // Paginación: añadir al principio
        setMessages((prev) => [...chatMessages.reverse(), ...prev]);
        setHasMore(chatMessages.length === (opts.limit || 50));
      } else {
        setMessages(chatMessages.reverse());
        setHasMore(chatMessages.length === (opts.limit || 50));
      }
      setError(null);
      // Refrescar el contador de chats sin leer si existe la función global
      if (window && typeof window.refreshUnreadChats === 'function') {
        window.refreshUnreadChats();      }
    } catch (err) {
      setError('Error al cargar los mensajes');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Cargar mensajes iniciales
  useEffect(() => {
    if (chatId) {
      setLoading(true);
      loadMessages();
    }
    // eslint-disable-next-line
  }, [chatId]);

  // Scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cerrar el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenId(null);
      }
    };
    if (menuOpenId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpenId]);
  useEffect(() => {
    let isMounted = true;
    let token = null;    const connectWS = async () => {
      token = await authManager.getToken();
      wsChatManager.connect({ chatId, token });
      wsChatManager.on('message', handleWSMessage);
      wsChatManager.on('typing', handleWSTyping);
      wsChatManager.on('read', handleWSRead);
    };const handleWSMessage = (data) => {
      // Recibir mensaje nuevo en tiempo real
      setMessages((prev) => {
        // Evitar duplicados
        if (prev.some(m => m.id === data.message.id)) return prev;
        // Añadir el nuevo mensaje al final
        const newMessages = [...prev, data.message];
        // Ordenar por timestamp para asegurar el orden correcto
        return newMessages.sort((a, b) => a.timestamp - b.timestamp);
      });
      // Scroll al último mensaje
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      setError(null);
    };    const handleWSTyping = (data) => {
      if (!isMounted) return;
      setTypingUsers((prev) => {
        if (data.typing) {
          // Añadir usuario que está escribiendo con su nombre
          const newTypingUsers = prev.filter(user => user.uid !== data.user_uid);
          newTypingUsers.push({
            uid: data.user_uid,
            name: data.user_name
          });
          return newTypingUsers;
        } else {
          // Remover usuario que dejó de escribir
          return prev.filter(user => user.uid !== data.user_uid);
        }
      });
    };const handleWSRead = (data) => {
      if (!isMounted) return;
      // Actualizar el estado de lectura de los mensajes
      setMessages((prev) => 
        prev.map(msg => {
          // Si el mensaje es del usuario que leyó, actualizar read_by
          if (!msg.read_by.includes(data.user)) {
            return {
              ...msg,
              read_by: [...msg.read_by, data.user]
            };
          }
          return msg;
        })
      );
    };
    if (chatId) {
      connectWS();
    }    return () => {
      isMounted = false;
      // Limpiar timeout de typing
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      wsChatManager.disconnect();
      wsChatManager.off('message', handleWSMessage);
      wsChatManager.off('typing', handleWSTyping);
      wsChatManager.off('read', handleWSRead);
    };
  }, [chatId]);
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sendLoading) return;
    setSendLoading(true);
    
    // Limpiar timeout de typing y enviar stop typing
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
    wsChatManager.sendStopTyping();

    try {
      wsChatManager.sendMessage(input.trim());
      setInput('');
      setError(null);
    } catch (err) {
      setError('Error al enviar mensaje');
    } finally {
      setSendLoading(false);
    }
  };  // Evento typing con timeout
  const handleInputChange = (e) => {
    setInput(e.target.value);
    
    // Limpiar timeout anterior
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    if (e.target.value.trim()) {
      // Enviar evento de typing
      wsChatManager.sendTyping();
      
      // Establecer timeout para dejar de escribir automáticamente
      const timeout = setTimeout(() => {
        wsChatManager.sendStopTyping();
      }, 3000); // 3 segundos
      
      setTypingTimeout(timeout);
    } else {
      // Si el input está vacío, dejar de escribir inmediatamente
      wsChatManager.sendStopTyping();
    }
  };
  // Marcar como leído al cargar mensajes o al recibir nuevos
  useEffect(() => {
    if (chatId && messages.length > 0) {
      wsChatManager.sendRead();
    }
  }, [chatId, messages.length]);

  // Handler para cargar más mensajes
  const handleLoadMore = async () => {
    if (messages.length === 0) return;
    setLoadingMore(true);
    const oldest = messages[0];
    await loadMessages({ before: oldest.timestamp, limit: 50 });
  };

  const handleEdit = (message) => {
    setEditingId(message.id);
    setEditValue(message.content);
  };

  const handleEditSave = async (message) => {
    if (!editValue || !editValue.trim()) {
      setEditError('El mensaje no puede estar vacío.');
      return;
    }
    setDeletingId(message.id);
    setEditError(null);
    try {
      await directChatManager.editMessage(message.id, editValue.trim());
      setEditingId(null);
      setEditValue('');      await loadMessages();
    } catch (err) {
      setToast({ open: true, message: err.message || 'No se pudo editar el mensaje.', type: 'error' });
      setEditError('No se pudo editar el mensaje.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleDelete = (message) => {
    setMessageToDelete(message);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!messageToDelete) return;
    setDeletingId(messageToDelete.id);
    try {
      await directChatManager.deleteMessage(messageToDelete.id);
      setShowDeleteModal(false);
      setMessageToDelete(null);      await loadMessages();
    } catch (err) {
      setToast({ open: true, message: err.message || 'No se pudo eliminar el mensaje.', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setMessageToDelete(null);
  };

  if (loading && messages.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full py-16">
      <FaSpinner className="animate-spin text-purple-500 text-4xl mb-4" />
      <span className="text-purple-500 text-lg font-semibold">Cargando chat...</span>
    </div>
  );
  if (error) return (
    <div className="flex flex-col items-center justify-center h-full py-16">
      <div className="bg-red-50 border border-red-200 rounded-2xl shadow-lg px-8 py-8 flex flex-col items-center animate-fade-in">
        <span className="text-red-400 text-5xl mb-2">
          {/* Icono de error */}
          <svg xmlns='http://www.w3.org/2000/svg' className='inline-block' width='48' height='48' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>
        </span>
        <span className="text-red-500 text-xl font-semibold mb-1">No se pudieron cargar los mensajes</span>
        <span className="text-red-400 text-base text-center">Por favor, revisa tu conexión o vuelve a intentarlo en unos minutos.</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white/90 rounded-3xl shadow-xl border border-purple-100 overflow-hidden">      {/* Cabecera del chat */}
      <div className="p-4 border-b bg-white/95 rounded-t-3xl">
        <h2 className="font-medium">
          {otherUser?.name || 'Usuario'}
        </h2>
      </div>{/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white/80">
        {hasMore && messages.length > 0 && (
          <div className="flex justify-center mb-4">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-4 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold shadow hover:bg-purple-200 transition-all duration-200 disabled:opacity-50"
            >
              {loadingMore ? 'Cargando...' : 'Cargar más mensajes'}
            </button>
          </div>
        )}
        {messages.length === 0 && !loading && !error && (
          <div className="text-gray-400 text-center py-8 italic text-lg">
            No hay mensajes aún. ¡Sé el primero en escribir!
          </div>
        )}        {messages.map((message, index) => {
          const isOwn = message.sender === authManager.getUser()?.uid;
          const currentUserId = authManager.getUser()?.uid;
          
          // Determinar si este es el último mensaje enviado por el usuario actual que ha sido leído
          const isLastOwnMessage = isOwn && index === messages.length - 1;
          const isReadByOther = message.read_by && message.read_by.some(uid => uid !== currentUserId);
          
          // Encontrar el último mensaje propio leído por el otro usuario
          let showReadIndicator = false;
          if (isOwn && isReadByOther) {
            // Buscar si hay mensajes más recientes del usuario actual
            const laterOwnMessages = messages.slice(index + 1).filter(msg => msg.sender === currentUserId);
            if (laterOwnMessages.length === 0) {
              showReadIndicator = true; // Es el último mensaje propio
            }
          }

          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
            >
              <div
                className={`relative max-w-[70%] rounded-2xl p-4 shadow-md mb-2 break-words whitespace-pre-line transition-all duration-200 ${
                  isOwn
                    ? 'bg-purple-500 text-white rounded-br-none'
                    : 'bg-white text-gray-900 rounded-bl-none border border-purple-100'
                }`}
              >
                {/* Icono de información solo en mensajes propios y solo al hacer hover */}
                {isOwn && editingId !== message.id && (Date.now() - new Date(message.timestamp).getTime() < 15 * 60 * 1000) && (
                  <button
                    className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors z-10 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    onClick={() => setMenuOpenId(menuOpenId === message.id ? null : message.id)}
                    title="Opciones"
                  >
                    <FaInfoCircle />
                  </button>
                )}
                {/* Popover de opciones, sale hacia arriba */}
                {isOwn && menuOpenId === message.id && editingId !== message.id && (
                  <div
                    ref={menuRef}
                    className="absolute bottom-full right-2 mb-2 bg-white text-gray-800 rounded-xl shadow-lg border border-purple-100 py-2 w-36 animate-fade-in z-20"
                  >
                    {(Date.now() - new Date(message.timestamp).getTime() < 15 * 60 * 1000) && (
                      <button
                        className="flex items-center w-full px-4 py-2 hover:bg-purple-50 transition-colors gap-2 text-left"
                        onClick={() => { setMenuOpenId(null); handleEdit(message); }}
                      >
                        <FaEdit className="text-purple-500" /> Editar
                      </button>
                    )}
                    <button
                      className="flex items-center w-full px-4 py-2 hover:bg-red-50 transition-colors gap-2 text-left"
                      onClick={() => { setMenuOpenId(null); handleDelete(message); }}
                      disabled={deletingId === message.id}
                    >
                      <FaTrash className="text-red-500" /> Eliminar
                    </button>
                  </div>
                )}
                {/* Edición de mensaje */}
                {editingId === message.id ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        className="flex-1 p-2 rounded-lg border focus:outline-none text-gray-900"
                        value={editValue}
                        onChange={e => { setEditValue(e.target.value); if (editError) setEditError(null); }}
                        disabled={deletingId === message.id}
                      />
                      <button onClick={() => handleEditSave(message)} className="text-green-600 hover:text-green-800" disabled={deletingId === message.id || !editValue || !editValue.trim()}><FaCheck /></button>
                      <button onClick={handleEditCancel} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
                    </div>
                    {editError && <span className="text-xs text-red-500 mt-1">{editError}</span>}
                  </div>
                ) : (                  <>
                    <p className="mb-1 text-base">{message.content} {message.edited && <span className="text-xs italic opacity-70">(editado)</span>}</p>
                    <span className="text-xs opacity-70 block text-right">
                      {new Date(message.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {/* Indicador de "Leído" */}
                    {showReadIndicator && (
                      <span className="text-xs text-gray-400 block text-right mt-1">
                        Leído.
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          );        })}
        
        {/* Mostrar typing */}
        {typingUsers.length > 0 && (
          <div className="text-sm text-purple-500 mb-2 animate-pulse italic flex items-center gap-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <span>
              {typingUsers.length === 1 
                ? `${typingUsers[0].name} está escribiendo...`
                : typingUsers.length === 2
                ? `${typingUsers[0].name} y ${typingUsers[1].name} están escribiendo...`
                : `${typingUsers[0].name} y ${typingUsers.length - 1} más están escribiendo...`
              }
            </span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      {/* Formulario de envío */}
      <form onSubmit={handleSend} className="p-4 border-t bg-white/95 flex items-center gap-2 rounded-b-3xl">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Escribe un mensaje..."
          className="flex-1 p-3 border-2 border-purple-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-800 shadow-sm"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={sendLoading || !input.trim() || loading}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-semibold shadow-md hover:from-purple-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
        >
          {sendLoading ? <FaSpinner className="animate-spin" /> : 'Enviar'}
        </button>
      </form>
      {/* Modal de confirmación de borrado */}
      <ConfirmDeleteModal
        open={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        articleTitle={messageToDelete ? messageToDelete.content : ''}
        title="¿Eliminar mensaje?"
        message="¿Estás seguro de que quieres eliminar este mensaje? Esta acción no se puede deshacer."
      />
      {toast.open && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, open: false })}
          duration={3500}
        />
      )}
    </div>
  );
};

export default DirectChat; 