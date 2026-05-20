'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User, ShieldAlert, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (data) setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (loading) return <div className="text-center p-10 text-zinc-500">Завантаження профілю...</div>;
  if (!profile) return <div className="text-center p-10 text-zinc-500">Профіль не знайдено.</div>;

  return (
    <div className="p-6 max-w-md mx-auto space-y-6 select-none">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">Мій Профіль</h1>
        <p className="text-xs text-zinc-500">Особисті дані гравця</p>
      </div>

      {/* КАРТКА КОРИСТУВАЧА */}
      <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6 flex flex-col items-center space-y-4 shadow-2xl">
        <div className="w-20 h-20 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center text-zinc-600">
          <User size={40} />
        </div>

        <div className="text-center space-y-1">
          {/* НІКНЕЙМ ОСНОВНИЙ */}
          <h2 className="text-xl font-black text-white tracking-wide">@{profile.nickname}</h2>
          
          {/* СПРАВЖНЄ ІМ'Я ТА ПРІЗВИЩЕ ВІДОБРАЖАЮТЬСЯ ТУТ */}
          <p className="text-sm font-medium text-zinc-400">
            {profile.real_name} {profile.real_surname}
          </p>
        </div>

        <div className="w-full border-t border-white/5 pt-4 text-center">
          <span className="text-xl font-black font-mono text-blue-500">{profile.elo ?? 1000}</span>
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Поточний рейтинг ELO</p>
        </div>
      </div>

      {/* ПОВІДОМЛЕННЯ ПРО ЗАБОРОНУ ЗМІНИ */}
      <div className="bg-zinc-950 border border-red-500/10 rounded-xl p-4 flex items-start gap-3">
        <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={18} />
        <p className="text-xs text-zinc-500 leading-relaxed">
          Зміна нікнейму, імені чи прізвища після реєстрації **неможлива** для запобігання махінаціям у турнірній таблиці.
        </p>
      </div>

      {/* КНОПКА ВИХОДУ */}
      <button 
        onClick={handleSignOut}
        className="w-full bg-zinc-950 border border-white/5 hover:bg-red-950/20 hover:border-red-500/20 text-zinc-400 hover:text-red-400 h-12 rounded-xl transition text-sm font-bold flex items-center justify-center gap-2 active:scale-95"
      >
        <LogOut size={16} /> Вийти з акаунта
      </button>
    </div>
  );
}