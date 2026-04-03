import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RefreshCw, Car, Cloud, Droplets, Shield, Construction, Users } from 'lucide-react';
import { CityMap } from '../components/CityMap';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { runSyncScenario } from '../services/syncService';
import type { CityMetric } from '../types';

const icons = { 
  transport: Car, 
  ecology: Cloud, 
  utility: Droplets, 
  security: Shield,
  infrastructure: Construction,
  social: Users
};

interface DashboardProps {
  metrics: CityMetric[];
  onSync: () => Promise<void>;
  isLoading: boolean;
  setLoading: (val: boolean) => void;
}

export default function Dashboard({ 
  metrics, 
  onSync, 
  isLoading, 
  setLoading,
}: DashboardProps) {
  const navigate = useNavigate();
  
  const avgHealth = useMemo(() => {
    if (!metrics.length) return 0;
    const total = metrics.reduce((acc, m) => {
      const weight = m.status === 'success' ? 100 : m.status === 'warning' ? 60 : 20;
      return acc + weight;
    }, 0);
    return Math.round(total / metrics.length);
  }, [metrics]);

  const getChartData = (value: any) => {
    const numValue = typeof value === 'string' 
      ? parseFloat(value.replace(/[^0-9.]/g, '')) 
      : value;
    
    if (isNaN(numValue) || numValue === null) return [];
    
    return [
      { time: "04:00", val: numValue * 0.8 },
      { time: "08:00", val: numValue * 0.95 },
      { time: "12:00", val: numValue * 1.1 },
      { time: "16:00", val: numValue * 0.9 },
      { time: "20:00", val: numValue },
    ];
  };

  const handleSync = async () => {
    setLoading(true);
    try {
      await runSyncScenario(); 
      await onSync(); 
    } catch (error) {
      console.error("Sync error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto p-6 pt-24 relative z-10 transition-colors duration-300">
      
      <section id="hero-section" className="flex flex-col md:flex-row justify-between items-center mb-10 p-6 md:p-8 rounded-2xl shadow-sm border bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700">
        <div className="mb-6 md:mb-0 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white">
            Алматы: {avgHealth}%
          </h1>
          <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 mt-2">
            Общий индекс здоровья города
          </p>
        </div>
        <button 
          onClick={handleSync}
          disabled={isLoading}
          className="inline-flex flex-row items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 border-none px-8 py-4 rounded-xl shadow-md transition-all active:scale-95 text-white font-bold"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              Обновляем...
            </>
          ) : (
            <>
              <RefreshCw size={20} />
              Обновить данные
            </>
          )}
        </button>
      </section>

      <section id="city-map-section" className="h-[400px] md:h-[500px] mb-10 rounded-2xl overflow-hidden shadow-lg border-4 border-white dark:border-slate-800 relative z-0">
        <CityMap metrics={metrics} />
      </section>

      <section id="issues-section" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((item) => {
          const IconComponent = icons[item.category as keyof typeof icons] || Shield;
          const tremorColor = 
            item.status === 'danger' ? 'red' : 
            item.status === 'warning' ? 'orange' : 
            'emerald';
          const bgColor = 
            item.status === 'danger' ? 'bg-red-50 dark:bg-red-950/20' :
            item.status === 'warning' ? 'bg-orange-50 dark:bg-orange-950/20' :
            'bg-emerald-50 dark:bg-emerald-950/20';
          const textColor = 
            item.status === 'danger' ? 'text-red-600 dark:text-red-400' :
            item.status === 'warning' ? 'text-orange-600 dark:text-orange-400' :
            'text-emerald-600 dark:text-emerald-400'; 
          const chartColor = 
            item.status === 'danger' ? '#dc2626' :
            item.status === 'warning' ? '#ea580c' :
            '#10b981';

          return (
            <motion.div 
              key={item.id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              whileHover={{ y: -5 }}
            >
              <div 
                className="rounded-lg cursor-pointer p-5 transition-all duration-300 border ring-1 bg-white ring-slate-200 dark:bg-slate-800 dark:ring-slate-700 hover:ring-indigo-500 dark:hover:ring-indigo-400"
                onClick={() => navigate(`/details/${item.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <IconComponent size={22} className="text-indigo-600 dark:text-indigo-400" />
                  <span className={`px-3 py-1 text-xs font-bold uppercase rounded ${bgColor} ${textColor}`}>
                    {item.status.toUpperCase()}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-500 dark:text-slate-300 truncate mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-900 dark:text-white text-2xl font-bold mb-4">
                  {item.value} {item.unit}
                </p>
                
                <div className="h-24 -mx-2 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getChartData(item.value)}>
                      <defs>
                        <linearGradient id={`color-${item.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartColor} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" hide={true} />
                      <YAxis hide={true} />
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <Tooltip contentStyle={{ backgroundColor: 'transparent', border: 'none' }} />
                      <Area type="monotone" dataKey="val" stroke={chartColor} fillOpacity={1} fill={`url(#color-${item.id})`} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Обновлено: {new Date(item.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </section>
    </main>
  );
}