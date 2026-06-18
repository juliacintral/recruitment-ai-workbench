import type { Handler } from '@netlify/functions'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const DEFAULT_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  if (!GROQ_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'GROQ_API_KEY not configured on server.' })
    }
  }

  let body: any
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' }
  }

  const messages: { role: string; content: string }[] = Array.isArray(body.input)
    ? body.input
    : [{ role: 'user', content: String(body.input || '') }]

  const isStructured = body.text?.format?.type === 'json_schema'

  const groqBody: any = {
    model: DEFAULT_MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 4096
  }

  if (isStructured) {
    groqBody.response_format = { type: 'json_object' }
    const schemaName = body.text?.format?.name || 'output'
    const schemaStr = JSON.stringify(body.text?.format?.schema || {}, null, 2)
    // Injeta schema como system message para Groq aderir à estrutura
    groqBody.messages = [
      {
        role: 'system',
        content: `Responda APENAS com JSON válido seguindo exatamente o schema "${schemaName}" abaixo. Nenhum texto fora do JSON.\n\nSchema:\n${schemaStr}`
      },
      ...messages
    ]
  }

  try {
    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify(groqBody)
    })

    const data = await response.json() as any

    if (!response.ok) {
      return { statusCode: response.status, body: JSON.stringify(data) }
    }

    const outputText: string = data.choices?.[0]?.message?.content || ''

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ output_text: outputText })
    }
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    }
  }
}
