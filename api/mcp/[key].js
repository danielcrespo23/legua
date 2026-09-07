// Servidor MCP remoto (transporte Streamable HTTP, sin estado) para conectar Claude en el móvil o la web con Strava.
// URL del conector: https://TU-BACKEND.vercel.app/api/mcp/MCP_KEY
// Variables en Vercel: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN y MCP_KEY (cadena larga y aleatoria).
import { stravaAccessToken } from '../_util.js';
import { crearApi, atender } from '../_strava-tools.js';

let cache={token:'',hasta:0};   // el access token dura 6 h; se reutiliza mientras la función siga caliente
const api=crearApi(async()=>{
 if(!process.env.STRAVA_REFRESH_TOKEN)throw new Error('Falta STRAVA_REFRESH_TOKEN en Vercel: abre /api/strava-auth, copia el token y guárdalo en Settings → Environment Variables');
 if(cache.token&&cache.hasta>Date.now())return cache.token;
 cache={token:await stravaAccessToken(),hasta:Date.now()+50*60e3};return cache.token;
});

export default async function handler(req,res){
 const key=process.env.MCP_KEY;
 if(!key||req.query.key!==key)return res.status(401).json({error:'Clave incorrecta'});
 if(req.method!=='POST')return res.status(405).end();          // sin canal servidor→cliente ni sesiones: solo POST
 let body=req.body;
 if(typeof body==='string'){try{body=JSON.parse(body)}catch(e){return res.status(400).json({error:'JSON no válido'})}}
 const msgs=Array.isArray(body)?body:[body];
 const out=[];for(const m of msgs){const r=await atender(m,api);if(r)out.push(r);}
 if(!out.length)return res.status(202).end();                  // solo notificaciones
 res.setHeader('Content-Type','application/json');
 res.status(200).send(JSON.stringify(Array.isArray(body)?out:out[0]));
}
