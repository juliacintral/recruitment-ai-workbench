import type { VercelRequest, VercelResponse } from '@vercel/node'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
// Modelo estável e atual — troque aqui se precisar atualizar futuramente
const DEFAULT_MODEL = 'openai/gpt-oss-120b'

/**
 * Sanitiza a resposta do modelo antes de fazer JSON.parse.
 * O Llama no Groq pode gerar newlines literais dentro de strings JSON
 * quando o prompt usa \n\n para separar blocos (ex: outreach).
 * Esta função escapa newlines/tabs dentro de valores string JSON.
 */
function sanitizeJsonString(raw: string): string {
  // Extrai apenas o bloco JSON se vier com texto ao redor
  const match = raw.match(/\{[\s\S]*\}/)
  const jsonCandidate = match ? match[0] : raw

  // Escapa newlines e tabs literais que estejam dentro de strings JSON
  return jsonCandidate.replace(
    /"((?:[^"\\]|\\.)*)"/g,
    (_match, inner: string) => {
      const escaped = inner
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
      return `"${escaped}"`
    }
  )
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

  if (!GROQ_API_KEY) {
    return res.status(500).json({
      error: 'GROQ_API_KEY não configurada no servidor. Acesse o painel do Vercel → Settings → Environment Variables e adicione GROQ_API_KEY com sua chave do https://console.groq.com'
    })
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
    const requiredFields: string[] =
      body.text?.format?.schema?.required ?? Object.keys(body.text?.format?.schema?.properties ?? {})
    groqBody.messages = [
      {
        role: 'system',
        content: [
          `Responda APENAS com JSON válido. Sem texto fora do JSON. Sem markdown.`,
          `Schema: "${schemaName}"`,
          `Campos obrigatórios: ${requiredFields.join(', ')}.`,
          `Strings com múltiplos parágrafos devem usar \\n para quebras de linha — NUNCA quebre linhas literalmente dentro do JSON.`
        ].join('\n')
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
      const groqError = data?.error?.message || JSON.stringify(data)
      return res.status(response.status).json({
        error: `Erro da API Groq (${response.status}): ${groqError}`
      })
    }

    const rawText: string = data.choices?.[0]?.message?.content || ''

    // Sanitiza antes de retornar para evitar json_validate_failed no cliente
    const outputText = isStructured ? sanitizeJsonString(rawText) : rawText

    return res.status(200).json({ output_text: outputText })
  } catch (err: any) {
    return res.status(500).json({ error: `Erro interno na função: ${err.message}` })
  }
}
