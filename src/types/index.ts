export interface CityMetric {
  id: string;
  category: 'transport' | 'ecology' | 'utility' | 'security';
  title: string;
  value: number;
  unit: string;
  status: 'success' | 'warning' | 'danger';
  ai_report: string;
  updated_at: string;
  lat: number;
  lng: number;
  trend_data?: number[]; // Для графика Sparkline
}