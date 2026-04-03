import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AreaChart, Card, Title, Button } from '@tremor/react';
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
    <div className="max-w-7xl mx-auto p-6">
      <Button variant="light" icon={ArrowLeft} onClick={() => navigate('/')} className="mb-6">Назад</Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Card>
          <Title>{metric.title}: История изменений</Title>
          <AreaChart className="h-72 mt-4" data={chartData} index="month" categories={["value"]} colors={["indigo"]} />
        </Card>

        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <Card className="h-full bg-slate-900 text-white border-none">
            <Title className="text-white">Аналитика ИИ (Gemini 3 Flash)</Title>
            <div className="mt-6 space-y-6 whitespace-pre-line leading-relaxed opacity-90">
              {metric.ai_report}
            </div>
            <div className="mt-10 pt-6 border-t border-slate-700">
              <Button color="red" icon={Phone} className="w-full">Связаться с дежурной службой</Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}