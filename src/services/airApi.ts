export const fetchAirData = async () => {
  try {
    const response = await fetch('https://api.air.org.kz/api/city/average');
    
    if (!response.ok) {
      throw new Error(`Ошибка сети: ${response.status}`);
    }

    const data = await response.json();

    // Логируем для отладки (потом можно убрать)
    console.log("Данные AirKaz:", data);

    return {
      pm25: data.pm25 || 0,
      pm10: data.pm10 || 0,
      aqi: data.aqi || 0,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Ошибка при получении данных воздуха:", error);
    // Возвращаем дефолтные значения, чтобы приложение не упало
    return {
      pm25: 0,
      pm10: 0,
      aqi: 0,
      error: true
    };
  }
};