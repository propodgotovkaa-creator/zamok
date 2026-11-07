'use strict';
window.createGreenhouse = function({hint:clearHint,chime,noise,saveLocation,refreshShards,finish}) {
  const hint=()=>{};
  const $=id=>document.getElementById(id), key='logoland-greenhouse-v1';
  const pictures=['ice-word.png','swan.png','frog.png','leaves.png'];
  const pictureBoxes=[[148,13,1233,982,1536,1024],[64,16,1289,993,1536,1024],[29,9,1249,1178,1312,1199],[109,9,1270,997,1536,1024]];
  const instruction=document.createElement('div');instruction.id='green-spell';instruction.innerHTML='<span>Растопи лёд и проговаривай заклинание:</span><strong>Ля-ля-ля — тает льдинка у меня.</strong>';$('greenhouse').append(instruction);
  const petals=['flower-open.png','flower-rose.png','flower-daisy.png','flower-blue.png'];
  let s={done:[],melt:[0,0,0,0],shard:false};
  try{const saved=JSON.parse(sessionStorage.getItem(key));if(saved){s.done=[...new Set((saved.done||[]).filter(n=>Number.isInteger(n)&&n>=0&&n<4))];s.melt=pictures.map((_,i)=>s.done.includes(i)?1:Math.max(0,Math.min(1,Number(saved.melt?.[i])||0)));s.done=s.melt.flatMap((m,i)=>m>=1?[i]:[]);s.shard=!!saved.shard&&s.done.length===4;}}catch{}
  const save=()=>{try{sessionStorage.setItem(key,JSON.stringify(s));}catch{}};
  const delay=ms=>new Promise(r=>setTimeout(r,ms));
  let active=false,locked=false,matchOn=false,aim=null,frame=0,lastTime=0,selected=-1,lastSave=0,press=null,moved=false;
  const buttons=[];
  function paint(i){const b=buttons[i],m=s.melt[i],done=s.done.includes(i);b.style.setProperty('--melt',m);b.style.setProperty('--bloom',Math.max(0,(m-.3)/.7));b.classList.toggle('thawed',m>=1);b.classList.toggle('alive',done);b.setAttribute('aria-label',done?`Оживший цветок ${i+1}`:m>=1?`Картинка в цветке ${i+1}`:`Замёрзший цветок ${i+1}`);}
  function build(){
    $('flowers').replaceChildren();buttons.length=0;
    pictures.forEach((file,i)=>{const [px,py,pw,ph,iw,ih]=pictureBoxes[i];const b=document.createElement('button');b.className='flower flower-'+i;b.innerHTML=`<span class="flower-plant"><img class="frozen-bud" src="assets/flower-frozen.png" alt="" draggable="false"><img class="bud" src="assets/flower-bud.png" alt="" draggable="false"><img class="petals" src="assets/${petals[i]}" alt="" draggable="false"><svg class="flower-mini" viewBox="${px} ${py} ${pw} ${ph}" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><image href="assets/${file}" width="${iw}" height="${ih}"/></svg><span class="melt-glimmer"></span></span>`;
      b.onclick=()=>{if(!locked&&active&&s.melt[i]<1&&!matchOn)hint('Сначала возьми волшебную спичку',3500);};
      // A keyboard hold can aim the same flame for the same melting duration.
      b.onkeydown=e=>{if((e.key===' '||e.key==='Enter')&&matchOn&&s.melt[i]<1){e.preventDefault();const r=b.getBoundingClientRect();point(r.x+r.width/2,r.y+r.height*.35);}};
      b.onkeyup=clearAim;buttons.push(b);$('flowers').append(b);paint(i);
    });
    $('scene').classList.toggle('green-awake',s.done.length===4);$('scene').classList.toggle('green-unlocked',s.shard);
    $('tree-shard').hidden=s.done.length<4||s.shard;$('green-door').hidden=!s.shard;
  }
  function clearAim(){aim=null;$('held-match').hidden=true;buttons.forEach(b=>b.classList.remove('heating'));}
  function setMatch(on){matchOn=on;$('match').classList.toggle('selected',on);$('greenhouse').classList.toggle('holding-match',on);$('match').setAttribute('aria-pressed',String(on));$('match').setAttribute('aria-label',on?'Положить волшебную спичку':'Взять волшебную спичку');$('match').querySelector('span').textContent=on?'Положить спичку':'Возьми спичку';if(!on)clearAim();}
  $('match').onclick=()=>{if(locked)return;setMatch(!matchOn);hint(matchOn?'Води огоньком возле замёрзших лепестков.':'Возьми волшебную спичку.',3500);};
  let previousX=null;
  function point(clientX,clientY){if(!active||!matchOn||locked||selected!==-1)return;const r=$('greenhouse').getBoundingClientRect();aim={x:clientX,y:clientY};const x=(clientX-r.x)/r.width*100,y=(clientY-r.y)/r.height*100;const held=$('held-match');held.hidden=false;held.style.left=x+'%';held.style.top=y+'%';held.style.setProperty('--lean',Math.max(-14,Math.min(14,(previousX===null?0:clientX-previousX)*-.4))+'deg');previousX=clientX;}
  $('greenhouse').onpointerdown=e=>{press={x:e.clientX,y:e.clientY};moved=false;if(e.target.closest('#match,#tree-shard,#green-door'))return;point(e.clientX,e.clientY);};
  $('greenhouse').onpointermove=e=>{if(press&&Math.hypot(e.clientX-press.x,e.clientY-press.y)>10)moved=true;point(e.clientX,e.clientY);};
  $('greenhouse').onpointerup=e=>{if(e.pointerType!=='mouse'){clearAim();}press=null;};
  $('greenhouse').onpointercancel=()=>{clearAim();press=null;};
  $('greenhouse').onpointerleave=()=>{clearAim();};
  function tick(now){
    if(!active)return;buttons.forEach(b=>b.classList.remove('heating'));const dt=Math.min((now-lastTime)/1000,.08);lastTime=now;
    if(aim&&matchOn&&!locked&&selected===-1&&!document.hidden){
      const target=aim;buttons.forEach((b,i)=>{if(s.melt[i]>=1)return;const r=b.getBoundingClientRect(),x=(target.x-r.x)/r.width,y=(target.y-r.y)/r.height;if(x>.08&&x<.92&&y>.02&&y<.8){b.classList.add('heating');s.melt[i]=Math.min(1,s.melt[i]+dt/2.8);paint(i);if(s.melt[i]>=1){s.done.push(i);paint(i);save();chime();hint('Назови картинку в раскрывшемся цветке.',3500);if(s.done.length===4)awaken();}}});
      if(now-lastSave>800){save();lastSave=now;}
    }
    frame=requestAnimationFrame(tick);
  }
  async function awaken(){locked=true;setMatch(false);$('gold-wave').classList.add('shine');$('scene').classList.add('green-awake');chime();await delay(1500);$('tree-shard').hidden=false;locked=false;hint('');}
  $('tree-shard').onclick=async()=>{if(locked||s.shard)return;locked=true;hint('');$('green-lyova').classList.add('walk');$('green-lyova').style.left='39%';await delay(1800);$('green-lyova').classList.remove('walk');s.shard=true;save();refreshShards();$('tree-shard').hidden=true;$('scene').classList.add('green-unlocked');$('green-door').hidden=false;chime();locked=false;hint('');};
  $('green-door').onclick=async()=>{if(locked||!s.shard)return;locked=true;hint('');await window.runFoxToDoor('green-lyova','green-door');locked=false;stop();finish();};
  async function enter(){locked=true;clearHint('');saveLocation();$('transition').classList.add('active');await delay(650);$('library').hidden=true;$('menu').hidden=true;$('ending').hidden=true;$('toolbar').hidden=false;$('greenhouse').hidden=false;$('scene').className='scene greenhouse-bg';window.resetForestFox('green-lyova',7);$('gold-wave').classList.remove('shine');active=true;selected=-1;setMatch(false);build();refreshShards();$('transition').classList.remove('active');lastTime=performance.now();cancelAnimationFrame(frame);frame=requestAnimationFrame(tick);locked=false;noise(.7,.02);hint(s.shard?'Осколок с тобой. Подойди к двери.':s.done.length===4?'Забери осколок внизу.':'Возьми волшебную спичку.',3500);}
  function stop(){active=false;cancelAnimationFrame(frame);aim=null;setMatch(false);save();$('greenhouse').hidden=true;$('flower-focus').hidden=true;selected=-1;}
  function reset(){stop();s={done:[],melt:[0,0,0,0],shard:false};save();}
  return {enter,stop,reset,hasShard:()=>s.shard,isBusy:()=>locked};
};
