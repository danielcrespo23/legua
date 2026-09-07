// Token local de Strava (mcp/strava-token.json): lectura y renovación. Lo usan strava-mcp.js y strava-http.js.
import fs from 'fs';import path from 'path';import {fileURLToPath} from 'url';
const DIR=import.meta.dirname||path.dirname(fileURLToPath(import.meta.url));
export const FILE=process.env.STRAVA_TOKEN_FILE||path.join(DIR,'strava-token.json');

export function leerTok(){if(!fs.existsSync(FILE))throw new Error('No hay token de Strava. Ejecuta una vez: node mcp/strava-auth.js CLIENT_ID CLIENT_SECRET');return JSON.parse(fs.readFileSync(FILE,'utf8'));}
export function guardarTok(t){fs.writeFileSync(FILE,JSON.stringify(t,null,1));}

// Devuelve un access token válido, renovándolo con el refresh token si ha caducado
export async function token(){
 const t=leerTok();
 if(t.access_token&&t.expires_at&&t.expires_at>Date.now()/1000+60)return t.access_token;
 const r=await fetch('https://www.strava.com/oauth/token',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({client_id:t.client_id,client_secret:t.client_secret,grant_type:'refresh_token',refresh_token:t.refresh_token})});
 const j=await r.json();if(!r.ok)throw new Error('Strava token: '+JSON.stringify(j));
 Object.assign(t,{access_token:j.access_token,refresh_token:j.refresh_token,expires_at:j.expires_at});
 guardarTok(t);return t.access_token;
}
