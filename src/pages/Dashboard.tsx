import React from 'react';
import { Button, Title, Card, Metric, Text, Badge, AreaChart } from '@tremor/react';
import { RefreshCw, Car, Cloud, Droplets, Shield } from 'lucide-react';
import { CityMap } from '../components/CityMap';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { runSyncScenario } from '../services/syncService';
import type { CityMetric } from '../types';

const icons = { transport: Car, ecology: Cloud, utility: Droplets, security: Shield };

export default function Dashboard({ metrics, onSync, isLoading, setLoading }: { 
    metrics: CityMetric[], 
    onSync: () => Promise<void>, 
    isLoading: boolean, 
    setLoading: (val: boolean) => void 
}) {
  const navigate = useNavigate();
  
  // Считаем индекс здоровья на основе статусов
  const avgHealth = Math.round(
    metrics.reduce((acc, m) => acc + (m.status === 'success' ? 100 : m.status === 'warning' ? 60 : 20), 0) / (metrics.length || 1)
  );

  const handleSync = async () => {
    setLoading(true);
    try {
      await runSyncScenario(); // Логика в сервисе (напишем следующим шагом)
      await onSync(); // Перезагрузка данных из Supabase
    } catch (error) {
      console.error("Sync error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto p-6">
      <section className="flex flex-col md:flex-row justify-between items-center mb-10 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
        <div className="mb-4 md:mb-0">
          <Title className="text-4xl font-black text-slate-800 dark:text-white">Алматы: {avgHealth}%</Title>
          <Text className="text-lg dark:text-slate-400">Общий индекс здоровья города</Text>
        </div>
        <Button 
          size="xl" 
          icon={RefreshCw} 
          loading={isLoading} 
          onClick={handleSync}
          className="bg-indigo-600 hover:bg-indigo-700 border-none"
        >
          Синхронизировать данные
        </Button>
      </section>

      {/* Карта */}
      <div className="h-[450px] mb-10 rounded-2xl overflow-hidden shadow-lg border-4 border-white dark:border-slate-800">
        <CityMap metrics={metrics} />
      </div>

      {/* Сетка карточек */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((item) => (
          <motion.div 
            key={item.id} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            whileHover={{ y: -5 }}
          >
            <Card 
              className="cursor-pointer dark:bg-slate-800 dark:ring-slate-700" 
              onClick={() => navigate(`/details/${item.id}`)}
            >
              <div className="flex justify-between items-start">
                {React.createElement(icons[item.category as keyof typeof icons] || Shield, { 
                  size: 24, 
                  className: "text-indigo-500 dark:text-indigo-400" 
                })}
                <Badge color={item.status === 'danger' ? 'red' : item.status === 'warning' ? 'orange' : 'emerald'}>
                  {item.status.toUpperCase()}
                </Badge>
              </div>
              <Text className="mt-4 dark:text-slate-400">{item.title}</Text>
              <Metric className="dark:text-white">{item.value} {item.unit}</Metric>
              
              <AreaChart
                className="h-20 mt-4"
                data={[
                  { time: "08:00", val: item.value * 0.9 },
                  { time: "12:00", val: item.value },
                ]}
                index="time"
                categories={["val"]}
                colors={["indigo"]}
                showXAxis={false}
                showYAxis={false}
                showLegend={false}
                showGridLines={false}
              />
              
              <Text className="mt-4 text-xs text-slate-400">
                Обновлено: {new Date(item.updated_at).toLocaleTimeString()}
              </Text>
            </Card>
          </motion.div>
        ))}
      </div>
    </main>
  );
}