// Paso 2: Strava vuelve aquí con un "code". Lo cambiamos por tokens y mostramos
// el refresh_token para guardarlo en Vercel como STRAVA_REFRESH_TOKEN (solo una vez).
export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) return res.status(400).send('Falta el code de Strava');
  const r = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  });
  const j = await r.json();
  if (!r.ok) return res.status(500).send('Strava: ' + JSON.stringify(j));
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<meta name="viewport" content="width=device-width"><body style="font-family:system-ui;padding:20px">
  <h2>Strava conectado</h2>
  <p>Copia este valor y guárdalo en Vercel → Settings → Environment Variables como <b>STRAVA_REFRESH_TOKEN</b>. Después haz "Redeploy". Solo hace falta una vez.</p>
  <textarea style="width:100%;height:80px">${j.refresh_token}</textarea>
  <p>Atleta: ${j.athlete?.firstname || ''} ${j.athlete?.lastname || ''}</p></body>`);
}
