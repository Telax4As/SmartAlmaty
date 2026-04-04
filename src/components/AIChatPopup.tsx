import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { generateChatResponse } from '../services/gemini';
// ИМПОРТИРУЕМ функцию получения данных
import { getLatestCityStats } from '../services/syncService'; 

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export default function AIChatPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Привет! Я ИИ-помощник Алматы. Чем могу помочь?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      // 1. ПОЛУЧАЕМ свежие цифры из синк-сервиса (те, что ушли в Supabase)
      const currentStats = getLatestCityStats();
      console.log("Текущие данные из Supabase:", currentStats);

      // 2. ПЕРЕДАЕМ их вторым аргументом в Gemini
      const aiResponse = await generateChatResponse(userText, currentStats);
      
      setMessages(prev => [
        ...prev, 
        { role: 'ai', text: aiResponse || "Извините, не удалось получить ответ от системы." }
      ]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "Произошла ошибка связи." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000]">
      {isOpen && (
        <div className="bg-white shadow-2xl rounded-2xl w-80 h-[450px] mb-4 border border-slate-200 flex flex-col overflow-hidden shadow-indigo-500/20">
          <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
            <span className="font-bold flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              ИИ-ассистент Алматы
            </span>
            <X className="cursor-pointer" onClick={() => setIsOpen(false)} />
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span className="text-[10px] text-slate-400">Генерирую ответ...</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-white border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ваш вопрос..."
                className="flex-1 p-2 bg-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-black"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all"
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>
    </div>
  );
}