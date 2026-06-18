import OpenAI from 'openai'
import type { InterviewGuide, JDSectioned, Language, OutreachOutput } from '../types'
import { buildInterviewPrompt, buildJDPrompt, buildOutreachPrompt } from '../prompts'
import { interviewSchema, jdSchema, outreachSchema } from './schemas'

const apiKey = import.meta.env.VITE_OPENAI_API_KEY
if (!apiKey) console.warn('VITE_OPENAI_API_KEY is missing')

const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true })

async function parseStructured<T>(
  systemPrompt: string,
  schemaDef: { name: string; strict: boolean; schema: Record<string, unknown> }
): Promise<T> {
  const response = await client.responses.create({
    model: 'gpt-4o-mini',
    input: [{ role: 'system', content: systemPrompt }],
    text: {
      format: {
        type: 'json_schema',
        name: schemaDef.name,
        strict: true,
        schema: schemaDef.schema
      }
    }
  })
  return JSON.parse(response.output_text) as T
}

export async function generateJobDescription(input: {
  cargo: string
  idioma: Language
  cliente: string
  brand: string
  especificidades?: string
  additionalContext?: string
}): Promise<JDSectioned> {
  return parseStructured<JDSectioned>(buildJDPrompt(input), jdSchema)
}

export async function generateInterviewGuide(input: {
  idioma: Language
  foco?: string
  jobDescription: string
}): Promise<InterviewGuide> {
  return parseStructured<InterviewGuide>(buildInterviewPrompt(input), interviewSchema)
}

// Assinatura correta: candidateName + profileInfo + jobDescription
export async function generateLinkedinOutreach(input: {
  candidateName?: string
  profileInfo?: string
  jobDescription: string
}): Promise<OutreachOutput> {
  return parseStructured<OutreachOutput>(buildOutreachPrompt(input), outreachSchema)
}
