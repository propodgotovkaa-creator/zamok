'use strict';
window.createStoryIntro=function({finish,back}){
 const panel=document.createElement('section');panel.id='story-intro';panel.hidden=true;panel.setAttribute('aria-label','История ледяного замка');
 panel.innerHTML='<button id="story-back" class="round" aria-label="Вернуться в меню">‹</button><div class="story-scroll"><img src="assets/story-parchment.png" alt="" draggable="false"><div class="story-copy"><h2>Тайна ледяного замка</h2><div id="story-paragraphs" aria-live="polite"><p>Однажды на сказочный замок опустились ледяные чары. Всё вокруг замерло, а волшебное зеркало разбилось на четыре осколка.</p><p>Лисёнок Лёва решил спасти замок, но ему нужен помощник. Отправляйся вместе с ним: исследуй комнаты, выполняй задания и собирай осколки.</p><p>Когда зеркало снова станет целым, чары растают и в замок вернётся весна!</p></div></div><div class="story-actions"><button id="story-go" class="gold">Отправиться с Лёвой</button></div></div>';
 document.getElementById('game').append(panel);const go=panel.querySelector('#story-go');let opened=false;
 function hide(){opened=false;panel.hidden=true;}
 function show(){opened=true;document.getElementById('menu').hidden=true;document.getElementById('toolbar').hidden=true;document.getElementById('scene').className='scene castle';panel.hidden=false;panel.querySelector('#story-back').focus();}
 go.onclick=()=>{if(!opened)return;hide();finish();};panel.querySelector('#story-back').onclick=()=>{hide();back();};panel.onkeydown=e=>{if(e.key==='Escape'){hide();back();}};
 return{show,hide};
};
