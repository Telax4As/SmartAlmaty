import { GoogleGenAI } from "@google/genai";



const ai = new GoogleGenAI({

  apiKey: import.meta.env.VITE_GEMINI_API_KEY 

});

const ALMATY_TZ = "Asia/Almaty";

function getAlmatyTimeContext(now: Date): { nowLine: string; tomorrowLine: string; partOfDayRu: string } {
  const nowLine = now.toLocaleString("ru-RU", {
    timeZone: ALMATY_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const hour = parseInt(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: ALMATY_TZ,
      hour: "numeric",
      hour12: false,
    })
      .formatToParts(now)
      .find((p) => p.type === "hour")?.value ?? "12",
    10
  );
  let partOfDayRu: string;
  if (hour >= 23 || hour < 5) partOfDayRu = "сейчас ночь";
  else if (hour < 12) partOfDayRu = "сейчас утро";
  else if (hour < 17) partOfDayRu = "сейчас день";
  else partOfDayRu = "сейчас вечер";

  const ymd = now.toLocaleDateString("en-CA", { timeZone: ALMATY_TZ });
  const [y, m, d] = ymd.split("-").map(Number);
  const nextCivil = new Date(Date.UTC(y, m - 1, d + 1, 12, 0, 0));
  const tomorrowLine = nextCivil.toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return { nowLine, tomorrowLine, partOfDayRu };
}



export const generateChatResponse = async (message: string, dbStats?: any) => {


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
  Если данных нет, дай общий совет по улучшению ситуации в городе, не используя конкретные цифры. НЕ придумывай данные, которых нет. НЕ делай вид, что у тебя есть доступ к данным, если их нет. НЕ говори "по данным из базы", если данных нет. НЕ используй шаблон "на основе данных из базы" без данных. БЕЗ звездочек.
  Если вопрос не по теме, вежливо откажись отвечать, ссылаясь на свою специализацию в анализе городских показателей.
  Если вопрос требует мнения, дай его, но подчеркни, что это мнение ИИ, а не факт. НЕ используй шаблон "на мой взгляд" или "я считаю" — просто давай мнение как факт, но с оговоркой, что это ИИ-мнение. НЕ приписывай себе человеческие качества или опыт. НЕ говори, что ты "анализировал данные", если данных нет. НЕ используй фразы типа "согласно данным", если данных нет. НЕ делай вид, что у тебя есть доступ к данным, если их нет. НЕ говори "по данным из базы", если данных нет. НЕ используй шаблон "на основе данных из базы" без данных. БЕЗ звездочек.
  Если вопрос не по теме, не нужно давать данные с бд, и не нужно говорить твои задачии и тд, просто говоришь что это не твоя специализация и не можешь ответить. НЕ используй шаблон "на мой взгляд" или "я считаю" — просто давай мнение как факт, но с оговоркой, что это ИИ-мнение. НЕ приписывай себе человеческие качества или опыт. НЕ говори, что ты "анализировал данные", если данных нет. НЕ используй фразы типа "согласно данным", если данных нет. НЕ делай вид, что у тебя есть доступ к данным, если их нет. НЕ говори "по данным из базы", если данных нет. НЕ используй шаблон "на основе данных из базы" без данных. БЕЗ звездочек.
  

  НЕ используй символы "*" (звездочки) в ответе.`;



  try {

    console.log(cityContext)


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

export const generate24hForecast = async (

  category: string,

  value: number,

  unit: string,

  title: string

) => {

  const { nowLine, tomorrowLine, partOfDayRu } = getAlmatyTimeContext(new Date());

  const prompt = `Ты аналитик ситуационного центра Алматы. Часовой пояс города: Алматы (${ALMATY_TZ}).

Показатель: «${title}» (код: ${category}), текущее значение: ${value} ${unit}.

ФАКТИЧЕСКОЕ ВРЕМЯ В АЛМАТЫ: ${nowLine}. ${partOfDayRu} — учитывай это: не пиши про «вечерний час» или «к вечеру», если сейчас ночь или утро; не приписывай ухудшение «вечером» без причины.

ЗАДАЧА: дай прогноз именно на ЗАВТРАШНИЙ КАЛЕНДАРНЫЙ ДЕНЬ — ${tomorrowLine} (сутки с 00:00 до 23:59 по Алматы), а не «первые 24 часа от сейчас».

Правила:
- Оцени ожидаемый диапазон или тренд значения на завтра; допустимы стабилизация, небольшое улучшение или ухудшение — только если это логично для категории «${category}» и текущего ${value} ${unit}.
- Не используй шаблон «к вечеру станет хуже» без обоснования. Для транспорта не ссылайся на вечерний час пик в прогнозе на завтра, если контекст времени — ночь.
- Кратко опиши, как завтрашние сутки (утро/день/вечер по Алматы) могут повлиять на показатель — без выдуманного постоянного ухудшения.

Формат ответа (каждый пункт с новой строки, маркер •):

• Прогноз на завтра (${tomorrowLine}): …

• Сценарий / риски: …

• Рекомендация дежурной службе: …

Пиши по-русски, без звёздочек, 5–10 коротких фраз.`;



  try {

    const response = await ai.models.generateContent({

      model: "gemini-3.1-flash-lite-preview",

      contents: prompt,

    });

    return response.text ?? "";

  } catch (error) {

    console.error("Forecast Gemini Error:", error);

    const { tomorrowLine, partOfDayRu } = getAlmatyTimeContext(new Date());
    const est = Math.round(value * 1.05 * 10) / 10;

    return `• Прогноз на завтра (${tomorrowLine}): ориентировочно около ${est} ${unit} (оценка без API; ${partOfDayRu}).\n• Сценарий / риски: возможна стабилизация или умеренное колебание — без автоматического ухудшения к вечеру.\n• Рекомендация дежурной службе: сопоставить с фактическим временем суток и держать показатель на контроле.`;

  }

};

