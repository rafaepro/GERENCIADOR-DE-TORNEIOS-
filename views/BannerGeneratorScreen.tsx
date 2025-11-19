
import React, { useState, useEffect } from 'react';
import NeonButton from '../components/ui/NeonButton';
import NeonInput from '../components/ui/NeonInput';
import FileUpload from '../components/ui/FileUpload';
import { authService } from '../services/authService';
import { fileToBase64 } from '../services/dataService';
import { User } from '../types';

interface BannerGeneratorScreenProps {
  onBack: () => void;
}

const BannerGeneratorScreen: React.FC<BannerGeneratorScreenProps> = ({ onBack }) => {
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  
  // Banner Data
  const [tournamentName, setTournamentName] = useState('MD3 CHAMPIONSHIP');
  const [teamName, setTeamName] = useState('');
  const [captainName, setCaptainName] = useState('');
  
  // Images
  const [img1, setImg1] = useState<string>(''); // Background
  const [img2, setImg2] = useState<string>(''); // Team Logo
  const [img3, setImg3] = useState<string>(''); // Decoration

  // New Images (Inspiration & Community)
  const [playerImg1, setPlayerImg1] = useState<string>('');
  const [playerImg2, setPlayerImg2] = useState<string>('');
  const [communityLogo, setCommunityLogo] = useState<string>('');

  // Lineup (11 Players)
  const [lineup, setLineup] = useState(Array(11).fill({ name: '', position: '' }).map((_, i) => ({
    id: i,
    name: '',
    position: ['GK', 'ZAG', 'ZAG', 'ZAG', 'VOL', 'MEI', 'MEI', 'ALA', 'ALA', 'ATA', 'ATA'][i]
  })));

  useEffect(() => {
    setRegisteredUsers(authService.getUsers().filter(u => u.isActive));
  }, []);

  const handlePlayerSelect = (index: number, userId: string) => {
    const user = registeredUsers.find(u => u.id === userId);
    const newLineup = [...lineup];
    if (user) {
      newLineup[index].name = user.nickname;
      // Optional: Update position based on user preference?
      // newLineup[index].position = user.position;
    } else {
      newLineup[index].name = '';
    }
    setLineup(newLineup);
  };

  const handleManualNameChange = (index: number, val: string) => {
    const newLineup = [...lineup];
    newLineup[index].name = val;
    setLineup(newLineup);
  };

  const handlePositionChange = (index: number, val: string) => {
    const newLineup = [...lineup];
    newLineup[index].position = val;
    setLineup(newLineup);
  };

  return (
    <div className="animate-fade-in bg-[#0A1124] border-2 border-[#00FF00] rounded-2xl p-6 mb-8 shadow-[0_0_35px_rgba(0,255,0,0.2)]">
      <NeonButton variant="secondary" onClick={onBack} className="mb-6 !border-[#00ff00] !text-[#00ff00] hover:!bg-[#00ff00] hover:!text-black">← Voltar</NeonButton>
      
      <h2 className="text-3xl font-bold text-center mb-8 uppercase tracking-[3px] text-[#00FF00] font-orbitron drop-shadow-[0_0_20px_#00FF00] border-b-2 border-[#00FF00] pb-4">
        Gerador de Banner MD3
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Form */}
        <div className="space-y-6">
          <div className="bg-black/30 p-4 rounded border border-[#00FF00]/30">
            <h3 className="text-[#00FF00] font-orbitron mb-4 border-b border-[#00FF00]/30 pb-2 uppercase text-sm">Informações Gerais</h3>
            <NeonInput label="Nome do Torneio" value={tournamentName} onChange={e => setTournamentName(e.target.value)} />
            <NeonInput label="Nome da Equipe" value={teamName} onChange={e => setTeamName(e.target.value)} />
            <NeonInput label="Nome do Capitão" value={captainName} onChange={e => setCaptainName(e.target.value)} />
          </div>

          <div className="bg-black/30 p-4 rounded border border-[#00FF00]/30">
            <h3 className="text-[#00FF00] font-orbitron mb-4 border-b border-[#00FF00]/30 pb-2 uppercase text-sm">Imagens Principais</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FileUpload label="1. Fundo/BG" onChange={async (f) => setImg1(await fileToBase64(f))} />
              <FileUpload label="2. Logo Equipe" onChange={async (f) => setImg2(await fileToBase64(f))} />
              <FileUpload label="3. Extra/Sponsor" onChange={async (f) => setImg3(await fileToBase64(f))} />
            </div>
          </div>

          <div className="bg-black/30 p-4 rounded border border-[#00FF00]/30">
            <h3 className="text-[#00FF00] font-orbitron mb-4 border-b border-[#00FF00]/30 pb-2 uppercase text-sm">Destaques & Comunidade</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FileUpload label="Jogador Destaque 1" onChange={async (f) => setPlayerImg1(await fileToBase64(f))} helperText="Lado Esquerdo (PNG)" />
              <FileUpload label="Jogador Destaque 2" onChange={async (f) => setPlayerImg2(await fileToBase64(f))} helperText="Lado Direito (PNG)" />
              <FileUpload label="Logo Comunidade" onChange={async (f) => setCommunityLogo(await fileToBase64(f))} helperText="Canto Superior" />
            </div>
          </div>

          <div className="bg-black/30 p-4 rounded border border-[#00FF00]/30 max-h-[500px] overflow-y-auto custom-scrollbar">
            <h3 className="text-[#00FF00] font-orbitron mb-4 border-b border-[#00FF00]/30 pb-2 uppercase text-sm">Line-up (11 Jogadores)</h3>
            <div className="space-y-3">
              {lineup.map((player, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-2 items-end sm:items-center bg-white/5 p-3 rounded border border-white/10">
                   <div className="w-full sm:w-20">
                      <label className="text-[10px] text-gray-400 uppercase">Posição</label>
                      <input 
                        className="w-full bg-black border border-gray-600 text-[#00FF00] font-bold text-xs p-2 rounded focus:border-[#00FF00] outline-none"
                        value={player.position}
                        onChange={(e) => handlePositionChange(idx, e.target.value)}
                      />
                   </div>
                   <div className="flex-1 w-full">
                      <label className="text-[10px] text-gray-400 uppercase">Nome Manual</label>
                      <input 
                        className="w-full bg-black border border-gray-600 text-white text-sm p-2 rounded focus:border-[#00FF00] outline-none"
                        value={player.name}
                        onChange={(e) => handleManualNameChange(idx, e.target.value)}
                        placeholder="Digite o nick..."
                      />
                   </div>
                   <div className="flex-1 w-full">
                      <label className="text-[10px] text-gray-400 uppercase">Ou Selecionar Cadastro</label>
                      <select 
                        className="w-full bg-[#002200] border border-[#00FF00] text-[#00FF00] text-xs p-2 rounded focus:outline-none"
                        onChange={(e) => handlePlayerSelect(idx, e.target.value)}
                      >
                        <option value="">-- Selecione --</option>
                        {registeredUsers.map(u => (
                          <option key={u.id} value={u.id}>{u.nickname} ({u.position})</option>
                        ))}
                      </select>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="sticky top-6">
           <h3 className="text-white font-orbitron mb-2 flex items-center gap-2">
             👁️ PRÉ-VISUALIZAÇÃO
             <span className="text-xs text-gray-400 font-normal">(Tire Print para salvar)</span>
           </h3>
           
           <div 
              className="aspect-video w-full bg-black relative overflow-hidden border-4 border-[#00FF00] rounded-lg shadow-[0_0_50px_rgba(0,255,0,0.4)] group"
              style={{
                backgroundImage: img1 ? `url(${img1})` : 'linear-gradient(135deg, #050818 0%, #001a00 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
           >
              {/* Overlay for readability */}
              <div className="absolute inset-0 bg-black/30"></div>

              {/* Inspiration Players (Background Layer Z-10) */}
              {playerImg1 && (
                  <img 
                    src={playerImg1} 
                    className="absolute bottom-0 left-0 h-[85%] max-w-[40%] object-contain z-10 opacity-90 drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]" 
                    alt="Player 1"
                  />
              )}
              {playerImg2 && (
                  <img 
                    src={playerImg2} 
                    className="absolute bottom-0 right-0 h-[85%] max-w-[40%] object-contain z-10 opacity-90 drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]" 
                    alt="Player 2"
                  />
              )}
              
              {/* Tournament Header */}
              <div className="absolute top-0 w-full bg-gradient-to-b from-black/90 to-transparent pt-6 pb-10 px-4 text-center z-20">
                <h1 className="text-2xl md:text-4xl font-black text-[#00FF00] uppercase tracking-[0.2em] font-orbitron drop-shadow-[0_0_10px_rgba(0,255,0,0.8)] animate-pulse-glow">
                  {tournamentName}
                </h1>
              </div>

              {/* Community Logo (Top Right) */}
              {communityLogo && (
                  <img 
                    src={communityLogo} 
                    className="absolute top-4 right-4 w-16 h-16 md:w-24 md:h-24 object-contain z-30 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                    alt="Community Logo"
                  />
              )}

              {/* Center Content - Team Info */}
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                  {/* Team Logo */}
                  {img2 && <img src={img2} className="h-24 md:h-40 object-contain mb-8 drop-shadow-[0_0_25px_rgba(0,255,0,0.4)]" alt="Team Logo" />}
                  
                  {/* Extra Decoration (If exists, placed differently if players exist) */}
                  {img3 && <img src={img3} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-48 object-contain opacity-40 pointer-events-none z-0 mix-blend-overlay" alt="Decoration" />}
                  
                  <div className="absolute mt-32 text-center z-30 mx-auto bg-black/60 backdrop-blur-sm p-4 rounded-xl border border-[#00FF00]/50 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                      <h2 className="text-2xl md:text-4xl font-bold text-white uppercase font-orbitron mb-1 text-shadow-glow">{teamName || 'NOME DA EQUIPE'}</h2>
                      <div className="w-20 h-1 bg-[#00FF00] mx-auto mb-1 shadow-[0_0_10px_#00FF00]"></div>
                      <p className="text-[#00FF00] font-orbitron tracking-widest text-xs md:text-sm font-bold">CAPITÃO: {captainName || 'NOME'}</p>
                  </div>
              </div>

              {/* Players Footer */}
              <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/90 to-transparent pb-4 pt-12 z-20 px-2">
                  <div className="flex flex-wrap justify-center gap-1 md:gap-3">
                      {lineup.map((p, i) => p.name && (
                          <div key={i} className="text-center bg-[#002200]/80 border border-[#00FF00]/30 rounded p-1 min-w-[60px] backdrop-blur-sm">
                              <div className="text-[8px] md:text-[9px] bg-[#00FF00] text-black font-black px-1 rounded inline-block mb-1 shadow-sm">{p.position}</div>
                              <div className="text-white text-[9px] md:text-[10px] font-bold truncate max-w-[70px] mx-auto">{p.name}</div>
                          </div>
                      ))}
                  </div>
              </div>
           </div>

           <div className="mt-6 bg-black/40 border border-[#00FF00]/20 p-4 rounded text-center">
              <p className="text-gray-400 text-sm mb-2">Como salvar seu banner:</p>
              <div className="flex justify-center gap-4">
                <span className="bg-[#333] px-2 py-1 rounded text-xs">Windows: Win + Shift + S</span>
                <span className="bg-[#333] px-2 py-1 rounded text-xs">Mac: Cmd + Shift + 4</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default BannerGeneratorScreen;
