import type { InterviewGuide, JDSectioned, Language, OutreachOutput } from '../types'
import { buildInterviewPrompt, buildJDPrompt, buildOutreachPrompt } from '../prompts'
import { interviewSchema, jdSchema, outreachSchema } from './schemas'

// Chama a Netlify Function /api/ai-proxy que usa Groq internamente
async function callProxy<T>(
  systemPrompt: string,
  schemaDef: { name: string; strict: boolean; schema: Record<string, unknown> }
): Promise<T> {
  const res = await fetch('/api/ai-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: [{ role: 'user', content: systemPrompt }],
      text: {
        format: {
          type: 'json_schema',
          name: schemaDef.name,
          strict: true,
          schema: schemaDef.schema
        }
      }
    })
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Erro do servidor: ${res.status} — ${err}`)
  }

  const data = await res.json()
  const text: string = data.output_text

  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error(`Resposta da IA não é JSON válido: ${text.slice(0, 200)}`)
  }
}

export async function generateJobDescription(input: {
  cargo: string
  idioma: Language
  cliente: string
  brand: string
  especificidades?: string
  additionalContext?: string
}): Promise<JDSectioned> {
  return callProxy<JDSectioned>(buildJDPrompt(input), jdSchema)
}

export async function generateInterviewGuide(input: {
  idioma: Language
  foco?: string
  jobDescription: string
}): Promise<InterviewGuide> {
  return callProxy<InterviewGuide>(buildInterviewPrompt(input), interviewSchema)
}

export async function generateLinkedinOutreach(input: {
  candidateName?: string
  profileInfo?: string
  jobDescription: string
}): Promise<OutreachOutput> {
  return callProxy<OutreachOutput>(buildOutreachPrompt(input), outreachSchema)
}
