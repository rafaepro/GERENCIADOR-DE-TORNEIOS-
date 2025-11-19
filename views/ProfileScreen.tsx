
import React, { useState, useEffect } from 'react';
import NeonButton from '../components/ui/NeonButton';
import NeonInput from '../components/ui/NeonInput';
import FileUpload from '../components/ui/FileUpload';
import { authService } from '../services/authService';
import { fileToBase64 } from '../services/dataService';
import { User } from '../types';

interface ProfileScreenProps {
  onBack: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  
  // Form States
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    phone: '',
    currentTeam: '',
    registeredTournamentType: 'md3-diaria'
  });

  const [positionInput, setPositionInput] = useState('');
  const [positions, setPositions] = useState<string[]>([]);
  
  // Images
  const [avatar, setAvatar] = useState<string>('');
  const [teamLogo, setTeamLogo] = useState<string>('');

  // Password Change
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const session = authService.getSession();
    if (session?.user) {
      setUser(session.user);
      setIsGuest(session.user.role === 'guest');

      setFormData({
        nickname: session.user.nickname || '',
        email: session.user.email || '',
        phone: session.user.phone || '',
        currentTeam: session.user.currentTeam || '',
        registeredTournamentType: session.user.registeredTournamentType || 'md3-diaria'
      });
      setPositions(Array.isArray(session.user.position) ? session.user.position : [session.user.position]);
      setAvatar(session.user.avatar || '');
      setTeamLogo(session.user.teamLogo || '');
    }
  }, []);

  if (!user) return <div>Carregando...</div>;

  const handleSaveProfile = () => {
    if (isGuest) return;
    if (!formData.nickname) return alert('Nick é obrigatório');
    
    authService.updateUser(user.id, {
      ...formData,
      position: positions,
      avatar,
      teamLogo
    });
    alert('✅ Dados atualizados com sucesso!');
  };

  const handleChangePassword = () => {
    if (isGuest) return;
    if (!newPassword) return alert('Digite a nova senha');
    if (newPassword !== confirmPassword) return alert('As senhas não coincidem');
    
    authService.updateUser(user.id, { password: newPassword });
    setNewPassword('');
    setConfirmPassword('');
    alert('✅ Senha alterada com sucesso!');
  };

  // Position Logic
  const addPosition = () => {
    if (isGuest) return;
    if (positionInput.trim() && !positions.includes(positionInput.trim())) {
        setPositions([...positions, positionInput.trim()]);
        setPositionInput('');
    }
  };

  const removePosition = (pos: string) => {
    if (isGuest) return;
    setPositions(positions.filter(p => p !== pos));
  };

  const handleAvatarUpload = async (file: File) => {
      if (isGuest) return;
      try {
          const base64 = await fileToBase64(file);
          setAvatar(base64);
      } catch (e) {
          console.error("Error uploading avatar", e);
      }
  };

  const handleTeamLogoUpload = async (file: File) => {
      if (isGuest) return;
      try {
          const base64 = await fileToBase64(file);
          setTeamLogo(base64);
      } catch (e) {
          console.error("Error uploading team logo", e);
      }
  };

  return (
    <div className="animate-fade-in bg-[#0A1124] border-2 border-[var(--primary)] rounded-2xl p-6 mb-8 shadow-[0_0_35px_rgba(0,255,255,0.3)]">
      <div className="flex justify-between items-center mb-6 border-b-2 border-[var(--primary)] pb-4">
        <NeonButton variant="secondary" onClick={onBack}>← Voltar</NeonButton>
        <h2 className="text-3xl font-bold text-center uppercase tracking-[3px] text-[var(--primary)] font-orbitron text-shadow-glow">
          Meu Perfil
        </h2>
        <div className="w-[100px]"></div> {/* Spacer */}
      </div>

      {isGuest && (
          <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-500 p-4 rounded-xl mb-6 text-center font-bold uppercase font-orbitron">
              ⚠️ Modo Visitante: Edição de perfil desabilitada.
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats Card */}
        <div className="lg:col-span-1">
           <div className="bg-black/40 border border-[var(--primary)] rounded-xl p-6 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-[var(--primary)]"></div>
              
              {/* Avatar Display */}
              <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className="w-full h-full bg-black rounded-full border-4 border-[var(--primary)] flex items-center justify-center overflow-hidden shadow-[0_0_30px_var(--primary)]">
                    {avatar ? (
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-5xl">👤</span>
                    )}
                  </div>
                  {teamLogo && (
                      <div className="absolute bottom-0 right-0 w-10 h-10 bg-black border-2 border-[var(--primary)] rounded-full overflow-hidden shadow-lg z-10">
                          <img src={teamLogo} alt="Team" className="w-full h-full object-contain" />
                      </div>
                  )}
              </div>
              
              <h3 className="text-2xl font-bold text-white font-orbitron mb-1">{user.nickname}</h3>
              <p className="text-[var(--accent)] text-sm mb-6 font-mono">{user.username}</p>
              
              <div className="grid grid-cols-3 gap-2 bg-[var(--primary)]/10 p-4 rounded-lg">
                  <div className="text-center">
                      <div className="text-2xl mb-1">⭐</div>
                      <div className="font-bold text-white">{user.stats?.stars || 0}</div>
                      <div className="text-[10px] text-gray-400 uppercase">Estrelas</div>
                  </div>
                  <div className="text-center border-l border-r border-white/10">
                      <div className="text-2xl mb-1">🏆</div>
                      <div className="font-bold text-white">{user.stats?.trophies || 0}</div>
                      <div className="text-[10px] text-gray-400 uppercase">Troféus</div>
                  </div>
                  <div className="text-center">
                      <div className="text-2xl mb-1">©️</div>
                      <div className="font-bold text-white">{user.stats?.captainCount || 0}</div>
                      <div className="text-[10px] text-gray-400 uppercase">Capitão</div>
                  </div>
              </div>
           </div>
        </div>

        {/* Right Column: Forms */}
        <div className="lg:col-span-2 space-y-8">
            {/* General Info Form */}
            <div className="bg-black/30 p-6 rounded-xl border border-[var(--primary)]/30">
                <h3 className="text-[var(--primary)] font-bold text-lg mb-6 font-orbitron uppercase border-b border-[var(--primary)]/20 pb-2">
                   ✏️ Editar Informações
                </h3>
                
                {/* Image Uploads - Hidden for Guests */}
                {!isGuest && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <FileUpload label="Foto de Perfil" onChange={handleAvatarUpload} helperText="Recomendado: Quadrado (1:1)" />
                        </div>
                        <div>
                            <FileUpload label="Logo da Equipe" onChange={handleTeamLogoUpload} helperText="Recomendado: PNG Transparente" />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <NeonInput 
                        label="Nick no Jogo" 
                        value={formData.nickname} 
                        onChange={e => setFormData({...formData, nickname: e.target.value})} 
                        disabled={isGuest}
                    />
                    <NeonInput 
                        label="Equipe Atual" 
                        value={formData.currentTeam} 
                        onChange={e => setFormData({...formData, currentTeam: e.target.value})} 
                        disabled={isGuest}
                    />
                    <NeonInput 
                        label="Email" 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                        disabled={isGuest}
                    />
                    <NeonInput 
                        label="Celular / WhatsApp" 
                        value={formData.phone} 
                        onChange={e => setFormData({...formData, phone: e.target.value})} 
                        disabled={isGuest}
                    />
                </div>

                <div className="mb-6 mt-4">
                    <label className="block mb-2 text-sm font-bold text-[var(--primary)] uppercase tracking-widest font-orbitron">Contexto do Torneio</label>
                    <select 
                        value={formData.registeredTournamentType}
                        onChange={(e) => setFormData({...formData, registeredTournamentType: e.target.value})}
                        className="w-full px-4 py-3 bg-[rgba(10,17,36,0.7)] border border-[var(--primary)] rounded-lg text-white text-sm font-orbitron outline-none focus:shadow-[0_0_15px_var(--primary)] disabled:opacity-50"
                        disabled={isGuest}
                    >
                        <option value="md3-diaria">MD3 Diária</option>
                        <option value="md3-marcelo">MD3 Marcelo Oliveira</option>
                        <option value="md3-istrawl">MD3 Istrawl</option>
                        <option value="copa">Copa Network</option>
                    </select>
                </div>

                <div className="mb-6">
                    <label className="block mb-2 text-sm font-bold text-[var(--primary)] uppercase tracking-widest font-orbitron">Posições</label>
                    {!isGuest && (
                        <div className="flex gap-2 mb-3">
                            <input 
                                type="text" 
                                placeholder="Nova posição..."
                                value={positionInput}
                                onChange={e => setPositionInput(e.target.value)}
                                className="flex-1 px-3 py-2 bg-black border border-[var(--primary)] rounded text-white text-sm focus:outline-none"
                            />
                            <button onClick={addPosition} className="bg-[var(--primary)] text-black px-4 py-2 rounded font-bold text-xs hover:opacity-80 font-orbitron">ADD</button>
                        </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                        {positions.map((pos, idx) => (
                            <span key={idx} className="bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)] px-3 py-1 rounded text-xs flex items-center gap-2">
                                {pos}
                                {!isGuest && <button onClick={() => removePosition(pos)} className="hover:text-white font-bold">×</button>}
                            </span>
                        ))}
                    </div>
                </div>

                {!isGuest && (
                    <div className="flex justify-end">
                        <NeonButton onClick={handleSaveProfile}>Salvar Alterações</NeonButton>
                    </div>
                )}
            </div>

            {/* Security Form */}
            <div className="bg-black/30 p-6 rounded-xl border border-red-500/30">
                <h3 className="text-red-500 font-bold text-lg mb-6 font-orbitron uppercase border-b border-red-500/20 pb-2">
                   🔒 Alterar Senha
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <NeonInput 
                        type="password"
                        label="Nova Senha" 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)} 
                        className="!border-red-500 focus:!shadow-[0_0_15px_red]"
                        disabled={isGuest}
                    />
                    <NeonInput 
                        type="password"
                        label="Confirmar Senha" 
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)} 
                        className="!border-red-500 focus:!shadow-[0_0_15px_red]"
                        disabled={isGuest}
                    />
                </div>
                {!isGuest && (
                    <div className="flex justify-end mt-4">
                        <NeonButton variant="danger" onClick={handleChangePassword}>Atualizar Senha</NeonButton>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
