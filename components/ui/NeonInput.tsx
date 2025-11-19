
import React, { useState } from 'react';

interface NeonInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const NeonInput: React.FC<NeonInputProps> = ({ label, className = '', type = 'text', ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="mb-5">
      {label && (
        <label className="block mb-2 text-sm font-bold text-[var(--primary)] uppercase tracking-widest font-orbitron shadow-sm drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={isPassword && showPassword ? 'text' : type}
          className={`w-full px-4 py-3 bg-[rgba(10,17,36,0.7)] border border-[var(--primary)] rounded-lg text-white text-sm font-orbitron placeholder-white/40 italic focus:outline-none focus:bg-[rgba(10,17,36,0.9)] focus:shadow-[0_0_20px_rgba(0,255,255,0.5)] focus:border-[var(--primary)] transition-all duration-300 ${className}`}
          style={{ borderColor: 'var(--primary)' }}
          {...props}
        />
        {isPassword && (
            <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--primary)] hover:text-white focus:outline-none"
            >
                {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
        )}
      </div>
    </div>
  );
};

export default NeonInput;
