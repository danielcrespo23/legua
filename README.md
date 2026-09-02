# Legua

Plan de entreno para la legua del 24 de diciembre. PWA en un solo archivo (`index.html`) más un backend
mínimo opcional en `api/` para Strava y macros con IA.

## Qué hace sin backend

- Plan de 16 semanas en cuatro fases (base → umbral → específico → afinar), 3 carreras + gym + pádel.
- Al empezar te pide tus valores de partida y te enseña de dónde partes y cuánto hay que recortar.
- Cada semana sube o baja el volumen según lo que registres (esfuerzo y sesiones hechas).
- Hora óptima de cada entreno a partir de tu horario de trabajo y otros compromisos.
- Botón "+ Pádel" en cualquier día: el plan recoloca carreras y gym.
- Comida recomendada antes y después de cada sesión.
- Macros diarios objetivo y registro de alimentos con peso (lista de ~45 alimentos habituales).
- Progreso: ritmo y pulso en rodajes suaves, km por semana.
- Exportar la semana al Calendario del iPhone (.ics) con avisos 30 min antes y creatina diaria.
- "Copiar resumen para Claude": pega el resumen en el chat y ajustamos el plan a mano.

## Tenerla en el iPhone (5 minutos)

1. Sube la carpeta a un repositorio de GitHub y activa **GitHub Pages** (Settings → Pages → rama main).
2. Abre la URL en **Safari** (no Chrome).
3. Compartir → **Añadir a pantalla de inicio**. Ya tienes icono y pantalla completa.

Los datos se guardan en el propio iPhone (localStorage). Exporta una copia desde Ajustes de vez en cuando.

## Backend para Strava y macros por IA (Vercel, gratis)

1. Crea una app en https://www.strava.com/settings/api. En "Authorization Callback Domain" pon el dominio de Vercel (ej. `legua-api.vercel.app`).
2. Sube este mismo repositorio a Vercel (importa el repo, sin configuración especial).
3. En Vercel → Settings → Environment Variables:
   - `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET` (de la app de Strava)
   - `ANTHROPIC_API_KEY` (para los macros por descripción)
   - `ALLOWED_ORIGIN` = la URL de GitHub Pages (opcional, por seguridad)
4. Abre `https://TU-BACKEND.vercel.app/api/strava-auth`, autoriza, copia el `refresh_token` que aparece y guárdalo como `STRAVA_REFRESH_TOKEN`. Redeploy.
5. En la app → Ajustes → URL del backend → pega la URL de Vercel → "Sincronizar ahora".

### Avisos push (opcional, más lioso)

iOS solo manda push a PWAs instaladas en pantalla de inicio. Hace falta generar claves VAPID
(`npx web-push generate-vapid-keys`), guardar `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` y la suscripción
del navegador en `PUSH_SUBSCRIPTION`. El cron de `vercel.json` envía un aviso a las 6:00 UTC.
Para el día a día, el .ics con alarmas del Calendario es más fiable y no necesita nada de esto.

## Siguiente versión (con Claude Code)

- Que Claude revise cada domingo los registros y reescriba la semana (endpoint `/api/entrenador`).
- Macros por foto del plato.
- Pádel con hora, para no solapar con el gym.
