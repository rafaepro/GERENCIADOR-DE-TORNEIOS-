import React, { useState, useEffect } from 'react';
import Particles from './components/ui/Particles';
import Header from './components/layout/Header';
import QuickEditPanel from './components/modals/QuickEditPanel';
import HomeScreen from './views/HomeScreen';
import CopaNetworkScreen from './views/CopaNetworkScreen';
import TorneioMD3Screen from './views/TorneioMD3Screen';
import RankingScreen from './views/RankingScreen';
import HistoryScreen from './views/HistoryScreen';
import { AppConfig } from './types';
import { dataService } from './services/dataService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('home');
  const [appConfig, setAppConfig] = useState<AppConfig>(dataService.getAppConfig());
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    // Sync config on load
    setAppConfig(dataService.getAppConfig());
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

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeScreen onChangeView={setCurrentView} />;
      case 'copaNetwork':
        return <CopaNetworkScreen onBack={() => setCurrentView('home')} showToast={showToast} />;
      case 'torneioMD3':
        return <TorneioMD3Screen onBack={() => setCurrentView('home')} showToast={showToast} />;
      case 'ranking':
        return <RankingScreen onBack={() => setCurrentView('home')} showToast={showToast} />;
      case 'historico':
        return <HistoryScreen onBack={() => setCurrentView('home')} showToast={showToast} />;
      default:
        return <HomeScreen onChangeView={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen relative text-white overflow-x-hidden">
      <Particles />
      
      {/* Quick Edit Button */}
      <button 
        onClick={() => setIsQuickEditOpen(true)}
        className="fixed top-5 right-5 w-14 h-14 rounded-full bg-gradient-to-br from-[#00ff00] to-[#00cc00] flex items-center justify-center text-2xl text-black shadow-[0_0_20px_rgba(0,255,0,0.6)] z-40 hover:scale-110 transition-transform cursor-pointer"
      >
        ⚙️
      </button>

      <div className="relative z-10 max-w-[1400px] mx-auto px-5 py-5">
        <Header config={appConfig} onUpdateConfig={handleUpdateConfig} />
        
        <main>
          {renderView()}
        </main>
      </div>

      <QuickEditPanel 
        isOpen={isQuickEditOpen} 
        onClose={() => setIsQuickEditOpen(false)} 
        config={appConfig}
        onSave={handleUpdateConfig}
      />

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-8 right-8 bg-gradient-to-r from-[#6A00FF] to-[#00FFFF] text-white font-bold py-4 px-8 rounded-xl border-2 border-[#00FFFF] shadow-[0_0_40px_rgba(0,255,255,0.6)] z-50 animate-fade-in font-orbitron">
          {toastMsg}
        </div>
      )}
    </div>
  );
};

export default App;