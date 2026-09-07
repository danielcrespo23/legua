// Pestaña Hoy: lo que toca hoy con toda la explicación, y un vistazo a mañana.
function renderHoy(){
 const h=hoy(),k=isoLocal(h),plan=planDe(lunes(h)),ses=sesionesDia(k);
 const man=isoLocal(addDays(h,1)),sm=sesionesDia(man);
 let html=`<h1>Hoy, ${DIASL[wd(h)]} ${h.getDate()}</h1><p class="mut">${FASE_TXT[plan.f]} · ${plan.s>0?'semana -'+plan.s:plan.s===0?'semana de carrera':''}${plan.descarga?' · descarga':''}</p>`;
 if(!state.perfilVisto)html+=perfilCard(true);
 html+=ses.length?ses.map(x=>tarjeta(x,true)).join(''):descansoCard();
 html+=`<h2>Mañana</h2><div class="card">${sm.length?sm.map(chip).join(''):'<span class="mut">Descanso</span>'}</div>`;
 if(state.ajustes.backend)html+=`<button class="btn sec" data-a="strava">Sincronizar Strava</button>`;
 V().innerHTML=html;
}
