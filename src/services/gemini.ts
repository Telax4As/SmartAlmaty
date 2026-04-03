import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY 
});

export const generateCityReport = async (category: string, value: number, unit: string) => {
  const prompt = `Ты — ИИ-аналитик ситуационного центра Алматы. Проанализируй данные:
  Категория: ${category}
  Значение: ${value} ${unit}
  
  Дай краткий отчет строго по пунктам:
  1. Текущее состояние
  2. Уровень критичности
  3. Рекомендация для акимата.
  
  Пиши профессионально, на русском языке.`;

  try {
    // Используем новый синтаксис как на твоем скрине
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Новейшая модель
      contents: prompt,
    });

    return response.text; // В новом SDK текст берется напрямую через .text
  } catch (error) {
    console.error("Gemini 3 Error:", error);
    return "Ошибка генерации отчета новым ИИ.";
  }
};