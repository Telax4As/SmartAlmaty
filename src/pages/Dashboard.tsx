import React, { useMemo } from 'react';
import { Title, Card, Metric, Text, Badge, AreaChart, Button } from '@tremor/react';
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
          <Title className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white">
            Алматы: {avgHealth}%
          </Title>
          <Text className="text-base md:text-lg text-slate-500 dark:text-slate-400">
            Общий индекс здоровья города
          </Text>
        </div>
        <Button 
          size="lg" 
          icon={RefreshCw} 
          loading={isLoading} 
          onClick={handleSync}
          className="!inline-flex !flex-row !items-center !justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 border-none px-8 py-4 rounded-xl shadow-md transition-all active:scale-95"
        >
          Обновить данные
        </Button>
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

          return (
            <motion.div 
              key={item.id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              whileHover={{ y: -5 }}
            >
              <Card 
                className="rounded-[10px] cursor-pointer p-5 transition-all duration-300 border-none ring-1 bg-white ring-slate-200 dark:bg-slate-800 dark:ring-slate-700 hover:ring-indigo-500 dark:hover:ring-indigo-400" 
                onClick={() => navigate(`/details/${item.id}`)}
              >
                <div className="flex justify-between items-start">
                  <IconComponent size={22} className="text-indigo-600 dark:text-indigo-400" />
                  <Badge 
                    color={tremorColor} 
                    className="p-2 text-xs font-bold uppercase rounded-[5px]"
                  >
                    {item.status.toUpperCase()}
                  </Badge>
                </div>
                
                <Text className="mt-4 text-[23px] font-[900] text-slate-500 dark:text-slate-300 truncate">
                  {item.title}
                </Text>
                <Metric className="text-slate-900 dark:text-white text-2xl font-bold">
                  {item.value} {item.unit}
                </Metric>
                
                <div className="h-24 -mx-2 mt-2 overflow-hidden">
                  <AreaChart
                    data={getChartData(item.value)}
                    index="time"
                    categories={["val"]}
                    colors={[tremorColor]}
                    showTooltip={false}
                    showXAxis={false}
                    showYAxis={false}
                    showLegend={false}
                    showGridLines={false}
                  />
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <Text className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Обновлено: {new Date(item.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </Text>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </section>
    </main>
  );
}