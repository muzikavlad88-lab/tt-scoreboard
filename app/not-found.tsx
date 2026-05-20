'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';

// 1. Створюємо інтерфейс для сторінки 404
function NotFoundComponent() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center select-none touch-manipulation">
      <h2 className="text-3xl font-black text-red-500 tracking-wider uppercase">404</h2>
      <p className="text-sm text-zinc-400 mt-2">Сторінку не знайдено або її не існує.</p>
      <Link 
        href="/" 
        className="mt-6 bg-zinc-900 border border-white/5 text-white px-5 py-2.5 rounded-xl text-xs font-bold active:scale-95 transition-all"
      >
        Повернутися на головну
      </Link>
    </div>
  );
}

// 2. Повністю вимикаємо SSR для сторінки помилки під час збірки білду
const NotFound = dynamic(() => Promise.resolve(NotFoundComponent), {
  ssr: false,
});

export default NotFound;