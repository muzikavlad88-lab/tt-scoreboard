'use client';
import { Inter } from "next/font/google";
import "./globals.css";
import AuthGuard from "./AuthGuard";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, Users, User } from 'lucide-react';

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Перевіряємо, чи це сторінка логіну
  const isLoginPage = pathname === '/login';

  return (
    <html lang="uk">
      <body className={`${inter.className} bg-black text-white min-h-screen relative`}>
        <AuthGuard>
          {/* Контент сторінки з відступом знизу, щоб меню його не перекривало */}
          <main className={!isLoginPage ? "pb-28" : ""}>
            {children}
          </main>

          {/* НАВІГАЦІЙНЕ МЕНЮ (Показується завжди, крім логіну) */}
          {!isLoginPage && (
            <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-white/10 py-4 px-6 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
              <div className="max-w-md mx-auto flex justify-between items-center">
                
                {/* Головна */}
                <Link 
                  href="/" 
                  className={`flex flex-col items-center gap-1 min-w-[60px] transition-all ${
                    pathname === '/' ? 'text-blue-500 scale-105 font-bold' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  <Home size={22} />
                  <span className="text-[10px] uppercase tracking-wider font-medium">Головна</span>
                </Link>

                {/* Рейтинг */}
                <Link 
                  href="/players" 
                  className={`flex flex-col items-center gap-1 min-w-[60px] transition-all ${
                    pathname === '/players' ? 'text-blue-500 scale-105 font-bold' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  <Users size={22} />
                  <span className="text-[10px] uppercase tracking-wider font-medium">Рейтинг</span>
                </Link>

                {/* Турніри */}
                <Link 
                  href="/tournaments" 
                  className={`flex flex-col items-center gap-1 min-w-[60px] transition-all ${
                    pathname === '/tournaments' ? 'text-blue-500 scale-105 font-bold' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  <Trophy size={22} />
                  <span className="text-[10px] uppercase tracking-wider font-medium">Турніри</span>
                </Link>

                {/* Профіль */}
                <Link 
                  href="/profile" 
                  className={`flex flex-col items-center gap-1 min-w-[60px] transition-all ${
                    pathname === '/profile' ? 'text-blue-500 scale-105 font-bold' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  <User size={22} />
                  <span className="text-[10px] uppercase tracking-wider font-medium">Профіль</span>
                </Link>

              </div>
            </nav>
          )}
        </AuthGuard>
      </body>
    </html>
  );
}