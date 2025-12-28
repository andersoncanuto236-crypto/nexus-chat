
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
  appName?: string; // Nome do App customizável
  companyName?: string; // Nome da Empresa (Servidor)
}

export interface User {
  id: string;
  name: string;
  email?: string;
  password?: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
  statusMessage?: string;
  plan: PlanType;
  theme?: ThemeSettings;
  hasSeenTutorial?: boolean;
  isAdmin?: boolean; // Flag para Super Admin
}

export interface Server {
    id: string;
    name: string;
    type: 'cloud' | 'local'; // Novo: Tipo de infraestrutura
    connectionUrl?: string; // IP ou URL
    ownerEmail: string;
    userCount: number;
    paymentStatus: 'paid' | 'overdue' | 'trial';
    lastActive: Date;
    avatar: string;
    apiKey?: string;
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
  members?: string[]; // IDs dos membros com acesso
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
