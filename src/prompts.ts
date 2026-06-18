import type { Language } from './types'

const lang = (l: Language) => (l === 'pt-BR' ? 'Português do Brasil' : 'English')

export const brandName = (idioma: Language): string =>
  idioma === 'pt-BR' ? 'Insi' : 'Insi North América'

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

Siga esta estrutura obrigatória e gere EXATAMENTE estes campos JSON:
1. title
2. location
3. roleOverview
4. keyResponsibilities (theme + items)
5. technicalEnvironment (platform[], scope[], additional[])
6. requiredQualifications
7. niceToHave
8. projectContext
9. footerLine: EXATAMENTE "${input.cliente} -- {title} -- ${input.brand}"

Regras: específico, sem frases genéricas, tom enterprise, inferências realistas quando faltar dado.

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
- blocos de tempo (0-5min, 5-15min, 15-25min, 25-30min)
- 6 a 8 perguntas técnicas objetivas
- o que cada pergunta valida
- sinais de resposta forte
- sinais de resposta fraca
- scorecard resumido final

Idioma: ${lang(input.idioma)}
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
Seu objetivo é escrever mensagens de primeiro contato no LinkedIn que pareçam escritas por um recrutador experiente — não por uma IA.

Gere SEMPRE os seguintes campos JSON:

1. messagePT — mensagem completa em Português do Brasil
2. messageEN — mensagem completa em Inglês
3. notePT — nota de convite do LinkedIn em Português (máximo 280 caracteres)
4. noteEN — nota de convite do LinkedIn em Inglês (máximo 280 caracteres)

---

ESTRUTURA DAS MENSAGENS PRINCIPAIS (messagePT e messageEN):

1. ABERTURA
   Cumprimente o candidato. Se houver informações do perfil, use-as naturalmente.
   Não invente informações não fornecidas.

2. OPORTUNIDADE
   Uma frase com a posição e contexto do projeto.

3. DIFERENCIAIS (3 a 5 bullets)
   Nunca copie a JD. Escolha o que realmente vende a vaga.
   Prioridade: impacto > liderança > exposição internacional > arquitetura > desafios técnicos > autonomia > inovação > missão crítica > tecnologias.
   Máximo 5 bullets. Tecnologias só ao final.

4. ADERÊNCIA
   Uma frase conectando perfil e vaga.

5. CALL TO ACTION leve, sem pressão.

REGRAS das mensagens principais:
- Curta: legiível em menos de 30 segundos.
- Sem genéricos tipo "Espero que esteja bem" ou "I was impressed by your profile".
- Tom humano, consultivo, convincente sem ser artificial.
- Beneficios antes de tecnologias.
- No máximo 1 emoji se fizer sentido. Prefira zero.
- Cabe numa mensagem do LinkedIn.

---

ESTRUTURA DAS NOTAS DE CONVITE (notePT e noteEN):

São usadas no campo de nota ao enviar um convite de conexão no LinkedIn.
Devem ser EXTREMAMENTE SUCINTAS — máximo 280 caracteres cada.

A IA deve ser inteligente ao escrever a nota:
- Identificar o aspecto mais relevante da vaga (impacto, tecnologia principal, contexto do projeto)
- Mencionar que encontrou uma vaga que pode ser interessante para o perfil
- Sinalizar interesse genuino em conectar
- Ter um tom leve, direto e humano
- Não usar saudão longa
- Não incluir bullets nem lista
- Não copiar frases genéricas
- Zero emoji
- Terminar com abertura para conexão, sem pressão

Exemplo de qualidade esperada (PT):
"Olá! Tenho uma vaga de Senior Data Engineer em projeto global de missão crítica que pode fazer sentido para o seu perfil. Gostaria de conectar para compartilhar mais detalhes."

Exemplo de qualidade esperada (EN):
"Hi! I have a Senior Data Engineer opening on a global mission-critical project that might be a great fit for your background. Would love to connect and share more."

---

Nome do candidato: ${input.candidateName || 'não informado'}
Informações do perfil: ${input.profileInfo || 'não informadas'}

Job Description:
${input.jobDescription}
`.trim()
}
