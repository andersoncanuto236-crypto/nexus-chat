import { AuditLog, Channel, Contact, User } from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: 'nexus_current_user', // Sessão ativa
  USERS_DB: 'nexus_users_db', // Simulação de banco de dados
  CHANNELS: 'nexus_channels',
  CONTACTS: 'nexus_contacts',
  AUDIT: 'nexus_audit_logs',
  API_KEY: 'nexus_api_key'
};

const dateReviver = (key: string, value: any) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value);
  }
  return value;
};

export const StorageService = {
  // --- Auth & Users ---
  
  registerUser: (user: User) => {
    const usersStr = localStorage.getItem(STORAGE_KEYS.USERS_DB);
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];
    
    if (users.find(u => u.email === user.email)) {
      throw new Error('Email já cadastrado.');
    }

    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  },

  loginUser: (email: string, pass: string): User => {
    const usersStr = localStorage.getItem(STORAGE_KEYS.USERS_DB);
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];
    
    const user = users.find(u => u.email === email && u.password === pass);
    if (!user) throw new Error('Credenciais inválidas.');

    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  updateUser: (updatedUser: User) => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
    
    const usersStr = localStorage.getItem(STORAGE_KEYS.USERS_DB);
    if (usersStr) {
      const users: User[] = JSON.parse(usersStr);
      const newUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
      localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(newUsers));
    }
  },

  // --- Premium Activation ---
  
  validateActivationCode: (code: string): boolean => {
    // Simulação de códigos válidos gerados pelo Adm
    const validCodes = ['NEXUS-PRO-2025', 'VIP-CLIENT-X', 'ADMIN-UNLOCK'];
    return validCodes.includes(code.toUpperCase());
  },

  // --- App Data ---

  saveChannels: (channels: Channel[]) => localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels)),
  getChannels: (): Channel[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CHANNELS);
    return data ? JSON.parse(data, dateReviver) : [];
  },

  saveContacts: (contacts: Contact[]) => localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts)),
  getContacts: (): Contact[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    return data ? JSON.parse(data, dateReviver) : [];
  },

  saveApiKey: (key: string) => localStorage.setItem(STORAGE_KEYS.API_KEY, key),
  getApiKey: (): string | null => localStorage.getItem(STORAGE_KEYS.API_KEY),

  logAction: (action: string, details: string, userId: string) => {
    const newLog: AuditLog = {
      id: Date.now().toString() + Math.random().toString().slice(2, 5),
      timestamp: new Date(),
      action,
      details,
      userId
    };
    const existing: AuditLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT) || '[]', dateReviver);
    const updated = [newLog, ...existing];
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(updated));
  },
  getAuditLogs: (): AuditLog[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT) || '[]', dateReviver);
  }
};
