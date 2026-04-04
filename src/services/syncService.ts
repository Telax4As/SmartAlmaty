import { supabase } from "../lib/supabase";
import { fetchAirData } from "./airApi";

let latestStats: Record<string, any> = {};

export const getLatestCityStats = () => latestStats;

const initLatestStats = async () => {
  const { data } = await supabase.from('city_metrics').select('category, value');
  if (data) {
    const temp: Record<string, any> = {};
    data.forEach(item => {
      temp[item.category] = item.value;
    });
    latestStats = temp;
    console.log("ПОЛУЧЕНЫ СТАРТОВЫЕ ДАННЫЕ ДЛЯ ИИ:", latestStats);
  }
};

initLatestStats();
const drift = (val: number, step: number = 1, min = 0, max = 100) => {
  const change = (Math.random() * (step * 2) - step);
  return Math.max(min, Math.min(max, parseFloat((val + change).toFixed(1))));
};

export const runSyncScenario = async () => {
  const { data: current } = await supabase.from('city_metrics').select('category, value');
  
  const tempStats: Record<string, any> = {};
  const getVal = (c: string) => current?.find(m => m.category === c)?.value || 0;

  const air = await fetchAirData();

  const updates = [
    { cat: 'ecology', val: air.aqi !== null ? air.aqi : drift(getVal('ecology') || 60, 2, 20, 250), unit: 'AQI' },
    { cat: 'transport', val: drift(getVal('transport') || 4, 0.7, 1, 10), unit: 'баллов' },
    { cat: 'utility', val: drift(getVal('utility') || 96, 0.5, 80, 100), unit: '%' },
    { cat: 'infrastructure', val: Math.round(drift(getVal('infrastructure') || 12, 2, 3, 40)), unit: 'объекта' },
    { cat: 'security', val: drift(getVal('security') || 92, 0.2, 85, 100), unit: '%' },
    { cat: 'social', val: Math.round(drift(getVal('social') || 70, 5, 10, 100)), unit: '%' }
  ];

  for (const item of updates) {
    let status: 'success' | 'warning' | 'danger' = 'success';
    const val = Number(item.val);

    tempStats[item.cat] = val;

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

    await supabase.from('city_metrics').update({
      value: val,
      status: status,
      updated_at: new Date().toISOString()
    }).eq('category', item.cat);
  }
  latestStats = tempStats;
};

export const refreshSingleAiReport = async (category: string, value: number, unit: string) => {
  const { generateCityReport } = await import("./gemini");
  const report = await generateCityReport(category, value, unit);
  
  await supabase.from('city_metrics').update({
    ai_report: report
  }).eq('category', category);
  
  return report;
};