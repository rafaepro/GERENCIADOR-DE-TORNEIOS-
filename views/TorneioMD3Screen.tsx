import React, { useState, useEffect } from 'react';
import NeonButton from '../components/ui/NeonButton';
import NeonInput from '../components/ui/NeonInput';
import FileUpload from '../components/ui/FileUpload';
import { dataService, fileToBase64 } from '../services/dataService';
import { Team } from '../types';

interface TorneioMD3ScreenProps {
  onBack: () => void;
  showToast: (msg: string) => void;
}

type MD3Type = 'diaria' | 'marcelo' | 'istrawl';

const TorneioMD3Screen: React.FC<TorneioMD3ScreenProps> = ({ onBack, showToast }) => {
  const [activeTab, setActiveTab] = useState<MD3Type>('diaria');
  
  // State for the current active form
  const [config, setConfig] = useState({ name: '', date: '' });
  const [newTeam, setNewTeam] = useState({ name: '', captain: '', logo: '' });
  const [teams, setTeams] = useState<Team[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkPlayers, setBulkPlayers] = useState<string[]>(Array(11).fill(''));

  useEffect(() => {
    // Reset form when tab changes
    setConfig({ name: `MD3 ${getTabName(activeTab)}`, date: '' });
    setNewTeam({ name: '', captain: '', logo: '' });
    
    // Load teams for current tab
    const allTeams = dataService.getTeams();
    setTeams(allTeams.filter(t => t.tournamentType === `md3-${activeTab}`));
  }, [activeTab]);

  const getTabName = (type: MD3Type) => {
    if (type === 'diaria') return 'Diária';
    if (type === 'marcelo') return 'Marcelo Oliveira';
    if (type === 'istrawl') return 'Istrawl';
    return '';
  }

  const getTabColor = (type: MD3Type) => {
      if(type === 'diaria') return 'text-[#ffcc00]';
      if(type === 'marcelo') return 'text-[#0066ff]';
      if(type === 'istrawl') return 'text-[#00ff00]';
      return 'text-white';
  }

  const handleSaveConfig = () => {
    dataService.saveConfig({
        id: `md3-config-${activeTab}-${Date.now()}`,
        name: config.name,
        month: config.date,
        type: 'md3',
        subType: activeTab
    });
    showToast('✅ Configurações salvas!');
  };

  const handleBulkSubmit = async () => {
      if (!newTeam.name || !newTeam.captain) {
          showToast('⚠️ Preencha nome e capitão antes de adicionar jogadores');
          return;
      }

      const playerPositions = ['GK', 'ZGD', 'ZGC', 'ZGE', 'VOL', 'MC', 'MEI', 'ALA D', 'ALA E', 'ST', 'ST'];
      const players = bulkPlayers.map((name, i) => ({
          name,
          position: playerPositions[i]
      })).filter(p => p.name.trim() !== '');

      const team: Team = {
          id: `md3-team-${activeTab}-${Date.now()}`,
          name: newTeam.name,
          captain: newTeam.captain,
          logo: newTeam.logo,
          players: players,
          tournamentType: `md3-${activeTab}` as any,
          createdAt: new Date().toISOString()
      };

      dataService.saveTeam(team);
      setTeams([...teams, team]);
      setNewTeam({ name: '', captain: '', logo: '' });
      setBulkPlayers(Array(11).fill(''));
      setShowBulkModal(false);
      showToast('✅ Equipe e jogadores salvos!');
  };

  return (
    <div className="animate-fade-in bg-gradient-to-br from-[#050818] to-[#0A1124] border-2 border-[#00FFFF] rounded-2xl p-8 mb-8 shadow-[0_0_35px_rgba(0,255,255,0.3)]">
       <NeonButton variant="secondary" onClick={onBack} className="mb-6">← Voltar</NeonButton>
       <h2 className="text-3xl font-bold text-center mb-8 uppercase tracking-[3px] text-[#00FFFF] font-orbitron drop-shadow-[0_0_20px_#00FFFF] border-b-2 border-[#00FFFF] pb-4">
        Torneio MD3
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {(['diaria', 'marcelo', 'istrawl'] as MD3Type[]).map((type) => (
              <NeonButton 
                key={type} 
                fullWidth 
                variant={activeTab === type ? 'primary' : 'secondary'}
                onClick={() => setActiveTab(type)}
              >
                  MD3 {type === 'marcelo' ? 'DO MARCELO' : type === 'istrawl' ? 'DO ISTRAWL' : 'DIÁRIA'}
              </NeonButton>
          ))}
      </div>

      <div className="border-2 border-white/10 rounded-xl p-6 bg-black/20">
          <h3 className={`text-2xl font-bold mb-6 uppercase font-orbitron ${getTabColor(activeTab)}`}>
              Configuração - MD3 {getTabName(activeTab)}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <NeonInput label="Nome do Torneio" value={config.name} onChange={e => setConfig({...config, name: e.target.value})} />
            <NeonInput label="Data/Período" value={config.date} onChange={e => setConfig({...config, date: e.target.value})} />
          </div>
          <div className="flex justify-center mb-10">
            <NeonButton onClick={handleSaveConfig}>Salvar Configurações</NeonButton>
          </div>

          <h3 className="text-xl font-bold text-center text-white mb-6 font-orbitron uppercase">Cadastrar Equipe</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <NeonInput label="Nome da Equipe" placeholder="Nome da equipe" value={newTeam.name} onChange={e => setNewTeam({...newTeam, name: e.target.value})} />
            <NeonInput label="Nome do Capitão" placeholder="Nome do capitão" value={newTeam.captain} onChange={e => setNewTeam({...newTeam, captain: e.target.value})} />
          </div>
          <FileUpload label="Logotipo (Opcional)" onChange={async (f) => setNewTeam({...newTeam, logo: await fileToBase64(f)})} />
          
          <div className="flex justify-center mb-8">
             <NeonButton onClick={() => setShowBulkModal(true)}>Adicionar 11 Jogadores</NeonButton>
          </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
            {teams.map(team => (
            <div key={team.id} className="bg-gradient-to-br from-[#0A1124] to-[#050818] border-2 border-[#00BFFF] rounded-xl p-6 text-center transition-all duration-300 hover:scale-105 hover:border-[#00FFFF] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[#00010F] border-2 border-[#00FFFF] flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(0,255,255,0.4)]">
                {team.logo ? <img src={team.logo} alt={team.name} className="w-full h-full object-contain" /> : <span className="text-3xl">🛡️</span>}
                </div>
                <div className="font-bold text-lg text-[#00FFFF] mb-2 font-orbitron">{team.name}</div>
                <div className="text-sm text-[#AAAAFF] font-orbitron mb-2">Cap: {team.captain}</div>
                <div className="text-xs text-gray-400 font-mono">{team.players?.length || 0} jogadores</div>
            </div>
            ))}
         </div>
      </div>

      {/* Bulk Player Modal */}
      {showBulkModal && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-[#1a1a1a] border-2 border-[#00ff00] rounded-xl p-6 w-full max-w-3xl my-10 relative">
                  <h3 className="text-[#00ff00] text-center text-2xl mb-6 font-orbitron">Adicionar 11 Jogadores</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['GK', 'ZGD', 'ZGC', 'ZGE', 'VOL', 'MC', 'MEI', 'ALA D', 'ALA E', 'ST', 'ST'].map((pos, idx) => (
                          <div key={idx} className="mb-2">
                              <label className="block text-xs text-[#00ff00] mb-1">{pos}</label>
                              <input 
                                type="text" 
                                className="w-full p-2 bg-black border border-[#333] rounded text-white text-sm focus:border-[#00ff00] outline-none"
                                placeholder={`Nome do jogador ${pos}`}
                                value={bulkPlayers[idx]}
                                onChange={e => {
                                    const newPlayers = [...bulkPlayers];
                                    newPlayers[idx] = e.target.value;
                                    setBulkPlayers(newPlayers);
                                }}
                              />
                          </div>
                      ))}
                  </div>
                  <div className="flex justify-center gap-4 mt-8">
                      <NeonButton onClick={handleBulkSubmit}>Salvar Equipe</NeonButton>
                      <NeonButton variant="secondary" onClick={() => setShowBulkModal(false)}>Cancelar</NeonButton>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default TorneioMD3Screen;