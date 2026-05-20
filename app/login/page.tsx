'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  useEffect(() => {
    document.title = 'Вхід | TT Scoreboard';
  }, []);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);

    try {
      if (isRegister) {
        // Реєстрація нового користувача
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Реєстрація успішна! Тепер ти можеш увійти. 🚀');
        setIsRegister(false);
      } else {
        // Вхід в існуючий акаунт
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        router.push('/');
        router.refresh();
      }
    } catch (error: any) {
      alert('Помилка: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6 min-h-screen bg-black text-white flex flex-col justify-center items-center">
      <div className="w-full max-w-[400px] space-y-8 animate-in fade-in zoom-in duration-300">
        
        {/* Заголовок */}
        <div className="text-center">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic shadow-neon">
            {isRegister ? 'Реєстрація' : 'Авторизація'}
          </h1>
          <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest">
            {isRegister ? '' : 'Вхід до системи TT Scoreboard'}
          </p>
        </div>

        {/* Форма */}
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-blue-500 font-black ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="email" 
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-5 outline-none text-white focus:border-blue-500 focus:bg-white/5 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-blue-500 font-black ml-1">Пароль</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-5 outline-none text-white focus:border-blue-500 focus:bg-white/5 transition-all"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 mt-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center space-x-3 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : null}
            <span>{isRegister ? 'Зареєструватися' : 'Увійти'}</span>
          </button>
        </form>

        {/* Перемикач Вхід / Реєстрація */}
        <div className="text-center">
          <button 
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-gray-500 hover:text-blue-400 font-bold uppercase tracking-wider transition-colors"
          >
            {isRegister ? 'Вже є акаунт? Увійти' : 'Немає акаунта? Створити'}
          </button>
        </div>

      </div>
    </main>
  );
}