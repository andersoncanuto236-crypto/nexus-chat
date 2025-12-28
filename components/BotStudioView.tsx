import React, { useState } from 'react';
import { BotConfig, Contact, Channel } from '../types';
import { Bot, Save, Play, Terminal, Sliders, Activity } from 'lucide-react';
import { runBotAudit } from '../services/geminiService';

interface BotStudioViewProps {
  contacts: Contact[];
  channels: Channel[];
}

export const BotStudioView: React.FC<BotStudioViewProps> = ({ contacts, channels }) => {
  const [config, setConfig] = useState<BotConfig>({
    name: 'Nexus Bot',
    role: 'auditor',
    personality: 'Você é um auditor rigoroso focado em eficiência e cumprimento de metas. Seja direto.',
    focusAreas: ['kpi']
  });
  
  const [auditResult, setAuditResult] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunBot = async () => {
    setIsRunning(true);
    setAuditResult(null);
    const result = await runBotAudit(config, contacts, channels);
    setAuditResult(result);
    setIsRunning(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="px-8 py-6 bg-white border-b shrink-0 flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Bot Studio</h2>
            <p className="text-slate-500">Crie e configure sua IA para automatizar análises.</p>
        </div>
        <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <Bot className="w-4 h-4" /> Beta
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden p-8 gap-8">
        {/* Configuration Panel */}
        <div className="w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-y-auto">
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 text-slate-800 font-semibold border-b pb-2">
                    <Sliders className="w-5 h-5" /> Configuração do Bot
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Bot</label>
                    <input 
                        type="text" 
                        value={config.name}
                        onChange={e => setConfig({...config, name: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Função (Role)</label>
                    <select 
                        value={config.role}
                        onChange={e => setConfig({...config, role: e.target.value as any})}
                        className="w-full px-3 py-2 border rounded-lg bg-white"
                    >
                        <option value="auditor">Auditor (Foco em Erros/KPIs)</option>
                        <option value="manager">Gerente (Foco em Estratégia)</option>
                        <option value="assistant">Assistente (Foco em Operacional)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Prompt de Personalidade (System Instruction)</label>
                    <textarea 
                        value={config.personality}
                        onChange={e => setConfig({...config, personality: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg h-32 resize-none text-sm"
                        placeholder="Descreva como o bot deve se comportar..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Áreas de Atuação</label>
                    <div className="space-y-2">
                        {['kpi', 'support', 'sales'].map(area => (
                            <label key={area} className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={config.focusAreas.includes(area)}
                                    onChange={e => {
                                        const newAreas = e.target.checked 
                                            ? [...config.focusAreas, area]
                                            : config.focusAreas.filter(a => a !== area);
                                        setConfig({...config, focusAreas: newAreas});
                                    }}
                                    className="rounded text-purple-600 focus:ring-purple-500"
                                />
                                <span className="text-sm text-slate-600 uppercase">{area}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <button className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white py-2 rounded-lg hover:bg-slate-900 transition-colors">
                    <Save className="w-4 h-4" /> Salvar Configuração
                </button>
            </div>
        </div>

        {/* Execution/Preview Panel */}
        <div className="flex-1 flex flex-col gap-6">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-lg">Executar Análise Geral</h3>
                    <p className="text-slate-400 text-sm">O Bot irá ler todos os dados do CRM e canais para gerar um relatório.</p>
                </div>
                <button 
                    onClick={handleRunBot}
                    disabled={isRunning}
                    className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${isRunning ? 'bg-slate-700 cursor-wait' : 'bg-purple-600 hover:bg-purple-500 hover:shadow-purple-500/25 shadow-lg'}`}
                >
                    {isRunning ? <Activity className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                    {isRunning ? 'Processando...' : 'Rodar Análise'}
                </button>
            </div>

            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                <div className="bg-slate-50 border-b px-4 py-3 flex items-center gap-2 text-slate-600 font-mono text-xs uppercase tracking-wider">
                    <Terminal className="w-4 h-4" /> Output Console
                </div>
                <div className="flex-1 p-6 overflow-y-auto font-mono text-sm leading-relaxed whitespace-pre-wrap">
                    {!auditResult && !isRunning && <span className="text-slate-400">Aguardando execução...</span>}
                    {isRunning && <span className="text-purple-600 animate-pulse">Analisando dados... Conectando ao Gemini...</span>}
                    {auditResult}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
