// Devuelve las carreras de los últimos 45 días en el formato que espera la app.
import { cors, stravaAccessToken } from './_util.js';
export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (!process.env.STRAVA_REFRESH_TOKEN) return res.status(400).json({ error: 'Falta STRAVA_REFRESH_TOKEN: abre /api/strava-auth primero' });
    const token = await stravaAccessToken();
    const after = Math.floor(Date.now() / 1000) - 45 * 86400;
    const r = await fetch(`https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=100`, {
      headers: { Authorization: 'Bearer ' + token },
    });
    if (!r.ok) throw new Error('Strava activities: ' + r.status);
    const acts = await r.json();
    const runs = acts
      .filter(a => a.type === 'Run' || a.sport_type === 'Run')
      .map(a => ({
        id: a.id,
        fecha: (a.start_date_local || a.start_date).slice(0, 10),
        km: a.distance / 1000,
        min: a.moving_time / 60,
        fc: a.average_heartrate || null,
        nombre: a.name || '',
        // Heurística: si el nombre habla de series/tempo, o el tipo es workout, lo marcamos como sesión de calidad
        q: a.workout_type === 3 || /serie|tempo|intervalo|fartlek/i.test(a.name || ''),
      }));
    res.status(200).json(runs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
