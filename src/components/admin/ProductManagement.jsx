import React, { useState, useEffect } from 'react';
import { FaSearch, FaTrash, FaEdit, FaPlus, FaSort, FaSortUp, FaSortDown, FaExclamationTriangle, FaEye, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import LoadingSpinner from '../LoadingSpinner';
import AdminDeleteModal from './AdminDeleteModal';
import ReactDOM from 'react-dom';
import { authManager } from '../../utils/authManager';
import { apiManager } from '../../utils/apiManager';
import { showAdminToast } from './AdminToast';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [detalleProducto, setDetalleProducto] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);  const fetchProducts = async () => {
    try {
      const data = await apiManager.get('/admin/products');
      setProducts(data);
    } catch (err) {
      let userFriendlyMessage = 'Error al cargar los productos. Por favor, intenta de nuevo.';
      
      if (err.message.includes('fetch') || err.message.includes('network') || err.message.includes('Failed to fetch')) {
        userFriendlyMessage = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (err.message.includes('401') || err.message.includes('unauthorized')) {
        userFriendlyMessage = 'Sesión expirada. Por favor, inicia sesión de nuevo.';
      } else if (err.message.includes('403') || err.message.includes('forbidden')) {
        userFriendlyMessage = 'No tienes permisos para ver esta información.';
      } else if (err.message.includes('500')) {
        userFriendlyMessage = 'Error del servidor. Por favor, contacta al administrador.';
      }
      
      setError(userFriendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = (product) => {
    setDeleteProduct(product);
  };  const confirmDeleteProduct = async () => {
    if (!deleteProduct) return;
    try {
      await apiManager.delete(`/admin/products/${deleteProduct.id}`);
      setProducts(products.filter(product => product.id !== deleteProduct.id));
      setDeleteProduct(null);
      showAdminToast(`Producto "${deleteProduct.titulo}" eliminado correctamente`, 'success');
    } catch (err) {
      console.error('Error deleting product:', err);
      let userFriendlyMessage = 'Error al eliminar el producto. Por favor, intenta de nuevo.';
      
      if (err.message.includes('fetch') || err.message.includes('network')) {
        userFriendlyMessage = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (err.message.includes('401') || err.message.includes('unauthorized')) {
        userFriendlyMessage = 'Sesión expirada. Por favor, inicia sesión de nuevo.';
      } else if (err.message.includes('403') || err.message.includes('forbidden')) {
        userFriendlyMessage = 'No tienes permisos para eliminar productos.';
      } else if (err.message.includes('404')) {
        userFriendlyMessage = 'El producto ya no existe o ha sido eliminado.';
      }
      
      showAdminToast(userFriendlyMessage, 'error');
      setDeleteProduct(null);
    }
  };

  // Normaliza cada producto para que tenga la estructura de Firestore
  const normalizeProduct = (product) => {
    if (!product || typeof product !== 'object') return null;
    // Si el producto está anidado, desanídalo
    const keys = Object.keys(product);
    if (keys.length === 2 && keys[0] === 'id') {
      const inner = product[keys[1]];
      if (inner && typeof inner === 'object') {
        product = { id: product.id, ...inner };
      }
    }
    // Estructura exacta esperada
    return {
      id: typeof product.id === 'string' ? product.id : '',
      nombre: typeof product.nombre === 'string' ? product.nombre : '',
      descripcion: typeof product.descripcion === 'string' ? product.descripcion : '',
      precio: typeof product.precio === 'number' ? product.precio : 0,
      stock: typeof product.stock === 'number' ? product.stock : 0,
      imagen: typeof product.imagen === 'string' ? product.imagen : '',
      categoria: typeof product.categoria === 'string' ? product.categoria : '',
      estado: typeof product.estado === 'string' ? product.estado : '',
      fecha_creacion: typeof product.fecha_creacion === 'string' ? product.fecha_creacion : '',
      usuario_email: typeof product.usuario_email === 'string' ? product.usuario_email : '',
      ...product
    };
  };

  // Solo productos válidos y bien formateados
  const normalizedProducts = products
    .map(normalizeProduct)
    .filter(
      (product) =>
        product &&
        typeof product.nombre === 'string' &&
        product.nombre.length > 0 &&
        typeof product.descripcion === 'string'
    );

  const filteredProducts = normalizedProducts.filter(product =>
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSort = (field) => {
    if (sortBy !== field) {
      setSortBy(field);
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else if (sortOrder === 'desc') {
      setSortBy('');
      setSortOrder(null);
    } else {
      setSortOrder('asc');
    }
  };

  let sortedProducts = [...filteredProducts];
  if (sortBy && sortOrder) {
    sortedProducts.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  } else {
    sortedProducts = filteredProducts;
  }

  const handleAddProduct = () => setShowAdd(true);
  const handleEditProduct = (product) => setEditProduct(product);  const handleCreateProduct = async (form) => {
    try {
      const user = authManager.getUser();
      const userEmail = user?.email;
      const formData = new FormData();
      formData.append('nombre', form.nombre);
      formData.append('descripcion', form.descripcion);
      formData.append('precio', form.precio);
      formData.append('stock', form.stock);
      formData.append('categoria', form.categoria);
      formData.append('estado', form.estado);
      formData.append('usuario_email', userEmail || '');
      // No se envía imagen, el backend pone la de gato si no hay      const created = await apiManager.post('/productos', formData);
      setProducts([...products, created]);
      setShowAdd(false);
      showAdminToast(`Producto "${form.nombre}" creado correctamente`, 'success');
    } catch (err) {
      console.error('Error al crear producto:', err);
      let errorMessage = 'Error al crear el producto. Por favor, inténtalo de nuevo.';
      
      if (err.message?.includes('Network Error') || err.message?.includes('fetch')) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.';
      } else if (err.message?.includes('401')) {
        errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      } else if (err.message?.includes('403')) {
        errorMessage = 'No tienes permisos para crear productos.';
      } else if (err.message?.includes('409')) {
        errorMessage = 'Ya existe un producto con ese nombre. Usa un nombre diferente.';      } else if (err.message?.includes('422') || err.message?.includes('400')) {
        errorMessage = 'Los datos del producto no son válidos. Revisa todos los campos.';
      } else if (err.message?.includes('500')) {
        errorMessage = 'Error interno del servidor. Contacta al administrador.';
      }
      
      showAdminToast(errorMessage, 'error');
    }
  };  const handleUpdateProduct = async (form) => {
    try {
      console.log("Actualizando producto:", editProduct.id);
      console.log("Datos del formulario:", form);
      
      const formData = new FormData();
      formData.append('nombre', form.nombre);
      formData.append('descripcion', form.descripcion);
      formData.append('precio', form.precio);
      formData.append('stock', form.stock);
      formData.append('categoria', form.categoria);
      formData.append('estado', form.estado);
      
      // Conservar el usuario_email original
      if (editProduct.usuario_email) {
        formData.append('usuario_email', editProduct.usuario_email);
      }
      
      // Conservar imágenes existentes - CORREGIDO
      if (editProduct.imagenes && Array.isArray(editProduct.imagenes) && editProduct.imagenes.length > 0) {
        console.log("Enviando imágenes existentes (array):", editProduct.imagenes);
        editProduct.imagenes.forEach(url => {
          formData.append('imagenes_existentes', url);
        });
      } else if (editProduct.imagen && typeof editProduct.imagen === 'string') {
        console.log("Enviando imagen existente (string):", editProduct.imagen);
        formData.append('imagenes_existentes', editProduct.imagen);
      }
      
      // Depuración para ver qué se está enviando al servidor
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      const updated = await apiManager.put(`/productos/${editProduct.id}`, formData);
      console.log("Respuesta del servidor:", updated);
      
      setProducts(products.map(p => p.id === editProduct.id ? updated : p));
      setEditProduct(null);
      showAdminToast(`Producto "${form.nombre}" actualizado correctamente`, 'success');
    } catch (err) {
      console.error('Error al actualizar producto:', err);
      let errorMessage = 'Error al actualizar el producto. Por favor, inténtalo de nuevo.';
      
      if (err.message?.includes('Network Error') || err.message?.includes('fetch')) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.';
      } else if (err.message?.includes('401')) {
        errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      } else if (err.message?.includes('403')) {
        errorMessage = 'No tienes permisos para editar este producto.';
      } else if (err.message?.includes('404')) {
        errorMessage = 'El producto que intentas editar ya no existe.';
      } else if (err.message?.includes('409')) {
        errorMessage = 'Ya existe un producto con ese nombre. Usa un nombre diferente.';
      } else if (err.message?.includes('422') || err.message?.includes('400')) {
        errorMessage = 'Los datos del producto no son válidos. Revisa todos los campos.';      } else if (err.message?.includes('500')) {
        errorMessage = 'Error interno del servidor. Contacta al administrador.';
      }
      
      showAdminToast(errorMessage, 'error');
    }
  };

  // Añadir función para el icono de ordenación
  const getSortIcon = (order) => {
    if (order === 'asc') return <FaSortUp className="inline ml-1 text-purple-400" />;
    if (order === 'desc') return <FaSortDown className="inline ml-1 text-purple-400" />;
    return <FaSort className="inline ml-1 text-gray-300" />;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-8 py-6 rounded-2xl shadow-lg flex flex-col items-center animate-fade-in">
          <FaExclamationTriangle className="text-4xl text-red-400 mb-2" />
          <p className="text-lg font-semibold mb-1">Error al obtener productos</p>
          <span className="text-sm text-red-500">{error}</span>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-5 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestión de Productos</h1>
        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <button onClick={handleAddProduct} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <FaPlus />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:text-purple-600 transition" onClick={() => handleSort('nombre')}>
                Producto {getSortIcon(sortBy === 'nombre' ? sortOrder : '')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:text-purple-600 transition" onClick={() => handleSort('precio')}>
                Precio {getSortIcon(sortBy === 'precio' ? sortOrder : '')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:text-purple-600 transition" onClick={() => handleSort('stock')}>
                Stock {getSortIcon(sortBy === 'stock' ? sortOrder : '')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedProducts.map((product) => (
              <tr key={product.id} className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition cursor-pointer" onClick={e => { if (!e.target.closest('.acciones-btn')) setDetalleProducto(product); }}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {Array.isArray(product.imagenes) && product.imagenes.length > 0 ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={product.imagenes[0]}
                          alt={product.nombre}
                        />
                      ) : product.imagen ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={product.imagen}
                          alt={product.nombre}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-gray-500 dark:text-gray-400">
                            {typeof product.nombre === 'string' && product.nombre.length > 0
                              ? product.nombre[0].toUpperCase()
                              : '?'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.nombre}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {product.descripcion?.substring(0, 50)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {new Intl.NumberFormat('es-ES', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(product.precio)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    product.stock > 10
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : product.stock > 0
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {product.stock} unidades
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2 acciones-btn">
                  <button
                    onClick={e => { e.stopPropagation(); setDetalleProducto(product); }}
                    className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700 transition"
                    title="Ver detalle"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 mr-4"
                  >
                    <FaTrash />
                  </button>
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <FaEdit />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProductFormModal
        isOpen={!!editProduct}
        onClose={() => setEditProduct(null)}
        onSubmit={handleUpdateProduct}
        initialData={editProduct}
        mode="edit"
      />
      <ProductFormModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={handleCreateProduct}
        mode="add"
      />
      <AdminDeleteModal
        isOpen={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={confirmDeleteProduct}
        title="¿Eliminar producto?"
        message="¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer."
        itemName={deleteProduct?.nombre}
      />
      <AdminProductoDetalleModal
        isOpen={!!detalleProducto}
        onClose={() => setDetalleProducto(null)}
        producto={detalleProducto}
      />
    </div>
  );
};

// Modal para añadir/editar producto
const ProductFormModal = ({ isOpen, onClose, onSubmit, initialData, mode }) => {  const [form, setForm] = React.useState({
    nombre: initialData?.nombre || '',
    descripcion: initialData?.descripcion || '',
    precio: initialData?.precio ?? '',
    stock: initialData?.stock ?? '',
    categoria: initialData?.categoria || '',
    estado: initialData?.estado || 'Nuevo',
  });
  const [error, setError] = React.useState('');
  React.useEffect(() => {
    setForm({
      nombre: initialData?.nombre || '',
      descripcion: initialData?.descripcion || '',
      precio: initialData?.precio ?? '',
      stock: initialData?.stock ?? '',
      categoria: initialData?.categoria || '',
      estado: initialData?.estado || 'Nuevo',
    });
    setError('');
  }, [isOpen, initialData]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };  const handleSubmit = async e => {
    e.preventDefault();
    
    // Validación mejorada
    if (!form.nombre || form.nombre.trim() === '') {
      setError('El nombre del producto es obligatorio');
      return;
    }
    
    if (!form.descripcion || form.descripcion.trim() === '') {
      setError('La descripción es obligatoria');
      return;
    }
    
    if (!form.precio || isNaN(parseFloat(form.precio)) || parseFloat(form.precio) <= 0) {
      setError('El precio debe ser un número válido mayor que 0');
      return;
    }
    
    if (!form.stock || isNaN(parseInt(form.stock)) || parseInt(form.stock) < 0) {
      setError('El stock debe ser un número válido mayor o igual a 0');
      return;
    }
    
    if (!form.categoria || form.categoria.trim() === '') {
      setError('Debes seleccionar una categoría');
      return;
    }
    
    if (!form.estado || form.estado.trim() === '') {
      setError('Debes seleccionar un estado');
      return;
    }
    
    setError('');
    console.log("Enviando formulario validado:", {
      ...form,
      precio: parseFloat(form.precio),
      stock: parseInt(form.stock, 10)
    });
    await onSubmit({
      ...form,
      precio: parseFloat(form.precio),
      stock: parseInt(form.stock, 10)
    });
  };

  if (!isOpen) return null;
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-40 z-[1000]" onClick={handleOverlayClick}></div>
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-fade-in relative z-[1010]">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{mode === 'edit' ? 'Editar producto' : 'Añadir producto'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio (€)</label>
              <input type="number" step="0.01" name="precio" value={form.precio} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input type="number" name="stock" value={form.stock} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select name="categoria" value={form.categoria} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">Selecciona una categoría</option>
              <option value="juego">juego</option>
              <option value="accesorio">accesorio</option>
              <option value="merchandising">merchandising</option>
              <option value="otros">otros</option>
              <option value="consola">consola</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select name="estado" value={form.estado} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="Nuevo">Nuevo</option>
              <option value="Como nuevo">Como nuevo</option>
              <option value="Bueno">Bueno</option>
              <option value="Aceptable">Aceptable</option>
            </select>
          </div>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition">{mode === 'edit' ? 'Guardar' : 'Añadir'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal de detalle de producto
const AdminProductoDetalleModal = ({ isOpen, onClose, producto }) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  if (!isOpen || !producto) return null;
  const inicial = producto.nombre?.[0]?.toUpperCase() || '?';
  const imagenes = Array.isArray(producto.imagenes) && producto.imagenes.length > 0 ? producto.imagenes : (producto.imagen ? [producto.imagen] : []);
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={handleOverlayClick}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-fade-in relative">
        <button onClick={onClose} className="absolute top-4 right-6 text-gray-400 hover:text-purple-600 text-2xl font-bold" aria-label="Cerrar">&times;</button>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Detalle de Producto</h2>
        <div className="flex flex-col items-center mb-4">
          {imagenes.length > 0 ? (
            <div className="relative mb-2">
              <img src={imagenes[currentImageIndex]} alt="Imagen del producto" className="w-24 h-24 rounded-full object-cover border-4 border-purple-200 shadow" />
              {imagenes.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(currentImageIndex > 0 ? currentImageIndex - 1 : imagenes.length - 1)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full hover:bg-white transition-colors z-10"
                  >
                    <FaChevronLeft className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(currentImageIndex < imagenes.length - 1 ? currentImageIndex + 1 : 0)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full hover:bg-white transition-colors z-10"
                  >
                    <FaChevronRight className="w-4 h-4 text-gray-700" />
                  </button>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1">
                    {imagenes.map((_, idx) => (
                      <span key={idx} className={`w-2 h-2 rounded-full ${currentImageIndex === idx ? 'bg-purple-600' : 'bg-gray-300'} inline-block`}></span>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center mb-2">
              <span className="text-4xl text-purple-600 font-bold">{inicial}</span>
            </div>
          )}
          <div className="text-lg font-semibold text-gray-800">{producto.nombre}</div>
          <div className="text-sm text-gray-500">{producto.categoria}</div>
        </div>
        <div className="text-left space-y-2 mb-4">
          <div><span className="font-semibold">Descripción:</span> {producto.descripcion}</div>
          <div><span className="font-semibold">Precio:</span> {producto.precio} €</div>
          <div><span className="font-semibold">Stock:</span> {producto.stock} unidades</div>
          <div><span className="font-semibold">Estado:</span> {producto.estado}</div>
          <div><span className="font-semibold">ID:</span> {producto.id}</div>
          {producto.usuario_email && <div><span className="font-semibold">Usuario email:</span> {producto.usuario_email}</div>}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProductManagement; 