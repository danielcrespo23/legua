#!/usr/bin/env node
// Servidor MCP de Strava para Claude Code. Sin dependencias: JSON-RPC por stdin/stdout.
// Usa mcp/strava-token.json (creado por strava-auth.js) y renueva el token solo.
// Registro: claude mcp add strava node "<ruta>/mcp/strava-mcp.js"
const fs=require('fs'),path=require('path'),readline=require('readline');
const FILE=process.env.STRAVA_TOKEN_FILE||path.join(__dirname,'strava-token.json');
const API='https://www.strava.com/api/v3';

// ---------- acceso a Strava ----------
function leerTok(){if(!fs.existsSync(FILE))throw new Error('No hay token de Strava. Ejecuta una vez: node mcp/strava-auth.js CLIENT_ID CLIENT_SECRET');return JSON.parse(fs.readFileSync(FILE,'utf8'));}
async function token(){
 const t=leerTok();
 if(t.access_token&&t.expires_at&&t.expires_at>Date.now()/1000+60)return t.access_token;
 const r=await fetch('https://www.strava.com/oauth/token',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({client_id:t.client_id,client_secret:t.client_secret,grant_type:'refresh_token',refresh_token:t.refresh_token})});
 const j=await r.json();if(!r.ok)throw new Error('Strava token: '+JSON.stringify(j));
 Object.assign(t,{access_token:j.access_token,refresh_token:j.refresh_token,expires_at:j.expires_at});
 fs.writeFileSync(FILE,JSON.stringify(t,null,1));return t.access_token;
}
async function api(p,q){
 const u=new URL(API+p);Object.entries(q||{}).forEach(([k,v])=>{if(v!=null)u.searchParams.set(k,v)});
 const r=await fetch(u,{headers:{Authorization:'Bearer '+await token()}});
 const j=await r.json();if(!r.ok)throw new Error('Strava '+r.status+': '+JSON.stringify(j));return j;
}

// ---------- formato ----------
const fmt=sec=>Math.floor(sec/60)+':'+String(Math.round(sec%60)).padStart(2,'0');
const ritmo=(m,s)=>m>0&&s>0?fmt(s/(m/1000)):null;                 // min/km
const km=m=>+(m/1000).toFixed(2);
const cad=c=>c?Math.round(c*2):null;                                   // Strava da la cadencia por pierna en carrera
const WT={0:'normal',1:'carrera/competición',2:'tirada larga',3:'series'};
const resumen=a=>({id:a.id,nombre:a.name,fecha:(a.start_date_local||'').slice(0,16).replace('T',' '),tipo:a.sport_type||a.type,
 workout_type:WT[a.workout_type]||null,
 km:km(a.distance),min:+(a.moving_time/60).toFixed(1),min_total:+(a.elapsed_time/60).toFixed(1),ritmo:ritmo(a.distance,a.moving_time),
 fc_media:a.average_heartrate||null,fc_max:a.max_heartrate||null,cadencia_spm:cad(a.average_cadence),desnivel_m:a.total_elevation_gain,
 esfuerzo_relativo:a.suffer_score||null,pr:a.pr_count||0});
const lunesDe=iso=>{const d=new Date(iso.slice(0,10)+'T00:00:00');d.setDate(d.getDate()-((d.getDay()+6)%7));return d.toISOString().slice(0,10)};
async function actividades(dias,tipo){
 const after=Math.floor(Date.now()/1000)-dias*86400;let page=1,out=[];
 while(page<=5){const l=await api('/athlete/activities',{after,per_page:100,page});out.push(...l);if(l.length<100)break;page++;}
 if(tipo&&tipo!=='all')out=out.filter(a=>(a.sport_type||a.type)===tipo);
 return out.sort((a,b)=>b.start_date.localeCompare(a.start_date));
}

