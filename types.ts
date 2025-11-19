
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
  ownerId?: string; // For Manager context
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
  ownerId?: string; // For Manager context
  format?: 'mata-mata' | 'pontos-corridos' | 'misto'; // New
}

export interface Champion {
  id: string;
  teamName: string;
  captainName: string;
  date: string;
  tournamentType: string;
  logo?: string;
  players?: Player[];
  ownerId?: string; // For Manager context
}

export interface Top11Player {
  name: string;
  stars: number;
  photo?: string;
  x?: number; // Percentage X coordinate (0-100)
  y?: number; // Percentage Y coordinate (0-100)
  customPositionLabel?: string; // New: Editable position label
  stats?: {
    stars: number;
    trophies: number;
    captainCount: number;
    wins?: number; // New
    goals?: number; // New
  };
  team?: string;
}

export type Top11Data = Record<string, Top11Player>;

export interface AppConfig {
  panelName: string;
  panelLogo: string;
  headerBackgroundImage?: string; 
  headerIllustrationLeft?: string;
  headerIllustrationRight?: string;
  activeTournamentName: string;
  activeTournamentType: string;
  championTeam: string;
  championCaptain: string;
  championLogo?: string;
  selectionTitle: string; 
  
  // Login Screen
  loginBackgroundImage?: string;
  
  // Links
  socialLinks?: {
      instagram?: string;
      twitter?: string;
      discord?: string;
      youtube?: string;
      tiktok?: string;
      twitch?: string;
      kick?: string;
      facebook?: string;
  };

  // Custom Logos for Socials
  socialLogos?: {
      instagram?: string;
      twitter?: string;
      discord?: string;
      youtube?: string;
      tiktok?: string;
      twitch?: string;
      kick?: string;
      facebook?: string;
  };
  
  footerText?: string;
  sponsors?: string[];

  // Ranking Screen decorations
  rankingDecorations?: {
      left?: string;
      right?: string;
  };
  
  ownerId?: string; // For Manager context
}

// Auth Types
export type UserRole = 'admin' | 'manager' | 'user' | 'guest';

export interface User {
  id: string;
  username: string;
  email?: string;
  phone?: string; 
  password?: string;
  nickname: string;
  position: string[]; // Changed to Array
  currentTeam: string;
  registeredTournamentType?: string; // Context context
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  
  // Manager/Owner Specific
  ownerId?: string; // ID of the Manager this user belongs to (if role=user)
  
  // Profile Images
  avatar?: string;     // New: Profile Picture
  teamLogo?: string;   // New: Team Logo
  
  // Stats
  stats?: {
    stars: number;
    trophies: number;
    captainCount: number;
  };
  
  // Branding (For Managers)
  tournamentLogo?: string;
  customPanelName?: string;
}

export interface AuthSession {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
}

export type AppTheme = 'cyberpunk' | 'green' | 'red' | 'gold' | 'blue' | 'fc' | 'efootball' | 'ufl' | 'champions' | 'europa' | 'worldcup' | 'mundial';

export interface HallOfFameEntry {
    id: string;
    name: string;
    description: string;
    photo: string;
    date: string;
}

// --- Bracket System Types ---
export interface MatchTeam {
  id: string | null; // null if TBD
  name: string;
  logo?: string;
  score?: number;
  isWinner?: boolean;
}

export interface Match {
  id: string;
  roundId: number; // 1 = Finals, 2 = Semis, etc (or ascending 0=Round of 16)
  nextMatchId: string | null; // ID of the match the winner goes to
  teamA: MatchTeam;
  teamB: MatchTeam;
  status: 'scheduled' | 'live' | 'completed';
}

export interface Bracket {
  id: string;
  name: string;
  createdAt: string;
  status: 'active' | 'completed';
  matches: Match[];
  ownerId?: string; // For Manager context
}
export interface TournamentRegistration {
    id: string;
    userId: string;
    tournamentConfigId: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}
