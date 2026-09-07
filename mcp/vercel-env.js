// Genera mcp/vercel.env (ignorado por git) con las variables que hay que pegar en Vercel → Settings → Environment Variables.
// Uso: node mcp/vercel-env.js   → abre el archivo, copia las 4 líneas y pégalas en el formulario de Vercel: se rellenan de golpe.
// La MCP_KEY se guarda también en strava-token.json para que el servidor local (strava-http.js) use la misma.
import fs from 'fs';import path from 'path';import crypto from 'crypto';
import {leerTok,guardarTok,FILE} from './_token.js';
const t=leerTok();
if(!t.mcp_key){t.mcp_key=crypto.randomBytes(24).toString('hex');guardarTok(t);}
const out=path.join(path.dirname(FILE),'vercel.env');
fs.writeFileSync(out,`STRAVA_CLIENT_ID=${t.client_id}\nSTRAVA_CLIENT_SECRET=${t.client_secret}\nSTRAVA_REFRESH_TOKEN=${t.refresh_token}\nMCP_KEY=${t.mcp_key}\n`);
console.log('Escrito '+out);
console.log('Ábrelo, copia las 4 líneas y pégalas en Vercel → Settings → Environment Variables.');
console.log('URL del conector cuando esté desplegado: https://TU-DOMINIO.vercel.app/api/mcp/'+t.mcp_key);
