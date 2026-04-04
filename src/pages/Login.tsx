import React, { useState } from 'react';
import { Card, Title, Text, TextInput, Button } from '@tremor/react';
import { Info, ShieldCheck } from 'lucide-react';

const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'almaty2026') {
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--site-bg)] p-4 transition-colors duration-300">
      <Card className="max-w-md mx-auto bg-[var(--card-bg)] border-none shadow-2xl rounded-2xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-brand/10 rounded-full mb-4">
            <ShieldCheck className="w-8 h-8 text-brand" />
          </div>
          <Title className="text-2xl font-bold dark:text-white">Almaty AI City</Title>
          <Text className="text-center mt-2 dark:text-slate-400">
            Ситуационный центр управления городом. 
            Введите пароль для доступа к панели.
          </Text>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <div className="flex justify-between items-center mb-2">
              <Text className="dark:text-slate-300">Пароль доступа</Text>
              
              {/* Кнопка-подсказка i */}
              <div className="relative flex items-center group">
                <button
                  type="button"
                  onMouseEnter={() => setShowHint(true)}
                  onMouseLeave={() => setShowHint(false)}
                  className="text-slate-400 hover:text-brand transition-colors"
                >
                  <Info size={16} />
                </button>
                {showHint && (
                  <div className="absolute right-8 bottom-1 bg-slate-800 text-white text-[15px] px-2 py-1 rounded shadow-xl whitespace-nowrap border border-slate-700">
                    Пароль: almaty2026
                  </div>
                )}
              </div>
            </div>

            <TextInput
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              error={error}
              errorMessage="Неверный пароль доступа"
              className="dark:bg-slate-800  dark:border-slate-700 px-2 [&_svg]:hidden [&_button_svg]:block [&_button]:-translate-x-2 rounded-[10px] focus:ring-0 focus:ring-offset-0 focus:outline-none border-slate-200 dark:focus:border-brand"
            />
          </div>

          <Button 
            type="submit"
            className="w-full h-11 bg-brand hover:bg-brand/90 border-none rounded-lg font-bold"
          >
            Войти в систему
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
          <Text className="text-[10px] text-slate-500 uppercase tracking-widest">
            © 2026 Ситуационный Центр Алматы <br />
            Доступ ограничен
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;