
import React, { useState } from 'react';
import { AppView, Channel, User, Server } from '../types';
import { MessageSquare, BarChart2, Settings, Hash, Plus, LayoutDashboard, Bot, UserPlus, Lock, Users, Server as ServerIcon, Globe, PanelLeftClose, PanelLeftOpen, Cloud, HardDrive } from 'lucide-react';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  channels: Channel[];
  activeChannelId: string;
  onSelectChannel: (id: string) => void;
  user: User;
  onCreateChannel: () => void;
  onInviteMember: () => void;
  servers: Server[]; // Admin Servers List
  onSelectServer: (server: Server) => void;
  activeServerId?: string;
  onAddServer: () => void; // Admin action
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onChangeView, 
  channels, 
  activeChannelId, 
  onSelectChannel,
  user,
  onCreateChannel,
  onInviteMember,
  servers,
  onSelectServer,
  activeServerId,
  onAddServer,
  isCollapsed,
  onToggleCollapse
}) => {
  const sidebarStyle = user.theme ? { backgroundColor: user.theme.sidebarColor } : {};
  const appName = user.theme?.appName || 'Nexus Chat'; 
  const companyName = user.theme?.companyName || 'Meu Workspace';
  const isAdmin = user.isAdmin;

  // Tooltip Helper for collapsed state
  const NavItem = ({ view, icon: Icon, label }: { view: AppView, icon: any, label: string }) => (
    <button 
        onClick={() => onChangeView(view)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${currentView === view ? 'bg-white/10 text-white shadow-lg' : 'hover:bg-white/5 hover:text-slate-100'}`}
        title={isCollapsed ? label : ''}
    >
        <Icon className="w-5 h-5 shrink-0" />
        {!isCollapsed && <span className="font-medium text-sm truncate">{label}</span>}
    </button>
  );

  return (
    <div className="flex h-full shrink-0">
        
        {/* SUPER ADMIN SERVER LIST (Far Left) - Always collapsed icon-only style */}
        {isAdmin && (
            <div className="w-16 bg-slate-950 flex flex-col items-center py-4 gap-4 border-r border-slate-800 z-20">
                <div 
                    className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white cursor-pointer hover:rounded-lg transition-all shadow-lg shadow-blue-500/20"
                    title="Dashboard Global"
                >
                    <Globe className="w-5 h-5" />
                </div>
                <div className="w-8 h-px bg-slate-800"></div>
                {servers.map(server => (
                    <div key={server.id} className="group relative flex items-center justify-center w-full px-2">
                        {/* Selected Indicator */}
                        {activeServerId === server.id && <div className="absolute left-0 w-1 h-8 bg-white rounded-r-full"></div>}
                        
                        <button 
                            onClick={() => onSelectServer(server)}
                            className={`w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden transition-all hover:rounded-xl border-2 ${activeServerId === server.id ? 'border-blue-500' : 'border-transparent group-hover:border-slate-600'}`}
                        >
                           {server.paymentStatus === 'overdue' && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-slate-900 z-10"></div>}
                           <img src={server.avatar} alt={server.name} className="w-full h-full object-cover" />
                        </button>

                        {/* Tooltip */}
                        <div className="absolute left-14 bg-slate-900 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none border border-slate-700">
                            {server.name} ({server.type === 'cloud' ? 'Cloud' : 'Local'})
                        </div>
                    </div>
                ))}
                
                <button 
                    onClick={onAddServer}
                    className="w-10 h-10 rounded-full bg-slate-800 text-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors mt-2" 
                    title="Adicionar Servidor"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>
        )}

        {/* Regular Workspace Sidebar */}
        <div className={`flex flex-col h-full border-r border-slate-800 transition-all duration-300 print:hidden bg-slate-900 text-slate-300 ${isCollapsed ? 'w-16' : 'w-64'}`} style={sidebarStyle}>
        
        {/* Brand & Workspace Name */}
        <div className={`h-16 flex items-center border-b border-slate-800 ${isCollapsed ? 'justify-center px-0' : 'px-6'}`}>
            {isCollapsed ? (
                <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-lg cursor-pointer"
                    style={{ backgroundColor: user.theme?.primaryColor || '#2563eb' }}
                    onClick={onToggleCollapse}
                >
                    <MessageSquare className="w-4 h-4 fill-current" />
                </div>
            ) : (
                <>
                    {user.theme?.logoUrl ? (
                        <img src={user.theme.logoUrl} alt="Logo" className="h-8 object-contain mr-3" />
                    ) : (
                        <div className="relative w-8 h-8 mr-3 flex-shrink-0">
                            <div className="absolute top-0 right-0 w-6 h-6 rounded-lg opacity-40 transform translate-x-1.5 -translate-y-1.5" style={{ backgroundColor: user.theme?.primaryColor || '#60a5fa' }} />
                            <div className="absolute top-0 right-0 w-6 h-6 rounded-lg opacity-70 transform translate-x-0.5 -translate-y-0.5" style={{ backgroundColor: user.theme?.primaryColor || '#3b82f6' }} />
                            <div className="absolute top-0 right-0 w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-lg z-10" style={{ backgroundColor: user.theme?.primaryColor || '#2563eb' }}>
                                <MessageSquare className="w-3 h-3 fill-current" />
                            </div>
                        </div>
                    )}
                    <div className="flex flex-col min-w-0 overflow-hidden">
                        <h1 className="font-bold text-white text-sm tracking-tight leading-none truncate mb-1">
                            {isAdmin && activeServerId ? servers.find(s => s.id === activeServerId)?.name : companyName}
                        </h1>
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400 font-mono truncate">{appName}</span>
                        </div>
                    </div>
                </>
            )}
        </div>

        {/* Toggle Collapse Button (Desktop only) */}
        <div className="flex justify-end p-2 border-b border-slate-800">
             <button onClick={onToggleCollapse} className="text-slate-500 hover:text-white transition-colors p-1 rounded hover:bg-white/10">
                 {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
             </button>
        </div>

        {/* Main Nav */}
        <div className="p-2 space-y-1 mt-2">
            <NavItem view={AppView.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
            <NavItem view={AppView.CHAT} icon={MessageSquare} label="Chat & Equipes" />
            <NavItem view={AppView.CRM} icon={BarChart2} label="CRM & Vendas" />
            <NavItem view={AppView.BOT_STUDIO} icon={Bot} label="Bot Studio" />
        </div>

        {/* Invite Member Section */}
        {!isCollapsed && (
            <div className="px-3 mt-2">
                <button 
                    onClick={onInviteMember}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-slate-700 hover:bg-slate-800 rounded-lg text-xs font-semibold text-blue-400 transition-colors uppercase tracking-wide"
                >
                    <UserPlus className="w-3 h-3" /> Convidar Equipe
                </button>
            </div>
        )}

        {/* Contextual Sidebar Content */}
        <div className="flex-1 overflow-y-auto mt-4 px-3 custom-scrollbar">
            {currentView === AppView.CHAT && (
                <>
                    {!isCollapsed && (
                        <div className="flex items-center justify-between px-3 mb-2 group">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Canais</span>
                            <button onClick={onCreateChannel} className="p-1 hover:bg-white/10 rounded" title="Criar Canal">
                                <Plus className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
                            </button>
                        </div>
                    )}
                    <div className="space-y-0.5 mb-6">
                        {channels.map(channel => (
                            <button
                                key={channel.id}
                                onClick={() => onSelectChannel(channel.id)}
                                title={isCollapsed ? channel.name : ''}
                                className={`w-full flex items-center px-3 py-1.5 rounded-lg text-sm transition-all duration-200 border border-transparent ${activeChannelId === channel.id ? 'bg-blue-600/20 text-blue-100 border-blue-500/30' : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'} ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                            >
                                {isCollapsed ? (
                                     channel.type === 'private' ? <Lock className="w-4 h-4 opacity-70" /> : <Hash className="w-4 h-4 opacity-70" />
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2">
                                            {channel.type === 'private' ? <Lock className="w-3.5 h-3.5 opacity-70" /> : <Hash className="w-3.5 h-3.5 opacity-70" />}
                                            <span className="truncate max-w-[120px]">{channel.name}</span>
                                        </div>
                                    </>
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>

        {/* User Footer */}
        <div className={`p-4 border-t border-slate-800 flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <img src={user.avatar} className="w-8 h-8 rounded-lg border border-slate-700 shadow-sm object-cover" />
            {!isCollapsed && (
                <div className="flex-1 overflow-hidden">
                    <h4 className="text-sm font-semibold text-white truncate">{user.name}</h4>
                </div>
            )}
            <button onClick={() => onChangeView(AppView.SETTINGS)} className={`p-2 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-colors ${isCollapsed ? 'hidden' : ''}`}>
                <Settings className="w-4 h-4" />
            </button>
        </div>
        </div>
    </div>
  );
};
