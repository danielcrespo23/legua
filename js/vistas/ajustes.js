// Ajustes: complexión, carrera, días, punto de partida, horario, backend, avisos y copia de datos.
function renderAjustes(){const p=P(),a=state.ajustes,e=state.entreno;
 V().innerHTML=`<h1>Ajustes</h1>
 <div class="card"><h2>Complexión</h2>
 <div class="grid2"><div><label>Nombre</label><input id="a-nombre" value="${esc(p.nombre)}"></div><div><label>Sexo</label>${seg('sexo',[['h','Hombre'],['m','Mujer']],p.sexo)}</div></div>
 <div class="grid3"><div><label>Edad</label><input id="a-edad" type="number" inputmode="numeric" value="${esc(p.edad)}"></div><div><label>Altura (cm)</label><input id="a-altura" type="number" inputmode="numeric" value="${esc(p.altura)}"></div><div><label>Peso (kg)</label><input id="a-peso" type="number" inputmode="decimal" step="0.1" value="${esc(p.peso)}"></div></div>
 <div class="grid2"><div><label>Pulso máximo</label><input id="a-fcmax" type="number" value="${esc(p.fcmax)}" placeholder="${fcmax()} (estimado)"></div><div><label>Nivel</label>${selectHTML('a-nivel',OPT_NIVEL,p.nivel)}</div></div>
 <h3>Carrera y días</h3>
 <div class="grid3"><div><label>Fecha legua</label><input id="a-fecha" type="date" value="${esc(p.fechaCarrera)}"></div><div><label>Hora de salida</label><input id="a-hora" type="time" value="${esc(p.horaCarrera)}"></div><div><label>Preferencia</label>${selectHTML('a-pref',[['manana','Mañana'],['mediodia','Mediodía'],['tarde','Tarde']],p.pref)}</div></div>
 <label>Días para correr</label>${dsel('run',p.diasCarrera,true)}<label>Días de gimnasio</label>${dsel('gym',p.diasGym,true)}
 <label>Hora de la creatina</label><input id="a-crea" type="time" value="${esc(p.creatina)}">
 <div style="margin-top:10px"><button class="btn" data-a="save-perfil">Guardar</button></div></div>

 <div class="card"><h2>Punto de partida del plan</h2><p class="mut">Carrera #${e.carrera} de ${kmTxt(e.km)} km el ${fechaTxt(e.inicio||isoLocal(hoy()))}. A partir de ahí se numeran y suben las carreras.</p><button class="btn sec" data-a="partida">Cambiar</button></div>

 <div class="card"><h2>Horario de trabajo</h2><p class="mut">Franja ocupada cada día. El entreno se coloca en el primer hueco libre según tu preferencia.</p>${horariosHTML()}<div class="row" style="margin-top:8px"><button class="btn" data-a="save-horario">Guardar horario</button><button class="btn sec" data-a="copiar-lv">Copiar lunes a M-V</button></div>
 <h3>Otros compromisos</h3>${state.extras.map((ex,i)=>`<div class="row sp" style="font-size:14px"><span>${fechaTxt(ex.fecha)} ${ex.i}–${ex.f} ${esc(ex.t||'')}</span><button class="x" data-a="del-extra" data-i="${i}" aria-label="Quitar">×</button></div>`).join('')}<div class="hrow" style="margin-top:6px"><input id="e-fecha" type="date"></div><div class="hrow"><input id="e-i" type="time"><span class="mut">a</span><input id="e-f" type="time"></div><div class="row" style="margin-top:6px"><input id="e-t" placeholder="Qué es (opcional)" style="flex:1"><button class="btn sec" data-a="add-extra">Añadir</button></div></div>

 <div class="card"><h2>Strava e IA</h2><p class="mut">Necesitan el backend (carpeta <b>api/</b> desplegada en Vercel). Sin él, la app funciona igual pero registras a mano y los macros los calculas con la lista.</p>
 <label>URL del backend</label><input id="a-backend" value="${esc(a.backend)}" placeholder="https://legua-api.vercel.app">
 <div class="row" style="margin-top:8px"><button class="btn sec" data-a="save-backend">Guardar</button><button class="btn" data-a="strava-conectar" ${a.backend?'':'disabled'}>Conectar Strava</button><button class="btn" data-a="strava" ${a.backend?'':'disabled'}>Sincronizar ahora</button></div></div>

 <div class="card"><h2>Avisos</h2><p class="mut">Con la app abierta te avisa 30' antes del entreno. Para avisos con la app cerrada, usa "Añadir esta semana al calendario" en Calendario.</p><button class="btn sec" data-a="notif">Permitir avisos</button></div>

 <div class="card"><h2>Datos</h2><div class="row"><button class="btn sec" data-a="export">Exportar copia (JSON)</button><label class="btn sec" style="margin:0">Importar<input type="file" id="imp" accept="application/json" style="display:none" data-a="import"></label><button class="btn sec" data-a="copiar-resumen">Copiar resumen para Claude</button><button class="btn q" data-a="reset">Borrar todo</button></div></div>`;
}
