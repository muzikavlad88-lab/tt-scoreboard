'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Trophy, Users, Activity, ChevronRight, Swords, X, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stats, setStats] = useState({ tournaments: 0, players: 0 });
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [opponents, setOpponents] = useState<any[]>([]);
  const [selectedOpponent, setSelectedOpponent] = useState('');
  const [matchResult, setMatchResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(true);

  useEffect(() => {
    document.title = 'Головна | TT Scoreboard';
    fetchInitialData();
    fetchRecentMatches();
  }, []);

  async function fetchInitialData() {
    const { count: tCount } = await supabase.from('tournaments').select('*', { count: 'exact', head: true });
    const { count: pCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    setStats({ tournaments: tCount || 0, players: pCount || 0 });

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setCurrentUser(profile);

      const { data: others } = await supabase.from('profiles').select('*').neq('id', user.id);
      if (others) setOpponents(others);
    }
  }

  async function fetchRecentMatches() {
    setLoadingMatches(true);
    try {
      const { data } = await supabase
        .from('matches')
        .select(`
          id, result, elo_change_p1, elo_change_p2, created_at,
          p1:player1_id(nickname, avatar_url),
          p2:player2_id(nickname, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) setRecentMatches(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMatches(false);
    }
  }

  function calculateEloChange(p1Elo: number, p2Elo: number, result: 'win' | 'lose' | 'draw') {
    const diff = Math.abs(p1Elo - p2Elo);
    const isP1Higher = p1Elo > p2Elo;
    let p1Change = 0; let p2Change = 0;

    if (diff >= 500) {
      if (result === 'win') { p1Change = isP1Higher ? 10 : 30; p2Change = isP1Higher ? -10 : -30; }
      else if (result === 'lose') { p1Change = isP1Higher ? -30 : -10; p2Change = isP1Higher ? 30 : 10; }
      else if (result === 'draw') { p1Change = isP1Higher ? 0 : 5; p2Change = isP1Higher ? 5 : 0; }
    } else {
      if (result === 'win') { p1Change = 20; p2Change = -20; }
      else if (result === 'lose') { p1Change = -20; p2Change = 20; }
      else if (result === 'draw') { p1Change = 5; p2Change = 5; }
    }
    return { p1Change, p2Change };
  }

  async function handleSubmitMatch(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOpponent || !matchResult || !currentUser) return;
    setSubmitting(true);

    try {
      const { data: opponent } = await supabase.from('profiles').select('elo').eq('id', selectedOpponent).single();
      if (!opponent) throw new Error('Супротивника не знайдено');

      const { p1Change, p2Change } = calculateEloChange(currentUser.elo, opponent.elo, matchResult);

      await supabase.from('profiles').update({ elo: currentUser.elo + p1Change }).eq('id', currentUser.id);
      await supabase.from('profiles').update({ elo: opponent.elo + p2Change }).eq('id', selectedOpponent);

      await supabase.from('matches').insert([{
        player1_id: currentUser.id,
        player2_id: selectedOpponent,
        result: matchResult,
        elo_change_p1: p1Change,
        elo_change_p2: p2Change
      }]);

      alert(`Матч успішно збережено! 🚀`);
      setIsModalOpen(false);
      setMatchResult(null);
      setSelectedOpponent('');
      fetchInitialData();
      fetchRecentMatches(); 
    } catch (error: any) {
      alert('Помилка: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="p-6 pt-12 min-h-screen bg-black text-white pb-28">
      <header className="mb-8">
        <h1 className="text-4xl font-black tracking-tighter uppercase italic shadow-neon">
          Dashboard
        </h1>
        <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest">Керування настільним тенісом</p>
      </header>

      {/* ОСЬ ЦЯ КНОПКА МАЄ З'ЯВИТИСЯ */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-[2rem] mb-8 flex items-center justify-between shadow-[0_0_40px_rgba(59,130,246,0.3)] active:scale-95 transition-all group"
      >
        <div className="text-left">
          <h2 className="text-2xl font-black uppercase tracking-tighter italic">Записати Матч</h2>
          <p className="text-blue-200 text-[10px] uppercase tracking-widest mt-1 font-bold">Оновити рейтинг ELO</p>
        </div>
        <div className="bg-white/20 p-4 rounded-2xl group-hover:rotate-12 transition-transform">
          <Swords size={32} className="text-white" />
        </div>
      </button>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-900/40 border border-blue-500/20 p-6 rounded-[2rem] backdrop-blur-md">
          <Trophy className="text-blue-500 mb-3" size={28} />
          <div className="text-4xl font-black tabular-nums tracking-tighter">{stats.tournaments}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-bold">Турнірів</div>
        </div>
        <div className="bg-slate-900/40 border border-purple-500/20 p-6 rounded-[2rem] backdrop-blur-md">
          <Users className="text-purple-500 mb-3" size={28} />
          <div className="text-4xl font-black tabular-nums tracking-tighter">{stats.players}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-bold">Гравців</div>
        </div>
      </div>

      {/* ОСТАННІ ІГРИ */}
      <section className="mb-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4 ml-1">Останні ігри</h3>
        <div className="space-y-3">
          {loadingMatches ? (
            <div className="flex justify-center py-4"><Loader2 className="animate-spin text-blue-500" size={24} /></div>
          ) : recentMatches.length > 0 ? (
            recentMatches.map((match) => (
              <div key={match.id} className="bg-slate-900/20 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-center bg-white/5 border border-white/10 p-2 rounded-xl text-xs font-bold min-w-[70px]">
                    <span className={match.result === 'win' ? 'text-green-400' : match.result === 'lose' ? 'text-red-400' : 'text-yellow-400'}>
                      {match.result === 'win' ? 'Перемога' : match.result === 'lose' ? 'Поразка' : 'Нічия'}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-gray-300">
                    {match.p1?.nickname || 'Гравець'} <span className="text-gray-600 font-medium">vs</span> {match.p2?.nickname || 'Гравець'}
                  </div>
                </div>
                <div className="text-[10px] tabular-nums text-gray-500 font-bold">
                  {match.elo_change_p1 > 0 ? `+${match.elo_change_p1}` : match.elo_change_p1} PTS
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-xs text-gray-600 py-4 border border-dashed border-white/5 rounded-2xl">Матчів ще немає</div>
          )}
        </div>
      </section>

      {/* МОДАЛКА МАТЧУ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-end justify-center pb-6 px-4">
          <div className="bg-[#0a0a0a] border border-blue-500/30 w-full max-w-[400px] rounded-[2.5rem] p-8 relative animate-in slide-in-from-bottom-10">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X size={24} /></button>
            <h2 className="text-2xl font-black mb-8 italic uppercase tracking-tighter shadow-neon">Внести результат</h2>
            <form onSubmit={handleSubmitMatch} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-blue-500 font-bold ml-1">Супротивник</label>
                <select value={selectedOpponent} onChange={(e) => setSelectedOpponent(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 outline-none text-white focus:border-blue-500 appearance-none" required>
                  <option value="" disabled className="bg-black text-gray-500">Обери гравця...</option>
                  {opponents.map(opp => (
                    <option key={opp.id} value={opp.id} className="bg-slate-900">{opp.nickname || 'Гравець'} ({opp.elo} PTS)</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-blue-500 font-bold ml-1">Твій результат</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setMatchResult('win')} className={`py-4 rounded-2xl font-black uppercase text-xs tracking-wider border-2 transition-all ${matchResult === 'win' ? 'bg-green-500/20 border-green-500 text-green-400' : 'border-white/5 bg-white/5 text-gray-400'}`}>Перемога</button>
                  <button type="button" onClick={() => setMatchResult('draw')} className={`py-4 rounded-2xl font-black uppercase text-xs tracking-wider border-2 transition-all ${matchResult === 'draw' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : 'border-white/5 bg-white/5 text-gray-400'}`}>Нічия</button>
                  <button type="button" onClick={() => setMatchResult('lose')} className={`py-4 rounded-2xl font-black uppercase text-xs tracking-wider border-2 transition-all ${matchResult === 'lose' ? 'bg-red-500/20 border-red-500 text-red-400' : 'border-white/5 bg-white/5 text-gray-400'}`}>Поразка</button>
                </div>
              </div>
              <button type="submit" disabled={submitting || !selectedOpponent || !matchResult} className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50 mt-4">
                {submitting ? <Loader2 className="animate-spin mx-auto" size={24} /> : 'Зберегти матч'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}