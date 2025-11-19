
import React from 'react';
import { authService } from '../services/authService';
import { dataService } from '../services/dataService';
import { AppConfig } from '../types';

interface HomeScreenProps {
  onChangeView: (view: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onChangeView }) => {
  const session = authService.getSession();
  const appConfig: AppConfig = dataService.getAppConfig();
  const users = authService.getUsers();
  
  // Quick Stats
  const activeUsers = users.filter(u => u.isActive).length;
  const topPlayer = users.sort((a,b) => ((b.stats?.stars||0) + (b.stats?.trophies||0)) - ((a.stats?.stars||0) + (a.stats?.trophies||0)))[0];

  return (
    <div className="animate-fade-in space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[var(--secondary)] to-[var(--primary)] p-[2px] rounded-2xl">
        <div className="bg-black/80 backdrop-blur-md rounded-2xl p-8 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-4xl font-bold text-white font-orbitron mb-2">
              Olá, <span className="text-[var(--primary)]">{session?.user?.nickname}</span>
            </h2>
            <p className="text-gray-400 text-sm">Bem-vindo ao Painel de Gerenciamento de Torneios.</p>
          </div>
          <div className="text-right hidden md:block">
             <div className="text-[var(--primary)] font-bold text-xl font-orbitron">{appConfig.activeTournamentName || 'Nenhum Torneio Ativo'}</div>
             <div className="text-xs text-gray-400 uppercase tracking-widest">Torneio Atual</div>
          </div>
        </div>
      </div>

      {/* Dashboard Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0A1124] border border-[var(--primary)]/30 rounded-xl p-6 shadow-[0_0_20px_rgba(0,255,255,0.1)] hover:border-[var(--primary)] transition-colors">
           <div className="text-4xl mb-2">👥</div>
           <div className="text-3xl font-bold text-white mb-1">{activeUsers}</div>
           <div className="text-xs text-[var(--primary)] uppercase tracking-wider">Jogadores Ativos</div>
        </div>

        <div className="bg-[#0A1124] border border-[var(--primary)]/30 rounded-xl p-6 shadow-[0_0_20px_rgba(0,255,255,0.1)] hover:border-[var(--primary)] transition-colors">
           <div className="text-4xl mb-2">🏆</div>
           <div className="text-3xl font-bold text-white mb-1">{appConfig.championTeam || '-'}</div>
           <div className="text-xs text-[var(--primary)] uppercase tracking-wider">Atual Campeão</div>
        </div>

        <div className="bg-[#0A1124] border border-[var(--primary)]/30 rounded-xl p-6 shadow-[0_0_20px_rgba(0,255,255,0.1)] hover:border-[var(--primary)] transition-colors">
           <div className="text-4xl mb-2">⭐</div>
           <div className="text-xl font-bold text-white mb-1 truncate">{topPlayer?.nickname || '-'}</div>
           <div className="text-xs text-[var(--primary)] uppercase tracking-wider">Destaque Geral</div>
        </div>
      </div>

      <div className="bg-black/40 border border-white/10 rounded-xl p-6 text-center">
         <p className="text-gray-400 text-sm mb-4">Utilize o menu lateral (<span className="text-[var(--primary)] text-lg">☰</span>) no canto superior esquerdo para navegar entre as opções.</p>
      </div>
    </div>
  );
};

export default HomeScreen;
