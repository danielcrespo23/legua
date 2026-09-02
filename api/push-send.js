// Opcional. Lo llama el cron de Vercel cada mañana y envía un aviso push al iPhone.
// Requiere: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, PUSH_SUBSCRIPTION (JSON de la suscripción) y el paquete web-push.
import webpush from 'web-push';
export default async function handler(req, res) {
  try {
    const sub = JSON.parse(process.env.PUSH_SUBSCRIPTION || 'null');
    if (!sub) return res.status(400).json({ error: 'Falta PUSH_SUBSCRIPTION' });
    webpush.setVapidDetails('mailto:tu@email.com', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
    const body = req.query.msg || 'Abre Legua: mira qué toca hoy y a qué hora.';
    await webpush.sendNotification(sub, JSON.stringify({ title: 'Legua', body }));
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
