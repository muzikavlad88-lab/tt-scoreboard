'use client';
import { Inter } from "next/font/google";
import "./globals.css";
import AuthGuard from "./AuthGuard";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, Users, User } from 'lucide-react';

const inter = Inter({ subsets: ["latin", "cyrillic"] });

// Блокуємо зум пальцями на смартфонах, щоб інтерфейс не смикався при швидких тапах
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <html lang="uk" className="select-none touch-manipulation">
      <body className={`${inter.className} bg-black text-white min-h-screen relative antialiased overflow-x-hidden`}>
        <AuthGuard>
          {/* Контент підлаштований під висоту мобільного екрана */}
          <main className={`w-full max-w-md mx-auto px-4 ${!isLoginPage ? "pb-24 pt-4" : ""}`}>
            {children}
          </main>

          {/* НАВІГАЦІЙНИЙ ТАББАР (Ідеальний під великий палець) */}
          {!isLoginPage && (
            <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/90 backdrop-blur-lg border-t border-white/5 py-3 px-2 z-50 shadow-[0_-12px_40px_rgba(0,0,0,0.9)] pb-safe">
              <div className="max-w-md mx-auto flex justify-around items-center">
                
                {/* Головна */}
                <Link 
                  href="/" 
                  className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl active:scale-95 transition-all ${
                    pathname === '/' ? 'text-blue-500 font-bold' : 'text-zinc-500'
                  }`}
                >
                  <Home size={20} />
                  <span className="text-[9px] uppercase tracking-wider font-semibold">Головна</span>
                </Link>

                {/* Рейтинг */}
                <Link 
                  href="/players" 
                  className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl active:scale-95 transition-all ${
                    pathname === '/players' ? 'text-blue-500 font-bold' : 'text-zinc-500'
                  }`}
                >
                  <Users size={20} />
                  <span className="text-[9px] uppercase tracking-wider font-semibold">Рейтинг</span>
                </Link>

                {/* Турніри */}
                <Link 
                  href="/tournaments" 
                  className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl active:scale-95 transition-all ${
                    pathname === '/tournaments' ? 'text-blue-500 font-bold' : 'text-zinc-500'
                  }`}
                >
                  <Trophy size={20} />
                  <span className="text-[9px] uppercase tracking-wider font-semibold">Турніри</span>
                </Link>

                {/* Профіль */}
                <Link 
                  href="/profile" 
                  className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl active:scale-95 transition-all ${
                    pathname === '/profile' ? 'text-blue-500 font-bold' : 'text-zinc-500'
                  }`}
                >
                  <User size={20} />
                  <span className="text-[9px] uppercase tracking-wider font-semibold">Профіль</span>
                </Link>

              </div>
            </nav>
          )}
        </AuthGuard>
      </body>
    </html>
  );
}