'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, ChevronLeft, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PublicProfile({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getPlayer() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', params.id)
          .single();
        
        if (error) throw error;
        if (data) setPlayer(data);
      } catch (err) {
        console.error('Помилка завантаження профілю:', err);
      } finally {
        setLoading(false);
      }
    }
    getPlayer();
  }, [params.id]);

  if (loading) {
    return <div className="p-10 text-center text-zinc-500 text-sm">Завантаження профілю...</div>;
  }

  if (!player) {
    return (
      <div className="p-10 text-center text-zinc-500 text-sm space-y-4">
        <p>Гравця не знайдено або дані ще не заповнені.</p>
        <button 
          onClick={() => router.push('/players')} 
          className="text-blue-500 font-bold active:scale-95 transition-all text-xs"
        >
          Повернутись до рейтингу
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-6 select-none touch-manipulation">
      {/* КНОПКА НАЗАД */}
      <button 
        onClick={() => router.push('/players')} 
        className="flex items-center gap-1 text-zinc-500 hover:text-white transition-all text-xs py-2"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <ChevronLeft size={16} /> Назад до рейтингу
      </button>

      {/* КАРТКА ПУБЛІЧНОГО ПЕРЕГЛЯДУ */}
      <div className="bg-zinc-950 border border-white/5 rounded-3xl p-6 flex flex-col items-center space-y-6 shadow-2xl">
        
        {/* АВАТАРКА ГРАВЦЯ */}
        <div className="w-28 h-28 rounded-3xl bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center">
          {player.avatar_url ? (
            <img src={player.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User size={40} className="text-zinc-700" />
          )}
        </div>

        {/* НІКНЕЙМ ТА ПІБ */}
        <div className="text-center w-full space-y-4">
          <h2 className="text-2xl font-black text-white tracking-wide italic">
            @{player.nickname || 'anonym'}
          </h2>
          
          {/* Блок із закритими справжніми даними */}
          <div className="p-4 bg-zinc-900/40 rounded-2xl border border-white/5 space-y-1">
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Справжнє Ім'я та Прізвище</p>
            <p className="text-zinc-300 font-bold text-base">
              {player.real_name || 'Не вказано'} {player.real_surname || ''}
            </p>
          </div>
        </div>

        {/* СТАТИСТИКА ELO РЕЙТИНГУ */}
        <div className="w-full flex justify-around items-center pt-2 border-t border-white/5">
          <div className="text-center">
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Рейтинг</p>
            <p className="text-2xl font-black text-white font-mono mt-0.5">{player.elo ?? 1000}</p>
          </div>
          
          <div className="h-8 w-[1px] bg-white/5"></div>
          
          <div className="text-center flex flex-col items-center">
            <Trophy size={20} className="text-yellow-500" />
            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider mt-1">Гравець</p>
          </div>
        </div>

      </div>
    </div>
  );
}