'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { User, ChevronLeft, Trophy, Swords, Target, TrendingUp, TrendingDown } from 'lucide-react';

export default function PublicProfile() {
  const router = useRouter();
  const params = useParams(); 
  const playerId = params?.id as string;

  const [player, setPlayer] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, wins: 0, losses: 0, winrate: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playerId) return;

    async function getPlayerAndStats() {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', playerId)
          .single();
        
        if (profileError) throw profileError;
        if (profileData) setPlayer(profileData);

        const { data: allMatches } = await supabase
          .from('challenges')
          .select('*')
          .eq('status', 'completed');

        let wins = 0;
        let losses = 0;

        (allMatches as any[])?.forEach(match => {
          const isChallengerTeam = match.challenger_id === playerId || match.challenger2_id === playerId;
          const isDefenderTeam = match.defender_id === playerId || match.defender2_id === playerId;

          if (isChallengerTeam) {
            if (Number(match.score1) > Number(match.score2)) wins++;
            else losses++;
          } else if (isDefenderTeam) {
            if (Number(match.score2) > Number(match.score1)) wins++;
            else losses++;
          }
        });

        const total = wins + losses;
        const winrate = total > 0 ? Math.round((wins / total) * 100) : 0;

        setStats({ total, wins, losses, winrate });

      } catch (err) {
        console.error('Помилка розрахунку статистики:', err);
      } finally {
        setLoading(false);
      }
    }
    
    getPlayerAndStats();
  }, [playerId]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-zinc-500 text-xs font-bold uppercase tracking-widest animate-pulse">
        Завантаження статистики...
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-zinc-500 text-sm p-4 text-center space-y-4">
        <p>Гравця не знайдено.</p>
        <button onClick={() => router.push('/players')} className="bg-zinc-900 border border-white/5 text-white text-xs font-bold px-5 py-3 rounded-xl">
          Повернутись до рейтингу
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-6 select-none touch-manipulation pb-24">
      
      <button onClick={() => router.push('/players')} className="flex items-center gap-1 text-zinc-500 hover:text-white text-xs py-2 uppercase font-bold">
        <ChevronLeft size={16} /> Назад
      </button>

      <div className="bg-zinc-950 border border-white/5 rounded-[30px] p-6 flex flex-col items-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-600/10 to-transparent"></div>

        <div className="w-24 h-24 rounded-[24px] bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center relative z-10 shadow-xl">
          {player.avatar_url ? (
            <img src={player.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User size={36} className="text-zinc-600" />
          )}
        </div>

        <div className="text-center w-full space-y-3 relative z-10">
          <h2 className="text-2xl font-black text-white tracking-tight italic">
            @{player.nickname || 'anonym'}
          </h2>
          
          <div className="inline-block px-5 py-2 bg-zinc-900/60 rounded-xl border border-white/5">
            <p className="text-[9px] text-blue-500 uppercase tracking-widest font-black mb-0.5">Справжнє Ім'я</p>
            <p className="text-zinc-300 font-bold text-xs uppercase tracking-wide">
              {player.real_name || player.name || 'Не вказано'} {player.real_surname || player.surname || ''}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
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

        <div className="bg-zinc-950 border border-white/5 rounded-[20px] p-4 flex flex-col gap-2">
          <Swords size={18} className="text-zinc-500" />
          <div>
            <span className="text-xl font-black text-white font-mono">{stats.total}</span>
            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Матчів</p>
          </div>
        </div>

        <div className="bg-zinc-950 border border-white/5 rounded-[20px] p-4 flex flex-col gap-2">
          <Target size={18} className="text-yellow-500" />
          <div>
            <span className="text-xl font-black text-white font-mono">{stats.winrate}%</span>
            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Winrate</p>
          </div>
        </div>

        <div className="bg-emerald-950/10 border border-emerald-500/10 rounded-[20px] p-4 flex flex-col gap-2">
          <TrendingUp size={18} className="text-emerald-500" />
          <div>
            <span className="text-xl font-black text-emerald-500 font-mono">{stats.wins}</span>
            <p className="text-[9px] text-emerald-500/50 uppercase font-bold tracking-wider">Перемог</p>
          </div>
        </div>

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