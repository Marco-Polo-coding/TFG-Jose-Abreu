import React, { useState, useEffect } from 'react';
import { FaUsers, FaBox, FaNewspaper, FaChartPie } from 'react-icons/fa';
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
  'bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 flex flex-col justify-between min-h-[170px]';
const iconCircle =
  'flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 shadow text-xl mb-3';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_users: 0,
    total_products: 0,
    total_articles: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulación de cambios porcentuales (puedes adaptar a tus datos reales)
  const percent = {
    users: 12.5,
    products: -3.2,
    articles: 8.1,
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No hay token de autenticación');
        }

        const response = await fetch('http://127.0.0.1:8000/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al obtener estadísticas');
        }

        const data = await response.json();
        setStats(data);
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
    labels: ['Usuarios', 'Productos', 'Artículos'],
    datasets: [
      {
        label: 'Cantidad',
        data: [stats.total_users, stats.total_products, stats.total_articles],
        backgroundColor: [
          'rgba(139,92,246,0.7)', // purple-500
          'rgba(59,130,246,0.7)', // blue-500
          'rgba(34,197,94,0.7)',  // green-500
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
    labels: ['Usuarios', 'Productos', 'Artículos'],
    datasets: [
      {
        data: [stats.total_users, stats.total_products, stats.total_articles],
        backgroundColor: [
          'rgba(139,92,246,0.8)',
          'rgba(59,130,246,0.8)',
          'rgba(34,197,94,0.8)',
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
      <div className="flex items-center justify-center h-96">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-gray-100 dark:bg-gray-950 py-10 px-2 md:px-8">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white text-center mb-10 tracking-tight">
        Dashboard
      </h1>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Usuarios */}
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <span className={`${iconCircle} border-purple-400 text-purple-600`}>
              <FaUsers />
            </span>
            <div>
              <div className="text-xs text-gray-500">Total Usuarios</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_users}</div>
            </div>
          </div>
          <div className="flex items-center mt-4">
            <span className={`text-sm font-semibold ${percent.users >= 0 ? 'text-green-500' : 'text-red-500'}`}>{percent.users >= 0 ? '+' : ''}{percent.users}%</span>
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
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <span className={`${iconCircle} border-blue-400 text-blue-600`}>
              <FaBox />
            </span>
            <div>
              <div className="text-xs text-gray-500">Total Productos</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_products}</div>
            </div>
          </div>
          <div className="flex items-center mt-4">
            <span className={`text-sm font-semibold ${percent.products >= 0 ? 'text-green-500' : 'text-red-500'}`}>{percent.products >= 0 ? '+' : ''}{percent.products}%</span>
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
        <div className={cardClass}>
          <div className="flex items-center gap-3">
            <span className={`${iconCircle} border-green-400 text-green-600`}>
              <FaNewspaper />
            </span>
            <div>
              <div className="text-xs text-gray-500">Total Artículos</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_articles}</div>
            </div>
          </div>
          <div className="flex items-center mt-4">
            <span className={`text-sm font-semibold ${percent.articles >= 0 ? 'text-green-500' : 'text-red-500'}`}>{percent.articles >= 0 ? '+' : ''}{percent.articles}%</span>
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
        {/* Resumen General (Donut) */}
        <div className={cardClass + ' col-span-1 md:col-span-2 lg:col-span-1 flex flex-col items-center justify-center'}>
          <div className="w-full flex flex-col items-center">
            <div className="text-xs text-gray-500 mb-2">Distribución General</div>
            <div className="w-32 h-32">
              <Doughnut data={donutData} options={donutOptions} />
            </div>
            <div className="flex justify-center gap-4 mt-4 w-full">
              <div className="flex flex-col items-center">
                <span className="w-3 h-3 rounded-full bg-purple-500 inline-block mr-1"></span>
                <span className="text-xs text-gray-500">Usuarios</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block mr-1"></span>
                <span className="text-xs text-gray-500">Productos</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="w-3 h-3 rounded-full bg-green-500 inline-block mr-1"></span>
                <span className="text-xs text-gray-500">Artículos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfica de barras general */}
      <div className="max-w-7xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-md p-8 mb-10">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Resumen de Totales</h2>
        <div className="h-64">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <a href="/admin/users" className="flex items-center gap-2 justify-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-4 px-6 shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          <FaUsers className="text-purple-500" />
          <span className="font-medium text-gray-700 dark:text-gray-200">Gestionar Usuarios</span>
        </a>
        <a href="/admin/products" className="flex items-center gap-2 justify-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-4 px-6 shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          <FaBox className="text-blue-500" />
          <span className="font-medium text-gray-700 dark:text-gray-200">Gestionar Productos</span>
        </a>
        <a href="/admin/articles" className="flex items-center gap-2 justify-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-4 px-6 shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          <FaNewspaper className="text-green-500" />
          <span className="font-medium text-gray-700 dark:text-gray-200">Gestionar Artículos</span>
        </a>
      </div>
    </div>
  );
};

export default AdminDashboard; 