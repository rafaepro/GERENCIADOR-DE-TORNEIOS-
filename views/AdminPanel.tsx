
import React, { useState, useEffect } from 'react';
import NeonButton from '../components/ui/NeonButton';
import FileUpload from '../components/ui/FileUpload';
import { authService } from '../services/authService';
import { fileToBase64 } from '../services/dataService';
import { User, AppConfig } from '../types';
import NeonInput from '../components/ui/NeonInput';

interface AdminPanelProps {
  onBack: () => void;
  config: AppConfig;
  onUpdateConfig: (newConfig: Partial<AppConfig>) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack, config, onUpdateConfig }) => {
  const [activeTab, setActiveTab] = useState<'clients' | 'system'>('clients');
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState('');
  
  // Client Hub Modal State
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [clientHubTab, setClientHubTab] = useState<'branding' | 'access' | 'profile'>('branding');

  // Editing States within Modal
  const [editPanelName, setEditPanelName] = useState('');
  const [newClientPassword, setNewClientPassword] = useState('');
  const [editNickname, setEditNickname] = useState('');
  const [editContact, setEditContact] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(authService.getUsers());
  };

  // --- Actions ---

  const openClientHub = (user: User) => {
      setSelectedClient(user);
      setEditPanelName(user.customPanelName || '');
      setEditNickname(user.nickname);
      setEditContact(user.phone || user.email || '');
      setNewClientPassword('');
      setClientHubTab('branding'); // Default tab
      setClientModalOpen(true);
  };

  const handleToggleStatus = (id: string) => {
    const updated = authService.toggleUserStatus(id);
    setUsers(updated);
    // Update selected client if open
    if (selectedClient && selectedClient.id === id) {
        const updatedClient = updated.find(u => u.id === id);
        if(updatedClient) setSelectedClient(updatedClient);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('⚠️ ATENÇÃO: Tem certeza que deseja excluir este cliente? Todos os dados dele serão perdidos.')) {
      const updated = authService.deleteUser(id);
      setUsers(updated);
      setClientModalOpen(false);
    }
  };

  // --- Saving Logic inside Hub ---

  const handleClientLogoUpload = async (file: File) => {
      if(selectedClient) {
          const base64 = await fileToBase64(file);
          const updated = authService.updateUser(selectedClient.id, { tournamentLogo: base64 });
          if(updated) setSelectedClient(updated);
          alert('✅ Logo do cliente atualizada!');
      }
  };

  const saveBranding = () => {
      if(selectedClient) {
          const updated = authService.updateUser(selectedClient.id, { customPanelName: editPanelName });
          if(updated) setSelectedClient(updated);
          alert('✅ Nome do painel do cliente salvo!');
          loadUsers();
      }
  };

  const saveAccess = () => {
      if(selectedClient && newClientPassword) {
          authService.updateUser(selectedClient.id, { password: newClientPassword });
          setNewClientPassword('');
          alert('✅ Senha do cliente redefinida com sucesso!');
      }
  };

  const saveProfile = () => {
      if(selectedClient) {
          const updated = authService.updateUser(selectedClient.id, { 
              nickname: editNickname,
              phone: editContact // Basic contact update
          });
          if(updated) setSelectedClient(updated);
          loadUsers();
          alert('✅ Dados do perfil atualizados!');
      }
  }

  // --- System Config ---
  const handleImageUpload = async (field: keyof AppConfig, file: File) => {
      const base64 = await fileToBase64(file);
      onUpdateConfig({ [field]: base64 });
  };

  const filteredUsers = users.filter(u => 
      u.role !== 'admin' && 
      (u.nickname.toLowerCase().includes(filter.toLowerCase()) || 
       u.username.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="animate-fade-in bg-gradient-to-br from-[#050818] to-[#0A1124] border-2 border-[#ff00ff] rounded-2xl p-4 md:p-8 mb-8 shadow-[0_0_35px_rgba(255,0,255,0.3)]">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
         <NeonButton variant="secondary" onClick={onBack} className="!border-[#ff00ff] !text-[#ff00ff] hover:!bg-[#ff00ff] hover:!text-white w-full md:w-auto">← Voltar</NeonButton>
         
         <div className="flex bg-black/50 p-1 rounded-lg border border-[#ff00ff]/30">
             <button 
                onClick={() => setActiveTab('clients')}
                className={`px-6 py-2 rounded font-bold font-orbitron transition-all ${activeTab === 'clients' ? 'bg-[#ff00ff] text-black shadow-[0_0_15px_#ff00ff]' : 'text-[#ff00ff] hover:bg-[#ff00ff]/10'}`}
             >
                 👥 Clientes
             </button>
             <button 
                onClick={() => setActiveTab('system')}
                className={`px-6 py-2 rounded font-bold font-orbitron transition-all ${activeTab === 'system' ? 'bg-[#ff00ff] text-black shadow-[0_0_15px_#ff00ff]' : 'text-[#ff00ff] hover:bg-[#ff00ff]/10'}`}
             >
                 🎨 Sistema
             </button>
         </div>
      </div>

      <h2 className="text-2xl md:text-4xl font-bold text-center mb-2 uppercase tracking-[3px] text-[#ff00ff] font-orbitron drop-shadow-[0_0_20px_#ff00ff]">
        {activeTab === 'clients' ? 'Hub de Clientes' : 'Configuração do Sistema'}
      </h2>
      <div className="w-32 h-1 bg-[#ff00ff] mx-auto mb-8 shadow-[0_0_10px_#ff00ff]"></div>

      {activeTab === 'clients' ? (
        <>
            <div className="mb-6 flex justify-between items-end gap-4 flex-wrap">
                <div className="text-gray-400 font-orbitron text-sm max-w-md">
                    Gerencie seus clientes. Configure o painel individual de cada um, defina a logo do torneio deles e controle o acesso.
                </div>
                <div className="w-full md:w-auto">
                    <input 
                        type="text" 
                        placeholder="🔍 Buscar cliente..." 
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="bg-black/50 border border-[#ff00ff] text-white px-4 py-2 rounded-lg w-full outline-none focus:shadow-[0_0_10px_#ff00ff]"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredUsers.length === 0 && <div className="text-center text-gray-500 py-10">Nenhum cliente encontrado.</div>}
                
                {filteredUsers.map(user => (
                    <div key={user.id} className="bg-white/5 border border-[#ff00ff]/30 rounded-xl p-4 flex flex-col md:flex-row items-center gap-6 hover:bg-white/10 transition-colors group">
                        {/* Avatar / Logo Preview */}
                        <div className="w-16 h-16 rounded-full bg-black border-2 border-[#ff00ff] flex items-center justify-center overflow-hidden shrink-0 relative">
                            {user.tournamentLogo ? (
                                <img src={user.tournamentLogo} className="w-full h-full object-contain" alt="Client Logo" />
                            ) : (
                                <span className="text-2xl">👤</span>
                            )}
                             <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-black ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <h3 className="text-[#ff00ff] font-bold font-orbitron text-lg">{user.nickname}</h3>
                                <span className="text-xs text-gray-500 font-mono">({user.username})</span>
                            </div>
                            <div className="text-sm text-gray-300 mb-1">
                                {user.customPanelName ? (
                                    <span className="text-[#00FFFF]">🏆 {user.customPanelName}</span>
                                ) : (
                                    <span className="text-gray-600 italic">Nome do torneio não definido</span>
                                )}
                            </div>
                            <div className="text-xs text-gray-500">{user.email || user.phone || 'Sem contato'}</div>
                        </div>

                        {/* Status Badge */}
                        <div className="px-4">
                            <span className={`px-3 py-1 rounded text-xs font-bold border uppercase tracking-wider ${user.isActive ? 'bg-green-500/10 text-green-500 border-green-500' : 'bg-red-500/10 text-red-500 border-red-500'}`}>
                                {user.isActive ? 'Acesso Liberado' : 'Bloqueado'}
                            </span>
                        </div>

                        {/* Action Button */}
                        <div>
                            <NeonButton onClick={() => openClientHub(user)} className="!border-[#ff00ff] !text-[#ff00ff] hover:!bg-[#ff00ff] hover:!text-black !py-2 !px-6 !text-sm">
                                ⚙️ Gerenciar Cliente
                            </NeonButton>
                        </div>
                    </div>
                ))}
            </div>
        </>
      ) : (
          /* System Tab Content (Kept as is, just styled) */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
              <div className="bg-black/30 p-6 rounded-xl border border-[#ff00ff]/30">
                  <h3 className="text-[#ff00ff] text-xl font-bold font-orbitron mb-4 border-b border-[#ff00ff]/30 pb-2">
                      Banner do Topo (Global)
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                      Imagem padrão atrás do cabeçalho para quem não tem personalização.
                  </p>
                  <FileUpload 
                    label="Upload Banner" 
                    accept="image/*"
                    onChange={(f) => handleImageUpload('headerBackgroundImage', f)}
                    helperText="1920x300px (Paisagem)"
                  />
                  {config.headerBackgroundImage && (
                      <img src={config.headerBackgroundImage} className="w-full h-20 object-cover rounded border border-gray-700 mt-2" alt="Preview" />
                  )}

                   <div className="mt-6 pt-6 border-t border-[#ff00ff]/20">
                      <h4 className="text-[#ff00ff] font-bold font-orbitron mb-4">Ilustrações Decorativas</h4>
                      <div className="grid grid-cols-2 gap-4">
                          <FileUpload 
                            label="Esq." 
                            onChange={(f) => handleImageUpload('headerIllustrationLeft', f)}
                          />
                          <FileUpload 
                            label="Dir." 
                            onChange={(f) => handleImageUpload('headerIllustrationRight', f)}
                          />
                      </div>
                  </div>
              </div>

              <div className="bg-black/30 p-6 rounded-xl border border-[#ff00ff]/30">
                  <h3 className="text-[#ff00ff] text-xl font-bold font-orbitron mb-4 border-b border-[#ff00ff]/30 pb-2">
                      Tela de Login
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                      Fundo da tela de entrada do sistema.
                  </p>
                  <FileUpload 
                    label="Background Login" 
                    accept="image/*"
                    onChange={(f) => handleImageUpload('loginBackgroundImage', f)}
                    helperText="1920x1080px"
                  />
                   {config.loginBackgroundImage && (
                      <img src={config.loginBackgroundImage} className="w-full h-32 object-cover rounded border border-gray-700 mt-2" alt="Preview" />
                  )}
              </div>
          </div>
      )}

      {/* --- CLIENT HUB MODAL --- */}
      {clientModalOpen && selectedClient && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-[#121212] border-2 border-[#ff00ff] rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(255,0,255,0.3)]">
                  
                  {/* Modal Header */}
                  <div className="bg-[#ff00ff] text-black p-6 flex justify-between items-center">
                      <div>
                          <h2 className="text-2xl font-black font-orbitron uppercase">Hub do Cliente</h2>
                          <div className="text-sm font-bold opacity-80">{selectedClient.nickname} ({selectedClient.username})</div>
                      </div>
                      <button onClick={() => setClientModalOpen(false)} className="text-2xl font-bold hover:scale-110">✕</button>
                  </div>

                  <div className="flex flex-1 overflow-hidden">
                      {/* Modal Sidebar */}
                      <div className="w-1/4 bg-black/50 border-r border-[#ff00ff]/30 p-4 flex flex-col gap-2">
                          <button 
                            onClick={() => setClientHubTab('branding')}
                            className={`p-3 rounded text-left font-bold font-orbitron transition-all ${clientHubTab === 'branding' ? 'bg-[#ff00ff] text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                          >
                              🎨 Identidade Visual
                          </button>
                          <button 
                            onClick={() => setClientHubTab('access')}
                            className={`p-3 rounded text-left font-bold font-orbitron transition-all ${clientHubTab === 'access' ? 'bg-[#ff00ff] text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                          >
                              🔒 Acesso & Status
                          </button>
                          <button 
                            onClick={() => setClientHubTab('profile')}
                            className={`p-3 rounded text-left font-bold font-orbitron transition-all ${clientHubTab === 'profile' ? 'bg-[#ff00ff] text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                          >
                              📝 Dados Cadastrais
                          </button>
                          
                          <div className="mt-auto pt-4 border-t border-[#ff00ff]/30">
                              <button 
                                onClick={() => handleDelete(selectedClient.id)}
                                className="w-full p-3 rounded text-red-500 border border-red-500 hover:bg-red-500 hover:text-white transition-all text-sm font-bold"
                              >
                                  🗑️ Excluir Cliente
                              </button>
                          </div>
                      </div>

                      {/* Modal Content Area */}
                      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-[#0A1124]">
                          
                          {/* TAB: BRANDING */}
                          {clientHubTab === 'branding' && (
                              <div className="animate-fade-in space-y-8">
                                  <div>
                                      <h3 className="text-[#ff00ff] text-xl font-bold mb-4 font-orbitron border-b border-[#ff00ff]/30 pb-2">Configuração do Painel</h3>
                                      <p className="text-gray-400 text-sm mb-6">Personalize como o painel aparece para este cliente quando ele faz login.</p>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                          <div className="bg-black/30 p-4 rounded border border-gray-700">
                                              <p className="text-white font-bold mb-2">1. Logo do Torneio</p>
                                              <p className="text-xs text-gray-500 mb-4">Substitui o logo principal no cabeçalho.</p>
                                              
                                              <div className="flex flex-col items-center mb-4">
                                                  <div className="w-32 h-32 bg-black border-2 border-dashed border-gray-600 rounded-full flex items-center justify-center overflow-hidden mb-2">
                                                      {selectedClient.tournamentLogo ? (
                                                          <img src={selectedClient.tournamentLogo} className="w-full h-full object-contain" />
                                                      ) : (
                                                          <span className="text-gray-600 text-4xl">📷</span>
                                                      )}
                                                  </div>
                                              </div>
                                              <FileUpload label="Alterar Logo" onChange={handleClientLogoUpload} />
                                          </div>

                                          <div className="bg-black/30 p-4 rounded border border-gray-700">
                                              <p className="text-white font-bold mb-2">2. Nome do Painel</p>
                                              <p className="text-xs text-gray-500 mb-4">Substitui o título "PAINEL DE GERENCIAMENTO".</p>
                                              
                                              <NeonInput 
                                                label="Título do Torneio"
                                                value={editPanelName}
                                                onChange={e => setEditPanelName(e.target.value)}
                                                placeholder="Ex: Copa do João"
                                              />
                                              <div className="mt-4">
                                                  <NeonButton onClick={saveBranding} className="w-full !border-[#ff00ff] hover:!shadow-[0_0_15px_#ff00ff]">Salvar Nome</NeonButton>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          )}

                          {/* TAB: ACCESS */}
                          {clientHubTab === 'access' && (
                              <div className="animate-fade-in space-y-8">
                                  <div>
                                      <h3 className="text-[#ff00ff] text-xl font-bold mb-4 font-orbitron border-b border-[#ff00ff]/30 pb-2">Controle de Acesso</h3>
                                      
                                      <div className="bg-black/30 p-6 rounded border border-gray-700 mb-6 flex items-center justify-between">
                                          <div>
                                              <h4 className="text-white font-bold text-lg">Status da Conta</h4>
                                              <p className="text-gray-400 text-sm">
                                                  {selectedClient.isActive ? 'O cliente tem acesso total ao painel.' : 'O acesso do cliente está suspenso.'}
                                              </p>
                                          </div>
                                          <button 
                                            onClick={() => handleToggleStatus(selectedClient.id)}
                                            className={`px-6 py-3 rounded font-bold font-orbitron transition-all border ${selectedClient.isActive ? 'bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-green-500/10 border-green-500 text-green-500 hover:bg-green-500 hover:text-white'}`}
                                          >
                                              {selectedClient.isActive ? '🔒 BLOQUEAR ACESSO' : '🔓 LIBERAR ACESSO'}
                                          </button>
                                      </div>

                                      <div className="bg-black/30 p-6 rounded border border-gray-700">
                                          <h4 className="text-white font-bold text-lg mb-4">Redefinição de Senha</h4>
                                          <div className="flex gap-4 items-end">
                                              <div className="flex-1">
                                                  <NeonInput 
                                                    type="text"
                                                    label="Nova Senha"
                                                    value={newClientPassword}
                                                    onChange={e => setNewClientPassword(e.target.value)}
                                                    placeholder="Digite a nova senha..."
                                                  />
                                              </div>
                                              <div className="mb-5">
                                                  <NeonButton onClick={saveAccess} className="!py-3 !border-[#ff00ff]">Atualizar Senha</NeonButton>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          )}

                          {/* TAB: PROFILE */}
                          {clientHubTab === 'profile' && (
                              <div className="animate-fade-in space-y-8">
                                  <div>
                                      <h3 className="text-[#ff00ff] text-xl font-bold mb-4 font-orbitron border-b border-[#ff00ff]/30 pb-2">Dados do Cliente</h3>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          <NeonInput 
                                            label="Nickname / Nome"
                                            value={editNickname}
                                            onChange={e => setEditNickname(e.target.value)}
                                          />
                                          <NeonInput 
                                            label="Contato (Email ou Celular)"
                                            value={editContact}
                                            onChange={e => setEditContact(e.target.value)}
                                          />
                                          <div className="md:col-span-2">
                                              <label className="block mb-2 text-sm font-bold text-[#00FFFF] uppercase tracking-widest font-orbitron">Login (Username)</label>
                                              <input disabled value={selectedClient.username} className="w-full bg-black/50 border border-gray-700 text-gray-500 px-4 py-3 rounded cursor-not-allowed" />
                                              <p className="text-xs text-gray-600 mt-1">* O nome de usuário de login não pode ser alterado.</p>
                                          </div>
                                      </div>

                                      <div className="mt-6 flex justify-end">
                                          <NeonButton onClick={saveProfile}>Salvar Alterações</NeonButton>
                                      </div>
                                  </div>
                              </div>
                          )}

                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminPanel;
