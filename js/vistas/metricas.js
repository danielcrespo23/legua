// Pestaña Métricas: evolución de ritmo y pulso, km por semana, registros y sitio para Strava.
function chart(pts,fmt,color){if(pts.length<2)return `<p class="mut">Con dos o más carreras registradas aparece la gráfica.</p>`;
 const W=600,H=150,px=36,py=14;const ys=pts.map(p=>p.y);let mn=Math.min(...ys),mx=Math.max(...ys);if(mx===mn){mx+=1;mn-=1;}
 const X=i=>px+i*(W-px-8)/(pts.length-1),Y=v=>py+(mx-v)*(H-2*py)/(mx-mn);
 return `<svg class="ch" viewBox="0 0 ${W} ${H}"><text x="0" y="${py+4}" font-size="12" fill="#5B6E72">${fmt(mx)}</text><text x="0" y="${H-py+4}" font-size="12" fill="#5B6E72">${fmt(mn)}</text><polyline fill="none" stroke="${color}" stroke-width="2.5" points="${pts.map((p,i)=>X(i)+','+Y(p.y)).join(' ')}"/>${pts.map((p,i)=>`<circle cx="${X(i)}" cy="${Y(p.y)}" r="3.5" fill="${color}"/>`).join('')}</svg>`}
function renderMetricas(){
 const regs=[...state.registros].sort((a,b)=>a.fecha.localeCompare(b.fecha));const runs=regs.filter(r=>r.tipo==='carrera'&&r.km&&r.min);
 const suaves=runs.filter(r=>!r.q);
 const ritmo=suaves.map(r=>({y:r.min*60/r.km})),fc=suaves.filter(r=>r.fc).map(r=>({y:Number(r.fc)}));
 const sem={};runs.forEach(r=>{const k=isoLocal(lunes(parseISO(r.fecha)));sem[k]=(sem[k]||0)+Number(r.km)});
 const b=state.ajustes.backend;
 let html=`<h1>Métricas</h1>`+perfilCard(false);
 html+=`<div class="card"><h2>Strava</h2>${b?`<p class="mut">Backend configurado. Cada sincronización importa tus carreras de los últimos 45 días y marca como hechas las sesiones del plan.</p><button class="btn" data-a="strava">Sincronizar ahora</button>`:`<p class="mut">Cuando conectes Strava (Ajustes → Strava e IA) aparecerán aquí distancia, ritmo, pulso y carga de cada salida sin registrar nada a mano. Mientras tanto, registra las carreras con el botón de cada sesión.</p>`}</div>`;
 html+=`<div class="card"><h2>Ritmo en rodajes</h2>${chart(ritmo,v=>sp(v),'#2F7D5B')}<h2>Pulso medio en rodajes</h2>${chart(fc,v=>Math.round(v),'#E1452A')}<p class="mut">La mejora real es esta: mismo pulso, ritmo más rápido. Si el pulso sube y el ritmo no, hay fatiga.</p></div>`;
 html+=`<div class="card"><h2>Kilómetros por semana</h2>${Object.keys(sem).length?Object.entries(sem).map(([k,v])=>`<div class="row sp" style="font-size:14px"><span>${k.slice(5)}</span><b>${v.toFixed(1)} km</b></div><div class="bar" style="--c:var(--ink)"><i style="width:${Math.min(100,v/40*100)}%"></i></div>`).join(''):'<p class="mut">Sin datos aún.</p>'}</div>`;
 html+=`<div class="row sp"><h2 style="margin:0">Registros</h2><button class="btn sm" data-a="registrar" data-f="${isoLocal(hoy())}" data-t="carrera">Añadir</button></div>`;
 if(regs.length)html+=`<div class="card"><table><tr><th>Fecha</th><th>Qué</th><th class="num">km</th><th class="num">min</th><th class="num">ppm</th><th class="num">RPE</th><th></th></tr>${[...regs].reverse().map(r=>`<tr><td>${r.fecha.slice(5)}</td><td>${r.tipo==='carrera'?(r.q?'series':'rodaje'):r.tipo}${r.fuente==='strava'?' <span class="mut">(Strava)</span>':''}</td><td class="num">${r.km||''}</td><td class="num">${r.min||''}${r.km&&r.min?` <span class="mut">${sp(r.min*60/r.km)}</span>`:''}</td><td class="num">${r.fc||''}</td><td class="num">${r.rpe||''}</td><td><button class="x" data-a="del-reg" data-id="${r.id}" aria-label="Quitar">×</button></td></tr>`).join('')}</table></div>`;
 else html+=`<p class="mut">Registra cada carrera (o sincroniza Strava): los ritmos del plan y la progresión de km se ajustan con estos datos.</p>`;
 V().innerHTML=html;
}
function sheetRegistrar(f,t){sheet(`${cabecera('Registrar entreno')}
 <div class="grid2"><div><label>Fecha</label><input id="r-fecha" type="date" value="${f}"></div><div><label>Tipo</label>${selectHTML('r-tipo',[['carrera','Carrera'],['gym','Gimnasio'],['padel','Pádel']],t)}</div></div>
 <div class="grid3"><div><label>Km</label><input id="r-km" type="number" inputmode="decimal" step="0.01" placeholder="7"></div><div><label>Minutos</label><input id="r-min" type="number" inputmode="decimal" step="0.1" placeholder="40"></div><div><label>Pulso medio</label><input id="r-fc" type="number" inputmode="numeric" placeholder="145"></div></div>
 <div class="grid2"><div><label>Esfuerzo (1 fácil – 10 máximo)</label><input id="r-rpe" type="number" inputmode="numeric" min="1" max="10" placeholder="5"></div><div><label>¿Era sesión de series o tempo?</label><select id="r-q"><option value="">No, rodaje</option><option value="1">Sí</option></select></div></div>
 <label>Notas</label><input id="r-notas" placeholder="Cómo te has sentido, molestias…">
 <div style="margin-top:12px"><button class="btn" data-a="save-reg">Guardar</button></div>`)}
