import React from 'react';
import NeonButton from '../components/ui/NeonButton';

interface HomeScreenProps {
  onChangeView: (view: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onChangeView }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
      <NeonButton variant="primary" fullWidth onClick={() => onChangeView('copaNetwork')}>
        Copa Network
      </NeonButton>
      <NeonButton variant="primary" fullWidth onClick={() => onChangeView('torneioMD3')}>
        Torneio MD3
      </NeonButton>
      <NeonButton variant="primary" fullWidth onClick={() => onChangeView('ranking')}>
        Ranking / Destaques
      </NeonButton>
      <NeonButton variant="primary" fullWidth onClick={() => onChangeView('historico')}>
        Histórico de Campeões
      </NeonButton>
    </div>
  );
};

export default HomeScreen;