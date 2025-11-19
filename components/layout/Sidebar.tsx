
import React, { useState } from 'react';
import { AuthSession } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onChangeView: (view: string) => void;
  session: AuthSession | null;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, onChangeView, session }) => {
  const menuItems = [
    { id: 'home', label: '🏠 Início', role: 'all' },
    { id: 'profile', label: '👤 Meu Perfil', role: 'all' },
    { id: 'copaNetwork', label: '🏆 Copa Network', role: 'all' },
    { id: 'torneioMD3', label: '🎮 Torneio MD3', role: 'all' },
    { id: 'brackets', label: '⚔️ Tabelas de Jogos', role: 'all' },
    { id: 'ranking', label: '⭐ Ranking / Top 11', role: 'all' },
    { id: 'halloffame', label: '🏅 Hall da Fama', role: 'all' }, // Added Hall of Fame
    { id: 'historico', label: '📜 Histórico', role: 'all' },
    { id: 'playerStats', label: '📊 Gerenciar Jogadores', role: 'all' },
    { id: 'bannerGenerator', label: '🎨 Gerador de Banner', role: 'all' },
  ];

  if (session?.user?.role === 'admin') {
    menuItems.push({ id: 'adminPanel', label: '⚙️ Painel Admin', role: 'admin' });
  }

  const handleNavigate = (viewId: string) => {
    onChangeView(viewId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div className={`fixed top-0 left-0 h-full w-[280px] bg-[#050818] border-r-2 border-[var(--primary)] z-[70] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} shadow-[0_0_50px_rgba(0,255,255,0.2)]`}>
        <div className="p-6 border-b border-[var(--primary)]/30 flex justify-between items-center">
          <h2 className="text-[var(--primary)] font-orbitron font-bold text-xl tracking-widest">MENU</h2>
          <button onClick={() => setIsOpen(false)} className="text-white hover:text-red-500 text-2xl">✕</button>
        </div>

        <div className="py-4 flex flex-col gap-2 overflow-y-auto h-[calc(100%-80px)]">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className="px-6 py-4 text-left text-gray-300 hover:text-white hover:bg-[var(--primary)]/20 border-l-4 border-transparent hover:border-[var(--primary)] transition-all font-orbitron text-sm uppercase tracking-wider"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
