import React, { useState } from 'react';
import NeonButton from '../ui/NeonButton';
import NeonInput from '../ui/NeonInput';
import { AppConfig } from '../../types';
import { fileToBase64 } from '../../services/dataService';

interface QuickEditPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSave: (config: AppConfig) => void;
}

const QuickEditPanel: React.FC<QuickEditPanelProps> = ({ isOpen, onClose, config, onSave }) => {
  const [formData, setFormData] = useState<AppConfig>(config);

  const handleChange = (field: keyof AppConfig, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (field: keyof AppConfig, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(file) {
          const base64 = await fileToBase64(file);
          handleChange(field, base64);
      }
  }

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-full md:w-[400px] bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] border-l-4 border-[#00ff00] z-50 transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} shadow-[-10px_0_30px_rgba(0,0,0,0.5)] overflow-y-auto`}>
        <div className="flex justify-between items-center p-5 bg-gradient-to-r from-[#00ff00] to-[#00cc00] text-black">
          <h3 className="text-lg font-bold font-orbitron">⚡ EDIÇÃO RÁPIDA</h3>
          <button onClick={onClose} className="text-2xl font-bold hover:scale-110 transition-transform">✕</button>
        </div>

        <div className="p-6 space-y-8">
          <div className="border-b border-[#333] pb-6">
            <h4 className="text-[#00ff00] text-base mb-4 uppercase tracking-wider font-orbitron">Painel Principal</h4>
            <NeonInput 
              label="Nome do Painel" 
              value={formData.panelName} 
              onChange={(e) => handleChange('panelName', e.target.value)} 
            />
            <div className="mb-5">
                <label className="block mb-2 text-sm font-bold text-[#00FFFF] uppercase tracking-widest font-orbitron">Logo Principal</label>
                <input type="file" onChange={(e) => handleFileChange('panelLogo', e)} className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#00ff00] file:text-black hover:file:bg-[#00cc00]"/>
            </div>
          </div>

          <div className="border-b border-[#333] pb-6">
            <h4 className="text-[#00ff00] text-base mb-4 uppercase tracking-wider font-orbitron">Torneio Ativo</h4>
            <NeonInput 
              label="Nome do Torneio" 
              value={formData.activeTournamentName} 
              onChange={(e) => handleChange('activeTournamentName', e.target.value)} 
            />
             <div className="mb-5">
              <label className="block mb-2 text-sm font-bold text-[#00FFFF] uppercase tracking-widest font-orbitron">Tipo</label>
              <select 
                value={formData.activeTournamentType}
                onChange={(e) => handleChange('activeTournamentType', e.target.value)}
                className="w-full px-4 py-3 bg-[rgba(10,17,36,0.7)] border border-[#00FFFF] rounded-lg text-white text-sm font-orbitron focus:outline-none focus:border-[#00FFFF]"
              >
                <option value="copa">Copa Network</option>
                <option value="md3-diaria">MD3 Diária</option>
                <option value="md3-marcelo">MD3 do Marcelo Oliveira</option>
                <option value="md3-istrawl">MD3 do Istrawl</option>
              </select>
            </div>
          </div>

          <div className="border-b border-[#333] pb-6">
            <h4 className="text-[#00ff00] text-base mb-4 uppercase tracking-wider font-orbitron">Equipe Campeã (Banner)</h4>
            <NeonInput 
              label="Nome da Equipe" 
              value={formData.championTeam} 
              onChange={(e) => handleChange('championTeam', e.target.value)} 
            />
            <NeonInput 
              label="Capitão" 
              value={formData.championCaptain} 
              onChange={(e) => handleChange('championCaptain', e.target.value)} 
            />
             <div className="mb-5">
                <label className="block mb-2 text-sm font-bold text-[#00FFFF] uppercase tracking-widest font-orbitron">Logo da Equipe</label>
                <input type="file" onChange={(e) => handleFileChange('championLogo', e)} className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#00ff00] file:text-black hover:file:bg-[#00cc00]"/>
            </div>
          </div>

          <NeonButton fullWidth onClick={handleSubmit}>Salvar Alterações</NeonButton>
        </div>
      </div>
    </>
  );
};

export default QuickEditPanel;