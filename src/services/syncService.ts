import { supabase } from "../lib/supabase";
import { fetchAirData } from "./airApi";
import { generateCityReport } from "./gemini";

export const runSyncScenario = async () => {
  // 1. Получаем данные по воздуху
  const air = await fetchAirData();

  // 2. Сценарии (Транспорт и ЖКХ)
  const scenarios = [
    { transport: 3, utility: 100, tS: 'success', uS: 'success' },
    { transport: 9, utility: 80, tS: 'danger', uS: 'warning' },
    { transport: 7, utility: 0, tS: 'warning', uS: 'danger' },
  ];
  const scene = scenarios[Math.floor(Math.random() * scenarios.length)];

  const updates = [
    { cat: 'ecology', val: air.aqi, unit: 'AQI', status: air.aqi > 100 ? 'warning' : 'success' },
    { cat: 'transport', val: scene.transport, unit: 'баллов', status: scene.tS },
    { cat: 'utility', val: scene.utility, unit: '%', status: scene.uS }
  ];

  for (const item of updates) {
    // Генерируем новый отчет через ИИ
    const newReport = await generateCityReport(item.cat, item.val, item.unit);

    // Обновляем Supabase
    await supabase.from('city_metrics').update({
      value: item.val,
      status: item.status,
      ai_report: newReport,
      updated_at: new Date().toISOString()
    }).eq('category', item.cat);
  }
};