// Componentes de interfaz que usan varias vistas: formularios, chips, tarjetas de sesión, hojas modales.
const V=()=>document.getElementById('view');
function val(id){const e=document.getElementById(id);return e?e.value.trim():''}

// selector de días de la semana
function dsel(name,sel,multi){return `<div class="dsel" data-dsel="${name}" data-multi="${multi?1:0}">${DIAS.map((d,i)=>`<button type="button" data-a="dsel" data-i="${i}" class="${sel.includes(i)?'on':''}">${d}</button>`).join('')}</div>`}
function leerDsel(name){return [...document.querySelectorAll(`[data-dsel="${name}"] button.on`)].map(b=>Number(b.dataset.i))}
// selector segmentado (una opción)
function seg(name,opts,sel){return `<div class="seg" data-seg="${name}">${opts.map(([v,l])=>`<button type="button" data-a="seg" data-v="${v}" class="${v===sel?'on':''}">${l}</button>`).join('')}</div>`}
function leerSeg(name){const b=document.querySelector(`[data-seg="${name}"] button.on`);return b?b.dataset.v:''}
function selectHTML(id,opts,sel){return `<select id="${id}">${opts.map(([v,l])=>`<option value="${v}"${v===sel?' selected':''}>${l}</option>`).join('')}</select>`}
const OPT_PREF=[['manana','Por la mañana'],['mediodia','A mediodía'],['tarde','Por la tarde']];
const OPT_NIVEL=[['principiante','Principiante (corro hace poco)'],['intermedio','Intermedio (corro habitualmente)'],['avanzado','Avanzado (entreno con series)']];

// horario de trabajo
function horariosHTML(){return DIAS.map((d,i)=>{const b=(state.trabajo[i]||[])[0]||{i:'',f:''};return `<div class="hrow"><b>${d}</b><input type="time" id="t-i-${i}" value="${b.i}"><span class="mut">a</span><input type="time" id="t-f-${i}" value="${b.f}"></div>`}).join('')}
function leerHorarios(){for(let i=0;i<7;i++){const a=val('t-i-'+i),b=val('t-f-'+i);state.trabajo[i]=(a&&b&&hm(b)>hm(a))?[{i:a,f:b}]:[];}}

// sesiones
const numSes=x=>x.tipo==='carrera'&&x.n?`<span class="num-c">#${x.n}</span>`:'';
function chip(x){const st=state.estado[x.id]||'';const extra=x.tipo==='carrera'?(x.sub==='carrera'?kmTxt(LEGUA)+' km':kmTxt(x.km)+' km'):x.min+"'";
 return `<button class="chip ${st}" style="--c:${COL[x.c]}" data-a="ses" data-id="${x.id}" data-k="${x.fecha}"><b>${x.tipo==='carrera'&&x.n?'#'+x.n+' ':''}${esc(x.titulo)}</b>${x.hora?`<span class="h">${x.hora}</span>`:''}<span class="mut">${extra}</span></button>`}
function bigNum(x){if(x.tipo==='carrera')return `<div class="big">${kmTxt(x.sub==='carrera'?LEGUA:x.km)}<small>km</small></div>`;return `<div class="big">${x.min}<small>min</small></div>`}
function tarjeta(x,expand){const st=state.estado[x.id]||'';const cm=comidaPara(x);
 return `<div class="card dorsal" style="--c:${COL[x.c]}"><div class="row sp"><span class="tipo">${numSes(x)}${esc(x.titulo)}</span><span class="pill">${st==='hecho'?'hecho':st==='saltado'?'saltado':(x.hora?'a las '+x.hora:'sin hora libre')}</span></div>
 ${bigNum(x)}<p>${esc(x.detalle)}</p>${x.nota?`<div class="aviso">${esc(x.nota)}</div>`:''}
 ${x.ej?`<ul>${x.ej.map(e=>`<li>${esc(e)}</li>`).join('')}</ul>`:''}
 ${expand?`<h3>Comer antes</h3><p class="mut">${esc(cm.antes)}</p><h3>Después</h3><p class="mut">${esc(cm.despues)}</p>`:''}
 <div class="row" style="margin-top:10px"><button class="btn sm" data-a="hecho" data-id="${x.id}">${st==='hecho'?'Desmarcar':'Hecho'}</button><button class="btn sec sm" data-a="registrar" data-f="${x.fecha}" data-t="${x.tipo}">Registrar datos</button><button class="btn sec sm" data-a="saltar" data-id="${x.id}">${st==='saltado'?'Recuperar':'Saltar'}</button></div></div>`}
function descansoCard(){return `<div class="card dorsal" style="--c:var(--rest)"><span class="tipo">Descanso</span><div class="big">0<small>min</small></div><p>Recuperar también entrena. Come normal, duerme.</p></div>`}
function faseBar(f){const i=FASES.indexOf(f);return `<div class="faseb">${FASES.map((x,j)=>`<i class="${x===f?'on':j<i?'past':''}"></i>`).join('')}</div>`}

// tarjeta de perfil: lo que la app deduce de tu complexión y tus registros
function perfilCard(cerrable){const p=P(),r=ritmos(),z=zonas(),v=imc(),e=state.entreno,s=semanasHasta(lunes(hoy()));
 return `<div class="card"><div class="row sp"><h2 style="margin:0">${esc(p.nombre)||'Tu perfil'}</h2>${cerrable?'<button class="x" data-a="cerrar-perfil" aria-label="Cerrar">×</button>':''}</div>
 <div class="kv"><span>Complexión</span><b>${p.altura} cm · ${p.peso} kg · IMC ${v.toFixed(1)} (${imcTxt(v)})</b>
 <span>Gasto en reposo</span><b>${gastoReposo()} kcal/día</b>
 <span>Pulso máximo${p.fcmax?'':' (estimado por edad)'}</span><b>${fcmax()} ppm</b>
 <span>Zonas</span><b>suave ${z.suave} · tempo ${z.tempo} · series ${z.series}</b>
 <span>Ritmo de rodaje${ritmosEstimados()?' (orientativo por nivel)':' (de tus registros)'}</span><b>${sp(r.base)} min/km</b>
 <span>Legua estimada hoy</span><b>≈ ${r.legua} min/km · ${sp(ps(r.legua)*LEGUA)}</b>
 <span>Plan</span><b>desde el ${fechaCorta(e.inicio||isoLocal(hoy()))}, carrera #${e.carrera} de ${kmTxt(e.km)} km</b>
 <span>Faltan</span><b>${s>0?s+' semanas':s===0?'días':'ya pasó'}</b></div>
 ${ritmosEstimados()?'<p class="mut" style="margin-top:8px">Registra tus rodajes (km, minutos y pulso) y los ritmos dejarán de ser orientativos.</p>':''}</div>`}

// hojas modales
function sheet(html){document.getElementById('sheet-c').innerHTML=html;document.getElementById('sheet').classList.add('on')}
function cerrar(){document.getElementById('sheet').classList.remove('on')}
function cabecera(t){return `<div class="row sp"><h2 style="margin:0">${t}</h2><button class="x" data-a="cerrar" aria-label="Cerrar">×</button></div>`}
function sheetSesion(id,k){const x=sesionesDia(k).find(s=>s.id===id);if(!x)return;sheet(cabecera(fechaTxt(x.fecha))+tarjeta(x,true))}
