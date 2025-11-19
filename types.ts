export interface Player {
  name: string;
  position: string;
  stars?: number;
}

export interface Team {
  id: string;
  name: string;
  captain: string;
  logo?: string;
  players?: Player[];
  tournamentType: 'copa' | 'md3-diaria' | 'md3-marcelo' | 'md3-istrawl';
  createdAt: string;
  stats?: {
      titles: number;
      wins: number;
      participations: number;
  }
}

export interface TournamentConfig {
  id: string;
  name: string;
  month?: string;
  teamsCount?: number;
  groupsCount?: number;
  trophyImage?: string;
  medalsImage?: string;
  type: 'copa' | 'md3';
  subType?: 'diaria' | 'marcelo' | 'istrawl';
}

export interface Champion {
  id: string;
  teamName: string;
  captainName: string;
  date: string;
  tournamentType: string;
  logo?: string;
  players?: Player[];
}

export interface Top11Player {
  name: string;
  stars: number;
}

export type Top11Data = Record<string, Top11Player>;

export interface AppConfig {
  panelName: string;
  panelLogo: string;
  activeTournamentName: string;
  activeTournamentType: string;
  championTeam: string;
  championCaptain: string;
  championLogo?: string;
}