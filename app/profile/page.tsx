'use client';
export const dynamic = 'force-dynamic';


import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Camera, ShieldAlert, Swords, Target, TrendingUp, TrendingDown, RefreshCw, Bug } from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rawJson, setRawJson] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setIsRefreshing(true);
    setErrorMessage(null);
    try {
      // 1. Перевіряємо поточну сесію авторизації
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw new Error(`Помилка авторизації: ${authError.message}`);
      if (!user) {
        setErrorMessage("Користувач не авторизований в системі! Зайдіть в акаунт знову.");
        return;
      }

      // 2. Робимо прямий запит до таблиці profiles
      const { data, error: dbError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(); // Використовуємо maybeSingle, щоб не падати при відсутності рядка
      
      if (dbError) throw new Error(`Помилка бази даних (Supabase): ${dbError.message}`);
      
      if (!data) {
        setErrorMessage(`Рядок профілю для вашого ID (${user.id}) взагалі не знайдено в таблиці profiles! Перевірте тригер або внесіть користувача вручну.`);
        setRawJson(JSON.stringify({ user_auth_id: user.id, email: user.email }, null, 2));
        return;
      }

      // Зберігаємо сирі дані для діагностичного блоку
      setRawJson(JSON.stringify(data, null, 2));
      setProfile(data);
    } catch (error: any) {
      console.error("Діагностика зафіксувала помилку:", error);
      setErrorMessage(error.message || "Невідома помилка при завантаженні даних");
    } finally {
      setIsRefreshing(false);
    }
  }

  async function uploadAvatar(event: any) {
    try {
      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
      
      fetchProfile();
      alert('Фото оновлено!');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  }

  // ЕКРАН КРИТИЧНОЇ ПОМИЛКИ (Виведеться, якщо Supabase заблокує запит)
  if (errorMessage) {
    return (
      <div className="p-4 max-w-md mx-auto space-y-6 pt-10">
        <div className="bg-zinc-950 border border-red-500/20 rounded-[30px] p-6 text-center space-y-4 shadow-2xl">
          <div className="mx-auto w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
            <Bug size={24} />
          </div>
          <h1 className="text-red-500 text-xl font-black uppercase tracking-tight">Діагностика Помилки</h1>
          <p className="text-zinc-400 text-xs text-left bg-zinc-900/50 p-4 rounded-xl border border-white/5 font-mono leading-relaxed break-words">
            {errorMessage}
          </p>
          {rawJson && (
            <div className="text-left space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest pl-1">Технічний контекст:</span>
              <pre className="text-[10px] text-zinc-500 bg-zinc-900/30 p-3 rounded-lg overflow-x-auto font-mono">
                {rawJson}
              </pre>
            </div>
          )}
          <button 
            onClick={fetchProfile} 
            className="w-full bg-red-600 text-white p-3.5 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            Перевірити знову
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return <div className="p-10 text-center text-zinc-500 font-bold animate-pulse">З'єднання із сервером Supabase...</div>;

  // ОБЧИСЛЕННЯ СТАТИСТИКИ (Захищено через примусовий парсинг у Number)
  const totalWins = Number(profile.wins ?? 0);
  const totalLosses = Number(profile.losses ?? 0);
  const totalMatches = totalWins + totalLosses;
  const winRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

  return (
    <div className="p-4 max-w-md mx-auto space-y-6 select-none touch-manipulation pb-24">
      <div className="flex justify-between items-center pt-4">
        <h1 className="text-3xl font-black text-white italic uppercase tracking-tight">Мій Профіль</h1>
        <button 
          onClick={fetchProfile} 
          disabled={isRefreshing}
          className="p-3 bg-zinc-950 border border-white/5 text-zinc-400 hover:text-white rounded-2xl active:scale-95 transition-all"
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin text-blue-500" : ""} />
        </button>
      </div>

      <div className="bg-zinc-950 border border-white/5 rounded-[30px] p-6 flex flex-col items-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-600/10 to-transparent"></div>

        {/* АВАТАРКА */}
        <div className="relative group z-10">
          <div className="w-28 h-28 rounded-[24px] bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center shadow-xl">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} className="w-full h-full object-cover" />
            ) : (
              <User size={44} className="text-zinc-600" />
            )}
          </div>
          <label className="absolute bottom-[-8px] right-[-8px] bg-blue-600 p-2.5 rounded-xl cursor-pointer hover:bg-blue-500 transition shadow-xl border border-black/50">
            {uploading ? <div className="animate-spin text-white text-xs">...</div> : <Camera size={16} className="text-white" />}
            <input type="file" accept="image/*" onChange={uploadAvatar} disabled={uploading} className="hidden" />
          </label>
        </div>

        {/* ІНФО КОРИСТУВАЧА */}
        <div className="text-center w-full space-y-1 z-10">
          <h2 className="text-2xl font-black text-white tracking-tight italic">@{profile.nickname || 'anonym'}</h2>
          <p className="text-blue-500 font-bold text-xs uppercase tracking-wide">
            {profile.real_name || 'Не вказано'} {profile.real_surname || ''}
          </p>
        </div>

        {/* РЕЙТИНГ ELO */}
        <div className="w-full border-t border-white/5 pt-5 text-center z-10">
          <span className="text-4xl font-black font-mono text-white tracking-tighter">{profile.elo ?? 1000}</span>
          <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mt-0.5">Поточний рейтинг ELO</p>
        </div>
      </div>

      {/* БЛОКИ СТАТИСТИКИ */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-950 border border-white/5 rounded-[20px] p-4 flex flex-col gap-2 shadow-md">
          <Swords size={18} className="text-zinc-500" />
          <div>
            <span className="text-xl font-black text-white font-mono">{totalMatches}</span>
            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Матчів</p>
          </div>
        </div>

        <div className="bg-zinc-950 border border-white/5 rounded-[20px] p-4 flex flex-col gap-2 shadow-md">
          <Target size={18} className="text-yellow-500" />
          <div>
            <span className="text-xl font-black text-white font-mono">{winRate}%</span>
            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Winrate</p>
          </div>
        </div>

        <div className="bg-emerald-950/10 border border-emerald-500/10 rounded-[20px] p-4 flex flex-col gap-2 shadow-sm">
          <TrendingUp size={18} className="text-emerald-500" />
          <div>
            <span className="text-xl font-black text-emerald-500 font-mono">{totalWins}</span>
            <p className="text-[9px] text-emerald-500/50 uppercase font-bold tracking-wider">Перемог</p>
          </div>
        </div>

        <div className="bg-red-950/10 border border-red-500/10 rounded-[20px] p-4 flex flex-col gap-2 shadow-sm">
          <TrendingDown size={18} className="text-red-500" />
          <div>
            <span className="text-xl font-black text-red-500 font-mono">{totalLosses}</span>
            <p className="text-[9px] text-red-500/50 uppercase font-bold tracking-wider">Поразок</p>
          </div>
        </div>
      </div>

      <div className="bg-zinc-950/50 border border-red-500/10 p-4 rounded-2xl flex gap-3">
        <ShieldAlert className="text-red-500 shrink-0" size={20} />
        <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
          Дані ПІБ та Нікнейм фіксуються при реєстрації. Зміна неможлива для захисту від махінацій.
        </p>
      </div>

      <button 
        onClick={() => supabase.auth.signOut().then(() => window.location.reload())}
        className="w-full bg-zinc-950 border border-white/5 text-zinc-500 p-4 rounded-2xl font-bold hover:text-red-500 active:scale-95 transition-all uppercase tracking-wider text-xs"
      >
        Вийти з акаунта
      </button>
    </div>
  );
}