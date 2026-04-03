import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Phone, ArrowLeft } from 'lucide-react';

export default function Details() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [metric, setMetric] = useState<any>(null);

  useEffect(() => {
    supabase.from('city_metrics').select('*').eq('id', id).single().then(({ data }) => setMetric(data));
  }, [id]);

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
          <div className="rounded-lg border border-slate-700 bg-slate-900 text-white p-6 h-full">
            <h2 className="text-2xl font-bold text-white mb-6">Аналитика ИИ (Gemini 3 Flash)</h2>
            <div className="space-y-6 whitespace-pre-line leading-relaxed opacity-90 mb-10">
              {metric.ai_report}
            </div>
            <div className="pt-6 border-t border-slate-700">
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