'use strict';
window.installForestFoxes=function(){
 for(const id of ['lyova','green-lyova','cave-lyova','lab-lyova','final-lyova']){
  const old=document.getElementById(id);if(!old||old.classList.contains('forest-fox'))continue;
  const fox=document.createElement('span');fox.id=id;fox.className='forest-fox';fox.innerHTML='<span class="fox-idle" aria-hidden="true">'+[0,1,2,3].map(i=>'<span class="fox-idle-frame fox-idle-'+i+'"></span>').join('')+'</span><span class="fox-rearing" aria-hidden="true"></span>';fox.setAttribute('role','img');fox.setAttribute('aria-label','Лёва — сказочный лисёнок');fox.addEventListener('animationend',e=>{if(e.animationName==='fox-rear')fox.classList.remove('happy');});old.replaceWith(fox);
 }
};
window.resetForestFox=function(id,left){const fox=document.getElementById(id);fox.classList.remove('walk','happy');fox.style.transition='none';fox.style.left=left+'%';fox.style.bottom='3%';void fox.offsetWidth;fox.style.transition='';};
