'use strict';
(() => {
  const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
  const scenes=Array.from(document.querySelectorAll('[data-tilt-scene]')).map(element=>({element,visible:true,x:0,y:0,targetX:0,targetY:0,active:false}));
  const buttons=Array.from(document.querySelectorAll('[data-motion-toggle]'));
  let frameId=0,last=0,time=0;
  const stopped=()=>preference.matches||document.documentElement.classList.contains('motion-paused');
  const clamp=v=>Math.max(-1,Math.min(1,v));
  function paint(scene,dt){
    const disabled=stopped();
    const ease=1-Math.exp(-dt*6);
    scene.x+=(scene.targetX-scene.x)*ease;scene.y+=(scene.targetY-scene.y)*ease;
    const idle=scene.active?0:1;
    const rx=disabled?0:-scene.y*7+Math.sin(time*.55)*2*idle;
    const ry=disabled?0:scene.x*12+Math.sin(time*.4)*7*idle;
    scene.element.style.setProperty('--brand-rx',rx.toFixed(3)+'deg');
    scene.element.style.setProperty('--brand-ry',ry.toFixed(3)+'deg');
    scene.element.style.setProperty('--brand-float',(disabled?0:Math.sin(time*.75)*7).toFixed(3)+'px');
    scene.element.style.setProperty('--brand-shadow',String(disabled?1:.95+Math.sin(time*.75)*.08));
  }
  function schedule(){if(!frameId&&!stopped()&&!document.hidden&&scenes.some(scene=>scene.visible))frameId=requestAnimationFrame(frame);}
  function frame(now){
    frameId=0;
    const dt=last?Math.min((now-last)/1000,.05):.016;last=now;time+=dt;
    for(const scene of scenes)if(scene.visible)paint(scene,dt);
    schedule();
  }
  function sync(){
    cancelAnimationFrame(frameId);frameId=0;last=0;
    buttons.forEach(button=>{button.disabled=preference.matches;button.textContent=preference.matches?'Motion reduced':stopped()?'Resume motion':'Pause motion';button.setAttribute('aria-pressed',String(stopped()));});
    for(const scene of scenes)paint(scene,1);
    schedule();
  }
  for(const scene of scenes){
    scene.element.addEventListener('pointermove',event=>{
      if(stopped()||event.pointerType==='touch')return;
      const rect=scene.element.getBoundingClientRect();
      scene.targetX=clamp(((event.clientX-rect.left)/Math.max(1,rect.width)-.5)*2);
      scene.targetY=clamp(((event.clientY-rect.top)/Math.max(1,rect.height)-.5)*2);scene.active=true;
    });
    scene.element.addEventListener('pointerleave',()=>{scene.targetX=0;scene.targetY=0;scene.active=false;});
  }
  buttons.forEach(button=>button.addEventListener('click',()=>document.getElementById('motion').click()));
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{const scene=scenes.find(item=>item.element===entry.target);scene.visible=entry.isIntersecting;});sync();
    },{rootMargin:'80px',threshold:0});
    scenes.forEach(scene=>observer.observe(scene.element));
  }
  document.addEventListener('portfolio:motion',sync);
  document.addEventListener('visibilitychange',sync);
  preference.addEventListener('change',sync);
  sync();
})();
