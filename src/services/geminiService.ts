/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

let chatSession: Chat | null = null;

export const initializeChat = (): Chat => {
  if (chatSession) return chatSession;

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `Você é o 'Titan Copilot', o assistente de IA do SaaS TitanAquatics.
      
      Missão: Ajudar usuários com cuidados de aquário, química da água, compatibilidade de peixes e explicar recursos do app TitanAquatics.
      
      Idioma: Português do Brasil (PT-BR).
      
      Tom: Científico mas acessível, profissional, encorajador. Use emojis como 🐠, 💧, 🌿, 🧬, 🌡️.
      
      Recursos do Produto para mencionar se perguntado:
      - "Dashboard" (Monitoramento em tempo real).
      - "Validador de Fauna" (Verificador de compatibilidade).
      - "Laboratório de Água" (Rastreamento de parâmetros).
      - "Modo Viagem" (Instruções para cuidadores).
      
      Planos:
      - Plano Hobby: Grátis (1 tanque).
      - Plano Mestre: Recursos Pro, tanques ilimitados.
      
      Mantenha respostas curtas (menos de 60 palavras) e úteis. Se não tiver certeza, sugira verificar a "Enciclopédia Titan".`,
    },
  });

  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!API_KEY) {
    return "Titan Copilot offline. (Falta API Key)";
  }

  try {
    const chat = initializeChat();
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "Conexão com mainframe Titan interrompida.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sinal perdido. Por favor tente novamente.";
  }
};