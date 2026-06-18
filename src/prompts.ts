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
  return `
Você é um especialista sênior em recrutamento técnico e escrita de job descriptions consultivas.

Crie uma Job Description completa, madura e altamente específica.

Estrutura obrigatória (gere exatamente estes campos JSON):
1. title
2. location
3. roleOverview
4. keyResponsibilities — array de { theme, items[] }. Use blocos temáticos como Implementation & Development, Subject Matter Expertise, Operational Support quando aplicável.
5. technicalEnvironment — { platform[], scope[], additional[{ label, items[] }] }
6. requiredQualifications — array de strings
7. niceToHave — array de strings
8. projectContext — parágrafo de contexto
9. footerLine — EXATAMENTE: "${input.cliente} -- [title da vaga] -- ${input.brand}"

Regras:
- Específico, sem frases genéricas ou vazias.
- Tom enterprise e consultivo.
- Se faltarem dados, faça inferências realistas de mercado.
- Responsabilidades organizadas por blocos temáticos.
- Saída pronta para mercado.

Idioma: ${langLabel(input.idioma)}
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
- 4 blocos de tempo: Abertura (0-5min), Bloco Técnico 1 (5-15min), Bloco Técnico 2 (15-25min), Encerramento (25-30min)
- 6 a 8 perguntas técnicas objetivas e úteis
- Para cada pergunta: objetivo da validação, sinais de resposta forte, sinais de resposta fraca
- Scorecard resumido no final

Idioma: ${langLabel(input.idioma)}
Foco adicional: ${input.foco || 'N/A'}

Base da vaga:
${input.jobDescription}
`.trim()
}

export function buildOutreachPrompt(input: {
  candidateName?: string
  profileInfo?: string
  jobDescription: string
}) {
  return `
Você é um Senior Talent Acquisition Partner especializado em recrutamento de profissionais de tecnologia.
Escreva mensagens de primeiro contato no LinkedIn que pareçam de um recrutador humano experiente — não de uma IA.

Gere EXATAMENTE os 4 campos JSON abaixo:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
messagePT — Mensagem completa em Português do Brasil
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Estrutura obrigatória:
1. ABERTURA — cumprimente. Se houver info do perfil, use-a naturalmente para justificar o contato. Não invente dados.
   Exemplos: "Seu perfil chamou minha atenção..." / "Vi sua trajetória em..."
2. OPORTUNIDADE — uma frase com a posição e o contexto.
   Exemplo: "Estou recrutando para uma posição de Lead Data Engineer em projeto global do setor financeiro."
3. DIFERENCIAIS — 3 a 5 bullets curtos. Nunca copie a JD.
   Prioridade: impacto do projeto → liderança → exposição internacional → arquitetura → desafios técnicos → autonomia → inovação → missão crítica → tecnologias modernas.
   Tecnologias só ao final. Máximo 5 bullets.
4. ADERÊNCIA — uma frase conectando perfil e vaga.
   Exemplo: "Acredito que sua experiência faz bastante sentido para esse desafio."
5. CTA leve, sem pressão.
   Exemplo: "Faz sentido conversarmos?" / "Posso compartilhar mais detalhes?"

Regras:
- Curta: legível em menos de 30 segundos.
- Sem genéricos: proibido "Espero que esteja bem", "Fiquei impressionado com seu perfil".
- Tom humano, consultivo, convincente — não artificial.
- Benefícios antes de tecnologias.
- Máximo 1 emoji se fizer sentido. Prefira zero.
- Cabe numa mensagem do LinkedIn.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
messageEN — Full message in English
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Same structure as messagePT but in English:
1. OPENING — greet, use profile info if available. Don't invent data.
   Examples: "I noticed your experience with..." / "Your background in X caught my attention."
2. OPPORTUNITY — one sentence with role and project context.
   Example: "We're hiring a Senior Data Engineer for a global mission-critical financial platform."
3. KEY HIGHLIGHTS — 3 to 5 short bullets. Never copy the JD.
   Priority: project impact → leadership → international exposure → architecture → technical challenges → autonomy → innovation → mission-critical → modern tech stack.
   Tech stack only at the end. Max 5 bullets.
4. FIT — one sentence connecting their background to the role.
   Example: "Based on your background, I think this could be a strong match."
5. Light CTA, no pressure.
   Examples: "Would you be open to a quick chat?" / "Happy to share more details if you're curious."

Same rules: short, human, no generic openers, benefits before tech, max 1 emoji (prefer zero).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
notePT — Nota de convite do LinkedIn em Português (MÁXIMO 280 CARACTERES)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Usada no campo de nota ao enviar um convite de conexão no LinkedIn.
Deve ser EXTREMAMENTE SUCINTA — máximo absoluto de 280 caracteres.

Como escrever:
- Identifique o aspecto mais relevante da vaga (impacto, tecnologia-chave ou contexto do projeto) e use isso
- Mencione que tem uma oportunidade que pode ser interessante para o perfil
- Sinalize interesse genuíno em conectar
- Tom leve, direto, humano
- Sem saudação longa, sem bullets, sem lista
- Zero emoji
- Termine com abertura para conexão, sem pressão
- NUNCA ultrapasse 280 caracteres

Exemplo de qualidade esperada:
"Olá! Tenho uma vaga de Senior Data Engineer em projeto global de missão crítica que pode fazer sentido para o seu perfil. Gostaria de conectar para compartilhar mais detalhes."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
noteEN — LinkedIn connection note in English (MAX 280 CHARACTERS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Same rules as notePT but in English. Absolute max 280 characters.

How to write:
- Pick the single most compelling angle of the role
- Mention you have an opening that might be relevant to their background
- Signal genuine interest in connecting
- Light, direct, human tone
- No long greeting, no bullets, no list
- Zero emoji
- End with a soft opening for connection
- NEVER exceed 280 characters

Example of expected quality:
"Hi! I have a Senior Data Engineer opening on a global mission-critical project that might be a great fit for your background. Would love to connect and share more."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nome do candidato: ${input.candidateName || 'não informado'}
Informações do perfil: ${input.profileInfo || 'não informadas'}

Job Description:
${input.jobDescription}
`.trim()
}