// ---------- herramientas ----------
const TOOLS=[
 {name:'strava_atleta',description:'Perfil del atleta (peso, zapatillas) y totales de carrera de las últimas 4 semanas, del año y de siempre.',inputSchema:{type:'object',properties:{}}},
 {name:'strava_actividades',description:'Lista de actividades recientes con km, ritmo, pulso medio/máximo, cadencia, desnivel y esfuerzo relativo. Por defecto carreras (Run) de los últimos 30 días.',inputSchema:{type:'object',properties:{dias:{type:'integer',description:'Días hacia atrás (por defecto 30, máximo 365)'},tipo:{type:'string',description:'Run (por defecto), Ride, WeightTraining, Walk… o all para todo'}}}},
 {name:'strava_actividad',description:'Detalle completo de una actividad: descripción, parciales por km (ritmo y pulso de cada km), vueltas, mejores esfuerzos (1k, 5k…), calorías, dispositivo y zapatillas.',inputSchema:{type:'object',properties:{id:{type:'integer',description:'id de la actividad (de strava_actividades)'}},required:['id']}},
 {name:'strava_zonas',description:'Tiempo en cada zona de pulso y de ritmo durante una actividad.',inputSchema:{type:'object',properties:{id:{type:'integer'}},required:['id']}},
 {name:'strava_streams',description:'Series temporales de una actividad (pulso, cadencia, ritmo, altitud, distancia) remuestreadas a N puntos para ver cómo evolucionó dentro de la sesión.',inputSchema:{type:'object',properties:{id:{type:'integer'},puntos:{type:'integer',description:'Número de puntos (por defecto 40, máximo 200)'}},required:['id']}},
 {name:'strava_semanas',description:'Resumen por semana (lunes a domingo) de las carreras: km, minutos, salidas, ritmo y pulso medios, tirada más larga, sesiones de series. Para ver carga y progresión.',inputSchema:{type:'object',properties:{semanas:{type:'integer',description:'Semanas hacia atrás (por defecto 8, máximo 52)'}}}}
];
async function llamar(name,a){
 if(name==='strava_atleta'){
  const me=await api('/athlete');const st=await api(`/athletes/${me.id}/stats`);
  const tot=t=>t?{salidas:t.count,km:km(t.distance),horas:+(t.moving_time/3600).toFixed(1),desnivel_m:Math.round(t.elevation_gain)}:null;
  return{nombre:me.firstname+' '+(me.lastname||''),peso:me.weight,sexo:me.sex,ciudad:me.city,premium:me.premium||me.summit,
   zapatillas:(me.shoes||[]).map(s=>({nombre:s.name,km:km(s.distance),principal:s.primary})),
   carrera:{ultimas_4_semanas:tot(st.recent_run_totals),este_año:tot(st.ytd_run_totals),total:tot(st.all_run_totals)}};
 }
 if(name==='strava_actividades'){const l=await actividades(Math.min(Number(a.dias)||30,365),a.tipo||'Run');return{total:l.length,actividades:l.map(resumen)};}
 if(name==='strava_actividad'){
  const d=await api(`/activities/${a.id}`);
  return{...resumen(d),descripcion:d.description||'',dispositivo:d.device_name,zapatillas:d.gear?.name,temperatura:d.average_temp,kcal:d.calories,
   parciales_km:(d.splits_metric||[]).map(s=>({km:km(s.distance),ritmo:ritmo(s.distance,s.moving_time),fc:s.average_heartrate?Math.round(s.average_heartrate):null,desnivel_m:s.elevation_difference})),
   vueltas:(d.laps||[]).map(l=>({nombre:l.name,km:km(l.distance),min:+(l.moving_time/60).toFixed(1),ritmo:ritmo(l.distance,l.moving_time),fc:l.average_heartrate?Math.round(l.average_heartrate):null,fc_max:l.max_heartrate,cadencia_spm:cad(l.average_cadence)})),
   mejores_esfuerzos:(d.best_efforts||[]).map(b=>({nombre:b.name,tiempo:fmt(b.moving_time),ritmo:ritmo(b.distance,b.moving_time),pr:b.pr_rank}))};
 }
 if(name==='strava_zonas'){const z=await api(`/activities/${a.id}/zones`);return z.map(x=>({tipo:x.type,zonas:(x.distribution_buckets||[]).map((b,i)=>({zona:i+1,desde:b.min,hasta:b.max,min:+(b.time/60).toFixed(1)}))}));}
 if(name==='strava_streams'){
  const n=Math.min(Number(a.puntos)||40,200);
  const s=await api(`/activities/${a.id}/streams`,{keys:'time,distance,heartrate,cadence,velocity_smooth,altitude',key_by_type:true});
  const len=(s.time||s.distance||{}).data?.length||0;if(!len)return{puntos:[]};
  const idx=[...Array(n)].map((_,i)=>Math.min(len-1,Math.round(i*(len-1)/(n-1))));
  return{puntos:idx.map(i=>({min:s.time?+(s.time.data[i]/60).toFixed(1):null,km:s.distance?km(s.distance.data[i]):null,ritmo:s.velocity_smooth&&s.velocity_smooth.data[i]>0.5?fmt(1000/s.velocity_smooth.data[i]):null,fc:s.heartrate?s.heartrate.data[i]:null,cadencia_spm:s.cadence?cad(s.cadence.data[i]):null,alt:s.altitude?Math.round(s.altitude.data[i]):null}))};
 }
 if(name==='strava_semanas'){
  const w=Math.min(Number(a.semanas)||8,52);const l=await actividades(w*7+7,'Run');const g={};
  l.forEach(x=>{const k=lunesDe(x.start_date_local||x.start_date);const s=g[k]=g[k]||{semana:k,salidas:0,km:0,min:0,_d:0,_t:0,_fc:0,_nfc:0,mas_larga_km:0,series:0};
   s.salidas++;s.km+=x.distance/1000;s.min+=x.moving_time/60;s._d+=x.distance;s._t+=x.moving_time;if(x.average_heartrate){s._fc+=x.average_heartrate;s._nfc++;}s.mas_larga_km=Math.max(s.mas_larga_km,x.distance/1000);if(x.workout_type===3)s.series++;});
  return Object.values(g).sort((a,b)=>b.semana.localeCompare(a.semana)).map(s=>({semana:s.semana,salidas:s.salidas,km:+s.km.toFixed(1),min:Math.round(s.min),ritmo_medio:ritmo(s._d,s._t),fc_media:s._nfc?Math.round(s._fc/s._nfc):null,mas_larga_km:+s.mas_larga_km.toFixed(1),sesiones_series:s.series}));
 }
 throw new Error('Herramienta desconocida: '+name);
}

