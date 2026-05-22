'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { User, ChevronLeft, Trophy, Swords, Target, TrendingUp, TrendingDown, X } from 'lucide-react';

export default function PublicProfile() {
  const router = useRouter();
  const params = useParams(); 
  const playerId = (params?.id as string)?.toLowerCase();

  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false); // Стан для відкриття фото на весь екран

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

      } catch (err) {
        console.error('Помилка завантаження профілю:', err);
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

  const wins1v1 = Number(player.wins_1v1 ?? 0);
  const losses1v1 = Number(player.losses_1v1 ?? 0);
  const wins2v2 = Number(player.wins_2v2 ?? 0);
  const losses2v2 = Number(player.losses_2v2 ?? 0);

  const totalWins = wins1v1 + wins2v2;
  const totalLosses = losses1v1 + losses2v2;
  const totalMatches = totalWins + totalLosses;
  const winrate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

  return (
    <div className="p-4 max-w-md mx-auto space-y-6 select-none touch-manipulation pb-6">
      
      <button onClick={() => router.push('/players')} className="flex items-center gap-1 text-zinc-500 hover:text-white text-xs py-2 uppercase font-bold">
        <ChevronLeft size={16} /> Назад
      </button>

      {/* КАРТКА КОРИСТУВАЧА */}
      <div className="bg-zinc-950 border border-white/5 rounded-[30px] p-6 flex flex-col items-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-600/10 to-transparent"></div>

        {/* АВАТАРКА (Тепер клікабельна з ефектом зуму при наведенні) */}
        <div 
          onClick={() => player.avatar_url && setIsMaximized(true)}
          className={`w-24 h-24 rounded-[24px] bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center relative z-10 shadow-xl transition-all active:scale-95 ${player.avatar_url ? 'cursor-zoom-in hover:border-blue-500/50' : ''}`}
        >
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

      {/* РОЗДІЛЬНІ ПЛАШКИ РЕЙТИНГУ ELO */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-blue-950/20 to-zinc-950 border border-blue-500/10 rounded-[24px] p-4 flex items-center gap-3 shadow-lg">
          <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500">
            <Trophy size={18} />
          </div>
          <div>
            <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Рейтинг 1v1</p>
            <span className="text-lg font-black text-white font-mono">
              {player.elo_1v1 ?? 1000} <span className="text-[9px] text-zinc-600 font-bold">PTS</span>
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-950/20 to-zinc-950 border border-purple-500/10 rounded-[24px] p-4 flex items-center gap-3 shadow-lg">
          <div className="bg-purple-500/10 p-2 rounded-lg text-purple-500">
            <Trophy size={18} />
          </div>
          <div>
            <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Рейтинг 2v2</p>
            <span className="text-lg font-black text-white font-mono">
              {player.elo_2v2 ?? 1000} <span className="text-[9px] text-zinc-600 font-bold">PTS</span>
            </span>
          </div>
        </div>

        {/* МАТЧІ */}
        <div className="bg-zinc-950 border border-white/5 rounded-[20px] p-4 flex flex-col gap-2">
          <Swords size={18} className="text-zinc-500" />
          <div>
            <span className="text-xl font-black text-white font-mono">{totalMatches}</span>
            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Матчів</p>
          </div>
        </div>

        {/* ВІНРЕЙТ */}
        <div className="bg-zinc-950 border border-white/5 rounded-[20px] p-4 flex flex-col gap-2">
          <Target size={18} className="text-yellow-500" />
          <div>
            <span className="text-xl font-black text-white font-mono">{winrate}%</span>
            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Winrate</p>
          </div>
        </div>

        {/* ПЕРЕМОГИ З ПОДІЛОМ */}
        <div className="bg-emerald-950/10 border border-emerald-500/10 rounded-[20px] p-4 flex flex-col gap-2">
          <TrendingUp size={18} className="text-emerald-500" />
          <div>
            <span className="text-xl font-black text-emerald-500 font-mono">{totalWins}</span>
            <p className="text-[9px] text-emerald-500/50 uppercase font-bold tracking-wider">Перемог</p>
            
            <div className="flex gap-3 mt-2 pt-2 border-t border-emerald-500/10 text-[10px]">
              <div>
                <span className="text-zinc-500 font-medium">1v1: </span>
                <span className="font-mono font-bold text-white">{wins1v1}</span>
              </div>
              <div className="border-l border-emerald-500/10 pl-2">
                <span className="text-zinc-500 font-medium">2v2: </span>
                <span className="font-mono font-bold text-white">{wins2v2}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ПОРАЗКИ З ПОДІЛОМ */}
        <div className="bg-red-950/10 border border-red-500/10 rounded-[20px] p-4 flex flex-col gap-2">
          <TrendingDown size={18} className="text-red-500" />
          <div>
            <span className="text-xl font-black text-red-500 font-mono">{totalLosses}</span>
            <p className="text-[9px] text-red-500/50 uppercase font-bold tracking-wider">Поразок</p>
            
            <div className="flex gap-3 mt-2 pt-2 border-t border-red-500/10 text-[10px]">
              <div>
                <span className="text-zinc-500 font-medium">1v1: </span>
                <span className="font-mono font-bold text-white">{losses1v1}</span>
              </div>
              <div className="border-l border-red-500/10 pl-2">
                <span className="text-zinc-500 font-medium">2v2: </span>
                <span className="font-mono font-bold text-white">{losses2v2}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 МОДАЛЬНЕ ВІКНО ПОВНОЕКРАННОГО ПЕРЕГЛЯДУ АВАТАРКИ */}
      {isMaximized && player.avatar_url && (
        <div 
          onClick={() => setIsMaximized(false)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in cursor-zoom-out"
        >
          <button 
            onClick={() => setIsMaximized(false)}
            className="absolute top-6 right-6 p-3 bg-zinc-900/80 border border-white/10 text-white rounded-full hover:bg-zinc-800 transition-all"
          >
            <X size={20} />
          </button>
          
          <div className="max-w-md w-full max-h-[70vh] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl bg-zinc-950 relative">
            <img 
              src={player.avatar_url} 
              alt="Maximized Avatar" 
              className="w-full h-full object-contain mx-auto"
              onClick={(e) => e.stopPropagation()} // Зупиняємо закриття вікна при кліку суто на саму картинку всередині рамки
            />
          </div>
        </div>
      )}

    </div>
  );
}