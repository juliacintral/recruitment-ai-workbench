# Recruitment AI Workbench

Esse projeto nasceu de uma necessidade real: eu precisava de uma ferramenta que me ajudasse a criar JDs, roteiros de entrevista e mensagens de outreach de forma rápida — sem depender de uma assinatura paga ou de copiar e colar em 3 abas diferentes.

São 3 módulos que se conectam: você cria a vaga e o conteúdo gerado já alimenta a entrevista e o outreach automaticamente.

## O que tem aqui

- **Job Description** — Gera JD estruturada com blocos de responsabilidades, stack técnica, qualificações e contexto do projeto. Exporta direto em `.docx`.
- **Roteiro Técnico** — Entrevista de 30 minutos com blocos de tempo, perguntas abertas, e sinais de resposta forte ou fraca. Vai direto pro scorecard.
- **LinkedIn Outreach** — Mensagem principal, follow-up e ganchos de personalização. Tudo pronto pra mandar.

Sem banco de dados. Sem login. Atualizar a página zera tudo — é intencional.

## Stack

- React 18 + TypeScript + Vite
- `docx` + `file-saver` pra exportar `.docx` no browser
- Netlify Functions como proxy da Groq API (a chave fica no servidor, nunca exposta no front)
- Modelo: `meta-llama/llama-4-scout-17b-16e-instruct` — gratuito, sem precisar de cartão

## Rodando local

```bash
npm install
```

Crie um `.env` com:

```
GROQ_API_KEY=gsk_...
```

Chave gratuita em: https://console.groq.com

Pra testar as Netlify Functions localmente:

```bash
npm install -g netlify-cli
npm install @netlify/functions
nlf dev
```

## Deploy no Netlify

1. Conecte o repositório no [Netlify](https://app.netlify.com/)
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Em **Environment variables**, adicione `GROQ_API_KEY`
5. Deploy 🚀

## Estrutura

```
src/
  components/     # Tabs, JDPanel, InterviewPanel, OutreachPanel, StatusBadge, OutputActions
  lib/            # aiProvider, docxExporter, formatters, clipboard
  prompts.ts      # Prompts de cada módulo
  schemas.ts      # JSON Schemas pra Structured Outputs
  types.ts        # Tipos TypeScript
netlify/
  functions/
    ai-proxy.ts   # Proxy serverless que chama a Groq com a chave do servidor
```

---

Feito com ❤️ juliacintral
