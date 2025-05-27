import React, { useState, useEffect } from 'react';
import { FaUsers, FaBox, FaNewspaper, FaChartPie, FaExclamationTriangle, FaShoppingCart } from 'react-icons/fa';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import LoadingSpinner from '../LoadingSpinner';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const cardClass =
  'bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 flex flex-col justify-between min-h-[170px] border border-gray-100 dark:border-gray-800 transition-transform hover:scale-[1.025] hover:shadow-xl duration-200';
const iconCircle =
  'flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-purple-100 via-purple-50 to-white dark:from-purple-900 dark:via-gray-900 dark:to-gray-800 border-2 border-purple-300 dark:border-purple-700 shadow text-2xl mb-3';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_users: 0,
    total_products: 0,
    total_articles: 0,
    total_compras: 0
  });
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calcular porcentajes de variación mensual
  const calculatePercentChange = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const percent = {
    users: 0,
    products: 0,
    articles: 0,
    compras: 0,
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No hay token de autenticación');
        }

        // Obtener estadísticas actuales
        const statsResponse = await fetch('http://127.0.0.1:8000/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!statsResponse.ok) {
          throw new Error('Error al obtener estadísticas');
        }

        const statsData = await statsResponse.json();
        setStats(statsData);

        // Obtener estadísticas mensuales
        const monthlyResponse = await fetch('http://127.0.0.1:8000/admin/estadisticas-mensuales', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!monthlyResponse.ok) {
          throw new Error('Error al obtener estadísticas mensuales');
        }

        const monthlyData = await monthlyResponse.json();
        setMonthlyStats(monthlyData);

        // Calcular porcentajes de variación
        if (monthlyData.length >= 2) {
          const current = monthlyData[0];
          const previous = monthlyData[1];
          
          percent.users = calculatePercentChange(current.total_usuarios, previous.total_usuarios);
          percent.products = calculatePercentChange(current.total_productos, previous.total_productos);
          percent.articles = calculatePercentChange(current.total_articulos, previous.total_articulos);
          percent.compras = calculatePercentChange(current.total_compras, previous.total_compras);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Datos para la gráfica de barras
  const barData = {
    labels: ['Usuarios', 'Productos', 'Artículos', 'Compras'],
    datasets: [
      {
        label: 'Cantidad',
        data: [stats.total_users, stats.total_products, stats.total_articles, stats.total_compras],
        backgroundColor: [
          'rgba(139,92,246,0.7)', // purple-500
          'rgba(59,130,246,0.7)', // blue-500
          'rgba(34,197,94,0.7)',  // green-500
          'rgba(251,191,36,0.7)', // yellow-400
        ],
        borderRadius: 8,
        maxBarThickness: 40,
      },
    ],
  };

  const barOptions = {
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#f3f4f6' }, beginAtZero: true, ticks: { stepSize: 1 } },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  // Datos para la gráfica tipo donut (distribución)
  const donutData = {
    labels: ['Usuarios', 'Productos', 'Artículos', 'Compras'],
    datasets: [
      {
        data: [stats.total_users, stats.total_products, stats.total_articles, stats.total_compras],
        backgroundColor: [
          'rgba(139,92,246,0.8)',
          'rgba(59,130,246,0.8)',
          'rgba(34,197,94,0.8)',
          'rgba(251,191,36,0.8)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const donutOptions = {
    plugins: {
      legend: { display: true, position: 'bottom' },
    },
    cutout: '70%',
    responsive: true,
    maintainAspectRatio: false,
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-8 py-6 rounded-2xl shadow-lg flex flex-col items-center animate-fade-in">
          <FaExclamationTriangle className="text-4xl text-red-400 mb-2" />
          <p className="text-lg font-semibold mb-1">Error al obtener estadísticas</p>
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
    <div className="min-h-[80vh] bg-gray-100 dark:bg-gray-950 py-8 px-2 md:px-8 animate-slide-up">
      {/* <h1 className="text-4xl font-extrabold text-black-700 dark:text-purple-300 text-center mb-10 tracking-tight drop-shadow">Dashboard</h1> */}
      <div className="w-full flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Usuarios */}
          <div className={cardClass + ' animate-slide-up'}>
            <div className="flex items-center gap-3">
              <span className={`${iconCircle} border-purple-400 text-purple-600 dark:text-purple-300 bg-gradient-to-tr from-purple-100 to-purple-50 dark:from-purple-900 dark:to-gray-900`}>
                <FaUsers />
              </span>
              <div>
                <div className="text-xs text-gray-500">Total Usuarios</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_users}</div>
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className={`text-sm font-semibold ${percent.users >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {percent.users >= 0 ? '+' : ''}{percent.users.toFixed(1)}%
              </span>
              <span className="ml-2 text-xs text-gray-400">vs mes anterior</span>
            </div>
            <div className="h-10 mt-2">
              <Bar data={{
                labels: [''],
                datasets: [{
                  data: [stats.total_users],
                  backgroundColor: 'rgba(139,92,246,0.7)',
                  borderRadius: 6,
                  barPercentage: 0.5,
                  categoryPercentage: 0.5,
                }],
              }} options={{ plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } }, responsive: true, maintainAspectRatio: false }} height={40} />
            </div>
          </div>
          {/* Productos */}
          <div className={cardClass + ' animate-slide-up'}>
            <div className="flex items-center gap-3">
              <span className={`${iconCircle.replace('border-purple-300 dark:border-purple-700', 'border-blue-300 dark:border-blue-700')} border-blue-400 text-blue-600 dark:text-blue-300 bg-gradient-to-tr from-blue-100 to-blue-50 dark:from-blue-900 dark:to-gray-900`}>
                <FaBox />
              </span>
              <div>
                <div className="text-xs text-gray-500">Total Productos</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_products}</div>
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className={`text-sm font-semibold ${percent.products >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {percent.products >= 0 ? '+' : ''}{percent.products.toFixed(1)}%
              </span>
              <span className="ml-2 text-xs text-gray-400">vs mes anterior</span>
            </div>
            <div className="h-10 mt-2">
              <Bar data={{
                labels: [''],
                datasets: [{
                  data: [stats.total_products],
                  backgroundColor: 'rgba(59,130,246,0.7)',
                  borderRadius: 6,
                  barPercentage: 0.5,
                  categoryPercentage: 0.5,
                }],
              }} options={{ plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } }, responsive: true, maintainAspectRatio: false }} height={40} />
            </div>
          </div>
          {/* Artículos */}
          <div className={cardClass + ' animate-slide-up'}>
            <div className="flex items-center gap-3">
              <span className={`${iconCircle.replace('border-purple-300 dark:border-purple-700', 'border-green-300 dark:border-green-700')} border-green-400 text-green-600 dark:text-green-300 bg-gradient-to-tr from-green-100 to-green-50 dark:from-green-900 dark:to-gray-900`}>
                <FaNewspaper />
              </span>
              <div>
                <div className="text-xs text-gray-500">Total Artículos</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_articles}</div>
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className={`text-sm font-semibold ${percent.articles >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {percent.articles >= 0 ? '+' : ''}{percent.articles.toFixed(1)}%
              </span>
              <span className="ml-2 text-xs text-gray-400">vs mes anterior</span>
            </div>
            <div className="h-10 mt-2">
              <Bar data={{
                labels: [''],
                datasets: [{
                  data: [stats.total_articles],
                  backgroundColor: 'rgba(34,197,94,0.7)',
                  borderRadius: 6,
                  barPercentage: 0.5,
                  categoryPercentage: 0.5,
                }],
              }} options={{ plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } }, responsive: true, maintainAspectRatio: false }} height={40} />
            </div>
          </div>
          {/* Compras */}
          <div className={cardClass + ' animate-slide-up'}>
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-100 to-yellow-50 dark:from-yellow-900 dark:to-gray-900 border-2 border-yellow-400 text-yellow-600 dark:text-yellow-300 shadow text-2xl mb-3">
                <FaShoppingCart />
              </span>
              <div>
                <div className="text-xs text-gray-500">Total Compras</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_compras}</div>
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className={`text-sm font-semibold ${percent.compras >= 0 ? 'text-green-500' : 'text-red-500'}`}>{percent.compras >= 0 ? '+' : ''}{percent.compras.toFixed(1)}%</span>
              <span className="ml-2 text-xs text-gray-400">vs mes anterior</span>
            </div>
            <div className="h-10 mt-2">
              <Bar data={{
                labels: [''],
                datasets: [{
                  data: [stats.total_compras],
                  backgroundColor: 'rgba(251,191,36,0.7)',
                  borderRadius: 6,
                  barPercentage: 0.5,
                  categoryPercentage: 0.5,
                }],
              }} options={{ plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } }, responsive: true, maintainAspectRatio: false }} height={40} />
            </div>
          </div>
        </div>
      </div>
      {/* Gráficas */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribución de Contenido</h2>
          <div className="h-80">
            <Doughnut data={donutData} options={donutOptions} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Comparativa General</h2>
          <div className="h-80">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 