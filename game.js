'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const words = [
    {name:'Лиса',file:'fox-word.png'}, {name:'Лимон',file:'lemon.png'},
    {name:'Лента',file:'ribbon.png'}, {name:'Лейка',file:'watering-can.png'}
  ];
  const iceTexture=new Image();iceTexture.src='assets/ice.png';
  const key='logoland-library-v1';
  let state={done:[],shard:false,sound:false,location:1}, current=-1, busy=false, mode='menu', timer, hintTimer;
  let scratch=[], last=null, pointer=null, ctx=$('ice').getContext('2d',{willReadFrequently:true});
  try {const s=JSON.parse(sessionStorage.getItem(key));if(s && Array.isArray(s.done))state={done:[...new Set(s.done.filter(n=>Number.isInteger(n)&&n>=0&&n<4))],shard:s.shard===true&&s.done.length===4,sound:false,location:[2,3,4,5].includes(s.location)&&s.shard?s.location:1};} catch {}
  let greenhouse,cave,lab,finale;
  const save=()=>{try{sessionStorage.setItem(key,JSON.stringify(state));}catch{}};
  const delay=ms=>new Promise(r=>setTimeout(r,ms));
  // All activities are intentionally silent; speech is guided by the teacher.
  function tone(){}
  function noise(){}
  function chime(){}
  function startAudio(){}
  for(let i=0;i<28;i++){const p=document.createElement('i');p.className='particle';p.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*90}%;animation-delay:${-Math.random()*8}s;animation-duration:${6+Math.random()*7}s`; $('particles').append(p);}
  function hint(text,timeout=5500){clearTimeout(hintTimer);$('hint').textContent=text;$('hint').hidden=!text;if(timeout)hintTimer=setTimeout(()=>$('hint').hidden=true,timeout);}
  function happy(){$('lyova').classList.remove('happy');void $('lyova').offsetWidth;$('lyova').classList.add('happy');setTimeout(()=>$('lyova').classList.remove('happy'),2400);}
  function render(){
    $('books').replaceChildren();words.forEach((w,i)=>{const b=document.createElement('button');b.className='shelf-book'+(state.done.includes(i)?' done':'');b.setAttribute('aria-label',state.done.includes(i)?`Восстановленная книга ${i+1}`:`Замёрзшая книга ${i+1}`);b.innerHTML=`<img class="cover" src="assets/book.png" alt="" draggable="false"><img class="mini-picture" src="assets/${w.file}" alt="" draggable="false"><span class="frost"></span>`;b.onclick=()=>openBook(i);$('books').append(b);});
    $('shards').children[0].classList.toggle('found',state.shard);$('shards').setAttribute('aria-label',`Найдено осколков: ${(state.shard?1:0)+(greenhouse?.hasShard()?1:0)+(cave?.hasShard()?1:0)+(lab?.hasShard()?1:0)} из 4`);
    $('shards').children[3].classList.toggle('found',!!lab?.hasShard());$('shards').children[1].classList.toggle('found',!!greenhouse?.hasShard());$('shards').children[2].classList.toggle('found',!!cave?.hasShard());
    $('master').hidden=state.done.length<4||state.shard;$('door').hidden=!state.shard;
    $('scene').classList.toggle('warm',state.done.length===4&&mode==='library');
    $('scene').classList.toggle('unlocked',state.shard&&mode==='library');
    $('start').textContent=state.done.length?'Продолжить приключение':'Начать приключение';$('restart').hidden=!state.done.length;$('restart-room').hidden=state.location===1;$('restart-room').textContent=state.location===5?'Собрать зеркало заново':state.location===4?'Повторить лабораторию':state.location===3?'Повторить пещеру':'Повторить оранжерею';
  }
  async function enter(){if(busy)return;if(state.location===5){startAudio();finale.enter();return;}if(state.location===4){startAudio();await lab.enter();return;}if(state.location===3){startAudio();await cave.enter();return;}if(state.location===2){startAudio();await greenhouse.enter();return;}busy=true;startAudio();$('transition').classList.add('active');await delay(650);mode='library';window.resetForestFox('lyova',5);$('menu').hidden=true;$('ending').hidden=true;$('library').hidden=false;$('toolbar').hidden=false;$('scene').className='scene library-bg';render();$('transition').classList.remove('active');busy=false;noise(.8,.025);hint(state.shard?'Осколок с тобой! Подойди к двери.':state.done.length===4?'В большой книге что-то сияет… Забери осколок!':'Выбери замёрзшую книгу',6500);}
  function home(){if(busy||greenhouse?.isBusy()||cave?.isBusy()||lab?.isBusy()||finale?.isBusy())return;finale?.stop();lab?.stop();cave?.stop();greenhouse?.stop();closeBook();mode='menu';$('library').hidden=true;$('toolbar').hidden=true;$('ending').hidden=true;$('menu').hidden=false;$('scene').className='scene castle';hint('');render();}
  function reset(){finale?.reset();lab?.reset();cave?.reset();greenhouse?.reset();state.location=1;state.done=[];state.shard=false;save();$('lyova').style.cssText='';$('lyova').classList.remove('walk');render();enter();}
  $('restart-room').onclick=()=>{const room=state.location===5?finale:state.location===4?lab:state.location===3?cave:greenhouse;room.reset();room.enter();};
  $('start').onclick=enter;$('restart').onclick=reset;$('again').onclick=reset;$('home').onclick=home;$('end-home').onclick=home;
  function drawIce(){
    const {width:w,height:h}=$('ice');ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,w,h);
    ctx.drawImage(iceTexture,0,0,w,h);
  }
  function openBook(i){
    if(busy||current!==-1)return;current=i;hint('');$('focus').hidden=false;$('focus-book').classList.remove('opening');$('game').classList.remove('returning');$('word-image').src='assets/'+words[i].file;$('word-image').alt='';scratch=[];
    const done=state.done.includes(i);$('picture').disabled=!done;$('picture').classList.toggle('ready',done);$('ice').classList.toggle('cleared',done);$('focus-hint').textContent=done?'Придумай предложения с этим словом, а затем нажми на картинку.':'Сотри лёд движением пальца или мышки';drawIce();noise(.35,.02);$('close').focus();
  }
  function closeBook(){if(busy)return;current=-1;pointer=null;last=null;$('focus').hidden=true;$('focus-book').classList.remove('opening');$('game').classList.remove('returning');}
  $('close').onclick=closeBook;
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!busy)closeBook();if(e.key==='Tab'&&!$('focus').hidden){const targets=[$('close'),...(!$('picture').disabled?[$('picture')]:[])];if(e.shiftKey&&document.activeElement===targets[0]){e.preventDefault();targets.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===targets.at(-1)){e.preventDefault();targets[0].focus();}}});
  function position(e){const r=$('ice').getBoundingClientRect();return {x:(e.clientX-r.left)*480/r.width,y:(e.clientY-r.top)*580/r.height};}
  let lastNoise=0,checkCount=0;
  function erase(e){
    if(pointer!==e.pointerId||current<0||busy)return;e.preventDefault();const p=position(e);ctx.globalCompositeOperation='destination-out';ctx.lineWidth=170;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(last?.x??p.x,last?.y??p.y);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.beginPath();ctx.arc(p.x,p.y,85,0,Math.PI*2);ctx.fill();last=p;
    if(performance.now()-lastNoise>180){noise(.1,.009);lastNoise=performance.now();}
    if(++checkCount%4===0)checkIce();
  }
  function checkIce(){const d=ctx.getImageData(0,0,480,580).data;let clear=0,total=0;for(let y=0;y<580;y+=8)for(let x=0;x<480;x+=8){total++;if(d[(y*480+x)*4+3]<60)clear++;}if(clear/total>.92){$('ice').classList.add('cleared');$('picture').disabled=false;$('picture').classList.add('ready');$('focus-hint').textContent='Придумай предложения с этим словом, а затем нажми на картинку.';tone(880,.9);pointer=null;last=null;}}
  $('ice').onpointerdown=e=>{if(busy||$('ice').classList.contains('cleared'))return;pointer=e.pointerId;last=null;$('ice').setPointerCapture(e.pointerId);erase(e);};
  $('ice').onpointermove=erase;
  $('ice').onpointerup=e=>{if(pointer===e.pointerId){erase(e);checkIce();pointer=null;last=null;}};
  $('ice').onpointercancel=()=>{pointer=null;last=null;};
  let picturePress=null,pictureMoved=false;
  $('picture').onpointerdown=e=>{picturePress={x:e.clientX,y:e.clientY};pictureMoved=false;};
  $('picture').onpointermove=e=>{if(picturePress&&Math.hypot(e.clientX-picturePress.x,e.clientY-picturePress.y)>10)pictureMoved=true;};
  $('picture').onpointercancel=()=>{picturePress=null;pictureMoved=true;};
  $('picture').onclick=async e=>{
    if(e.detail!==0&&(!picturePress||pictureMoved))return;picturePress=null;
    if(busy||current<0||$('picture').disabled)return;if(state.done.includes(current)){closeBook();return;}
    busy=true;const i=current;$('picture').disabled=true;$('focus-hint').textContent='';$('focus-book').classList.add('opening');chime();noise(.5,.02);await delay(1300);$('game').classList.add('returning');await delay(600);state.done.push(i);save();busy=false;closeBook();render();if(state.done.length===4){await delay(650);chime();hint('Все книги ожили! В большой книге появился осколок.',0);}else hint('Книга вернулась на полку. Найди следующую!',3500);
  };
  $('master').onclick=async()=>{if(busy||state.done.length!==4||state.shard)return;busy=true;hint('');state.shard=true;save();render();happy();chime();await delay(2200);busy=false;hint('Первый осколок найден! Дверь открылась.',0);};
  $('door').onclick=async()=>{if(busy||!state.shard)return;busy=true;hint('');busy=false;await greenhouse.enter();};
  finale=window.createFinale({hint,chime,saveLocation:()=>{state.location=5;mode='finale';save();},restart:reset});
  lab=window.createLab({hint,chime,noise,saveLocation:()=>{state.location=4;mode='lab';save();},refreshShards:render,finish:()=>finale.enter()});
  cave=window.createCave({hint,chime,noise,saveLocation:()=>{state.location=3;mode='cave';save();},refreshShards:render,finish:()=>lab.enter()});
  greenhouse=window.createGreenhouse({hint,chime,noise,saveLocation:()=>{state.location=2;mode='greenhouse';save();},refreshShards:render,finish:()=>cave.enter()});
  ['master','tree-shard','cave-shard','lab-shard'].forEach((id,i)=>{
    const bounds=window.mirrorPieces.bounds[i],ratio=(bounds.w*.354)/(bounds.h*.465*.5625);
    const shard=$(id).querySelector('.shard');shard.style.width='5.8cqw';shard.style.height=(5.8/ratio)+'cqw';shard.innerHTML=window.mirrorPieces.artwork(i,'reward-'+i);shard.classList.add('matching-shard');
    const badge=$('shards').children[i];badge.innerHTML=window.mirrorPieces.artwork(i,'badge-'+i);badge.classList.add('matching-shard');badge.style.width='1.9cqw';badge.style.height=(1.9/ratio)+'cqw';
  });
  window.installForestFoxes();
  const assets=['lyova.png','finale-room.png','finale-spring.png','lab-snail-wrong.png','lab-room.png','lab-cauldron.png','lab-bottle.png','lab-lion-wrong.png','lab-lion-right.png','lab-deer-wrong.png','lab-deer-right.png','lab-fir-wrong.png','lab-fir-right.png','lab-swan-wrong.png','lab-swan-right.png','lock-painted.png','gear-painted.png','cold-mist.png','forest-word.png','palm-word.png','wheel-word.png','coat-word.png','mill-word.png','lion-word.png','ruler-word.png','plane-word.png','moth-word.png','medal-word.png','cave.png','chest-closed.png','chest-open.png','key-ornate.png','crystal.png','raspberry.png','snail.png','phone.png','salt.png','greenhouse.png','greenhouse-awake.png','flower-bud.png','flower-open.png','flower-rose.png','flower-daisy.png','flower-blue.png','flower-frozen.png','match.png','flame.png','ice-word.png','swan.png','frog.png','leaves.png','ice.png','library.png','library-awake.png','book.png',...words.map(w=>w.file)];
  $('start').disabled=true;
  Promise.all(assets.map(file=>new Promise((resolve,reject)=>{const im=new Image();im.onload=resolve;im.onerror=reject;im.src='assets/'+file;}))).then(()=>$('start').disabled=false).catch(()=>$('load-error').hidden=false);
  render();
})();
