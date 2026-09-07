// Autoriza la app de Strava una sola vez y guarda el token en mcp/strava-token.json (no se sube a git).
// Uso: node mcp/strava-auth.js CLIENT_ID CLIENT_SECRET
// Strava acepta siempre localhost como callback, sea cual sea el "Authorization Callback Domain" de la app.
import http from 'http';import fs from 'fs';import path from 'path';import {exec} from 'child_process';import {fileURLToPath} from 'url';
const [id,secret]=process.argv.slice(2);
if(!id||!secret){console.error('Uso: node mcp/strava-auth.js CLIENT_ID CLIENT_SECRET');process.exit(1);}
const DIR=import.meta.dirname||path.dirname(fileURLToPath(import.meta.url));
const PORT=8787,FILE=path.join(DIR,'strava-token.json');
const url=`https://www.strava.com/oauth/authorize?client_id=${id}&redirect_uri=http://localhost:${PORT}/callback&response_type=code&approval_prompt=force&scope=read,activity:read_all,profile:read_all`;
http.createServer(async(req,res)=>{
 const u=new URL(req.url,'http://localhost');
 if(u.pathname!=='/callback')return res.end('Legua: esperando a Strava…');
 const code=u.searchParams.get('code');
 if(!code){res.end('Strava no ha devuelto code: '+(u.searchParams.get('error')||''));return;}
 try{
  const r=await fetch('https://www.strava.com/oauth/token',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({client_id:id,client_secret:secret,code,grant_type:'authorization_code'})});
  const j=await r.json();if(!r.ok)throw new Error(JSON.stringify(j));
  fs.writeFileSync(FILE,JSON.stringify({client_id:id,client_secret:secret,refresh_token:j.refresh_token,access_token:j.access_token,expires_at:j.expires_at,athlete:{id:j.athlete.id,nombre:j.athlete.firstname+' '+(j.athlete.lastname||'')}},null,1));
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.end('<body style="font-family:system-ui;padding:24px"><h2>Strava conectado</h2><p>Token guardado. Ya puedes cerrar esta pestaña y volver a Claude Code.</p></body>');
  console.log('Token guardado en '+FILE+' · atleta: '+j.athlete.firstname);
  console.log('Para Vercel, el STRAVA_REFRESH_TOKEN está dentro de ese archivo.');
  setTimeout(()=>process.exit(0),500);
 }catch(e){res.end('Error: '+e.message);console.error(e.message);}
}).listen(PORT,()=>{
 console.log('Si no se abre solo, abre esta URL en el navegador:\n'+url);
 exec(`start "" "${url}"`);
});
