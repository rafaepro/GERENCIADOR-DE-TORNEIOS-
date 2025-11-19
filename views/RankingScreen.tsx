import React, { useState, useEffect } from 'react';
import NeonButton from '../components/ui/NeonButton';
import { dataService } from '../services/dataService';
import { Top11Data, Team } from '../types';

interface RankingScreenProps {
  onBack: () => void;
  showToast: (msg: string) => void;
}

const RankingScreen: React.FC<RankingScreenProps> = ({ onBack, showToast }) => {
  const [top11, setTop11] = useState<Top11Data>(dataService.getTop11());
  const [editingPos, setEditingPos] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editStars, setEditStars] = useState(0);
  const [leaderboard, setLeaderboard] = useState<{team: Team, titles: number, wins: number, participations: number}[]>([]);

  useEffect(() => {
    const teams = dataService.getTeams();
    const champions = dataService.getChampions();
    
    // Calculate stats
    const statsMap = new Map<string, {team: Team, titles: number, wins: number, participations: number}>();
    
    teams.forEach(t => {
        if(!statsMap.has(t.name)) {
            statsMap.set(t.name, { team: t, titles: 0, wins: 0, participations: 1 });
        } else {
            const current = statsMap.get(t.name)!;
            current.participations += 1;
        }
    });

    champions.forEach(c => {
        if(statsMap.has(c.teamName)) {
            const current = statsMap.get(c.teamName)!;
            current.titles += 1;
            current.wins += 1; // Assuming title = win
        }
    });

    const sorted = Array.from(statsMap.values()).sort((a, b) => {
        if(b.titles !== a.titles) return b.titles - a.titles;
        if(b.wins !== a.wins) return b.wins - a.wins;
        return b.participations - a.participations;
    });

    setLeaderboard(sorted);
  }, []);

  const handleSaveTop11 = () => {
    dataService.saveTop11(top11);
    showToast('✅ Seleção do mês salva!');
  };

  const openEditModal = (pos: string) => {
    setEditingPos(pos);
    setEditName(top11[pos].name);
    setEditStars(top11[pos].stars);
  };

  const savePlayerEdit = () => {
    if (editingPos) {
      setTop11(prev => ({
        ...prev,
        [editingPos]: { name: editName, stars: editStars }
      }));
      setEditingPos(null);
      showToast('✅ Jogador atualizado (Lembre-se de salvar a seleção)');
    }
  };

  const renderStars = (count: number) => '⭐'.repeat(count);

  const PlayerCard = ({ pos, label }: { pos: string, label: string }) => (
    <div className="relative bg-gradient-to-br from-[#0A1124] to-[#050818] border-2 border-[#00FFFF] rounded-xl p-3 md:p-4 text-center min-w-[110px] md:min-w-[130px] transition-all hover:-translate-y-2 hover:shadow-[0_0_20px_#00FFFF] group mx-auto">
      <div className="text-xs md:text-sm font-bold text-black bg-gradient-to-r from-[#00FFFF] to-[#00BFFF] px-3 py-1 rounded mb-2 font-orbitron shadow-[0_0_10px_rgba(0,255,255,0.5)]">
        {label}
      </div>
      <div className="text-xs md:text-sm text-white font-bold mb-1 truncate">{top11[pos].name}</div>
      <div className="text-xs mb-2">{renderStars(top11[pos].stars)}</div>
      <button 
        onClick={() => openEditModal(pos)}
        className="bg-[#333366] text-[#00FFFF] border border-[#00BFFF] p-1 rounded hover:bg-[#00FFFF] hover:text-black transition-colors text-xs"
      >
        ✏️
      </button>
    </div>
  );

  return (
    <div className="animate-fade-in bg-gradient-to-br from-[#050818] to-[#0A1124] border-2 border-[#00FFFF] rounded-2xl p-8 mb-8 shadow-[0_0_35px_rgba(0,255,255,0.3)]">
      <NeonButton variant="secondary" onClick={onBack} className="mb-6">← Voltar</NeonButton>
      <h2 className="text-3xl font-bold text-center mb-8 uppercase tracking-[3px] text-[#00FFFF] font-orbitron drop-shadow-[0_0_20px_#00FFFF] border-b-2 border-[#00FFFF] pb-4">
        Ranking / Destaques
      </h2>

      <div className="bg-black/30 border-2 border-[#00BFFF] rounded-xl p-6 mb-10 shadow-[0_0_25px_rgba(0,191,255,0.3)]">
         <h3 className="text-2xl font-bold text-[#00FFFF] text-center mb-8 uppercase tracking-widest text-shadow-glow font-orbitron">⭐ SELEÇÃO MENSAL - TOP 11</h3>
         
         {/* Soccer Field Visualization */}
         <div className="relative bg-gradient-to-b from-[#0A2A4A] to-[#050818] border-2 border-[#00FFFF] rounded-xl p-8 mb-6 overflow-hidden shadow-[0_0_30px_rgba(0,255,255,0.4)]">
            {/* Field Lines Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(0,255,255,0.1)_50%,transparent_51%),linear-gradient(0deg,transparent_49%,rgba(0,255,255,0.1)_50%,transparent_51%)] pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col gap-8 items-center">
                <div className="flex justify-center w-full"><PlayerCard pos="gk" label="GK" /></div>
                <div className="flex justify-center w-full gap-4 md:gap-12">
                    <PlayerCard pos="zgd" label="ZGD" /><PlayerCard pos="zgc" label="ZGC" /><PlayerCard pos="zge" label="ZGE" />
                </div>
                <div className="flex justify-center w-full gap-4 md:gap-12">
                    <PlayerCard pos="vol" label="VOL" /><PlayerCard pos="mc" label="MC" /><PlayerCard pos="mei" label="MEI" />
                </div>
                <div className="flex justify-center w-full gap-12 md:gap-24">
                    <PlayerCard pos="alad" label="ALA D" /><PlayerCard pos="alae" label="ALA E" />
                </div>
                <div className="flex justify-center w-full gap-4 md:gap-8">
                    <PlayerCard pos="st1" label="ST" /><PlayerCard pos="st2" label="ST" />
                </div>
            </div>
         </div>
         
         <div className="flex justify-center">
            <NeonButton onClick={handleSaveTop11}>Salvar Seleção</NeonButton>
         </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-black/30 border-2 border-[#00FFFF] rounded-xl p-6 shadow-[0_0_25px_rgba(0,255,255,0.3)] overflow-hidden">
        <h3 className="text-2xl font-bold text-[#00FFFF] text-center mb-8 uppercase tracking-widest text-shadow-glow font-orbitron">📊 RANKING MENSAL</h3>
        <div className="w-full overflow-x-auto">
            <div className="min-w-[600px]">
                <div className="grid grid-cols-[60px_1fr_100px_100px_140px] bg-gradient-to-r from-[#6A00FF] to-[#00FFFF] text-white font-bold p-4 rounded-t-lg font-orbitron">
                    <div className="text-center">POS</div>
                    <div>EQUIPE</div>
                    <div className="text-center">TÍTULOS</div>
                    <div className="text-center">VITÓRIAS</div>
                    <div className="text-center">PARTICIPAÇÕES</div>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                    {leaderboard.map((row, idx) => (
                        <div key={idx} className={`grid grid-cols-[60px_1fr_100px_100px_140px] p-4 border-b border-[#333] items-center hover:bg-white/5 transition-colors ${idx === 0 ? 'bg-yellow-500/20' : idx === 1 ? 'bg-gray-400/20' : idx === 2 ? 'bg-orange-700/20' : ''}`}>
                            <div className="text-center font-bold text-[#00ff00] text-xl">{idx + 1}°</div>
                            <div className="flex items-center gap-3 font-bold">
                                <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center overflow-hidden border border-gray-600">
                                    {row.team.logo ? <img src={row.team.logo} className="w-full h-full object-cover" alt=""/> : '🛡️'}
                                </div>
                                {row.team.name}
                            </div>
                            <div className="text-center font-bold text-[#00ff00]">{row.titles}</div>
                            <div className="text-center font-bold text-[#00ff00]">{row.wins}</div>
                            <div className="text-center font-bold text-[#00ff00]">{row.participations}</div>
                        </div>
                    ))}
                    {leaderboard.length === 0 && <div className="p-8 text-center text-gray-500">Nenhuma equipe registrada ainda.</div>}
                </div>
            </div>
        </div>
      </div>

      {/* Player Edit Modal */}
      {editingPos && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] border-2 border-[#00ff00] rounded-2xl p-8 w-full max-w-md shadow-[0_0_40px_rgba(0,255,0,0.3)]">
            <h3 className="text-[#00ff00] text-center text-xl mb-6 font-orbitron uppercase">Editar Jogador</h3>
            <div className="mb-6">
                <label className="block text-[#00FFFF] text-sm font-bold mb-2 font-orbitron">Nome do Jogador</label>
                <input 
                    type="text" 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[#0A1124] border border-[#00FFFF] p-3 text-white rounded focus:outline-none focus:shadow-[0_0_15px_#00FFFF]"
                />
            </div>
            <div className="mb-8 text-center">
                <label className="block text-[#00FFFF] text-sm font-bold mb-3 font-orbitron">Avaliação</label>
                <div className="flex justify-center gap-2">
                    {[1,2,3,4,5].map(star => (
                        <span 
                            key={star} 
                            onClick={() => setEditStars(star)}
                            className={`text-3xl cursor-pointer transition-transform hover:scale-125 ${star <= editStars ? 'grayscale-0' : 'grayscale opacity-30'}`}
                        >
                            ⭐
                        </span>
                    ))}
                </div>
            </div>
            <div className="flex justify-center gap-4">
                <NeonButton onClick={savePlayerEdit}>Salvar</NeonButton>
                <NeonButton variant="secondary" onClick={() => setEditingPos(null)}>Cancelar</NeonButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankingScreen;