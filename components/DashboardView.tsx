import React, { useEffect, useState } from 'react';
import { Contact, DealStage } from '../types';
import { generateBusinessInsight } from '../services/geminiService';
import { TrendingUp, Target, Briefcase, Award, AlertCircle, Sparkles, ArrowUpRight, Download, Printer } from 'lucide-react';

interface DashboardViewProps {
  contacts: Contact[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ contacts }) => {
  const [insight, setInsight] = useState<string>('Carregando análise estratégica...');
  
  // Metrics Calculation
  const wonContacts = contacts.filter(c => c.stage === DealStage.WON);
  const openContacts = contacts.filter(c => c.stage !== DealStage.WON && c.stage !== DealStage.LOST);
  
  const totalWon = wonContacts.reduce((acc, c) => acc + c.value, 0);
  const totalPipeline = openContacts.reduce((acc, c) => acc + c.value, 0);
  const avgDealSize = contacts.length > 0 ? (totalWon + totalPipeline) / contacts.length : 0;
  
  // Goal Settings
  const MONTHLY_GOAL = 300000; 
  const progressPercentage = Math.min(Math.round((totalWon / MONTHLY_GOAL) * 100), 100);

  const priorityDeals = openContacts
    .filter(c => c.stage === DealStage.NEGOTIATION || c.stage === DealStage.PROPOSAL)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  useEffect(() => {
    let isMounted = true;
    generateBusinessInsight(contacts, totalPipeline, totalWon).then(text => {
      if (isMounted) setInsight(text);
    });
    return () => { isMounted = false; };
  }, [contacts]);

  const handlePresentation = () => {
    window.print();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto print:bg-white">
      {/* Header */}
      <div className="px-8 py-6 bg-white border-b sticky top-0 z-10 flex justify-between items-center print:hidden">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Visão Geral</h2>
            <p className="text-slate-500">Bem-vindo de volta! Aqui está o pulso do seu negócio hoje.</p>
        </div>
        <button 
            onClick={handlePresentation}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
        >
            <Printer className="w-4 h-4" /> Modo Apresentação / PDF
        </button>
      </div>

      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full print:p-0 print:max-w-none">
        
        {/* AI Insight Card */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden print:bg-none print:bg-purple-600 print:text-white print:break-inside-avoid">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="flex items-start gap-4 relative z-10">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Sparkles className="w-6 h-6 text-yellow-300" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-purple-200 uppercase tracking-wider mb-1">Nexus AI Strategy</h3>
                    <p className="text-lg font-medium leading-relaxed">{insight}</p>
                </div>
            </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col print:border-slate-300">
                <span className="text-slate-400 text-sm font-medium flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4" /> Receita Confirmada
                </span>
                <div className="text-3xl font-bold text-slate-800 mb-1">{formatCurrency(totalWon)}</div>
                <div className="text-sm text-emerald-600 font-medium bg-emerald-50 self-start px-2 py-0.5 rounded-full print:bg-transparent">
                    {contacts.filter(c => c.stage === DealStage.WON).length} deals fechados
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col print:border-slate-300">
                <span className="text-slate-400 text-sm font-medium flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4" /> Em Pipeline
                </span>
                <div className="text-3xl font-bold text-slate-800 mb-1">{formatCurrency(totalPipeline)}</div>
                <div className="text-sm text-blue-600 font-medium bg-blue-50 self-start px-2 py-0.5 rounded-full print:bg-transparent">
                    {openContacts.length} oportunidades ativas
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col print:border-slate-300">
                <span className="text-slate-400 text-sm font-medium flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4" /> Ticket Médio
                </span>
                <div className="text-3xl font-bold text-slate-800 mb-1">{formatCurrency(avgDealSize)}</div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:grid-cols-2">
            {/* Goal Progress Section */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm print:break-inside-avoid print:border-slate-300">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        Meta Mensal
                    </h3>
                    <span className="text-sm text-slate-500">Objetivo: {formatCurrency(MONTHLY_GOAL)}</span>
                </div>

                <div className="relative pt-4 pb-8">
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden print:border print:border-slate-200">
                        <div 
                            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full print:bg-emerald-500"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs font-semibold text-slate-400">
                        <span>R$ 0</span>
                        <span className="text-emerald-600">{progressPercentage}% Atingido</span>
                        <span>{formatCurrency(MONTHLY_GOAL)}</span>
                    </div>
                </div>
            </div>

            {/* Priority Deals List */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm print:break-inside-avoid print:border-slate-300">
                 <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-500" />
                    Foco Prioritário
                </h3>
                <div className="space-y-3">
                    {priorityDeals.length > 0 ? priorityDeals.map(deal => (
                        <div key={deal.id} className="p-3 bg-slate-50 rounded-xl border border-transparent print:border-slate-200">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold text-slate-700">{deal.company}</span>
                                <span className="text-xs bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">{deal.stage}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-emerald-600">{formatCurrency(deal.value)}</span>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-8 text-slate-400 text-sm">
                            Nenhum deal em fase final encontrado.
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
