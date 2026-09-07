// Utilidades compartidas: fechas, ritmos, escape de HTML y toast.
const LEGUA=5.57;
const DIAS=['L','M','X','J','V','S','D'];
const DIASL=['lunes','martes','miércoles','jueves','viernes','sábado','domingo'];
const MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const COL={carrera_suave:'var(--easy)',carrera_q:'var(--q)',carrera_race:'var(--q)',gym:'var(--gym)',padel:'var(--padel)'};

const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const r05=x=>Math.round(x*2)/2;                       // redondea a medio kilómetro
const kmTxt=k=>(Math.round(k*10)/10).toString().replace('.',',');

// fechas (siempre en local, formato ISO yyyy-mm-dd)
const isoLocal=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parseISO=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const wd=d=>(d.getDay()+6)%7;                          // 0 = lunes … 6 = domingo
const lunes=d=>{const x=new Date(d);x.setDate(x.getDate()-wd(x));x.setHours(0,0,0,0);return x};
const hoy=()=>{const d=new Date();d.setHours(0,0,0,0);return d};
const fechaTxt=iso=>{const d=parseISO(iso);return `${DIASL[wd(d)]} ${d.getDate()}/${d.getMonth()+1}`};
const fechaCorta=iso=>{const d=parseISO(iso);return `${DIAS[wd(d)]} ${d.getDate()}/${d.getMonth()+1}`};

// ritmos: "m:ss" <-> segundos por km; horas: "hh:mm" <-> minutos desde medianoche
const ps=s=>{const [m,x]=String(s).split(':').map(Number);return (m||0)*60+(x||0)};
const sp=sec=>{sec=Math.round(sec);return Math.floor(sec/60)+':'+pad(sec%60)};
const rango=(a,b)=>sp(a)+'–'+sp(b);
const hm=s=>{const [h,m]=s.split(':').map(Number);return h*60+(m||0)};
const mh=n=>pad(Math.floor(n/60))+':'+pad(n%60);

function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('on');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('on'),2200)}
