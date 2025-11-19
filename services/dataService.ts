import { Team, TournamentConfig, Champion, Top11Data, AppConfig } from '../types';

const STORAGE_KEYS = {
  TEAMS: 'tmp_teams',
  CONFIGS: 'tmp_configs',
  CHAMPIONS: 'tmp_champions',
  TOP11: 'tmp_top11',
  APP_CONFIG: 'tmp_app_config'
};

const DEFAULT_TOP11: Top11Data = {
  gk: { name: 'Jogador GK', stars: 3 },
  zgd: { name: 'Jogador ZGD', stars: 2 },
  zgc: { name: 'Jogador ZGC', stars: 3 },
  zge: { name: 'Jogador ZGE', stars: 2 },
  vol: { name: 'Jogador VOL', stars: 3 },
  mc: { name: 'Jogador MC', stars: 2 },
  mei: { name: 'Jogador MEI', stars: 3 },
  alad: { name: 'Jogador ALA D', stars: 2 },
  alae: { name: 'Jogador ALA E', stars: 2 },
  st1: { name: 'Jogador ST', stars: 3 },
  st2: { name: 'Jogador ST', stars: 2 }
};

export const dataService = {
  getTeams: (): Team[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TEAMS);
    return data ? JSON.parse(data) : [];
  },
  
  saveTeam: (team: Team) => {
    const teams = dataService.getTeams();
    teams.push(team);
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    return team;
  },

  getConfigs: (): TournamentConfig[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CONFIGS);
    return data ? JSON.parse(data) : [];
  },

  saveConfig: (config: TournamentConfig) => {
    const configs = dataService.getConfigs();
    // Remove existing config of same type if exists to update it
    const filtered = configs.filter(c => 
      !(c.type === config.type && c.subType === config.subType)
    );
    filtered.push(config);
    localStorage.setItem(STORAGE_KEYS.CONFIGS, JSON.stringify(filtered));
    return config;
  },

  getChampions: (): Champion[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CHAMPIONS);
    return data ? JSON.parse(data) : [];
  },

  saveChampion: (champion: Champion) => {
    const champions = dataService.getChampions();
    champions.push(champion);
    localStorage.setItem(STORAGE_KEYS.CHAMPIONS, JSON.stringify(champions));
    return champion;
  },

  getTop11: (): Top11Data => {
    const data = localStorage.getItem(STORAGE_KEYS.TOP11);
    return data ? JSON.parse(data) : DEFAULT_TOP11;
  },

  saveTop11: (data: Top11Data) => {
    localStorage.setItem(STORAGE_KEYS.TOP11, JSON.stringify(data));
    return data;
  },

  getAppConfig: (): AppConfig => {
      const data = localStorage.getItem(STORAGE_KEYS.APP_CONFIG);
      return data ? JSON.parse(data) : {
          panelName: "PAINEL DE GERENCIAMENTO DE TORNEIOS",
          panelLogo: "",
          activeTournamentName: "",
          activeTournamentType: "copa",
          championTeam: "",
          championCaptain: ""
      };
  },

  saveAppConfig: (config: AppConfig) => {
      localStorage.setItem(STORAGE_KEYS.APP_CONFIG, JSON.stringify(config));
      return config;
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};