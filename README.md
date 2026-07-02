# Recruitment AI Workbench

> Ferramenta de recrutamento com IA para gerar Job Descriptions, roteiros de entrevista e mensagens de outreach — integrado, rápido e sem custo de licença.

Nasceu de uma necessidade real: centralizar em um só lugar o que normalmente fica espalhado em 3 abas, 2 ferramentas pagas e várias idas e vindas. Os 3 módulos se conectam: o que você cria na vaga já alimenta automaticamente a entrevista e o outreach.

## Módulos

**Job Description**
Gera JD estruturada com responsabilidades, stack técnica, qualificações e contexto do projeto. Exporta direto em `.docx`.

**Roteiro Técnico**
Entrevista de 30 minutos com blocos de tempo, perguntas abertas e sinais de resposta forte ou fraca. Alimenta o scorecard automaticamente.

**LinkedIn Outreach**
Mensagem principal, follow-up e ganchos de personalização prontos para envio.

> Sem banco de dados. Sem login. Atualizar a página zera tudo — é intencional.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Exportação | `docx` + `file-saver` (gera `.docx` no browser) |
| Backend | Netlify Functions (proxy serverless da Groq API) |
| Modelo de IA | `meta-llama/llama-4-scout-17b-16e-instruct` (gratuito, sem cartão) |

A chave da API fica no servidor via Netlify Functions — nunca exposta no frontend.

## Estrutura do projeto

```
src/
  components/     # Tabs, JDPanel, InterviewPanel, OutreachPanel, StatusBadge, OutputActions
  lib/            # aiProvider, docxExporter, formatters, clipboard
  prompts.ts      # Prompts de cada módulo
  schemas.ts      # JSON Schemas para Structured Outputs
  types.ts        # Tipos TypeScript
netlify/
  functions/
    ai-proxy.ts   # Proxy que chama a Groq com a chave do servidor
```

## Rodando localmente

```bash
npm install
```

Crie um arquivo `.env` na raiz:

```env
GROQ_API_KEY=gsk_...
```

Chave gratuita em: [console.groq.com](https://console.groq.com)

Para testar as Netlify Functions localmente:

```bash
npm install -g netlify-cli
npm install @netlify/functions
nlf dev
```

## Deploy no Netlify

1. Conecte o repositório em [app.netlify.com](https://app.netlify.com/)
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Em **Environment variables**, adicione `GROQ_API_KEY`
5. Deploy 🚀

---

Feito com ❤️ por [juliacintral](https://github.com/juliacintral)
