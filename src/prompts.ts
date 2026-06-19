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

Estrutura obrigatória — 4 blocos:

1. opening (string)
Texto introdutório para o entrevistador: como se apresentar, como apresentar brevemente a empresa/posição ao candidato, e como conduzir os primeiros minutos.

2. blocks (array) — EXATAMENTE nesta ordem:
   - Abertura e Overview da Posição (0–5 min)
     Não inclua perguntas aqui. Use este bloco para descrever o que o entrevistador deve falar:
     contexto da empresa, descrição da vaga, modelo de trabalho, próximos passos do processo.
     O campo questions deve ter 0 itens (array vazio).
   - Bloco Técnico 1 (5–15 min) — 3 a 4 perguntas
   - Bloco Técnico 2 (15–25 min) — 3 a 4 perguntas
   - Encerramento (25–30 min) — 1 a 2 perguntas leves + espaço para dúvidas do candidato

3. closing (string)
Texto de encerramento: como finalizar a entrevista, próximos passos do processo, mensagem de agradecimento.

Para cada pergunta (exceto no bloco de Overview):
- question: pergunta clara e objetiva
- objective: o que esta pergunta valida
- strongSignals: lista de sinais de resposta forte
- weakSignals: lista de sinais de resposta fraca

Regras:
- Perguntas técnicas específicas para a vaga
- Não repetir temas entre os blocos
- Tom profissional e objetivo
- Roteiro realísta e utilizavel em 30 minutos

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
  return `Você é um Senior Talent Acquisition Partner especializado em tech. Retorne apenas JSON com 4 campos: messagePT, messageEN, notePT, noteEN.

===========================================
messagePT — Mensagem completa em Português
===========================================

Escreva em 5 blocos SEPARADOS POR LINHA EM BRANCO (\n\n entre cada bloco). Não una os blocos.

BLOCO 1 — ABERTURA (1 frase, parágrafo isolado)
Cumprimente pelo nome se disponível. Use info real do perfil para justificar o contato. Sem "Espero que esteja bem".
Exemplo: "Olá Aline! Vi sua trajetória liderando times de dados em fintech e queria compartilhar uma oportunidade."

BLOCO 2 — OPORTUNIDADE (1 frase, parágrafo isolado)
Nome do cargo + contexto do projeto. Direto.
Exemplo: "Estou recrutando para uma posição de Senior Data Engineer em um projeto global de missão crítica no setor financeiro."

BLOCO 3 — DIFERENCIAIS (lista de 3 a 5 bullets, CADA UM EM LINHA SEPARADA com "- " no início)
Prioridade de conteúdo: impacto do projeto > liderança > exposição internacional > arquitetura > desafios técnicos > autonomia > inovação > stack (tech só no último bullet, se houver).
Nunca copie frases da JD.
Exemplo:
- Arquitetura de dados de alta disponibilidade para operações financeiras em tempo real
- Liderança técnica com autonomia total sobre decisões de stack
- Exposição a times internacionais
- Stack: AWS, Spark, dbt

BLOCO 4 — ADERÊNCIA (1 frase, parágrafo isolado)
Conecte perfil e vaga de forma natural. Sem elogios excessivos.
Exemplo: "Acredito que sua experiência faz bastante sentido para esse contexto."

BLOCO 5 — CTA (1 frase leve, parágrafo isolado, sem pressão)
Exemplo: "Faz sentido conversarmos?"

Regras gerais:
- Cada bloco separado por \n\n (linha em branco real)
- Bullets em linhas próprias com "- " no início
- Curta: lida em menos de 30 segundos
- Tom humano e consultivo
- Máx 1 emoji (preferir zero)
- Não misture texto narrativo com bullets no mesmo bloco

===========================================
messageEN — Full message in English
===========================================

Mesma estrutura de 5 blocos SEPARADOS POR LINHA EM BRANCO (\n\n entre cada bloco).

BLOCK 1 — OPENING (1 sentence, isolated paragraph)
Greet by name if available. Use real profile info to justify the outreach. No "Hope you're doing well".
Example: "Hi Aline! I noticed your background leading data teams at fintech companies and wanted to reach out."

BLOCK 2 — OPPORTUNITY (1 sentence, isolated paragraph)
Role name + project context. Direct.
Example: "I'm recruiting for a Senior Data Engineer role on a global mission-critical project in the financial sector."

BLOCK 3 — KEY HIGHLIGHTS (3 to 5 bullets, EACH ON ITS OWN LINE starting with "- ")
Priority: project impact > leadership > international exposure > architecture > technical challenges > autonomy > innovation > stack (tech only in last bullet, if applicable).
Never copy phrases from the JD.
Example:
- High-availability data architecture for real-time financial operations
- Technical leadership with full ownership over stack decisions
- Exposure to international cross-functional teams
- Stack: AWS, Spark, dbt

BLOCK 4 — FIT (1 sentence, isolated paragraph)
Connect their background to the role naturally. No excessive compliments.
Example: "Based on your background, I think this could be a strong match."

BLOCK 5 — CTA (1 light sentence, isolated paragraph, no pressure)
Example: "Would you be open to a quick chat?"

General rules:
- Each block separated by \n\n (real blank line)
- Bullets on their own lines starting with "- "
- Short: readable in under 30 seconds
- Human and consultive tone
- Max 1 emoji (prefer zero)
- Never mix narrative text and bullets in the same block

===========================================
notePT — Nota de convite LinkedIn em PT (≤280 chars)
===========================================

Usada no campo de nota ao enviar convite de conexão.
- 1 parágrafo único, sem bullets, sem lista
- Mencione o aspecto mais relevante da vaga
- Tom direto, humano, zero emoji
- NUNCA ultrapasse 280 caracteres
Exemplo: "Olá! Tenho uma vaga de Senior Data Engineer em projeto global de missão crítica que pode fazer sentido para o seu perfil. Gostaria de conectar para compartilhar mais detalhes."

===========================================
noteEN — LinkedIn connection note in English (≤280 chars)
===========================================

Same rules as notePT but in English. Absolute max 280 characters.
- 1 single paragraph, no bullets, no list
- Pick the single most compelling angle
- Direct, human tone, zero emoji
Example: "Hi! I have a Senior Data Engineer opening on a global mission-critical project that might be a strong fit for your background. Would love to connect and share more."

===========================================

Nome do candidato: ${input.candidateName || 'não informado'}
Informações do perfil: ${input.profileInfo || 'não informadas'}

Job Description:
${input.jobDescription}`
}
