
import React, { useState } from 'react';
import NeonButton from '../components/ui/NeonButton';
import NeonInput from '../components/ui/NeonInput';
import { authService } from '../services/authService';
import { AuthSession, AppConfig } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (session: AuthSession) => void;
  config: AppConfig;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, config }) => {
  // --- Tab State: Player vs Organizer ---
  const [activeTab, setActiveTab] = useState<'player' | 'organizer'>('player');
  
  // --- Mode State: Login vs Register ---
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminLogin, setIsAdminLogin] = useState(false); // Only visible if Organizer tab
  
  // --- Common Fields ---
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // --- Player Specific ---
  const [nickname, setNickname] = useState('');
  const [positionInput, setPositionInput] = useState('');
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(''); // The manager/owner ID
  const [availableManagers, setAvailableManagers] = useState<{id: string, name: string}[]>([]);
  
  // --- Organizer Specific ---
  const [orgName, setOrgName] = useState('');

  // --- Feedback ---
  const [error, setError] = useState('');
  
  // --- Reset Password ---
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetUser, setResetUser] = useState('');
  const [resetContact, setResetContact] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [debugCode, setDebugCode] = useState(''); // To show code on screen for testing

  // Load managers on mount (for Player registration)
  React.useEffect(() => {
      if (activeTab === 'player') {
          const managers = authService.getAvailableManagers();
          setAvailableManagers(managers);
          if (managers.length > 0) {
              setSelectedOrganizationId(managers[0].id);
          }
      }
  }, [activeTab]);

  const handleSubmit = () => {
    setError('');
    
    if (isLogin) {
        // LOGIN LOGIC
        const result = authService.login(username.trim(), password.trim());
        if (result.success && result.session) {
             // Check strict role logic
             const role = result.session.user?.role;
             
             if (isAdminLogin) {
                 // Can only be admin or manager
                 if (role !== 'admin' && role !== 'manager') {
                     setError('Esta conta não é de Organizador/Admin.');
                     return;
                 }
             } else {
                 // Player tab login
                 if (role !== 'user' && role !== 'guest') {
                     // Ideally managers can login as users too, but let's separate for clarity
                     // Allowing managers to login here is fine, but UX wise let's keep them in Organizer tab
                 }
             }
             
             onLoginSuccess(result.session);
        } else {
            setError(result.message || 'Credenciais inválidas.');
        }
    } else {
        // REGISTER LOGIC
        if (!username || !password || !email || !phone) {
             setError('Preencha todos os campos obrigatórios.');
             return;
        }

        // Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Formato de email inválido.');
            return;
        }

        if (activeTab === 'player') {
             if (!nickname || selectedPositions.length === 0) {
                 setError('Preencha seu Nick e Posições.');
                 return;
             }
             
             const result = authService.register({
                 username, password, email, phone, nickname,
                 position: selectedPositions,
                 role: 'user',
                 ownerId: selectedOrganizationId, // Link player to manager
                 currentTeam: ''
             });
             
             if (result.success) {
                 alert(result.message);
                 setIsLogin(true);
             } else {
                 setError(result.message);
             }

        } else {
             // Organizer Registration
             // They register as 'manager' role. They are their own owner.
             if (!orgName) {
                 setError('Nome da Organização é obrigatório.');
                 return;
             }

             const result = authService.register({
                 username, password, email, phone,
                 nickname: orgName, // Use nickname as Org Name
                 position: ['Staff'],
                 role: 'manager',
                 // ownerId will be set to their own ID in authService or handled there
                 currentTeam: orgName
             });
             
             if (result.success) {
                 alert('Cadastro de Organizador realizado! Aguarde aprovação do Admin.');
                 setIsLogin(true);
             } else {
                 setError(result.message);
             }
        }
    }
  };

  const handleGuest = () => {
      const session = authService.loginAsGuest();
      onLoginSuccess(session);
  };

  // Position Logic
  const addPosition = () => {
      if (positionInput.trim() && !selectedPositions.includes(positionInput.trim())) {
          setSelectedPositions([...selectedPositions, positionInput.trim()]);
          setPositionInput('');
      }
  };
  const removePosition = (pos: string) => setSelectedPositions(selectedPositions.filter(p => p !== pos));
  const handleKeyDown = (e: React.KeyboardEvent) => {
      if(e.key === 'Enter') { e.preventDefault(); addPosition(); }
  };

  // Reset Flow
  const handleResetStep1 = () => {
      setDebugCode('');
      const res = authService.requestPasswordReset(resetUser, resetContact);
      if(res.success) { 
          setResetMessage(''); 
          setResetStep(2); 
          if (res.debugCode) setDebugCode(res.debugCode); // Show code in UI for testing
      } else {
          setResetMessage(res.message);
      }
  }
  const handleResetStep2 = () => {
      if(authService.verifyResetCode(resetUser, resetCode)) { setResetMessage(''); setResetStep(3); } else setResetMessage('Código inválido.');
  }
  const handleResetStep3 = () => {
      const res = authService.completePasswordReset(resetUser, newPassword);
      if(res.success) { alert(res.message); setShowResetModal(false); } else setResetMessage(res.message);
  }

  const socialPlatforms = [
      { id: 'instagram', label: 'Instagram', icon: '📸' },
      { id: 'twitter', label: 'Twitter/X', icon: '🐦' },
      { id: 'discord', label: 'Discord', icon: '👾' },
      { id: 'youtube', label: 'YouTube', icon: '📺' },
      { id: 'tiktok', label: 'TikTok', icon: '🎵' },
      { id: 'twitch', label: 'Twitch', icon: '🟣' },
      { id: 'kick', label: 'Kick', icon: '🟩' },
      { id: 'facebook', label: 'Facebook', icon: '📘' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-20 overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 transform scale-105 blur-[2px]"
        style={{ backgroundImage: `url(${config.loginBackgroundImage || 'https://wallpapers.com/images/hd/messi-and-ronaldo-pictures-940-x-529-51a6050k4z3c0l8a.jpg'})` }}
      />
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      <div className="w-full max-w-md bg-black/80 border-2 border-[var(--primary)] rounded-2xl p-8 shadow-[0_0_80px_rgba(0,255,255,0.3)] backdrop-blur-md relative z-10 my-10">
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-[var(--primary)] shadow-[0_0_20px_var(--primary)]"></div>
        
        {/* Header Logos */}
        <div className="text-center mb-8 relative">
          {config.sponsors && config.sponsors.length > 0 && (
              <div className="flex justify-center gap-4 mb-4">
                  {config.sponsors.map((logo, idx) => (
                      <img key={idx} src={logo} className="h-8 object-contain opacity-80" alt="sponsor"/>
                  ))}
              </div>
          )}
          <h1 className="text-3xl font-black text-[var(--primary)] font-orbitron tracking-widest mb-2 text-shadow-glow">
            {activeTab === 'player' ? 'ÁREA DO JOGADOR' : 'ÁREA DO ORGANIZADOR'}
          </h1>
        </div>

        {/* TABS: Player vs Organizer */}
        <div className="flex mb-6 bg-black/50 p-1 rounded-lg border border-gray-700">
            <button 
                onClick={() => { setActiveTab('player'); setIsAdminLogin(false); setError(''); }}
                className={`flex-1 py-2 text-xs font-bold uppercase font-orbitron rounded transition-all ${activeTab === 'player' ? 'bg-[var(--primary)] text-black shadow-[0_0_10px_var(--primary)]' : 'text-gray-400 hover:text-white'}`}
            >
                Sou Jogador
            </button>
            <button 
                onClick={() => { setActiveTab('organizer'); setIsAdminLogin(true); setError(''); }}
                className={`flex-1 py-2 text-xs font-bold uppercase font-orbitron rounded transition-all ${activeTab === 'organizer' ? 'bg-[var(--primary)] text-black shadow-[0_0_10px_var(--primary)]' : 'text-gray-400 hover:text-white'}`}
            >
                Sou Organizador
            </button>
        </div>

        {/* Login/Register Toggle */}
        <div className="flex mb-8 border-b border-[#333]">
          <button 
            className={`flex-1 pb-3 font-bold font-orbitron transition-colors ${isLogin ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-gray-500 hover:text-white'}`}
            onClick={() => setIsLogin(true)}
          >
            ENTRAR
          </button>
          <button 
            className={`flex-1 pb-3 font-bold font-orbitron transition-colors ${!isLogin ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-gray-500 hover:text-white'}`}
            onClick={() => setIsLogin(false)}
          >
            CRIAR CONTA
          </button>
        </div>

        {/* Forms */}
        <div className="space-y-4">
            <NeonInput placeholder="Usuário" value={username} onChange={(e) => setUsername(e.target.value)} />
            <NeonInput type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
            
            {isLogin && (
                <div className="text-right">
                    <button onClick={() => setShowResetModal(true)} className="text-xs text-[var(--accent)] hover:text-[var(--primary)] underline font-orbitron">Esqueci minha senha</button>
                </div>
            )}

            {!isLogin && (
                <div className="animate-fade-in space-y-4">
                    <NeonInput placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <NeonInput placeholder="Celular / WhatsApp" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    
                    {activeTab === 'player' ? (
                        <>
                            <NeonInput placeholder="Nick no Jogo" value={nickname} onChange={(e) => setNickname(e.target.value)} />
                            <div className="mb-4">
                                <label className="block mb-2 text-sm font-bold text-[var(--primary)] uppercase tracking-widest font-orbitron">Posições</label>
                                <div className="flex gap-2 mb-2">
                                    <input type="text" placeholder="Digite..." value={positionInput} onChange={(e) => setPositionInput(e.target.value)} onKeyDown={handleKeyDown} className="flex-1 px-3 py-2 bg-[rgba(10,17,36,0.7)] border border-[var(--primary)] rounded text-white text-xs focus:outline-none" />
                                    <button onClick={addPosition} className="bg-[var(--primary)] text-black px-3 py-2 rounded font-bold text-xs hover:opacity-80">ADD</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedPositions.map((pos, idx) => (
                                        <span key={idx} className="bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)] px-2 py-1 rounded text-xs flex items-center gap-2">{pos} <button onClick={() => removePosition(pos)}>×</button></span>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2 text-sm font-bold text-[var(--primary)] uppercase tracking-widest font-orbitron">Organização / Torneio</label>
                                {availableManagers.length > 0 ? (
                                    <select value={selectedOrganizationId} onChange={(e) => setSelectedOrganizationId(e.target.value)} className="w-full px-4 py-3 bg-[rgba(10,17,36,0.7)] border border-[var(--primary)] rounded-lg text-white text-sm font-orbitron outline-none">
                                        {availableManagers.map(mgr => (
                                            <option key={mgr.id} value={mgr.id}>{mgr.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="text-red-500 text-xs">Nenhuma organização disponível no momento.</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <NeonInput placeholder="Nome da Sua Organização" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                    )}
                </div>
            )}

            {error && <div className="text-red-500 text-center text-sm font-bold bg-red-900/20 p-2 rounded border border-red-500">{error}</div>}

            <NeonButton fullWidth onClick={handleSubmit} variant={!isLogin ? 'secondary' : 'primary'}>
                {isLogin ? 'ACESSAR' : 'FINALIZAR CADASTRO'}
            </NeonButton>

            {isLogin && activeTab === 'player' && (
                <div className="pt-4 border-t border-gray-800 mt-4">
                    <button onClick={handleGuest} className="w-full py-2 text-gray-500 hover:text-[var(--primary)] text-sm font-orbitron transition-colors">➜ Entrar como Visitante</button>
                </div>
            )}
        </div>

        {/* Social Media Footer with Custom Logos */}
        <div className="mt-8 pt-6 border-t border-[#333] flex justify-center gap-6 flex-wrap">
            {socialPlatforms.map(platform => {
                const url = (config.socialLinks as any)?.[platform.id];
                const logo = (config.socialLogos as any)?.[platform.id];
                
                if (!url) return null;

                return (
                    <a key={platform.id} href={url} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" title={platform.label}>
                        {logo ? (
                            <img src={logo} alt={platform.label} className="w-6 h-6 object-contain" />
                        ) : (
                            <span className="text-[var(--primary)] hover:text-white text-xl">{platform.icon}</span>
                        )}
                    </a>
                );
            })}
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
             <div className="bg-[#0a0a0a] border border-[var(--primary)] p-6 rounded-xl w-full max-w-sm relative overflow-hidden">
                 <h3 className="text-[var(--primary)] font-bold mb-4 text-xl font-orbitron">Recuperar Senha</h3>
                 {resetMessage && <div className="text-red-400 text-sm mb-4 bg-red-900/20 p-2 rounded border border-red-500/50">{resetMessage}</div>}
                 
                 {/* VISUAL SIMULATION: Fake Notification */}
                 {debugCode && (
                    <div className="absolute top-0 left-0 w-full bg-green-600 text-white text-xs py-2 px-4 animate-pulse flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span>💬</span>
                            <span><strong>NOVA MENSAGEM:</strong> Seu código de verificação é <strong>{debugCode}</strong></span>
                        </div>
                    </div>
                 )}

                 {resetStep === 1 && (
                     <>
                        <input className="w-full p-3 bg-gray-900 text-white mb-3 rounded border border-gray-700 focus:border-[var(--primary)] outline-none" placeholder="Seu Usuário" value={resetUser} onChange={e=>setResetUser(e.target.value)} />
                        <input className="w-full p-3 bg-gray-900 text-white mb-6 rounded border border-gray-700 focus:border-[var(--primary)] outline-none" placeholder="Email ou Celular Cadastrado" value={resetContact} onChange={e=>setResetContact(e.target.value)} />
                        <div className="flex justify-end gap-2">
                            <button onClick={()=>setShowResetModal(false)} className="text-gray-400 px-4 py-2 hover:text-white">Cancelar</button>
                            <NeonButton onClick={handleResetStep1} className="!px-6 !py-2">Enviar Código</NeonButton>
                        </div>
                     </>
                 )}
                 {resetStep === 2 && (
                     <>
                        <p className="text-gray-400 text-xs mb-2">Digite o código enviado para seu contato:</p>
                        <input className="w-full p-4 bg-gray-900 text-white mb-6 rounded text-center text-2xl tracking-[10px] font-mono border border-gray-700 focus:border-[var(--primary)] outline-none" placeholder="000000" value={resetCode} onChange={e=>setResetCode(e.target.value)} maxLength={6} />
                        <NeonButton onClick={handleResetStep2} className="w-full">Verificar Código</NeonButton>
                     </>
                 )}
                 {resetStep === 3 && (
                     <>
                        <input className="w-full p-3 bg-gray-900 text-white mb-6 rounded border border-gray-700 focus:border-[var(--primary)] outline-none" type="password" placeholder="Nova Senha" value={newPassword} onChange={e=>setNewPassword(e.target.value)} />
                        <NeonButton onClick={handleResetStep3} className="w-full">Salvar Nova Senha</NeonButton>
                     </>
                 )}
             </div>
          </div>
      )}
    </div>
  );
};

export default LoginScreen;
