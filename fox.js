'use strict';
window.installForestFoxes=function(){
 for(const id of ['lyova','green-lyova','cave-lyova','lab-lyova','final-lyova']){
  const old=document.getElementById(id);if(!old||old.classList.contains('forest-fox'))continue;
  const fox=document.createElement('span');fox.id=id;fox.className='forest-fox';fox.setAttribute('role','img');fox.setAttribute('aria-label','Лёва — лесной лисёнок');old.replaceWith(fox);
 }
};
window.resetForestFox=function(id,left){const fox=document.getElementById(id);fox.classList.remove('walk','happy');fox.style.transition='none';fox.style.left=left+'%';fox.style.bottom='3%';void fox.offsetWidth;fox.style.transition='';};
window.runFoxToDoor=async function(id,doorId){
 const fox=document.getElementById(id),door=document.getElementById(doorId),room=document.getElementById('game').getBoundingClientRect(),d=door.getBoundingClientRect(),f=fox.getBoundingClientRect();
 // Align the nose with the doorway and the paws with its floor line.
 const x=Math.min(80,Math.max(65,(d.left+d.width*.5-room.left-f.width*.8)/room.width*100));
 const floor=Math.min(88,Math.max(72,(d.bottom-room.top)/room.height*100));
 fox.classList.remove('happy');fox.classList.add('walk');fox.style.left=x+'%';fox.style.bottom=Math.max(2,100-floor-f.height*.18/room.height*100)+'%';
 await new Promise(resolve=>setTimeout(resolve,2300));fox.classList.remove('walk');
};
