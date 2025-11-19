import React, { useState, useEffect } from 'react';
import NeonButton from '../components/ui/NeonButton';
import NeonInput from '../components/ui/NeonInput';
import FileUpload from '../components/ui/FileUpload';
import { dataService, fileToBase64 } from '../services/dataService';
import { Team } from '../types';

interface CopaNetworkScreenProps {
  onBack: () => void;
  showToast: (msg: string) => void;
}

const CopaNetworkScreen: React.FC<CopaNetworkScreenProps> = ({ onBack, showToast }) => {
  const [config, setConfig] = useState({
    name: '',
    month: '',
    teams: '',
    groups: '',
    trophy: '',
    medals: ''
  });

  const [newTeam, setNewTeam] = useState({
    name: '',
    captain: '',
    logo: ''
  });

  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    // Load teams
    const allTeams = dataService.getTeams();
    setTeams(allTeams.filter(t => t.tournamentType === 'copa'));
  }, []);

  const handleConfigSave = () => {
    dataService.saveConfig({
      id: 'copa-' + Date.now(),
      type: 'copa',
      name: config.name || 'Copa Network',
      month: config.month,
      teamsCount: parseInt(config.teams) || 0,
      groupsCount: parseInt(config.groups) || 0,
      trophyImage: config.trophy,
      medalsImage: config.medals
    });
    showToast('✅ Configurações salvas com sucesso!');
  };

  const handleAddTeam = async () => {
    if (!newTeam.name || !newTeam.captain) {
      showToast('⚠️ Preencha nome e capitão');
      return;
    }

    const team: Team = {
      id: 'copa-team-' + Date.now(),
      name: newTeam.name,
      captain: newTeam.captain,
      logo: newTeam.logo,
      tournamentType: 'copa',
      createdAt: new Date().toISOString()
    };

    dataService.saveTeam(team);
    setTeams([...teams, team]);
    setNewTeam({ name: '', captain: '', logo: '' });
    showToast('✅ Equipe adicionada!');
  };

  return (
    <div className="animate-fade-in bg-gradient-to-br from-[#050818] to-[#0A1124] border-2 border-[#00FFFF] rounded-2xl p-8 mb-8 shadow-[0_0_35px_rgba(0,255,255,0.3)]">
      <NeonButton variant="secondary" onClick={onBack} className="mb-6">← Voltar</NeonButton>
      
      <h2 className="text-3xl font-bold text-center mb-8 uppercase tracking-[3px] text-[#00FFFF] font-orbitron drop-shadow-[0_0_20px_#00FFFF] border-b-2 border-[#00FFFF] pb-4">
        Copa Network
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <NeonInput label="Nome da Copa" placeholder="Copa Network" value={config.name} onChange={e => setConfig({...config, name: e.target.value})} />
        <NeonInput label="Mês da Edição" placeholder="Janeiro 2024" value={config.month} onChange={e => setConfig({...config, month: e.target.value})} />
        <NeonInput label="Qtd. Equipes" type="number" placeholder="16" value={config.teams} onChange={e => setConfig({...config, teams: e.target.value})} />
        <NeonInput label="Qtd. Grupos" type="number" placeholder="4" value={config.groups} onChange={e => setConfig({...config, groups: e.target.value})} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <FileUpload label="Troféu (Imagem)" onChange={async (f) => setConfig({...config, trophy: await fileToBase64(f)})} />
        <FileUpload label="Medalhas (Imagem)" onChange={async (f) => setConfig({...config, medals: await fileToBase64(f)})} />
      </div>

      <div className="flex justify-center mb-12">
        <NeonButton onClick={handleConfigSave}>Salvar Configurações</NeonButton>
      </div>

      <h3 className="text-2xl font-bold text-center text-[#00ff00] mb-6 font-orbitron">Cadastrar Equipes</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <NeonInput label="Nome da Equipe" placeholder="Nome da equipe" value={newTeam.name} onChange={e => setNewTeam({...newTeam, name: e.target.value})} />
        <NeonInput label="Nome do Capitão" placeholder="Nome do capitão" value={newTeam.captain} onChange={e => setNewTeam({...newTeam, captain: e.target.value})} />
      </div>
      
      <FileUpload label="Logotipo da Equipe (Opcional)" onChange={async (f) => setNewTeam({...newTeam, logo: await fileToBase64(f)})} />

      <div className="flex justify-center mb-8">
         <NeonButton onClick={handleAddTeam}>Adicionar Equipe</NeonButton>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {teams.map(team => (
          <div key={team.id} className="bg-gradient-to-br from-[#0A1124] to-[#050818] border-2 border-[#00BFFF] rounded-xl p-6 text-center transition-all duration-300 hover:scale-105 hover:border-[#00FFFF] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] group">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[#00010F] border-2 border-[#00FFFF] flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(0,255,255,0.4)]">
              {team.logo ? <img src={team.logo} alt={team.name} className="w-full h-full object-contain" /> : <span className="text-3xl">🛡️</span>}
            </div>
            <div className="font-bold text-lg text-[#00FFFF] mb-2 font-orbitron">{team.name}</div>
            <div className="text-sm text-[#AAAAFF] font-orbitron">Capitão: {team.captain}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CopaNetworkScreen;