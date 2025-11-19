
import React, { useState } from 'react';
import { User } from '../../types';
import NeonButton from '../ui/NeonButton';
import NeonInput from '../ui/NeonInput';
import { authService } from '../../services/authService';

interface UserProfileModalProps {
  user: User;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose }) => {
  const [nickname, setNickname] = useState(user.nickname);
  const [phone, setPhone] = useState(user.phone || '');
  const [currentTeam, setCurrentTeam] = useState(user.currentTeam);
  
  const [positions, setPositions] = useState<string[]>(Array.isArray(user.position) ? user.position : [user.position]);
  const [posInput, setPosInput] = useState('');

  const isGuest = user.role === 'guest';

  const handleSave = () => {
    if (isGuest) return;
    authService.updateUser(user.id, {
        nickname,
        phone,
        currentTeam,
        position: positions
    });
    alert('Perfil atualizado com sucesso!');
    onClose();
  };

  const addPosition = () => {
      if (isGuest) return;
      if(posInput.trim() && !positions.includes(posInput.trim())) {
          setPositions([...positions, posInput.trim()]);
          setPosInput('');
      }
  };

  const removePosition = (pos: string) => {
      if (isGuest) return;
      setPositions(positions.filter(p => p !== pos));
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-[#0a0a0a] border-2 border-[#00FFFF] rounded-xl p-6 w-full max-w-md relative shadow-[0_0_40px_rgba(0,255,255,0.3)]">
        <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-red-500">✕</button>
        
        <h3 className="text-2xl font-bold text-[#00FFFF] font-orbitron mb-6 text-center">Editar Perfil</h3>
        
        {isGuest && (
            <div className="mb-4 text-center text-yellow-500 text-sm font-bold">
                Modo Visitante: Edição desabilitada.
            </div>
        )}

        <div className="space-y-4">
            <NeonInput label="Nick" value={nickname} onChange={e => setNickname(e.target.value)} disabled={isGuest} />
            <NeonInput label="Celular" value={phone} onChange={e => setPhone(e.target.value)} disabled={isGuest} />
            <NeonInput label="Equipe Atual" value={currentTeam} onChange={e => setCurrentTeam(e.target.value)} disabled={isGuest} />
            
            <div className="mb-4">
                <label className="block mb-2 text-sm font-bold text-[#00FFFF] uppercase tracking-widest font-orbitron">Posições</label>
                {!isGuest && (
                    <div className="flex gap-2 mb-2">
                        <input 
                            type="text" 
                            placeholder="Digite a posição..."
                            value={posInput}
                            onChange={e => setPosInput(e.target.value)}
                            className="flex-1 px-3 py-2 bg-[rgba(10,17,36,0.7)] border border-[var(--primary)] rounded text-white text-xs focus:outline-none"
                        />
                        <button onClick={addPosition} className="bg-[var(--primary)] text-black px-3 py-2 rounded font-bold text-xs hover:opacity-80">ADD</button>
                    </div>
                )}
                <div className="flex flex-wrap gap-2">
                    {positions.map(pos => (
                        <span key={pos} className="bg-[#00FFFF]/20 text-[#00FFFF] border border-[#00FFFF] px-2 py-1 rounded text-xs flex items-center gap-2">
                            {pos}
                            {!isGuest && <button onClick={() => removePosition(pos)} className="hover:text-white">×</button>}
                        </span>
                    ))}
                </div>
            </div>
        </div>

        {!isGuest && (
            <div className="mt-6 flex justify-center">
                <NeonButton onClick={handleSave}>Salvar Alterações</NeonButton>
            </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileModal;
