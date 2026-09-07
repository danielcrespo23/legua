#!/usr/bin/env node
// Servidor MCP local de Strava para Claude Code (JSON-RPC por stdin/stdout, sin dependencias).
// Usa mcp/strava-token.json (creado por strava-auth.js). Registrado en ../.mcp.json (carpeta APPLEGUA).
// Las herramientas viven en api/_strava-tools.js; el token en mcp/_token.js.
import readline from 'readline';
import {crearApi,atender} from '../api/_strava-tools.js';
import {token} from './_token.js';
const api=crearApi(token);

const send=o=>process.stdout.write(JSON.stringify(o)+'\n');
readline.createInterface({input:process.stdin}).on('line',async line=>{
 if(!line.trim())return;let m;try{m=JSON.parse(line)}catch(e){return}
 try{const r=await atender(m,api);if(r)send(r)}
 catch(e){if(m.id!=null)send({jsonrpc:'2.0',id:m.id,error:{code:-32603,message:e.message}})}
});
