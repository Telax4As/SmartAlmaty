import { supabase } from "../lib/supabase";
import { fetchAirData } from "./airApi";

// Вспомогательная функция для дрейфа значений
const drift = (val: number, step: number = 1, min = 0, max = 100) => {
  const change = (Math.random() * (step * 2) - step);
  return Math.max(min, Math.min(max, parseFloat((val + change).toFixed(1))));
};

export const runSyncScenario = async () => {
  // 1. Загружаем текущие значения из Supabase
  const { data: current } = await supabase.from('city_metrics').select('category, value');
  const getVal = (c: string) => current?.find(m => m.category === c)?.value || 0;

  // 2. Получаем реальный воздух (без рандома, если API живое)
  const air = await fetchAirData();

  // 3. Конфиг обновлений с "алматинскими" базовыми значениями
  const updates = [
    { cat: 'ecology', val: air.aqi !== null ? air.aqi : drift(getVal('ecology') || 60, 2, 20, 250), unit: 'AQI' },
    { cat: 'transport', val: drift(getVal('transport') || 4, 0.7, 1, 10), unit: 'баллов' },
    { cat: 'utility', val: drift(getVal('utility') || 96, 0.5, 80, 100), unit: '%' },
    { cat: 'infrastructure', val: Math.round(drift(getVal('infrastructure') || 12, 2, 3, 40)), unit: 'объекта' },
    { cat: 'security', val: drift(getVal('security') || 92, 0.2, 85, 100), unit: '%' },
    { cat: 'social', val: Math.round(drift(getVal('social') || 70, 5, 10, 100)), unit: '%' }
  ];

  // 4. Цикл обновления базы данных
  for (const item of updates) {
    let status: 'success' | 'warning' | 'danger' = 'success';
    const val = Number(item.val);

    // Логика статусов (теперь 94% ЖКХ точно будет Success)
    if (item.cat === 'transport') {
      if (val >= 8) status = 'danger';
      else if (val >= 5) status = 'warning';
    } 
    else if (item.cat === 'ecology') {
      if (val >= 100) status = 'danger';
      else if (val >= 50) status = 'warning';
    }
    else if (item.cat === 'utility' || item.cat === 'security') {
      if (val < 60) status = 'danger';
      else if (val < 85) status = 'warning';
    }
    else if (item.cat === 'social' || item.cat === 'infrastructure') {
      if (val > 85 || (item.cat === 'infrastructure' && val > 25)) status = 'warning';
    }

    console.log(`[SYNC] ${item.cat}: ${val} -> ${status}`);

    // ЗАПИСЬ В БАЗУ (без ai_report)
    await supabase.from('city_metrics').update({
      value: val,
      status: status,
      updated_at: new Date().toISOString()
    }).eq('category', item.cat);
  }
};

// Новая функция для вызова ИИ ТОЛЬКО на странице деталей
export const refreshSingleAiReport = async (category: string, value: number, unit: string) => {
  // Мы импортируем generateCityReport здесь или внутри функции, чтобы не тянуть в общий цикл
  const { generateCityReport } = await import("./gemini");
  const report = await generateCityReport(category, value, unit);
  
  await supabase.from('city_metrics').update({
    ai_report: report
  }).eq('category', category);
  
  return report;
};