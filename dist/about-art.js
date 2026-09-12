'use strict';
(() => {
 const canvas=document.getElementById('about-sculpture');if(!canvas)return;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const media=window.matchMedia('(prefers-reduced-motion: reduce)');
 const phi=(1+Math.sqrt(5))/2;
 const vertices=[[-1,phi,0],[1,phi,0],[-1,-phi,0],[1,-phi,0],[0,-1,phi],[0,1,phi],[0,-1,-phi],[0,1,-phi],[phi,0,-1],[phi,0,1],[-phi,0,-1],[-phi,0,1]].map(p=>p.map(v=>v/Math.hypot(1,phi)));
 const faces=[];
 const length=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
 const edge=length(vertices[0],vertices[1]);
 for(let a=0;a<12;a++)for(let b=a+1;b<12;b++)for(let c=b+1;c<12;c++){
  if([length(vertices[a],vertices[b]),length(vertices[a],vertices[c]),length(vertices[b],vertices[c])].every(v=>Math.abs(v-edge)<.001))faces.push([a,b,c]);
 }
 let width=1,height=1,frameId=0,last=0,time=0,visible=true;
 const stopped=()=>media.matches||document.documentElement.classList.contains('motion-paused');
 function project(p,a,scale=1){
  const x=p[0]*Math.cos(a)+p[2]*Math.sin(a),z=-p[0]*Math.sin(a)+p[2]*Math.cos(a);
  const y=p[1]*Math.cos(.43)-z*Math.sin(.43),zz=p[1]*Math.sin(.43)+z*Math.cos(.43);
  const unit=Math.min(width,height)*.29*scale,depth=4/(4-zz);
  return {x:width/2+x*unit*depth,y:height/2+y*unit*depth+Math.sin(time*.65)*5,z:zz};
 }
 function draw(){
  ctx.clearRect(0,0,width,height);
  const glow=ctx.createRadialGradient(width/2,height/2,0,width/2,height/2,Math.min(width,height)*.48);
  glow.addColorStop(0,'#7b30cf30');glow.addColorStop(1,'#7b30cf00');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
  const p=vertices.map(v=>project(v,time*.19+.5));
  const sorted=faces.map(f=>({f,z:f.reduce((sum,i)=>sum+p[i].z,0)/3})).sort((a,b)=>a.z-b.z);
  for(const {f,z} of sorted){
   const [a,b,c]=f.map(i=>p[i]),shine=(z+1)/2;
   const gradient=ctx.createLinearGradient(a.x,a.y,c.x,c.y);
   gradient.addColorStop(0,'hsl(267,70%,'+(20+shine*39)+'%)');gradient.addColorStop(1,'hsl(282,66%,'+(12+shine*26)+'%)');
   ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.closePath();ctx.fillStyle=gradient;ctx.fill();
   ctx.strokeStyle='rgba(231,195,255,'+(.12+shine*.4)+')';ctx.lineWidth=.9;ctx.stroke();
  }
  const outer=vertices.map(v=>project(v,-time*.11-.3,1.38));
  ctx.strokeStyle='#c899ff30';ctx.lineWidth=.7;ctx.beginPath();
  for(let a=0;a<12;a++)for(let b=a+1;b<12;b++)if(Math.abs(length(vertices[a],vertices[b])-edge)<.001){ctx.moveTo(outer[a].x,outer[a].y);ctx.lineTo(outer[b].x,outer[b].y);}
  ctx.stroke();ctx.fillStyle='#e1bbff';
  outer.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,p.z>0?1.8:1,0,Math.PI*2);ctx.fill();});
 }
 function schedule(){if(!frameId&&visible&&!document.hidden&&!stopped())frameId=requestAnimationFrame(frame);}
 function frame(now){frameId=0;const dt=last?Math.min((now-last)/1000,.05):0;last=now;if(!stopped())time+=dt;draw();schedule();}
 function sync(){cancelAnimationFrame(frameId);frameId=0;last=0;if(visible&&!document.hidden)draw();schedule();}
 function resize(){const r=canvas.getBoundingClientRect();width=Math.max(1,r.width);height=Math.max(1,r.height);const d=Math.min(window.devicePixelRatio||1,1.5);canvas.width=width*d;canvas.height=height*d;ctx.setTransform(d,0,0,d,0,0);draw();}
 window.addEventListener('resize',resize);document.addEventListener('portfolio:motion',sync);media.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:0}).observe(canvas);
 resize();schedule();
})();
