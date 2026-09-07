// Onboarding en 4 pasos: complexión, dónde estás en el plan, días de entreno y horario de trabajo.
function renderOnboarding(){
 UI.obTmp=UI.obTmp||{p:JSON.parse(JSON.stringify(state.perfil)),e:JSON.parse(JSON.stringify(state.entreno))};
 const p=UI.obTmp.p,e=UI.obTmp.e,paso=UI.obPaso;
 let h=`<p class="paso">Paso ${paso} de 4</p>`;
 if(paso===1)h+=`<h1>Quién corre</h1><p class="mut">Con tu complexión calculo pulso máximo, zonas, gasto calórico y macros. Nada de objetivos de ritmo: eso saldrá de lo que vayas registrando.</p><div class="card">
  <label>Nombre</label><input id="f-nombre" value="${esc(p.nombre)}" placeholder="Daniel">
  <label>Sexo</label>${seg('sexo',[['h','Hombre'],['m','Mujer']],p.sexo)}
  <div class="grid3"><div><label>Edad</label><input id="f-edad" type="number" inputmode="numeric" value="${esc(p.edad)}"></div><div><label>Altura (cm)</label><input id="f-altura" type="number" inputmode="numeric" value="${esc(p.altura)}"></div><div><label>Peso (kg)</label><input id="f-peso" type="number" inputmode="decimal" step="0.1" value="${esc(p.peso)}"></div></div>
  <div class="grid2"><div><label>Pulso máximo (si lo sabes)</label><input id="f-fcmax" type="number" inputmode="numeric" value="${esc(p.fcmax)}" placeholder="se estima"></div><div><label>Nivel corriendo</label>${selectHTML('f-nivel',OPT_NIVEL,p.nivel)}</div></div></div>`;
 if(paso===2)h+=`<h1>Dónde estás</h1><p class="mut">El plan continúa desde la carrera que te toca ahora y va subiendo poco a poco hasta la legua.</p><div class="card">
  <div class="grid2"><div><label>Nº de carrera que toca</label><input id="f-ncar" type="number" inputmode="numeric" value="${esc(e.carrera)}"></div><div><label>Km de esa carrera</label><input id="f-kcar" type="number" inputmode="decimal" step="0.5" value="${esc(e.km)}"></div></div>
  <label>Día de esa carrera</label><input id="f-ini" type="date" value="${esc(e.inicio||isoLocal(hoy()))}">
  <div class="grid2"><div><label>Fecha de la legua</label><input id="f-fecha" type="date" value="${esc(p.fechaCarrera)}"></div><div><label>Hora de salida</label><input id="f-hora" type="time" value="${esc(p.horaCarrera)}"></div></div>
  <label>Cuándo prefieres entrenar</label>${selectHTML('f-pref',OPT_PREF,p.pref)}</div>`;
 if(paso===3)h+=`<h1>Tus días</h1><div class="card">
  <label>Días para correr (elige 3)</label>${dsel('run',p.diasCarrera,true)}
  <label>Días de gimnasio (hasta 3)</label>${dsel('gym',p.diasGym,true)}
  <label>Hora de la creatina</label><input id="f-crea" type="time" value="${esc(p.creatina)}">
  <p class="mut">Los días sin nada quedan como descanso. El pádel se añade día a día desde el Calendario y el plan se recoloca solo.</p></div>`;
 if(paso===4)h+=`<h1>Cuándo trabajas</h1><p class="mut">Con tus horas ocupadas calculo la hora óptima de cada entreno. Deja vacío el día libre.</p><div class="card">${horariosHTML()}<button class="btn sec sm" data-a="copiar-lv" type="button">Copiar lunes a martes-viernes</button></div>`;
 h+=`<div class="row sp">${paso>1?'<button class="btn sec" data-a="ob-prev">Atrás</button>':'<span></span>'}<button class="btn" data-a="ob-next">${paso<4?'Siguiente':'Empezar'}</button></div>`;
 V().innerHTML=h;
}
function guardarPasoOb(){const p=UI.obTmp.p,e=UI.obTmp.e,paso=UI.obPaso;
 if(paso===1){p.nombre=val('f-nombre');p.sexo=leerSeg('sexo')||'h';p.edad=Number(val('f-edad'))||30;p.altura=Number(val('f-altura'))||175;p.peso=Number(val('f-peso'))||70;p.fcmax=val('f-fcmax');p.nivel=val('f-nivel')||'intermedio';}
 if(paso===2){e.carrera=Number(val('f-ncar'))||1;e.km=Number(val('f-kcar'))||5;e.inicio=val('f-ini')||isoLocal(hoy());p.fechaCarrera=val('f-fecha')||p.fechaCarrera;p.horaCarrera=val('f-hora')||p.horaCarrera;p.pref=val('f-pref')||'tarde';}
 if(paso===3){const r=leerDsel('run'),g=leerDsel('gym');if(r.length)p.diasCarrera=r.slice(0,3);p.diasGym=g.slice(0,3);p.creatina=val('f-crea')||'08:00';}
 if(paso===4)leerHorarios();
}
