import type { Handler } from '@netlify/functions'

const GROQ_API_KEY = process.env.GROQ_API_KEY

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

// Melhor modelo Groq para geração de texto longo e estruturado
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

  // Normaliza input: aceita string ou array (OpenAI-style messages)
  const messages: { role: string; content: string }[] = Array.isArray(body.input)
    ? body.input
    : [{ role: 'user', content: String(body.input || '') }]

  // Groq suporta json_object para structured output
  const isStructured = body.text?.format?.type === 'json_schema'

  const groqBody: any = {
    model: DEFAULT_MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 4096
  }

  if (isStructured) {
    groqBody.response_format = { type: 'json_object' }
    // Reforça o schema no system message para maior aderência
    const schemaName = body.text?.format?.name || 'output'
    const schemaStr = JSON.stringify(body.text?.format?.schema || {}, null, 2)
    groqBody.messages = [
      {
        role: 'system',
        content: `Você deve responder APENAS com um JSON válido que siga exatamente o schema "${schemaName}" abaixo. Não inclua texto fora do JSON.\n\nSchema:\n${schemaStr}`
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

    const data = await response.json()

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify(data)
      }
    }

    const outputText = data.choices?.[0]?.message?.content || ''

    // Retorna no mesmo formato que o front espera
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
