
import React, { useState, useEffect, useRef } from 'react';
import NeonButton from '../components/ui/NeonButton';
import FileUpload from '../components/ui/FileUpload';
import NeonInput from '../components/ui/NeonInput';
import { dataService, fileToBase64 } from '../services/dataService';
import { authService } from '../services/authService';
import { Top11Data, Team, AppConfig, User } from '../types';

interface RankingScreenProps {
  onBack: () => void;
  showToast: (msg: string) => void;
}

const RankingScreen: React.FC<RankingScreenProps> = ({ onBack, showToast }) => {
  const [top11, setTop11] = useState<Top11Data>(dataService.getTop11());
  const [appConfig, setAppConfig] = useState<AppConfig>(dataService.getAppConfig());
  const [editingPos, setEditingPos] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editStars, setEditStars] = useState(0);
  const [editPhoto, setEditPhoto] = useState<string | undefined>(undefined);
  const [editPosLabel, setEditPosLabel] = useState('');
  const [editWins, setEditWins] = useState(0);
  const [editGoals, setEditGoals] = useState(0);
  
  // Auto Highlight Data
  const [topPlayer, setTopPlayer] = useState<User | null>(null);
  const [topCaptain, setTopCaptain] = useState<User | null>(null);

  // Dragging State
  const fieldRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);

  useEffect(() => {
    // Calculate Highlights based on registered users stats
    const users = authService.getUsers();
    
    // Logic: Top Player = Max (Stars + Trophies)
    const sortedPlayers = [...users].sort((a, b) => {
        const scoreA = (a.stats?.stars || 0) + (a.stats?.trophies || 0);
        const scoreB = (b.stats?.stars || 0) + (b.stats?.trophies || 0);
        return scoreB - scoreA;
    });
    if (sortedPlayers.length > 0) setTopPlayer(sortedPlayers[0]);

    // Logic: Top Captain = Max Captain Count
    const sortedCaptains = [...users].sort((a, b) => (b.stats?.captainCount || 0) - (a.stats?.captainCount || 0));
    if (sortedCaptains.length > 0) setTopCaptain(sortedCaptains[0]);

  }, []);

  const handleSaveTop11 = () => {
    dataService.saveTop11(top11);
    showToast('✅ Seleção do mês salva!');
  };

  // --- Drag and Drop Logic ---
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, pos: string) => {
      // Important: If we hit the button, do not start drag!
      const target = e.target as HTMLElement;
      if (target.closest('button')) return;

      e.preventDefault(); // Prevent default touch actions like scrolling
      setIsDragging(pos);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDragging || !fieldRef.current) return;

      const fieldRect = fieldRef.current.getBoundingClientRect();
      
      let clientX, clientY;
      if ('touches' in e) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
      } else {
          clientX = (e as React.MouseEvent).clientX;
          clientY = (e as React.MouseEvent).clientY;
      }

      // Calculate percentage relative to field
      let x = ((clientX - fieldRect.left) / fieldRect.width) * 100;
      let y = ((clientY - fieldRect.top) / fieldRect.height) * 100;

      // Clamp
      x = Math.max(0, Math.min(100, x));
      y = Math.max(0, Math.min(100, y));

      setTop11(prev => ({
          ...prev,
          [isDragging]: { ...prev[isDragging], x, y }
      }));
  };

  const handleMouseUp = () => {
      setIsDragging(null);
  };

  // --- Editing Logic ---
  const openEditModal = (pos: string) => {
    setEditingPos(pos);
    setEditName(top11[pos].name);
    setEditStars(top11[pos].stars);
    setEditPhoto(top11[pos].photo);
    setEditPosLabel(top11[pos].customPositionLabel || pos.toUpperCase());
    setEditWins(top11[pos].stats?.wins || 0);
    setEditGoals(top11[pos].stats?.goals || 0);
  };

  const savePlayerEdit = () => {
    if (editingPos) {
      setTop11(prev => ({
        ...prev,
        [editingPos]: { 
            ...prev[editingPos], 
            name: editName, 
            stars: editStars, 
            photo: editPhoto,
            customPositionLabel: editPosLabel,
            stats: {
              ...prev[editingPos].stats,
              stars: editStars,
              trophies: prev[editingPos].stats?.trophies || 0,
              captainCount: prev[editingPos].stats?.captainCount || 0,
              wins: editWins,
              goals: editGoals
            }
        }
      }));
      setEditingPos(null);
      showToast('✅ Jogador atualizado');
    }
  };

  const PlayerCard = ({ pos }: { pos: string }) => {
      const data = top11[pos];
      return (
        <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move z-10 hover:z-50 group touch-none select-none"
            style={{ left: `${data.x || 50}%`, top: `${data.y || 50}%`, touchAction: 'none' }}
            onMouseDown={(e) => handleMouseDown(e, pos)}
            onTouchStart={(e) => handleMouseDown(e, pos)}
        >
            <div className="flex flex-col items-center w-[90px] md:w-[110px]">
                {/* Card Body */}
                <div className="relative bg-black/70 border-2 border-white/80 rounded-lg p-1 w-full text-center backdrop-blur-sm shadow-[0_5px_15px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-110 group-hover:border-[#00ff00]">
                     {/* Position Label (Customizable) */}
                     <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white text-black text-[9px] font-bold px-2 py-0.5 rounded shadow-sm font-orbitron whitespace-nowrap">
                         {data.customPositionLabel || pos.toUpperCase()}
                     </div>
                     
                     {/* Photo */}
                     <div className="w-14 h-14 mx-auto rounded-full border border-white/30 overflow-hidden bg-black my-1 pointer-events-none">
                         {data.photo ? (
                             <img src={data.photo} className="w-full h-full object-cover" draggable={false} />
                         ) : (
                             <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
                         )}
                     </div>

                     <div className="font-bold text-white text-[9px] md:text-[10px] truncate w-full px-1 pointer-events-none text-shadow">{data.name}</div>
                     <div className="text-[8px] text-yellow-400 pointer-events-none">{'⭐'.repeat(data.stars)}</div>
                     
                     {/* Stats display on card */}
                     {(data.stats?.wins !== undefined || data.stats?.goals !== undefined) && (data.stats.wins > 0 || data.stats.goals > 0) && (
                       <div className="flex justify-center gap-2 mt-1 border-t border-white/20 pt-1">
                         {data.stats.wins !== undefined && (
                           <div className="flex items-center gap-0.5">
                             <span className="text-[8px]">🏆</span>
                             <span className="text-[8px] text-white font-bold">{data.stats.wins}</span>
                           </div>
                         )}
                         {data.stats.goals !== undefined && (
                           <div className="flex items-center gap-0.5">
                             <span className="text-[8px]">⚽</span>
                             <span className="text-[8px] text-white font-bold">{data.stats.goals}</span>
                           </div>
                         )}
                       </div>
                     )}
                     
                     {/* Always visible Edit Button for Mobile Accessibility */}
                     <button 
                        className="absolute -bottom-3 right-0 w-6 h-6 bg-[#00FFFF] text-black rounded-full flex items-center justify-center text-xs border border-white shadow-sm z-20 cursor-pointer hover:scale-110 transition-transform"
                        title="Editar Jogador"
                        onClick={(e) => { 
                            e.stopPropagation(); // CRITICAL: Stop drag start
                            openEditModal(pos); 
                        }}
                        onTouchEnd={(e) => {
                             e.stopPropagation();
                             // openEditModal called via onClick usually works, but touch handling can be finicky
                        }}
                     >
                        ✏️
                     </button>
                </div>
            </div>
        </div>
      );
  };

  return (
    <div 
        className="animate-fade-in bg-gradient-to-br from-[#050818] to-[#0A1124] border-2 border-[#00FFFF] rounded-2xl p-4 md:p-8 mb-8 shadow-[0_0_35px_rgba(0,255,255,0.3)]"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        onMouseLeave={handleMouseUp}
    >
      <div className="flex justify-between items-center mb-6">
        <NeonButton variant="secondary" onClick={onBack}>← Voltar</NeonButton>
        <div className="text-xs text-gray-500 italic">Arraste os jogadores para mover</div>
      </div>
      
      {/* Automated Highlights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Captain Highlight */}
          <div className="bg-black/40 border border-[#00FFFF]/50 p-4 rounded-xl flex items-center gap-4">
              <div className="w-20 h-20 bg-[#00FFFF]/10 rounded-full flex items-center justify-center text-3xl border border-[#00FFFF] overflow-hidden shadow-[0_0_15px_#00FFFF]">
                  {topCaptain?.tournamentLogo ? <img src={topCaptain.tournamentLogo} className="w-full h-full object-cover"/> : '👑'}
              </div>
              <div className="flex-1">
                  <div className="text-[10px] text-[#00FFFF] uppercase font-orbitron tracking-widest mb-1">Capitão Destaque</div>
                  <div className="text-xl md:text-2xl font-bold text-white font-orbitron">{topCaptain?.nickname || 'N/A'}</div>
                  <div className="text-xs text-gray-400">Equipe: {topCaptain?.currentTeam || 'N/A'}</div>
                  <div className="text-xs text-[#00FFFF] font-bold mt-1">{topCaptain?.stats?.captainCount || 0}x Capitão</div>
              </div>
          </div>

          {/* Player Highlight */}
          <div className="bg-black/40 border border-[#00FFFF]/50 p-4 rounded-xl flex items-center gap-4">
              <div className="w-20 h-20 bg-[#00FFFF]/10 rounded-full flex items-center justify-center text-3xl border border-[#00FFFF] overflow-hidden shadow-[0_0_15px_#00FFFF]">
                   {/* We don't have user avatars yet, using placeholder or team logo */}
                  <span className="text-4xl">⚽</span>
              </div>
              <div className="flex-1">
                  <div className="text-[10px] text-[#00FFFF] uppercase font-orbitron tracking-widest mb-1">Craque do Mês</div>
                  <div className="text-xl md:text-2xl font-bold text-white font-orbitron">{topPlayer?.nickname || 'N/A'}</div>
                  <div className="text-xs text-gray-400">Posição: {topPlayer?.position || 'N/A'}</div>
                   <div className="text-xs text-[#00FFFF] font-bold mt-1">
                       {topPlayer?.stats?.stars || 0} ⭐ | {topPlayer?.stats?.trophies || 0} 🏆
                   </div>
              </div>
          </div>
      </div>

      {/* Soccer Field (Drag Area) - VERTICAL ORIENTATION */}
      <div className="relative w-full max-w-[700px] mx-auto mb-8 flex justify-center">
          
         {/* Left Decoration */}
         {appConfig.rankingDecorations?.left && (
             <img 
                src={appConfig.rankingDecorations.left} 
                className="hidden md:block w-[120px] object-contain self-end -mr-6 z-20 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                alt=""
             />
         )}

         <div className="flex-1 max-w-[500px]">
            <h3 className="text-2xl font-bold text-[#00FFFF] text-center mb-4 uppercase tracking-widest text-shadow-glow font-orbitron">
                ⭐ {appConfig.selectionTitle || 'SELEÇÃO DA SEMANA'}
            </h3>
            
            {/* Vertical Aspect Ratio: 3/4 */}
            <div 
                ref={fieldRef}
                className="relative w-full aspect-[3/4] border-4 border-white rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] touch-none"
                style={{
                    backgroundImage: `url('https://img.freepik.com/free-photo/green-grass-texture-background_113767-326.jpg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    boxShadow: 'inset 0 0 80px rgba(0,0,0,0.6)'
                }}
            >
                {/* Field Markings (Vertical/Portrait Style) */}
                
                {/* Center Line (Horizontal now) */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-white/70 transform -translate-y-1/2"></div>
                
                {/* Center Circle */}
                <div className="absolute top-1/2 left-1/2 w-[25%] aspect-square border-2 border-white/70 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/70 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>

                {/* Top Goal Area */}
                <div className="absolute top-0 left-1/2 w-[40%] h-[12%] border-2 border-t-0 border-white/70 transform -translate-x-1/2"></div>
                
                {/* Bottom Goal Area */}
                <div className="absolute bottom-0 left-1/2 w-[40%] h-[12%] border-2 border-b-0 border-white/70 transform -translate-x-1/2"></div>
                
                {/* Corner Arcs */}
                <div className="absolute top-0 left-0 w-8 h-8 border-b-2 border-r-2 border-white/70 rounded-br-full"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-b-2 border-l-2 border-white/70 rounded-bl-full"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-t-2 border-r-2 border-white/70 rounded-tr-full"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-t-2 border-l-2 border-white/70 rounded-tl-full"></div>
                
                {/* Players */}
                {Object.keys(top11).map(pos => (
                    <PlayerCard key={pos} pos={pos} />
                ))}
            </div>
         </div>

         {/* Right Decoration */}
         {appConfig.rankingDecorations?.right && (
             <img 
                src={appConfig.rankingDecorations.right} 
                className="hidden md:block w-[120px] object-contain self-end -ml-6 z-20 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                alt=""
             />
         )}

      </div>
         
        <div className="flex justify-center mt-6">
        <NeonButton onClick={handleSaveTop11}>Salvar Formação</NeonButton>
        </div>

      {/* Player Edit Modal */}
      {editingPos && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setEditingPos(null)}>
          <div className="bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] border-2 border-[#00ff00] rounded-2xl p-8 w-full max-w-md shadow-[0_0_40px_rgba(0,255,0,0.3)] z-50" onClick={e => e.stopPropagation()}>
            <h3 className="text-[#00ff00] text-center text-xl mb-6 font-orbitron uppercase">Editar Jogador</h3>
            
            <div className="flex justify-center mb-6">
                <div className="w-32 h-32 rounded-full bg-black border-4 border-[#00FFFF] overflow-hidden flex items-center justify-center shadow-lg">
                    {editPhoto ? <img src={editPhoto} className="w-full h-full object-cover" /> : <span className="text-5xl">👤</span>}
                </div>
            </div>
            
            <div className="mb-4">
                <FileUpload label="Foto do Jogador" onChange={async (f) => setEditPhoto(await fileToBase64(f))} helperText="Tamanho Ideal: 200x200px" />
            </div>

            <NeonInput label="Nome do Jogador" value={editName} onChange={e => setEditName(e.target.value)} />
            
            <NeonInput label="Rótulo da Posição" value={editPosLabel} onChange={e => setEditPosLabel(e.target.value)} placeholder="Ex: Ponta Direita" />

            <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="bg-black/50 p-3 rounded border border-white/20">
                 <label className="block text-[#00FFFF] text-xs font-bold mb-2 font-orbitron uppercase">Vitórias</label>
                 <input 
                   type="number" 
                   value={editWins} 
                   onChange={e => setEditWins(Number(e.target.value))}
                   className="w-full bg-black border border-gray-600 rounded p-2 text-white text-center"
                 />
               </div>
               <div className="bg-black/50 p-3 rounded border border-white/20">
                 <label className="block text-[#00FFFF] text-xs font-bold mb-2 font-orbitron uppercase">Gols</label>
                 <input 
                   type="number" 
                   value={editGoals} 
                   onChange={e => setEditGoals(Number(e.target.value))}
                   className="w-full bg-black border border-gray-600 rounded p-2 text-white text-center"
                 />
               </div>
            </div>
            
            <div className="mb-8 text-center">
                <label className="block text-[#00FFFF] text-sm font-bold mb-3 font-orbitron">Avaliação</label>
                <div className="flex justify-center gap-2">
                    {[1,2,3,4,5].map(star => (
                        <span 
                            key={star} 
                            onClick={() => setEditStars(star)}
                            className={`text-3xl cursor-pointer hover:scale-125 transition-transform ${star <= editStars ? 'grayscale-0' : 'grayscale opacity-30'}`}
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
