import React, { useState, useEffect } from 'react';
import { AppView, Channel, Contact, Message, User } from './types';
import { StorageService } from './services/storageService';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { CRMView } from './components/CRMView';
import { DashboardView } from './components/DashboardView';
import { SettingsView } from './components/SettingsView';
import { BotStudioView } from './components/BotStudioView';
import { AuthView } from './components/AuthView';
import { X, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // New state for goodbye screen
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  
  // State loaded from Storage
  const [user, setUser] = useState<User | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  
  const [activeChannelId, setActiveChannelId] = useState<string>('');
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');

  // Load Data on Mount
  useEffect(() => {
    // Request Notification Permission
    if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
    }

    // Check Session
    const currentUser = StorageService.getCurrentUser();
    if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        loadAppData();
    }
    setLoading(false);
  }, []);

  const loadAppData = () => {
    const loadedChannels = StorageService.getChannels();
    const loadedContacts = StorageService.getContacts();

    setChannels(loadedChannels);
    setContacts(loadedContacts);
    
    if (loadedChannels.length > 0) {
      setActiveChannelId(loadedChannels[0].id);
    }
  };

  // Save Data on Change (Only if authenticated)
  useEffect(() => { if(!loading && isAuthenticated && user) StorageService.updateUser(user); }, [user, loading, isAuthenticated]);
  useEffect(() => { if(!loading && isAuthenticated) StorageService.saveChannels(channels); }, [channels, loading, isAuthenticated]);
  useEffect(() => { if(!loading && isAuthenticated) StorageService.saveContacts(contacts); }, [contacts, loading, isAuthenticated]);

  const activeChannel = channels.find(c => c.id === activeChannelId);

  // --- Helpers ---
  const sendNotification = (title: string, body: string) => {
      if ("Notification" in window && Notification.permission === "granted") {
          new Notification(title, { body, icon: '/vite.svg' });
      }
  };

  // --- Handlers ---

  const handleLoginSuccess = (loggedInUser: User) => {
      setUser(loggedInUser);
      setIsAuthenticated(true);
      loadAppData();
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
        StorageService.logout();
        setUser(null);
        setIsAuthenticated(false);
        setIsLoggingOut(false);
        setCurrentView(AppView.DASHBOARD); // Reset view
    }, 2000); // 2 seconds delay for goodbye screen
  };

  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    // Limite removido para permitir acesso aos recursos principais na versão free
    
    const newChannel: Channel = {
        id: `c-${Date.now()}`,
        name: newChannelName.toLowerCase().replace(/\s+/g, '-'),
        type: 'public',
        description: 'Novo canal',
        messages: [],
        notificationsEnabled: true
    };
    
    const updatedChannels = [...channels, newChannel];
    setChannels(updatedChannels);
    setActiveChannelId(newChannel.id);
    setShowCreateChannel(false);
    setNewChannelName('');
    if(user) StorageService.logAction('CREATE_CHANNEL', `Canal criado: #${newChannel.name}`, user.id);
  };

  const handleSendMessage = (channelId: string, content: string) => {
    if (!user) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      content,
      timestamp: new Date(),
    };

    const updatedChannels = channels.map(ch => {
      if (ch.id === channelId) {
        return { ...ch, messages: [...ch.messages, newMessage] };
      }
      return ch;
    });
    setChannels(updatedChannels);
    StorageService.logAction('SEND_MESSAGE', `Mensagem enviada para ${channelId}`, user.id);

    // Simulação de Resposta Automática + Notificação (Para testar o recurso)
    // Em um app real, isso viria de um WebSocket
    setTimeout(() => {
        const replyMessage: Message = {
            id: Date.now().toString(),
            senderId: 'bot-system', // ID fictício
            content: `Resposta automática: Recebemos "${content}".`,
            timestamp: new Date(),
        };

        setChannels(prevChannels => {
            const newChs = prevChannels.map(ch => {
                 if (ch.id === channelId) {
                    // Dispara notificação se habilitado e usuário não estiver focado (simulado aqui sempre)
                    if(ch.notificationsEnabled) {
                        sendNotification(`Nova mensagem em #${ch.name}`, replyMessage.content);
                        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2346/2346-preview.mp3');
                        audio.volume = 0.5;
                        audio.play().catch(() => {}); // Ignora erro de autoplay
                    }
                    return { ...ch, messages: [...ch.messages, replyMessage] };
                 }
                 return ch;
            });
            return newChs;
        });
    }, 3000);
  };

  const handleToggleNotifications = (channelId: string) => {
      const updatedChannels = channels.map(ch => {
          if (ch.id === channelId) return { ...ch, notificationsEnabled: !ch.notificationsEnabled };
          return ch;
      });
      setChannels(updatedChannels);
  };

  const handleAddContact = (newContactData: Omit<Contact, 'id' | 'lastActivity'>) => {
    // Limite removido para permitir uso robusto do CRM no Free
    
    const newContact: Contact = {
      ...newContactData,
      id: `ct-${Date.now()}`,
      lastActivity: new Date()
    };
    setContacts(prev => [...prev, newContact]);
    if(user) StorageService.logAction('CREATE_CONTACT', `Contato criado: ${newContact.name}`, user.id);
  };

  const handleUpdateContact = (updatedContact: Contact) => {
    setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
  };

  const handleUpdateUser = (updatedUser: User) => {
      setUser(updatedUser);
  };

  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white">Carregando...</div>;

  // Goodbye Screen
  if (isLoggingOut) {
    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white animate-fade-in">
            <LogOut className="w-16 h-16 mb-4 text-blue-500 animate-bounce" />
            <h2 className="text-3xl font-bold mb-2">Até logo!</h2>
            <p className="text-slate-400">Sincronizando dados e desconectando...</p>
        </div>
    );
  }

  if (!isAuthenticated || !user) {
      return <AuthView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen w-screen bg-slate-900">
      <Sidebar 
        currentView={currentView}
        onChangeView={setCurrentView}
        channels={channels}
        activeChannelId={activeChannelId}
        onSelectChannel={(id) => { setActiveChannelId(id); setCurrentView(AppView.CHAT); }}
        user={user}
        onCreateChannel={() => setShowCreateChannel(true)}
      />
      
      <main className="flex-1 h-full bg-white relative rounded-l-2xl overflow-hidden shadow-2xl">
        {currentView === AppView.DASHBOARD && (
          <DashboardView contacts={contacts} />
        )}

        {currentView === AppView.CHAT && activeChannel && (
          <ChatView 
            channel={activeChannel}
            users={[{id: 'bot-system', name: 'Nexus Bot', avatar: 'https://ui-avatars.com/api/?name=Bot&background=000&color=fff', status: 'online', plan: 'premium'}]} 
            onSendMessage={handleSendMessage}
            onToggleNotifications={handleToggleNotifications}
            user={user}
          />
        )}

        {currentView === AppView.CHAT && !activeChannel && (
             <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <h2 className="text-xl font-bold mb-2">Bem-vindo ao {user.theme?.appName || 'Nexus'}!</h2>
                <p className="mb-4">Você ainda não tem canais.</p>
                <button onClick={() => setShowCreateChannel(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Criar Primeiro Canal</button>
             </div>
        )}
        
        {currentView === AppView.CRM && (
          <CRMView 
            contacts={contacts}
            onUpdateContact={handleUpdateContact}
            onAddContact={handleAddContact}
          />
        )}

        {currentView === AppView.BOT_STUDIO && (
            <BotStudioView contacts={contacts} channels={channels} />
        )}

        {currentView === AppView.SETTINGS && (
            <SettingsView user={user} onUpdateUser={handleUpdateUser} onLogout={handleLogout} />
        )}
      </main>

      {/* Modal Criar Canal */}
      {showCreateChannel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800">Novo Canal</h3>
                    <button onClick={() => setShowCreateChannel(false)}><X className="w-5 h-5 text-slate-400" /></button>
                </div>
                <form onSubmit={handleCreateChannel}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Canal</label>
                    <input 
                        autoFocus
                        type="text" 
                        value={newChannelName}
                        onChange={e => setNewChannelName(e.target.value)}
                        placeholder="ex: projetos-2024"
                        className="w-full px-3 py-2 border rounded-lg mb-4"
                        required
                    />
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setShowCreateChannel(false)} className="px-4 py-2 text-slate-600">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Criar</button>
                    </div>
                </form>
             </div>
        </div>
      )}
    </div>
  );
};

export default App;
