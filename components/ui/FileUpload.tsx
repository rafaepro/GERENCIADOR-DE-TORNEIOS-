
import React, { useRef, useState } from 'react';

interface FileUploadProps {
  label: string;
  accept?: string;
  onChange: (file: File) => void;
  helperText?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ label, accept = "image/*", onChange, helperText }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('Nenhum arquivo selecionado');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onChange(file);
    }
  };

  return (
    <div className="mb-5">
      <label className="block mb-2 text-sm font-bold text-[#00FFFF] uppercase tracking-widest font-orbitron shadow-sm drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]">
        {label}
        {helperText && <span className="block text-[10px] text-gray-400 normal-case font-normal mt-1">{helperText}</span>}
      </label>
      <div className="relative inline-block w-full group">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          className="hidden"
        />
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="block w-full px-4 py-3 bg-[#1a1a1a] border-2 border-[#333] rounded-lg text-[#00ff00] cursor-pointer text-center transition-all duration-300 group-hover:border-[#00ff00] group-hover:shadow-[0_0_15px_rgba(0,255,0,0.3)]"
        >
          📤 Escolher arquivo
        </div>
        <div className="mt-2 text-xs text-[#888] text-center font-orbitron truncate">
          {fileName}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
