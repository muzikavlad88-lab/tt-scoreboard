'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, Shield, Trophy, LogOut, Save, Loader2, Camera } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const [profile, setProfile] = useState({
    nickname: '',
    role: 'player',
    elo: 1000,
    avatar_url: '',
  });

  useEffect(() => {
    document.title = 'Профіль | TT Scoreboard';
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('nickname, role, elo, avatar_url')
          .eq('id', user.id)
          .single();

        if (data) {
          setProfile({
            nickname: data.nickname || '',
            role: data.role || 'player',
            elo: data.elo || 1000,
            avatar_url: data.avatar_url || '',
          });
        }
      }
    } catch (err) {
      console.error('Помилка завантаження профілю:', err);
    } finally {
      setLoading(false);
    }
  }

  // --- НОВА ФУНКЦІЯ: Завантаження аватарки ---
  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploadingAvatar(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Виберіть зображення для завантаження.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Користувач не авторизований');

      // Створюємо унікальне ім'я файлу (id користувача + випадкове число)
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Завантажуємо файл у бакет 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Отримуємо публічне посилання на файл
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Зберігаємо посилання в таблицю profiles
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Оновлюємо картинку на екрані
      setProfile((prev) => ({ ...prev, avatar_url: publicUrl }));
      alert('Аватарку успішно оновлено! 📸');

    } catch (error: any) {
      alert('Помилка завантаження: ' + error.message);
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profile.nickname.trim()) return;
    setSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return alert('Помилка: Тебе не знайдено в системі авторизації! ❌');

      const { data, error } = await supabase
        .from('profiles')
        .update({ nickname: profile.nickname })
        .eq('id', user.id)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        alert('Помилка: Рядок з твоїм ID не знайдено! ❌');
      } else {
        alert('Профіль успішно оновлено! ✅');
        router.refresh();
      }
    } catch (error: any) {
      alert('Помилка оновлення: ' + error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      router.push('/login');
      router.refresh();
    } catch (error) {
      window.location.href = '/login';
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <main className="p-6 pt-12 min-h-screen bg-black text-white flex flex-col pb-28">
      {/* Секція Аватара */}
      <header className="mb-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="relative inline-block">
          
          {/* Обгортка label робить всю зону клікабельною для завантаження файлу */}
          <label className="cursor-pointer block relative group">
            <div className={`w-28 h-28 bg-gradient-to-tr from-blue-600 via-blue-500 to-purple-600 rounded-[2.5rem] flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(59,130,246,0.3)] mx-auto overflow-hidden transition-transform active:scale-95 ${uploadingAvatar ? 'opacity-50' : ''}`}>
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={56} className="text-white" />
              )}
            </div>
            
            {/* Іконка камери, яка з'являється поверх */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem] mb-4">
              {uploadingAvatar ? (
                <Loader2 className="animate-spin text-white" size={32} />
              ) : (
                <Camera className="text-white" size={32} />
              )}
            </div>

            {/* Прихований input для вибору файлу */}
            <input 
              type="file" 
              accept="image/*"
              className="hidden" 
              onChange={handleAvatarUpload}
              disabled={uploadingAvatar}
            />
          </label>

          <div className="absolute -bottom-1 -right-1 bg-slate-900 border-2 border-black p-2 rounded-2xl text-blue-400 shadow-xl z-10">
            <Shield size={16} />
          </div>
        </div>
        
        <h1 className="text-3xl font-black uppercase tracking-tighter italic mt-2 shadow-neon">
          {profile.nickname || 'Мій Профіль'}
        </h1>
        <p className="text-blue-500/50 text-[10px] uppercase tracking-[0.3em] font-bold mt-1">{profile.role}</p>
      </header>

      {/* Картка з Рейтингом */}
      <div className="bg-slate-900/40 border border-blue-500/20 p-5 rounded-[2rem] mb-8 flex items-center justify-between backdrop-blur-xl relative overflow-hidden group">
        <div className="flex items-center space-x-4 relative z-10">
          <div className="p-3.5 bg-blue-500/10 rounded-2xl text-blue-500 border border-blue-500/10">
            <Trophy size={24} />
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Поточний Elo</div>
            <div className="text-3xl font-black text-white tabular-nums tracking-tighter">{profile.elo}</div>
          </div>
        </div>
      </div>

      {/* Форма */}
      <form onSubmit={handleUpdateProfile} className="space-y-6 flex-1">
        <div className="space-y-3">
          <label className="text-[10px] uppercase tracking-[0.2em] text-blue-500 font-black ml-1">Публічний Нікнейм</label>
          <input 
            type="text" 
            value={profile.nickname}
            onChange={(e) => setProfile({...profile, nickname: e.target.value})}
            placeholder="Введи свій нік"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 outline-none text-white focus:border-blue-500 focus:bg-white/10 transition-all font-medium"
          />
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center space-x-3 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          <span>Зберегти Нікнейм</span>
        </button>
      </form>

      <button 
        onClick={handleSignOut}
        className="w-full mt-6 py-4 text-red-500/60 font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center space-x-2 hover:text-red-500 transition-colors border border-red-500/10 rounded-2xl active:bg-red-500/5"
      >
        <LogOut size={16} />
        <span>Вийти з акаунта</span>
      </button>
    </main>
  );
}