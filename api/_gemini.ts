export type ApiRequest = { method?: string; body?: unknown }

export async function readJson(request: ApiRequest) {
  if (typeof request.body === 'object' && request.body !== null) return request.body as Record<string, unknown>
  if (typeof request.body === 'string') return JSON.parse(request.body) as Record<string, unknown>
  return {}
}

export function send(response: { status: (code: number) => { json: (body: unknown) => void } }, code: number, body: unknown) { response.status(code).json(body) }

export async function callGemini(body: unknown) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw Object.assign(new Error('Gemini is not configured.'), { statusCode: 503 })
  return fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey }, body: JSON.stringify(body) })
}

export function extractJson(text: string, opening: '{' | '[') {
  const closing = opening === '{' ? '}' : ']'
  return text.slice(text.indexOf(opening), text.lastIndexOf(closing) + 1)
}

export async function geminiJson(body: unknown) {
  const upstream = await callGemini(body)
  const result = await upstream.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; error?: { message?: string } }
  if (!upstream.ok) throw Object.assign(new Error(result.error?.message || 'Gemini request failed.'), { statusCode: upstream.status })
  return result.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
}
