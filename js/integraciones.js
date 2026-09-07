// Integraciones: calendario .ics, Strava (vía backend), avisos locales y resumen para pegar en Claude.
function descargar(nombre,contenido,tipo){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([contenido],{type:tipo}));a.download=nombre;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},800)}

function exportarICS(plan){const ie=s=>String(s).replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n');
 let s='BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Legua//ES\r\nCALSCALE:GREGORIAN\r\n';
 plan.dias.forEach(d=>d.ses.forEach(x=>{if(!x.hora)return;const dt=d.fecha.replace(/-/g,'')+'T'+x.hora.replace(':','')+'00';const tit=(x.n?'#'+x.n+' ':'')+x.titulo;
  s+=`BEGIN:VEVENT\r\nUID:${ie(x.id)}@legua\r\nDTSTAMP:${dt}\r\nDTSTART:${dt}\r\nDURATION:PT${x.min}M\r\nSUMMARY:${ie(tit)}\r\nDESCRIPTION:${ie(x.detalle+(x.ej?' '+x.ej.join('; '):'')+' Antes: '+comidaPara(x).antes)}\r\nBEGIN:VALARM\r\nTRIGGER:-PT30M\r\nACTION:DISPLAY\r\nDESCRIPTION:${ie(tit)}\r\nEND:VALARM\r\nEND:VEVENT\r\n`}));
 const c=P().creatina.replace(':','');s+=`BEGIN:VEVENT\r\nUID:creatina-${plan.key}@legua\r\nDTSTAMP:${plan.key.replace(/-/g,'')}T${c}00\r\nDTSTART:${plan.key.replace(/-/g,'')}T${c}00\r\nDURATION:PT5M\r\nRRULE:FREQ=DAILY;COUNT=7\r\nSUMMARY:Creatina\r\nBEGIN:VALARM\r\nTRIGGER:PT0M\r\nACTION:DISPLAY\r\nDESCRIPTION:Creatina\r\nEND:VALARM\r\nEND:VEVENT\r\n`;
 s+='END:VCALENDAR\r\n';descargar('legua-'+plan.key+'.ics',s,'text/calendar');}

async function sincronizarStrava(){const b=(state.ajustes.backend||'').replace(/\/$/,'');if(!b)return toast('Configura el backend en Ajustes');
 toast('Leyendo Strava…');try{const r=await fetch(b+'/api/strava-activities');if(!r.ok)throw new Error(r.status);const acts=await r.json();let n=0;
  acts.forEach(a=>{const id='strava-'+a.id;if(state.registros.some(x=>x.id===id))return;
   state.registros.push({id,fecha:a.fecha,tipo:'carrera',km:Number(a.km.toFixed(2)),min:Number(a.min.toFixed(1)),fc:a.fc?Math.round(a.fc):'',rpe:'',q:a.q?1:'',fuente:'strava',notas:a.nombre||''});n++;
   const ses=sesionesDia(a.fecha).find(x=>x.tipo==='carrera');if(ses)state.estado[ses.id]='hecho';});
  await guardar();render();toast(n?`${n} carreras importadas`:'Nada nuevo');}catch(e){toast('No se pudo leer Strava: '+e.message)}}

async function avisar(t,b){try{if(navigator.serviceWorker){const r=await navigator.serviceWorker.ready;if(r&&r.showNotification)return r.showNotification(t,{body:b,icon:'icon.png'});}new Notification(t,{body:b});}catch(e){}}
function programarAvisos(){if(!('Notification' in window)||Notification.permission!=='granted')return;const k=isoLocal(hoy());
 sesionesDia(k).forEach(x=>{if(!x.hora||state.estado[x.id])return;const t=parseISO(k);const [h,m]=x.hora.split(':').map(Number);t.setHours(h,m-30,0,0);const ms=t-Date.now();if(ms>0&&ms<12*3600e3)setTimeout(()=>avisar('En 30 min: '+x.titulo,x.detalle.slice(0,90)),ms);});}

function resumenParaClaude(){const m=lunes(hoy()),plan=planDe(m),p=P(),e=state.entreno;const regs=state.registros.filter(r=>r.fecha>=isoLocal(addDays(m,-14))).sort((a,b)=>a.fecha.localeCompare(b.fecha));
 return `Legua ${p.fechaCarrera}. ${p.sexo==='m'?'Mujer':'Hombre'}, ${p.edad} años, ${p.altura} cm, ${p.peso} kg, nivel ${p.nivel}. Plan desde ${e.inicio} (carrera #${e.carrera}, ${e.km} km).\nSemana ${plan.key}, fase ${plan.f}, ${plan.kmTotal} km planificados (rodaje base ${plan.km} km).\nÚltimos registros:\n`+(regs.map(r=>`- ${r.fecha} ${r.tipo}${r.q?' (series)':''}: ${r.km||'-'} km en ${r.min||'-'} min${r.km&&r.min?' ('+sp(r.min*60/r.km)+'/km)':''}, ${r.fc||'-'} ppm, RPE ${r.rpe||'-'}${r.notas?', '+r.notas:''}`).join('\n')||'- ninguno')+`\nPlan de la semana:\n`+plan.dias.map((d,i)=>`- ${DIAS[i]}: ${d.ses.map(x=>(x.n?'#'+x.n+' ':'')+x.titulo+(x.km?' '+x.km+' km':'')+(state.estado[x.id]?' ['+state.estado[x.id]+']':'')).join(', ')||'descanso'}`).join('\n');}
