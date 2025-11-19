
import React, { useState, useEffect } from 'react';
import NeonButton from '../components/ui/NeonButton';
import NeonInput from '../components/ui/NeonInput';
import { dataService } from '../services/dataService';
import { Team, Bracket, Match, MatchTeam } from '../types';
import { authService } from '../services/authService';

interface BracketsScreenProps {
  onBack: () => void;
}

const BracketsScreen: React.FC<BracketsScreenProps> = ({ onBack }) => {
  const [brackets, setBrackets] = useState<Bracket[]>([]);
  const [activeBracket, setActiveBracket] = useState<Bracket | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Creation State
  const [newBracketName, setNewBracketName] = useState('');
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [teamFilter, setTeamFilter] = useState<string>('all');

  // Editing Match State
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);

  const isAdmin = authService.getSession()?.user?.role === 'admin';

  useEffect(() => {
    refreshData();
  }, []);

  // Update filtered teams when filter or allTeams changes
  useEffect(() => {
      if (teamFilter === 'all') {
          setFilteredTeams(allTeams);
      } else {
          setFilteredTeams(allTeams.filter(t => t.tournamentType === teamFilter));
      }
  }, [teamFilter, allTeams]);

  const refreshData = () => {
    setBrackets(dataService.getBrackets());
    setAllTeams(dataService.getTeams());
  };

  const toggleTeamSelection = (id: string) => {
    if (selectedTeamIds.includes(id)) {
      setSelectedTeamIds(selectedTeamIds.filter(tid => tid !== id));
    } else {
      setSelectedTeamIds([...selectedTeamIds, id]);
    }
  };

  const handleSelectAll = () => {
      const ids = filteredTeams.map(t => t.id);
      // Merge with existing selection to avoid duplicates if multiple selects used
      const newSelection = Array.from(new Set([...selectedTeamIds, ...ids]));
      setSelectedTeamIds(newSelection);
  };

  const handleCreateBracket = () => {
    if (!newBracketName) return alert('Nome da tabela é obrigatório');
    if (selectedTeamIds.length < 2) return alert('Selecione pelo menos 2 equipes');
    
    const selectedTeams = allTeams.filter(t => selectedTeamIds.includes(t.id));
    const newBracket = dataService.generateBracket(newBracketName, selectedTeams);
    
    dataService.saveBracket(newBracket);
    refreshData();
    setIsCreating(false);
    setNewBracketName('');
    setSelectedTeamIds([]);
    setTeamFilter('all');
  };

  const handleDeleteBracket = (id: string) => {
      if(confirm("Tem certeza que deseja excluir esta tabela?")) {
          dataService.deleteBracket(id);
          refreshData();
          if(activeBracket?.id === id) setActiveBracket(null);
      }
  };

  const handleMatchClick = (match: Match) => {
      if (!isAdmin) return;
      setEditingMatch(match);
      setScoreA(match.teamA.score || 0);
      setScoreB(match.teamB.score || 0);
  };

  const handleUpdateMatch = () => {
      if (!activeBracket || !editingMatch) return;

      // Validation: Ties are problematic for brackets advancement
      if (scoreA === scoreB) {
          alert("Atenção: Para avançar na chave, é necessário haver um vencedor (placares diferentes).");
          return;
      }

      const updatedMatches = [...activeBracket.matches];
      const matchIndex = updatedMatches.findIndex(m => m.id === editingMatch.id);
      
      if (matchIndex > -1) {
          const match = updatedMatches[matchIndex];
          match.teamA.score = scoreA;
          match.teamB.score = scoreB;
          match.status = 'completed';
          
          // Determine winner
          const winnerIsA = scoreA > scoreB;
          const winner: MatchTeam = winnerIsA ? match.teamA : match.teamB;
          
          match.teamA.isWinner = winnerIsA;
          match.teamB.isWinner = !winnerIsA;

          // Propagation Logic
          if (match.nextMatchId && winner.id) {
              const nextMatchIndex = updatedMatches.findIndex(m => m.id === match.nextMatchId);
              
              if (nextMatchIndex > -1) {
                  const nextMatch = updatedMatches[nextMatchIndex];

                  // Robust sorting to determine slot index based on creation order ID suffix
                  const currentRoundMatches = updatedMatches
                    .filter(m => m.roundId === match.roundId)
                    .sort((a, b) => {
                         const getCounter = (id: string) => {
                             const parts = id.split('-');
                             return parseInt(parts[parts.length - 1]) || 0;
                         };
                         const counterA = getCounter(a.id);
                         const counterB = getCounter(b.id);
                         return counterA - counterB;
                    });

                  const myIndexInRound = currentRoundMatches.findIndex(m => m.id === match.id);

                  if (myIndexInRound !== -1) {
                      const nextTeamData = { 
                          id: winner.id, 
                          name: winner.name, 
                          logo: winner.logo,
                          score: 0, 
                          isWinner: false
                      };

                      // Even index -> Team A slot in next match
                      // Odd index -> Team B slot in next match
                      if (myIndexInRound % 2 === 0) {
                          nextMatch.teamA = nextTeamData;
                      } else {
                          nextMatch.teamB = nextTeamData;
                      }
                      
                      // Reset status of next match to prevent stale state
                      nextMatch.status = 'scheduled';
                      nextMatch.teamA.isWinner = false;
                      nextMatch.teamB.isWinner = false;
                      nextMatch.teamA.score = 0;
                      nextMatch.teamB.score = 0;
                  }
              }
          }

          const updatedBracket = { ...activeBracket, matches: updatedMatches };
          dataService.saveBracket(updatedBracket);
          setActiveBracket(updatedBracket);
          refreshData();
          setEditingMatch(null);
      }
  };

  // Render Logic
  const renderBracketView = (bracket: Bracket) => {
      // Group matches by round
      const rounds: Record<number, Match[]> = {};
      bracket.matches.forEach(m => {
          if (!rounds[m.roundId]) rounds[m.roundId] = [];
          rounds[m.roundId].push(m);
      });

      // Sort matches inside rounds by numeric ID suffix to ensure visual alignment
      Object.keys(rounds).forEach(key => {
          rounds[Number(key)].sort((a, b) => {
               const getCounter = (id: string) => {
                   const parts = id.split('-');
                   return parseInt(parts[parts.length - 1]) || 0;
               };
               return getCounter(a.id) - getCounter(b.id);
          });
      });

      const roundKeys = Object.keys(rounds).map(Number).sort((a, b) => a - b);

      return (
          <div className="flex gap-8 overflow-x-auto pb-8 px-4 min-h-[500px]">
              {roundKeys.map((roundId, rIdx) => (
                  <div key={roundId} className="flex flex-col justify-center gap-8 min-w-[260px]">
                      <div className="text-center font-orbitron text-[#00FFFF] uppercase tracking-widest mb-4 font-bold bg-black/50 p-2 rounded border-b border-[#00FFFF]">
                          {rIdx === roundKeys.length - 1 ? '👑 Grande Final' : rIdx === roundKeys.length - 2 ? '⚔️ Semifinal' : `Round ${roundId + 1}`}
                      </div>
                      <div className="flex flex-col justify-around flex-grow gap-8">
                          {rounds[roundId].map(match => (
                              <div 
                                key={match.id} 
                                onClick={() => handleMatchClick(match)}
                                className={`relative bg-[#0a0a0a] border rounded-xl p-3 transition-all ${isAdmin ? 'cursor-pointer hover:scale-105 hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]' : ''} ${match.status === 'completed' ? 'border-[#00FF00]/50' : 'border-[#00FFFF]/30'}`}
                              >
                                  {/* Connector Line (Right) - unless final */}
                                  {match.nextMatchId && (
                                      <div className="absolute top-1/2 -right-8 w-8 h-[2px] bg-[#00FFFF]/30 z-0"></div>
                                  )}

                                  {/* Team A */}
                                  <div className={`flex justify-between items-center p-2 rounded mb-1 border-l-4 transition-colors ${match.teamA.isWinner ? 'bg-[#00FF00]/10 border-[#00FF00]' : 'bg-black/40 border-transparent'}`}>
                                      <div className="flex items-center gap-2 overflow-hidden">
                                          <div className="w-7 h-7 rounded-full bg-black border border-[#00FFFF] flex items-center justify-center text-[10px] shrink-0">
                                              {match.teamA.logo ? <img src={match.teamA.logo} className="w-full h-full object-cover rounded-full"/> : '🛡️'}
                                          </div>
                                          <span className={`text-xs font-bold truncate max-w-[110px] font-orbitron ${match.teamA.isWinner ? 'text-[#00FF00]' : 'text-white'}`}>
                                              {match.teamA.name}
                                          </span>
                                      </div>
                                      <span className={`font-mono font-bold text-lg ${match.teamA.isWinner ? 'text-[#00FF00]' : 'text-gray-500'}`}>
                                          {match.teamA.score !== undefined ? match.teamA.score : '-'}
                                      </span>
                                  </div>

                                  {/* VS Separator */}
                                  {match.status !== 'completed' && (
                                      <div className="text-[8px] text-center text-gray-600 -my-1">VS</div>
                                  )}

                                  {/* Team B */}
                                  <div className={`flex justify-between items-center p-2 rounded border-l-4 transition-colors ${match.teamB.isWinner ? 'bg-[#00FF00]/10 border-[#00FF00]' : 'bg-black/40 border-transparent'}`}>
                                       <div className="flex items-center gap-2 overflow-hidden">
                                          <div className="w-7 h-7 rounded-full bg-black border border-[#00FFFF] flex items-center justify-center text-[10px] shrink-0">
                                              {match.teamB.logo ? <img src={match.teamB.logo} className="w-full h-full object-cover rounded-full"/> : '🛡️'}
                                          </div>
                                          <span className={`text-xs font-bold truncate max-w-[110px] font-orbitron ${match.teamB.isWinner ? 'text-[#00FF00]' : 'text-white'}`}>
                                              {match.teamB.name}
                                          </span>
                                      </div>
                                      <span className={`font-mono font-bold text-lg ${match.teamB.isWinner ? 'text-[#00FF00]' : 'text-gray-500'}`}>
                                          {match.teamB.score !== undefined ? match.teamB.score : '-'}
                                      </span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              ))}
          </div>
      );
  };

  return (
    <div className="animate-fade-in bg-[#0A1124] border-2 border-[#00FFFF] rounded-2xl p-6 mb-8 shadow-[0_0_35px_rgba(0,255,255,0.3)] min-h-[600px]">
       <div className="flex justify-between items-center mb-6 border-b-2 border-[#00FFFF] pb-4">
          <div className="flex gap-4">
              <NeonButton variant="secondary" onClick={activeBracket || isCreating ? () => {setActiveBracket(null); setIsCreating(false)} : onBack}>
                  {activeBracket || isCreating ? '← Voltar' : '← Início'}
              </NeonButton>
          </div>
          <h2 className="text-xl md:text-3xl font-bold text-center uppercase tracking-[3px] text-[#00FFFF] font-orbitron text-shadow-glow">
            {activeBracket ? activeBracket.name : 'Tabelas de Jogos'}
          </h2>
          <div>
             {!isCreating && !activeBracket && isAdmin && (
                 <NeonButton onClick={() => setIsCreating(true)}>+ Nova Tabela</NeonButton>
             )}
          </div>
       </div>

       {/* Mode: List Brackets */}
       {!activeBracket && !isCreating && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {brackets.map(b => (
                   <div key={b.id} className="bg-black/30 border border-[#00FFFF]/50 p-6 rounded-xl hover:bg-[#00FFFF]/10 transition-all group cursor-pointer" onClick={() => setActiveBracket(b)}>
                       <div className="text-xl font-bold text-white font-orbitron mb-2 group-hover:text-[#00FFFF]">{b.name}</div>
                       <div className="text-gray-400 text-xs mb-4">Criado em: {new Date(b.createdAt).toLocaleDateString('pt-BR')}</div>
                       <div className="flex justify-between items-center">
                           <button className="text-[#00FFFF] font-bold hover:underline text-sm">VISUALIZAR ▶</button>
                           {isAdmin && (
                               <button onClick={(e) => { e.stopPropagation(); handleDeleteBracket(b.id); }} className="text-red-500 hover:text-red-400 z-10 p-2">🗑️</button>
                           )}
                       </div>
                   </div>
               ))}
               {brackets.length === 0 && (
                   <div className="col-span-full text-center text-gray-500 py-12 border-2 border-dashed border-gray-800 rounded-xl">
                       <div className="text-4xl mb-4">⚔️</div>
                       <p>Nenhuma tabela criada.</p>
                       {isAdmin && <p className="text-sm mt-2 text-[#00FFFF]">Clique em "+ Nova Tabela" para começar.</p>}
                   </div>
               )}
           </div>
       )}

       {/* Mode: Create Bracket */}
       {isCreating && (
           <div className="max-w-2xl mx-auto bg-black/40 p-6 rounded-xl border border-[#00FFFF]/30">
               <h3 className="text-[#00FFFF] font-bold mb-4 text-xl font-orbitron">Nova Tabela de Eliminação</h3>
               <NeonInput label="Nome da Tabela" value={newBracketName} onChange={e => setNewBracketName(e.target.value)} placeholder="Ex: Copa MD3 Edição 1" />
               
               <div className="mb-6">
                   <div className="flex justify-between items-end mb-2">
                       <label className="block text-[#00FFFF] font-bold text-sm uppercase font-orbitron">
                           Selecionar Equipes ({selectedTeamIds.length})
                       </label>
                       <div className="flex gap-2">
                           <select 
                            className="bg-black border border-gray-600 text-white text-xs p-1 rounded"
                            value={teamFilter}
                            onChange={(e) => setTeamFilter(e.target.value)}
                           >
                               <option value="all">Todos os Torneios</option>
                               <option value="copa">Copa Network</option>
                               <option value="md3-diaria">MD3 Diária</option>
                               <option value="md3-marcelo">MD3 Marcelo</option>
                               <option value="md3-istrawl">MD3 Istrawl</option>
                           </select>
                           <button onClick={handleSelectAll} className="text-xs text-[#00FFFF] border border-[#00FFFF] px-2 py-1 rounded hover:bg-[#00FFFF] hover:text-black">
                               Todos
                           </button>
                           <button onClick={() => setSelectedTeamIds([])} className="text-xs text-red-500 border border-red-500 px-2 py-1 rounded hover:bg-red-500 hover:text-white">
                               Limpar
                           </button>
                       </div>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto custom-scrollbar p-2 border border-gray-700 rounded bg-black/50">
                       {filteredTeams.length === 0 && (
                           <div className="col-span-full text-center text-gray-500 py-4">Nenhuma equipe encontrada.</div>
                       )}
                       {filteredTeams.map(t => (
                           <div 
                            key={t.id} 
                            onClick={() => toggleTeamSelection(t.id)}
                            className={`p-2 rounded cursor-pointer flex items-center gap-2 transition-all ${selectedTeamIds.includes(t.id) ? 'bg-[#00FFFF]/30 border border-[#00FFFF]' : 'hover:bg-white/5 border border-transparent'}`}
                           >
                               <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center border border-gray-600 overflow-hidden">
                                   {t.logo ? <img src={t.logo} className="w-full h-full object-cover"/> : '🛡️'}
                               </div>
                               <span className="text-sm text-white truncate flex-1">{t.name}</span>
                               {selectedTeamIds.includes(t.id) && <span className="text-[#00FFFF] font-bold">✓</span>}
                           </div>
                       ))}
                   </div>
                   <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                       * Selecione as equipes participantes (ex: 8, 16, 32). 
                       O sistema gerará automaticamente os confrontos. Se o número de equipes não for potência de 2 (ex: 12), o sistema criará "BYEs" e avançará os times automaticamente.
                   </p>
               </div>

               <div className="flex justify-center gap-4">
                   <NeonButton onClick={handleCreateBracket}>Gerar Tabela</NeonButton>
                   <NeonButton variant="secondary" onClick={() => setIsCreating(false)}>Cancelar</NeonButton>
               </div>
           </div>
       )}

       {/* Mode: View Bracket */}
       {activeBracket && (
           <div className="overflow-x-auto custom-scrollbar">
               {renderBracketView(activeBracket)}
           </div>
       )}

       {/* Match Edit Modal */}
       {editingMatch && (
           <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
               <div className="bg-[#0a0a0a] border-2 border-[#00FFFF] rounded-xl p-6 w-full max-w-md shadow-[0_0_30px_rgba(0,255,255,0.3)]">
                   <h3 className="text-center text-[#00FFFF] font-bold text-xl mb-6 font-orbitron uppercase">Atualizar Placar</h3>
                   
                   <div className="flex items-center justify-between gap-4 mb-8">
                       <div className="flex-1 text-center">
                           <div className="w-16 h-16 mx-auto mb-2 bg-black rounded-full border border-[#00FFFF] flex items-center justify-center overflow-hidden">
                                {editingMatch.teamA.logo ? <img src={editingMatch.teamA.logo} className="w-full h-full object-cover"/> : '🛡️'}
                           </div>
                           <div className="text-sm font-bold mb-2 truncate text-[#00FFFF] h-5">{editingMatch.teamA.name}</div>
                           <input 
                            type="number" 
                            value={scoreA} 
                            onChange={e => setScoreA(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-20 p-2 bg-black border-2 border-[#00FFFF] rounded text-center text-white text-2xl font-bold outline-none focus:shadow-[0_0_15px_#00FFFF]"
                           />
                       </div>
                       <div className="text-2xl font-bold text-gray-500 font-orbitron">VS</div>
                       <div className="flex-1 text-center">
                           <div className="w-16 h-16 mx-auto mb-2 bg-black rounded-full border border-[#00FFFF] flex items-center justify-center overflow-hidden">
                                {editingMatch.teamB.logo ? <img src={editingMatch.teamB.logo} className="w-full h-full object-cover"/> : '🛡️'}
                           </div>
                           <div className="text-sm font-bold mb-2 truncate text-[#00FFFF] h-5">{editingMatch.teamB.name}</div>
                           <input 
                            type="number" 
                            value={scoreB} 
                            onChange={e => setScoreB(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-20 p-2 bg-black border-2 border-[#00FFFF] rounded text-center text-white text-2xl font-bold outline-none focus:shadow-[0_0_15px_#00FFFF]"
                           />
                       </div>
                   </div>

                   <div className="flex justify-center gap-4">
                       <NeonButton onClick={handleUpdateMatch} className="w-full">Confirmar Resultado</NeonButton>
                   </div>
                   <div className="mt-4 text-center">
                       <button onClick={() => setEditingMatch(null)} className="text-gray-400 hover:text-white text-sm underline">Cancelar</button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};

export default BracketsScreen;
