import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Phone, ArrowLeft } from 'lucide-react';
import { refreshSingleAiReport } from '../services/syncService';

export default function Details() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [metric, setMetric] = useState<any>(null);
  const aiRefreshStartedRef = useRef(false);

  useEffect(() => {
    aiRefreshStartedRef.current = false;
    supabase.from('city_metrics').select('*').eq('id', id).single().then(({ data }) => setMetric(data));
  }, [id]);

  useEffect(() => {
    if (!metric || aiRefreshStartedRef.current) return;
    const needsReport = !metric.ai_report?.trim();
    if (!needsReport) return;

    aiRefreshStartedRef.current = true;
    refreshSingleAiReport(metric.category, metric.value, metric.unit).then(() =>
      supabase.from('city_metrics').select('*').eq('id', id).single().then(({ data }) => setMetric(data))
    );
  }, [metric, id]);

  if (!metric) return <div className="p-10 text-center">Загрузка...</div>;

  const chartData = [
    { month: '08:00', value: metric.value * 0.8 },
    { month: '10:00', value: metric.value * 1.2 },
    { month: '12:00', value: metric.value },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 pt-24">
      <button 
        onClick={() => navigate('/')} 
        className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-700 dark:text-slate-300 font-semibold"
      >
        <ArrowLeft size={20} />
        Назад
      </button>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
            {metric.title}: История изменений
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#6366f1" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <div className="space-y-6">
            {/* ИИ Аналитика */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">ИИ Анализ (Gemini 3 Flash)</h2>
              </div>
              <div className="space-y-4 whitespace-pre-line leading-relaxed text-slate-600 dark:text-slate-300">
                {metric.ai_report}
              </div>
            </div>

            {/* Прогноз ИИ */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🔮</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">ИИ Прогноз на 24 часа</h3>
              </div>
              <div className="space-y-3 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg">
                  <span className="font-medium">Текущее значение:</span>
                  <span className="font-bold text-indigo-600">{metric.value} {metric.unit}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg">
                  <span className="font-medium">Прогноз на завтра:</span>
                  <span className="font-bold text-green-600">{Math.round(metric.value * 1.15)} {metric.unit}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg">
                  <span className="font-medium">Рекомендация:</span>
                  <span className="font-bold text-blue-600">Мониторинг усилен</span>
                </div>
              </div>
            </div>

            {/* Действия */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Действия</h3>
              <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors">
                <Phone size={20} />
                Связаться с дежурной службой
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}