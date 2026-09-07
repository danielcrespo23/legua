// Pestaña Entreno: fase actual, resumen de la semana, próximas carreras numeradas, cómo progresa y rutinas de gym.
function renderEntreno(){
 const m=lunes(hoy()),plan=planDe(m),r=ritmos(),z=zonas();
 const runs=plan.dias.flatMap(d=>d.ses).filter(x=>x.tipo==='carrera'),gyms=plan.dias.flatMap(d=>d.ses).filter(x=>x.tipo==='gym');
 let html=`<h1>Entreno</h1><p class="mut">${FASE_TXT[plan.f]} · ${plan.s>0?'semana -'+plan.s:plan.s===0?'semana de carrera':'después de la carrera'}</p>${faseBar(plan.f)}`;

 html+=`<div class="card"><h2>Esta semana</h2><div class="kv">
  <span>Carreras</span><b>${kmTxt(plan.kmTotal)} km en ${runs.length} salidas</b>
  <span>Rodaje base</span><b>${kmTxt(plan.km)} km${plan.descarga?' (semana de descarga)':''}</b>
  <span>Gimnasio</span><b>${gyms.map(g=>DIAS[wd(parseISO(g.fecha))]+' · '+g.sub).join(', ')||'ninguno'}</b>
  <span>Descanso</span><b>${plan.descansos.map(i=>DIASL[i]).join(', ')||'ningún día libre'}</b></div>
  <div style="margin-top:8px">${plan.dias.flatMap(d=>d.ses).map(chip).join('')}</div></div>`;

 const prox=proximasCarreras(9);
 html+=`<div class="card"><h2>Próximas carreras</h2>${prox.length?`<ul class="lista">${prox.map(x=>`<li class="${state.estado[x.id]||''}" style="--c:${COL[x.c]}" data-a="ses" data-id="${x.id}" data-k="${x.fecha}"><span class="num-c">#${x.n}</span><span>${esc(x.titulo)}<br><span class="f">${fechaTxt(x.fecha)}${x.hora?' · '+x.hora:''}</span></span><span class="k">${kmTxt(x.sub==='carrera'?LEGUA:x.km)} km</span></li>`).join('')}</ul>`:'<p class="mut">No quedan carreras planificadas.</p>'}</div>`;

 html+=`<div class="card"><h2>Cómo sube</h2>
  <p>Cada semana el rodaje base sube 0,5 km hasta ${CAP_KM[plan.f]||9} km en esta fase. Si registras una semana muy dura (esfuerzo 8 o más) se mantiene; si apenas corres, baja. Cada cuarta semana hay descarga del 20 %.</p>
  <p>Fases: base hasta 12 semanas antes (rodajes y tirada larga), umbral (series de 1000 m y tempo), específico desde 6 semanas antes (series cortas a ritmo de carrera), afinar las 2 últimas.</p>
  <div class="kv" style="margin-top:8px"><span>Ritmo rodaje</span><b>${r.suave}</b><span>Tirada larga</span><b>${r.larga}</b><span>Tempo</span><b>${r.tempo}</b><span>Series largas</span><b>${r.largas}</b><span>Series cortas</span><b>${r.cortas}</b><span>Pulso suave / tempo / series</span><b>${z.suave} / ${z.tempo} / ${z.series}</b></div>
  <p class="mut" style="margin-top:8px">${ritmosEstimados()?'Ritmos orientativos según tu nivel. Se afinan solos con tus registros.':'Ritmos calculados a partir de tus últimos rodajes registrados.'}</p></div>`;

 const rut=rutinasFase(plan.f,plan.s);
 html+=`<div class="card"><h2>Gimnasio</h2><p class="mut">${rut.length?'Rutinas de esta fase: '+rut.join(', ')+'. ':'Esta semana no hay gimnasio. '}Nunca piernas (A o C) el día antes de series, ni gym el mismo día que series o pádel. Si coincide con un rodaje, primero la carrera.</p>
  ${['A','B','C'].map(k=>`<div class="card dorsal" style="--c:var(--gym);margin-bottom:8px"><span class="tipo">${k} · ${GYM[k].t}</span><span class="mut"> · ${GYM[k].min}'</span><ul>${GYM[k].ej.map(e=>`<li>${esc(e)}</li>`).join('')}</ul></div>`).join('')}
  <p class="mut">Base y umbral: A, B y C. Específico: A y C. Afinar: versiones ligeras con la mitad de series.</p></div>`;

 html+=`<div class="row"><button class="btn sec" data-a="partida">Cambiar punto de partida</button><button class="btn sec" data-a="copiar-resumen">Copiar resumen para Claude</button></div>`;
 V().innerHTML=html;
}
function sheetPartida(){const e=state.entreno;sheet(`${cabecera('Punto de partida')}<p class="mut">Si Claude te ha dicho otra carrera u otros km, ajústalo aquí y el plan se recalcula desde ese día.</p>
 <div class="grid2"><div><label>Nº de carrera</label><input id="pp-n" type="number" inputmode="numeric" value="${e.carrera}"></div><div><label>Km de esa carrera</label><input id="pp-km" type="number" inputmode="decimal" step="0.5" value="${e.km}"></div></div>
 <label>Día de esa carrera</label><input id="pp-ini" type="date" value="${e.inicio}">
 <div style="margin-top:12px"><button class="btn" data-a="save-partida">Guardar</button></div>`)}
