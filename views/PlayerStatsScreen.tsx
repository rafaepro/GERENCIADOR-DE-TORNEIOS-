
import React, { useState, useEffect } from 'react';
import NeonButton from '../components/ui/NeonButton';
import NeonInput from '../components/ui/NeonInput';
import { authService } from '../services/authService';
import { User } from '../types';

interface PlayerStatsScreenProps {
  onBack: () => void;
}

const PlayerStatsScreen: React.FC<PlayerStatsScreenProps> = ({ onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ 
      'md3-diaria': true, 
      'md3-marcelo': true, 
      'md3-istrawl': true,
      'copa': true
  });

  useEffect(() => {
    setUsers(authService.getUsers());
  }, []);

  const handleStatChange = (userId: string, stat: 'stars' | 'trophies' | 'captainCount', delta: number) => {
      const user = users.find(u => u.id === userId);
      if(user) {
          const currentStats = user.stats || { stars: 0, trophies: 0, captainCount: 0 };
          const newVal = Math.max(0, (currentStats[stat] || 0) + delta);
          
          authService.updateUser(userId, { 
              stats: { 
                  ...currentStats, 
                  [stat]: newVal 
              } 
          });
          setUsers(authService.getUsers()); // Refresh list
      }
  };

  const handleResetUserStats = (userId: string) => {
      if(confirm('Resetar premiações deste jogador?')) {
          authService.resetUserStats(userId);
          setUsers(authService.getUsers());
      }
  };

  const handleResetGroupStats = (groupType: string) => {
      if(confirm('ATENÇÃO: Isso irá zerar as premiações de TODOS os jogadores desta gaveta. Continuar?')) {
          authService.resetGroupStats(groupType);
          setUsers(authService.getUsers());
      }
  };

  const toggleSection = (section: string) => {
      setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const filteredUsers = users.filter(u => 
      u.role !== 'admin' && 
      u.role !== 'guest' && 
      (u.nickname.toLowerCase().includes(filter.toLowerCase()) || 
       (u.currentTeam && u.currentTeam.toLowerCase().includes(filter.toLowerCase())))
  );

  // Define "Drawers" based on Tournament Context
  const drawers = [
      { id: 'md3-diaria', label: 'MD3 Diária' },
      { id: 'md3-marcelo', label: 'MD3 Marcelo Oliveira' },
      { id: 'md3-istrawl', label: 'MD3 Istrawl' },
      { id: 'copa', label: 'Copa Network' }
  ];

  // Helper function to check if user belongs to drawer
  // Logic: 'md3-diaria' is the global MD3 pass. 
  // So if user is 'md3-diaria', they show up in marcelo and istrawl too.
  const getDrawerUsers = (drawerId: string) => {
      return filteredUsers.filter(u => {
          if (drawerId === 'md3-marcelo' || drawerId === 'md3-istrawl') {
               return u.registeredTournamentType === drawerId || u.registeredTournamentType === 'md3-diaria';
          }
          return u.registeredTournamentType === drawerId;
      });
  }

  return (
    <div className="animate-fade-in bg-[#0A1124] border-2 border-[#00FFFF] rounded-2xl p-6 mb-8 shadow-[0_0_35px_rgba(0,255,255,0.3)]">
      <NeonButton variant="secondary" onClick={onBack} className="mb-6">← Voltar</NeonButton>
      
      <h2 className="text-3xl font-bold text-center mb-8 uppercase tracking-[3px] text-[#00FFFF] font-orbitron drop-shadow-[0_0_20px_#00FFFF] border-b-2 border-[#00FFFF] pb-4">
        Gerenciador de Jogadores
      </h2>

      <div className="mb-8">
          <NeonInput placeholder="🔍 Buscar por Nome ou Equipe..." value={filter} onChange={e => setFilter(e.target.value)} />
      </div>

      <div className="space-y-6">
          {drawers.map(drawer => {
              const drawerUsers = getDrawerUsers(drawer.id);
              
              return (
                  <div key={drawer.id} className="border border-[#00FFFF]/30 rounded-xl overflow-hidden bg-black/20">
                      <div 
                        className="bg-gradient-to-r from-[#00FFFF]/20 to-transparent p-4 cursor-pointer flex justify-between items-center"
                        onClick={() => toggleSection(drawer.id)}
                      >
                          <h3 className="text-[#00FFFF] font-bold font-orbitron text-lg uppercase">{drawer.label} ({drawerUsers.length})</h3>
                          <span className="text-[#00FFFF]">{expanded[drawer.id] ? '▼' : '▶'}</span>
                      </div>
                      
                      {expanded[drawer.id] && (
                          <div className="p-4 space-y-4">
                              {drawerUsers.length > 0 && (
                                  <div className="flex justify-end mb-2">
                                      <button 
                                        onClick={() => handleResetGroupStats(drawer.id)}
                                        className="text-xs text-red-500 border border-red-500 px-3 py-1 rounded hover:bg-red-500 hover:text-white transition-colors"
                                      >
                                          🚨 Resetar TUDO desta gaveta
                                      </button>
                                  </div>
                              )}

                              {drawerUsers.map(user => (
                                  <div key={user.id} className="bg-white/5 p-4 rounded-lg border border-white/10 flex flex-col lg:flex-row items-center gap-4 justify-between">
                                      <div className="flex items-center gap-4 flex-1">
                                          <div className="w-12 h-12 bg-black rounded-full border border-[#00FFFF] flex items-center justify-center text-xl relative">
                                              👤
                                              {user.stats && (user.stats.stars + user.stats.trophies > 10) && <span className="absolute -top-1 -right-1 text-xs">🔥</span>}
                                          </div>
                                          <div>
                                              <div className="flex items-center gap-2">
                                                  <span className="font-bold text-white text-lg">{user.nickname}</span>
                                                  <span className="text-gray-500 text-sm">|</span>
                                                  <span className="text-[#00ff00] font-bold uppercase tracking-wider text-sm">{user.currentTeam || 'Sem Equipe'}</span>
                                              </div>
                                              <div className="flex flex-wrap gap-1 mt-1">
                                                  {Array.isArray(user.position) && user.position.map((pos, i) => (
                                                      <span key={i} className="text-[10px] bg-[#00FFFF]/20 text-[#00FFFF] px-2 py-0.5 rounded border border-[#00FFFF]/30">
                                                          {pos}
                                                      </span>
                                                  ))}
                                              </div>
                                              {/* Tag showing source if it's from Diaria but in another drawer */}
                                              {drawer.id !== 'md3-diaria' && user.registeredTournamentType === 'md3-diaria' && (
                                                  <span className="text-[9px] text-yellow-400 italic mt-1 block">Inscrito via MD3 Diária</span>
                                              )}
                                          </div>
                                      </div>
                                      
                                      <div className="flex items-center gap-4 bg-black/40 p-2 rounded-xl">
                                          <StatControl 
                                            label="Estrelas" 
                                            icon="⭐" 
                                            value={user.stats?.stars || 0} 
                                            onChange={(d) => handleStatChange(user.id, 'stars', d)} 
                                          />
                                          <StatControl 
                                            label="Troféus" 
                                            icon="🏆" 
                                            value={user.stats?.trophies || 0} 
                                            onChange={(d) => handleStatChange(user.id, 'trophies', d)} 
                                          />
                                          <StatControl 
                                            label="Capitão" 
                                            icon="©️" 
                                            value={user.stats?.captainCount || 0} 
                                            onChange={(d) => handleStatChange(user.id, 'captainCount', d)} 
                                          />
                                          <div className="h-8 w-[1px] bg-gray-700 mx-2"></div>
                                          <button 
                                            onClick={() => handleResetUserStats(user.id)}
                                            className="flex flex-col items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
                                            title="Resetar Premiação"
                                          >
                                              <span className="text-xl">🔄</span>
                                              <span className="text-[8px] uppercase">Reset</span>
                                          </button>
                                      </div>
                                  </div>
                              ))}
                              
                              {drawerUsers.length === 0 && (
                                  <div className="text-center text-gray-500 py-4">Nenhum jogador registrado neste contexto.</div>
                              )}
                          </div>
                      )}
                  </div>
              );
          })}
      </div>
    </div>
  );
};

const StatControl = ({ label, icon, value, onChange }: { label: string, icon: string, value: number, onChange: (d: number) => void }) => (
    <div className="flex flex-col items-center min-w-[70px]">
        <span className="text-[9px] uppercase text-gray-400 mb-1">{label}</span>
        <div className="flex items-center bg-black rounded border border-gray-700">
            <button onClick={() => onChange(-1)} className="px-2 py-1 text-red-500 hover:bg-white/10 text-xs font-bold">-</button>
            <span className="px-2 min-w-[30px] text-center font-bold text-white flex items-center justify-center gap-1 text-sm">
                {value} <span className="text-[10px]">{icon}</span>
            </span>
            <button onClick={() => onChange(1)} className="px-2 py-1 text-green-500 hover:bg-white/10 text-xs font-bold">+</button>
        </div>
    </div>
);

export default PlayerStatsScreen;
