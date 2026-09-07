#!/usr/bin/env node
// Servidor MCP de Strava por HTTP en tu ordenador, con la misma ruta que el de Vercel: /api/mcp/CLAVE.
// Sirve para probar el conector de claude.ai sin Vercel, publicando el puerto con un túnel:
//   1) node mcp/strava-http.js                         (deja la ventana abierta; imprime la URL local y la clave)
//   2) cloudflared tunnel --url http://localhost:8788   (en otra ventana; da una URL https://….trycloudflare.com)
//   3) en claude.ai, conector personalizado con URL: https://….trycloudflare.com/api/mcp/CLAVE
// Solo funciona mientras el ordenador y las dos ventanas sigan abiertos. Para algo permanente, Vercel.
import http from 'http';import crypto from 'crypto';
import {crearApi,atender} from '../api/_strava-tools.js';
import {leerTok,guardarTok,token} from './_token.js';

const PORT=Number(process.env.PORT)||8788;
const api=crearApi(token);

// La clave se guarda en strava-token.json la primera vez para que no cambie entre arranques
function clave(){
 if(process.env.MCP_KEY)return process.env.MCP_KEY;
 const t=leerTok();
 if(!t.mcp_key){t.mcp_key=crypto.randomBytes(24).toString('hex');guardarTok(t);}
 return t.mcp_key;
}
let KEY;try{KEY=clave();}catch(e){console.error(e.message);process.exit(1);}

http.createServer(async(req,res)=>{
 const u=new URL(req.url,'http://localhost');
 const json=(code,obj)=>{res.writeHead(code,{'Content-Type':'application/json'});res.end(obj==null?'':JSON.stringify(obj));};
 const m=u.pathname.match(/^\/api\/mcp\/([^/]+)\/?$/);
 if(!m||m[1]!==KEY)return json(401,{error:'Clave incorrecta'});
 if(req.method!=='POST'){res.writeHead(405);return res.end();}
 let raw='';for await(const c of req)raw+=c;
 let body;try{body=JSON.parse(raw)}catch(e){return json(400,{error:'JSON no válido'})}
 const msgs=Array.isArray(body)?body:[body];const out=[];
 for(const x of msgs){const r=await atender(x,api);if(r)out.push(r);}
 console.error(new Date().toTimeString().slice(0,8)+'  '+msgs.map(x=>x.method+(x.params?.name?' '+x.params.name:'')).join(', '));
 if(!out.length){res.writeHead(202);return res.end();}
 json(200,Array.isArray(body)?out:out[0]);
}).listen(PORT,()=>{
 console.log(`MCP de Strava en http://localhost:${PORT}/api/mcp/${KEY}`);
 console.log(`Publícalo con:  cloudflared tunnel --url http://localhost:${PORT}`);
 console.log(`Y en claude.ai usa:  https://LO-QUE-TE-DE-CLOUDFLARED/api/mcp/${KEY}`);
});
