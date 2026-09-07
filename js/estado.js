// Estado de la app: valores por defecto, carga/guardado y migración desde la versión anterior.
const KEY='legua:v2', KEY_V1='legua:state';

const DEF={
 // complexión y preferencias (sin objetivo de ritmo: los ritmos salen de lo que registres)
 perfil:{nombre:'',sexo:'h',edad:30,altura:175,peso:70,fcmax:'',nivel:'intermedio',pref:'tarde',
  fechaCarrera:'2026-12-24',horaCarrera:'10:00',diasCarrera:[0,2,5],diasGym:[1,3,6],creatina:'08:00'},
 // punto de partida del plan: qué carrera toca en la fecha de inicio y de cuántos km
 entreno:{inicio:'',carrera:5,km:7},
 trabajo:{0:[],1:[],2:[],3:[],4:[],5:[],6:[]},   // franjas ocupadas por día de la semana
 extras:[],          // compromisos puntuales {fecha,i,f,t}
 padel:[],           // fechas con pádel
 estado:{},          // id de sesión -> 'hecho' | 'saltado'
 registros:[],       // entrenos registrados a mano o desde Strava
 comidas:{},         // fecha -> alimentos
 plan:{},            // lunes -> semana generada (caché)
 vol:{},             // lunes -> {nivel,km} de semanas ya pasadas (para que no cambien)
 ajustes:{backend:''},
 onboarding:false,perfilVisto:false
};

let state=null;
// estado de interfaz que no se guarda
const UI={tab:'hoy',mes:null,diaSel:null,comidaFecha:null,obPaso:1,obTmp:null};

const P=()=>state.perfil;

const Store={
 async load(){
  try{ if(window.storage){ const r=await window.storage.get(KEY,false); if(r&&r.value) return JSON.parse(r.value);} }catch(e){}
  try{ const s=localStorage.getItem(KEY); if(s) return JSON.parse(s);}catch(e){}
  return null;
 },
 async save(){
  const s=JSON.stringify(state);
  try{ if(window.storage){ await window.storage.set(KEY,s,false); return;} }catch(e){}
  try{ localStorage.setItem(KEY,s);}catch(e){}
 }
};

// Datos de la versión 1 (un solo html con objetivo de ritmo): rescatamos lo que sigue valiendo.
function migrarV1(){
 try{
  const s=localStorage.getItem(KEY_V1);if(!s)return null;const v=JSON.parse(s);
  const st=JSON.parse(JSON.stringify(DEF));
  ['registros','comidas','extras','padel','estado'].forEach(k=>{if(v[k])st[k]=v[k]});
  if(v.trabajo)st.trabajo=Object.assign({},DEF.trabajo,v.trabajo);
  if(v.ajustes&&v.ajustes.backend)st.ajustes.backend=v.ajustes.backend;
  const p=v.perfil||{};
  ['nombre','peso','fcmax','pref','fechaCarrera','horaCarrera','diasCarrera','diasGym','creatina'].forEach(k=>{if(p[k]!=null&&p[k]!=='')st.perfil[k]=p[k]});
  return st;   // onboarding sigue en false: faltan edad, altura, etc.
 }catch(e){return null}
}

async function cargarEstado(){
 const s=await Store.load();
 state=JSON.parse(JSON.stringify(DEF));
 if(s){
  Object.assign(state,s);
  state.perfil=Object.assign({},DEF.perfil,s.perfil||{});
  state.entreno=Object.assign({},DEF.entreno,s.entreno||{});
  state.ajustes=Object.assign({},DEF.ajustes,s.ajustes||{});
  state.trabajo=Object.assign({},DEF.trabajo,s.trabajo||{});
 }else{const m=migrarV1();if(m)state=m;}
}

// Al guardar se descartan las semanas futuras para que se regeneren con los datos nuevos.
function invalidarFuturo(){const h=isoLocal(lunes(hoy()));Object.keys(state.plan).forEach(k=>{if(k>h)delete state.plan[k]});}
// Cambios de perfil, horario o pádel: también la semana actual.
function invalidar(){const h=isoLocal(lunes(hoy()));Object.keys(state.plan).forEach(k=>{if(k>=h)delete state.plan[k]});delete state.vol[h];}
function guardar(){invalidarFuturo();return Store.save()}
