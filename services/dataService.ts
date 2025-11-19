
import { Team, TournamentConfig, Champion, Top11Data, AppConfig, Bracket, Match, MatchTeam, HallOfFameEntry } from '../types';

const STORAGE_KEYS = {
  TEAMS: 'tmp_teams',
  CONFIGS: 'tmp_configs',
  CHAMPIONS: 'tmp_champions',
  TOP11: 'tmp_top11',
  APP_CONFIG: 'tmp_app_config',
  BRACKETS: 'tmp_brackets',
  HALL_OF_FAME: 'tmp_hall_of_fame'
};

const DEFAULT_TOP11: Top11Data = {
  gk: { name: 'GK', stars: 3, x: 45, y: 85 },
  zgd: { name: 'ZGD', stars: 2, x: 20, y: 70 },
  zgc: { name: 'ZGC', stars: 3, x: 45, y: 70 },
  zge: { name: 'ZGE', stars: 2, x: 70, y: 70 },
  vol: { name: 'VOL', stars: 3, x: 45, y: 55 },
  mc: { name: 'MC', stars: 2, x: 30, y: 45 },
  mei: { name: 'MEI', stars: 3, x: 60, y: 45 },
  alad: { name: 'ALA D', stars: 2, x: 10, y: 40 },
  alae: { name: 'ALA E', stars: 2, x: 80, y: 40 },
  st1: { name: 'ST', stars: 3, x: 35, y: 15 },
  st2: { name: 'ST', stars: 2, x: 55, y: 15 }
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
      const defaultConfig: AppConfig = {
          panelName: "PAINEL DE GERENCIAMENTO DE TORNEIOS",
          panelLogo: "",
          headerBackgroundImage: "https://img.freepik.com/free-vector/soccer-stadium-night_1284-16397.jpg",
          activeTournamentName: "",
          activeTournamentType: "copa",
          championTeam: "",
          championCaptain: "",
          championLogo: "",
          selectionTitle: "SELEÇÃO DA SEMANA",
          loginBackgroundImage: "https://wallpapers.com/images/hd/messi-and-ronaldo-pictures-940-x-529-51a6050k4z3c0l8a.jpg", // Default CR7 vs Messi
          socialLinks: {},
          socialLogos: {},
          rankingDecorations: {}
      };

      if (!data) return defaultConfig;

      const parsed = JSON.parse(data);
      // Ensure deep merge for new fields
      return { 
          ...defaultConfig, 
          ...parsed,
          socialLinks: { ...defaultConfig.socialLinks, ...parsed.socialLinks },
          socialLogos: { ...defaultConfig.socialLogos, ...parsed.socialLogos },
          rankingDecorations: { ...defaultConfig.rankingDecorations, ...parsed.rankingDecorations }
      };
  },

  saveAppConfig: (config: AppConfig) => {
      localStorage.setItem(STORAGE_KEYS.APP_CONFIG, JSON.stringify(config));
      return config;
  },

  // --- Bracket Methods ---
  getBrackets: (): Bracket[] => {
    const data = localStorage.getItem(STORAGE_KEYS.BRACKETS);
    return data ? JSON.parse(data) : [];
  },

  saveBracket: (bracket: Bracket) => {
    const brackets = dataService.getBrackets();
    const index = brackets.findIndex(b => b.id === bracket.id);
    if (index > -1) {
      brackets[index] = bracket;
    } else {
      brackets.push(bracket);
    }
    localStorage.setItem(STORAGE_KEYS.BRACKETS, JSON.stringify(brackets));
  },

  deleteBracket: (id: string) => {
    const brackets = dataService.getBrackets();
    const filtered = brackets.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BRACKETS, JSON.stringify(filtered));
  },

  generateBracket: (name: string, teams: Team[]): Bracket => {
    // Simple single elimination generator
    const shuffled = [...teams].sort(() => 0.5 - Math.random());
    const teamCount = shuffled.length;
    
    // Calculate nearest power of 2 (8, 16, 32, etc.)
    let power = 2;
    while (power < teamCount) power *= 2;
    
    // Fill BYEs if necessary
    while (shuffled.length < power) {
        shuffled.push({ id: 'bye', name: 'BYE', captain: '', tournamentType: 'copa', createdAt: '' });
    }

    const matches: Match[] = [];
    const totalRounds = Math.log2(power);

    let matchIdCounter = 1;
    const roundsMatches: string[][] = []; // Store IDs to link rounds

    // 1. Generate Matches Structure
    for (let r = 0; r < totalRounds; r++) {
        const roundMatchCount = power / Math.pow(2, r + 1);
        const currentRoundIds: string[] = [];
        
        for (let i = 0; i < roundMatchCount; i++) {
            const mId = `match-${Date.now()}-${matchIdCounter++}`;
            currentRoundIds.push(mId);

            let teamA: MatchTeam = { id: null, name: 'A Definir' };
            let teamB: MatchTeam = { id: null, name: 'A Definir' };

            // If first round, assign teams
            if (r === 0) {
                const t1 = shuffled[i * 2];
                const t2 = shuffled[i * 2 + 1];
                teamA = { id: t1.id === 'bye' ? null : t1.id, name: t1.name, logo: t1.logo };
                teamB = { id: t2.id === 'bye' ? null : t2.id, name: t2.name, logo: t2.logo };
            }

            matches.push({
                id: mId,
                roundId: r,
                nextMatchId: null,
                teamA: teamA,
                teamB: teamB,
                status: 'scheduled'
            });
        }
        roundsMatches.push(currentRoundIds);
    }

    // 2. Link Matches (Next Match Logic)
    for (let r = 0; r < totalRounds - 1; r++) {
        const currentRound = roundsMatches[r];
        const nextRound = roundsMatches[r+1];
        
        for (let i = 0; i < currentRound.length; i++) {
            const currentMatchId = currentRound[i];
            const nextMatchIndex = Math.floor(i / 2);
            const nextMatchId = nextRound[nextMatchIndex];
            
            const match = matches.find(m => m.id === currentMatchId);
            if (match) match.nextMatchId = nextMatchId;
        }
    }

    // 3. Auto-Advance Logic for BYEs (Post-Processing)
    // We iterate only the first round matches to check for "BYE" scenarios
    const firstRoundMatches = matches.filter(m => m.roundId === 0);
    
    firstRoundMatches.forEach(match => {
        const isTeamABYE = match.teamA.name === 'BYE';
        const isTeamBBYE = match.teamB.name === 'BYE';
        
        // If one team is BYE (and the other isn't), auto win for the real team
        if (isTeamABYE || isTeamBBYE) {
            const realTeam = isTeamABYE ? match.teamB : match.teamA;
            
            // Only advance if there is actually a real team (two BYEs playing each other is rare but possible in sparse brackets)
            if (realTeam.name !== 'BYE') {
                 match.status = 'completed';
                 if(isTeamABYE) {
                     match.teamB.isWinner = true;
                     match.teamB.score = 1; // Cosmetic score
                     match.teamA.score = 0;
                 } else {
                     match.teamA.isWinner = true;
                     match.teamA.score = 1;
                     match.teamB.score = 0;
                 }

                 // Propagate to next match immediately
                 if (match.nextMatchId) {
                     const nextMatch = matches.find(m => m.id === match.nextMatchId);
                     if (nextMatch) {
                         // Determine if this match was the "top" (even index) or "bottom" (odd index) feeder
                         // We can find this by checking the roundsMatches array
                         const currentRoundIds = roundsMatches[0];
                         const myIndex = currentRoundIds.indexOf(match.id);
                         
                         const nextTeamData = {
                             id: realTeam.id,
                             name: realTeam.name,
                             logo: realTeam.logo,
                             score: 0,
                             isWinner: false
                         };

                         if (myIndex % 2 === 0) {
                             nextMatch.teamA = nextTeamData;
                         } else {
                             nextMatch.teamB = nextTeamData;
                         }
                     }
                 }
            }
        }
    });

    return {
        id: `bracket-${Date.now()}`,
        name,
        createdAt: new Date().toISOString(),
        status: 'active',
        matches
    };
  },

  // --- Hall of Fame Methods ---
  getHallOfFame: (): HallOfFameEntry[] => {
      const data = localStorage.getItem(STORAGE_KEYS.HALL_OF_FAME);
      return data ? JSON.parse(data) : [];
  },

  saveHallOfFameEntry: (entry: HallOfFameEntry) => {
      const entries = dataService.getHallOfFame();
      entries.push(entry);
      localStorage.setItem(STORAGE_KEYS.HALL_OF_FAME, JSON.stringify(entries));
      return entry;
  },

  deleteHallOfFameEntry: (id: string) => {
      const entries = dataService.getHallOfFame();
      const filtered = entries.filter(e => e.id !== id);
      localStorage.setItem(STORAGE_KEYS.HALL_OF_FAME, JSON.stringify(filtered));
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
