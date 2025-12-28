
import React, { useState, useEffect } from 'react';
import { User, PlanType } from '../types';
import { StorageService } from '../services/storageService';
import { loginWithGoogle, isFirebaseConfigured } from '../services/firebaseConfig';
import { CheckCircle, Zap, Shield, Rocket, MessageSquare, Lock, AlertTriangle, ArrowRight, Building2, Network, FileText, Server } from 'lucide-react';

interface AuthViewProps {
  onLoginSuccess: (user: User) => void;
}

const LANDSCAPES = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80', // Office/Corporate
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1600&q=80', // Nature/Hills
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80', // Yosemite
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80', // Skyscrapers
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80'  // Lake/Travel
];

// Informações rotativas da tela de login
const INFO_CARDS = [
    {
        title: "Servidor Dedicado",
        desc: "Seus dados não se misturam com outros clientes.",
        icon: <Building2 className="w-5 h-5" />,
        color: "blue"
    },
    {
        title: "Estrutura de Rede Interna",
        desc: "Comunicação isolada e criptografada ponto a ponto.",
        icon: <Network className="w-5 h-5" />,
        color: "emerald"
    },
    {
        title: "Logs de Registro Interno",
        desc: "Auditoria completa de todas as ações para compliance.",
        icon: <FileText className="w-5 h-5" />,
        color: "purple"
    }
];

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState(''); 
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('free');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const [infoIndex, setInfoIndex] = useState(0);

  // Rotate Background Images
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % LANDSCAPES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Rotate Info Cards
  useEffect(() => {
    const interval = setInterval(() => {
        setInfoIndex((prev) => (prev + 1) % INFO_CARDS.length);
    }, 4000); // Muda a cada 4 segundos
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // --- SUPER ADMIN BACKDOOR ---
    if (email === 'andersoncanuto236@gmail.com' && password === '7Qxp23yu@') {
        const adminUser: User = {
            id: 'admin-anderson',
            name: 'Anderson Canuto (Admin)',
            email: email,
            avatar: 'https://ui-avatars.com/api/?name=Admin+Nexus&background=1e293b&color=fff',
            status: 'online',
            statusMessage: 'Monitorando Servidores',
            plan: 'premium',
            isAdmin: true,
            hasSeenTutorial: true,
            theme: {
                primaryColor: '#2563eb',
                sidebarColor: '#0f172a',
                companyName: 'Nexus HQ (Admin)'
            }
        };
        // Salva mock para garantir persistência
        try { StorageService.registerUser(adminUser); } catch(e) { StorageService.updateUser(adminUser); }
        
        onLoginSuccess(adminUser);
        return;
    }
    // ----------------------------

    try {
      const user = StorageService.loginUser(email, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newUser: User = {
        id: `u-${Date.now()}`,
        name,
        email,
        password,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        status: 'online',
        statusMessage: 'Novo no app!',
        plan: selectedPlan,
        hasSeenTutorial: false,
        theme: {
            primaryColor: '#2563eb',
            sidebarColor: '#0f172a',
            companyName: companyName || 'Minha Empresa' // Save Company Name
        }
      };
      
      const registered = StorageService.registerUser(newUser);
      onLoginSuccess(registered);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    
    // Fallback para demonstração se o usuário não configurou o Firebase
    if (!isFirebaseConfigured()) {
        const confirmDemo = window.confirm(
            "ATENÇÃO: O Backend do Firebase não foi configurado neste código.\n\n" +
            "Para usar o login REAL do Google, você precisa editar o arquivo 'services/firebaseConfig.ts' com suas chaves do console.firebase.google.com.\n\n" +
            "Deseja continuar com o login de DEMONSTRAÇÃO (Simulado)?"
        );

        if (confirmDemo) {
             setIsLoading(true);
             setTimeout(() => {
                const mockUser: User = {
                    id: `u-google-${Date.now()}`,
                    name: 'Usuário Google (Demo)',
                    email: `google.user@gmail.com`,
                    password: 'oauth-secure-token',
                    avatar: 'https://lh3.googleusercontent.com/ogw/AF2bZyiZ_r3iL6q-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2=s64-c-mo',
                    status: 'online',
                    statusMessage: 'Login via Google',
                    plan: 'premium', 
                    hasSeenTutorial: false,
                    theme: {
                        primaryColor: '#2563eb',
                        sidebarColor: '#0f172a',
                        companyName: 'Google Workspace'
                    }
                };
                StorageService.registerUser(mockUser); // Garante que salva no local
                onLoginSuccess(mockUser);
                setIsLoading(false);
            }, 1000);
        }
        return;
    }

    // Login Real via Firebase
    try {
        setIsLoading(true);
        const googleUser = await loginWithGoogle();
        
        // Mapear usuário do Google para o formato do App
        const appUser: User = {
            id: googleUser.id,
            name: googleUser.name,
            email: googleUser.email,
            password: 'oauth-provider', // Senha dummy pois é gerenciada pelo Google
            avatar: googleUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(googleUser.name)}`,
            status: 'online',
            statusMessage: 'Login Oficial Google',
            plan: 'premium', // Bônus por login social
            hasSeenTutorial: false,
            theme: {
                primaryColor: '#2563eb',
                sidebarColor: '#0f172a',
                companyName: 'Google Workspace'
            }
        };

        // Salvar/Atualizar no Storage Local para persistência da sessão
        try {
             StorageService.registerUser(appUser);
        } catch(e) {
             StorageService.updateUser(appUser);
        }
        
        onLoginSuccess(appUser);
    } catch (err: any) {
        setError("Erro no Google Login: " + err.message);
        setIsLoading(false);
    }
  };

  const currentInfo = INFO_CARDS[infoIndex];

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side - Brand & Dynamic Background */}
        <div className="md:w-1/2 relative flex flex-col justify-between p-8 text-white overflow-hidden transition-all duration-1000 ease-in-out">
            {/* Background Layer with Crossfade */}
            {LANDSCAPES.map((img, index) => (
                <div 
                    key={index}
                    className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${index === bgIndex ? 'opacity-100' : 'opacity-0'}`}
                    style={{ backgroundImage: `url(${img})` }}
                />
            ))}
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/30"></div>

            <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <MessageSquare className="w-6 h-6 fill-white text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">Nexus Chat</span>
                    </div>

                    <h1 className="text-4xl font-bold mb-4 leading-tight">
                        Seu ambiente de trabalho <br/>
                        <span className="text-blue-400">exclusivo e seguro.</span>
                    </h1>
                    <p className="text-slate-300 text-lg max-w-sm">
                        Crie seu servidor privado. Cada empresa tem seu próprio ecossistema isolado de comunicação e dados.
                    </p>
                </div>

                {/* Rotating Info Cards */}
                <div className="space-y-4 backdrop-blur-md bg-white/10 p-6 rounded-2xl border border-white/10 min-h-[120px] transition-all duration-500">
                    <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500" key={infoIndex}>
                        <div className={`p-2 bg-${currentInfo.color}-500/20 rounded-lg text-${currentInfo.color}-300`}>
                            {currentInfo.icon}
                        </div>
                        <div>
                            <strong className="block text-sm font-semibold">{currentInfo.title}</strong>
                            <span className="text-xs text-slate-300">{currentInfo.desc}</span>
                        </div>
                    </div>
                    
                    {/* Static Badge */}
                    <div className="flex items-center gap-4 pt-2 border-t border-white/10">
                         <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-300"><Shield className="w-5 h-5" /></div>
                        <div>
                             <strong className="block text-sm font-semibold">Segurança Privada</strong>
                             <span className="text-xs text-slate-300">Criptografia e controle de acesso total.</span>
                        </div>
                    </div>
                </div>
                
                <p className="text-xs text-slate-400 mt-4">© 2025 Nexus Inc. All rights reserved.</p>
            </div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className="md:w-1/2 p-8 md:p-12 bg-white flex flex-col justify-center">
          
          <div className="mb-8">
             <h2 className="text-3xl font-bold text-slate-900 mb-2">{isLogin ? 'Acessar Workspace' : 'Criar Nova Empresa'}</h2>
             <p className="text-slate-500">
                {isLogin ? 'Entre no servidor da sua equipe.' : 'Cadastre sua organização para iniciar um servidor privado.'}
             </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 border border-red-200 flex items-center gap-2 animate-pulse">
                <Lock className="w-4 h-4" /> {error}
            </div>
          )}

          {!isFirebaseConfigured() && (
             <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-lg mb-6 border border-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> 
                <span><strong>Demo Mode:</strong> Configure o Firebase para login real.</span>
            </div>
          )}

          {/* Google Button */}
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3 shadow-sm mb-6 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
          >
             {isLoading ? (
                <span className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></span>
             ) : (
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
             )}
             {isLoading ? 'Autenticando...' : 'Entrar com Google'}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-xs font-medium uppercase tracking-wider"><span className="px-3 bg-white text-slate-400">ou via email</span></div>
          </div>

          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
            {!isLogin && (
                <>
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1 ml-1">Nome Completo</label>
                    <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1 ml-1">Nome da Empresa (Servidor)</label>
                    <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" placeholder="Ex: Tech Solutions Inc" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                </div>
                </>
            )}
            
            <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 ml-1">Email Corporativo</label>
                <input required type="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" placeholder="nome@empresa.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 ml-1">Senha</label>
                <input required type="password" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" placeholder="******" value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            {!isLogin && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-3">Escolha seu Plano</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            type="button"
                            onClick={() => setSelectedPlan('free')}
                            className={`p-3 border rounded-xl transition-all text-left ${selectedPlan === 'free' ? 'border-blue-500 bg-white shadow-md shadow-blue-100 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300 bg-white'}`}
                        >
                            <div className="font-bold text-slate-800 text-sm">Free</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">Até 5 usuários</div>
                        </button>
                        <button 
                            type="button"
                            onClick={() => setSelectedPlan('premium')}
                            className={`p-3 border rounded-xl transition-all text-left relative overflow-hidden ${selectedPlan === 'premium' ? 'border-purple-500 bg-white shadow-md shadow-purple-100 ring-1 ring-purple-500' : 'border-slate-200 hover:border-purple-300 bg-white'}`}
                        >
                             <div className="absolute top-0 right-0 w-3 h-3 bg-purple-500 rounded-bl-lg"></div>
                            <div className="font-bold text-purple-700 text-sm flex items-center gap-1">Premium <Zap className="w-3 h-3 fill-purple-700" /></div>
                            <div className="text-[10px] text-slate-500 mt-0.5">Ilimitado</div>
                        </button>
                    </div>
                </div>
            )}

            <button type="submit" className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-200 flex items-center justify-center gap-2">
                {isLogin ? 'Entrar no Workspace' : 'Criar Conta Grátis'}
                <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              {isLogin ? (
                  <>Não tem cadastro? <span className="text-blue-600 font-bold">Faça aqui</span></>
              ) : (
                  <>Já tem servidor? <span className="text-blue-600 font-bold">Fazer Login</span></>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
