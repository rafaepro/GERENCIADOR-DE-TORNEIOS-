import React, { useRef, useEffect, useState } from 'react';
import { fileToBase64 } from '../../services/dataService';
import { AppConfig } from '../../types';

interface HeaderProps {
  config: AppConfig;
  onUpdateConfig: (newConfig: Partial<AppConfig>) => void;
}

const Header: React.FC<HeaderProps> = ({ config, onUpdateConfig }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localLogo, setLocalLogo] = useState<string>(config.panelLogo);

  useEffect(() => {
    setLocalLogo(config.panelLogo);
  }, [config.panelLogo]);

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setLocalLogo(base64);
        onUpdateConfig({ panelLogo: base64 });
      } catch (err) {
        console.error("Error processing logo", err);
      }
    }
  };

  return (
    <div className="relative text-center p-9 bg-gradient-to-r from-[#6A00FF] to-[#00FFFF] border-2 border-[#00FFFF] rounded-2xl mb-8 shadow-[0_0_40px_rgba(0,255,255,0.6)] overflow-hidden animate-pulse-glow">
      <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(0,255,255,0.15)_0%,transparent_70%)] animate-pulse-bg pointer-events-none"></div>
      
      <div className="relative z-10 mb-5">
        <div 
          onClick={handleLogoClick}
          className="inline-block w-[150px] h-[150px] border-4 border-dashed border-[#00ff00] rounded-2xl bg-[rgba(0,255,0,0.05)] cursor-pointer transition-all duration-300 hover:bg-[rgba(0,255,0,0.1)] hover:border-[#00ff88] hover:shadow-[0_0_20px_rgba(0,255,0,0.3)] overflow-hidden"
        >
          {localLogo ? (
            <img src={localLogo} alt="Panel Logo" className="w-full h-full object-contain" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-2 text-center">
              <span className="text-4xl mb-2">🎮</span>
              <span className="text-[11px] text-[#00ff00] leading-tight font-bold">
                Clique para adicionar logo<br />
                (PNG transparente)
              </span>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      </div>

      <h1 className="relative z-10 text-3xl md:text-5xl font-black uppercase tracking-[4px] text-white font-orbitron animate-text-glow">
        {config.panelName}
      </h1>
    </div>
  );
};

export default Header;