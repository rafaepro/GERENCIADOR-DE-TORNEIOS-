import React from 'react';
import { Champion } from '../../types';

interface ChampionBannerProps {
  champion: Champion | null;
  onClose: () => void;
}

const ChampionBanner: React.FC<ChampionBannerProps> = ({ champion, onClose }) => {
  if (!champion) return null;

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
    <div className="fixed inset-0 bg-black/95 z-[3000] flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] border-[3px] border-[#00ff00] rounded-2xl p-8 md:p-12 overflow-hidden shadow-[0_0_50px_rgba(0,255,0,0.3)]">
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold hover:bg-red-500 z-20"
        >
            ✕
        </button>

        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="absolute -top-[200px] -left-[200px] w-[500px] h-[500px] bg-[#00ff00] rounded-full mix-blend-overlay filter blur-[100px] opacity-20 animate-pulse"></div>

        <div className="relative z-10 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-[#00ff00] uppercase tracking-[4px] mb-8 font-orbitron animate-glow-text">
                {getTournamentLabel(champion.tournamentType)} - CAMPEÃO
            </h2>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-10">
                <div className="w-40 h-40 rounded-full border-[4px] border-[#00ff00] bg-[#0a0a0a] flex items-center justify-center overflow-hidden shadow-[0_0_40px_rgba(0,255,0,0.6)]">
                    {champion.logo ? <img src={champion.logo} alt="" className="w-full h-full object-contain" /> : <span className="text-5xl">🏆</span>}
                </div>
                <div className="text-center md:text-left">
                    <div className="text-4xl md:text-5xl font-bold text-[#00ff00] mb-3 drop-shadow-[0_0_15px_#00ff00]">{champion.teamName}</div>
                    <div className="text-xl text-white mb-3 font-orbitron">Capitão: {champion.captainName}</div>
                    <div className="inline-block bg-[#00ff00]/20 text-[#888] px-4 py-2 rounded-lg font-mono border border-[#00ff00]/30">
                        {new Date(champion.date).toLocaleDateString('pt-BR')}
                    </div>
                </div>
            </div>

            {champion.players && champion.players.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    {champion.players.map((player, idx) => (
                        <div key={idx} className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#00ff00] rounded-lg p-4 flex flex-col items-center">
                            <span className="text-xs font-bold bg-[#00ff00] text-black px-2 py-1 rounded mb-2">{player.position}</span>
                            <span className="font-bold text-white truncate w-full">{player.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ChampionBanner;