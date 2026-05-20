'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, Users, User, LayoutDashboard } from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();

  // Список пунктів меню: назва, іконка та шлях
  const menuItems = [
    { name: 'Головна', icon: <LayoutDashboard size={24} />, href: '/' },
    { name: 'Турніри', icon: <Trophy size={24} />, href: '/tournaments' },
    { name: 'Рейтинг', icon: <Users size={24} />, href: '/players' },
    { name: 'Профіль', icon: <User size={24} />, href: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 pointer-events-none">
      {/* Скляний фон панелі */}
      <div className="max-w-[400px] mx-auto bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-2 flex justify-between items-center shadow-2xl pointer-events-auto shadow-blue-500/10">
        
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className="relative flex-1 group"
            >
              <div className={`
                flex flex-col items-center justify-center py-3 rounded-3xl transition-all duration-300
                ${isActive ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'}
              `}>
                {/* Іконка з ефектом світіння для активної вкладки */}
                <div className={`
                  transition-transform duration-300 group-active:scale-75
                  ${isActive ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] scale-110' : ''}
                `}>
                  {item.icon}
                </div>
                
                {/* Текст під іконкою (можна прибрати для мінімалізму) */}
                <span className={`
                  text-[10px] font-black uppercase tracking-widest mt-1 transition-opacity
                  ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}
                `}>
                  {item.name}
                </span>

                {/* Індикатор активної вкладки (крапка знизу) */}
                {isActive && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]"></div>
                )}
              </div>
            </Link>
          );
        })}

      </div>
    </nav>
  );
};

export default Sidebar;