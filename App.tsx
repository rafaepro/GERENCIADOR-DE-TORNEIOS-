
import React, { useState, useEffect } from 'react';
import Particles from './components/ui/Particles';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import QuickEditPanel from './components/modals/QuickEditPanel';
import LoginScreen from './views/LoginScreen';
import HomeScreen from './views/HomeScreen';
import CopaNetworkScreen from './views/CopaNetworkScreen';
import TorneioMD3Screen from './views/TorneioMD3Screen';
import RankingScreen from './views/RankingScreen';
import HistoryScreen from './views/HistoryScreen';
import AdminPanel from './views/AdminPanel';
import BannerGeneratorScreen from './views/BannerGeneratorScreen';
import PlayerStatsScreen from './views/PlayerStatsScreen';
import BracketsScreen from './views/BracketsScreen'; 
import ProfileScreen from './views/ProfileScreen'; 
import HallOfFameScreen from './views/HallOfFameScreen'; 
import ManagerDashboard from './views/ManagerDashboard'; 
import Footer from './components/layout/Footer';

import { AppConfig, AuthSession, AppTheme } from './types';
import { dataService } from './services/dataService';
import { authService } from './services/authService';

const App: React.FC = () => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [currentView, setCurrentView] = useState('home');
  const [appConfig, setAppConfig] = useState<AppConfig>(dataService.getAppConfig());
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  const [currentTheme, setCurrentTheme] = useState<AppTheme>('cyberpunk');

  useEffect(() => {
    authService.initialize();
    const currentSession = authService.getSession();
    if (currentSession) {
      setSession(currentSession);
      
      // Load config specific to the manager/owner if logged in
      if (currentSession.user) {
          const ownerId = currentSession.user.role === 'manager' 
              ? currentSession.user.id 
              : currentSession.user.ownerId;
          
          // In a real app, we would fetch the specific config for this owner.
          // For now, if it's a user belonging to a manager, apply manager's branding
          // This is simplified, assuming AppConfig is global but overridden by branding fields in User
          if (currentSession.user.tournamentLogo || currentSession.user.customPanelName) {
              setAppConfig(prev => ({
                  ...prev,
                  panelLogo: currentSession.user?.tournamentLogo || prev.panelLogo,
                  panelName: currentSession.user?.customPanelName || prev.panelName
              }));
          }
      }
    } else {
       setAppConfig(dataService.getAppConfig());
    }
  }, []);

  const handleUpdateConfig = (newConfig: Partial<AppConfig>) => {
    const updated = { ...appConfig, ...newConfig };
    setAppConfig(updated);
    dataService.saveAppConfig(updated);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleLogout = () => {
    authService.logout();
    setSession(null);
    setCurrentView('home');
    setIsSidebarOpen(false);
    // Reset config to global default on logout
    setAppConfig(dataService.getAppConfig());
  };

  const renderView = () => {
    // Manager Dashboard Route
    if (currentView === 'managerDashboard' && session?.user?.role === 'manager') {
        return <ManagerDashboard onBack={() => setCurrentView('home')} />;
    }

    switch (currentView) {
      case 'home':
        return <HomeScreen onChangeView={setCurrentView} />;
      case 'profile':
        return <ProfileScreen onBack={() => setCurrentView('home')} />;
      case 'copaNetwork':
        return <CopaNetworkScreen onBack={() => setCurrentView('home')} showToast={showToast} />;
      case 'torneioMD3':
        return <TorneioMD3Screen onBack={() => setCurrentView('home')} showToast={showToast} />;
      case 'ranking':
        return <RankingScreen onBack={() => setCurrentView('home')} showToast={showToast} />;
      case 'historico':
        return <HistoryScreen onBack={() => setCurrentView('home')} showToast={showToast} />;
      case 'playerStats':
        return <PlayerStatsScreen onBack={() => setCurrentView('home')} />;
      case 'adminPanel':
        // Admin panel is for Super Admin
        return session?.user?.role === 'admin' ? 
            <AdminPanel onBack={() => setCurrentView('home')} config={appConfig} onUpdateConfig={handleUpdateConfig} /> 
            : <HomeScreen onChangeView={setCurrentView} />;
      case 'bannerGenerator':
        return <BannerGeneratorScreen onBack={() => setCurrentView('home')} />;
      case 'brackets':
        return <BracketsScreen onBack={() => setCurrentView('home')} />;
      case 'halloffame':
        return <HallOfFameScreen onBack={() => setCurrentView('home')} />;
      default:
        return <HomeScreen onChangeView={setCurrentView} />;
    }
  };

  const themes: {id: AppTheme, name: string, color: string}[] = [
      { id: 'cyberpunk', name: 'Cyberpunk', color: '#00FFFF' },
      { id: 'champions', name: 'Champions', color: '#3a6cf4' },
      { id: 'europa', name: 'Europa', color: '#fca311' },
      { id: 'worldcup', name: 'World Cup', color: '#cda434' },
      { id: 'mundial', name: 'Mundial', color: '#00cfb7' },
      { id: 'fc', name: 'FC Tactical', color: '#33FF57' },
      { id: 'efootball', name: 'E-Pro', color: '#0055FF' },
      { id: 'ufl', name: 'Striker', color: '#FFFFFF' },
      { id: 'green', name: 'Gramado', color: '#00FF00' },
      { id: 'red', name: 'Red', color: '#FF4500' },
  ];

  return (
    <div className={`min-h-screen relative text-white overflow-x-hidden theme-${currentTheme}`}>
      <Particles />

      {!session ? (
         <LoginScreen onLoginSuccess={setSession} config={appConfig} />
      ) : (
        <>
            {/* Top Navigation Bar */}
            <div className="fixed top-0 left-0 w-full flex justify-between items-center p-3 z-50 bg-black/80 backdrop-blur-sm border-b border-[var(--secondary)] shadow-lg h-16">
                <div className="flex items-center gap-4">
                    {/* Hamburger Menu Button */}
                    <button 
                      onClick={() => setIsSidebarOpen(true)}
                      className="text-[var(--primary)] text-2xl p-2 hover:scale-110 transition-transform"
                    >
                      ☰
                    </button>

                    <div 
                      className="text-xs md:text-sm font-orbitron text-[var(--primary)] flex items-center gap-2 cursor-pointer hover:opacity-80"
                      onClick={() => setCurrentView('profile')}
                    >
                        <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)] flex items-center justify-center text-lg overflow-hidden">
                            {session.user?.avatar ? <img src={session.user.avatar} className="w-full h-full object-cover" /> : '👤'}
                        </div>
                        <div className="hidden sm:block">
                            <div className="font-bold text-white">{session.user?.nickname || session.user?.username}</div>
                            <div className="text-[10px] text-[var(--accent)] font-bold uppercase tracking-wider">
                                {session.user?.role === 'admin' ? 'SUPER ADMIN' : session.user?.role === 'manager' ? 'ORGANIZADOR' : 'JOGADOR'}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    {/* Theme Selector - Hidden on mobile to save space */}
                    <div className="hidden md:flex gap-2 bg-black/50 p-1 rounded-full border border-gray-700 overflow-x-auto max-w-[400px] custom-scrollbar">
                        {themes.map(t => (
                            <button 
                                key={t.id}
                                onClick={() => setCurrentTheme(t.id)}
                                className={`w-6 h-6 rounded-full border-2 shrink-0 transition-transform hover:scale-110 ${currentTheme === t.id ? 'scale-110 border-white' : 'border-transparent opacity-70'}`}
                                style={{ backgroundColor: t.color }}
                                title={t.name}
                            />
                        ))}
                    </div>

                    <button 
                        onClick={handleLogout}
                        className="text-xs font-bold text-red-500 hover:text-white hover:bg-red-600 border border-red-500 rounded px-3 py-1 transition-all font-orbitron"
                    >
                        SAIR
                    </button>
                </div>
            </div>

            <Sidebar 
              isOpen={isSidebarOpen} 
              setIsOpen={setIsSidebarOpen} 
              onChangeView={setCurrentView} 
              session={session}
            />
            
            {session.user?.role === 'admin' && (
                <button 
                onClick={() => setIsQuickEditOpen(true)}
                className="fixed top-20 right-5 w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-xl text-black shadow-[0_0_20px_var(--primary)] z-40 hover:scale-110 transition-transform cursor-pointer"
                title="Edição Rápida"
                >
                ⚙️
                </button>
            )}

            <div className="relative z-10 max-w-[1400px] mx-auto px-5 pt-24 pb-10 min-h-[85vh]">
                <Header config={appConfig} onUpdateConfig={handleUpdateConfig} />
                
                <main>
                {renderView()}
                </main>
            </div>

            {/* Footer */}
            <Footer config={appConfig} />

            <QuickEditPanel 
                isOpen={isQuickEditOpen} 
                onClose={() => setIsQuickEditOpen(false)} 
                config={appConfig}
                onSave={handleUpdateConfig}
            />

            {toastMsg && (
                <div className="fixed bottom-8 right-8 bg-gradient-to-r from-[var(--secondary)] to-[var(--primary)] text-white font-bold py-4 px-8 rounded-xl border-2 border-[var(--primary)] shadow-[0_0_40px_rgba(0,255,255,0.6)] z-50 animate-fade-in font-orbitron">
                {toastMsg}
                </div>
            )}
        </>
      )}
    </div>
  );
};

export default App;
