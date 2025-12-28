import React, { useState, useEffect } from 'react';
import { User, PlanType, ThemeSettings, AuditLog } from '../types';
import { StorageService } from '../services/storageService';
import { Save, User as UserIcon, Palette, Key, ShieldCheck, CreditCard, LogOut, Type, MessageCircle, CheckCircle2 } from 'lucide-react';

interface SettingsViewProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onLogout: () => void; // New prop for graceful logout
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user, onUpdateUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'plan' | 'api' | 'theme' | 'audit'>('profile');
  const [formData, setFormData] = useState<User>(user);
  const [apiKey, setApiKey] = useState('');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  // Activation State
  const [activationCode, setActivationCode] = useState('');
  const [activationError, setActivationError] = useState('');

  useEffect(() => {
    setApiKey(StorageService.getApiKey() || '');
    setAuditLogs(StorageService.getAuditLogs());
  }, []);

  const handleSaveProfile = () => {
    onUpdateUser(formData);
    StorageService.logAction('UPDATE_PROFILE', 'Usuário atualizou informações de perfil', user.id);
    alert('Perfil salvo!');
  };

  const handleSaveApi = () => {
    StorageService.saveApiKey(apiKey);
    StorageService.logAction('UPDATE_API_KEY', 'Chave de API do Gemini atualizada', user.id);
    alert('API Key salva!');
  };

  const handleContactSales = () => {
    // Link fictício de WhatsApp para o desenvolvedor
    window.open(`https://wa.me/5511999999999?text=Olá, gostaria de ativar o plano Premium do Nexus CRM para a conta ${user.email}`, '_blank');
  };

  const handleActivateCode = () => {
      if(StorageService.validateActivationCode(activationCode)) {
          const upgradedUser = { ...formData, plan: 'premium' as PlanType };
          setFormData(upgradedUser);
          onUpdateUser(upgradedUser);
          StorageService.logAction('UPGRADE_PLAN_MANUAL', 'Ativação manual de plano Premium', user.id);
          alert('Plano Premium ativado com sucesso! Bem-vindo.');
          setActivationCode('');
          setActivationError('');
      } else {
          setActivationError('Código inválido ou expirado.');
      }
  };

  const handleThemeChange = (key: keyof ThemeSettings, value: string) => {
    const currentTheme = formData.theme || { primaryColor: '#2563eb', sidebarColor: '#0f172a' };
    const newTheme = { ...currentTheme, [key]: value };
    setFormData({ ...formData, theme: newTheme });
  };

  const handleSaveTheme = () => {
    onUpdateUser(formData);
    StorageService.logAction('UPDATE_THEME', 'Tema visual atualizado', user.id);
    alert('Tema aplicado!');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      <div className="px-8 py-6 bg-white border-b shrink-0 flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Configurações</h2>
            <p className="text-slate-500">Gerencie sua conta, preferências e integrações.</p>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium">
            <LogOut className="w-4 h-4" /> Sair da Conta
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Settings Sidebar */}
        <div className="w-64 bg-white border-r border-slate-200 p-4 space-y-1">
          <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <UserIcon className="w-4 h-4" /> Perfil
          </button>
          <button onClick={() => setActiveTab('plan')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'plan' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <CreditCard className="w-4 h-4" /> Plano & Conta
          </button>
          <button onClick={() => setActiveTab('api')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'api' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Key className="w-4 h-4" /> Integrações (API)
          </button>
           {user.plan === 'premium' && (
            <button onClick={() => setActiveTab('theme')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'theme' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Palette className="w-4 h-4" /> Aparência (White-label)
            </button>
          )}
          <button onClick={() => setActiveTab('audit')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'audit' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <ShieldCheck className="w-4 h-4" /> Log de Auditoria
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800">Informações Pessoais</h3>
                <div className="flex items-center gap-4 mb-6">
                  <img src={formData.avatar} alt="Avatar" className="w-20 h-20 rounded-full border-2 border-slate-200" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">URL do Avatar</label>
                    <input 
                      type="text" 
                      value={formData.avatar}
                      onChange={e => setFormData({...formData, avatar: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mensagem de Status</label>
                  <input 
                    type="text" 
                    value={formData.statusMessage || ''}
                    onChange={e => setFormData({...formData, statusMessage: e.target.value})}
                    placeholder="Ex: Em reunião, Disponível, Focado..."
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <button onClick={handleSaveProfile} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  <Save className="w-4 h-4" /> Salvar Alterações
                </button>
              </div>
            )}

            {/* PLAN TAB */}
            {activeTab === 'plan' && (
              <div className="space-y-6">
                 <h3 className="text-lg font-semibold text-slate-800">Assinatura e Licença</h3>
                 <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-slate-600 font-medium">Plano Atual</span>
                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide ${formData.plan === 'premium' ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-700'}`}>
                            {formData.plan}
                        </span>
                    </div>
                    {formData.plan === 'free' ? (
                        <div className="space-y-6">
                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                                <h4 className="font-semibold text-slate-800 mb-2">Desbloqueie o Poder Total</h4>
                                <ul className="space-y-2 text-sm text-slate-600 mb-4">
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Personalização completa (White-label)</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Suporte prioritário</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Acesso antecipado a IAs</li>
                                </ul>
                                <button onClick={handleContactSales} className="w-full flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all">
                                    <MessageCircle className="w-4 h-4" /> Falar com Vendas (WhatsApp)
                                </button>
                                <p className="text-xs text-center text-slate-400 mt-2">Fale com o administrador para adquirir sua licença.</p>
                            </div>

                            <div className="border-t pt-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Já tem um código de ativação?</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Ex: NEXUS-PRO-2025"
                                        value={activationCode}
                                        onChange={e => setActivationCode(e.target.value)}
                                        className="flex-1 px-3 py-2 border rounded-md uppercase font-mono"
                                    />
                                    <button onClick={handleActivateCode} className="px-4 py-2 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700">
                                        Ativar
                                    </button>
                                </div>
                                {activationError && <p className="text-xs text-red-500 mt-2">{activationError}</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6">
                             <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                             </div>
                             <h4 className="text-xl font-bold text-slate-800">Conta Premium Ativa</h4>
                             <p className="text-slate-500">Obrigado por apoiar o desenvolvimento do Nexus.</p>
                        </div>
                    )}
                 </div>
              </div>
            )}

            {/* API TAB */}
            {activeTab === 'api' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800">Integração com Gemini AI</h3>
                <p className="text-sm text-slate-500">Para utilizar os recursos de IA (resumo, email, insights), você precisa de uma API Key válida do Google AI Studio.</p>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Google Gemini API Key</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                        type="password" 
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full pl-10 pr-3 py-2 border rounded-md font-mono text-sm"
                    />
                  </div>
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-xs text-blue-600 hover:underline mt-1 block">
                    Obter chave gratuitamente aqui
                  </a>
                </div>
                <button onClick={handleSaveApi} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  <Save className="w-4 h-4" /> Vincular API
                </button>
              </div>
            )}

            {/* THEME TAB (Premium only) */}
            {activeTab === 'theme' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800">Personalização (White-label)</h3>
                <p className="text-sm text-slate-500 mb-4">Edite a identidade visual do CRM para combinar com sua empresa.</p>
                
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Cor da Barra Lateral</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="color" 
                                value={formData.theme?.sidebarColor || '#0f172a'}
                                onChange={e => handleThemeChange('sidebarColor', e.target.value)}
                                className="h-10 w-20 rounded cursor-pointer"
                            />
                            <span className="text-xs text-slate-500 font-mono">{formData.theme?.sidebarColor}</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Cor Primária (Botões)</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="color" 
                                value={formData.theme?.primaryColor || '#2563eb'}
                                onChange={e => handleThemeChange('primaryColor', e.target.value)}
                                className="h-10 w-20 rounded cursor-pointer"
                            />
                            <span className="text-xs text-slate-500 font-mono">{formData.theme?.primaryColor}</span>
                        </div>
                    </div>
                </div>
                <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Aplicativo (White-label)</label>
                     <div className="relative">
                        <Type className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            value={formData.theme?.appName || ''}
                            onChange={e => handleThemeChange('appName', e.target.value)}
                            placeholder="Ex: Minha Empresa CRM"
                            className="w-full pl-10 pr-3 py-2 border rounded-md text-sm"
                        />
                     </div>
                </div>
                <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Logo URL (Barra Lateral)</label>
                     <input 
                        type="text" 
                        value={formData.theme?.logoUrl || ''}
                        onChange={e => handleThemeChange('logoUrl', e.target.value)}
                        placeholder="https://suaempresa.com/logo.png"
                        className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                </div>

                <button onClick={handleSaveTheme} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  <Save className="w-4 h-4" /> Aplicar Tema
                </button>
              </div>
            )}

            {/* AUDIT TAB */}
            {activeTab === 'audit' && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">Log de Auditoria Local</h3>
                    <p className="text-sm text-slate-500">Registro imutável de ações realizadas nesta máquina.</p>
                    <div className="bg-slate-900 rounded-lg p-4 h-96 overflow-y-auto font-mono text-xs">
                        {auditLogs.length === 0 && <span className="text-slate-500">Nenhum registro encontrado.</span>}
                        {auditLogs.map(log => (
                            <div key={log.id} className="mb-2 border-b border-slate-800 pb-2">
                                <span className="text-slate-500">[{new Date(log.timestamp).toLocaleString()}]</span>{' '}
                                <span className="text-blue-400 font-bold">{log.action}</span>
                                <div className="text-slate-300 mt-1 pl-4">{log.details}</div>
                                <div className="text-slate-600 pl-4">User: {log.userId}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
