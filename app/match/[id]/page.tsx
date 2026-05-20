'use client';

// КРИТИЧНИЙ ФІКС ДЛЯ VERCEL: динамічні параметри [id] не будуть ламати білд
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LiveMatchPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [matchData, setMatchData] = useState<any>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    const fetchChallenge = async () => {
      const { data } = await supabase
        .from('challenges')
        .select('*, challenger:challenger_id(name, nickname), defender:defender_id(name, nickname)')
        .eq('id', params.id)
        .single();
      
      if (data) {
        setMatchData(data);
        setScore1(data.score1 || 0);
        setScore2(data.score2 || 0);
        checkMatchStatus(data.score1 || 0, data.score2 || 0, data);
      }
    };
    fetchChallenge();
  }, [params.id]);

  const checkMatchStatus = async (s1: number, s2: number, currentMatch: any) => {
    const p1Name = currentMatch.challenger.nickname || currentMatch.challenger.name || 'Гравець 1';
    const p2Name = currentMatch.defender.nickname || currentMatch.defender.name || 'Гравець 2';

    // Логіка: гра до 11, але якщо 10:10, то до переваги у 2 очки
    if (s1 >= 11 && (s1 - s2) >= 2) {
      setIsFinished(true);
      setWinner(p1Name);
      await autoSaveMatch(s1, s2);
    } else if (s2 >= 11 && (s2 - s1) >= 2) {
      setIsFinished(true);
      setWinner(p2Name);
      await autoSaveMatch(s1, s2);
    }
  };

  const autoSaveMatch = async (finalScore1: number, finalScore2: number) => {
    await supabase
      .from('challenges')
      .update({ 
        score1: finalScore1, 
        score2: finalScore2, 
        status: 'completed' 
      })
      .eq('id', params.id);
  };

  const updateScore = async (newScore1: number, newScore2: number) => {
    if (isFinished) return;

    setScore1(newScore1);
    setScore2(newScore2);

    await supabase
      .from('challenges')
      .update({ score1: newScore1, score2: newScore2 })
      .eq('id', params.id);

    checkMatchStatus(newScore1, newScore2, matchData);
  };

  if (!matchData) {
    return <div className="text-center p-10 text-zinc-500 text-sm">Завантаження матчу...</div>;
  }

  const name1 = matchData.challenger.nickname || matchData.challenger.name || 'Гравець 1';
  const name2 = matchData.defender.nickname || matchData.defender.name || 'Гравець 2';

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-2 select-none touch-manipulation">
      
      {isFinished ? (
        <div className="text-center mb-8 animate-pulse px-4">
          <h2 className="text-xl font-black text-yellow-500">🎉 Матч Завершено!</h2>
          <p className="text-xs text-zinc-400 mt-1">Переміг {winner}. Записано автоматично.</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 bg-zinc-900 border border-white/5 text-white px-5 py-2.5 rounded-xl text-xs font-bold active:scale-95 transition-all"
          >
            На Головну
          </button>
        </div>
      ) : (
        <h1 className="text-xs text-zinc-500 mb-8 tracking-widest uppercase font-bold">Прямий Ефір Матчу 🏓</h1>
      )}
      
      <div className="flex items-center justify-around w-full max-w-sm bg-zinc-950 p-6 rounded-2xl border border-white/5 shadow-2xl">
        
        {/* Гравець 1 */}
        <div className="flex flex-col items-center w-1/2">
          <span className="text-xs font-bold mb-4 text-center truncate w-full px-1 text-zinc-400">
            {name1}
          </span>
          <button 
            onClick={() => updateScore(score1 + 1, score2)}
            disabled={isFinished}
            className={`text-6xl font-black w-24 h-24 rounded-2xl flex items-center justify-center transition-all select-none touch-none ${
              isFinished 
                ? 'bg-zinc-900 text-zinc-700 border-zinc-800' 
                : 'bg-zinc-900 border border-blue-500/20 text-blue-500 active:scale-90'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {score1}
          </button>
          {!isFinished && (
            <button 
              onClick={() => score1 > 0 && updateScore(score1 - 1, score2)}
              className="mt-3 text-[10px] text-zinc-600 active:text-zinc-400 py-1 px-3"
            >
              мінус мінус
            </button>
          )}
        </div>

        <div className="text-xl text-zinc-800 font-light select-none">:</div>

        {/* Гравець 2 */}
        <div className="flex flex-col items-center w-1/2">
          <span className="text-xs font-bold mb-4 text-center truncate w-full px-1 text-zinc-400">
            {name2}
          </span>
          <button 
            onClick={() => updateScore(score1, score2 + 1)}
            disabled={isFinished}
            className={`text-6xl font-black w-24 h-24 rounded-2xl flex items-center justify-center transition-all select-none touch-none ${
              isFinished 
                ? 'bg-zinc-900 text-zinc-700 border-zinc-800' 
                : 'bg-zinc-900 border border-emerald-500/20 text-emerald-500 active:scale-90'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {score2}
          </button>
          {!isFinished && (
            <button 
              onClick={() => score2 > 0 && updateScore(score1, score2 - 1)}
              className="mt-3 text-[10px] text-zinc-600 active:text-zinc-400 py-1 px-3"
            >
              мінус мінус
            </button>
          )}
        </div>

      </div>
    </div>
  );
}