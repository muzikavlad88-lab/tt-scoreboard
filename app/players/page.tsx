'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Trophy, Medal, Search, Loader2, User } from 'lucide-react';

export default function PlayersPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.title = 'Рейтинг | TT Scoreboard';
    fetchPlayers();
  }, []);

  async function fetchPlayers() {
    try {
      // Додано завантаження avatar_url з бази даних
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nickname, elo, avatar_url')
        .order('elo', { ascending: false });

      if (error) throw error;
      if (data) setPlayers(data);
    } catch (error: any) {
      console.error('Помилка завантаження рейтингу:', error.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredPlayers = players.filter(player => 
    (player.nickname || 'Гравець')
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const renderRank = (index: number) => {
    if (index === 0) return <Medal className="text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" size={24} />;
    if (index === 1) return <Medal className="text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.5)]" size={24} />;
    if (index === 2) return <Medal className="text-amber-600 drop-shadow-[0_0_8px_rgba(180,83,9,0.5)]" size={24} />;
    return <span className="text-gray-500 font-bold text-sm w-6 text-center">{index + 1}</span>;
  };

  return (
    <main className="p-6 pt-12 min-h-screen bg-black text-white pb-28">
      {/* Заголовок */}
      <header className="mb-6">
        <h1 className="text-4xl font-black tracking-tighter uppercase italic shadow-neon">
          Рейтинг ELO
        </h1>
        <p className="text-gray-500 text-xs mt-1">Топ гравців настільного тенісу ЧДТУ</p>
      </header>

      {/* Пошук */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input 
          type="text" 
          placeholder="Пошук гравця за ніком..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none text-sm text-white focus:border-blue-500 focus:bg-white/5 transition-all"
        />
      </div>

      {/* Список лідерів */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : filteredPlayers.length > 0 ? (
          filteredPlayers.map((player, index) => {
            const isTop3 = index < 3;
            return (
              <div 
                key={player.id} 
                className={`
                  flex items-center justify-between p-4 rounded-2xl backdrop-blur-md transition-all active:scale-[0.99]
                  ${isTop3 
                    ? 'bg-gradient-to-r from-blue-950/30 to-slate-900/40 border border-blue-500/20' 
                    : 'bg-slate-900/20 border border-white/5'}
                `}
              >
                <div className="flex items-center space-x-4">
                  {/* Медаль або місце */}
                  <div className="w-8 flex justify-center">
                    {renderRank(index)}
                  </div>
                  
                  {/* Динамічна аватарка користувача */}
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 overflow-hidden relative">
                    {player.avatar_url ? (
                      <img 
                        src={player.avatar_url} 
                        alt={player.nickname || 'Гравець'} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={18} className={isTop3 ? "text-blue-400" : "text-gray-500"} />
                    )}
                  </div>

                  {/* Нікнейм та статус */}
                  <div>
                    <h4 className={`font-bold ${isTop3 ? 'text-white' : 'text-gray-300'}`}>
                      {player.nickname || 'Без нікнейму'}
                    </h4>
                    {isTop3 && <span className="text-[9px] text-blue-500 uppercase tracking-widest font-black">Leader</span>}
                  </div>
                </div>

                {/* Очки Elo */}
                <div className="text-right">
                  <span className="text-xl font-black tabular-nums text-white">
                    {player.elo || 1000}
                  </span>
                  <span className="text-[9px] text-gray-500 block uppercase font-bold tracking-widest">PTS</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/5 rounded-3xl text-gray-600">
            <Trophy size={48} className="mb-4 opacity-10" />
            <p className="font-medium">Гравців не знайдено</p>
          </div>
        )}
      </div>
    </main>
  );
}