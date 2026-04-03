import { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Details from './pages/Details';
import AIChatPopup from './components/AIChatPopup';
import type { CityMetric } from './types';

export default function App() {
  const [metrics, setMetrics] = useState<CityMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isDark, setIsDark] = useState(false); // Тема теперь тут

  // Синхронизация темы с HTML тегом
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
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

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      {/* Передаем стейт темы в Хедер */}
      <Header isDark={isDark} setIsDark={setIsDark} />
      
      <div className="pt-4">
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
        </Routes>
      </div>

      <AIChatPopup />
    </div>
  );
}