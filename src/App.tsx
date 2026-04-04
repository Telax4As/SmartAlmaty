import { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Details from './pages/Details';
import AIChatPopup from './components/AIChatPopup';
import type { CityMetric } from './types';
import Login from './pages/Login';

export default function App() {
  const [metrics, setMetrics] = useState<CityMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const loadData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('city_metrics')
        .select('*')
        .order('category');
      
      if (error) throw error;
      if (data) setMetrics(data);
    } catch (err) {
      console.error("Ошибка загрузки:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading && metrics.length === 0) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white dark:bg-slate-900 transition-colors">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-slate-500 dark:text-slate-400 animate-pulse">Загрузка SmartAlmaty...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <Header isDark={isDark} setIsDark={setIsDark} />
      
      <div className="relative">
        <Routes>
          <Route 
            path="/" 
            element={
              <Dashboard 
                metrics={metrics} 
                onSync={loadData} 
                isLoading={syncing} 
                setLoading={setSyncing} 
              />
            } 
          />
          <Route path="/details/:id" element={<Details />} />
          <Route path='/login' element={<Login />}></Route>
        </Routes>
      </div>

      <AIChatPopup />
    </div>
  );
}