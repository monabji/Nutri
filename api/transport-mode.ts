import { extractJson, geminiJson, readJson, send } from './_gemini.js'

export default async function handler(request: any, response: any) {
  if (request.method !== 'POST') return send(response, 405, { error: 'Method not allowed.' })
  try {
    const input = await readJson(request) as { product?: string; brand?: string; origin?: string; destination?: string }
    const prompt = ['Choose the most likely primary freight mode for a packaged food moving from the origin to the destination. Use current public information and Google Search grounding when useful. Return JSON only: {"mode":"road|air|sea","reason":"short plain-English reason"}. Choose sea only for clear international maritime supply chains, air only for clear air freight evidence or urgent/high-value perishables, otherwise road. This is a route scenario, not proof of the historical shipment.', `Product: ${input.product || 'unknown'}`, `Brand: ${input.brand || 'unknown'}`, `Origin: ${input.origin || 'unknown'}`, `Destination: ${input.destination || 'unknown'}`].join('\n')
    const text = await geminiJson({ contents: [{ role: 'user', parts: [{ text: prompt }] }], tools: [{ google_search: {} }], generationConfig: { temperature: 0.1 } })
    const parsed = JSON.parse(extractJson(text, '{') || '{}') as { mode?: string; reason?: string }
    return send(response, 200, { mode: parsed.mode === 'air' || parsed.mode === 'sea' ? parsed.mode : 'road', reason: String(parsed.reason || 'Road is the most likely mode for this route.') })
  } catch (error: any) { return send(response, error.statusCode || 502, { error: error.message || 'The transport lookup returned an unusable result.' }) }
}
