'use strict';
(() => {
 const canvas=document.getElementById('ambient-particles');if(!canvas)return;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const media=window.matchMedia('(prefers-reduced-motion: reduce)');
 const button=document.querySelector('[data-particle-toggle]');
 const contact=document.getElementById('contact');
 let width=1,height=1,points=[],time=0,last=0,frameId=0;
 const random=(i,s)=>{const n=Math.sin(i*127.1+s*311.7)*43758.5453;return n-Math.floor(n);};
 const stopped=()=>media.matches||document.documentElement.classList.contains('motion-paused');
 function paint(){
  ctx.clearRect(0,0,width,height);
  const scroll=stopped()?0:window.scrollY;
  // Keep a quiet star field behind the denser face-assembly animation.
  let density=1;
  if(contact){const top=contact.getBoundingClientRect().top;density=top<height*1.4&&top> -height*.5?.6:1;}
  for(const point of points){
   const drift=stopped()?0:Math.sin(time*.16+point.phase)*8;
   const x=point.x*width+drift;
   const travel=point.y*height-scroll*point.depth+time*point.speed;
   const y=((travel%(height+24))+(height+24))%(height+24)-12;
   const pulse=stopped()?1:.82+.18*Math.sin(time*.5+point.phase);
   ctx.fillStyle='rgba(185,124,235,'+(point.alpha*pulse*density)+')';
   ctx.beginPath();ctx.arc(x,y,point.radius,0,Math.PI*2);ctx.fill();
  }
 }
 function request(){if(!frameId&&!document.hidden)frameId=requestAnimationFrame(frame);}
 function frame(now){
  frameId=0;
  if(!stopped()&&last&&now-last<32){request();return;}
  const dt=last?Math.min((now-last)/1000,.08):0;last=now;if(!stopped())time+=dt;
  paint();if(!stopped())request();
 }
 function resize(){
  width=window.innerWidth;height=window.innerHeight;
  const ratio=Math.min(window.devicePixelRatio||1,width<650?1.25:1.5);
  canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);
  const count=Math.min(width<650?105:220,Math.max(55,Math.round(width*height/6500)));
  points=Array.from({length:count},(_,i)=>({x:random(i,1),y:random(i,2),radius:.45+random(i,3)*.8,alpha:.1+random(i,4)*.25,phase:random(i,5)*Math.PI*2,depth:.015+random(i,6)*.05,speed:.3+random(i,7)*.7}));
  paint();request();
 }
 function sync(){
  cancelAnimationFrame(frameId);frameId=0;last=0;
  if(button){button.disabled=media.matches;button.textContent=media.matches?'Motion reduced':stopped()?'Resume motion':'Pause motion';button.setAttribute('aria-pressed',String(stopped()));}
  if(!document.hidden){paint();if(!stopped())request();}
 }
 if(button)button.addEventListener('click',()=>{document.documentElement.classList.toggle('motion-paused',!stopped());document.dispatchEvent(new Event('portfolio:motion'));});
 document.addEventListener('portfolio:motion',sync);media.addEventListener('change',sync);
 document.addEventListener('visibilitychange',sync);window.addEventListener('resize',resize);
 window.addEventListener('scroll',()=>{if(!stopped())request();},{passive:true});
 resize();sync();
})();
