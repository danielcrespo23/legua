// Nutrición: lista de alimentos, objetivos diarios según complexión y tipo de día, estimación por IA.
const ALIM=[['Arroz cocido',130,2.7,28,0.3],['Pasta cocida',158,5.8,31,0.9],['Pan blanco',265,9,49,3.2],['Pan integral',250,9,42,3.5],['Patata cocida',87,1.9,20,0.1],['Avena',380,13,60,7],['Plátano',89,1.1,23,0.3],['Manzana',52,0.3,14,0.2],['Naranja',47,0.9,12,0.1],['Dátiles',280,2,75,0.2],['Pechuga de pollo',165,31,0,3.6],['Pavo',135,29,0,1.5],['Ternera magra',180,26,0,8],['Lomo de cerdo',145,27,0,4],['Salmón',208,20,0,13],['Atún al natural',116,26,0,1],['Merluza',90,18,0,1.5],['Huevo',155,13,1.1,11],['Leche entera',61,3.2,4.8,3.3],['Leche desnatada',35,3.4,5,0.1],['Yogur griego',97,9,3.6,5],['Yogur natural',60,4,5,3],['Queso fresco',90,12,3,3],['Queso curado',400,25,1,33],['Lentejas cocidas',116,9,20,0.4],['Garbanzos cocidos',164,9,27,2.6],['Aceite de oliva',884,0,0,100],['Aguacate',160,2,9,15],['Nueces',654,15,14,65],['Almendras',579,21,22,50],['Tortilla de patata',190,7,11,13],['Jamón serrano',240,30,0,13],['Jamón york',110,18,1,4],['Chocolate negro',600,8,45,42],['Miel',304,0.3,82,0],['Proteína en polvo (whey)',380,80,8,5],['Crema de cacahuete',588,25,20,50],['Tomate',18,0.9,3.9,0.2],['Ensalada mixta',20,1.5,3,0.3],['Pizza',270,11,33,10],['Hamburguesa completa',250,13,25,11],['Cerveza',43,0.5,3.6,0],['Bocadillo de jamón',260,12,35,8],['Cereales',370,7,80,3],['Gambas',99,21,0,1],['Verduras salteadas',60,2,7,3]];

// Complexión: IMC y gasto en reposo (Mifflin-St Jeor)
function imc(){const p=P();const h=(Number(p.altura)||175)/100;return Number(p.peso)/(h*h)}
function imcTxt(v){return v<18.5?'bajo peso':v<25?'normal':v<30?'sobrepeso':'obesidad'}
function gastoReposo(){const p=P();const w=Number(p.peso)||70,h=Number(p.altura)||175,a=Number(p.edad)||30;return Math.round(10*w+6.25*h-5*a+(p.sexo==='m'?-161:5))}

// Objetivos del día: proteína 1,8 g/kg (2 en día fuerte), grasa 1 g/kg y el resto de calorías en carbohidrato
function tipoDia(fecha){const ses=sesionesDia(fecha);if(ses.some(x=>x.c==='carrera_q'||x.c==='carrera_race'||x.sub==='larga'))return 'fuerte';return ses.length?'suave':'descanso'}
function objetivosDia(fecha){
 const w=Number(P().peso)||70,tipo=tipoDia(fecha);
 const factor={descanso:1.35,suave:1.55,fuerte:1.75}[tipo];
 const kcal=Math.round(gastoReposo()*factor);
 const p=Math.round((tipo==='fuerte'?2:1.8)*w),g=Math.round(1*w);
 const c=Math.max(0,Math.round((kcal-p*4-g*9)/4));
 return{tipo,kcal,p,c,g,factor};
}

// Estimación de macros por descripción: necesita el backend (api/macros.js) con la clave de Anthropic
async function analizarComida(texto){
 const b=(state.ajustes.backend||'').replace(/\/$/,'');
 if(!b)throw new Error('Sin backend configurado en Ajustes');
 const r=await fetch(b+'/api/macros',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({texto})});
 if(!r.ok)throw new Error('El backend ha respondido '+r.status);
 return (await r.json()).items;
}
