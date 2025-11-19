
import React from 'react';
import { AppConfig } from '../../types';

interface FooterProps {
  config: AppConfig;
}

const Footer: React.FC<FooterProps> = ({ config }) => {
  const defaultText = "PAINEL DE GERENCIAMENTO DE TORNEIOS • DESENVOLVIDO PARA ESPORTS • ALTA PERFORMANCE •";
  const text = config.footerText || defaultText;

  return (
    <footer className="fixed bottom-0 left-0 w-full bg-black/90 border-t border-[var(--primary)]/50 text-[var(--primary)] py-2 z-40 overflow-hidden">
      <div className="whitespace-nowrap overflow-hidden flex">
        <div className="animate-[marquee_20s_linear_infinite] font-orbitron text-xs tracking-[4px] uppercase font-bold">
          {text} &nbsp;&nbsp; • &nbsp;&nbsp; {text} &nbsp;&nbsp; • &nbsp;&nbsp; {text} &nbsp;&nbsp; • &nbsp;&nbsp;
        </div>
        <div className="animate-[marquee_20s_linear_infinite] font-orbitron text-xs tracking-[4px] uppercase font-bold" aria-hidden="true">
          {text} &nbsp;&nbsp; • &nbsp;&nbsp; {text} &nbsp;&nbsp; • &nbsp;&nbsp; {text} &nbsp;&nbsp; • &nbsp;&nbsp;
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
