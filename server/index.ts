import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { generateItinerary, validateInput } from '../src/lib/generator';
import type { Itinerary, TripInput } from '../src/types';

const app = express();
app.use(express.json({ limit: '100kb' }));

const KEY = process.env.GEMINI_API_KEY; // stays on the server, never sent to the browser
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const PORT = Number(process.env.PORT) || 3001;

const isStr = (x: unknown, max: number): x is string => typeof x === 'string' && x.length > 0 && x.length <= max;

function validAi(x: any, days: number): x is { overview: string; dayThemes: string[]; tips: string[] } {
  return (
    x && isStr(x.overview, 800) &&
    Array.isArray(x.dayThemes) && x.dayThemes.length === days && x.dayThemes.every((t: unknown) => isStr(t, 80)) &&
    Array.isArray(x.tips) && x.tips.every((t: unknown) => isStr(t, 250))
  );
}

/** Ask Gemini for wording only (overview, day themes, tips). Prices and places stay from our dataset. */
async function enhance(it: Itinerary, input: TripInput): Promise<Itinerary> {
  if (!KEY) return it;
  const plan = it.days.map((d) => ({ day: d.day, activities: d.activities.map((a) => a.name) }));
  const prompt =
    `You are a travel writer. Trip: ${it.summary} Interests: ${input.interests.join(', ')}. Age group: ${input.age}. Pace: ${input.pace}.\n` +
    `Plan (do not change it): ${JSON.stringify(plan)}\n` +
    `Return ONLY JSON: {"overview": string (max 80 words), "dayThemes": string[] (exactly ${it.days.length}, each max 6 words), "tips": string[] (max 4 short practical tips)}.\n` +
    `Do not mention prices, weather, live availability or exact distances. Do not add places not in the plan.`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.7 } }),
    });
    if (!r.ok) throw new Error(`Gemini HTTP ${r.status}`);
    const data: any = await r.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    if (!validAi(parsed, it.days.length)) throw new Error('Malformed Gemini response');
    it.days.forEach((d, i) => (d.theme = parsed.dayThemes[i]));
    it.ai = { overview: parsed.overview, tips: parsed.tips.slice(0, 4) };
    it.source = 'gemini';
  } catch (err) {
    console.warn('Gemini unavailable, using rule-based itinerary:', (err as Error).message);
  } finally {
    clearTimeout(timer);
  }
  return it;
}

app.get('/api/health', (_req, res) => res.json({ ok: true, gemini: Boolean(KEY) }));

app.post('/api/generate', async (req, res) => {
  const input = req.body?.input as TripInput | undefined;
  const seed = Number.isFinite(req.body?.seed) ? Number(req.body.seed) : Date.now();
  if (!input) return res.status(400).json({ errors: { form: 'Missing trip details.' } });
  const errors = validateInput(input);
  if (Object.keys(errors).length) return res.status(400).json({ errors });
  try {
    const itinerary = await enhance(generateItinerary(input, seed), input);
    res.json({ itinerary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not generate itinerary.' });
  }
});

// Production: serve the built frontend
const dist = path.resolve('dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(PORT, () => console.log(`Travel Ease API on http://localhost:${PORT} (Gemini ${KEY ? 'enabled' : 'disabled — rule-based only'})`));
