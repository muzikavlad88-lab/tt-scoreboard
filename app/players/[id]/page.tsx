'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation'; // Використовуємо useParams замість пропсів
import { User, ChevronLeft, Trophy, Swords, Target, TrendingUp, TrendingDown } from 'lucide-react';

export default function PublicProfile() {
  const router = useRouter();
  const params = useParams(); // Залізобетонне отримання ID сторінки
  const playerId = params?.id as string;

  const [player, setPlayer] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, wins: 0, losses: 0, winrate: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playerId) return;

    async function getPlayerAndStats() {
      try {
        // 1. Завантажуємо особисті дані гравця за його ID
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', playerId)
          .single();
        
        if (profileError) throw profileError;
        if (profileData) setPlayer(profileData);

        // 2. Завантажуємо матчі, де гравець був першим (Команда 1)
        const { data: matchesAsP1 } = await supabase
          .from('challenges')
          .select('score1, score2')
          .eq('challenger_id', playerId)
          .eq('status', 'completed');

        // 3. Завантажуємо матчі, де гравець був другим (Команда 2)
        const { data: matchesAsP2 } = await supabase
          .from('challenges')
          .select('score1, score2')
          .eq('defender_id', playerId)
          .eq('status', 'completed');

        // 4. Розрахунок статистики перемог та поразок
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
        console.error('Помилка завантаження даних профілю:', err);
      } finally {
        setLoading(false);
      }
    }
    
    getPlayerAndStats();
  }, [playerId]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-zinc-500 text-xs font-bold uppercase tracking-widest animate-pulse">
        Завантаження профілю...
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-zinc-500 text-sm p-4 text-center space-y-4">
        <p>Гравця не знайдено або профіль було видалено.</p>
        <button 
          onClick={() => router.push('/players')} 
          className="bg-zinc-900 border border-white/5 text-white text-xs font-bold px-5 py-3 rounded-xl active:scale-95 transition-all"
        >
          Повернутись до рейтингу
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-6 select-none touch-manipulation pb-24">
      
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
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-600/10 to-transparent"></div>

        {/* АВАТАРКА */}
        <div className="w-24 h-24 rounded-[24px] bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center relative z-10 shadow-xl">
          {player.avatar_url ? (
            <img src={player.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User size={36} className="text-zinc-600" />
          )}
        </div>

        {/* НІК ТА СПРАВЖНЄ ІМ'Я */}
        <div className="text-center w-full space-y-3 relative z-10">
          <h2 className="text-2xl font-black text-white tracking-tight italic">
            @{player.nickname || 'anonym'}
          </h2>
          
          <div className="inline-block px-5 py-2 bg-zinc-900/60 rounded-xl border border-white/5">
            <p className="text-[9px] text-blue-500 uppercase tracking-widest font-black mb-0.5">Справжнє Ім'я</p>
            <p className="text-zinc-300 font-bold text-xs uppercase tracking-wide">
              {player.real_name || 'Не вказано'} {player.real_surname || ''}
            </p>
          </div>
        </div>

      </div>

      {/* БЛОК СТАТИСТИКИ ІГОР */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* ELO РЕЙТИНГ */}
        <div className="col-span-2 bg-gradient-to-br from-blue-950/30 to-zinc-950 border border-blue-500/10 rounded-[24px] p-5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/10 p-3 rounded-xl">
              <Trophy size={22} className="text-blue-500" />
            </div>
            <div>
              <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Поточний Рейтинг</p>
              <span className="text-2xl font-black text-white font-mono">{player.elo ?? 1000}</span>
            </div>
          </div>
        </div>

        {/* ВСЬОГО МАТЧІВ */}
        <div className="bg-zinc-950 border border-white/5 rounded-[20px] p-4 flex flex-col gap-2">
          <Swords size={18} className="text-zinc-500" />
          <div>
            <span className="text-xl font-black text-white font-mono">{stats.total}</span>
            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Матчів</p>
          </div>
        </div>

        {/* ВІНРЕЙТ % */}
        <div className="bg-zinc-950 border border-white/5 rounded-[20px] p-4 flex flex-col gap-2">
          <Target size={18} className="text-yellow-500" />
          <div>
            <span className="text-xl font-black text-white font-mono">{stats.winrate}%</span>
            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Winrate</p>
          </div>
        </div>

        {/* ПЕРЕМОГИ */}
        <div className="bg-emerald-950/10 border border-emerald-500/10 rounded-[20px] p-4 flex flex-col gap-2">
          <TrendingUp size={18} className="text-emerald-500" />
          <div>
            <span className="text-xl font-black text-emerald-500 font-mono">{stats.wins}</span>
            <p className="text-[9px] text-emerald-500/50 uppercase font-bold tracking-wider">Перемог</p>
          </div>
        </div>

        {/* ПОРАЗКИ */}
        <div className="bg-red-950/10 border border-red-500/10 rounded-[20px] p-4 flex flex-col gap-2">
          <TrendingDown size={18} className="text-red-500" />
          <div>
            <span className="text-xl font-black text-red-500 font-mono">{stats.losses}</span>
            <p className="text-[9px] text-red-500/50 uppercase font-bold tracking-wider">Поразок</p>
          </div>
        </div>

      </div>

    </div>
  );
}