'use strict';
window.installForestFoxes=function(){
 for(const id of ['lyova','green-lyova','cave-lyova','lab-lyova','final-lyova']){
  const old=document.getElementById(id);if(!old||old.classList.contains('forest-fox'))continue;
  const fox=document.createElement('span');fox.id=id;fox.className='forest-fox';fox.innerHTML='<span class="fox-idle" aria-hidden="true">'+[0,1,2,3].map(i=>'<span class="fox-idle-frame fox-idle-'+i+'"></span>').join('')+'</span><span class="fox-running" aria-hidden="true"></span><span class="fox-rearing" aria-hidden="true"></span>';fox.setAttribute('role','img');fox.setAttribute('aria-label','Лёва — сказочный лисёнок');fox.addEventListener('animationend',e=>{if(e.animationName==='fox-rear')fox.classList.remove('happy');});old.replaceWith(fox);
 }
};
window.resetForestFox=function(id,left){const fox=document.getElementById(id);fox.classList.remove('walk','happy');fox.style.transition='none';fox.style.left=left+'%';fox.style.bottom='3%';void fox.offsetWidth;fox.style.transition='';};
window.runFoxToDoor=async function(id,doorId){
 const fox=document.getElementById(id),door=document.getElementById(doorId),room=document.getElementById('game').getBoundingClientRect(),d=door.getBoundingClientRect(),f=fox.getBoundingClientRect();
 // Align the nose with the doorway and the paws with its floor line.
 const x=Math.min(80,Math.max(65,(d.left+d.width*.5-room.left-f.width*.8)/room.width*100));
 const floor=Math.min(88,Math.max(72,(d.bottom-room.top)/room.height*100));
 const bottom=Math.max(2,100-floor-f.height*.18/room.height*100);
 const dx=room.left+room.width*x/100-f.left,dy=room.top+room.height*(1-bottom/100)-f.height-f.top;
 const duration=Math.max(1000,Math.min(2300,Math.hypot(dx,dy)/room.width*3200));
 fox.classList.remove('happy');fox.classList.add('walk');fox.style.transition='none';
 const movement=fox.animate([{transform:'translate(0,0)'},{transform:`translate(${dx}px,${dy}px)`}],{duration,easing:'cubic-bezier(.2,.05,.8,.95)',fill:'forwards'});
 try{await movement.finished;}catch{return;}
 // Commit the final position before removing the compositor animation: no pause or jump at the door.
 fox.style.left=x+'%';fox.style.bottom=bottom+'%';movement.cancel();fox.classList.remove('walk');fox.style.transition='';
};
