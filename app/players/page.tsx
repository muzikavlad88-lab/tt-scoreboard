'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Trophy, Award, Search, User } from 'lucide-react';

export default function PlayersRatingPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'1v1' | '2v2'>('1v1');

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) throw error;
        if (data) setProfiles(data);
      } catch (error) {
        console.error('Помилка при завантаженні рейтингу:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRating();
  }, []);

  // СОРТУВАННЯ ЗА ELO: Залежно від таба сортуємо за відповідним рейтингом
  const sortedProfiles = [...profiles].sort((a, b) => {
    if (activeTab === '1v1') {
      return Number(b.elo_1v1 ?? 1000) - Number(a.elo_1v1 ?? 1000);
    } else {
      return Number(b.elo_2v2 ?? 1000) - Number(a.elo_2v2 ?? 1000);
    }
  });

  const filteredProfiles = sortedProfiles.filter(p => 
    (p.nickname || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const top1 = filteredProfiles[0];
  const top2 = filteredProfiles[1];
  const top3 = filteredProfiles[2];
  const otherPlayers = filteredProfiles.slice(3);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-zinc-500 text-xs font-bold uppercase tracking-widest animate-pulse">
        Завантаження рейтингу гравців...
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-6 select-none touch-manipulation pb-24">
      
      <div className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase italic">Лідерборд</h1>
          <p className="text-xs text-zinc-500">Роздільні рейтинги Elo по режимах</p>
        </div>
        <button onClick={() => router.push('/')} className="p-3 bg-zinc-950 border border-white/5 text-zinc-400 hover:text-white rounded-2xl text-xs font-bold transition-all active:scale-95">
          На головну
        </button>
      </div>

      {/* ПЕРЕМИКАЧ РЕЖИМІВ */}
      <div className="flex bg-zinc-950 border border-white/5 p-1 rounded-2xl gap-1 shadow-inner">
        <button onClick={() => setActiveTab('1v1')} className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${activeTab === '1v1' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' : 'text-zinc-500 hover:text-zinc-300'}`}>
          Рейтинг 1 на 1
        </button>
        <button onClick={() => setActiveTab('2v2')} className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${activeTab === '2v2' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' : 'text-zinc-500 hover:text-zinc-300'}`}>
          Рейтинг 2 на 2
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-3.5 text-zinc-600" size={16} />
        <input type="text" placeholder="Знайти гравця за нікнеймом..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-zinc-950 border border-white/5 text-white rounded-xl py-3 pl-11 pr-4 text-xs focus:outline-none focus:border-blue-500 transition h-12 font-medium" />
      </div>

      {/* 👑 П'ЄДЕСТАЛ */}
      {filteredProfiles.length > 0 && (
        <div className="bg-zinc-950 border border-white/5 rounded-[32px] p-5 flex items-end justify-center gap-1 pt-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-600/5 to-transparent"></div>

          {/* 🥈 2 МІСЦЕ */}
          {top2 ? (
            <div className="flex flex-col items-center flex-1 cursor-pointer group" onClick={() => router.push(`/players/${top2.id}`)}>
              <div className="w-14 h-14 rounded-full border-2 border-zinc-400 bg-zinc-900 overflow-hidden relative shadow-lg group-active:scale-95 transition-all">
                {top2.avatar_url ? <img src={top2.avatar_url} className="w-full h-full object-cover" /> : <User className="text-zinc-600 m-auto h-full" size={20} />}
              </div>
              <span className="text-[11px] font-black text-zinc-300 mt-2 truncate w-20 text-center">@{top2.nickname}</span>
              <span className="text-[10px] font-mono font-bold text-zinc-500">
                {activeTab === '1v1' ? (top2.elo_1v1 ?? 1000) : (top2.elo_2v2 ?? 1000)} PTS
              </span>
              <div className="w-full bg-zinc-900/60 border border-white/5 h-16 rounded-t-2xl mt-2 flex items-center justify-center shadow-md">
                <span className="text-xl font-black text-zinc-400 font-mono">2</span>
              </div>
            </div>
          ) : <div className="flex-1"></div>}

          {/* 🥇 1 МІСЦЕ */}
          {top1 ? (
            <div className="flex flex-col items-center flex-1 z-10 cursor-pointer group" onClick={() => router.push(`/players/${top1.id}`)}>
              <div className="relative group-active:scale-95 transition-all">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-500 text-lg animate-bounce">👑</div>
                <div className="w-18 h-18 rounded-full border-4 border-yellow-500 bg-zinc-900 overflow-hidden shadow-2xl">
                  {top1.avatar_url ? <img src={top1.avatar_url} className="w-full h-full object-cover" /> : <User className="text-zinc-600 m-auto h-full" size={24} />}
                </div>
              </div>
              <span className="text-xs font-black text-white mt-3 truncate w-24 text-center">@{top1.nickname}</span>
              <span className="text-[10px] font-mono font-black text-yellow-500">
                {activeTab === '1v1' ? (top1.elo_1v1 ?? 1000) : (top1.elo_2v2 ?? 1000)} PTS
              </span>
              <div className="w-full bg-gradient-to-b from-yellow-500/10 to-zinc-900 border border-yellow-500/20 h-24 rounded-t-2xl mt-2 flex items-center justify-center shadow-xl">
                <span className="text-3xl font-black text-yellow-500 font-mono">1</span>
              </div>
            </div>
          ) : <div className="flex-1"></div>}

          {/* 🥉 3 МІСЦЕ */}
          {top3 ? (
            <div className="flex flex-col items-center flex-1 cursor-pointer group" onClick={() => router.push(`/players/${top3.id}`)}>
              <div className="w-13 h-13 rounded-full border-2 border-amber-700 bg-zinc-900 overflow-hidden relative shadow-lg group-active:scale-95 transition-all">
                {top3.avatar_url ? <img src={top3.avatar_url} className="w-full h-full object-cover" /> : <User className="text-zinc-600 m-auto h-full" size={18} />}
              </div>
              <span className="text-[11px] font-black text-zinc-400 mt-2 truncate w-20 text-center">@{top3.nickname}</span>
              <span className="text-[10px] font-mono font-bold text-zinc-600">
                {activeTab === '1v1' ? (top3.elo_1v1 ?? 1000) : (top3.elo_2v2 ?? 1000)} PTS
              </span>
              <div className="w-full bg-zinc-900/60 border border-white/5 h-12 rounded-t-2xl mt-2 flex items-center justify-center shadow-md">
                <span className="text-xl font-black text-amber-700 font-mono">3</span>
              </div>
            </div>
          ) : <div className="flex-1"></div>}
        </div>
      )}

      {/* СПИСОК ІНШИХ МІСЦЬ */}
      <div className="space-y-2">
        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest pl-2">Інші позиції таблиці</p>
        
        {filteredProfiles.length === 0 || (filteredProfiles.length <= 3 && otherPlayers.length === 0) ? (
          <p className="text-center py-10 text-xs text-zinc-600 font-bold uppercase tracking-wider bg-zinc-950 border border-white/5 rounded-2xl">
            Гравців для списку не знайдено
          </p>
        ) : (
          otherPlayers.map((player, index) => {
            const currentElo = activeTab === '1v1' ? (player.elo_1v1 ?? 1000) : (player.elo_2v2 ?? 1000);

            return (
              <div key={player.id} onClick={() => router.push(`/players/${player.id}`)} className="cursor-pointer active:scale-[0.99] bg-zinc-950 border border-white/5 p-4 rounded-2xl flex items-center justify-between transition-all hover:border-white/10">
                <div className="flex items-center gap-4">
                  <span className="w-5 font-mono text-xs font-black text-zinc-600 text-center">{index + 4}</span>
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-900 border border-white/10 flex items-center justify-center">
                    {player.avatar_url ? <img src={player.avatar_url} className="w-full h-full object-cover" /> : <User className="text-zinc-700" size={16} />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white tracking-wide">@{player.nickname || 'Anonym'}</span>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wide mt-0.5">{player.real_name || 'Гравець'}</span>
                  </div>
                </div>

                <div className="text-right bg-zinc-900 border border-white/5 px-3 py-1.5 rounded-xl">
                  <span className="text-xs font-mono font-black text-blue-500">{currentElo}</span>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase ml-1">PTS</span>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}