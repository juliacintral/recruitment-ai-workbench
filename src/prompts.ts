import type { Language } from './types'

const lang = (l: Language) => (l === 'pt-BR' ? 'Português do Brasil' : 'English')

export function buildJDPrompt(input: {
  cargo: string
  idioma: Language
  cliente: string
  brand: string
  especificidades?: string
  additionalContext?: string
}) {
  return `
Você é um especialista sênior em recrutamento técnico e escrita de job descriptions consultivas.

Crie uma Job Description completa, madura e altamente específica.

Siga esta estrutura obrigatória:
1. Título da vaga
2. Location
3. Role Overview
4. Key Responsibilities
5. Technical Environment
6. Required Qualifications
7. Nice to Have
8. Project Context
9. Linha final com [Cliente] -- [Cargo] -- [Identificação]

Regras:
- Seja específico.
- Não use frases genéricas e vazias.
- Escreva como recrutador experiente.
- Se faltarem dados, faça inferências realistas.
- Organize responsabilidades por blocos temáticos.
- Em Key Responsibilities, use blocos como: Implementation & Development, Subject Matter Expertise, Operational Support.
- Em Technical Environment, use subseções como Platform e Scope quando fizer sentido.
- Tom enterprise e consultivo.
- Não escreva explicações fora da estrutura.

Idioma: ${lang(input.idioma)}

Cargo: ${input.cargo}
Cliente: ${input.cliente}
Identificação final: ${input.brand}
Especificidades: ${input.especificidades || 'N/A'}
Contexto adicional: ${input.additionalContext || 'N/A'}
`.trim()
}

export function buildInterviewPrompt(input: {
  idioma: Language
  foco?: string
  jobDescription: string
}) {
  return `
Você é um entrevistador técnico sênior.

Com base na job description abaixo, crie um roteiro de entrevista técnica de 30 minutos.

Obrigatório:
- blocos de tempo (ex: 0-5min, 5-15min, 15-25min, 25-30min)
- 6 a 8 perguntas técnicas objetivas
- o que cada pergunta valida
- sinais de resposta forte
- sinais de resposta fraca
- scorecard resumido final com critérios e o que boa resposta significa

Idioma: ${lang(input.idioma)}
Foco adicional: ${input.foco || 'N/A'}

Base da vaga:
${input.jobDescription}
`.trim()
}

export function buildOutreachPrompt(input: {
  idioma: Language
  persona?: string
  jobDescription: string
}) {
  return `
Você é um recrutador estratégico com excelente escrita para abordagem de candidatos passivos no LinkedIn.

Com base na vaga abaixo, crie:
1. Rational curto da proposta de valor
2. Mensagem principal pronta para envio
3. Follow-up curto
4. 3 ganchos de personalização

Regras:
- Tom humano
- Tom consultivo
- Ser convincente sem soar artificial
- Ser específico para a posição
- Evitar mensagem genérica de recrutador

Idioma: ${lang(input.idioma)}
Direcionamento opcional: ${input.persona || 'N/A'}

Base da vaga:
${input.jobDescription}
`.trim()
}
