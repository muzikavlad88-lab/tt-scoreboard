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
        // РЕЄСТРАЦІЯ
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
        alert('Акаунт створено! Увійдіть.');
        setIsSignUp(false);
      } else {
        // ВХІД
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/');
        router.refresh();
      }
    } catch (error: any) {
      alert(`Помилка: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
      <div className="w-full max-w-sm space-y-8">
        <h1 className="text-4xl font-black text-center text-white uppercase tracking-tighter">
          {isSignUp ? 'РЕЄСТРАЦІЯ' : 'ВХІД'}
        </h1>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <>
              <input 
                type="text" placeholder="Нікнейм (буде видно всім)" 
                value={nickname} onChange={e => setNickname(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500"
                required
              />
              <input 
                type="text" placeholder="Ім'я" 
                value={realName} onChange={e => setRealName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500"
                required
              />
              <input 
                type="text" placeholder="Прізвище" 
                value={realSurname} onChange={e => setRealSurname(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500"
                required
              />
            </>
          )}

          <input 
            type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500"
            required
          />
          <input 
            type="password" placeholder="Пароль" value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white outline-none focus:border-blue-500"
            required
          />

          <button 
            type="submit" disabled={loading}
            className="w-full bg-blue-600 p-4 rounded-2xl text-white font-bold hover:bg-blue-700 transition"
          >
            {loading ? 'Завантаження...' : isSignUp ? 'ЗАРЕЄСТРУВАТИСЯ' : 'УВІЙТИ'}
          </button>
        </form>

        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-zinc-500 text-sm font-medium"
        >
          {isSignUp ? 'ВЖЕ Є АКАУНТ? УВІЙТИ' : 'НЕМАЄ АКАУНТУ? СТВОРИТИ'}
        </button>
      </div>
    </div>
  );
}

const AuthPage = dynamicImport(() => Promise.resolve(AuthFormComponent), { ssr: false });
export default AuthPage;