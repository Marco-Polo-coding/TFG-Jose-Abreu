import React, { useState, useEffect } from 'react';
import { FaBox, FaEdit, FaTrash, FaPlus, FaSpinner, FaHome } from 'react-icons/fa';
import axios from 'axios';
import PropTypes from 'prop-types';
import CartButton from './CartButton';
import UserButton from './UserButton';

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    imagen: ''
  });

  useEffect(() => {
    const userId = localStorage.getItem('uid');
    if (!userId) {
      setError('No se ha encontrado el ID del usuario. Por favor, inicia sesión.');
      setLoading(false);
      return;
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('uid');
      if (!userId) {
        throw new Error('No se ha encontrado el ID del usuario');
      }
      const response = await axios.get(`http://localhost:8000/usuarios/${userId}/productos`);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cargar los productos. Por favor, intenta de nuevo.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem('uid');
      if (!userId) {
        throw new Error('No se ha encontrado el ID del usuario');
      }
      const productData = {
        ...formData,
        usuario: userId,
        likes: 0,
        vendido: false
      };

      if (editingProduct) {
        await axios.put(`http://localhost:8000/productos/${editingProduct.id}`, productData);
      } else {
        await axios.post('http://localhost:8000/productos', productData);
      }

      setShowModal(false);
      setEditingProduct(null);
      setFormData({
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
        imagen: ''
      });
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al guardar el producto. Por favor, intenta de nuevo.');
      console.error('Error saving product:', err);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio,
      stock: product.stock,
      imagen: product.imagen
    });
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await axios.delete(`http://localhost:8000/productos/${productId}`);
        fetchProducts();
      } catch (err) {
        setError(err.response?.data?.detail || 'Error al eliminar el producto. Por favor, intenta de nuevo.');
        console.error('Error deleting product:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Botones flotantes de usuario y carrito */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-8">
        <CartButton />
        <UserButton />
      </div>
      {/* Hero Section */}
      <section className="relative h-[30vh] bg-gradient-to-r from-purple-900 to-indigo-900 flex items-center mb-12 shadow-xl">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
          {/* Breadcrumb */}
          <div className="flex items-center gap-4 mb-4">
            <a href="/" className="flex items-center gap-2 text-white hover:text-purple-200 transition-colors">
              <FaHome className="w-5 h-5" />
              <span>Inicio</span>
            </a>
            <span className="text-white/50">/</span>
            <span className="text-white/50">Mis Productos</span>
          </div>
          <div className="flex items-center gap-4 text-white">
            <FaBox className="text-5xl md:text-6xl drop-shadow-xl" />
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold mb-2 drop-shadow-xl">Mis Productos</h1>
              <p className="text-lg md:text-xl text-gray-200 drop-shadow">Gestiona tus productos subidos a la tienda</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <FaBox className="text-purple-500" />
            Tus productos
          </h2>
          <button 
            onClick={() => {
              setEditingProduct(null);
              setFormData({
                nombre: '',
                descripcion: '',
                precio: '',
                stock: '',
                imagen: ''
              });
              setShowModal(true);
            }}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg hover:scale-105"
          >
            <FaPlus />
            Nuevo Producto
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-4xl text-purple-500" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-xl">
            <FaBox className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No tienes productos subidos aún.</p>
            <button 
              onClick={() => setShowModal(true)}
              className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
            >
              ¡Sube tu primer producto!
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {products.map(product => (
              <div key={product.id} className="bg-gradient-to-br from-white via-purple-50 to-indigo-100 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-white/60 animate-fade-in">
                <div className="aspect-w-16 aspect-h-9 mb-4">
                  <img 
                    src={product.imagen} 
                    alt={product.nombre}
                    className="object-cover rounded-xl w-full h-48"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{product.nombre}</h3>
                <p className="text-gray-600 mb-2 line-clamp-2">{product.descripcion}</p>
                <p className="text-purple-700 font-extrabold mb-4 text-lg">{product.precio}€</p>
                <div className="flex justify-between items-center">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    product.vendido ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {product.vendido ? 'Vendido' : 'Disponible'}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(product)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  rows="3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Precio</label>
                <input
                  type="number"
                  value={formData.precio}
                  onChange={(e) => setFormData({...formData, precio: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Stock</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">URL de la imagen</label>
                <input
                  type="url"
                  value={formData.imagen}
                  onChange={(e) => setFormData({...formData, imagen: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow hover:scale-105"
                >
                  {editingProduct ? 'Guardar cambios' : 'Crear producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

MyProducts.propTypes = {
  // No hay props por ahora, pero podemos añadirlas si es necesario
};

export default MyProducts; 