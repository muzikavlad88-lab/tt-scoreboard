'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation'; // Імпортуємо роутер для переходу
import { Trophy, Award, Search, User } from 'lucide-react';

export default function PlayersRatingPage() {
  const router = useRouter(); // Ініціалізуємо роутер
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRating = async () => {
      try {
        // Завантажуємо профілі, відсортовані за рейтингом Elo
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('elo', { ascending: false });

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

  // Фільтрація гравців за нікнеймом
  const filteredProfiles = profiles.filter(p => 
    (p.nickname || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="text-center p-10 text-zinc-500 text-sm">Завантаження рейтингу гравців...</div>;
  }

  return (
    <div className="p-6 max-w-md mx-auto space-y-6 select-none touch-manipulation">
      
      {/* ЗАГОЛОВОК СТОРІНКИ */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">Рейтинг Гравців</h1>
        <p className="text-xs text-zinc-500">Поточна таблиця лідерів Elo</p>
      </div>

      {/* ПОШУК ГРАВЦЯ */}
      <div className="relative">
        <Search className="absolute left-3 top-3.5 text-zinc-600" size={18} />
        <input 
          type="text" 
          placeholder="Знайти гравця за нікнеймом..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-950 border border-white/5 text-white rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 transition h-12"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        />
      </div>

      {/* СПИСОК РЕЙТИНГУ */}
      <div className="space-y-3">
        {filteredProfiles.length === 0 ? (
          <p className="text-xs text-zinc-600 text-center py-10">Гравців не знайдено</p>
        ) : (
          filteredProfiles.map((player, index) => {
            const isFirst = index === 0;
            const isSecond = index === 1;
            const isThird = index === 2;

            return (
              <div 
                key={player.id} 
                onClick={() => router.push(`/players/${player.id}`)} // ФІКС: Клік переводить на сторінку імені
                className={`cursor-pointer active:scale-[0.98] bg-zinc-950 border p-4 rounded-xl flex items-center justify-between transition-all ${
                  isFirst ? 'border-yellow-500/30 bg-gradient-to-r from-zinc-950 to-yellow-500/5' : 'border-white/5 hover:border-white/10'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <div className="flex items-center gap-4">
                  
                  {/* ІКОНКА МІСЦЯ В РЕЙТИНГУ */}
                  <div className="w-8 flex items-center justify-center font-mono text-sm font-bold">
                    {isFirst && <Trophy className="text-yellow-500 animate-pulse" size={22} />}
                    {isSecond && <Trophy className="text-zinc-400" size={20} />}
                    {isThird && <Award className="text-amber-600" size={20} />}
                    {!isFirst && !isSecond && !isThird && <span className="text-zinc-600">#{index + 1}</span>}
                  </div>

                  {/* АВАТАРКА ГРАВЦЯ */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-900 border border-white/10 flex items-center justify-center relative">
                    {player.avatar_url ? (
                      <img 
                        src={player.avatar_url} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="text-zinc-700" size={20} />
                    )}
                  </div>

                  {/* ВІДОБРАЖЕННЯ НІКНЕЙМУ ТА СТАТУСІВ */}
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white tracking-wide">
                      @{player.nickname || 'Anonym'}
                    </span>
                    
                    {/* Статуси лідерів */}
                    {index === 0 && (
                      <span className="text-blue-500 text-[9px] uppercase font-black tracking-widest mt-0.5">
                        Leader 🔥
                      </span>
                    )}
                    {index === 1 && (
                      <span className="text-zinc-400 text-[9px] uppercase font-semibold tracking-wider mt-0.5">
                        Екс-лідер
                      </span>
                    )}
                    {index === 2 && (
                      <span className="text-amber-600 text-[9px] uppercase font-medium tracking-wider mt-0.5 italic">
                        теж не погано 🥉
                      </span>
                    )}
                  </div>
                </div>

                {/* ОЧКИ ELO */}
                <div className="text-right">
                  <span className="text-base font-black text-white font-mono">
                    {player.elo ?? 1000}
                  </span>
                  <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-medium">PTS</p>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}