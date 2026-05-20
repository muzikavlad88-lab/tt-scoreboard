'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Trophy, Plus, X, Loader2 } from 'lucide-react';

export default function TournamentsPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newTournamentName, setNewTournamentName] = useState('');

  useEffect(() => {
    document.title = 'Турніри | TT Scoreboard';

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        setUserRole(profile?.role || 'player');
      }
      await fetchTournaments();
      setLoading(false);
    }
    init();
  }, []);

  async function fetchTournaments() {
    const { data } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setTournaments(data);
  }

  async function handleCreateTournament(e: React.FormEvent) {
    e.preventDefault();
    if (!newTournamentName.trim()) return;

    const { data, error } = await supabase
      .from('tournaments')
      .insert([{ name: newTournamentName, status: 'Upcoming' }])
      .select();

    if (!error && data) {
      setTournaments((prev) => [data[0], ...prev]);
      setNewTournamentName('');
      setIsModalOpen(false);
    } else {
      alert('Помилка: ' + error?.message);
    }
  }

  return (
    <main className="p-6 pt-12 min-h-screen relative bg-black text-white">
      {/* --- ОСЬ ВІН, ТВІЙ ЗАГОЛОВОК --- */}
      <header className="mb-10">
        <h1 className="text-4xl font-black tracking-tighter uppercase italic shadow-neon">
          Турніри
        </h1>
        <p className="text-gray-500 text-sm mt-1">Список активних та майбутніх ігор</p>
      </header>
      {/* ----------------------------- */}

      <div className="space-y-4 pb-24">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : tournaments.length > 0 ? (
          tournaments.map((t: any) => (
            <div key={t.id} className="bg-slate-900/40 border border-blue-500/20 p-5 rounded-2xl backdrop-blur-md transition-all active:scale-[0.98]">
              <h3 className="text-xl font-bold">{t.name}</h3>
              <p className="text-blue-400 mt-2 text-xs font-black uppercase tracking-widest">{t.status}</p>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/5 rounded-3xl text-gray-600">
            <Trophy size={48} className="mb-4 opacity-10" />
            <p className="font-medium">Турнірів ще не створено</p>
          </div>
        )}
      </div>

      {userRole === 'admin' && (
        <button 
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(59,130,246,0.4)] z-10 active:scale-90 transition-all"
        >
          <Plus size={32} />
        </button>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-end justify-center pb-8 px-4">
          <div className="bg-[#0a0a0a] border border-blue-500/30 w-full max-w-[400px] rounded-[2.5rem] p-8 relative animate-in slide-in-from-bottom-20">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-black mb-8 italic uppercase tracking-tighter">Новий турнір</h2>
            
            <form onSubmit={handleCreateTournament} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-blue-500 font-bold ml-1">Назва івенту</label>
                <input 
                  type="text" 
                  placeholder="ADDWISE TOURNAMENT 2026"
                  value={newTournamentName}
                  onChange={(e) => setNewTournamentName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 outline-none text-white focus:border-blue-500 focus:bg-white/10 transition-all"
                  autoFocus
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
              >
                Створити
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}