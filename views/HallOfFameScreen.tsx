
import React, { useState, useEffect } from 'react';
import NeonButton from '../components/ui/NeonButton';
import NeonInput from '../components/ui/NeonInput';
import FileUpload from '../components/ui/FileUpload';
import { dataService, fileToBase64 } from '../services/dataService';
import { HallOfFameEntry } from '../types';
import { authService } from '../services/authService';

interface HallOfFameScreenProps {
  onBack: () => void;
}

const HallOfFameScreen: React.FC<HallOfFameScreenProps> = ({ onBack }) => {
  const [entries, setEntries] = useState<HallOfFameEntry[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [photo, setPhoto] = useState('');

  const isAdmin = authService.getSession()?.user?.role === 'admin';

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setEntries(dataService.getHallOfFame());
  };

  const handleAddEntry = () => {
    if (!name || !photo || !description) {
      alert('Por favor, preencha todos os campos (Nome, Foto e Descrição).');
      return;
    }

    const newEntry: HallOfFameEntry = {
      id: `hof-${Date.now()}`,
      name,
      description,
      date: date || new Date().toISOString().split('T')[0],
      photo
    };

    dataService.saveHallOfFameEntry(newEntry);
    refreshData();
    setIsAdding(false);
    // Reset form
    setName('');
    setDescription('');
    setDate('');
    setPhoto('');
  };

  const handleDelete = (id: string) => {
    if(confirm('Tem certeza que deseja remover esta lenda do Hall da Fama?')) {
      dataService.deleteHallOfFameEntry(id);
      refreshData();
    }
  };

  return (
    <div className="animate-fade-in bg-[#0A1124] border-2 border-[#00FFFF] rounded-2xl p-6 mb-8 shadow-[0_0_35px_rgba(0,255,255,0.3)]">
      <div className="flex justify-between items-center mb-6 border-b-2 border-[#00FFFF] pb-4">
        <NeonButton variant="secondary" onClick={onBack}>← Voltar</NeonButton>
        <h2 className="text-2xl md:text-4xl font-bold text-center uppercase tracking-[3px] text-[#FFD700] font-orbitron text-shadow-glow">
           🏅 Hall da Fama
        </h2>
        <div className="w-[100px]">
           {isAdmin && !isAdding && (
               <NeonButton onClick={() => setIsAdding(true)} className="!text-xs !px-4">Adicionar</NeonButton>
           )}
        </div>
      </div>

      {isAdding ? (
          <div className="bg-black/30 border border-[#FFD700] p-6 rounded-xl max-w-2xl mx-auto">
              <h3 className="text-[#FFD700] font-bold text-xl mb-6 font-orbitron text-center">Nova Lenda</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <div className="w-full aspect-square bg-black rounded-lg border border-[#FFD700]/30 flex items-center justify-center overflow-hidden mb-4">
                          {photo ? <img src={photo} className="w-full h-full object-cover" /> : <span className="text-4xl">📸</span>}
                      </div>
                      <FileUpload label="Foto da Lenda" onChange={async (f) => setPhoto(await fileToBase64(f))} helperText="Alta resolução recomendada" />
                  </div>
                  <div className="space-y-4">
                      <NeonInput label="Nome do Jogador" value={name} onChange={e => setName(e.target.value)} />
                      <NeonInput label="Data do Feito" type="date" value={date} onChange={e => setDate(e.target.value)} />
                      <div>
                          <label className="block mb-2 text-sm font-bold text-[#00FFFF] uppercase tracking-widest font-orbitron">Descrição do Feito</label>
                          <textarea 
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full h-32 px-4 py-3 bg-[rgba(10,17,36,0.7)] border border-[#00FFFF] rounded-lg text-white text-sm font-orbitron focus:outline-none focus:border-[#FFD700]"
                            placeholder="Ex: Eleito melhor jogador da temporada com 50 gols..."
                          />
                      </div>
                  </div>
              </div>
              
              <div className="flex justify-center gap-4 mt-6">
                  <NeonButton onClick={handleAddEntry} className="!border-[#FFD700] !text-[#FFD700] hover:!text-black hover:!bg-[#FFD700]">Salvar Lenda</NeonButton>
                  <NeonButton variant="secondary" onClick={() => setIsAdding(false)}>Cancelar</NeonButton>
              </div>
          </div>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {entries.map(entry => (
                  <div key={entry.id} className="relative bg-black border-2 border-[#FFD700] rounded-xl overflow-hidden group hover:transform hover:scale-105 transition-all duration-500 shadow-[0_0_30px_rgba(218,165,32,0.2)]">
                       <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
                       
                       <div className="h-80 w-full">
                           <img src={entry.photo} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500" alt={entry.name} />
                       </div>

                       <div className="absolute bottom-0 left-0 w-full p-6 z-20">
                           <div className="text-[#FFD700] font-bold font-orbitron text-2xl mb-1 drop-shadow-md">{entry.name}</div>
                           <div className="text-xs text-[#FFD700]/80 uppercase tracking-widest mb-3">{new Date(entry.date).toLocaleDateString('pt-BR')}</div>
                           <p className="text-gray-300 text-sm italic leading-relaxed border-l-2 border-[#FFD700] pl-3">
                               "{entry.description}"
                           </p>
                       </div>

                       {/* Shine Effect */}
                       <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[30deg] group-hover:animate-[shine_1s_ease-in-out]"></div>

                       {isAdmin && (
                           <button 
                            onClick={() => handleDelete(entry.id)}
                            className="absolute top-2 right-2 z-30 w-8 h-8 bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                               ✕
                           </button>
                       )}
                  </div>
              ))}
              
              {entries.length === 0 && (
                  <div className="col-span-full text-center py-20 text-gray-500">
                      <div className="text-4xl mb-4">🏛️</div>
                      <p>O Hall da Fama está vazio.</p>
                      {isAdmin && <p className="text-sm mt-2">Adicione a primeira lenda clicando em "Adicionar".</p>}
                  </div>
              )}
          </div>
      )}
    </div>
  );
};

export default HallOfFameScreen;
