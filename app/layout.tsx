'use client';
import { Inter } from "next/font/google";
import "./globals.css";
import AuthGuard from "./AuthGuard";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, Users, User } from 'lucide-react';
import { useEffect, useState } from 'react';

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Чекаємо, поки компонент завантажиться в браузері, щоб уникнути помилок SSR під час білду
  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoginPage = pathname === '/login';
  const isNotFoundPage = pathname === '/_not-found';

  return (
    <html lang="uk" className="select-none touch-manipulation">
      <body className={`${inter.className} bg-black text-white min-h-screen relative antialiased overflow-x-hidden`}>
        <AuthGuard>
          <main className={`w-full max-w-md mx-auto px-4 ${mounted && !isLoginPage && !isNotFoundPage ? "pb-24 pt-4" : ""}`}>
            {children}
          </main>

          {/* Меню показуємо тільки тоді, коли клієнт змонтований і це не сторінка логіну чи 404 */}
          {mounted && !isLoginPage && !isNotFoundPage && (
            <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/90 backdrop-blur-lg border-t border-white/5 py-3 px-2 z-50 shadow-[0_-12px_40px_rgba(0,0,0,0.9)] pb-safe">
              <div className="max-w-md mx-auto flex justify-around items-center">
                <Link href="/" className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl active:scale-95 transition-all ${pathname === '/' ? 'text-blue-500 font-bold' : 'text-zinc-500'}`}>
                  <Home size={20} /><span className="text-[9px] uppercase tracking-wider font-semibold">Головна</span>
                </Link>
                <Link href="/players" className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl active:scale-95 transition-all ${pathname === '/players' ? 'text-blue-500 font-bold' : 'text-zinc-500'}`}>
                  <Users size={20} /><span className="text-[9px] uppercase tracking-wider font-semibold">Рейтинг</span>
                </Link>
                <Link href="/tournaments" className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl active:scale-95 transition-all ${pathname === '/tournaments' ? 'text-blue-500 font-bold' : 'text-zinc-500'}`}>
                  <Trophy size={20} /><span className="text-[9px] uppercase tracking-wider font-semibold">Турніри</span>
                </Link>
                <Link href="/profile" className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl active:scale-95 transition-all ${pathname === '/profile' ? 'text-blue-500 font-bold' : 'text-zinc-500'}`}>
                  <User size={20} /><span className="text-[9px] uppercase tracking-wider font-semibold">Профіль</span>
                </Link>
              </div>
            </nav>
          )}
        </AuthGuard>
      </body>
    </html>
  );
}