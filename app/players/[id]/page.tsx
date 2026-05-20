'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User, ChevronLeft } from 'lucide-react';

export default function PublicPlayerProfile({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayer = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', params.id)
        .single();
      if (data) setPlayer(data);
      setLoading(false);
    };
    fetchPlayer();
  }, [params.id]);

  if (loading) return <div className="text-center p-10 text-zinc-500">Завантаження...</div>;
  if (!player) return <div className="text-center p-10 text-zinc-500">Гравця не знайдено.</div>;

  return (
    <div className="p-6 max-w-md mx-auto space-y-6 select-none">
      <button 
        onClick={() => router.push('/players')}
        className="flex items-center gap-1 text-xs text-zinc-500 hover:text-white transition"
      >
        <ChevronLeft size={16} /> Назад до рейтингу
      </button>

      {/* КАРТКА ПЕРЕГЛЯДУ ЧУЖОГО ПРОФІЛЮ */}
      <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6 flex flex-col items-center space-y-4 shadow-2xl">
        <div className="w-20 h-20 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center text-zinc-600">
          <User size={40} />
        </div>

        <div className="text-center space-y-1">
          {/* Головний — НІКНЕЙМ */}
          <h2 className="text-xl font-black text-white tracking-wide">@{player.nickname}</h2>
          
          {/* Справжні дані видно ТІЛЬКИ ТУТ */}
          <p className="text-sm font-semibold text-blue-500 uppercase tracking-wider text-[11px] mt-2">Справжнє ім'я:</p>
          <p className="text-base font-bold text-zinc-300">
            {player.real_name} {player.real_surname}
          </p>
        </div>

        <div className="w-full border-t border-white/5 pt-4 text-center">
          <span className="text-xl font-black font-mono text-white">{player.elo ?? 1000}</span>
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Рейтинг ELO</p>
        </div>
      </div>
    </div>
  );
}