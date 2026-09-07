// Motor del plan: fases, progresión de kilómetros carrera a carrera, gimnasio, descansos y hora de cada sesión.

// ---------- fases ----------
const raceDate=()=>parseISO(P().fechaCarrera);
const inicioPlan=()=>state.entreno.inicio?parseISO(state.entreno.inicio):hoy();
const semanasHasta=monday=>Math.round((lunes(raceDate())-monday)/(7*864e5));
const fase=s=>s>=12?'base':s>=7?'umbral':s>=3?'especifico':s>=1?'afinar':s===0?'carrera':'post';
const FASE_TXT={base:'Base: construir motor aeróbico',umbral:'Umbral: series largas y tempo',especifico:'Específico: ritmo de carrera',afinar:'Afinar: menos volumen, misma chispa',carrera:'Semana de carrera',post:'Después de la carrera'};
const FASES=['base','umbral','especifico','afinar','carrera'];

// ---------- ritmos y pulso (sin objetivo: se estiman de lo que registras) ----------
const fcmax=()=>Number(P().fcmax)||Math.round(208-0.7*(Number(P().edad)||30));
const RITMO_NIVEL={principiante:'6:30',intermedio:'5:45',avanzado:'5:00'};
function rodajesRecientes(){return state.registros.filter(x=>x.tipo==='carrera'&&!x.q&&Number(x.km)>=3&&Number(x.min)>0).sort((a,b)=>b.fecha.localeCompare(a.fecha)).slice(0,3)}
function ritmoSuave(){ // segundos por km de referencia: media de los últimos 3 rodajes registrados, o el típico de tu nivel
 const r=rodajesRecientes();
 if(r.length)return Math.round(r.reduce((a,x)=>a+x.min*60/x.km,0)/r.length);
 return ps(RITMO_NIVEL[P().nivel]||'5:45');
}
const ritmosEstimados=()=>rodajesRecientes().length===0;
function ritmos(){const s=ritmoSuave();return{base:s,suave:rango(s-10,s+15),larga:rango(s,s+20),prog:rango(s-30,s-10),tempo:rango(s-45,s-30),largas:rango(s-60,s-45),cortas:rango(s-80,s-60),legua:sp(s-70)}}
function zonas(){const m=fcmax(),z=p=>Math.round(m*p);return{suave:z(.70)+'–'+z(.80),larga:z(.72)+'–'+z(.82),tempo:z(.86)+'–'+z(.91),series:z(.90)+'–'+z(.96)}}

// ---------- sesiones de carrera ----------
function minutosCarrera(sub,km){const s=ritmoSuave();const seg=sub==='carrera'?km*(s-70):km*(['rodaje','rectas','larga'].includes(sub)?s+5:s-15);return Math.max(20,Math.round(seg/60/5)*5)+(sub==='carrera'?45:0)}
function sesCarrera(sub,km,extra){
 const r=ritmos(),z=zonas(),k=kmTxt(km);
 const T={
  rodaje:{t:'Rodaje',d:`${k} km a ritmo cómodo, ${r.suave} min/km. Pulso ${z.suave}. Tienes que poder hablar.`,c:'carrera_suave'},
  rectas:{t:'Rodaje con rectas',d:`${k} km suaves (${r.suave}). En los últimos 2 km mete ${extra} de 1' más vivos (${r.prog}) con 2' suave entre cada una.`,c:'carrera_suave'},
  larga:{t:'Tirada larga',d:`${k} km a ${r.larga}. Pulso ${z.larga}. Empieza más lento de lo que crees.`+(extra?` ${extra}.`:''),c:'carrera_suave'},
  largas:{t:'Series largas',d:`${k} km en total: 2 km calentar, ${extra} a ${r.largas} con 2' al trote entre series, 1,5 km soltar. Pulso en las series ${z.series}.`,c:'carrera_q'},
  tempo:{t:'Tempo',d:`${k} km en total: 2 km calentar, ${extra} seguidos a ${r.tempo} ("cómodamente duro", pulso ${z.tempo}), 1,5 km soltar.`,c:'carrera_q'},
  cortas:{t:'Series cortas',d:`${k} km en total: 2 km calentar + 3 progresivos, ${extra} a ${r.cortas} con 90" al trote, 1,5 km soltar.`,c:'carrera_q'},
  activacion:{t:'Activación',d:`${k} km suaves con ${extra} a ${r.prog}. Piernas sueltas, nada de cansarse.`,c:'carrera_q'},
  carrera:{t:'LA LEGUA',d:`${LEGUA} km. Sal controlado el primer km y aprieta a partir del tercero. Ritmo estimado ${r.legua} min/km.`,c:'carrera_race'}
 };
 const s=T[sub];return{tipo:'carrera',sub,titulo:s.t,detalle:s.d,km,min:minutosCarrera(sub,km),c:s.c};
}

