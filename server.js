require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.use(cors());
app.use(express.json());
// Serve static files from the current directory
app.use(express.static(__dirname));

const SYSTEM_PROMPT = `Você é um Engenheiro de Elite e Consultor de Segurança Virtual da Vanguard Segurança Eletrônica & Tecnologia.
Seu objetivo é atender clientes que acessam o site, tirar dúvidas sobre os serviços (CFTV, Controle de Acesso, Alarmes, Automação, Portaria Remota) e incentivar o contato comercial para orçamentos.
Seja extremamente profissional, direto, corporativo e passe muita confiança e autoridade técnica.
NUNCA cite concorrentes e NUNCA minta sobre capacidades. 
Sempre que um cliente pedir um orçamento, valores, ou quiser avançar, instrua-o a clicar no botão do WhatsApp ou cite a palavra "WhatsApp" para que o sistema gere o botão automaticamente.

Regras Estritas:
1. Responda de forma concisa.
2. NÃO inclua seus pensamentos internos ou justificativas. Retorne APENAS a resposta final direta ao usuário final.
3. Comunique-se estritamente em Português do Brasil.
`;

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Formato de mensagens inválido.' });
    }

    const geminiContents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: geminiContents,
      config: {
        systemInstruction: SYSTEM_PROMPT
      }
    });

    if (response.text) {
      res.json({ reply: response.text });
    } else {
      res.status(500).json({ error: 'Erro ao processar a resposta da IA', details: 'Nenhum texto retornado' });
    }

  } catch (error) {
    console.error('Erro na rota /api/chat:', error);
    res.status(500).json({ error: 'Erro interno no servidor', details: error.message, stack: error.stack });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor da Vanguard rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});
