import React from 'react';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const NeonButton: React.FC<NeonButtonProps> = ({ 
  variant = 'primary', 
  fullWidth = false, 
  children, 
  className = '',
  ...props 
}) => {
  const baseStyles = "relative overflow-hidden font-bold uppercase rounded-xl transition-all duration-300 ease-out transform hover:-translate-y-1 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none font-orbitron tracking-wider";
  
  const variants = {
    primary: "bg-gradient-to-r from-[#6A00FF] to-[#00FFFF] text-white border-2 border-[#00FFFF] shadow-[0_0_25px_rgba(0,255,255,0.4)] hover:shadow-[0_0_40px_rgba(255,255,255,0.6)] hover:border-white text-shadow-sm",
    secondary: "bg-gradient-to-r from-[#333366] to-[#1A1A3A] text-[#00FFFF] border-2 border-[#00BFFF] hover:text-white hover:from-[#4444AA] hover:to-[#2A2A5A] hover:border-[#00FFFF] shadow-[0_0_15px_rgba(0,191,255,0.3)]",
    danger: "bg-gradient-to-r from-red-900 to-red-600 text-white border-2 border-red-500 shadow-[0_0_25px_rgba(255,0,0,0.4)] hover:border-white"
  };

  const widthClass = fullWidth ? 'w-full py-4' : 'px-8 py-3';

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`} 
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default NeonButton;