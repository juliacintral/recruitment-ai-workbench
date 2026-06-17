import type { InterviewGuide, JDSectioned, Language, OutreachOutput } from '../types'
import { buildInterviewPrompt, buildJDPrompt, buildOutreachPrompt } from '../prompts'
import { interviewSchema, jdSchema, outreachSchema } from '../schemas'

const API_BASE = '/api/ai-proxy'

// Schema definition shape — usamos unknown para evitar conflito com
// tipos estrítos do TypeScript ao passar objetos JSON Schema inline
type SchemaDef = {
  name: string
  strict: boolean
  schema: unknown
}

async function callProxy(body: Record<string, unknown>): Promise<any> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err?.error?.message || err?.error || res.statusText)
  }
  return res.json()
}

async function structuredCall<T>(prompt: string, schemaDef: SchemaDef): Promise<T> {
  const data = await callProxy({
    model: 'gpt-4o-mini',
    input: [{ role: 'user', content: prompt }],
    text: {
      format: {
        type: 'json_schema',
        name: schemaDef.name,
        strict: schemaDef.strict,
        schema: schemaDef.schema as Record<string, unknown>
      }
    }
  })
  return JSON.parse(data.output_text) as T
}

async function textCall(prompt: string): Promise<string> {
  const data = await callProxy({
    model: 'gpt-4o-mini',
    input: prompt
  })
  return data.output_text as string
}

export async function generateJobDescription(input: {
  cargo: string
  idioma: Language
  cliente: string
  brand: string
  especificidades?: string
  additionalContext?: string
}): Promise<JDSectioned> {
  return structuredCall<JDSectioned>(buildJDPrompt(input), jdSchema as SchemaDef)
}

export async function generateInterviewGuide(input: {
  idioma: Language
  foco?: string
  jobDescription: string
}): Promise<InterviewGuide> {
  return structuredCall<InterviewGuide>(buildInterviewPrompt(input), interviewSchema as SchemaDef)
}

export async function generateLinkedinOutreach(input: {
  idioma: Language
  persona?: string
  jobDescription: string
}): Promise<OutreachOutput> {
  return structuredCall<OutreachOutput>(buildOutreachPrompt(input), outreachSchema as SchemaDef)
}

export async function generateInterviewText(input: {
  idioma: Language
  foco?: string
  jobDescription: string
}): Promise<string> {
  return textCall(buildInterviewPrompt(input))
}

export async function generateOutreachText(input: {
  idioma: Language
  persona?: string
  jobDescription: string
}): Promise<string> {
  return textCall(buildOutreachPrompt(input))
}
