import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  setIsDark: (val: boolean) => void;
}

export default function Header({ isDark, setIsDark }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
          Цифровой Акимат
        </Link>

        <nav className="hidden md:flex space-x-8 font-medium">
          <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Мониторинг</Link>
          <a href="#" className="hover:text-indigo-600 transition">Карта</a>
          <a href="#" className="hover:text-indigo-600 transition">Проблемы</a>
        </nav>

        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-400"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
}