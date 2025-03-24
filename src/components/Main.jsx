import React, { useState } from 'react';
import { FaUser, FaShoppingCart, FaInfoCircle } from 'react-icons/fa';

const Main = () => {
  const [currentProductSlide, setCurrentProductSlide] = useState(0);
  const [currentArticleSlide, setCurrentArticleSlide] = useState(0);

  const products = [
    { id: 1, title: "Baldur's Gate III", price: "$59.99", description: "El último gran CRPG de Larian Studios" },
    { id: 2, title: "Divinity: Original Sin 2", price: "$49.99", description: "Un clásico moderno del género" },
    { id: 3, title: "Pillars of Eternity", price: "$39.99", description: "Un homenaje a los CRPGs clásicos" },
    { id: 4, title: "Pathfinder: Wrath of the Righteous", price: "$54.99", description: "Una aventura épica" },
  ];

  const articles = [
    { id: 1, title: "Los Orígenes de los CRPGs", date: "15 de Marzo, 2024" },
    { id: 2, title: "La Edad de Oro de los CRPGs", date: "10 de Marzo, 2024" },
    { id: 3, title: "CRPGs Modernos", date: "5 de Marzo, 2024" },
    { id: 4, title: "El Futuro del Género", date: "1 de Marzo, 2024" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar con iconos */}
      <nav className="fixed top-0 right-0 z-50 p-4">
        <div className="flex gap-4">
          <button className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full transition-colors">
            <FaUser className="w-6 h-6" />
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full transition-colors">
            <FaShoppingCart className="w-6 h-6" />
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full transition-colors">
            <FaInfoCircle className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[60vh] bg-gradient-to-r from-purple-900 to-indigo-900">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Descubre el Mundo de los CRPGs</h1>
            <p className="text-xl md:text-2xl mb-8">Explora la rica historia y juegos clásicos del género</p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
              Explorar Colección
            </button>
          </div>
        </div>
      </section>

      {/* Featured Products Slider */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Productos Destacados</h2>
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ 
                transform: `translateX(-${currentProductSlide * 100}%)`,
                width: `${products.length * 100}%`
              }}
            >
              {products.map((product) => (
                <div key={product.id} className="w-full flex-shrink-0">
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow mx-2">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{product.title}</h3>
                      <p className="text-gray-600 mb-4">{product.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-purple-600">{product.price}</span>
                        <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors">
                          Añadir al Carrito
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setCurrentProductSlide(prev => Math.max(0, prev - 1))}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors"
            >
              ←
            </button>
            <button 
              onClick={() => setCurrentProductSlide(prev => Math.min(products.length - 1, prev + 1))}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors"
            >
              →
            </button>
          </div>
        </div>
      </section>

      {/* Latest Blog Posts Slider */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Últimos Artículos</h2>
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ 
                transform: `translateX(-${currentArticleSlide * 100}%)`,
                width: `${articles.length * 100}%`
              }}
            >
              {articles.map((article) => (
                <div key={article.id} className="w-full flex-shrink-0">
                  <article className="bg-white rounded-lg shadow-md overflow-hidden mx-2">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
                      <p className="text-gray-600 mb-4">Un viaje a través del tiempo explorando la evolución de los juegos de rol por computadora...</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{article.date}</span>
                        <span className="mx-2">•</span>
                        <span>5 min de lectura</span>
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setCurrentArticleSlide(prev => Math.max(0, prev - 1))}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors"
            >
              ←
            </button>
            <button 
              onClick={() => setCurrentArticleSlide(prev => Math.min(articles.length - 1, prev + 1))}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors"
            >
              →
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-purple-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Mantente Informado</h2>
          <p className="text-xl mb-8">Suscríbete para recibir las últimas noticias y ofertas especiales</p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Tu correo electrónico"
              className="flex-1 px-4 py-2 rounded-lg text-gray-900"
            />
            <button className="bg-white text-purple-900 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Suscribirse
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Main;