// ---------- progresión de kilómetros ----------
// Cada semana el rodaje base sube 0,5 km. Si la semana anterior fue muy dura (RPE >= 8) se mantiene;
// si apenas se hizo nada, baja 0,5. Cada cuarta semana hay descarga (-20 %) y cada fase tiene un tope.
function evaluarSemana(monday){
 const ini=isoLocal(monday),fin=isoLocal(addDays(monday,6));
 const plan=state.plan[ini];if(!plan)return .5;
 const runs=plan.dias.flatMap(d=>d.ses).filter(x=>x.tipo==='carrera');
 const regs=state.registros.filter(r=>r.fecha>=ini&&r.fecha<=fin&&r.tipo==='carrera');
 const hechas=runs.filter(x=>state.estado[x.id]==='hecho').length;
 if(!hechas&&!regs.length)return .5;
 const rpeMax=Math.max(0,...regs.map(r=>Number(r.rpe)||0));
 if(rpeMax>=8)return 0;
 if(hechas<Math.min(2,runs.length)&&regs.length<2)return -.5;
 return .5;
}
const CAP_KM={base:9,umbral:9,especifico:8,afinar:6,carrera:4,post:5};
function kmSemana(monday){
 const key=isoLocal(monday);if(state.vol[key])return state.vol[key];
 const s=semanasHasta(monday),f=fase(s),ini=lunes(inicioPlan()),prev=addDays(monday,-7);
 let nivel;
 if(monday<=ini)nivel=Number(state.entreno.km)||7;
 else{planDe(prev);nivel=kmSemana(prev).nivel+evaluarSemana(prev);}
 nivel=r05(Math.max(3,nivel));
 let km=Math.min(nivel,CAP_KM[f]||9),descarga=false;
 if(s%4===0&&s>2&&monday>ini){km=r05(km*.8);descarga=true;}
 if(f==='afinar')km=s===2?Math.min(km,6):5;
 if(f==='carrera')km=4;if(f==='post')km=5;
 const v={nivel,km,descarga};
 if(monday<lunes(hoy()))state.vol[key]=v;
 return v;
}
function sesionesCarrera(f,s,km){
 const L=Math.min(r05(km*1.3),{base:13,umbral:13,especifico:11}[f]||10);
 if(f==='base')return[sesCarrera('rodaje',km),sesCarrera('rectas',km,'4 rectas'),sesCarrera('larga',L,s<=13?"Últimos 10' un punto más vivos":'')];
 if(f==='umbral'){const q=s%2?sesCarrera('largas',km,({11:'4 × 1000 m',9:'5 × 1000 m',7:'6 × 1000 m'})[s]||'5 × 1000 m'):sesCarrera('tempo',km,({10:"15'",8:"20'"})[s]||"20'");return[sesCarrera('rodaje',km),q,sesCarrera('larga',L)];}
 if(f==='especifico'){const C={6:'8 × 400 m',5:'10 × 400 m',4:'6 × 600 m',3:'8 × 400 m'},T={6:"20'",5:"2 × 12' (3' suave entre)",4:"25'",3:"15'"};return[sesCarrera('cortas',km,C[s]||'8 × 400 m'),sesCarrera('tempo',km,T[s]||"20'"),sesCarrera('larga',L)];}
 if(f==='afinar')return s===2?[sesCarrera('cortas',6,'6 × 400 m'),sesCarrera('rodaje',5),sesCarrera('larga',8)]:[sesCarrera('rodaje',5),sesCarrera('rodaje',4),sesCarrera('activacion',4,'4 × 200 m')];
 if(f==='post')return[sesCarrera('rodaje',5),sesCarrera('rodaje',5)];
 return[];
}

