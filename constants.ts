import { Channel, Contact, User } from './types';

// Usuário padrão inicial (será salvo no storage na primeira execução)
export const INITIAL_USER: User = {
  id: 'u1',
  name: 'Novo Usuário',
  avatar: 'https://ui-avatars.com/api/?name=Novo+Usuario&background=0D8ABC&color=fff',
  status: 'online',
  statusMessage: 'Bem-vindo ao Nexus!',
  plan: 'free'
};

export const MOCK_USERS: User[] = []; // Começa vazio, usuário adiciona membros depois (simulado)

export const INITIAL_CHANNELS: Channel[] = []; // Começa vazio

export const INITIAL_CONTACTS: Contact[] = []; // Começa vazio
