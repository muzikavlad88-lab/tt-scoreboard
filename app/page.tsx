'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trophy, Users, Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [players, setPlayers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); 
  const [loadingRole, setLoadingRole] = useState(true);
  
  const [matchType, setMatchType] = useState<'1v1' | '2v2'>('1v1');
  const [player1Id, setPlayer1Id] = useState(''); 
  const [player2Id, setPlayer2Id] = useState(''); 
  const [player3Id, setPlayer3Id] = useState(''); 
  const [player4Id, setPlayer4Id] = useState(''); 
  const [winnerTeam, setWinnerTeam] = useState<'team1' | 'team2' | ''>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const { data: playersData } = await supabase.from('profiles').select('*').order('nickname');
        if (playersData) setPlayers(playersData);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          
          if (profileData && profileData.role === 'admin') {
            setIsAdmin(true);
          }
        }
      } catch (error) {
        console.error('Помилка завантаження даних:', error);
      } finally {
        setLoadingRole(false);
      }
    }
    loadInitialData();
  }, []);

  const handleSaveMatch = async () => {
    if (!isAdmin) {
      alert('Помилка доступу: Тільки адміністратори можуть записувати матчі!');
      return;
    }

    if (matchType === '1v1' && (!player1Id || !player2Id || !winnerTeam)) {
      alert('Обери обох гравців та переможця!');
      return;
    }
    if (matchType === '2v2' && (!player1Id || !player2Id || !player3Id || !player4Id || !winnerTeam)) {
      alert('Заповни всі 4 гравці та обери команду-переможця!');
      return;
    }

    const selectedIds = matchType === '1v1' ? [player1Id, player2Id] : [player1Id, player2Id, player3Id, player4Id];
    const hasDuplicates = new Set(selectedIds).size !== selectedIds.length;
    if (hasDuplicates) {
      alert('Один і той самий гравець не може бути обраний кілька разів у матчі!');
      return;
    }

    setIsSaving(true);

    try {
      const p1 = players.find(p => p.id === player1Id) || {};
      const p2 = players.find(p => p.id === player2Id) || {};
      const p3 = matchType === '2v2' ? (players.find(p => p.id === player3Id) || {}) : {};
      const p4 = matchType === '2v2' ? (players.find(p => p.id === player4Id) || {}) : {};

      const currentElo1 = Number(p1.elo ?? 1000);
      const currentElo2 = Number(p2.elo ?? 1000);
      const currentElo3 = matchType === '2v2' ? Number(p3.elo ?? 1000) : 1000;
      const currentElo4 = matchType === '2v2' ? Number(p4.elo ?? 1000) : 1000;

      let side1Rating = 1000;
      let side2Rating = 1000;

      if (matchType === '1v1') {
        side1Rating = currentElo1;
        side2Rating = currentElo2;
      } else {
        side1Rating = (currentElo1 + currentElo3) / 2;
        side2Rating = (currentElo2 + currentElo4) / 2;
      }

      const ratingDiff = Math.abs(side1Rating - side2Rating);
      const isSide1Stronger = side1Rating > side2Rating;

      let team1WinGain = matchType === '1v1' ? 20 : 25;
      let team2WinGain = matchType === '1v1' ? 20 : 25;

      if (ratingDiff >= 200) {
        if (isSide1Stronger) {
          team1WinGain = 10; 
          team2WinGain = 30; 
        } else {
          team1WinGain = 30; 
          team2WinGain = 10; 
        }
      }

      let pointsWon = 0;
      let pointsLost = 0;

      let elo1 = currentElo1;
      let elo2 = currentElo2;
      let elo3 = currentElo3;
      let elo4 = currentElo4;

      if (matchType === '1v1') {
        if (winnerTeam === 'team1') {
          const actualPenalty = ratingDiff >= 200 && isSide1Stronger ? 30 : team1WinGain;
          elo1 = currentElo1 + team1WinGain;
          elo2 = currentElo2 - actualPenalty;
          pointsWon = team1WinGain;
          pointsLost = actualPenalty;
        } else {
          const actualPenalty = ratingDiff >= 200 && !isSide1Stronger ? 30 : team2WinGain;
          elo2 = currentElo2 + team2WinGain;
          elo1 = currentElo1 - actualPenalty;
          pointsWon = team2WinGain;
          pointsLost = actualPenalty;
        }

        await supabase.from('profiles').update({ elo: elo1 }).eq('id', player1Id);
        await supabase.from('profiles').update({ elo: elo2 }).eq('id', player2Id);
      } else {
        if (winnerTeam === 'team1') {
          const actualPenalty = ratingDiff >= 200 && isSide1Stronger ? 30 : team1WinGain;
          elo1 = currentElo1 + team1WinGain;
          elo3 = currentElo3 + team1WinGain;
          elo2 = currentElo2 - actualPenalty;
          elo4 = currentElo4 - actualPenalty;
          pointsWon = team1WinGain;
          pointsLost = actualPenalty;
        } else {
          const actualPenalty = ratingDiff >= 200 && !isSide1Stronger ? 30 : team2WinGain;
          elo2 = currentElo2 + team2WinGain;
          elo4 = currentElo4 + team2WinGain;
          elo1 = currentElo1 - actualPenalty;
          elo3 = currentElo3 - actualPenalty;
          pointsWon = team2WinGain;
          pointsLost = actualPenalty;
        }

        await supabase.from('profiles').update({ elo: elo1 }).eq('id', player1Id);
        await supabase.from('profiles').update({ elo: elo3 }).eq('id', player3Id);
        await supabase.from('profiles').update({ elo: elo2 }).eq('id', player2Id);
        await supabase.from('profiles').update({ elo: elo4 }).eq('id', player4Id);
      }

      await supabase.from('challenges').insert({
        challenger_id: player1Id,
        challenger2_id: matchType === '2v2' ? player3Id : null, 
        defender_id: player2Id,
        defender2_id: matchType === '2v2' ? player4Id : null,   
        status: 'completed',
        score1: winnerTeam === 'team1' ? 11 : 0, 
        score2: winnerTeam === 'team2' ? 11 : 0
      });

      alert(`Матч збережено! Переможці: +${pointsWon} PTS | Програвші: -${pointsLost} PTS 🏓`);
      
      setIsModalOpen(false);
      setPlayer1Id(''); setPlayer2Id(''); setPlayer3Id(''); setPlayer4Id('');
      setWinnerTeam('');
      
      window.location.reload();

    } catch (error: any) {
      alert(`Помилка під час збереження результату: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-6 select-none touch-manipulation">
      <div className="text-center pt-8 pb-4">
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">TT Scoreboard</h1>
        <p className="text-xs text-zinc-500 mt-1">Система автоматичних матчів</p>
      </div>

      {!loadingRole && isAdmin && (
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-[24px] p-8 flex flex-col items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_0_40px_rgba(37,99,235,0.2)]"
        >
          <div className="bg-white/20 p-4 rounded-full">
            <Plus size={32} className="text-white" />
          </div>
          <span className="text-xl font-black tracking-widest uppercase">Внести Результат</span>
        </button>
      )}

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => router.push('/players')}
          className="bg-zinc-950 border border-white/5 p-6 rounded-[24px] flex flex-col items-center gap-2 active:scale-95 transition-all"
        >
          <Trophy size={28} className="text-yellow-500" />
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Рейтинг</span>
        </button>
        <button 
          onClick={() => router.push('/profile')}
          className="bg-zinc-950 border border-white/5 p-6 rounded-[24px] flex flex-col items-center gap-2 active:scale-95 transition-all"
        >
          <Users size={28} className="text-blue-500" />
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Профіль</span>
        </button>
      </div>

      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-white/10 rounded-[30px] w-full max-w-sm overflow-hidden flex flex-col shadow-2xl relative my-auto">
            
            <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 text-zinc-500 hover:text-white p-2">
              <X size={20} />
            </button>

            <div className="p-6 pb-2 text-center">
              <h2 className="text-xl font-black text-white italic uppercase tracking-tight">Внести результат</h2>
              <p className="text-[9px] text-blue-500 font-bold uppercase tracking-wider mt-1">Панель Адміністратора</p>
            </div>

            <div className="px-6 pb-4 space-y-4">
              <div className="flex bg-zinc-900 p-1 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => { setMatchType('1v1'); setPlayer3Id(''); setPlayer4Id(''); setWinnerTeam(''); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${matchType === '1v1' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
                >
                  1 на 1
                </button>
                <button
                  type="button"
                  onClick={() => { setMatchType('2v2'); setWinnerTeam(''); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${matchType === '2v2' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
                >
                  2 на 2
                </button>
              </div>

              <div className="space-y-2 p-3 bg-zinc-900/40 rounded-2xl border border-white/5">
                <label className="text-[10px] text-blue-500 font-black uppercase tracking-widest block pl-1">
                  {matchType === '1v1' ? 'Гравець 1' : 'Команда 1 (Пара)'}
                </label>
                <select 
                  value={player1Id} 
                  onChange={e => { setPlayer1Id(e.target.value); setWinnerTeam(''); }}
                  className="w-full bg-zinc-900 border border-white/5 text-white rounded-xl p-3 text-sm outline-none appearance-none h-12"
                >
                  <option value="">Обери гравця...</option>
                  {players.map((p: any) => (
                    <option key={p.id} value={p.id}>@{p.nickname} ({p.elo ?? 1000}) {p.real_name ? `— ${p.real_name}` : ''}</option>
                  ))}
                </select>

                {matchType === '2v2' && (
                  <select 
                    value={player3Id} 
                    onChange={e => { setPlayer3Id(e.target.value); setWinnerTeam(''); }}
                    className="w-full bg-zinc-900 border border-white/5 text-white rounded-xl p-3 text-sm outline-none appearance-none h-12 mt-2"
                  >
                    <option value="">Обери другого гравця...</option>
                    {players.map((p: any) => (
                      <option key={`p3-${p.id}`} value={p.id} disabled={p.id === player1Id}>
                        @{p.nickname} ({p.elo ?? 1000}) {p.real_name ? `— ${p.real_name}` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-2 p-3 bg-zinc-900/40 rounded-2xl border border-white/5">
                <label className="text-[10px] text-emerald-500 font-black uppercase tracking-widest block pl-1">
                  {matchType === '1v1' ? 'Гравець 2' : 'Команда 2 (Пара)'}
                </label>
                <select 
                  value={player2Id} 
                  onChange={e => { setPlayer2Id(e.target.value); setWinnerTeam(''); }}
                  className="w-full bg-zinc-900 border border-white/5 text-white rounded-xl p-3 text-sm outline-none appearance-none h-12"
                >
                  <option value="">Обери гравця...</option>
                  {players.map((p: any) => (
                    <option key={`p2-${p.id}`} value={p.id} disabled={p.id === player1Id || p.id === player3Id}>
                      @{p.nickname} ({p.elo ?? 1000}) {p.real_name ? `— ${p.real_name}` : ''}
                    </option>
                  ))}
                </select>

                {matchType === '2v2' && (
                  <select 
                    value={player4Id} 
                    onChange={e => { setPlayer4Id(e.target.value); setWinnerTeam(''); }}
                    className="w-full bg-zinc-900 border border-white/5 text-white rounded-xl p-3 text-sm outline-none appearance-none h-12 mt-2"
                  >
                    <option value="">Обери другого гравця...</option>
                    {players.map((p: any) => (
                      <option key={`p4-${p.id}`} value={p.id} disabled={p.id === player1Id || p.id === player2Id || p.id === player3Id}>
                        @{p.nickname} ({p.elo ?? 1000}) {p.real_name ? `— ${p.real_name}` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {player1Id && player2Id && (matchType === '1v1' || (player3Id && player4Id)) && (
                <div className="pt-1">
                  <label className="text-[9px] text-yellow-500 font-black uppercase tracking-widest text-center block mb-2">Хто отримав перемогу? 🏆</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setWinnerTeam('team1')}
                      className={`flex-1 py-3 px-2 rounded-xl text-xs font-black border truncate ${winnerTeam === 'team1' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' : 'bg-zinc-900 border-white/5 text-zinc-400'}`}
                    >
                      {matchType === '1v1' ? `@${players.find((p:any) => p.id === player1Id)?.nickname}` : 'Команда 1 👑'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setWinnerTeam('team2')}
                      className={`flex-1 py-3 px-2 rounded-xl text-xs font-black border truncate ${winnerTeam === 'team2' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' : 'bg-zinc-900 border-white/5 text-zinc-400'}`}
                    >
                      {matchType === '1v1' ? `@${players.find((p:any) => p.id === player2Id)?.nickname}` : 'Команда 2 👑'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/5 bg-zinc-950">
              <button 
                onClick={handleSaveMatch}
                disabled={isSaving || !winnerTeam}
                className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest ${isSaving || !winnerTeam ? 'bg-zinc-900 text-zinc-600' : 'bg-blue-600 text-white'}`}
              >
                {isSaving ? 'Збереження...' : 'Зберегти матч'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}