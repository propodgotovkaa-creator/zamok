'use strict';
window.createCave = function({hint,chime,noise,saveLocation,refreshShards,finish}) {
  const $=id=>document.getElementById(id),storage='logoland-cave-v2';
  const tasks=[
    {position:'в начале слова',words:['лес','пальма','лебедь','руль','лиса','лейка'],answers:['лес','лебедь','лиса','лейка']},
    {position:'в середине слова',words:['пальто','мельница','лев','соль','линейка','улитка'],answers:['пальто','мельница','улитка']},
    {position:'в конце слова',words:['соль','самолёт','моль','ключ','медаль','лимон'],answers:['соль','моль','медаль']}
  ];
  const pictures={'лес':'forest-word.png','пальма':'palm-word.png','лебедь':'swan.png','руль':'wheel-word.png','лиса':'fox-word.png','лейка':'watering-can.png','пальто':'coat-word.png','мельница':'mill-word.png','лев':'lion-word.png','соль':'salt.png','линейка':'ruler-word.png','улитка':'snail.png','самолёт':'plane-word.png','моль':'moth-word.png','ключ':'key-ornate.png','медаль':'medal-word.png','лимон':'lemon.png'};
  const homes=[{x:34,y:73},{x:57,y:75},{x:79,y:72}];
  let s={done:[],found:[[],[],[]],shard:false},active=false,locked=false,drag=null,selected=null,current=null,epoch=0;
  try{const old=JSON.parse(sessionStorage.getItem(storage));if(old){s.found=tasks.map((t,i)=>[...new Set((old.found?.[i]||[]).filter(w=>t.answers.includes(w)))]);s.done=tasks.map((t,i)=>i).filter(i=>s.found[i].length===tasks[i].answers.length);s.shard=old.shard===true&&s.done.length===3;}}catch{}
  const save=()=>{try{sessionStorage.setItem(storage,JSON.stringify(s));}catch{}};
  const delay=ms=>new Promise(r=>setTimeout(r,ms));
  const chests=[],keys=[];
  const modal=document.createElement('div');modal.id='lock-puzzle';modal.hidden=true;modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','lock-title');
  modal.innerHTML='<div class="lock-panel"><button id="lock-close" class="round" aria-label="Вернуться в пещеру">×</button><p class="lock-eyebrow">СЕКРЕТ ХРУСТАЛЬНОГО ЗАМКА</p><h2 id="lock-title"></h2><p class="lock-instruction">Назови картинки и выбери подходящие — ключ повернётся</p><div class="lock-wheel"><img class="gear gear-back" src="assets/gear-painted.png" alt="" draggable="false"><img class="gear gear-small" src="assets/gear-painted.png" alt="" draggable="false"><img class="gear gear-third" src="assets/gear-painted.png" alt="" draggable="false"><div class="lock-core"><img id="turning-key" src="assets/key-ornate.png" alt="Ключ в замке"></div><div id="lock-words"></div></div><p id="lock-feedback" role="status" aria-live="polite"></p><div id="lock-progress"></div></div>';
  $('game').append(modal);
  function build(){
    selected=null;
    $('chests').replaceChildren();$('cave-keys').replaceChildren();$('key-hiding').replaceChildren();chests.length=keys.length=0;
    tasks.forEach((task,i)=>{
      const chest=document.createElement('button');chest.type='button';chest.className='chest chest-'+i;chest.dataset.chest=i;
      chest.innerHTML='<img class="chest-bottom" src="assets/chest-closed.png" alt="" draggable="false"><img class="chest-lid" src="assets/chest-closed.png" alt="" draggable="false"><img class="chest-open" src="assets/chest-open.png" alt="" draggable="false"><span class="lock-sigil"><svg class="keyhole" viewBox="0 0 20 30" aria-hidden="true"><path d="M10 2a6 6 0 0 0-3 11.2L4 28h12l-3-14.8A6 6 0 0 0 10 2Z" fill="#182736" stroke="#a87637" stroke-width=".8"/></svg></span><img class="chest-front" src="assets/chest-open.png" alt="" draggable="false"><span class="chest-vapor" aria-hidden="true"><img src="assets/cold-mist.png" alt=""><img src="assets/cold-mist.png" alt=""></span>';
      chest.setAttribute('aria-label',`Сундук ${i+1}: Ль ${task.position}`);
      chest.onclick=()=>{if(s.done.includes(i))return;if(selected===null){hint('Сначала возьми любой ключ.',3500);return;}openLock(i);};
      chests.push(chest);$('chests').append(chest);
      const k=document.createElement('button');k.className='crystal-key key-'+i;k.setAttribute('aria-label',`Взять ключ ${i+1}`);k.setAttribute('aria-pressed','false');k.innerHTML='<img src="assets/key-ornate.png" alt="" draggable="false">';
      k.onpointerdown=e=>startDrag(e,i);k.onpointermove=moveDrag;k.onpointerup=endDrag;k.onpointercancel=cancelDrag;
      k.onclick=()=>{if(!locked&&active)selectKey(i);};keys.push(k);$('cave-keys').append(k);placeKey(i);paint(i);
    });
    $('cave-shard').hidden=s.done.length<3||s.shard;$('cave-door').hidden=!s.shard;
    $('cave').classList.toggle('completed',s.done.length===3);$('cave').classList.toggle('unlocked',s.shard);
  }
  function selectKey(i){selected=i;keys.forEach((k,j)=>{k.classList.toggle('selected',j===i);k.setAttribute('aria-pressed',String(j===i));});hint('Вставь ключ в любой закрытый замок.',4000);}
  function placeKey(i){keys[i].style.left=homes[i].x+'%';keys[i].style.top=homes[i].y+'%';}
  function paint(i){const done=s.done.includes(i);chests[i].classList.toggle('opened',done);chests[i].classList.toggle('restored',done);chests[i].disabled=done;$('cave-crystals').children[i].classList.toggle('lit',done);keys[i].hidden=s.done.length===3;}
  function startDrag(e,i){if(!active||locked||e.button!==0)return;e.preventDefault();selectKey(i);drag={i,id:e.pointerId,box:$('cave').getBoundingClientRect()};keys[i].setPointerCapture(e.pointerId);keys[i].classList.add('dragging');moveDrag(e);}
  function moveDrag(e){if(!drag||e.pointerId!==drag.id)return;e.preventDefault();keys[drag.i].style.left=(e.clientX-drag.box.x)/drag.box.width*100+'%';keys[drag.i].style.top=(e.clientY-drag.box.y)/drag.box.height*100+'%';chests.forEach((c,j)=>{const r=c.getBoundingClientRect();c.classList.toggle('drop-target',!s.done.includes(j)&&e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom);});}
  function cancelDrag(){if(!drag)return;const i=drag.i;keys[i].classList.remove('dragging');placeKey(i);drag=null;chests.forEach(c=>c.classList.remove('drop-target'));}
  function endDrag(e){if(!drag||e.pointerId!==drag.id)return;const target=chests.findIndex(c=>{const r=c.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;});cancelDrag();if(target>=0&&!s.done.includes(target))openLock(target);}
  function openLock(i){if(locked||!active||s.done.includes(i))return;current=i;locked=true;hint('');$('lock-title').textContent=`Найди звук Ль ${tasks[i].position}`;$('lock-words').replaceChildren();
    tasks[i].words.forEach((word,j)=>{const b=document.createElement('button');b.className='lock-word';b.dataset.word=word;b.setAttribute('aria-label',word);const picture=document.createElement('img');picture.src='assets/'+pictures[word];picture.alt='';picture.draggable=false;b.append(picture);const positions=[[23,23],[17,50],[23,80],[77,80],[83,50],[77,23]];b.style.left=positions[j][0]+'%';b.style.top=positions[j][1]+'%';b.onclick=()=>answer(word,b);$('lock-words').append(b);});
    $('lock-feedback').textContent='';modal.hidden=false;$('toolbar').inert=true;$('cave').inert=true;updateLock();$('lock-close').focus();noise(.25,.015);
  }
  function updateLock(){const t=tasks[current],found=s.found[current];const turn=found.length/t.answers.length*180;modal.style.setProperty('--turn',`${turn}deg`);modal.style.setProperty('--small-turn',`${-turn*2.5}deg`);modal.style.setProperty('--third-turn',`${-turn*25/9}deg`);$('lock-progress').textContent=`Найдено ${found.length} из ${t.answers.length}`;[...$('lock-words').children].forEach(b=>{b.disabled=found.includes(b.dataset.word);b.classList.toggle('correct',b.disabled);});}
  async function answer(word,b){if(current===null||modal.classList.contains('solved'))return;const i=current,t=tasks[i];if(!t.answers.includes(word)){b.classList.remove('try-again');void b.offsetWidth;b.classList.add('try-again');$('lock-feedback').textContent='Попробуй ещё раз. Назови картинку и послушай мягкий Ль.';return;}if(s.found[i].includes(word))return;s.found[i].push(word);save();updateLock();chime();$('lock-feedback').textContent='';if(s.found[i].length!==t.answers.length)return;
    const token=epoch;modal.classList.add('solved');$('lock-feedback').textContent='Все картинки найдены. Замок открыт!';$('lock-close').disabled=true;await delay(1300);if(token!==epoch)return;closeLock();locked=true;chests[i].classList.add('opening');noise(.6,.02);await delay(650);if(token!==epoch)return;s.done.push(i);save();tasks.forEach((_,j)=>paint(j));chime();chests[i].classList.remove('opening');locked=false;if(s.done.length===3){$('cave').classList.add('completed');$('cave-shard').hidden=false;hint('');}else hint('');
  }
  function closeLock(){modal.hidden=true;modal.classList.remove('solved');$('lock-close').disabled=false;$('toolbar').inert=false;$('cave').inert=false;const i=current;current=null;locked=false;if(active&&i!==null)chests[i]?.focus();}
  $('lock-close').onclick=closeLock;
  modal.onkeydown=e=>{if(e.key==='Escape'&&!modal.classList.contains('solved'))closeLock();if(e.key==='Tab'){const buttons=[...modal.querySelectorAll('button:not(:disabled)')];if(!buttons.length){e.preventDefault();return;}const first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}};
  $('cave-shard').onclick=async()=>{if(locked||s.shard||s.done.length!==3)return;locked=true;const token=epoch;hint('');$('cave-lyova').style.left='39%';$('cave-lyova').classList.add('walk');await delay(1800);if(token!==epoch)return;$('cave-lyova').classList.remove('walk');s.shard=true;save();refreshShards();$('cave-shard').hidden=true;$('cave-door').hidden=false;$('cave').classList.add('unlocked');chime();locked=false;hint('');};
  $('cave-door').onclick=async()=>{if(locked||!s.shard)return;locked=true;const token=epoch;hint('');await window.runFoxToDoor('cave-lyova','cave-door');if(token!==epoch)return;$('cave-lyova').classList.remove('walk');locked=false;stop();finish();};
  async function enter(){locked=true;saveLocation();$('transition').classList.add('active');await delay(650);$('library').hidden=true;$('greenhouse').hidden=true;$('menu').hidden=true;$('ending').hidden=true;$('toolbar').hidden=false;$('cave').hidden=false;$('scene').className='scene cave-bg';window.resetForestFox('cave-lyova',5);active=true;build();refreshShards();$('transition').classList.remove('active');locked=false;hint(s.shard?'Подойди к открывшемуся проходу.':s.done.length===3?'Забери третий осколок.':'Возьми любой ключ и вставь в замок сундука.',6500);}
  function stop(){epoch++;cancelDrag();active=false;closeLock();save();$('cave').hidden=true;}
  function reset(){stop();s={done:[],found:[[],[],[]],shard:false};save();}
  return {enter,stop,reset,isBusy:()=>locked,hasShard:()=>s.shard};
};
