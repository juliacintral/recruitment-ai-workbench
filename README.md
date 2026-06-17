# Recruitment AI Workbench

Web app de recrutamento com 3 módulos de IA: **Job Description**, **Roteiro Técnico de Entrevista** e **LinkedIn Outreach**.

## Features

- 📄 **Job Description** — Gera JD estruturada (Location, Role Overview, Key Responsibilities com blocos temáticos, Technical Environment, Required Qualifications, Nice to Have, Project Context, rodapé com cliente + cargo + marca). Exporta em `.docx`.
- 🎯 **Roteiro Técnico** — Roteiro de entrevista de 30 minutos com blocos de tempo, perguntas, sinais de resposta forte/fraca e scorecard.
- 💬 **LinkedIn Outreach** — Rational, mensagem principal, follow-up e ganchos de personalização.
- Modo claro/escuro
- Sem banco de dados, sem autenticação
- Stateless (refresh = nova sessão)
- A JD gerada alimenta automaticamente as abas de entrevista e outreach

## Stack

- React 18 + TypeScript + Vite
- `docx` + `file-saver` para exportação .docx no browser
- Netlify Functions como proxy da OpenAI API (a chave fica no servidor)

## Rodar localmente

```bash
npm install
npm run dev
```

Crie um arquivo `.env` com:

```
OPENAI_API_KEY=sk-...
```

Para testar as Netlify Functions localmente, instale e use o CLI da Netlify:

```bash
npm install -g netlify-cli
npm install @netlify/functions
nlf dev
```

## Deploy Netlify (recomendado)

1. Conecte este repositório no [Netlify](https://app.netlify.com/).
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Adicione a variável de ambiente `OPENAI_API_KEY` nas configurações do site.
5. Deploy!

## Estrutura

```
src/
  components/     # Tabs, JDPanel, InterviewPanel, OutreachPanel, StatusBadge, OutputActions
  lib/            # aiProvider, docxExporter, formatters, clipboard
  prompts.ts      # Prompts mestres de cada módulo
  schemas.ts      # JSON Schemas para Structured Outputs da OpenAI
  types.ts        # Tipos TypeScript
netnlify/
  functions/
    ai-proxy.ts   # Proxy serverless que chama a OpenAI com a chave do servidor
```

---

Feito com ❤️ por [juliacintral](https://github.com/juliacintral)
