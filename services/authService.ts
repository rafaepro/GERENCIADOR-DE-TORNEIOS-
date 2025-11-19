
import { User, AuthSession } from '../types';

const STORAGE_KEYS = {
  USERS: 'tmp_users',
  SESSION: 'tmp_session'
};

const DEFAULT_ADMIN: User = {
  id: 'admin-main',
  username: 'Admin',
  password: 'Admintrihard', 
  nickname: 'Administrador',
  email: 'admin@system.com',
  position: ['Staff'],
  currentTeam: 'System',
  role: 'admin',
  isActive: true,
  createdAt: new Date().toISOString()
};

// Temporary storage for reset codes (in memory for simulation)
const resetCodes = new Map<string, string>();

export const authService = {
  initialize: () => {
    const users = authService.getUsers();
    // Case insensitive check for admin existence
    const adminIndex = users.findIndex(u => u.username.toLowerCase() === DEFAULT_ADMIN.username.toLowerCase());
    
    if (adminIndex === -1) {
      // Create default admin if not exists
      const migratedUsers = users.map(u => ({
          ...u,
          position: Array.isArray(u.position) ? u.position : [u.position]
      }));
      migratedUsers.push(DEFAULT_ADMIN);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(migratedUsers));
    } else {
      // Ensure admin credentials are up to date (Force the correct password if it changed in code)
      // Also migrate positions for everyone
      const updated = users.map((u, idx) => {
          if (idx === adminIndex) {
              // Preserve some admin fields if needed, but enforce critical ones from code
              return { 
                  ...u, 
                  password: DEFAULT_ADMIN.password, 
                  role: 'admin',
                  username: DEFAULT_ADMIN.username // Enforce canonical casing 'Admin'
              };
          }
          return { ...u, position: Array.isArray(u.position) ? u.position : [u.position] };
      });
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
    }
  },

  getUsers: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    const users = data ? JSON.parse(data) : [];
    // Runtime migration check for read
    return users.map((u: any) => ({
        ...u,
        position: Array.isArray(u.position) ? u.position : [u.position]
    }));
  },

  getAvailableManagers: (): {id: string, name: string}[] => {
    const users = authService.getUsers();
    return users
        .filter(u => u.role === 'manager' && u.isActive)
        .map(u => ({ id: u.id, name: u.nickname || u.username }));
  },

  register: (userData: Omit<User, 'id' | 'isActive' | 'createdAt'>): { success: boolean; message: string } => {
    const users = authService.getUsers();
    
    if (users.find(u => u.username.toLowerCase() === userData.username.toLowerCase())) {
      return { success: false, message: 'Usuário já existe' };
    }
    
    if (userData.email && users.find(u => u.email?.toLowerCase() === userData.email?.toLowerCase())) {
      return { success: false, message: 'Email já cadastrado' };
    }

    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      isActive: userData.role === 'manager' ? false : true,
      createdAt: new Date().toISOString(),
      stats: { stars: 0, trophies: 0, captainCount: 0 }
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return { success: true, message: 'Cadastro realizado com sucesso!' };
  },

  login: (username: string, password?: string): { success: boolean; session?: AuthSession; message?: string } => {
    const users = authService.getUsers();
    // Case insensitive username match, case sensitive password
    // Also trims inputs just in case passed untrimmed
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password?.trim();

    const user = users.find(u => u.username.toLowerCase() === cleanUsername && u.password === cleanPassword);

    if (user) {
      if (!user.isActive) {
        return { success: false, message: 'Conta aguardando aprovação ou bloqueada pelo admin.' };
      }
      const session: AuthSession = { user, isAuthenticated: true, isGuest: false };
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
      return { success: true, session };
    }
    return { success: false, message: 'Login ou Senha incorretos.' };
  },

  loginAsGuest: (): AuthSession => {
    const session: AuthSession = { 
      user: { 
        id: 'guest', username: 'guest', nickname: 'Visitante', 
        position: ['Visitante'], currentTeam: '', role: 'guest', isActive: true, createdAt: '' 
      }, 
      isAuthenticated: true, 
      isGuest: true 
    };
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    return session;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  getSession: (): AuthSession | null => {
    const data = localStorage.getItem(STORAGE_KEYS.SESSION);
    return data ? JSON.parse(data) : null;
  },

  // Password Reset Flow
  requestPasswordReset: (username: string, contact: string): { success: boolean; message: string; debugCode?: string } => {
    const users = authService.getUsers();
    
    // Normalize for comparison
    const cleanUser = username.trim().toLowerCase();
    // Remove ALL non-digits to compare raw numbers (handles spaces, dashes, parens)
    const cleanContactInput = contact.replace(/\D/g, ''); 
    const isEmail = contact.includes('@');

    // Check if username matches AND either email OR phone matches the contact info
    const user = users.find(u => {
        const matchUser = u.username.toLowerCase() === cleanUser;
        
        let matchContact = false;
        if (isEmail) {
             matchContact = u.email?.toLowerCase() === contact.trim().toLowerCase();
        } else {
             // Compare raw digits of stored phone vs input phone
             const storedPhoneRaw = u.phone?.replace(/\D/g, '') || '';
             // Check if input is part of stored (or vice versa) to handle country codes roughly
             matchContact = storedPhoneRaw === cleanContactInput || (storedPhoneRaw.length > 6 && cleanContactInput.length > 6 && storedPhoneRaw.endsWith(cleanContactInput));
        }
        
        return matchUser && matchContact;
    });
    
    if (!user) {
        return { success: false, message: 'Dados não conferem. Verifique se o Usuário e o Celular/Email estão idênticos ao cadastro.' };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    resetCodes.set(username, code);
    
    // Removed alert, purely returning debugCode for UI display
    console.log(`[SIMULAÇÃO SISTEMA] Código para ${username}: ${code}`);
    
    return { success: true, message: 'Código enviado!', debugCode: code };
  },

  verifyResetCode: (username: string, code: string): boolean => {
    return resetCodes.get(username) === code;
  },

  completePasswordReset: (username: string, newPassword: string): { success: boolean; message: string } => {
    const users = authService.getUsers();
    const userIndex = users.findIndex(u => u.username === username);
    if(userIndex > -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        resetCodes.delete(username);
        return { success: true, message: 'Senha alterada com sucesso!' };
    }
    return { success: false, message: 'Erro ao alterar senha.' };
  },

  // Admin & User Management
  updateUser: (userId: string, updates: Partial<User>): User | null => {
      const users = authService.getUsers();
      const idx = users.findIndex(u => u.id === userId);
      if(idx > -1) {
          users[idx] = { ...users[idx], ...updates };
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
          
          // Update session if it's the logged in user
          const session = authService.getSession();
          if(session && session.user?.id === userId) {
              session.user = users[idx];
              localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
          }
          
          return users[idx];
      }
      return null;
  },

  resetUserStats: (userId: string) => {
      const users = authService.getUsers();
      const idx = users.findIndex(u => u.id === userId);
      if(idx > -1) {
          users[idx].stats = { stars: 0, trophies: 0, captainCount: 0 };
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
          return users;
      }
      return users;
  },

  resetGroupStats: (tournamentType: string) => {
      const users = authService.getUsers();
      const updatedUsers = users.map(u => {
          if(u.registeredTournamentType === tournamentType) {
              return { ...u, stats: { stars: 0, trophies: 0, captainCount: 0 } };
          }
          return u;
      });
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
      return updatedUsers;
  },

  toggleUserStatus: (userId: string) => {
    const users = authService.getUsers();
    const updatedUsers = users.map(u => {
      if (u.id === userId && u.role !== 'admin') {
        return { ...u, isActive: !u.isActive };
      }
      return u;
    });
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
    return updatedUsers;
  },

  deleteUser: (userId: string) => {
    const users = authService.getUsers();
    const filtered = users.filter(u => u.id !== userId || u.username === DEFAULT_ADMIN.username);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
    return filtered;
  }
};
