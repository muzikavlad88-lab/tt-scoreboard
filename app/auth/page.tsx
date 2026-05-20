'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic'; // Імпортуємо динамічне завантаження Next.js

// 1. Виносимо весь інтерфейс та логіку форми в окремий внутрішній компонент
function AuthFormComponent() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { nickname: nickname || email.split('@')[0] }
          }
        });
        if (error) throw error;
        alert('Реєстрація успішна! Тепер ви можете увійти.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/');
        router.refresh();
      }
    } catch (error: any) {
      alert(`Помилка: ${error.message || 'Щось пішло не так'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 select-none touch-manipulation">
      <div className="w-full max-w-sm bg-zinc-950 border border-white/5 p-6 rounded-2xl shadow-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-wider uppercase text-white">
            {isSignUp ? 'Реєстрація' : 'Вхід'}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Система автоматичних матчів</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <input 
              type="text" 
              placeholder="Твій нікнейм" 
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 h-12"
              required={isSignUp}
            />
          )}

          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 h-12"
            required
          />

          <input 
            type="password" 
            placeholder="Пароль" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 h-12"
            required
          />

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold h-12 rounded-xl transition active:scale-95 flex items-center justify-center"
          >
            {loading ? 'Завантаження...' : isSignUp ? 'Зареєструватися' : 'Увійти'}
          </button>
        </form>

        <div className="text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition"
          >
            {isSignUp ? 'Вже є акаунт? Увійти' : 'Немає акаунту? Створити'}
          </button>
        </div>
      </div>
    </div>
  );
}

// 2. ГОЛОВНИЙ ЕКСПОРТ СТОРІНКИ: повністю відключаємо SSR для цього компонента
const AuthPage = dynamic(() => Promise.resolve(AuthFormComponent), {
  ssr: false,
});

export default AuthPage;