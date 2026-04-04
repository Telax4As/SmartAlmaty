import { Sun, Moon, LogIn } from 'lucide-react';
import { animate, motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  isDark: boolean;
  setIsDark: (val: boolean) => void;
}

export default function Header({ isDark, setIsDark }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const scrollToTop = () => {
    const isStopped = { value: false };

    const animation = animate(window.scrollY, 0, {
      type: "spring",
      stiffness: 150,
      damping: 30,
      onUpdate: (latest) => {
        if (!isStopped.value) window.scrollTo(0, latest);
      },
      onComplete: () => {
        isStopped.value = true;
        window.removeEventListener('wheel', stopAnimation);
      }
    });

    const stopAnimation = () => {
      isStopped.value = true;
      animation.stop();
      window.removeEventListener('wheel', stopAnimation);
    };

    window.addEventListener('wheel', stopAnimation, { passive: true });
  };
  
  const scrollToSection = (id: string) => {
    // Если мы не на главной, сначала идем на главную
    if (location.pathname !== '/') {
      navigate('/');
      // Даем время на переход, потом скроллим
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      const offset = 110; 
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      const isStopped = { value: false };

      const animation = animate(window.scrollY, offsetPosition, {
        type: "spring",
        stiffness: 150,
        damping: 30,
        onUpdate: (latest) => {
          if (!isStopped.value) window.scrollTo(0, latest);
        },
        onComplete: () => {
          isStopped.value = true;
          window.removeEventListener('wheel', stopAnimation);
        }
      });

      const stopAnimation = () => {
        isStopped.value = true;
        animation.stop();
        window.removeEventListener('wheel', stopAnimation);
      };

      window.addEventListener('wheel', stopAnimation, { passive: true });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-md bg-white/95 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 px-6 py-4 transition-all duration-300 shadow-sm dark:shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Логотип */}
        <Link 
          to="/" 
          onClick={(e) => {
            if (location.pathname === '/') {
              e.preventDefault();
              scrollToTop();
            }
          }}
          className="text-xl md:text-2xl font-black tracking-tight text-indigo-600 dark:text-indigo-400 hover:opacity-80 transition active:scale-95"
        >
          SmartAlmaty
        </Link>

        {/* Навигация */}
        <nav className="hidden md:flex items-center space-x-8 font-semibold text-slate-600 dark:text-slate-300">
          <button onClick={() => scrollToSection('hero-section')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
            Мониторинг
          </button>
          <button onClick={() => scrollToSection('city-map-section')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
            Карта
          </button>
          <button onClick={() => scrollToSection('issues-section')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
            Проблемы
          </button>
        </nav>

        {/* Действия */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDark(!isDark)}
            className="relative p-2.5 h-10 w-10 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 hover:ring-2 ring-indigo-500/50 transition-all text-slate-600 dark:text-slate-400 active:scale-90 flex items-center justify-center"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isDark ? "dark" : "light"}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-indigo-600" />}
              </motion.div>
            </AnimatePresence>
          </button>

          <button 
            className="flex gap-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold px-5 py-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 bg-white"
          >
            <Link to="/login" className="flex items-center gap-2"       >
                <LogIn size={18} />
                Войти
            </Link>
          </button>
        </div>
      </div>
    </header>
  );
}