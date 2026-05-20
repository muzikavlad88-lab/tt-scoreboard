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
    // Якщо це внутрішня сторінка Next.js або сторінка 404, пропускаємо її без перевірок
    if (pathname?.startsWith('/_') || pathname === '/_not-found') {
      setIsAuthorized(true);
      return;
    }

    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session && pathname !== '/login') {
          router.push('/login');
        } else if (session && pathname === '/login') {
          router.push('/');
        } else {
          setIsAuthorized(true);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        // Дозволяємо рендер, якщо щось пішло не так під час білду
        setIsAuthorized(true); 
      }
    };

    checkUser();

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

  // Якщо це логін або системна сторінка — показуємо відразу
  if (pathname === '/login' || pathname?.startsWith('/_') || pathname === '/_not-found') {
    return <>{children}</>;
  }

  // Показуємо лоадер під час перевірки реальних сторінок
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return <>{children}</>;
}