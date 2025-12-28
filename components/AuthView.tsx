import React, { useState } from 'react';
import { User, PlanType } from '../types';
import { StorageService } from '../services/storageService';
import { CheckCircle, Zap, Shield, Rocket, MessageSquare } from 'lucide-react';

interface AuthViewProps {
  onLoginSuccess: (user: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('free');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
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
        plan: selectedPlan
      };
      
      const registered = StorageService.registerUser(newUser);
      onLoginSuccess(registered);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleMock = () => {
    // Simula login google criando uma conta premium automaticamente
    const mockUser: User = {
      id: `u-google-${Date.now()}`,
      name: 'Usuário Google',
      email: `google${Date.now()}@gmail.com`,
      password: 'mock',
      avatar: 'https://lh3.googleusercontent.com/ogw/AF2bZyiZ_r3iL6q-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2=s64-c-mo',
      status: 'online',
      statusMessage: 'Via Google',
      plan: 'premium' // Google login dá premium de demo
    };
    StorageService.registerUser(mockUser);
    onLoginSuccess(mockUser);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row">
        
        {/* Left Side - Brand & Info */}
        <div className="md:w-1/2 bg-blue-600 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          
          <div className="relative z-10">
            {/* Logo "Três Papéis" na AuthView */}
            <div className="relative w-12 h-12 mb-6">
                <div className="absolute top-0 right-0 w-10 h-10 bg-blue-400 rounded-xl opacity-50 transform translate-x-2 -translate-y-2"></div>
                <div className="absolute top-0 right-0 w-10 h-10 bg-blue-500 rounded-xl opacity-80 transform translate-x-1 -translate-y-1"></div>
                <div className="absolute top-0 right-0 w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-xl z-10">
                    <MessageSquare className="w-6 h-6 fill-current" />
                </div>
            </div>

            <h1 className="text-3xl font-bold mb-2">Nexus Chat</h1>
            <p className="text-blue-100 opacity-90">Sua plataforma unificada de inteligência, vendas e comunicação.</p>
          </div>

          <div className="space-y-4 relative z-10 mt-8">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg"><Zap className="w-5 h-5" /></div>
                <span>IA nativa com Gemini 2.0</span>
             </div>
             <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg"><Rocket className="w-5 h-5" /></div>
                <span>CRM e Chat integrados</span>
             </div>
             <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg"><Shield className="w-5 h-5" /></div>
                <span>Segurança e Auditoria local</span>
             </div>
          </div>

          <p className="text-xs text-blue-200 mt-8">© 2025 Nexus Inc.</p>
        </div>

        {/* Right Side - Auth Forms */}
        <div className="md:w-1/2 p-8 bg-slate-50">
          <div className="flex justify-end mb-6">
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              {isLogin ? 'Criar conta gratuita' : 'Já tenho conta'}
            </button>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">{isLogin ? 'Bem-vindo de volta' : 'Comece agora'}</h2>
          <p className="text-slate-500 text-sm mb-6">{isLogin ? 'Acesse seu painel executivo.' : 'Configure seu ambiente em segundos.'}</p>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 border border-red-200">
                {error}
            </div>
          )}

          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
            {!isLogin && (
                <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nome Completo</label>
                    <input required type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} />
                </div>
            )}
            
            <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Email</label>
                <input required type="email" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Senha</label>
                <input required type="password" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="******" value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            {!isLogin && (
                <div className="mt-4">
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Escolha seu Plano</label>
                    <div className="grid grid-cols-2 gap-3">
                        <div 
                            onClick={() => setSelectedPlan('free')}
                            className={`p-3 border rounded-xl cursor-pointer transition-all ${selectedPlan === 'free' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300'}`}
                        >
                            <div className="font-bold text-slate-800">Free</div>
                            <div className="text-xs text-slate-500 mt-1">3 Canais</div>
                            <div className="text-xs text-slate-500">5 Contatos</div>
                        </div>
                        <div 
                            onClick={() => setSelectedPlan('premium')}
                            className={`p-3 border rounded-xl cursor-pointer transition-all ${selectedPlan === 'premium' ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' : 'border-slate-200 hover:border-purple-300'}`}
                        >
                            <div className="flex justify-between items-center">
                                <div className="font-bold text-purple-800">Premium</div>
                                <span className="text-[10px] bg-purple-200 text-purple-800 px-1 rounded">PRO</span>
                            </div>
                            <div className="text-xs text-purple-600 mt-1">Ilimitado</div>
                            <div className="text-xs text-purple-600">White-label</div>
                        </div>
                    </div>
                </div>
            )}

            <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-transform active:scale-[0.98]">
                {isLogin ? 'Entrar' : 'Criar Conta'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-slate-50 text-slate-400">ou continue com</span></div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleMock}
            className="w-full border border-slate-300 bg-white text-slate-700 py-2.5 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
             <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
             Google (Demo)
          </button>

        </div>
      </div>
    </div>
  );
};