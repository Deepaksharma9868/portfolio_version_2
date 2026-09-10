'use strict';
const canvas=document.getElementById('scene'),ctx=canvas.getContext('2d'),motion=document.getElementById('motion');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
let paused=reduced.matches,angle=.4,width=0,height=0,last=0,raf=0,hoverX=0,hoverY=0,targetX=0,targetY=0;
const points=[];
for(let i=0;i<240;i++){const t=i/240*Math.PI*2;const center=s=>[(2+Math.cos(3*s))*.68*Math.cos(2*s),(2+Math.cos(3*s))*.68*Math.sin(2*s),Math.sin(3*s)*.68];const c=center(t),n=center(t+.001);let tangent=n.map((v,k)=>v-c[k]);const len=Math.hypot(...tangent);tangent=tangent.map(v=>v/len);let normal=[-tangent[1],tangent[0],0];const nl=Math.hypot(...normal);normal=normal.map(v=>v/nl);const bin=[tangent[1]*normal[2]-tangent[2]*normal[1],tangent[2]*normal[0]-tangent[0]*normal[2],tangent[0]*normal[1]-tangent[1]*normal[0]];for(let j=0;j<22;j++){const s=j/22*Math.PI*2;points.push(c.map((v,k)=>v+.3*(Math.cos(s)*normal[k]+Math.sin(s)*bin[k])));}}
function label(){motion.innerHTML=paused?'Play animation <span>▷</span>':'Pause animation <span>Ⅱ</span>';motion.setAttribute('aria-pressed',String(paused));}
function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;const d=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(width*d);canvas.height=Math.round(height*d);ctx.setTransform(d,0,0,d,0,0);draw();}
function draw(){ctx.clearRect(0,0,width,height);const size=Math.min(width,height)*.174;const a=angle+hoverX,b=.62+hoverY;const ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b);const projected=points.map(([x,y,z])=>{const x1=x*ca-z*sa,z1=x*sa+z*ca,y1=y*cb-z1*sb,z2=y*sb+z1*cb;const perspective=6/(6-z2);return{x:width/2+x1*size*perspective,y:height/2+y1*size*perspective,z:z2,p:perspective};}).sort((p,q)=>p.z-q.z);
const glow=ctx.createRadialGradient(width/2,height/2,0,width/2,height/2,size*2.9);glow.addColorStop(0,'rgba(160,80,245,.09)');glow.addColorStop(1,'rgba(160,80,245,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
for(const p of projected){const light=Math.max(0,Math.min(1,(p.z+2.5)/5));ctx.fillStyle='rgba('+Math.round(105+light*137)+','+Math.round(42+light*134)+','+Math.round(167+light*88)+','+(.3+light*.7)+')';ctx.beginPath();ctx.arc(p.x,p.y,Math.max(.6,p.p*(width<450?.95:1.3)),0,Math.PI*2);ctx.fill();}}
function frame(now){const dt=last?Math.min((now-last)/1000,.04):0;last=now;if(!paused){angle+=dt*.19;hoverX+=(targetX-hoverX)*.025;hoverY+=(targetY-hoverY)*.025;draw();}raf=requestAnimationFrame(frame);}
motion.addEventListener('click',()=>{paused=!paused;label();draw();});
canvas.addEventListener('pointermove',e=>{if(reduced.matches)return;const r=canvas.getBoundingClientRect();targetX=((e.clientX-r.left)/r.width-.5)*.65;targetY=((e.clientY-r.top)/r.height-.5)*.45;});
canvas.addEventListener('pointerleave',()=>{targetX=0;targetY=0;});
reduced.addEventListener('change',e=>{paused=e.matches;label();draw();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);last=0;}else{raf=requestAnimationFrame(frame);}});
window.addEventListener('resize',resize);label();resize();raf=requestAnimationFrame(frame);