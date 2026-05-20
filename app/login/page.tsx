'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import dynamicImport from 'next/dynamic';
import { Mail, Lock, User, Tag, Loader2 } from 'lucide-react';

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
        // 1. РЕЄСТРАЦІЯ У СИСТЕМІ AUTH
        const { data, error } = await supabase.auth.signUp({
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

        // 2. ПІДСТРАХУВАЛЬНИЙ ПРЯМИЙ ЗАПИС У ТАБЛИЦЮ PROFILES
        if (data?.user) {
          await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              nickname: nickname.trim(),
              real_name: realName.trim(),
              real_surname: realSurname.trim(),
              elo: 1000,
              role: 'user'
            });
        }

        alert('Акаунт створено успішно! Тепер увійдіть під своїми даними.');
        setIsSignUp(false);
        // Очищення полів
        setNickname(''); setRealName(''); setRealSurname(''); setEmail(''); setPassword('');
      } else {
        // ВХІД
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black select-none touch-manipulation">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in duration-700">
        
        {/* ЗАГОЛОВОК */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            {isSignUp ? 'РЕЄСТРАЦІЯ' : 'ВХІД'}
          </h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-bold">
            TT Scoreboard System
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-3">
          
          {/* ПОЛЯ ТІЛЬКИ ДЛЯ РЕЄСТРАЦІЇ */}
          {isSignUp && (
            <div className="space-y-3 animate-in slide-in-from-top-4 duration-500">
              
              {/* НІКНЕЙМ */}
              <div className="relative">
                <Tag className="absolute left-4 top-4 text-blue-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Твій Нікнейм (буде в рейтингу)" 
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  className="w-full bg-zinc-900/80 border border-white/5 p-4 pl-12 rounded-2xl text-white text-sm outline-none focus:border-blue-500 transition-all"
                  required
                />
              </div>

              {/* СПРАВЖНЄ ІМ'Я ТА ПРІЗВИЩЕ */}
              <div className="flex gap-2">
                <div className="relative w-1/2">
                  <User className="absolute left-4 top-4 text-emerald-500" size={18} />
                  <input 
                    type="text" 
                    placeholder="Ім'я" 
                    value={realName}
                    onChange={e => setRealName(e.target.value)}
                    className="w-full bg-zinc-900/80 border border-white/5 p-4 pl-12 rounded-2xl text-white text-sm outline-none focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
                <div className="relative w-1/2">
                  <input 
                    type="text" 
                    placeholder="Прізвище" 
                    value={realSurname}
                    onChange={e => setRealSurname(e.target.value)}
                    className="w-full bg-zinc-900/80 border border-white/5 p-4 rounded-2xl text-white text-sm outline-none focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* ПОЛЯ ДЛЯ EMAIL ТА ПАРОЛЮ */}
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-zinc-600" size={18} />
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-zinc-900/80 border border-white/5 p-4 pl-12 rounded-2xl text-white text-sm outline-none focus:border-blue-500 transition-all"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-4 text-zinc-600" size={18} />
            <input 
              type="password" 
              placeholder="Пароль" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-zinc-900/80 border border-white/5 p-4 pl-12 rounded-2xl text-white text-sm outline-none focus:border-blue-500 transition-all"
              required
            />
          </div>

          {/* КНОПКА ДІЇ */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 p-4 rounded-2xl text-white font-black text-sm uppercase tracking-widest hover:bg-blue-500 transition-all active:scale-95 shadow-[0_0_30px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 mt-4"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : isSignUp ? 'ЗАРЕЄСТРУВАТИСЯ' : 'УВІЙТИ'}
          </button>
        </form>

        {/* ПЕРЕМИКАЧ РЕЖИМІВ */}
        <div className="text-center pt-4">
          <button 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setNickname(''); setRealName(''); setRealSurname('');
            }}
            className="text-zinc-500 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {isSignUp ? 'Вже є акаунт? Увійти' : 'Немає акаунту? Створити'}
          </button>
        </div>
      </div>
    </div>
  );
}

const LoginPage = dynamicImport(() => Promise.resolve(AuthFormComponent), { ssr: false });
export default LoginPage;