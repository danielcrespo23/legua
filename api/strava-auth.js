// Paso 1 de la conexión: redirige a Strava para autorizar la app.
export default function handler(req, res) {
  const u = new URL('https://www.strava.com/oauth/authorize');
  u.searchParams.set('client_id', process.env.STRAVA_CLIENT_ID);
  u.searchParams.set('redirect_uri', `https://${req.headers.host}/api/strava-callback`);
  u.searchParams.set('response_type', 'code');
  u.searchParams.set('approval_prompt', 'auto');
  u.searchParams.set('scope', 'activity:read_all');
  res.redirect(302, u.toString());
}
