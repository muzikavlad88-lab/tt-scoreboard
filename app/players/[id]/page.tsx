'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, ChevronLeft, Trophy, Swords, Target, TrendingUp, TrendingDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PublicProfile({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [player, setPlayer] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, wins: 0, losses: 0, winrate: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getPlayerAndStats() {
      try {
        // 1. Завантажуємо особисті дані гравця
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', params.id)
          .single();
        
        if (profileError) throw profileError;
        if (profileData) setPlayer(profileData);

        // 2. Завантажуємо матчі, де гравець був Ініціатором (Гравець 1 / Команда 1)
        const { data: matchesAsP1 } = await supabase
          .from('challenges')
          .select('score1, score2')
          .eq('challenger_id', params.id)
          .eq('status', 'completed');

        // 3. Завантажуємо матчі, де гравець був Захисником (Гравець 2 / Команда 2)
        const { data: matchesAsP2 } = await supabase
          .from('challenges')
          .select('score1, score2')
          .eq('defender_id', params.id)
          .eq('status', 'completed');

        // 4. Рахуємо перемоги та поразки
        let wins = 0;
        let losses = 0;

        matchesAsP1?.forEach(m => {
          if (m.score1 > m.score2) wins++;
          else if (m.score1 < m.score2) losses++;
        });

        matchesAsP2?.forEach(m => {
          if (m.score2 > m.score1) wins++;
          else if (m.score2 < m.score1) losses++;
        });

        const total = wins + losses;
        const winrate = total > 0 ? Math.round((wins / total) * 100) : 0;

        setStats({ total, wins, losses, winrate });

      } catch (err) {
        console.error('Помилка завантаження профілю:', err);
      } finally {
        setLoading(false);
      }
    }
    
    getPlayerAndStats();
  }, [params.id]);

  if (loading) {
    return <div className="min-h-[80vh] flex items-center justify-center text-zinc-500 text-sm font-bold uppercase tracking-widest animate-pulse">Завантаження профілю...</div>;
  }

  if (!player) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-zinc-500 text-sm space-y-6">
        <p>Гравця не знайдено. Перевірте базу даних.</p>
        <button 
          onClick={() => router.push('/players')} 
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold active:scale-95 transition-all"
        >
          Повернутись до рейтингу
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-6 select-none touch-manipulation pb-20">
      
      {/* КНОПКА НАЗАД */}
      <button 
        onClick={() => router.push('/players')} 
        className="flex items-center gap-1 text-zinc-500 hover:text-white transition-all text-xs py-2 uppercase tracking-widest font-bold"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <ChevronLeft size={16} /> Назад
      </button>

      {/* ГОЛОВНА КАРТКА ПРОФІЛЮ */}
      <div className="bg-zinc-950 border border-white/5 rounded-[30px] p-6 flex flex-col items-center space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Фоновий акцент */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-600/20 to-transparent"></div>

        {/* АВАТАРКА */}
        <div className="w-28 h-28 rounded-[24px] bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center relative z-10 shadow-xl">
          {player.avatar_url ? (
            <img src={player.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User size={40} className="text-zinc-600" />
          )}
        </div>

        {/* НІК ТА СПРАВЖНЄ ІМ'Я */}
        <div className="text-center w-full space-y-3 relative z-10">
          <h2 className="text-3xl font-black text-white tracking-tight italic drop-shadow-lg">
            @{player.nickname || 'anonym'}
          </h2>
          
          <div className="inline-block px-5 py-2 bg-zinc-900/80 rounded-xl border border-white/5">
            <p className="text-[9px] text-blue-500 uppercase tracking-[0.2em] font-black mb-1">Справжнє Ім'я</p>
            <p className="text-zinc-300 font-bold text-sm uppercase tracking-wider">
              {player.real_name || 'Не вказано'} {player.real_surname || ''}
            </p>
          </div>
        </div>

      </div>

      {/* БЛОК СТАТИСТИКИ (ELO, Всього, Перемоги, Поразки) */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* ELO Рейтинг */}
        <div className="col-span-2 bg-gradient-to-br from-blue-900/20 to-zinc-950 border border-blue-500/20 rounded-[24px] p-6 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/20 p-3 rounded-2xl">
              <Trophy size={24} className="text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Поточний Рейтинг</p>
              <span className="text-3xl font-black text-white font-mono">{player.elo ?? 1000}</span>
            </div>
          </div>
        </div>

        {/* Всього зіграно */}
        <div className="bg-zinc-950 border border-white/5 rounded-[24px] p-5 flex flex-col gap-2">
          <Swords size={20} className="text-zinc-400" />
          <div>
            <span className="text-2xl font-black text-white">{stats.total}</span>
            <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Матчів</p>
          </div>
        </div>

        {/* Winrate % */}
        <div className="bg-zinc-950 border border-white/5 rounded-[24px] p-5 flex flex-col gap-2">
          <Target size={20} className="text-yellow-500" />
          <div>
            <span className="text-2xl font-black text-white">{stats.winrate}%</span>
            <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Winrate</p>
          </div>
        </div>

        {/* Перемоги */}
        <div className="bg-emerald-950/20 border border-emerald-500/10 rounded-[24px] p-5 flex flex-col gap-2">
          <TrendingUp size={20} className="text-emerald-500" />
          <div>
            <span className="text-2xl font-black text-emerald-500">{stats.wins}</span>
            <p className="text-[9px] text-emerald-500/60 uppercase tracking-widest font-bold">Перемог</p>
          </div>
        </div>

        {/* Поразки */}
        <div className="bg-red-950/20 border border-red-500/10 rounded-[24px] p-5 flex flex-col gap-2">
          <TrendingDown size={20} className="text-red-500" />
          <div>
            <span className="text-2xl font-black text-red-500">{stats.losses}</span>
            <p className="text-[9px] text-red-500/60 uppercase tracking-widest font-bold">Поразок</p>
          </div>
        </div>

      </div>

    </div>
  );
}