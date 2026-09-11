'use strict';
(() => {
  let resolveReady;
  window.portfolioIntroReady=new Promise(resolve=>{resolveReady=resolve;});
  const canvas=document.getElementById('intro-orbit');
  const ctx=canvas.getContext('2d');
  if(!ctx){
    const fallback=document.createElement('div');
    fallback.textContent='ds';
    fallback.setAttribute('aria-label','Deepak Sharma');
    fallback.style.cssText='font:600 160px/1 sans-serif;color:#d3a1ff;text-align:center;padding:80px 0';
    canvas.replaceWith(fallback);
    resolveReady();return;
  }
  const stage=canvas.closest('.intro-sticky');
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  let width=1,height=1,angle=.35,last=0,frameId=0,visible=true;
  const rings=[],particles=[];
  for(let ring=0;ring<7;ring++){
    const radius=1.48+ring*.055,tilt=.22+ring*.42,turn=ring*Math.PI/7;
    const points=[];
    for(let step=0;step<=180;step++){
      const t=step/180*Math.PI*2;
      const x=Math.cos(t)*radius,y=Math.sin(t)*radius;
      const yy=y*Math.cos(tilt),zz=y*Math.sin(tilt);
      points.push([x*Math.cos(turn)+zz*Math.sin(turn),yy,-x*Math.sin(turn)+zz*Math.cos(turn)]);
    }
    rings.push(points);
  }
  for(let i=0;i<110;i++){
    const t=i*2.39996323;
    const y=1-2*(i+.5)/110;
    const r=Math.sqrt(1-y*y),radius=2.02+(Math.sin(i*19.7)+1)*.23;
    particles.push([Math.cos(t)*r*radius,y*radius,Math.sin(t)*r*radius]);
  }
  const moving=()=>!reduce.matches&&!document.documentElement.classList.contains('motion-paused');
  function project(point,rotation){
    const [x,y,z]=point;
    const a=rotation,b=.3;
    const xx=x*Math.cos(a)+z*Math.sin(a),zz=-x*Math.sin(a)+z*Math.cos(a);
    const yy=y*Math.cos(b)-zz*Math.sin(b),depth=y*Math.sin(b)+zz*Math.cos(b);
    const perspective=5.5/(5.5-depth);
    const scale=Math.min(width,height)*.205;
    return{x:width*.5+xx*scale*perspective,y:height*.5+yy*scale*perspective,z:depth,p:perspective};
  }
  function paint(){
    const progress=moving()?Number(stage.style.getPropertyValue('--intro-progress'))||0:0;
    const rotation=angle+progress*1.5;
    ctx.clearRect(0,0,width,height);
    const unit=Math.min(width,height);
    const aura=ctx.createRadialGradient(width/2,height/2,0,width/2,height/2,unit*.49);
    aura.addColorStop(0,'rgba(132,48,233,.19)');
    aura.addColorStop(.48,'rgba(109,30,217,.08)');
    aura.addColorStop(1,'rgba(109,30,217,0)');
    ctx.fillStyle=aura;ctx.fillRect(0,0,width,height);
    const segments=[];
    rings.forEach((ring,index)=>{
      const points=ring.map(point=>project(point,rotation));
      for(let i=1;i<points.length;i++)segments.push({a:points[i-1],b:points[i],z:(points[i-1].z+points[i].z)/2,ring:index});
    });
    segments.sort((a,b)=>a.z-b.z);
    ctx.lineCap='round';
    for(const segment of segments){
      const light=Math.max(0,Math.min(1,(segment.z+1.9)/3.8));
      const hue=262+segment.ring*3;
      ctx.beginPath();ctx.moveTo(segment.a.x,segment.a.y);ctx.lineTo(segment.b.x,segment.b.y);
      ctx.strokeStyle='hsla('+hue+',88%,'+(39+light*41)+'%,'+(.15+light*.8)+')';
      ctx.lineWidth=(1.1+light*2.6)*Math.min(1.2,unit/570);
      ctx.stroke();
      if(light>.73){ctx.strokeStyle='rgba(240,218,255,'+((light-.73)*2.4)+')';ctx.lineWidth=.7;ctx.stroke();}
    }
    const core=ctx.createRadialGradient(width/2-unit*.018,height/2-unit*.024,0,width/2,height/2,unit*.058);
    core.addColorStop(0,'rgba(249,228,255,.95)');
    core.addColorStop(.27,'rgba(210,157,255,.75)');
    core.addColorStop(.65,'rgba(130,52,232,.26)');
    core.addColorStop(1,'rgba(100,25,200,0)');
    ctx.fillStyle=core;ctx.beginPath();ctx.arc(width/2,height/2,unit*.058,0,Math.PI*2);ctx.fill();
    for(let i=0;i<particles.length;i++){
      const point=project(particles[i],rotation*.55);
      const alpha=.14+Math.max(0,(point.z+2.5)/5)*.48;
      ctx.fillStyle='rgba(211,174,250,'+alpha+')';
      ctx.beginPath();ctx.arc(point.x,point.y,(i%11===0?1.6:.7)*point.p,0,Math.PI*2);ctx.fill();
    }
  }
  function frame(now){
    frameId=0;
    const dt=last?Math.min((now-last)/1000,.04):0;last=now;
    if(moving())angle+=dt*.14;
    paint();
    if(moving()&&visible&&!document.hidden)schedule();
  }
  function schedule(){if(!frameId&&visible&&!document.hidden)frameId=requestAnimationFrame(frame);}
  function sync(){
    if(frameId)cancelAnimationFrame(frameId);
    frameId=0;last=0;
    if(visible&&!document.hidden){paint();if(moving())schedule();}
  }
  function resize(){
    const rect=canvas.getBoundingClientRect();
    width=Math.max(1,rect.width);height=Math.max(1,rect.height);
    const dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);paint();
  }
  window.addEventListener('resize',resize);
  window.addEventListener('scroll',schedule,{passive:true});
  document.addEventListener('portfolio:motion',sync);
  document.addEventListener('visibilitychange',sync);
  reduce.addEventListener('change',sync);
  if('IntersectionObserver' in window){
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:0}).observe(canvas);
  }
  resize();resolveReady();schedule();
})();
