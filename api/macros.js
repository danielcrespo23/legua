// Recibe {texto} con una comida descrita y devuelve {items:[{nombre,gramos,kcal,p,c,g}]} usando la API de Claude.
import { cors } from './_util.js';
export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST' });
  try {
    const { texto } = req.body || {};
    if (!texto) return res.status(400).json({ error: 'Falta texto' });
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-6',
        max_tokens: 800,
        system: 'Eres nutricionista deportivo. Respondes SOLO con JSON válido, sin markdown ni explicaciones.',
        messages: [{ role: 'user', content:
          `Formato exacto: {"items":[{"nombre":"","gramos":0,"kcal":0,"p":0,"c":0,"g":0}]}. p=proteína, c=carbohidratos, g=grasa, todo en gramos. Usa raciones habituales en España si no se indica cantidad. Comida: ${texto}` }],
      }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error?.message || 'API ' + r.status);
    const txt = (d.content || []).filter(x => x.type === 'text').map(x => x.text).join('');
    const j = JSON.parse(txt.replace(/```json|```/g, '').trim());
    res.status(200).json(j);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
