import React, { useState, useEffect } from 'react';
import { Contact, DealStage } from '../types';
import { DollarSign, Phone, MoreHorizontal, Sparkles, LayoutGrid, Ticket, User as UserIcon, X, Plus, MessageCircle, Calendar, Filter, Clock, ChevronDown } from 'lucide-react';
import { generateEmailDraft, analyzeDealHealth, summarizeLead } from '../services/geminiService';

interface CRMViewProps {
  contacts: Contact[];
  onUpdateContact: (contact: Contact) => void;
  onAddContact: (contact: Omit<Contact, 'id' | 'lastActivity'>) => void;
}

export const CRMView: React.FC<CRMViewProps> = ({ contacts, onUpdateContact, onAddContact }) => {
  // Persistence Initialization
  const [viewMode, setViewMode] = useState<'funnel' | 'tickets'>(() => {
    return (localStorage.getItem('nexus_crm_view_mode') as 'funnel' | 'tickets') || 'funnel';
  });
  
  const [stageFilter, setStageFilter] = useState<string>(() => {
    return localStorage.getItem('nexus_crm_stage_filter') || 'ALL';
  });

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  // AI Modal States
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiContent, setAiContent] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAction, setAiAction] = useState<'email' | 'analysis' | 'summary' | null>(null);

  // Add Contact Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const initialFormState = {
    name: '',
    company: '',
    email: '',
    phone: '',
    value: 0,
    stage: DealStage.LEAD,
    notes: '',
    priority: 'medium' as 'medium'
  };
  const [formData, setFormData] = useState(initialFormState);

  const stages = Object.values(DealStage);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('nexus_crm_view_mode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('nexus_crm_stage_filter', stageFilter);
  }, [stageFilter]);

  const handleAiAction = async (contact: Contact, action: 'email' | 'analysis' | 'summary') => {
    setSelectedContact(contact);
    setAiModalOpen(true);
    setAiLoading(true);
    setAiAction(action);
    setAiContent('');

    let result = '';
    if (action === 'email') {
        result = await generateEmailDraft(contact, "Agendar uma reunião de demonstração");
    } else if (action === 'analysis') {
        result = await analyzeDealHealth(contact);
    } else if (action === 'summary') {
        result = await summarizeLead(contact);
    }
    setAiContent(result);
    setAiLoading(false);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddContact({
        ...formData,
        ticketId: `T-${Math.floor(Math.random() * 10000)}`
    });
    setAddModalOpen(false);
    setFormData(initialFormState);
  };

  const openWhatsApp = (phone: string, name: string) => {
      if (window.confirm(`Você será redirecionado para o WhatsApp para falar com ${name}. \n\nAtenção: Certifique-se de que você está logado no WhatsApp Web ou App.`)) {
          const cleanPhone = phone.replace(/\D/g, '');
          window.open(`https://wa.me/55${cleanPhone}`, '_blank');
      }
  };

  const openCalendar = (contact: Contact) => {
      if (window.confirm(`Você será redirecionado para o Google Agenda.\n\nAtenção: É necessário estar logado na sua conta Google para criar o evento.`)) {
          const title = `Reunião com ${contact.name} (${contact.company})`;
          const details = `Discutir proposta. Notas: ${contact.notes}`;
          window.open(`https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(title)}&details=${encodeURIComponent(details)}`, '_blank');
      }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  // Filter Logic for Tickets View
  const filteredContacts = contacts.filter(c => {
      if (stageFilter === 'ALL') return true;
      return c.stage === stageFilter;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* CRM Header */}
      <div className="h-16 px-6 border-b bg-white flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Pipeline & Vendas</h2>
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button 
                    onClick={() => setViewMode('funnel')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'funnel' ? 'bg-white shadow-sm text-blue-600 ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <LayoutGrid className="w-4 h-4" /> Funil
                </button>
                <button 
                    onClick={() => setViewMode('tickets')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'tickets' ? 'bg-white shadow-sm text-blue-600 ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Ticket className="w-4 h-4" /> Bilhetes
                </button>
            </div>
            
            {viewMode === 'tickets' && (
                <div className="flex items-center gap-2 ml-4 border-l pl-4">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select 
                        value={stageFilter}
                        onChange={(e) => setStageFilter(e.target.value)}
                        className="bg-transparent text-sm text-slate-600 font-medium focus:outline-none cursor-pointer hover:text-slate-900"
                    >
                        <option value="ALL">Todos os Estágios</option>
                        {stages.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            )}
        </div>
        <button 
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow hover:shadow-lg active:scale-95"
        >
            <Plus className="w-4 h-4" />
            Novo Deal
        </button>
      </div>

      {/* Board View (Funil) */}
      {viewMode === 'funnel' && (
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-slate-50/50">
          <div className="flex gap-6 h-full min-w-max">
            {stages.map(stage => {
               const stageContacts = contacts.filter(c => c.stage === stage);
               // Color coding for stages
               const stageColor = stage === DealStage.WON ? 'bg-emerald-500' : stage === DealStage.LOST ? 'bg-red-500' : 'bg-blue-500';

               return (
                <div key={stage} className="w-80 flex flex-col h-full max-h-full">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${stageColor}`} />
                        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">{stage}</h3>
                        <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{stageContacts.length}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto pr-2 space-y-3 pb-10">
                    {stageContacts.map(contact => (
                      <div key={contact.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group relative">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-slate-800 text-base">{contact.company}</h4>
                            
                            {/* Move Stage Dropdown */}
                            <div className="relative group/menu">
                                <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                                <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-slate-100 hidden group-hover/menu:block z-20">
                                    <div className="p-1 text-xs text-slate-500 font-semibold px-2 py-1 bg-slate-50">Mover para:</div>
                                    {stages.filter(s => s !== contact.stage).map(s => (
                                        <button 
                                            key={s}
                                            onClick={() => onUpdateContact({...contact, stage: s, lastActivity: new Date()})}
                                            className="block w-full text-left px-2 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 mb-3 flex items-center gap-1">
                            <UserIcon className="w-3 h-3" /> {contact.name}
                        </p>
                        
                        <div className="flex items-center gap-1 text-slate-800 font-bold mb-4 bg-slate-50 w-fit px-2 py-1 rounded text-sm">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                            {formatCurrency(contact.value)}
                        </div>

                        {/* Modern Communication Bar */}
                        <div className="grid grid-cols-2 gap-2 mt-2">
                             <button 
                                onClick={() => openWhatsApp(contact.phone, contact.name)} 
                                className="flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 border border-green-100 transition-colors"
                             >
                                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                             </button>
                             <button 
                                onClick={() => openCalendar(contact)} 
                                className="flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-100 transition-colors"
                             >
                                <Calendar className="w-3.5 h-3.5" /> Agenda
                             </button>
                        </div>
                        
                        <button 
                            onClick={() => handleAiAction(contact, 'analysis')}
                            className="w-full mt-2 py-1.5 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 text-purple-700 rounded-lg text-xs font-semibold transition-colors border border-purple-100 flex items-center justify-center gap-1.5"
                        >
                            <Sparkles className="w-3 h-3" /> Analisar Deal
                        </button>

                        <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-1 text-[10px] text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span>Atualizado: {new Date(contact.lastActivity).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
               );
            })}
          </div>
        </div>
      )}

      {/* Tickets View (Bilhetes) */}
      {viewMode === 'tickets' && (
        <div className="flex-1 overflow-auto p-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">ID / Assunto</th>
                            <th className="px-6 py-4">Solicitante</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Prioridade</th>
                            <th className="px-6 py-4 text-right">Ações Rápidas</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredContacts.length === 0 && (
                             <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                                    Nenhum bilhete encontrado neste filtro.
                                </td>
                             </tr>
                        )}
                        {filteredContacts.map(contact => (
                            <tr key={contact.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-mono text-xs text-slate-400 mb-1">{contact.ticketId || '#0000'}</span>
                                        <span className="font-semibold text-slate-800">Suporte: {contact.company}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                                            {contact.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900">{contact.name}</div>
                                            <div className="text-xs text-slate-500">{contact.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                        contact.stage === DealStage.WON ? 'bg-green-100 text-green-700' :
                                        contact.stage === DealStage.NEGOTIATION ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                        {contact.stage}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-red-50 text-red-600 border border-red-100 rounded text-xs font-bold uppercase tracking-wide">Alta</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-end gap-2">
                                         <button onClick={() => openWhatsApp(contact.phone, contact.name)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg border border-transparent hover:border-green-100 transition-all" title="WhatsApp"><MessageCircle className="w-4 h-4" /></button>
                                         <button onClick={() => openCalendar(contact)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg border border-transparent hover:border-orange-100 transition-all" title="Agendar"><Calendar className="w-4 h-4" /></button>
                                         <button onClick={() => handleAiAction(contact, 'summary')} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg border border-transparent hover:border-purple-100 transition-all" title="Resumo IA"><Sparkles className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* AI Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        {aiAction === 'email' ? 'Gerador de Email' : aiAction === 'summary' ? 'Resumo do Lead' : 'Análise de Deal'}
                    </h3>
                    <button onClick={() => setAiModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {aiLoading ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                            <p className="text-slate-500 animate-pulse font-medium">Consultando Nexus AI...</p>
                        </div>
                    ) : (
                        <div className="prose prose-sm prose-slate w-full">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-800 whitespace-pre-wrap leading-relaxed">
                                {aiContent}
                            </div>
                        </div>
                    )}
                </div>
                <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
                    <button onClick={() => setAiModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">Fechar</button>
                    <button onClick={() => { navigator.clipboard.writeText(aiContent); alert('Copiado!'); }} className="px-4 py-2 bg-purple-600 text-white font-medium hover:bg-purple-700 rounded-lg transition-colors">Copiar Texto</button>
                </div>
            </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">Novo Cadastro</h3>
                    <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleAddSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                            <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: João Silva" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
                            <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} placeholder="Ex: Acme Corp" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                                <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Estágio</label>
                                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value as DealStage})}>
                                    {stages.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Telefone (para WhatsApp)</label>
                             <input type="tel" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="11999999999" />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Notas Iniciais</label>
                             <textarea className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Interesse em..." />
                        </div>
                    </div>
                    <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
                        <button type="button" onClick={() => setAddModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-transform active:scale-95">Salvar Deal</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};
