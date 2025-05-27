import React, { useState, useEffect } from 'react';
import { FaSearch, FaTrash, FaEdit, FaPlus } from 'react-icons/fa';
import LoadingSpinner from '../LoadingSpinner';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch('http://127.0.0.1:8000/admin/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener productos');
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar producto');
      }

      // Actualizar la lista de productos
      setProducts(products.filter(product => product.id !== productId));
    } catch (err) {
      setError(err.message);
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
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
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <FaPlus />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {product.imagen ? (
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 mr-4"
                  >
                    <FaTrash />
                  </button>
                  <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                    <FaEdit />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManagement; 