// ---------- protocolo MCP (JSON-RPC por líneas) ----------
const send=o=>process.stdout.write(JSON.stringify(o)+'\n');
const VERS=['2024-11-05','2025-03-26','2025-06-18'];
readline.createInterface({input:process.stdin}).on('line',async line=>{
 if(!line.trim())return;let m;try{m=JSON.parse(line)}catch(e){return}
 const {id,method,params}=m;if(id==null)return;                      // notificaciones: nada que responder
 try{
  let result;
  if(method==='initialize')result={protocolVersion:VERS.includes(params?.protocolVersion)?params.protocolVersion:VERS[0],capabilities:{tools:{}},serverInfo:{name:'strava-legua',version:'1.0.0'}};
  else if(method==='tools/list')result={tools:TOOLS};
  else if(method==='tools/call'){try{const out=await llamar(params.name,params.arguments||{});result={content:[{type:'text',text:JSON.stringify(out,null,1)}]}}catch(e){result={content:[{type:'text',text:'Error: '+e.message}],isError:true}}}
  else if(method==='ping')result={};
  else return send({jsonrpc:'2.0',id,error:{code:-32601,message:'Método no soportado: '+method}});
  send({jsonrpc:'2.0',id,result});
 }catch(e){send({jsonrpc:'2.0',id,error:{code:-32603,message:e.message}})}
});
