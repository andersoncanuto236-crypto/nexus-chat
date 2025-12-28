import React, { useState } from 'react';
import { AppView, PlanType } from '../types';
import { MessageSquare, BarChart2, Bot, CheckCircle2, ChevronRight, X, LayoutDashboard, Crown, Shield } from 'lucide-react';

interface OnboardingModalProps {
  onFinish: () => void;
  userName: string;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onFinish, userName }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: `Bem-vindo, ${userName.split(' ')[0]}!`,
      description: "O Nexus Chat é sua nova central de comando. Unimos comunicação de equipe, CRM de vendas e Inteligência Artificial em um único lugar.",
      icon: <LayoutDashboard className="w-16 h-16 text-blue-600" />,
      color: "bg-blue-50"
    },
    {
      title: "Chat & Colaboração",
      description: "Crie canais para projetos, troque mensagens em tempo real e use a IA para resumir conversas longas com um clique.",
      icon: <MessageSquare className="w-16 h-16 text-indigo-600" />,
      color: "bg-indigo-50"
    },
    {
      title: "CRM Inteligente",
      description: "Gerencie seu funil de vendas visualmente. Mova cards, analise a saúde dos deals com IA e integre diretamente com WhatsApp e Agenda.",
      icon: <BarChart2 className="w-16 h-16 text-emerald-600" />,
      color: "bg-emerald-50"
    },
    {
      title: "Bot Studio (Beta)",
      description: "Configure agentes de IA personalizados para auditar seus dados, sugerir estratégias e encontrar erros no processo.",
      icon: <Bot className="w-16 h-16 text-purple-600" />,
      color: "bg-purple-50"
    },
    {
      title: "Planos Disponíveis",
      description: "Escolha como você quer escalar sua operação.",
      isPlanStep: true,
      color: "bg-slate-50"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onFinish();
    }
  };

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col md:flex-row min-h-[500px] animate-in zoom-in-95 duration-300">
        
        {/* Left Side (Visual) */}
        <div className={`md:w-5/12 ${currentStep.color} p-8 flex flex-col items-center justify-center text-center transition-colors duration-500`}>
          <div className="mb-6 p-4 bg-white rounded-full shadow-lg scale-110 transition-transform duration-500">
            {currentStep.icon || <Crown className="w-16 h-16 text-amber-500" />}
          </div>
          <div className="flex gap-1 mt-8">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-slate-800' : 'w-2 bg-slate-300'}`} />
            ))}
          </div>
        </div>

        {/* Right Side (Content) */}
        <div className="md:w-7/12 p-8 flex flex-col justify-between">
          <div className="mt-4">
             {currentStep.isPlanStep ? (
               <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-slate-800">Escolha seu Poder</h2>
                  <div className="space-y-3">
                    <div className="p-3 border border-slate-200 rounded-xl">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-slate-700">Free</span>
                            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">Atual</span>
                        </div>
                        <p className="text-xs text-slate-500">Acesso básico ao CRM e Chat. Ideal para testar.</p>
                    </div>
                    <div className="p-3 border border-purple-200 bg-purple-50 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">RECOMENDADO</div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-purple-800 flex items-center gap-1"><Crown className="w-4 h-4" /> Premium</span>
                        </div>
                        <ul className="text-xs text-purple-700 space-y-1 mt-2">
                            <li className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> White-label (Sua marca)</li>
                            <li className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> IA Ilimitada</li>
                            <li className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Suporte Prioritário</li>
                        </ul>
                    </div>
                  </div>
               </div>
             ) : (
               <div className="space-y-4 animate-in slide-in-from-right-4 duration-300" key={step}>
                  <h2 className="text-3xl font-bold text-slate-800">{currentStep.title}</h2>
                  <p className="text-lg text-slate-500 leading-relaxed">{currentStep.description}</p>
               </div>
             )}
          </div>

          <div className="flex justify-between items-center mt-8">
            <button 
                onClick={onFinish}
                className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
            >
                Pular tour
            </button>
            <button 
                onClick={handleNext}
                className="group flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
            >
                {step === steps.length - 1 ? 'Começar a Usar' : 'Próximo'}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
