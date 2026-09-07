// Pestaña Calendario: mes completo con carreras, gym, pádel y descansos; al tocar un día se ve el detalle.
function renderCalendario(){
 if(!UI.mes)UI.mes=isoLocal(hoy()).slice(0,7);
 if(!UI.diaSel)UI.diaSel=isoLocal(hoy());
 const [y,mo]=UI.mes.split('-').map(Number);
 const first=new Date(y,mo-1,1),last=new Date(y,mo,0),start=lunes(first);
 const k=isoLocal(hoy()),iniISO=isoLocal(inicioPlan());
 let cells='';
 for(let m=start;m<=last;m=addDays(m,7)){
  planDe(m).dias.forEach(d=>{
   const dd=parseISO(d.fecha),out=dd.getMonth()!==mo-1,pre=d.fecha<iniISO;
   const marks=d.ses.map(x=>`<span class="m ${state.estado[x.id]||''}" style="--c:${COL[x.c]}">${x.tipo==='carrera'?(x.sub==='carrera'?'LEGUA':'#'+x.n+' '+kmTxt(x.km)+' km'):x.tipo==='gym'?'Gym '+x.sub:'Pádel'}</span>`).join('');
   cells+=`<button class="d${out?' out':''}${pre?' pre':''}${d.fecha===k?' hoy':''}${d.fecha===UI.diaSel?' sel':''}" data-a="cal-dia" data-f="${d.fecha}"><span class="n">${dd.getDate()}</span>${marks||(pre?'':'<span class="r">descanso</span>')}</button>`;
  });
 }
 let html=`<div class="row sp"><button class="btn sec sm" data-a="cal-mes" data-n="-1">‹</button><h1 style="margin:0">${MESES[mo-1]} ${y}</h1><button class="btn sec sm" data-a="cal-mes" data-n="1">›</button></div>
 <div class="leyenda"><span><i style="--c:var(--easy)"></i>rodaje</span><span><i style="--c:var(--q)"></i>series / tempo</span><span><i style="--c:var(--gym)"></i>gym</span><span><i style="--c:var(--padel)"></i>pádel</span><span><i style="--c:#E3E8E3"></i>descanso</span></div>
 <div class="cal">${DIAS.map(d=>`<div class="hd">${d}</div>`).join('')}${cells}</div>`;

 // detalle del día elegido
 const f=UI.diaSel,ses=sesionesDia(f),plan=planDe(lunes(parseISO(f))),es=state.padel.includes(f);
 html+=`<div class="row sp" style="margin-top:16px"><h2 style="margin:0">${fechaTxt(f)}</h2><button class="padelb ${es?'on':''}" data-a="padel" data-f="${f}">${es?'Quitar pádel':'+ Pádel'}</button></div>
 <p class="mut">${plan.s>0?'Semana -'+plan.s+' · ':''}${FASE_TXT[plan.f]}${plan.kmTotal?` · ${kmTxt(plan.kmTotal)} km esta semana`:''}${plan.descarga?' · descarga':''}</p>`;
 html+=ses.length?ses.map(x=>tarjeta(x,true)).join(''):(f<iniISO?'<div class="card"><span class="mut">Antes del inicio del plan.</span></div>':descansoCard());
 html+=`<div class="row"><button class="btn" data-a="ics" data-f="${f}">Añadir esta semana al calendario del iPhone</button></div>
 <p class="mut">El .ics crea los entrenos en el Calendario con aviso 30 minutos antes, y la creatina a las ${P().creatina}.</p>`;
 V().innerHTML=html;
}
