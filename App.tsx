
import React, { useState, useEffect } from 'react';
import { AppView, Channel, Contact, DealStage, Message, User, Server } from './types';
import { StorageService } from './services/storageService';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { CRMView } from './components/CRMView';
import { DashboardView } from './components/DashboardView';
import { SettingsView } from './components/SettingsView';
import { BotStudioView } from './components/BotStudioView';
import { AuthView } from './components/AuthView';
import { OnboardingModal } from './components/OnboardingModal';
import { X, LogOut, Copy, Check, Users, Lock, Server as ServerIcon, Cloud, HardDrive, Wifi, ShieldCheck, Activity } from 'lucide-react';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  
  // UI State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // State loaded from Storage
  const [user, setUser] = useState<User | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [workspaceUsers, setWorkspaceUsers] = useState<User[]>([]); 
  const [servers, setServers] = useState<Server[]>([]); // Dynamic Servers
  
  const [activeChannelId, setActiveChannelId] = useState<string>('');
  const [activeServerId, setActiveServerId] = useState<string>('');
  
  // Modals State
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddServerModal, setShowAddServerModal] = useState(false); // New

  // Forms
  const [newChannelName, setNewChannelName] = useState('');
  const [isPrivateChannel, setIsPrivateChannel] = useState(false);
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);

  // Server Form
  const [serverForm, setServerForm] = useState({
      name: '',
      type: 'cloud' as 'cloud' | 'local',
      connectionUrl: '',
      licenseKey: ''
  });
  const [serverConnectionStatus, setServerConnectionStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');

  // Load Data on Mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
    }

    const currentUser = StorageService.getCurrentUser();
    if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        loadAppData(currentUser);
        if (currentUser.hasSeenTutorial === false || currentUser.hasSeenTutorial === undefined) {
            setShowOnboarding(true);
        }
    }
    setLoading(false);
  }, []);

  const loadAppData = (currentUser: User) => {
    const loadedChannels = StorageService.getChannels();
    const loadedContacts = StorageService.getContacts();
    const loadedServers = StorageService.getServers();

    // Setup User list
    const systemBot: User = {id: 'bot-system', name: 'Nexus Bot', avatar: 'https://ui-avatars.com/api/?name=Bot&background=000&color=fff', status: 'online', plan: 'premium'};
    const storedUsers = localStorage.getItem('nexus_workspace_users');
    const extraUsers = storedUsers ? JSON.parse(storedUsers) : [];

    setWorkspaceUsers([systemBot, ...extraUsers]);
    setChannels(loadedChannels);
    setContacts(loadedContacts);
    setServers(loadedServers);
    
    // Default Selection
    if (loadedChannels.length > 0) setActiveChannelId(loadedChannels[0].id);
    if (loadedServers.length > 0) setActiveServerId(loadedServers[0].id);
  };

  useEffect(() => { if(!loading && isAuthenticated && user) StorageService.updateUser(user); }, [user, loading, isAuthenticated]);
  useEffect(() => { if(!loading && isAuthenticated) StorageService.saveChannels(channels); }, [channels, loading, isAuthenticated]);
  useEffect(() => { if(!loading && isAuthenticated) StorageService.saveContacts(contacts); }, [contacts, loading, isAuthenticated]);

  const activeChannel = channels.find(c => c.id === activeChannelId);

  const sendNotification = (title: string, body: string) => {
      if ("Notification" in window && Notification.permission === "granted") {
          new Notification(title, { body, icon: '/vite.svg' });
      }
  };

  const handleLoginSuccess = (loggedInUser: User) => {
      setUser(loggedInUser);
      setIsAuthenticated(true);
      loadAppData(loggedInUser);
      if (loggedInUser.hasSeenTutorial === false || loggedInUser.hasSeenTutorial === undefined) {
          setShowOnboarding(true);
      }
  };

  const handleFinishOnboarding = () => {
      setShowOnboarding(false);
      if (user) {
          const updatedUser = { ...user, hasSeenTutorial: true };
          setUser(updatedUser);
          StorageService.updateUser(updatedUser);
      }
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
        StorageService.logout();
        setUser(null);
        setIsAuthenticated(false);
        setIsLoggingOut(false);
        setCurrentView(AppView.DASHBOARD);
    }, 2000);
  };

  // --- Server Logic ---
  const handleAddServerSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setServerConnectionStatus('checking');

      // Simulating connection check
      setTimeout(() => {
          if (!serverForm.name) {
              setServerConnectionStatus('error');
              return;
          }

          const newServer: Server = {
              id: `srv-${Date.now()}`,
              name: serverForm.name,
              type: serverForm.type,
              connectionUrl: serverForm.connectionUrl,
              ownerEmail: user?.email || '',
              userCount: 1,
              paymentStatus: 'paid', // Default for new creates
              lastActive: new Date(),
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(serverForm.name)}&background=random`
          };
          
          const updatedList = StorageService.saveServer(newServer);
          setServers(updatedList);
          setActiveServerId(newServer.id);
          setServerConnectionStatus('success');
          
          setTimeout(() => {
              setShowAddServerModal(false);
              setServerConnectionStatus('idle');
              setServerForm({ name: '', type: 'cloud', connectionUrl: '', licenseKey: '' });
          }, 1000);

      }, 1500);
  };

  // --- Channel & Group Creation ---
  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if(!user) return;

    const newChannel: Channel = {
        id: `c-${Date.now()}`,
        name: newChannelName.toLowerCase().replace(/\s+/g, '-'),
        type: isPrivateChannel ? 'private' : 'public',
        description: isPrivateChannel ? 'Grupo Privado' : 'Canal Aberto',
        messages: [],
        notificationsEnabled: true,
        members: [user.id] // Creator is always a member
    };
    
    const updatedChannels = [...channels, newChannel];
    setChannels(updatedChannels);
    setActiveChannelId(newChannel.id);
    setShowCreateChannel(false);
    setNewChannelName('');
    setIsPrivateChannel(false);
    StorageService.logAction('CREATE_CHANNEL', `Canal criado: #${newChannel.name} (${newChannel.type})`, user.id);
  };

  // --- Invite Logic ---
  const handleInviteUser = (e: React.FormEvent) => {
      e.preventDefault();
      if(!inviteEmail) return;

      const nameFromEmail = inviteEmail.split('@')[0];
      const newUser: User = {
          id: `u-${Date.now()}`,
          name: nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1),
          email: inviteEmail,
          avatar: `https://ui-avatars.com/api/?name=${nameFromEmail}&background=random`,
          status: 'offline',
          plan: 'free'
      };

      const updatedUsers = [...workspaceUsers, newUser];
      setWorkspaceUsers(updatedUsers);
      localStorage.setItem('nexus_workspace_users', JSON.stringify(updatedUsers.filter(u => u.id !== 'bot-system'))); // Persist mock users
      
      alert(`Convite enviado para ${inviteEmail}. O usuário foi adicionado ao workspace (simulado).`);
      setInviteEmail('');
      setShowInviteModal(false);
  };

  const copyInviteLink = () => {
      const serverId = user?.theme?.companyName?.toLowerCase().replace(/\s/g, '-') || 'server';
      const link = `https://nexus-chat.app/join/${serverId}-${Math.floor(Math.random()*1000)}`;
      navigator.clipboard.writeText(link);
      setInviteLinkCopied(true);
      setTimeout(() => setInviteLinkCopied(false), 2000);
  };

  // --- Chat & CRM Handlers ---
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

    // --- Smart Bot Response Logic ---
    const lowerContent = content.toLowerCase();
    const isBotTrigger = lowerContent.includes('bot') || lowerContent.includes('ajuda') || lowerContent.includes('status') || lowerContent.includes('nexus');
    
    if (isBotTrigger) {
        setTimeout(() => {
            let botResponseText = "Estou ouvindo! Como posso ajudar?";
            if (lowerContent.includes('ajuda')) {
                botResponseText = "Comandos disponíveis:\n- 'Status': Ver resumo do pipeline\n- 'CRM': Ir para vendas\n- 'Bot': Chamar atenção";
            } else if (lowerContent.includes('status') || lowerContent.includes('resumo')) {
                const totalDeals = contacts.length;
                const totalValue = contacts.reduce((acc, c) => acc + c.value, 0);
                botResponseText = `📊 **Status Atual:**\n- Temos ${totalDeals} deals ativos.\n- Valor total em pipeline: R$ ${totalValue.toLocaleString('pt-BR')}.\n- Foco total em fechar!`;
            } else if (lowerContent.includes('oi') || lowerContent.includes('olá')) {
                botResponseText = `Olá, ${user.name}! Tudo pronto para vender hoje?`;
            }

            const replyMessage: Message = {
                id: Date.now().toString(),
                senderId: 'bot-system', 
                content: botResponseText,
                timestamp: new Date(),
            };

            setChannels(prevChannels => {
                const newChs = prevChannels.map(ch => {
                    if (ch.id === channelId) {
                        if(ch.notificationsEnabled) {
                            sendNotification(`Nexus Bot em #${ch.name}`, replyMessage.content);
                            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2346/2346-preview.mp3');
                            audio.volume = 0.5;
                            audio.play().catch(() => {}); 
                        }
                        return { ...ch, messages: [...ch.messages, replyMessage] };
                    }
                    return ch;
                });
                return newChs;
            });
        }, 1500);
    }
  };

  const handleToggleNotifications = (channelId: string) => {
      const updatedChannels = channels.map(ch => {
          if (ch.id === channelId) return { ...ch, notificationsEnabled: !ch.notificationsEnabled };
          return ch;
      });
      setChannels(updatedChannels);
  };

  const handleAddMemberToChannel = (channelId: string, userId: string) => {
    const updatedChannels = channels.map(ch => {
      if (ch.id === channelId) {
        const currentMembers = ch.members || [];
        if (!currentMembers.includes(userId)) {
          return { ...ch, members: [...currentMembers, userId] };
        }
      }
      return ch;
    });
    setChannels(updatedChannels);
  };

  const handleAddContact = (newContactData: Omit<Contact, 'id' | 'lastActivity'>) => {
    const newContact: Contact = {
      ...newContactData,
      id: `ct-${Date.now()}`,
      lastActivity: new Date()
    };
    setContacts(prev => [...prev, newContact]);
    if(user) StorageService.logAction('CREATE_CONTACT', `Contato criado: ${newContact.name}`, user.id);
  };

  const handleUpdateContact = (updatedContact: Contact) => {
    const oldContact = contacts.find(c => c.id === updatedContact.id);
    const isDealWon = oldContact && oldContact.stage !== DealStage.WON && updatedContact.stage === DealStage.WON;

    setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));

    if (isDealWon && channels.length > 0) {
        const announcementChannelId = channels[0].id;
        const valueFormatted = updatedContact.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        
        const announcementMsg: Message = {
            id: Date.now().toString(),
            senderId: 'bot-system',
            content: `🎉 **PARABÉNS EQUIPE!** 🎉\n\nO contrato com **${updatedContact.company}** foi fechado!\nValor: **${valueFormatted}**\nResponsável: ${user?.name}`,
            timestamp: new Date()
        };

        setChannels(prev => prev.map(ch => {
            if (ch.id === announcementChannelId) {
                 const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
                 audio.volume = 0.6;
                 audio.play().catch(() => {});
                 sendNotification("Novo Contrato Fechado!", `Valor: ${valueFormatted}`);
                 return { ...ch, messages: [...ch.messages, announcementMsg] };
            }
            return ch;
        }));
    }
  };

  const handleUpdateUser = (updatedUser: User) => {
      setUser(updatedUser);
  };

  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white">Carregando...</div>;

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
      {showOnboarding && <OnboardingModal onFinish={handleFinishOnboarding} userName={user.name} />}
      
      <Sidebar 
        currentView={currentView}
        onChangeView={setCurrentView}
        channels={channels}
        activeChannelId={activeChannelId}
        onSelectChannel={(id) => { setActiveChannelId(id); setCurrentView(AppView.CHAT); }}
        user={user}
        onCreateChannel={() => setShowCreateChannel(true)}
        onInviteMember={() => setShowInviteModal(true)}
        // Server Props
        servers={servers}
        activeServerId={activeServerId}
        onSelectServer={(s) => setActiveServerId(s.id)}
        onAddServer={() => setShowAddServerModal(true)}
        // Sidebar State
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <main className="flex-1 h-full bg-white relative rounded-l-2xl overflow-hidden shadow-2xl transition-all">
        {currentView === AppView.DASHBOARD && (
          <DashboardView contacts={contacts} />
        )}

        {currentView === AppView.CHAT && activeChannel && (
          <ChatView 
            channel={activeChannel}
            users={[user, ...workspaceUsers]} 
            onSendMessage={handleSendMessage}
            onToggleNotifications={handleToggleNotifications}
            onAddMember={handleAddMemberToChannel}
            user={user}
          />
        )}

        {currentView === AppView.CHAT && !activeChannel && (
             <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <h2 className="text-xl font-bold mb-2">Bem-vindo ao {user.theme?.companyName || 'Workspace'}!</h2>
                <p className="mb-4">Este é seu servidor privado e seguro.</p>
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

      {/* Modal Criar Canal / Grupo */}
      {showCreateChannel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800">Criar Nova Sala</h3>
                    <button onClick={() => setShowCreateChannel(false)}><X className="w-5 h-5 text-slate-400" /></button>
                </div>
                <form onSubmit={handleCreateChannel}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Canal</label>
                        <input 
                            autoFocus
                            type="text" 
                            value={newChannelName}
                            onChange={e => setNewChannelName(e.target.value)}
                            placeholder="ex: vendas-q1 ou projeto-alpha"
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                        />
                    </div>
                    
                    <div className="mb-6">
                        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                            <input 
                                type="checkbox" 
                                checked={isPrivateChannel}
                                onChange={e => setIsPrivateChannel(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <div className="flex-1">
                                <span className="block text-sm font-semibold text-slate-800 flex items-center gap-2">
                                    <Lock className="w-3 h-3" /> Grupo Privado
                                </span>
                                <span className="block text-xs text-slate-500">Apenas convidados podem ver.</span>
                            </div>
                        </label>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setShowCreateChannel(false)} className="px-4 py-2 text-slate-600">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">Criar Sala</button>
                    </div>
                </form>
             </div>
        </div>
      )}

      {/* Modal Convidar Pessoas */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-slate-800 text-lg">Convidar para o Servidor</h3>
                    <button onClick={() => setShowInviteModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
                </div>
                <p className="text-sm text-slate-500 mb-6">Adicione pessoas ao <strong>{user?.theme?.companyName}</strong>. Elas terão acesso aos canais públicos.</p>
                
                <form onSubmit={handleInviteUser}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email do Colaborador</label>
                        <input 
                            type="email" 
                            value={inviteEmail}
                            onChange={e => setInviteEmail(e.target.value)}
                            placeholder="colega@empresa.com"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>
                    
                    <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 mb-4">
                        Enviar Convite
                    </button>
                </form>

                <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink-0 mx-4 text-xs text-slate-400 font-medium">OU COPIE O LINK</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <button 
                    onClick={copyInviteLink}
                    className="w-full mt-2 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors"
                >
                    {inviteLinkCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    {inviteLinkCopied ? 'Link Copiado!' : 'Copiar Link de Convite'}
                </button>
                <p className="text-xs text-slate-400 text-center mt-3">O link expira em 7 dias.</p>
             </div>
        </div>
      )}

      {/* MODAL ADICIONAR SERVIDOR (Admin) */}
      {showAddServerModal && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-5 border-b bg-slate-50 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-slate-900 text-xl flex items-center gap-2">
                            <ServerIcon className="w-5 h-5 text-blue-600" /> Adicionar Novo Servidor
                        </h3>
                        <p className="text-sm text-slate-500">Conecte um ambiente remoto ou instale localmente.</p>
                    </div>
                    <button onClick={() => setShowAddServerModal(false)}><X className="w-6 h-6 text-slate-400 hover:text-slate-600" /></button>
                </div>

                <div className="p-8">
                    {serverConnectionStatus === 'success' ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <Check className="w-8 h-8 text-green-600" />
                            </div>
                            <h4 className="text-xl font-bold text-slate-800">Servidor Conectado!</h4>
                            <p className="text-slate-500">O ambiente foi configurado com sucesso.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleAddServerSubmit} className="space-y-6">
                            {/* Type Selector */}
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${serverForm.type === 'cloud' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                    <input type="radio" name="serverType" className="hidden" checked={serverForm.type === 'cloud'} onChange={() => setServerForm({...serverForm, type: 'cloud'})} />
                                    <Cloud className={`w-8 h-8 ${serverForm.type === 'cloud' ? 'text-blue-600' : 'text-slate-400'}`} />
                                    <div className="text-center">
                                        <div className={`font-bold ${serverForm.type === 'cloud' ? 'text-blue-700' : 'text-slate-600'}`}>Cloud (Remoto)</div>
                                        <div className="text-xs text-slate-500">Hospedado na nuvem Nexus</div>
                                    </div>
                                </label>

                                <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${serverForm.type === 'local' ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                    <input type="radio" name="serverType" className="hidden" checked={serverForm.type === 'local'} onChange={() => setServerForm({...serverForm, type: 'local'})} />
                                    <HardDrive className={`w-8 h-8 ${serverForm.type === 'local' ? 'text-purple-600' : 'text-slate-400'}`} />
                                    <div className="text-center">
                                        <div className={`font-bold ${serverForm.type === 'local' ? 'text-purple-700' : 'text-slate-600'}`}>Local (Intranet)</div>
                                        <div className="text-xs text-slate-500">Instalação on-premise</div>
                                    </div>
                                </label>
                            </div>

                            {/* Fields */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Nome da Empresa / Servidor</label>
                                <input 
                                    required 
                                    type="text" 
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                    placeholder="Ex: Matriz São Paulo"
                                    value={serverForm.name}
                                    onChange={e => setServerForm({...serverForm, name: e.target.value})}
                                />
                            </div>

                            {serverForm.type === 'local' && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Endereço de Rede (IP ou Hostname)</label>
                                    <div className="relative">
                                        <Wifi className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                        <input 
                                            required
                                            type="text" 
                                            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm" 
                                            placeholder="Ex: 192.168.1.50 ou intranet.local"
                                            value={serverForm.connectionUrl}
                                            onChange={e => setServerForm({...serverForm, connectionUrl: e.target.value})}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Conexão segura via VPN ou Rede Interna recomendada.</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Chave de Licença (Opcional)</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none uppercase font-mono text-sm tracking-widest" 
                                    placeholder="XXXX-XXXX-XXXX-XXXX"
                                    value={serverForm.licenseKey}
                                    onChange={e => setServerForm({...serverForm, licenseKey: e.target.value})}
                                />
                            </div>
                            
                            {serverConnectionStatus === 'error' && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                                    Falha ao conectar. Verifique o nome ou endereço do servidor.
                                </div>
                            )}

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowAddServerModal(false)} className="px-6 py-3 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
                                <button 
                                    type="submit" 
                                    disabled={serverConnectionStatus === 'checking'}
                                    className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
                                >
                                    {serverConnectionStatus === 'checking' ? <Activity className="w-5 h-5 animate-spin" /> : <ServerIcon className="w-5 h-5" />}
                                    {serverConnectionStatus === 'checking' ? 'Conectando...' : (serverForm.type === 'cloud' ? 'Criar Servidor' : 'Conectar Local')}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
             </div>
        </div>
      )}

    </div>
  );
};

export default App;
