
import React, { useState, useEffect, useRef } from 'react';
import { Channel, Message, User } from '../types';
import { Send, Hash, MoreVertical, Sparkles, User as UserIcon, Bell, BellOff, Phone, Video, Users, Mic, MicOff, VideoOff, PhoneOff, Lock, MessageSquare, UserPlus, Check } from 'lucide-react';
import { summarizeChannel } from '../services/geminiService';

interface ChatViewProps {
  channel: Channel;
  users: User[];
  onSendMessage: (channelId: string, content: string) => void;
  onToggleNotifications: (channelId: string) => void;
  onAddMember: (channelId: string, userId: string) => void; // New prop
  user: User;
}

// Simulated Call Component (Frontend UI only)
const CallOverlay: React.FC<{ type: 'voice' | 'video', channelName: string, onEnd: () => void }> = ({ type, channelName, onEnd }) => {
    const [duration, setDuration] = useState(0);
    const [status, setStatus] = useState('Conectando...');
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(type === 'voice');

    useEffect(() => {
        const timer = setTimeout(() => setStatus('Conectado'), 1500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if(status === 'Conectado') {
            const interval = setInterval(() => setDuration(prev => prev + 1), 1000);
            return () => clearInterval(interval);
        }
    }, [status]);

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div className="absolute inset-0 z-50 bg-slate-900/95 flex flex-col items-center justify-center text-white animate-in fade-in duration-300">
            <div className="flex flex-col items-center mb-10">
                {type === 'video' && !isVideoOff ? (
                     <div className="w-32 h-32 bg-slate-800 rounded-2xl mb-4 border-2 border-slate-700 flex items-center justify-center overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 animate-pulse"></div>
                        <UserIcon className="w-12 h-12 text-slate-500" />
                     </div>
                ) : (
                    <div className="w-32 h-32 bg-slate-800 rounded-full mb-4 border-4 border-slate-700 flex items-center justify-center animate-pulse">
                        <span className="text-4xl font-bold text-slate-400">{channelName.charAt(0).toUpperCase()}</span>
                    </div>
                )}
                <h2 className="text-2xl font-bold mb-2">{channelName}</h2>
                <p className="text-slate-400 text-sm font-mono tracking-widest uppercase">{status} {status === 'Conectado' && `• ${formatTime(duration)}`}</p>
            </div>

            <div className="flex items-center gap-6">
                <button 
                    onClick={() => setIsMuted(!isMuted)} 
                    className={`p-4 rounded-full transition-all ${isMuted ? 'bg-white text-slate-900' : 'bg-slate-800 hover:bg-slate-700'}`}
                >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
                
                {type === 'video' && (
                    <button 
                        onClick={() => setIsVideoOff(!isVideoOff)} 
                        className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-white text-slate-900' : 'bg-slate-800 hover:bg-slate-700'}`}
                    >
                        {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                    </button>
                )}

                <button 
                    onClick={onEnd}
                    className="p-4 bg-red-600 rounded-full hover:bg-red-700 transition-transform hover:scale-110 shadow-lg shadow-red-600/30"
                >
                    <PhoneOff className="w-6 h-6 fill-current" />
                </button>
            </div>
        </div>
    );
};

export const ChatView: React.FC<ChatViewProps> = ({ channel, users, onSendMessage, onToggleNotifications, onAddMember, user }) => {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  
  // Call State
  const [activeCall, setActiveCall] = useState<'voice' | 'video' | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    setSummary(null);
  }, [channel?.messages, channel?.id]);

  if (!channel) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Hash className="w-16 h-16 mb-4 opacity-20" />
            <p>Selecione ou crie um canal para começar.</p>
        </div>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(channel.id, inputText);
    setInputText('');
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    const result = await summarizeChannel(channel.name, channel.messages);
    setSummary(result);
    setIsSummarizing(false);
  };

  const getUser = (id: string) => users.find(u => u.id === id) || user;
  
  const potentialMembers = users.filter(u => !(channel.members || []).includes(u.id));

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Call Overlay */}
      {activeCall && (
          <CallOverlay 
            type={activeCall} 
            channelName={channel.name} 
            onEnd={() => setActiveCall(null)} 
          />
      )}

      {/* Header */}
      <div className="h-16 border-b flex items-center justify-between px-6 bg-white shrink-0 z-10">
        <div className="flex items-center gap-2">
          {channel.type === 'private' ? <Lock className="w-5 h-5 text-slate-500" /> : <Hash className="w-5 h-5 text-slate-500" />}
          <div>
            <h2 className="font-bold text-slate-800 leading-tight">{channel.name}</h2>
            {channel.type === 'private' && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 rounded">Grupo Privado</span>}
          </div>
          <span className="text-sm text-slate-400 ml-2 hidden sm:inline border-l pl-2 border-slate-200">{channel.description || 'Tópico de discussão'}</span>
        </div>
        
        <div className="flex items-center gap-1">
            {/* Add Member Button */}
            <div className="relative">
                <button
                    onClick={() => setShowAddMember(!showAddMember)}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mr-2"
                    title="Adicionar pessoas à sala"
                >
                    <UserPlus className="w-4 h-4" />
                </button>
                {showAddMember && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
                        <div className="px-2 py-1.5 text-xs font-bold text-slate-500 uppercase">Adicionar à sala</div>
                        <div className="max-h-60 overflow-y-auto">
                            {potentialMembers.length === 0 && <div className="px-2 py-2 text-sm text-slate-400 italic">Todos já estão aqui.</div>}
                            {potentialMembers.map(u => (
                                <button
                                    key={u.id}
                                    onClick={() => { onAddMember(channel.id, u.id); setShowAddMember(false); }}
                                    className="w-full flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg text-left"
                                >
                                    <img src={u.avatar} className="w-6 h-6 rounded-full" />
                                    <span className="text-sm font-medium text-slate-700 truncate">{u.name}</span>
                                    <PlusIconSmall />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Call Buttons */}
            <button 
                onClick={() => setActiveCall('voice')}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors" 
                title="Chamada de Voz"
            >
                <Phone className="w-4 h-4" />
            </button>
            <button 
                onClick={() => setActiveCall('video')}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors" 
                title="Chamada de Vídeo"
            >
                <Video className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-slate-200 mx-2"></div>

            <button 
                onClick={handleSummarize}
                disabled={isSummarizing}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors"
                title="Resumir com IA"
            >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">IA Resumo</span>
            </button>

            <button 
                onClick={() => onToggleNotifications(channel.id)}
                className={`ml-1 p-2 rounded-lg transition-colors ${channel.notificationsEnabled ? 'text-blue-500 bg-blue-50' : 'text-slate-400 hover:text-slate-600'}`}
                title={channel.notificationsEnabled ? "Silenciar" : "Ativar notificações"}
            >
                {channel.notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {summary && (
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 mb-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-purple-700 font-semibold">
                    <Sparkles className="w-4 h-4" />
                    <h3>Resumo Inteligente (Gemini)</h3>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{summary}</p>
                <button onClick={() => setSummary(null)} className="text-xs text-purple-500 hover:text-purple-700 mt-2 underline">Fechar resumo</button>
            </div>
        )}

        {channel.messages.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="w-6 h-6 text-slate-300" />
                </div>
                <p>Nenhuma mensagem em <strong>#{channel.name}</strong>.</p>
                <p className="text-xs">Comece a conversa ou inicie uma chamada!</p>
            </div>
        )}

        {channel.messages.map((msg) => {
          const isMe = msg.senderId === user.id;
          const msgUser = getUser(msg.senderId);
          
          return (
            <div key={msg.id} className={`flex gap-3 group ${isMe ? 'flex-row-reverse' : ''}`}>
              <div className="flex-shrink-0">
                 <img src={msgUser.avatar} className="w-10 h-10 rounded-lg object-cover" alt={msgUser.name} />
              </div>
              <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-semibold text-slate-900 text-sm">{isMe ? 'Você' : msgUser.name}</span>
                    <span className="text-[10px] text-slate-400">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div className={`px-4 py-2 rounded-2xl text-sm shadow-sm leading-relaxed ${
                    isMe 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-slate-100 text-slate-800 rounded-tl-none'
                }`} style={isMe && user.theme ? { backgroundColor: user.theme.primaryColor } : {}}>
                    {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-white shrink-0">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Enviar mensagem para #${channel.name}`}
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={user.theme ? { backgroundColor: user.theme.primaryColor } : {}}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

const PlusIconSmall = () => (
    <svg className="w-3 h-3 text-slate-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);
