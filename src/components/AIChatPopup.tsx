import { MessageSquare, X } from 'lucide-react';
import { useState } from 'react';

export default function AIChatPopup() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="fixed bottom-6 right-6 z-[1000]">
      {isOpen && (
        <div className="bg-white shadow-2xl rounded-2xl w-80 h-96 mb-4 border border-slate-200 p-4 flex flex-col">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="font-bold text-gray-800">Чат с ИИ</span>
            <X className="cursor-pointer" onClick={() => setIsOpen(false)} />
          </div>
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm italic">
            Здесь будет история чата...
          </div>
        </div>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
      >
        <MessageSquare />
      </button>
    </div>
  );
}