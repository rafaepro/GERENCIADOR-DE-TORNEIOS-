
import React, { useRef, useEffect, useState } from 'react';
import { fileToBase64 } from '../../services/dataService';
import { AppConfig } from '../../types';
import { authService } from '../../services/authService';

interface HeaderProps {
  config: AppConfig;
  onUpdateConfig: (newConfig: Partial<AppConfig>) => void;
}

const Header: React.FC<HeaderProps> = ({ config, onUpdateConfig }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const session = authService.getSession();
  const isAdmin = session?.user?.role === 'admin';
  
  // Determine which logo to show
  const userLogo = session?.user?.tournamentLogo;
  const logoToShow = userLogo || config.panelLogo;
  
  const [localLogo, setLocalLogo] = useState<string>(logoToShow);

  useEffect(() => {
    setLocalLogo(userLogo || config.panelLogo);
  }, [config.panelLogo, userLogo]);

  const handleLogoClick = () => {
    // Only allow upload if admin
    if (isAdmin) fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isAdmin) {
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
    <div className="relative text-center p-9 rounded-2xl mb-8 overflow-hidden border-2 border-[var(--primary)] shadow-[0_0_40px_var(--primary)]">
      {/* Background Illustration */}
      {config.headerIllustrationLeft && (
          <img 
            src={config.headerIllustrationLeft} 
            className="absolute left-0 bottom-0 h-full object-contain z-0 opacity-80 pointer-events-none hidden md:block" 
            alt="Decoration Left"
          />
      )}
      {config.headerIllustrationRight && (
          <img 
            src={config.headerIllustrationRight} 
            className="absolute right-0 bottom-0 h-full object-contain z-0 opacity-80 pointer-events-none hidden md:block" 
            alt="Decoration Right"
          />
      )}

      <div 
        className="absolute inset-0 z-0 opacity-40 bg-cover bg-center transition-all duration-500" 
        style={{ 
            backgroundImage: `url('${config.headerBackgroundImage || "https://img.freepik.com/free-vector/soccer-stadium-night_1284-16397.jpg"}')` 
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-[var(--bg-end)] z-0"></div>

      {/* Only show logo container if a logo exists OR if user can upload one to start */}
      {(localLogo || isAdmin) && (
          <div className="relative z-10 mb-5">
            <div 
              onClick={handleLogoClick}
              className={`inline-block w-[150px] h-[150px] transition-transform ${isAdmin ? 'cursor-pointer hover:scale-105' : ''} ${!localLogo ? 'border-2 border-dashed border-[var(--primary)] bg-black/40 rounded-full flex items-center justify-center' : ''}`}
              title={isAdmin ? "Clique para alterar o logo principal" : ""}
            >
              {localLogo ? (
                <img src={localLogo} alt="Panel Logo" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
              ) : (
                <div className="text-center p-2">
                  <span className="text-2xl">📷</span>
                  <span className="block text-[10px] text-[var(--primary)] font-bold mt-1">Adicionar Logo</span>
                </div>
              )}
              
              {isAdmin && (
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
              )}
            </div>
          </div>
      )}

      <h1 className="relative z-10 text-3xl md:text-5xl font-black uppercase tracking-[4px] text-white font-orbitron animate-text-glow drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
        {config.panelName}
      </h1>
    </div>
  );
};

export default Header;
