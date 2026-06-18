import type { Language } from './types'

const langLabel = (l: Language) => (l === 'pt-BR' ? 'Português do Brasil' : 'English')

export function buildJDPrompt(input: {
  cargo: string
  idioma: Language
  cliente: string
  brand: string
  especificidades?: string
  additionalContext?: string
}) {
  return `Você é um especialista sênior em recrutamento técnico e escrita de job descriptions consultivas.

Crie uma Job Description completa, madura e altamente específica. Retorne apenas JSON.

Estrutura obrigatória:
1. title — string
2. location — string
3. roleOverview — parágrafo descritivo
4. keyResponsibilities — array de { theme, items[] }. Blocos temáticos obrigatórios (ex: Implementation & Development, Subject Matter Expertise, Operational Support)
5. technicalEnvironment — { platform[], scope[], additional[{ label, items[] }] }
6. requiredQualifications — array de strings
7. niceToHave — array de strings
8. projectContext — parágrafo de contexto
9. footerLine — EXATAMENTE: "${input.cliente} -- [título da vaga] -- ${input.brand}"

Regras:
- Específico, sem frases genéricas
- Tom enterprise e consultivo
- Inferências realistas se faltar dado
- Responsabilidades em blocos temáticos
- Pronto para envio ao mercado

Idioma: ${langLabel(input.idioma)}
Cargo: ${input.cargo}
Cliente: ${input.cliente}
Especificidades: ${input.especificidades || 'N/A'}
Contexto adicional: ${input.additionalContext || 'N/A'}`
}

export function buildInterviewPrompt(input: {
  idioma: Language
  foco?: string
  jobDescription: string
}) {
  return `Você é um entrevistador técnico sênior. Retorne apenas JSON.

Crie um roteiro de entrevista técnica de 30 minutos com base na JD abaixo.

Obrigatório:
- 4 blocos: Abertura (0–5min), Bloco Técnico 1 (5–15min), Bloco Técnico 2 (15–25min), Encerramento (25–30min)
- 6 a 8 perguntas técnicas objetivas
- Para cada pergunta: question, objective, strongSignals[], weakSignals[]
- Scorecard resumido: criterion + whatGoodLooksLike

Idioma: ${langLabel(input.idioma)}
Foco: ${input.foco || 'N/A'}

JD:
${input.jobDescription}`
}

export function buildOutreachPrompt(input: {
  candidateName?: string
  profileInfo?: string
  jobDescription: string
}) {
  return `Você é um Senior Talent Acquisition Partner especializado em tech. Retorne apenas JSON com 4 campos.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
messagePT — Mensagem completa em Português do Brasil
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Estrutura obrigatória (5 partes):
1. ABERTURA — cumprimente usando info do perfil se disponível. Sem "Espero que esteja bem".
2. OPORTUNIDADE — uma frase com cargo + contexto do projeto.
3. DIFERENCIAIS — 3 a 5 bullets. Prioridade: impacto > liderança > exposição internacional > arquitetura > desafios técnicos > autonomia > inovação > stack. Tech stack só no último bullet.
4. ADERÊNCIA — uma frase conectando perfil e vaga.
5. CTA leve — ex: "Faz sentido conversarmos?"

Regras: curta (lida em <30s), sem genéricos, tom humano e consultivo, máx 1 emoji (preferir zero).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
messageEN — Full message in English
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Same 5-part structure in English:
1. OPENING — greet using profile info if available. No "Hope you're doing well".
2. OPPORTUNITY — one sentence: role + project context.
3. KEY HIGHLIGHTS — 3–5 bullets. Priority: impact > leadership > international exposure > architecture > technical challenges > autonomy > innovation > stack.
4. FIT — one sentence connecting their background to the role.
5. Light CTA — ex: "Would you be open to a quick chat?"

Same rules: short, human, consultive, no generic openers, max 1 emoji (prefer zero).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
notePT — Nota de convite LinkedIn em Português (MÁXIMO 280 CARACTERES)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Usada no campo de nota ao enviar convite de conexão.
- Mencione o aspecto mais relevante da vaga
- Sinalize que tem uma oportunidade interessante
- Tom direto, humano, sem bullets, sem lista, zero emoji
- NUNCA ultrapasse 280 caracteres
Exemplo: "Olá! Tenho uma vaga de Senior Data Engineer em projeto global de missão crítica que pode fazer sentido para o seu perfil. Gostaria de conectar para compartilhar mais detalhes."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
noteEN — LinkedIn connection note in English (MAX 280 CHARACTERS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Same rules as notePT but in English. Absolute max 280 characters.
Example: "Hi! I have a Senior Data Engineer opening on a global mission-critical project that might be a strong fit for your background. Would love to connect and share more."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nome do candidato: ${input.candidateName || 'não informado'}
Informações do perfil: ${input.profileInfo || 'não informadas'}

Job Description:
${input.jobDescription}`
}
