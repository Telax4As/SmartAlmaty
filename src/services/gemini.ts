import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY 
});

// Добавляем второй аргумент dbStats для данных из Supabase
export const generateChatResponse = async (message: string, dbStats?: any) => {
  // Формируем строку с данными из БД для промпта
  const cityContext = dbStats ? `
  ДАННЫЕ ИЗ БАЗЫ ДАННЫХ (SUPABASE):
  - Экология: ${dbStats.ecology || 'н/д'}
  - Трафик: ${dbStats.transport || 'н/д'} баллов
  - Безопасность: ${dbStats.security || 'н/д'}%
  - ЖКХ: ${dbStats.utility || 'н/д'}%
  - Инфраструктура: ${dbStats.infrastructure || 'н/д'}
  - Социальный индекс: ${dbStats.social || 'н/д'}%
  ` : "Данные из базы временно недоступны.";

  const prompt = `Ты — ИИ-ассистент ситуационного центра Алматы. 
  
  ${cityContext}

  Пользователь спрашивает: "${message}"
  
  Дай полезный, краткий ответ на русском языке на основе данных из базы выше. Будь профессиональным.
  НЕ используй символы "*" (звездочки) в ответе.`;

  try {
    console.log(cityContext)
    // Твоя рабочая структура запроса
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Chat Gemini Error:", error);
    return "Извините, произошла ошибка при обработке запроса.";
  }
};

export const generateCityReport = async (category: string, value: number, unit: string) => {
  const prompt = `Ты — ИИ-аналитик ситуационного центра Алматы. Проанализируй данные:
  Категория: ${category}
  Значение: ${value} ${unit}
  
  Дай краткий отчет строго по пунктам:
  1. Текущее состояние
  2. Уровень критичности
  3. Рекомендация для акимата.
  
  Пиши профессионально, на русском языке. БЕЗ звездочек.`;

  try {
    // Твоя рабочая структура запроса
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    
    const mockReports: Record<string, string> = {
      ecology: `1. Текущее состояние: Уровень AQI ${value}. 2. Уровень критичности: ${value > 100 ? 'Высокий' : 'Нормальный'}. 3. Рекомендация: Усилить мониторинг.`,
      transport: `1. Текущее состояние: Загруженность ${value} баллов. 2. Уровень критичности: ${value >= 8 ? 'Критический' : 'Средний'}. 3. Рекомендация: Оптимизировать трафик.`,
      utility: `1. Текущее состояние: Эффективность ЖКХ ${value}%. 2. Рекомендация: Плановая модернизация.`,
      infrastructure: `1. Текущее состояние: ${value} объектов требуют внимания. 2. Рекомендация: Профилактика.`,
      security: `1. Текущее состояние: Безопасность ${value}%. 2. Рекомендация: Усиление патрулей.`,
      social: `1. Текущее состояние: Индекс ${value}%. 2. Рекомендация: Социальная поддержка.`
    };
    
    return mockReports[category] || `Показатель ${category} = ${value} ${unit}. Требуется анализ.`;
  }
};