// ---------- gimnasio ----------
const GYM={
 A:{t:'Fuerza tren inferior',min:45,ej:["Sentadilla 4×6 (pesado, 2' descanso)",'Peso muerto rumano 3×8','Zancadas caminando 3×10 por pierna','Elevación de gemelo 3×15','Plancha 3×45"']},
 B:{t:'Tren superior y core',min:40,ej:['Press banca 3×8','Remo con barra 3×10','Press militar 3×8','Dominadas o jalón 3×8','Dead bug 3×12','Plancha lateral 3×30" por lado']},
 C:{t:'Potencia y gemelo',min:35,ej:['Salto al cajón 4×6','Sentadilla búlgara 3×8 por pierna','Gemelo a una pierna 3×12','Step-up con mancuernas 3×10','Hip thrust 3×10','Pallof press 3×12']}};
function rutinasFase(f,s){return f==='post'?[]:(f==='base'||f==='umbral')?['A','B','C']:f==='especifico'?['A','C']:s===2?['A','B']:s===1?['B']:[]}
function sesGym(k,f){const g=GYM[k],lig=f==='afinar'||f==='carrera';return{tipo:'gym',sub:k,titulo:'Gym '+k+' · '+g.t+(lig?' (ligero)':''),detalle:lig?'Mismos ejercicios, mitad de series, cargas cómodas.':'Sin fallo muscular: el objetivo es correr, no romperte.',ej:g.ej,min:lig?25:g.min,c:'gym'}}

// ---------- comida alrededor de cada sesión ----------
const COMIDA={
 suave:{antes:'1 h antes: plátano o tostada con miel. Si es temprano, café, agua y a correr; el desayuno después.',despues:'Comida normal con carbohidrato y 25-30 g de proteína.'},
 larga:{antes:"1,5-2 h antes: avena con plátano o 2 tostadas con miel y café. Lleva agua si pasa de 50'.",despues:'En la hora siguiente: arroz o pasta con pollo o atún. Rehidrata.'},
 q:{antes:"2-3 h antes: arroz o pasta con proteína magra, poca grasa y poca fibra. 45' antes: plátano o 2-3 dátiles.",despues:'30-40 g de proteína + carbohidrato en la hora siguiente. Hoy no escatimes arroz, pasta o pan.'},
 gym:{antes:'1-2 h antes: yogur griego con avena y fruta, o tostada con pavo.',despues:'Batido o comida con 30-40 g de proteína. Creatina.'},
 padel:{antes:'Como un rodaje suave: algo ligero 1 h antes. Botella de agua.',despues:"Cena normal. Si has jugado más de 90', mete algo de carbohidrato extra."}};
function comidaPara(x){if(x.tipo==='gym')return COMIDA.gym;if(x.tipo==='padel')return COMIDA.padel;if(x.c==='carrera_q'||x.c==='carrera_race')return COMIDA.q;if(x.sub==='larga')return COMIDA.larga;return COMIDA.suave}

// ---------- hora óptima según horario de trabajo ----------
function libres(fecha,occ){
 const w=wd(parseISO(fecha));
 const bl=[...(state.trabajo[w]||[]).map(b=>[hm(b.i),hm(b.f)]),...state.extras.filter(e=>e.fecha===fecha).map(e=>[hm(e.i),hm(e.f)]),...occ].sort((a,b)=>a[0]-b[0]);
 const fr=[];let cur=360;for(const [a,b] of bl){if(a>cur)fr.push([cur,a]);cur=Math.max(cur,b);}if(cur<1380)fr.push([cur,1380]);return fr;
}
function horaOptima(fecha,min,occ){
 const need=min+20;
 const fr=libres(fecha,occ).map(([a,b])=>[a+30,b]).filter(([a,b])=>b-a>=need);
 if(!fr.length)return '';
 const pref=P().pref;let pick;
 if(pref==='manana')pick=fr[0];
 else if(pref==='mediodia')pick=fr.find(([a,b])=>a<=14*60&&b>=13*60+need)||fr[0];
 else pick=fr.find(([a])=>a>=17*60)||fr[fr.length-1];
 let st=pick[0];
 if(pref==='tarde'&&st<17*60&&pick[1]-17*60>=need)st=17*60;
 if(pref==='mediodia'&&st<13*60&&pick[1]-13*60>=need)st=13*60;
 if(st<390)st=390;
 return mh(st);
}

