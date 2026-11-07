'use strict';
window.createStoryIntro=function({finish,back}){
 const panel=document.createElement('section');panel.id='story-intro';panel.hidden=true;panel.setAttribute('aria-label','История ледяного замка');
 panel.innerHTML='<button id="story-back" class="round" aria-label="Вернуться в меню">‹</button><div class="story-scroll"><img src="assets/story-parchment.png" alt="" draggable="false"><div class="story-copy"><h2>Тайна ледяного замка</h2><div id="story-paragraphs" aria-live="polite"><p>Однажды на сказочный замок опустились ледяные чары. Всё вокруг замерло, а волшебное зеркало разбилось на четыре осколка.</p><p>Лисёнок Лёва решил спасти замок, но ему нужен помощник. Отправляйся вместе с ним: исследуй комнаты, выполняй задания и собирай осколки.</p><p>Когда зеркало снова станет целым, чары растают и в замок вернётся весна!</p></div></div><div class="story-actions"><button id="story-reveal" class="text-button">Показать весь текст</button><button id="story-go" class="gold" hidden>Отправиться с Лёвой</button></div></div>';
 document.getElementById('game').append(panel);const paragraphs=[...panel.querySelectorAll('#story-paragraphs p')],go=panel.querySelector('#story-go'),reveal=panel.querySelector('#story-reveal');let timers=[],opened=false;
 function clear(){timers.forEach(clearTimeout);timers=[];}
 function showParagraph(i){paragraphs[i].classList.add('visible');paragraphs[i].setAttribute('aria-hidden','false');}
 function showAll(){clear();paragraphs.forEach((_,i)=>showParagraph(i));go.hidden=false;reveal.hidden=true;}
 function hide(){clear();opened=false;panel.hidden=true;}
 function show(){clear();opened=true;document.getElementById('menu').hidden=true;document.getElementById('toolbar').hidden=true;document.getElementById('scene').className='scene castle';panel.hidden=false;go.hidden=true;reveal.hidden=false;paragraphs.forEach(p=>{p.classList.remove('visible');p.setAttribute('aria-hidden','true');});if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){showAll();}else{[400,6000,11500].forEach((ms,i)=>timers.push(setTimeout(()=>{if(opened)showParagraph(i);},ms)));timers.push(setTimeout(()=>{if(opened){go.hidden=false;reveal.hidden=true;}},13000));}panel.querySelector('#story-back').focus();}
 reveal.onclick=showAll;go.onclick=()=>{if(!opened||go.hidden)return;hide();finish();};panel.querySelector('#story-back').onclick=()=>{hide();back();};panel.onkeydown=e=>{if(e.key==='Escape'){hide();back();}};
 return{show,hide};
};
