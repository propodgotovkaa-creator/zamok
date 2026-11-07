'use strict';
// One continuously articulated drawing. This preview does not change game progress.
const FoxRigMath={
 mix:(a,b,t)=>a+(b-a)*t,
 ease:t=>{t=Math.max(0,Math.min(1,t));return t*t*t*(t*(t*6-15)+10);},
 rotate:(p,a)=>({x:p.x*Math.cos(a)-p.y*Math.sin(a),y:p.x*Math.sin(a)+p.y*Math.cos(a)}),
 ik:(a,b,l1,l2,side=1)=>{const dx=b.x-a.x,dy=b.y-a.y,d=Math.max(.001,Math.hypot(dx,dy)),reach=Math.min(d,l1+l2-.001);const theta=Math.atan2(dy,dx)+side*Math.acos(Math.max(-1,Math.min(1,(l1*l1+reach*reach-l2*l2)/(2*l1*reach))));return{x:a.x+l1*Math.cos(theta),y:a.y+l1*Math.sin(theta)};},
 rise:t=>t<1.2?FoxRigMath.ease(t/1.2):t<2.5?1:1-FoxRigMath.ease((t-2.5)/1.3)
};
if(typeof module!=='undefined')module.exports=FoxRigMath;
if(typeof document!=='undefined'){
const canvas=document.getElementById('fox'),ctx=canvas.getContext('2d'),riseButton=document.getElementById('rise'),pauseButton=document.getElementById('pause'),status=document.getElementById('status');
const atlas=new Image();atlas.src='assets/fox-rig-parts.png';
// Per-part alpha bounds from the painted atlas. No pose frames are swapped.
const parts=[{"x": 51, "y": 172, "w": 441, "h": 230}, {"x": 591, "y": 39, "w": 365, "h": 440}, {"x": 1045, "y": 141, "w": 444, "h": 268}, {"x": 155, "y": 558, "w": 229, "h": 407}, {"x": 632, "y": 544, "w": 260, "h": 437}, {"x": 1149, "y": 587, "w": 246, "h": 348}];
let time=0,action=null,paused=false,previous=0,frame=0;
const mix=FoxRigMath.mix,rot=FoxRigMath.rotate,plus=(a,b)=>({x:a.x+b.x,y:a.y+b.y});
function sprite(i,point,w,h,angle=0,anchor={x:.5,y:.5}){const p=parts[i];ctx.save();ctx.translate(point.x,point.y);ctx.rotate(angle);ctx.drawImage(atlas,p.x,p.y,p.w,p.h,-w*anchor.x,-h*anchor.y,w,h);ctx.restore();}
function bone(part,a,b,width,start,end){const p=parts[part],angle=Math.atan2(b.y-a.y,b.x-a.x)-Math.PI/2,length=Math.hypot(b.x-a.x,b.y-a.y);ctx.save();ctx.translate(a.x,a.y);ctx.rotate(angle);ctx.drawImage(atlas,p.x,p.y+p.h*start,p.w,p.h*(end-start),-width/2,-9,width,length+18);ctx.restore();}
function leg(root,foot,part,upper,lower,side,far=false){const knee=FoxRigMath.ik(root,foot,upper,lower,side);ctx.save();if(far)ctx.filter='brightness(.82)';bone(part,root,knee,part===4?65:44,0,.62);bone(part,knee,foot,part===4?42:35,.49,1);ctx.restore();}
function tail(root,angle){const p=parts[2],w=215,h=106;ctx.save();ctx.translate(root.x,root.y);ctx.rotate(angle);const bend=Math.sin(time*1.65)*17+Math.sin(time*.8)*7;for(let n=0;n<40;n++){const u=n/40,x=-w+u*w,y=bend*(1-u)*(1-u),slope=-2*bend*(1-u)/w;ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan(slope));ctx.drawImage(atlas,p.x+p.w*u,p.y,p.w/40+1,p.h,0,-h*.52,w/40+1.2,h);ctx.restore();}ctx.restore();}
function draw(){
 const dpr=Math.min(2,window.devicePixelRatio||1),r=canvas.getBoundingClientRect();if(canvas.width!==Math.round(r.width*dpr)||canvas.height!==Math.round(r.height*dpr)){canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);}ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);const scale=Math.min(canvas.width/800,canvas.height/620);ctx.setTransform(scale,0,0,scale,(canvas.width-800*scale)/2,(canvas.height-620*scale)/2);
 const up=action===null?0:FoxRigMath.rise(action),breath=Math.sin(time*1.5)*1.4,angle=-1.05*up;
 const hip={x:390+22*up,y:421-25*up+breath},shoulder=plus(hip,rot({x:130,y:-12},angle));
 const hind={x:382,y:530},hindFar={x:411,y:526},front={x:mix(552,shoulder.x+43,up),y:mix(530,shoulder.y+88,up)},frontFar={x:front.x+21,y:front.y-6};
 ctx.save();ctx.translate(440,533);ctx.scale(1,.18);const shadow=ctx.createRadialGradient(0,0,5,0,0,160);shadow.addColorStop(0,'#081b3a70');shadow.addColorStop(1,'#081b3a00');ctx.fillStyle=shadow;ctx.beginPath();ctx.arc(0,0,160,0,Math.PI*2);ctx.fill();ctx.restore();
 tail(plus(hip,rot({x:-34,y:-20},angle)),.15-up*.45);
 leg(plus(hip,{x:17,y:12}),hindFar,4,64,74,-1,true);leg(plus(shoulder,{x:12,y:12}),frontFar,3,64,74,1,true);
 sprite(0,plus(hip,rot({x:58,y:-10},angle)),226,133,angle);
 leg(plus(hip,{x:-12,y:14}),hind,4,65,76,-1);leg(plus(shoulder,{x:-4,y:16}),front,3,62,74,1);
 sprite(5,plus(shoulder,{x:0,y:26}),64,93,-.15*up);
 const head=plus(shoulder,{x:27-8*up,y:-65-8*up});sprite(1,head,170,181,Math.sin(time*.8)*.012-up*.055);
}
function tick(now){if(!previous)previous=now;const dt=Math.min(.04,(now-previous)/1000);previous=now;if(!paused&&!document.hidden){time+=dt;if(action!==null){action+=dt;if(action>=3.8){action=null;riseButton.disabled=false;status.textContent='';}}draw();}frame=requestAnimationFrame(tick);}
atlas.onload=()=>{riseButton.disabled=pauseButton.disabled=false;status.textContent='';frame=requestAnimationFrame(tick);};atlas.onerror=()=>{document.getElementById('error').hidden=false;status.textContent='';};
riseButton.onclick=()=>{if(action!==null)return;action=0;paused=false;pauseButton.textContent='Пауза';riseButton.disabled=true;status.textContent='';};pauseButton.onclick=()=>{paused=!paused;pauseButton.textContent=paused?'Продолжить':'Пауза';};
document.addEventListener('visibilitychange',()=>{previous=0;});window.addEventListener('pagehide',()=>cancelAnimationFrame(frame));
}
