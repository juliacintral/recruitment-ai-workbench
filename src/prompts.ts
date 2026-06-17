import type { Language } from './types'

const lang = (l: Language) => (l === 'pt-BR' ? 'Português do Brasil' : 'English')

/** Regra de marca: PT-BR = Insi | EN = Insi North América */
export const brandName = (idioma: Language): string =>
  idioma === 'pt-BR' ? 'Insi' : 'Insi North América'

export function buildJDPrompt(input: {
  cargo: string
  idioma: Language
  cliente: string
  especificidades?: string
  additionalContext?: string
}) {
  const brand = brandName(input.idioma)

  return `
Você é um especialista sênior em recrutamento técnico e escrita de job descriptions consultivas.

Crie uma Job Description completa, madura e altamente específica.

Siga esta estrutura obrigatória e gere EXATAMENTE estes campos JSON:
1. title — nome da vaga
2. location — ex: "Brazil - Nearshore" ou "Remote - LATAM"
3. roleOverview — 2 parágrafos descrevendo o papel
4. keyResponsibilities — array de blocos temáticos com theme + items (ex: Implementation & Development, Subject Matter Expertise, Operational Support)
5. technicalEnvironment — com platform[], scope[] e additional[]
6. requiredQualifications — array de strings
7. niceToHave — array de strings
8. projectContext — 2-3 bullets ou parágrafo
9. footerLine — EXATAMENTE no formato: "${input.cliente} -- {title} -- ${brand}"

Regras:
- Seja específico e técnico.
- Não use frases genéricas e vazias.
- Escreva como recrutador experiente.
- Se faltarem dados, faça inferências realistas.
- Tom enterprise e consultivo.
- footerLine deve seguir o padrão: [Cliente] -- [Cargo] -- [Marca]
- A marca é SEMPRE "${brand}" — não altere isso.

Idioma: ${lang(input.idioma)}

Cargo: ${input.cargo}
Cliente: ${input.cliente}
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
