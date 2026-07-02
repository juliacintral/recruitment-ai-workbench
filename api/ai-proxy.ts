import type { VercelRequest, VercelResponse } from '@vercel/node'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const DEFAULT_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY not configured on server.' })
  }

  let body: any
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    return res.status(400).send('Invalid JSON')
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
      return res.status(response.status).json(data)
    }

    const outputText: string = data.choices?.[0]?.message?.content || ''
    return res.status(200).json({ output_text: outputText })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}
