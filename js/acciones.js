// Acciones: cada botón lleva data-a="nombre" y aquí está la función que lo atiende.
const A={
 tab:d=>{UI.tab=d.t;render();window.scrollTo(0,0)},
 dsel:(d,el)=>{const box=el.parentElement;if(box.dataset.multi==='1')el.classList.toggle('on');else{box.querySelectorAll('button').forEach(b=>b.classList.remove('on'));el.classList.add('on')}},
 seg:(d,el)=>{el.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('on'));el.classList.add('on')},
 // onboarding
 'ob-prev':()=>{guardarPasoOb();UI.obPaso--;render()},
 'ob-next':async()=>{guardarPasoOb();if(UI.obPaso<4){UI.obPaso++;return render()}
  state.perfil=UI.obTmp.p;state.entreno=UI.obTmp.e;if(!state.entreno.inicio)state.entreno.inicio=isoLocal(hoy());
  state.onboarding=true;state.plan={};state.vol={};await guardar();UI.tab='hoy';UI.obTmp=null;render()},
 'copiar-lv':()=>{const a=val('t-i-0'),b=val('t-f-0');for(let i=1;i<5;i++){document.getElementById('t-i-'+i).value=a;document.getElementById('t-f-'+i).value=b}},
 'cerrar-perfil':async()=>{state.perfilVisto=true;await guardar();render()},
 // sesiones
 ses:d=>sheetSesion(d.id,d.k),
 cerrar:()=>cerrar(),
 'cerrar-fondo':(d,el,e)=>{if(e.target.id==='sheet')cerrar()},
 hecho:async d=>{state.estado[d.id]=state.estado[d.id]==='hecho'?'':'hecho';await guardar();cerrar();render()},
 saltar:async d=>{state.estado[d.id]=state.estado[d.id]==='saltado'?'':'saltado';await guardar();cerrar();render()},
 registrar:d=>sheetRegistrar(d.f||isoLocal(hoy()),d.t||'carrera'),
 'save-reg':async()=>{const f=val('r-fecha'),t=val('r-tipo');if(!f)return toast('Falta la fecha');
  const r={id:'m-'+Date.now(),fecha:f,tipo:t,km:Number(val('r-km'))||'',min:Number(val('r-min'))||'',fc:Number(val('r-fc'))||'',rpe:Number(val('r-rpe'))||'',q:val('r-q')?1:'',fuente:'manual',notas:val('r-notas')};
  state.registros.push(r);const ses=sesionesDia(f).find(x=>x.tipo===t&&state.estado[x.id]!=='hecho');if(ses)state.estado[ses.id]='hecho';
  await guardar();cerrar();render();toast('Registrado')},
 'del-reg':async d=>{state.registros=state.registros.filter(r=>r.id!==d.id);await guardar();render()},
 // calendario
 'cal-mes':d=>{const [y,m]=UI.mes.split('-').map(Number);const x=new Date(y,m-1+Number(d.n),1);UI.mes=isoLocal(x).slice(0,7);render()},
 'cal-dia':d=>{UI.diaSel=d.f;render()},
 padel:async d=>{const i=state.padel.indexOf(d.f);if(i>=0)state.padel.splice(i,1);else state.padel.push(d.f);invalidar();await guardar();render();toast(i>=0?'Pádel quitado':'Pádel añadido: plan recolocado')},
 ics:d=>exportarICS(planDe(lunes(parseISO(d.f||isoLocal(hoy()))))),
 // entreno
 partida:()=>sheetPartida(),
 'save-partida':async()=>{const e=state.entreno;e.carrera=Number(val('pp-n'))||1;e.km=Number(val('pp-km'))||5;e.inicio=val('pp-ini')||isoLocal(hoy());state.plan={};state.vol={};await guardar();cerrar();render();toast('Plan recalculado')},
 // macros
 cf:d=>{UI.comidaFecha=isoLocal(addDays(parseISO(UI.comidaFecha),Number(d.n)));render()},
 'add-comida':()=>sheetAddComida(),
 'pick-alim':d=>{document.getElementById('c-idx').value=d.i;document.getElementById('c-nombre').value=ALIM[d.i][0];document.getElementById('c-g').focus()},
 'save-comida':async()=>{const i=val('c-idx'),g=Number(val('c-g'));if(i===''||!g)return toast('Elige alimento y gramos');const a=ALIM[i],k=g/100;
  (state.comidas[UI.comidaFecha]=state.comidas[UI.comidaFecha]||[]).push({nombre:a[0],gramos:g,kcal:a[1]*k,p:a[2]*k,c:a[3]*k,g:a[4]*k});await guardar();cerrar();render()},
 'del-comida':async d=>{state.comidas[UI.comidaFecha].splice(Number(d.i),1);await guardar();render()},
 'ia-comida':()=>sheetIA(),
 'ia-run':async()=>{const t=val('ia-txt');if(!t)return;const res=document.getElementById('ia-res');res.innerHTML='<p class="mut">Calculando…</p>';
  try{const items=await analizarComida(t);(state.comidas[UI.comidaFecha]=state.comidas[UI.comidaFecha]||[]).push(...items.map(x=>({nombre:x.nombre,gramos:Math.round(x.gramos),kcal:+x.kcal,p:+x.p,c:+x.c,g:+x.g})));await guardar();cerrar();render();toast(`${items.length} alimentos añadidos (estimación)`)}
  catch(e){res.innerHTML=`<div class="aviso">${esc(e.message)}. Usa "Añadir alimento" con la lista.</div>`}},
 // ajustes
 'save-perfil':async()=>{const p=P();p.nombre=val('a-nombre');p.sexo=leerSeg('sexo')||p.sexo;p.edad=Number(val('a-edad'))||p.edad;p.altura=Number(val('a-altura'))||p.altura;p.peso=Number(val('a-peso'))||p.peso;p.fcmax=val('a-fcmax');p.nivel=val('a-nivel')||p.nivel;
  p.fechaCarrera=val('a-fecha')||p.fechaCarrera;p.horaCarrera=val('a-hora')||p.horaCarrera;p.pref=val('a-pref')||p.pref;
  const r=leerDsel('run'),g=leerDsel('gym');if(r.length)p.diasCarrera=r.slice(0,3);p.diasGym=g.slice(0,3);p.creatina=val('a-crea')||p.creatina;invalidar();await guardar();render();toast('Guardado')},
 'save-horario':async()=>{leerHorarios();invalidar();await guardar();render();toast('Horario guardado')},
 'add-extra':async()=>{const f=val('e-fecha'),i=val('e-i'),fin=val('e-f');if(!f||!i||!fin)return toast('Fecha, inicio y fin');state.extras.push({fecha:f,i,f:fin,t:val('e-t')});invalidar();await guardar();render()},
 'del-extra':async d=>{state.extras.splice(Number(d.i),1);invalidar();await guardar();render()},
 'save-backend':async()=>{state.ajustes.backend=val('a-backend');await guardar();render();toast('Guardado')},
 'strava-conectar':()=>{const b=(state.ajustes.backend||'').replace(/\/$/,'');if(b)window.open(b+'/api/strava-auth','_blank')},
 strava:()=>sincronizarStrava(),
 notif:async()=>{if(!('Notification' in window))return toast('Este navegador no permite avisos; usa el calendario');const p=await Notification.requestPermission();if(p==='granted'){programarAvisos();toast('Avisos activados con la app abierta')}else toast('Sin permiso')},
 export:()=>descargar('legua-copia.json',JSON.stringify(state,null,1),'application/json'),
 'copiar-resumen':async()=>{try{await navigator.clipboard.writeText(resumenParaClaude());toast('Copiado: pégalo en el chat')}catch(e){sheet(`${cabecera('Resumen')}<textarea style="min-height:220px">${esc(resumenParaClaude())}</textarea>`)}},
 reset:async()=>{if(!confirm('¿Borrar todos los datos de la app?'))return;state=JSON.parse(JSON.stringify(DEF));UI.obTmp=null;UI.obPaso=1;await Store.save();render()}
};
document.body.addEventListener('click',e=>{const el=e.target.closest('[data-a]');if(!el)return;const a=el.dataset.a;if(A[a])A[a](el.dataset,el,e)});
document.body.addEventListener('change',async e=>{if(e.target.id==='imp'&&e.target.files[0]){try{const j=JSON.parse(await e.target.files[0].text());state=Object.assign(JSON.parse(JSON.stringify(DEF)),j);await Store.save();render();toast('Copia importada')}catch(err){toast('Archivo no válido')}}});
