'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Camera, LogOut, ShieldAlert } from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
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

  if (!profile) return <div className="p-10 text-center">Завантаження...</div>;

  return (
    <div className="p-6 max-w-md mx-auto space-y-6">
      <h1 className="text-3xl font-black text-white">Мій Профіль</h1>

      <div className="bg-zinc-950 border border-white/5 rounded-3xl p-8 flex flex-col items-center space-y-6 shadow-2xl">
        {/* АВАТАРКА */}
        <div className="relative group">
          <div className="w-32 h-32 rounded-3xl bg-zinc-900 border-2 border-white/10 overflow-hidden flex items-center justify-center">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} className="w-full h-full object-cover" />
            ) : (
              <User size={50} className="text-zinc-700" />
            )}
          </div>
          <label className="absolute bottom-[-10px] right-[-10px] bg-blue-600 p-3 rounded-2xl cursor-pointer hover:bg-blue-500 transition shadow-xl">
            {uploading ? <div className="animate-spin text-white">...</div> : <Camera size={20} text-white />}
            <input type="file" accept="image/*" onChange={uploadAvatar} disabled={uploading} className="hidden" />
          </label>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-black text-white italic">@{profile.nickname}</h2>
          <p className="text-blue-500 font-bold mt-1">
            {profile.real_name} {profile.real_surname}
          </p>
        </div>

        <div className="w-full border-t border-white/5 pt-6 text-center">
          <span className="text-4xl font-black font-mono text-white">{profile.elo ?? 1000}</span>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold mt-1">Поточний рейтинг ELO</p>
        </div>
      </div>

      <div className="bg-zinc-950/50 border border-red-500/10 p-4 rounded-2xl flex gap-3">
        <ShieldAlert className="text-red-500 shrink-0" size={20} />
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          Дані ПІБ та Нікнейм фіксуються при реєстрації. Зміна неможлива для захисту від махінацій.
        </p>
      </div>

      <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())}
        className="w-full bg-zinc-900 text-zinc-500 p-4 rounded-2xl font-bold hover:text-red-500 transition">
        ВИЙТИ З АКАУНТА
      </button>
    </div>
  );
}