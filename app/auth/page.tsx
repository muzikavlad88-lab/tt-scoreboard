'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LogIn, UserPlus, Mail, Lock } from 'lucide-react';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { data: { nickname: email.split('@')[0] } }
      });
      if (error) alert(error.message);
      else alert('Перевір пошту для підтвердження!');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else window.location.href = '/';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-black text-white">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tighter shadow-neon text-blue-500 uppercase">
            {isRegister ? 'Реєстрація' : 'Вхід'}
          </h1>
          <p className="text-gray-500 mt-2"></p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-500" size={20} />
            <input 
              type="email" placeholder="Email"
              className="w-full bg-slate-900/50 border border-blue-500/20 rounded-xl py-3 pl-12 pr-4 focus:border-blue-500 outline-none transition-all"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-500" size={20} />
            <input 
              type="password" placeholder="Пароль"
              className="w-full bg-slate-900/50 border border-blue-500/20 rounded-xl py-3 pl-12 pr-4 focus:border-blue-500 outline-none transition-all"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold shadow-lg shadow-blue-900/40 transition-all flex items-center justify-center space-x-2">
            {isRegister ? <UserPlus size={20} /> : <LogIn size={20} />}
            <span>{isRegister ? 'Створити акаунт' : 'Увійти'}</span>
          </button>
        </form>

        <button 
          onClick={() => setIsRegister(!isRegister)}
          className="w-full text-blue-400/60 text-sm hover:text-blue-400 transition-colors"
        >
          {isRegister ? 'Вже є акаунт? Увійди' : 'Немає акаунту? Зареєструйся'}
        </button>
      </div>
    </div>
  );
}