// Pestaña Macros: objetivos del día según complexión y tipo de entreno, y registro de lo que comes.
function renderMacros(){
 UI.comidaFecha=UI.comidaFecha||isoLocal(hoy());const f=UI.comidaFecha,o=objetivosDia(f),lista=state.comidas[f]||[];
 const t=lista.reduce((a,x)=>({kcal:a.kcal+x.kcal,p:a.p+x.p,c:a.c+x.c,g:a.g+x.g}),{kcal:0,p:0,c:0,g:0});
 const barra=(l,v,m,c)=>`<div class="row sp" style="font-size:14px"><span>${l}</span><b>${Math.round(v)} / ${m} g</b></div><div class="bar" style="--c:${c}"><i style="width:${Math.min(100,v/m*100)}%"></i></div>`;
 const tipoTxt={fuerte:'fuerte: carga carbohidrato',suave:'de entreno',descanso:'de descanso'}[o.tipo];
 let html=`<div class="row sp"><button class="btn sec sm" data-a="cf" data-n="-1">‹</button><h1 style="margin:0">${fechaTxt(f)}</h1><button class="btn sec sm" data-a="cf" data-n="1">›</button></div>
 <div class="card"><div class="row sp"><span>Día ${tipoTxt}</span><b>${Math.round(t.kcal)} / ${o.kcal} kcal</b></div>
 ${barra('Proteína',t.p,o.p,'var(--gym)')}${barra('Carbohidratos',t.c,o.c,'var(--easy)')}${barra('Grasa',t.g,o.g,'var(--padel)')}
 <p class="mut">${gastoReposo()} kcal en reposo × ${o.factor} por el tipo de día. Proteína ${o.tipo==='fuerte'?2:1.8} g/kg, grasa 1 g/kg y el resto en carbohidrato, para ${P().peso} kg.</p></div>
 <div class="row"><button class="btn" data-a="add-comida">Añadir alimento</button><button class="btn sec" data-a="ia-comida">Describir comida (IA)</button></div>`;
 if(lista.length)html+=`<div class="card"><table><tr><th>Alimento</th><th class="num">g</th><th class="num">kcal</th><th class="num">P</th><th class="num">C</th><th class="num">G</th><th></th></tr>${lista.map((x,i)=>`<tr><td>${esc(x.nombre)}</td><td class="num">${x.gramos}</td><td class="num">${Math.round(x.kcal)}</td><td class="num">${Math.round(x.p)}</td><td class="num">${Math.round(x.c)}</td><td class="num">${Math.round(x.g)}</td><td><button class="x" data-a="del-comida" data-i="${i}" aria-label="Quitar">×</button></td></tr>`).join('')}</table></div>`;
 else html+=`<p class="mut" style="margin-top:12px">Nada apuntado. Añade lo que comas con su peso, o descríbelo y lo estimo.</p>`;
 V().innerHTML=html;
}
function sheetAddComida(){sheet(`${cabecera('Añadir alimento')}
 <input id="c-q" placeholder="Busca: arroz, pollo, plátano…" autocomplete="off"><div id="c-lista" style="margin:8px 0"></div>
 <div class="grid2"><div><label>Alimento elegido</label><input id="c-nombre" readonly placeholder="elige arriba"></div><div><label>Gramos</label><input id="c-g" type="number" inputmode="decimal" placeholder="150"></div></div>
 <input type="hidden" id="c-idx"><div style="margin-top:12px"><button class="btn" data-a="save-comida">Añadir</button></div>`);
 const q=document.getElementById('c-q'),l=document.getElementById('c-lista');
 const pinta=()=>{const t=q.value.toLowerCase().trim();const m=ALIM.map((a,i)=>[a,i]).filter(([a])=>!t||a[0].toLowerCase().includes(t)).slice(0,8);l.innerHTML=m.map(([a,i])=>`<button class="chip" style="--c:var(--easy)" data-a="pick-alim" data-i="${i}"><b>${a[0]}</b><span class="mut">${a[1]} kcal/100 g</span></button>`).join('')};
 q.addEventListener('input',pinta);pinta();q.focus();}
function sheetIA(){sheet(`${cabecera('Describe la comida')}
 <textarea id="ia-txt" placeholder="Ej: un plato de arroz con pollo a la plancha, ensalada con aceite y un plátano"></textarea><div id="ia-res"></div>
 <div style="margin-top:12px"><button class="btn" data-a="ia-run">Calcular macros</button></div>`)}
