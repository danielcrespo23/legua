// Arranque y render principal: cabecera, navegación y la vista activa.
const VISTAS={hoy:renderHoy,calendario:renderCalendario,entreno:renderEntreno,macros:renderMacros,metricas:renderMetricas,ajustes:renderAjustes};
function render(){
 const dias=Math.round((raceDate()-hoy())/864e5);
 document.getElementById('cuenta').innerHTML=dias>=0?`${dias}<small>días</small>`:'hecho';
 const nav=document.getElementById('nav'),gear=document.getElementById('gear');
 nav.style.display=state.onboarding?'flex':'none';gear.style.display=state.onboarding?'flex':'none';
 if(!state.onboarding){document.getElementById('fase-h').textContent='';return renderOnboarding();}
 const pl=planDe(lunes(hoy()));document.getElementById('fase-h').textContent=pl.f==='post'?'':FASE_TXT[pl.f].split(':')[0];
 document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.t===UI.tab));
 gear.classList.toggle('on',UI.tab==='ajustes');
 (VISTAS[UI.tab]||renderHoy)();
}
(async()=>{
 await cargarEstado();
 invalidarFuturo();render();programarAvisos();
 if('serviceWorker' in navigator&&location.protocol==='https:'){try{navigator.serviceWorker.register('sw.js')}catch(e){}}
})();
