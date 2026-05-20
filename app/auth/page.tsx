'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import dynamicImport from 'next/dynamic';

function AuthFormComponent() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [realName, setRealName] = useState('');
  const [realSurname, setRealSurname] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Реєстрація: передаємо нікнейм, ім'я та прізвище в metadata користувача
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { 
              nickname: nickname.trim(),
              real_name: realName.trim(),
              real_surname: realSurname.trim()
            }
          }
        });
        if (error) throw error;
        alert('Реєстрація успішна! Тепер ви можете увійти під своїми даними.');
        setIsSignUp(false);
      } else {
        // Вхід
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
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 select-none touch-manipulation">
      <div className="w-full max-w-sm bg-zinc-950 border border-white/5 p-6 rounded-2xl shadow-2xl space-y-5">
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-wider uppercase text-white">
            {isSignUp ? 'Реєстрація' : 'Вхід'}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Система автоматичних матчів</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-3">
          {isSignUp && (
            <>
              <input 
                type="text" 
                placeholder="Твій унікальний нікнейм (основний)" 
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 h-12"
                required
              />
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Справжнє Ім'я" 
                  value={realName}
                  onChange={e => setRealName(e.target.value)}
                  className="w-1/2 bg-zinc-900 border border-zinc-800 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 h-12"
                  required
                />
                <input 
                  type="text" 
                  placeholder="Прізвище" 
                  value={realSurname}
                  onChange={e => setRealSurname(e.target.value)}
                  className="w-1/2 bg-zinc-900 border border-zinc-800 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 h-12"
                  required
                />
              </div>
            </>
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold h-12 rounded-xl transition active:scale-95 flex items-center justify-center mt-2"
          >
            {loading ? 'Завантаження...' : isSignUp ? 'Створити акаунт' : 'Увійти'}
          </button>
        </form>

        <div className="text-center pt-2">
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

const AuthPage = dynamicImport(() => Promise.resolve(AuthFormComponent), { ssr: false });
export default AuthPage;