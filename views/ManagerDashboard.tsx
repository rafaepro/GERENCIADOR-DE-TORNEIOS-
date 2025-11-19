
import React, { useState, useEffect } from 'react';
import NeonButton from '../components/ui/NeonButton';
import { authService } from '../services/authService';
import { dataService } from '../services/dataService';
import { AppConfig, TournamentConfig, User } from '../types';

interface ManagerDashboardProps {
  onBack: () => void;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ onBack }) => {
  const session = authService.getSession();
  const [config, setConfig] = useState<AppConfig>(dataService.getAppConfig());
  const [users, setUsers] = useState<User[]>([]);
  const [tournaments, setTournaments] = useState<TournamentConfig[]>([]);
  
  useEffect(() => {
    // Load data specific to this manager
    const allUsers = authService.getUsers();
    setUsers(allUsers.filter(u => u.ownerId === session?.user?.id));
    
    const allConfigs = dataService.getConfigs();
    setTournaments(allConfigs.filter(t => t.ownerId === session?.user?.id));
  }, [session?.user?.id]);

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex justify-between items-center border-b-2 border-[var(--primary)] pb-4 mb-6">
        <div>
           <h2 className="text-3xl font-bold text-[var(--primary)] font-orbitron uppercase tracking-widest">Painel do Organizador</h2>
           <p className="text-gray-400 text-sm">Gerencie seus torneios e jogadores</p>
        </div>
        <div className="flex gap-4">
           <div className="text-right hidden md:block">
              <div className="text-white font-bold">{session?.user?.nickname}</div>
              <div className="text-xs text-[var(--primary)]">ID: {session?.user?.id}</div>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0A1124] border border-[var(--primary)]/30 rounded-xl p-6 shadow-[0_0_20px_rgba(0,255,255,0.1)]">
             <div className="text-3xl mb-2">👥</div>
             <div className="text-2xl font-bold text-white">{users.length}</div>
             <div className="text-xs text-gray-400 uppercase">Jogadores Inscritos</div>
          </div>
          <div className="bg-[#0A1124] border border-[var(--primary)]/30 rounded-xl p-6 shadow-[0_0_20px_rgba(0,255,255,0.1)]">
             <div className="text-3xl mb-2">🏆</div>
             <div className="text-2xl font-bold text-white">{tournaments.length}</div>
             <div className="text-xs text-gray-400 uppercase">Torneios Criados</div>
          </div>
          <div className="bg-[#0A1124] border border-[var(--primary)]/30 rounded-xl p-6 shadow-[0_0_20px_rgba(0,255,255,0.1)]">
             <div className="text-3xl mb-2">⚙️</div>
             <div className="text-2xl font-bold text-white">Ativo</div>
             <div className="text-xs text-gray-400 uppercase">Status da Conta</div>
          </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="bg-black/30 p-6 rounded-xl border border-white/10">
              <h3 className="text-[var(--primary)] font-bold font-orbitron mb-4 uppercase">Meus Torneios</h3>
              <NeonButton fullWidth onClick={() => alert('Funcionalidade de criar torneio personalizada em desenvolvimento.')}>+ Criar Novo Torneio</NeonButton>
              <div className="mt-4 space-y-2">
                  {tournaments.length === 0 && <p className="text-gray-500 text-xs italic">Nenhum torneio criado.</p>}
                  {tournaments.map(t => (
                      <div key={t.id} className="p-2 bg-white/5 rounded text-sm flex justify-between items-center">
                          <span>{t.name}</span>
                          <span className="text-[10px] bg-[var(--primary)]/20 text-[var(--primary)] px-1 rounded">{t.type}</span>
                      </div>
                  ))}
              </div>
          </div>

          <div className="bg-black/30 p-6 rounded-xl border border-white/10">
              <h3 className="text-[var(--primary)] font-bold font-orbitron mb-4 uppercase">Gestão de Jogadores</h3>
              <NeonButton fullWidth variant="secondary" onClick={() => alert('Use o menu lateral "Gerenciar Jogadores" para ver detalhes.')}>Ver Lista Completa</NeonButton>
          </div>

          <div className="bg-black/30 p-6 rounded-xl border border-white/10">
              <h3 className="text-[var(--primary)] font-bold font-orbitron mb-4 uppercase">Minha Marca</h3>
              <p className="text-xs text-gray-400 mb-4">Para alterar o logo e nome do seu painel, entre em contato com o Administrador do sistema.</p>
              <div className="p-3 bg-white/5 rounded text-center">
                   {session?.user?.tournamentLogo ? (
                       <img src={session.user.tournamentLogo} className="h-16 mx-auto object-contain mb-2" />
                   ) : (
                       <div className="h-16 mx-auto flex items-center justify-center text-gray-500">Sem Logo</div>
                   )}
                   <div className="font-bold text-white">{session?.user?.customPanelName || 'Painel Padrão'}</div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
