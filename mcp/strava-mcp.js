#!/usr/bin/env node
// Servidor MCP local de Strava para Claude Code (JSON-RPC por stdin/stdout, sin dependencias).
// Usa mcp/strava-token.json (creado por strava-auth.js) y renueva el token solo.
// Registrado en ../.mcp.json (carpeta APPLEGUA). Las herramientas viven en api/_strava-tools.js.
import fs from 'fs';import path from 'path';import readline from 'readline';import {fileURLToPath} from 'url';
import {crearApi,atender} from '../api/_strava-tools.js';
const DIR=import.meta.dirname||path.dirname(fileURLToPath(import.meta.url));
const FILE=process.env.STRAVA_TOKEN_FILE||path.join(DIR,'strava-token.json');

function leerTok(){if(!fs.existsSync(FILE))throw new Error('No hay token de Strava. Ejecuta una vez: node mcp/strava-auth.js CLIENT_ID CLIENT_SECRET');return JSON.parse(fs.readFileSync(FILE,'utf8'));}
async function token(){
 const t=leerTok();
 if(t.access_token&&t.expires_at&&t.expires_at>Date.now()/1000+60)return t.access_token;
 const r=await fetch('https://www.strava.com/oauth/token',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({client_id:t.client_id,client_secret:t.client_secret,grant_type:'refresh_token',refresh_token:t.refresh_token})});
 const j=await r.json();if(!r.ok)throw new Error('Strava token: '+JSON.stringify(j));
 Object.assign(t,{access_token:j.access_token,refresh_token:j.refresh_token,expires_at:j.expires_at});
 fs.writeFileSync(FILE,JSON.stringify(t,null,1));return t.access_token;
}
const api=crearApi(token);

const send=o=>process.stdout.write(JSON.stringify(o)+'\n');
readline.createInterface({input:process.stdin}).on('line',async line=>{
 if(!line.trim())return;let m;try{m=JSON.parse(line)}catch(e){return}
 try{const r=await atender(m,api);if(r)send(r)}
 catch(e){if(m.id!=null)send({jsonrpc:'2.0',id:m.id,error:{code:-32603,message:e.message}})}
});
