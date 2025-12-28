
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT',
  CRM = 'CRM',
  SETTINGS = 'SETTINGS',
  BOT_STUDIO = 'BOT_STUDIO'
}

export type PlanType = 'free' | 'premium';

export interface ThemeSettings {
  primaryColor: string;
  sidebarColor: string;
  logoUrl?: string;
  appName?: string; // Novo: Nome do App customizável
}

export interface User {
  id: string;
  name: string;
  email?: string; // Novo: Email para login
  password?: string; // Novo: Senha (simulada)
  avatar: string;
  status: 'online' | 'offline' | 'busy';
  statusMessage?: string;
  plan: PlanType;
  theme?: ThemeSettings;
  hasSeenTutorial?: boolean; // Novo: Flag para tutorial
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isAiGenerated?: boolean;
  type?: 'text' | 'image' | 'file';
  fileUrl?: string;
}

export interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'dm';
  messages: Message[];
  description?: string;
  notificationsEnabled: boolean;
}

export enum DealStage {
  LEAD = 'Novo Lead',
  CONTACTED = 'Contactado',
  PROPOSAL = 'Proposta',
  NEGOTIATION = 'Negociação',
  WON = 'Fechado',
  LOST = 'Perdido'
}

export interface Contact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  value: number;
  stage: DealStage;
  lastActivity: Date;
  notes: string;
  ticketId?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface BotConfig {
  name: string;
  role: 'auditor' | 'assistant' | 'manager';
  personality: string;
  focusAreas: string[];
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  action: string;
  details: string;
  userId: string;
}
