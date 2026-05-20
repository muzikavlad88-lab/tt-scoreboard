'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      // Питаємо в бази даних, чи є активна сесія в браузері
      const { data: { session } } = await supabase.auth.getSession();

      if (!session && pathname !== '/login') {
        // Якщо сесії немає і ми не на сторінці логіну — виганяємо на логін
        router.push('/login');
      } else if (session && pathname === '/login') {
        // Якщо сесія є, але людина зайшла на логін — кидаємо на головну
        router.push('/');
      } else {
        // У всіх інших випадках — пропускаємо
        setIsAuthorized(true);
      }
    };

    checkUser();

    // Слухач на випадок, якщо користувач натисне "Вийти" або щойно зареєструється
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session && pathname !== '/login') {
        router.push('/login');
      } else if (session && pathname === '/login') {
        router.push('/');
        setIsAuthorized(true);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, [pathname, router]);

  // Поки перевіряємо, показуємо чорний екран з лоадером (щоб не блимав прихований контент)
  if (!isAuthorized && pathname !== '/login') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  // Якщо все ок — показуємо сторінку
  return <>{children}</>;
}