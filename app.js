'use strict';
let simulators=[],active=null,player=null,loadId=0,lastButton=null;
const dialog=document.getElementById('viewer'),host=document.getElementById('player-host'),loading=document.getElementById('loading');
async function openSimulator(sim,button){
 active=sim;lastButton=button||lastButton;const id=++loadId;
 if(!dialog.open){dialog.showModal();document.body.style.overflow='hidden';}
 document.getElementById('viewer-title').textContent=sim.name.replace(/\.exe$/i,'');
 loading.hidden=false;loading.textContent='Preparando o instrumento…';host.replaceChildren();
 player=window.RufflePlayer.newest().createPlayer();host.appendChild(player);
 try{await player.ruffle().load({url:sim.file,preferredRenderer:'wgpu-webgl',quality:'best',scale:'showAll',forceScale:true,autoplay:'on',backgroundColor:'#ffffff',letterbox:'off',allowScriptAccess:false});if(id===loadId)loading.hidden=true;}
 catch(e){if(id===loadId){loading.textContent='Não foi possível abrir o instrumento. Tente reiniciar.';}console.error(e);}
}
function closeSimulator(){++loadId;host.replaceChildren();player=null;active=null;if(dialog.open)dialog.close();document.body.style.overflow='';lastButton?.focus();}
document.getElementById('close').addEventListener('click',closeSimulator);
dialog.addEventListener('cancel',e=>{e.preventDefault();closeSimulator();});
document.getElementById('reset').addEventListener('click',()=>{if(active)openSimulator(active);});
document.getElementById('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{document.getElementById('fullscreen').textContent='Tela cheia indisponível';}});
fetch('simuladores.json').then(r=>{if(!r.ok)throw new Error('catalog');return r.json();}).then(items=>{
 simulators=items;const groups=new Map();for(const sim of items){if(!groups.has(sim.group))groups.set(sim.group,[]);groups.get(sim.group).push(sim);}
 const order=[...groups.entries()].sort((a,b)=>Math.min(...a[1].map(s=>questao(s.group)))-Math.min(...b[1].map(s=>questao(s.group))));
 order.forEach(([group,list],index)=>{const section=document.createElement('section');section.className='group';const heading=document.createElement('div');heading.className='group-heading';const num=document.createElement('span');num.className='group-number';num.textContent=String(index+1).padStart(2,'0');const title=document.createElement('h3');title.textContent=group.replace(/\s*-\s*\d+.*Questão.*$/u,'');const rule=document.createElement('span');rule.className='rule';heading.append(num,title,rule);const cards=document.createElement('div');cards.className='cards';for(const sim of list){const button=document.createElement('button');button.type='button';button.className='sim-button';button.dataset.id=sim.id;const n=document.createElement('span');n.className='sim-index';n.textContent=String(sim.id).padStart(2,'0');n.setAttribute('aria-hidden','true');const name=document.createElement('span');name.className='sim-name';name.textContent=sim.name.replace(/\.exe$/i,'');const arrow=document.createElement('span');arrow.className='sim-arrow';arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');button.append(n,name,arrow);button.addEventListener('click',()=>openSimulator(sim,button));cards.append(button);}section.append(heading,cards);document.getElementById('catalog').append(section);});
}).catch(()=>{document.getElementById('catalog').textContent='Não foi possível carregar os simuladores. Atualize a página para tentar novamente.';});
function questao(group){return Number((group.match(/\d+/)||['99'])[0]);}
