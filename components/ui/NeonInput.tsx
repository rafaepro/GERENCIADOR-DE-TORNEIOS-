import React from 'react';

interface NeonInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const NeonInput: React.FC<NeonInputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="mb-5">
      {label && (
        <label className="block mb-2 text-sm font-bold text-[#00FFFF] uppercase tracking-widest font-orbitron shadow-sm drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 bg-[rgba(10,17,36,0.7)] border border-[#00FFFF] rounded-lg text-white text-sm font-orbitron placeholder-[rgba(0,255,255,0.6)] italic focus:outline-none focus:bg-[rgba(10,17,36,0.9)] focus:shadow-[0_0_20px_rgba(0,255,255,0.5)] focus:border-[#00FFFF] transition-all duration-300 ${className}`}
        {...props}
      />
    </div>
  );
};

export default NeonInput;