// ---------- numeración de carreras ----------
// La primera carrera de la semana continúa la cuenta de todas las semanas anteriores desde el inicio del plan.
function numeroInicial(monday){
 const ini=lunes(inicioPlan());let n=Number(state.entreno.carrera)||1;
 for(let m=ini;m<monday;m=addDays(m,7))n+=planDe(m).dias.flatMap(d=>d.ses).filter(x=>x.tipo==='carrera').length;
 return n;
}

// ---------- generación de una semana ----------
function generarSemana(monday){
 const key=isoLocal(monday),s=semanasHasta(monday),f=fase(s);
 const dias=[...Array(7)].map((_,i)=>({fecha:isoLocal(addDays(monday,i)),ses:[]}));
 const ini=inicioPlan(),iniISO=isoLocal(ini);
 const padelSet=new Set(state.padel);
 const esPadel=i=>i>=0&&i<7&&padelSet.has(dias[i].fecha);
 const antesDeEmpezar=i=>dias[i].fecha<iniISO;
 const esQ=x=>x&&x.tipo==='carrera'&&x.c==='carrera_q';
 const tieneRun=i=>dias[i].ses.some(x=>x.tipo==='carrera');
 const place=(i,x)=>dias[i].ses.push(x);
 const quitar=(i,x)=>{dias[i].ses=dias[i].ses.filter(y=>y!==x)};
 const v=kmSemana(monday);
 const plan={key,s,f,km:v.km,nivel:v.nivel,descarga:v.descarga,dias};
 if(monday<lunes(ini)){plan.kmTotal=0;plan.descansos=[0,1,2,3,4,5,6];state.plan[key]=plan;return plan;}      // antes del plan: todo descanso

 if(f==='carrera'){
  const rd=wd(raceDate());
  place(rd,sesCarrera('carrera',LEGUA));
  if(rd>=2)place(rd-2,sesCarrera('activacion',4,'4 × 200 m'));
  if(rd>=3)place(rd-3,sesCarrera('rodaje',4));
  if(rd>=5)place(rd-5,sesCarrera('rodaje',5));
  if(rd>=3)place(rd-3,sesGym('B',f));
 }else{
  let runs=sesionesCarrera(f,s,v.km);
  let runDays=[...new Set(P().diasCarrera)].sort((a,b)=>a-b);
  // semana de arranque: la carrera de hoy va el día de inicio aunque no sea día habitual
  if(key===isoLocal(lunes(ini))){const w=wd(ini);runDays=runDays.filter(d=>d>=w);if(!runDays.includes(w))runDays=[w,...runDays].slice(0,3);runs=runs.slice(0,Math.max(runDays.length,1));}
  runs.forEach((r,i)=>{
   const pref=runDays[i]??(i*2)%7;let d=pref,t=0;
   while(t<7&&(esPadel(d)||tieneRun(d)||antesDeEmpezar(d))){d=(d+1)%7;t++;}
   if(t>=7)d=pref;else if(d!==pref)r.nota=esPadel(pref)?'Movido por pádel':'Movido: el día previsto ya tenía carrera';
   place(d,r);
  });
  // nada de series el día después de pádel o de otra sesión de calidad
  for(let i=0;i<7;i++){
   const q=dias[i].ses.find(esQ);if(!q)continue;
   const malo=k=>k>0&&(esPadel(k-1)||dias[k-1].ses.some(esQ));
   if(malo(i)){
    const j=dias.findIndex((d,k)=>k!==i&&!antesDeEmpezar(k)&&d.ses.some(x=>x.tipo==='carrera'&&x.sub==='rodaje')&&!malo(k));
    if(j>=0){const e=dias[j].ses.find(x=>x.tipo==='carrera'&&x.sub==='rodaje');quitar(i,q);quitar(j,e);place(i,e);place(j,q);q.nota='Movido: nada de series el día después de pádel';}
    else q.nota='Pádel el día anterior: si llegas cansado, hazlo suave';
   }
  }
  // gimnasio: nunca piernas (A o C) el día antes de series, ni encima de series o pádel
  const rut=rutinasFase(f,s);
  if(rut.length){
   const gymDays=[...new Set(P().diasGym)].sort((a,b)=>a-b);
   const piernas=k=>k==='A'||k==='C';
   const conflicto=(k,x,strict)=>antesDeEmpezar(x)||esPadel(x)||dias[x].ses.some(esQ)||dias[x].ses.some(y=>y.tipo==='gym')||(piernas(k)&&x<6&&dias[x+1].ses.some(esQ))||(strict&&tieneRun(x));
   const pendientes=[...rut];
   gymDays.forEach(x=>{const k=pendientes.find(k=>!conflicto(k,x,true))??pendientes.find(k=>!conflicto(k,x,false));if(k==null)return;pendientes.splice(pendientes.indexOf(k),1);const gg=sesGym(k,f);if(tieneRun(x))gg.nota='Doble sesión: primero la carrera, gym después';place(x,gg);});
   pendientes.forEach(k=>{const gg=sesGym(k,f);const pref=gymDays.find(x=>!dias[x].ses.some(y=>y.tipo==='gym'))??gymDays[0]??1;let d=-1;
    for(let t=0;t<7&&d<0;t++){const x=(pref+t)%7;if(!conflicto(k,x,true))d=x;}
    for(let t=0;t<7&&d<0;t++){const x=(pref+t)%7;if(!conflicto(k,x,false))d=x;}
    if(d<0){if(antesDeEmpezar(pref))return;d=pref;gg.nota='Semana apretada: si no llegas, salta esta';}
    else gg.nota=esPadel(pref)?'Movido por pádel':piernas(k)?'Movido: piernas no van con series ni el día antes':'Movido: el día previsto ya estaba ocupado';
    if(tieneRun(d))gg.nota+='. Doble sesión: primero la carrera, gym después';
    place(d,gg);});
  }
 }
 dias.forEach((d,i)=>{if(esPadel(i))d.ses.unshift({tipo:'padel',sub:'padel',titulo:'Pádel',detalle:"Cuenta como día de carga. Calienta 10' y estira gemelos después.",min:90,c:'padel'});});
 // numerar carreras, ids y horas
 let n=numeroInicial(monday);
 dias.forEach(d=>{const occ=[];d.ses.forEach(x=>{x.fecha=d.fecha;x.id=d.fecha+'|'+x.tipo+'|'+x.sub;if(x.tipo==='carrera')x.n=n++;
  x.hora=x.tipo==='padel'?'':x.sub==='carrera'?P().horaCarrera:horaOptima(d.fecha,x.min,occ);if(x.hora){const h=hm(x.hora);occ.push([h,h+x.min+20]);}});});
 plan.kmTotal=r05(dias.flatMap(d=>d.ses).filter(x=>x.tipo==='carrera').reduce((a,x)=>a+x.km,0));
 plan.descansos=dias.map((d,i)=>d.ses.length?null:i).filter(i=>i!=null);
 state.plan[key]=plan;return plan;
}
function planDe(monday){const k=isoLocal(monday);return state.plan[k]||generarSemana(monday)}
function sesionesDia(fecha){const p=planDe(lunes(parseISO(fecha)));return (p.dias.find(d=>d.fecha===fecha)||{ses:[]}).ses}
// próximas carreras a partir de hoy (para la pestaña Entreno)
function proximasCarreras(n){const out=[];let m=lunes(hoy()),k=isoLocal(hoy());for(let w=0;w<20&&out.length<n;w++,m=addDays(m,7)){planDe(m).dias.forEach(d=>{if(d.fecha>=k)d.ses.filter(x=>x.tipo==='carrera').forEach(x=>out.push(x))});}return out.slice(0,n)}
