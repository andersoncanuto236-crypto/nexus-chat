import React from 'react';
import { AppView, Channel, User } from '../types';
import { MessageSquare, BarChart2, Settings, Hash, Plus, LayoutDashboard, Bot } from 'lucide-react';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  channels: Channel[];
  activeChannelId: string;
  onSelectChannel: (id: string) => void;
  user: User;
  onCreateChannel: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onChangeView, 
  channels, 
  activeChannelId, 
  onSelectChannel,
  user,
  onCreateChannel
}) => {
  const sidebarStyle = user.theme ? { backgroundColor: user.theme.sidebarColor } : {};
  const appName = user.theme?.appName || 'Nexus Chat'; // Updated default name

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full shrink-0 border-r border-slate-800 transition-colors duration-300 print:hidden" style={sidebarStyle}>
      {/* Brand */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800">
        {user.theme?.logoUrl ? (
            <img src={user.theme.logoUrl} alt="Logo" className="h-8 object-contain mr-3" />
        ) : (
            // Logo "Três Papéis" estilizada com CSS
            <div className="relative w-8 h-8 mr-4 flex-shrink-0">
                <div 
                    className="absolute top-0 right-0 w-6 h-6 rounded-lg opacity-40 transform translate-x-1.5 -translate-y-1.5"
                    style={{ backgroundColor: user.theme?.primaryColor || '#60a5fa' }} 
                />
                <div 
                    className="absolute top-0 right-0 w-6 h-6 rounded-lg opacity-70 transform translate-x-0.5 -translate-y-0.5"
                    style={{ backgroundColor: user.theme?.primaryColor || '#3b82f6' }} 
                />
                <div 
                    className="absolute top-0 right-0 w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-lg z-10"
                    style={{ backgroundColor: user.theme?.primaryColor || '#2563eb' }}
                >
                    <MessageSquare className="w-3 h-3 fill-current" />
                </div>
            </div>
        )}
        <div className="flex flex-col min-w-0">
            <h1 className="font-bold text-white text-lg tracking-tight leading-none truncate">{appName}</h1>
            <div className="flex items-center gap-1 mt-1">
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 font-mono">v1.0 Beta</span>
                {user.plan === 'premium' && <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">PRO</span>}
            </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="p-3 space-y-1 mt-2">
        <button 
            onClick={() => onChangeView(AppView.DASHBOARD)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${currentView === AppView.DASHBOARD ? 'bg-white/10 text-white shadow-lg' : 'hover:bg-white/5 hover:text-slate-100'}`}
        >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium text-sm">Dashboard</span>
        </button>
        <button 
            onClick={() => onChangeView(AppView.CHAT)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${currentView === AppView.CHAT ? 'bg-white/10 text-white shadow-lg' : 'hover:bg-white/5 hover:text-slate-100'}`}
        >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium text-sm">Chat & Equipes</span>
        </button>
        <button 
            onClick={() => onChangeView(AppView.CRM)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${currentView === AppView.CRM ? 'bg-white/10 text-white shadow-lg' : 'hover:bg-white/5 hover:text-slate-100'}`}
        >
            <BarChart2 className="w-5 h-5" />
            <span className="font-medium text-sm">CRM & Vendas</span>
        </button>
         <button 
            onClick={() => onChangeView(AppView.BOT_STUDIO)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${currentView === AppView.BOT_STUDIO ? 'bg-white/10 text-white shadow-lg' : 'hover:bg-white/5 hover:text-slate-100'}`}
        >
            <Bot className="w-5 h-5" />
            <span className="font-medium text-sm">Bot Studio</span>
        </button>
      </div>

      {/* Contextual Sidebar Content */}
      <div className="flex-1 overflow-y-auto mt-4 px-3">
        {currentView === AppView.CHAT && (
            <>
                <div className="flex items-center justify-between px-3 mb-2 group">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Canais</span>
                    <button onClick={onCreateChannel} className="p-1 hover:bg-white/10 rounded">
                         <Plus className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
                    </button>
                </div>
                <div className="space-y-0.5 mb-6">
                    {channels.length === 0 && <span className="text-xs px-3 italic opacity-40">Sem canais.</span>}
                    {channels.map(channel => (
                        <button
                            key={channel.id}
                            onClick={() => onSelectChannel(channel.id)}
                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-all duration-200 border border-transparent ${activeChannelId === channel.id ? 'bg-blue-600/20 text-blue-100 border-blue-500/30' : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'}`}
                        >
                            <div className="flex items-center gap-2">
                                <Hash className="w-3.5 h-3.5 opacity-70" />
                                <span className="truncate max-w-[120px]">{channel.name}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </>
        )}
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800 flex items-center gap-3">
        <img src={user.avatar} className="w-9 h-9 rounded-lg border border-slate-700 shadow-sm" />
        <div className="flex-1 overflow-hidden">
            <h4 className="text-sm font-semibold text-white truncate">{user.name}</h4>
            <span className="text-xs text-slate-500 block truncate">{user.statusMessage || user.status}</span>
        </div>
        <button onClick={() => onChangeView(AppView.SETTINGS)} className="p-2 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-colors">
             <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};