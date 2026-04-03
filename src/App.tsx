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

  // 1. Инициализация темы
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme !== null) {
      return savedTheme === 'dark';
    }
    // Если нет сохраненной темы, используем системную предпочтение
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // 2. Управление темой на уровне всей страницы
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.style.backgroundColor = '#0f172a';
      root.style.color = '#f1f5f9';
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#ffffff';
      root.style.color = '#1e293b';
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
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
      <div className="h-screen w-screen flex flex-col items-center justify-center transition-colors">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-slate-500 dark:text-slate-400 animate-pulse">Загрузка SmartAlmaty...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans transition-colors duration-300">
      <Header isDark={isDark} setIsDark={setIsDark} />
      
      {/* Обертка для контента */}
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
                // isDark удалили отсюда, так как Dashboard берет тему из CSS/Tailwind
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

// Apply theme to body on mount
if (typeof document !== 'undefined') {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.style.backgroundColor = '#0f172a';
    document.documentElement.style.color = '#f1f5f9';
  }
}