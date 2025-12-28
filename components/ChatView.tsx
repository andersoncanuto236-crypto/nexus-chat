import React, { useState, useEffect, useRef } from 'react';
import { Channel, Message, User } from '../types';
import { Send, Hash, MoreVertical, Sparkles, User as UserIcon, Bell, BellOff } from 'lucide-react';
import { summarizeChannel } from '../services/geminiService';

interface ChatViewProps {
  channel: Channel;
  users: User[];
  onSendMessage: (channelId: string, content: string) => void;
  onToggleNotifications: (channelId: string) => void;
  user: User;
}

export const ChatView: React.FC<ChatViewProps> = ({ channel, users, onSendMessage, onToggleNotifications, user }) => {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    setSummary(null); // Reset summary on channel change
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

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="h-16 border-b flex items-center justify-between px-6 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <Hash className="w-5 h-5 text-slate-500" />
          <h2 className="font-bold text-slate-800">{channel.name}</h2>
          <span className="text-sm text-slate-400 ml-2 hidden sm:inline">{channel.description}</span>
          <button 
            onClick={() => onToggleNotifications(channel.id)}
            className={`ml-2 p-1 rounded-full transition-colors ${channel.notificationsEnabled ? 'text-blue-500 bg-blue-50' : 'text-slate-400 hover:text-slate-600'}`}
            title={channel.notificationsEnabled ? "Notificações ativadas" : "Notificações desativadas"}
          >
            {channel.notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={handleSummarize}
                disabled={isSummarizing}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors"
            >
                <Sparkles className="w-4 h-4" />
                {isSummarizing ? 'Analisando...' : 'Resumir Canal'}
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
                Nenhuma mensagem ainda. Comece a conversa!
            </div>
        )}

        {channel.messages.map((msg) => {
          const isMe = msg.senderId === user.id;
          const msgUser = getUser(msg.senderId);
          
          return (
            <div key={msg.id} className={`flex gap-3 group ${isMe ? 'flex-row-reverse' : ''}`}>
              <div className="flex-shrink-0">
                 <img src={msgUser.avatar} className="w-10 h-10 rounded-lg" alt={msgUser.name} />
              </div>
              <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-semibold text-slate-900">{isMe ? 'Você' : msgUser.name}</span>
                    <span className="text-xs text-slate-400">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${
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
