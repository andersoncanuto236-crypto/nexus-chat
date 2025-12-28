
import { GoogleGenAI } from "@google/genai";
import { Message, Contact, BotConfig, Server } from "../types";
import { StorageService } from "./storageService";

// Helper to get client with dynamic key
const getClient = () => {
  // Tenta pegar do storage (configurado pelo usuário) ou fallback para env var
  const apiKey = StorageService.getApiKey() || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key não configurada. Vá em Configurações > APIs.");
  }
  return new GoogleGenAI({ apiKey });
};

const MODEL_FAST = 'gemini-3-flash-preview';
const MODEL_SMART = 'gemini-3-pro-preview';

export const summarizeChannel = async (channelName: string, messages: Message[]): Promise<string> => {
  if (messages.length === 0) return "Não há mensagens para resumir.";

  try {
    const ai = getClient();
    const messageText = messages.map(m => `${m.senderId}: ${m.content}`).join('\n');
    const prompt = `Resuma as discussões recentes no canal #${channelName}. Aqui estão as mensagens:\n\n${messageText}\n\nFoque nos pontos de ação e decisões.`;

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
    });
    return response.text || "Não foi possível gerar um resumo.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return `Erro de IA: ${error.message || 'Verifique sua API Key'}`;
  }
};

export const generateEmailDraft = async (contact: Contact, objective: string): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `
      Escreva um email profissional curto para ${contact.name} da empresa ${contact.company}.
      Contexto do cliente:
      - Estágio do funil: ${contact.stage}
      - Notas: ${contact.notes}
      - Valor potencial: R$ ${contact.value}
      
      Objetivo do email: ${objective}
      
      O tom deve ser cordial e persuasivo. Apenas o corpo do email.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_SMART,
      contents: prompt,
    });
    return response.text || "Erro ao gerar email.";
  } catch (error: any) {
    return `Erro de IA: ${error.message || 'Verifique sua API Key'}`;
  }
};

export const analyzeDealHealth = async (contact: Contact): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `
      Analise a saúde desta oportunidade de venda (Deal) e sugira o próximo passo.
      Cliente: ${contact.company}
      Valor: ${contact.value}
      Estágio: ${contact.stage}
      Notas: ${contact.notes}
      Última atividade: ${contact.lastActivity.toLocaleDateString()}
      
      Responda em um parágrafo curto com uma sugestão tática.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
    });
    return response.text || "Análise indisponível.";
  } catch (error) {
    return "Erro na análise de IA.";
  }
};

export const generateBusinessInsight = async (contacts: Contact[], totalPipeline: number, wonValue: number): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `
      Atue como um diretor comercial experiente. Analise os dados atuais do meu CRM:
      - Total em Pipeline (aberto): R$ ${totalPipeline}
      - Total Fechado (won): R$ ${wonValue}
      - Contagem de Deals: ${contacts.length}
      
      Dê um "Briefing Matinal" curto (máximo 3 frases) com uma estratégia motivacional ou alerta sobre onde focar hoje.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
    });
    return response.text || "Foque em fechar os deals em negociação.";
  } catch (error) {
    return "Configure sua API Key para receber insights.";
  }
};

// Novo: Resumo Completo do Lead para o CRM
export const summarizeLead = async (contact: Contact): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `
      Crie um perfil executivo resumido para este lead:
      Nome: ${contact.name}
      Empresa: ${contact.company}
      Histórico: ${contact.notes}
      Estágio: ${contact.stage}
      
      Formato:
      1. Perfil (Quem são)
      2. Necessidade (O que precisam, infira das notas)
      3. Probabilidade de Fechamento (Baixa/Média/Alta com justificativa)
    `;

    const response = await ai.models.generateContent({
      model: MODEL_SMART,
      contents: prompt,
    });
    return response.text || "Não foi possível gerar o resumo.";
  } catch (error) {
    return "Erro ao gerar resumo do lead.";
  }
};

// Novo: Bot Audit para o Bot Studio
export const runBotAudit = async (botConfig: BotConfig, contacts: Contact[], channels: any[]): Promise<string> => {
  try {
    const ai = getClient();
    const dataContext = `
      Dados do CRM: ${contacts.length} contatos. Valor total pipeline: ${contacts.reduce((a,b)=>a+b.value,0)}.
      Dados do Chat: ${channels.length} canais ativos.
    `;
    
    const prompt = `
      Você é um Bot Corporativo configurado da seguinte forma:
      Nome: ${botConfig.name}
      Role: ${botConfig.role}
      Personalidade: ${botConfig.personality}
      Áreas de Foco: ${botConfig.focusAreas.join(', ')}

      Analise os seguintes dados operacionais e forneça um relatório seguindo estritamente sua personalidade:
      ${dataContext}
      
      O relatório deve conter críticas construtivas, elogios e metas sugeridas.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_SMART,
      contents: prompt,
    });
    return response.text || "O Bot não conseguiu processar os dados.";
  } catch (error) {
    return "Erro ao executar o Bot. Verifique a API Key.";
  }
};

// --- SUPER ADMIN REPORT ---
export const generateAdminReport = async (servers: Server[]): Promise<string> => {
    try {
        const ai = getClient();
        const serverData = servers.map(s => 
            `- Empresa: ${s.name} (Usuários: ${s.userCount}). Status Pagamento: ${s.paymentStatus.toUpperCase()}. Ativo em: ${new Date(s.lastActive).toLocaleDateString()}`
        ).join('\n');

        const prompt = `
            ATENÇÃO: Você é o Bot Auditor do Sistema NEXUS (Super Admin).
            
            Analise a lista de servidores abaixo e gere um relatório financeiro e de risco para o Administrador (Anderson).
            
            DADOS DOS SERVIDORES:
            ${serverData}

            FORMATO DO RELATÓRIO:
            1. **Resumo Geral**: Quantos servidores pagantes vs atrasados.
            2. **Alerta de Inadimplência**: Liste explicitamente as empresas com pagamento 'OVERDUE' e sugira ação de cobrança.
            3. **Saúde do Sistema**: Baseado na atividade recente, o sistema está saudável?
            
            Seja direto, formal e use emojis para status (🔴 Atrasado, 🟢 Pago).
        `;

        const response = await ai.models.generateContent({
            model: MODEL_SMART,
            contents: prompt,
        });
        return response.text || "Erro ao gerar relatório administrativo.";

    } catch (error) {
        return "Erro na API do Admin Bot.";
    }
}
