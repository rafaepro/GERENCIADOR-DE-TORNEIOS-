import React, { useState, useEffect } from 'react';
import NeonButton from '../components/ui/NeonButton';
import NeonInput from '../components/ui/NeonInput';
import { dataService } from '../services/dataService';
import { Champion } from '../types';
import ChampionBanner from '../components/modals/ChampionBanner';

interface HistoryScreenProps {
  onBack: () => void;
  showToast: (msg: string) => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBack, showToast }) => {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [selectedChampion, setSelectedChampion] = useState<Champion | null>(null);
  const [newChampion, setNewChampion] = useState({
    teamName: '',
    captainName: '',
    date: '',
    tournamentType: 'copa'
  });

  useEffect(() => {
    setChampions(dataService.getChampions());
  }, []);

  const handleAddChampion = () => {
    if (!newChampion.teamName || !newChampion.captainName || !newChampion.date) {
      showToast('⚠️ Preencha todos os campos');
      return;
    }
    const champ: Champion = {
      id: 'champ-' + Date.now(),
      teamName: newChampion.teamName,
      captainName: newChampion.captainName,
      date: newChampion.date,
      tournamentType: newChampion.tournamentType,
    };
    dataService.saveChampion(champ);
    setChampions([...champions, champ]);
    setNewChampion({ teamName: '', captainName: '', date: '', tournamentType: 'copa' });
    showToast('✅ Campeão adicionado!');
  };

  const getTournamentLabel = (type: string) => {
      const map: Record<string, string> = {
          'copa': 'Copa Network',
          'md3-diaria': 'MD3 Diária',
          'md3-marcelo': 'MD3 Marcelo',
          'md3-istrawl': 'MD3 Istrawl'
      };
      return map[type] || type;
  };

  return (
    <div className="animate-fade-in bg-gradient-to-br from-[#050818] to-[#0A1124] border-2 border-[#00FFFF] rounded-2xl p-8 mb-8 shadow-[0_0_35px_rgba(0,255,255,0.3)]">
      <NeonButton variant="secondary" onClick={onBack} className="mb-6">← Voltar</NeonButton>
      <h2 className="text-3xl font-bold text-center mb-8 uppercase tracking-[3px] text-[#00FFFF] font-orbitron drop-shadow-[0_0_20px_#00FFFF] border-b-2 border-[#00FFFF] pb-4">
        Histórico de Campeões
      </h2>

      {/* Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
        {champions.map(champ => (
          <div 
            key={champ.id}
            onClick={() => setSelectedChampion(champ)}
            className="relative bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-2 border-[#00ff00] rounded-xl p-6 text-center cursor-pointer transition-all hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(0,255,0,0.5)] group overflow-hidden"
          >
             {/* Glow effect behind */}
             <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(0,255,0,0.1)_0%,transparent_70%)] animate-pulse-bg pointer-events-none"></div>
             
             <div className="relative z-10 w-20 h-20 mx-auto mb-4 rounded-full bg-[#0a0a0a] border-2 border-[#00ff00] flex items-center justify-center overflow-hidden">
                 <span className="text-3xl">🏆</span>
             </div>
             <div className="relative z-10 font-bold text-[#00ff00] mb-1 font-orbitron">{champ.teamName}</div>
             <div className="relative z-10 text-xs text-gray-400 mb-2">{new Date(champ.date).toLocaleDateString('pt-BR')}</div>
             <div className="relative z-10 inline-block bg-[#00ff00]/10 text-[#00ff00] text-xs px-2 py-1 rounded border border-[#00ff00]/30">
                 {getTournamentLabel(champ.tournamentType)}
             </div>
          </div>
        ))}
        {champions.length === 0 && <div className="col-span-full text-center text-gray-500 py-10">Nenhum campeão registrado ainda.</div>}
      </div>

      {/* Manual Add Form */}
      <div className="bg-[#0a0a0a] border-2 border-[#333] rounded-xl p-6">
          <h3 className="text-xl font-bold text-[#00FFFF] text-center mb-6 font-orbitron uppercase tracking-widest">Adicionar Campeão Manualmente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <NeonInput label="Nome da Equipe" value={newChampion.teamName} onChange={e => setNewChampion({...newChampion, teamName: e.target.value})} />
              <NeonInput label="Nome do Capitão" value={newChampion.captainName} onChange={e => setNewChampion({...newChampion, captainName: e.target.value})} />
              <div className="mb-5">
                <label className="block mb-2 text-sm font-bold text-[#00FFFF] uppercase tracking-widest font-orbitron">Data</label>
                <input type="date" value={newChampion.date} onChange={e => setNewChampion({...newChampion, date: e.target.value})} className="w-full px-4 py-3 bg-[rgba(10,17,36,0.7)] border border-[#00FFFF] rounded-lg text-white text-sm font-orbitron" />
              </div>
              <div className="mb-5">
                <label className="block mb-2 text-sm font-bold text-[#00FFFF] uppercase tracking-widest font-orbitron">Torneio</label>
                <select 
                    value={newChampion.tournamentType}
                    onChange={e => setNewChampion({...newChampion, tournamentType: e.target.value})}
                    className="w-full px-4 py-3 bg-[rgba(10,17,36,0.7)] border border-[#00FFFF] rounded-lg text-white text-sm font-orbitron"
                >
                    <option value="copa">Copa Network</option>
                    <option value="md3-diaria">MD3 Diária</option>
                    <option value="md3-marcelo">MD3 Marcelo</option>
                    <option value="md3-istrawl">MD3 Istrawl</option>
                </select>
              </div>
          </div>
          <div className="flex justify-center">
              <NeonButton onClick={handleAddChampion}>Adicionar ao Histórico</NeonButton>
          </div>
      </div>

      {/* Banner Modal */}
      <ChampionBanner champion={selectedChampion} onClose={() => setSelectedChampion(null)} />
    </div>
  );
};

export default HistoryScreen;