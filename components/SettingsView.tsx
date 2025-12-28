import React, { useState, useEffect } from 'react';
import { User, PlanType, ThemeSettings, AuditLog } from '../types';
import { StorageService } from '../services/storageService';
import { Save, User as UserIcon, Palette, Key, ShieldCheck, CreditCard, LogOut, Type, MessageCircle, CheckCircle2, Upload, Crown } from 'lucide-react';

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
    alert('Perfil salvo com sucesso!');
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            alert("A imagem é muito grande. O limite é 2MB.");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData({ ...formData, avatar: reader.result as string });
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSaveApi = () => {
    StorageService.saveApiKey(apiKey);
    StorageService.logAction('UPDATE_API_KEY', 'Chave de API do Gemini atualizada', user.id);
    alert('API Key salva!');
  };

  const handleContactSales = () => {
    const phoneNumber = "5582996023679";
    const message = encodeURIComponent(`Olá, gostaria de ativar o plano Premium do Nexus CRM para a conta ${user.email} e obter minha chave de produto.`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
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
                
                {/* Photo Upload Section */}
                <div className="flex items-center gap-6 mb-6 p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <div className="relative group">
                     <img src={formData.avatar} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-slate-50 object-cover shadow-md" />
                     <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="w-6 h-6 text-white" />
                     </div>
                     <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Clique para alterar a foto"
                     />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">Sua Foto de Perfil</h4>
                    <p className="text-sm text-slate-500 mb-3">Clique na imagem para fazer upload. (Max 2MB)</p>
                    <div className="flex gap-2">
                        <button 
                            type="button" 
                            className="text-xs px-3 py-1.5 border border-slate-300 rounded-md hover:bg-slate-50"
                            onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                        >
                            Escolher Arquivo
                        </button>
                        {formData.avatar.startsWith('data:') && (
                             <button 
                                type="button" 
                                className="text-xs px-3 py-1.5 text-red-600 hover:text-red-700 hover:underline"
                                onClick={() => setFormData({...formData, avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`})}
                            >
                                Remover
                            </button>
                        )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                    <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                    <input 
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mensagem de Status</label>
                    <input 
                        type="text" 
                        value={formData.statusMessage || ''}
                        onChange={e => setFormData({...formData, statusMessage: e.target.value})}
                        placeholder="Ex: Em reunião, Disponível, Focado..."
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    </div>
                </div>
                
                <div className="pt-4 border-t">
                    <button onClick={handleSaveProfile} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-all active:scale-95">
                    <Save className="w-4 h-4" /> Salvar Alterações
                    </button>
                </div>
              </div>
            )}

            {/* PLAN TAB */}
            {activeTab === 'plan' && (
              <div className="space-y-6">
                 <h3 className="text-lg font-semibold text-slate-800">Assinatura e Licença</h3>
                 <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-slate-600 font-medium">Plano Atual</span>
                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide flex items-center gap-2 ${formData.plan === 'premium' ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-700'}`}>
                            {formData.plan === 'premium' && <Crown className="w-3.5 h-3.5" />}
                            {formData.plan}
                        </span>
                    </div>
                    {formData.plan === 'free' ? (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Crown className="w-32 h-32 rotate-12" />
                                </div>
                                <h4 className="font-bold text-xl text-slate-900 mb-2">Seja Nexus Premium</h4>
                                <p className="text-slate-600 mb-4">Desbloqueie personalização total, IAs ilimitadas e suporte prioritário.</p>
                                
                                <ul className="space-y-3 text-sm text-slate-600 mb-6">
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500"/> Personalização completa (White-label)</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500"/> Suporte prioritário 24/7</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500"/> Acesso antecipado a novos modelos de IA</li>
                                </ul>
                                
                                <button onClick={handleContactSales} className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200 hover:shadow-green-300">
                                    <MessageCircle className="w-5 h-5" /> 
                                    Falar com Vendas (WhatsApp)
                                </button>
                                <p className="text-xs text-center text-slate-400 mt-3">Negocie valores diretamente com nosso time.</p>
                            </div>

                            <div className="border-t pt-6">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Ativar Chave do Produto</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="XXXX-XXXX-XXXX"
                                        value={activationCode}
                                        onChange={e => setActivationCode(e.target.value)}
                                        className="flex-1 px-4 py-2 border rounded-lg uppercase font-mono tracking-widest text-center"
                                    />
                                    <button onClick={handleActivateCode} className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 shadow-sm">
                                        Validar
                                    </button>
                                </div>
                                {activationError && <p className="text-xs text-red-500 mt-2 font-medium flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> {activationError}</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10">
                             <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-in zoom-in duration-300">
                                <Crown className="w-10 h-10 text-green-600" />
                             </div>
                             <h4 className="text-2xl font-bold text-slate-800 mb-2">Membro Premium</h4>
                             <p className="text-slate-500 max-w-sm mx-auto">Você tem acesso total a todas as ferramentas. Obrigado por confiar no Nexus.</p>
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
                                className="h-10 w-20 rounded cursor-pointer border shadow-sm"
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
                                className="h-10 w-20 rounded cursor-pointer border shadow-sm"
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
                    <div className="bg-slate-900 rounded-lg p-4 h-96 overflow-y-auto font-mono text-xs custom-scrollbar">
                        {auditLogs.length === 0 && <span className="text-slate-500">Nenhum registro encontrado.</span>}
                        {auditLogs.map(log => (
                            <div key={log.id} className="mb-2 border-b border-slate-800 pb-2 hover:bg-slate-800/50 p-2 rounded transition-colors">
                                <span className="text-slate-500">[{new Date(log.timestamp).toLocaleString()}]</span>{' '}
                                <span className="text-blue-400 font-bold">{log.action}</span>
                                <div className="text-slate-300 mt-1 pl-4 border-l-2 border-slate-700">{log.details}</div>
                                <div className="text-slate-600 pl-4 mt-1 text-[10px]">ID: {log.userId}</div>
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