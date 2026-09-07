# Legua

Plan de entreno para la legua (5,57 km) del 24 de diciembre. PWA sin dependencias, más un backend
mínimo opcional en `api/` para Strava y macros con IA.

## Cómo está organizada

```
index.html            estructura de la página y carga de scripts (en orden)
css/app.css           estilos
js/util.js            fechas, ritmos, escape de HTML, toast
js/estado.js          estado por defecto, guardado en localStorage, migración desde la v1
js/plan.js            motor del plan: fases, progresión de km, sesiones, gym, descansos, horas
js/nutricion.js       alimentos, objetivos de macros según complexión, IA
js/ui.js              componentes: chips, tarjetas de sesión, selectores, hojas modales
js/vistas/            una vista por pestaña: onboarding, hoy, calendario, entreno, macros, metricas, ajustes
js/integraciones.js   .ics para el Calendario, Strava, avisos, resumen para Claude
js/acciones.js        qué hace cada botón (data-a="…")
js/app.js             render principal y arranque
sw.js                 caché para abrir sin conexión y avisos push
api/                  funciones de Vercel (Strava, macros, push)
```

## Qué hace

- **Al empezar** pide tu complexión (sexo, edad, altura, peso, nivel, pulso máximo si lo sabes), en
  qué carrera del plan estás y de cuántos km, tus días de carrera y gym y tu horario de trabajo.
  No pide objetivo de ritmo: los ritmos salen de tus rodajes registrados (o de tu nivel mientras no haya datos).
- **Hoy**: lo que toca con explicación, ritmo, pulso, comida antes y después, y un vistazo a mañana.
- **Calendario**: mes completo con carreras numeradas, gym, pádel y descansos. Tocas un día y ves el detalle,
  añades pádel (el plan se recoloca) o exportas la semana al Calendario del iPhone (.ics con avisos).
- **Entreno**: fase actual, resumen de la semana, próximas carreras numeradas, cómo progresa el plan,
  ritmos y zonas, y las rutinas de gimnasio con ejercicios.
- **Macros**: objetivo diario calculado con tu complexión (Mifflin-St Jeor) y el tipo de día; registro de
  alimentos por peso o describiendo la comida (IA, necesita backend).
- **Métricas**: ritmo y pulso en rodajes, km por semana, registros, y el sitio donde aparecerá Strava.
- **Ajustes** (engranaje arriba): complexión, carrera y días, punto de partida del plan, horario, backend, copia de datos.

### El plan

- Fases por semanas hasta la carrera: base (≥12), umbral (11-7), específico (6-3), afinar (2-1), carrera.
- 3 carreras por semana numeradas de forma continua desde el punto de partida. El rodaje base sube 0,5 km
  por semana; si registras una semana con esfuerzo 8 o más se mantiene, si apenas corres baja.
  Descarga del 20 % cada cuarta semana y tope de km por fase.
- Gym A/B/C según fase. Nunca piernas el día antes de series, ni gym encima de series o pádel.
  Los días sin nada quedan como descanso.

## Tenerla en el iPhone (5 minutos)

1. Sube la carpeta a un repositorio de GitHub y activa **GitHub Pages** (Settings → Pages → rama main).
2. Abre la URL en **Safari** (no Chrome).
3. Compartir → **Añadir a pantalla de inicio**. Ya tienes icono y pantalla completa.

Los datos se guardan en el propio iPhone (localStorage). Exporta una copia desde Ajustes de vez en cuando.

## Strava en Claude (MCP)

Las herramientas de Strava (actividades, parciales por km, pulso, cadencia, zonas, resumen semanal) están en
`api/_strava-tools.js` y se sirven de dos formas:

- **En el ordenador, para Claude Code**: `mcp/strava-mcp.js`, por stdio, sin dependencias.
- **En el móvil o la web, para la app de Claude**: `api/mcp/[key].js`, un servidor MCP remoto en Vercel.

Herramientas: `strava_atleta`, `strava_actividades`, `strava_actividad`, `strava_zonas`, `strava_streams`, `strava_semanas`.

### Claude Code (ordenador)

1. Crea una app en https://www.strava.com/settings/api. En "Authorization Callback Domain" pon el dominio
   de Vercel si vas a usar también el conector remoto (ej. `legua-api.vercel.app`); si no, `localhost`.
   Strava acepta siempre `localhost` además del dominio configurado.
2. Autoriza una vez: `node mcp/strava-auth.js CLIENT_ID CLIENT_SECRET`. Se abre Strava, aceptas y el token
   queda en `mcp/strava-token.json` (ignorado por git).
3. El archivo `.mcp.json` de la carpeta padre registra el servidor. Reinicia Claude Code y acepta el servidor
   `strava` cuando lo pregunte.

### App de Claude en el móvil (conector remoto)

1. Despliega este repo en Vercel (ver sección siguiente) con estas variables: `STRAVA_CLIENT_ID`,
   `STRAVA_CLIENT_SECRET`, `STRAVA_REFRESH_TOKEN` (cópialo de `mcp/strava-token.json`) y `MCP_KEY`
   (una cadena larga y aleatoria: `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"`).
2. En claude.ai → Ajustes → Conectores → "Añadir conector personalizado": nombre `Strava`,
   URL `https://TU-BACKEND.vercel.app/api/mcp/MCP_KEY`. Sin OAuth: la clave va en la URL.
3. En la app del móvil, en un chat, activa el conector Strava en el menú de herramientas y pregunta.

El endpoint es de solo lectura y sin estado (transporte Streamable HTTP, solo POST). Quien tenga la URL
completa puede leer tus datos de Strava: no la compartas y cámbiala si hace falta cambiando `MCP_KEY`.

### Probarlo sin Vercel (temporal, desde tu ordenador)

`mcp/strava-http.js` sirve el mismo endpoint en `http://localhost:8788/api/mcp/CLAVE` usando el token local.
Para que claude.ai llegue a él hay que publicar el puerto con un túnel:

```
winget install Cloudflare.cloudflared          (una vez)
node mcp/strava-http.js                        (ventana 1: imprime la clave)
cloudflared tunnel --url http://localhost:8788 (ventana 2: imprime una URL https://….trycloudflare.com)
```

URL del conector: `https://….trycloudflare.com/api/mcp/CLAVE`. Solo funciona con el ordenador encendido y las
dos ventanas abiertas, y la URL del túnel cambia cada vez que lo arrancas.

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

## Pendiente

- Métricas completas desde Strava (ritmo, pulso, cadencia, carga) cuando esté la API.
- Que Claude revise cada domingo los registros y reescriba la semana (endpoint `/api/entrenador`).
- Macros por foto del plato.
