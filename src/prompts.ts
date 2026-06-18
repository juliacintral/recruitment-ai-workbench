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

Você vai receber a Job Description abaixo e deve gerar SEMPRE DUAS mensagens completas e independentes:
- messagePT: versão completa em Português do Brasil
- messageEN: versão completa em Inglês

Estrutura obrigatória de CADA mensagem:

1. ABERTURA
   Cumprimente o candidato.
   Se houver informações do perfil, use-as para justificar o contato de forma natural.
   Não invente informações que não foram fornecidas.
   Exemplos: "Seu perfil chamou minha atenção..." / "I noticed your experience with..."

2. OPORTUNIDADE
   Uma frase apresentando a posição e o contexto do projeto.
   Exemplo: "Estou recrutando para uma posição de Lead Data Engineer em projeto global do setor financeiro."

3. DIFERENCIAIS (3 a 5 bullets curtos)
   NUNCA copie a Job Description integralmente.
   Escolha os pontos que realmente vendem a vaga.
   Prioridade: impacto do projeto > liderança > exposição internacional > arquitetura > desafios técnicos > autonomia > inovação > missão crítica > tecnologias modernas.
   Só depois mencione tecnologias específicas. Máximo 5 bullets.

4. ADERÊNCIA
   Uma frase conectando o perfil informado com a oportunidade.
   Exemplos: "Acredito que sua experiência faz bastante sentido para esse desafio." / "Based on your background, I think this could be a strong match."

5. CALL TO ACTION leve
   Finalize sem pressionar o candidato.
   Exemplos: "Faz sentido conversarmos?" / "Would you be open to a quick chat?" / "Posso compartilhar mais detalhes?"

REGRAS ABSOLUTAS:
- Não copie a Job Description.
- Mensagem curta: o candidato entende a oportunidade em menos de 30 segundos de leitura.
- Sem frases genéricas como "I was impressed by your profile" ou "Espero que esteja bem".
- Tom humano, consultivo e convincente sem soar artificial.
- Beneficios da oportunidade sempre antes de lista de tecnologias.
- No máximo UM emoji se fizer sentido natural. Prefira zero emoji.
- Nunca pressione o candidato.
- O texto deve caber confortavelmente em uma mensagem do LinkedIn.

Nome do candidato: ${input.candidateName || 'não informado'}
Informações do perfil: ${input.profileInfo || 'não informadas'}

Job Description:
${input.jobDescription}
`.trim()
}
