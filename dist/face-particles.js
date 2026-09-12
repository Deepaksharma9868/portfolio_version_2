'use strict';
(() => {
  const section=document.getElementById('contact'),target=document.getElementById('face-rotate'),canvas=document.getElementById('face-particles');
  if(!section||!target||!canvas)return;
  const ctx=canvas.getContext('2d'),math=window.PortfolioFaceMath;
  if(!ctx||!math)return;
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  const controls=document.querySelector('.face-controls'),help=document.getElementById('face-help');
  let mesh=null,width=1,height=1,frameId=0,last=0,time=0,yaw=0,pitch=0,zoom=1,drag=null,manual=false;
  let projected,light,scatter,visibility,modelCount=0;
  const noMotion=()=>media.matches||document.documentElement.classList.contains('motion-paused');
  const smooth=math.smooth,clamp=math.clamp;
  function resize(){
    width=window.innerWidth;height=window.innerHeight;
    const dpr=Math.min(window.devicePixelRatio||1,width<=650?1.25:1.6);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);invalidate();
  }
  function invalidate(){if(!frameId&&mesh&&!document.hidden)frameId=requestAnimationFrame(render);}
  function render(now){
    frameId=0;
    if(width<=650&&!noMotion()&&last&&now-last<32){invalidate();return;}
    const dt=last?Math.min((now-last)/1000,.05):0;last=now;
    if(!noMotion())time+=dt;
    const rect=target.getBoundingClientRect(),sectionRect=section.getBoundingClientRect();
    const nearby=sectionRect.top<height*1.8&&sectionRect.bottom>0;
    ctx.clearRect(0,0,width,height);
    if(!nearby){
      const about=document.getElementById('about');
      about.style.setProperty('--about-exit-opacity','1');about.style.setProperty('--about-exit-scale','1');
      return;
    }
    const formation=noMotion()?1:math.progress(sectionRect.top,height);
    const appear=noMotion()?1:smooth((height*1.8-sectionRect.top)/(height*.65));
    const departure=noMotion()?0:smooth(-sectionRect.top/Math.max(sectionRect.height*.72,1));
    const alpha=appear*(1-departure*.7);
    const about=document.getElementById('about');
    const exit=noMotion()?0:smooth((height*.95-sectionRect.top)/(height*.9));
    about.style.setProperty('--about-exit-opacity',String(1-exit*.72));
    about.style.setProperty('--about-exit-scale',String(1-exit*.065));
    section.style.setProperty('--contact-arrival',String(noMotion()?1:.2+formation*.8));
    section.style.setProperty('--contact-arrival-scale',String(noMotion()?1:.88+formation*.12));
    const scale=Math.min(rect.width*.68,rect.height*.53)*zoom*(.68+formation*.32)*(1-departure*.12);
    const cx=rect.left+rect.width*.5,cy=rect.top+rect.height*.49;
    const turn=yaw+(manual||noMotion()?0:Math.sin(time*.32)*.12);
    const tilt=pitch+(manual||noMotion()?0:Math.sin(time*.24)*.035);
    for(let i=0;i<modelCount;i++){
      const k=i*3,x=mesh.positions[k],y=mesh.positions[k+1]-.22,z=mesh.positions[k+2];
      const p=math.rotate(x,y,z,turn,tilt),n=math.rotate(mesh.normals[k],mesh.normals[k+1],mesh.normals[k+2],turn,tilt);
      const perspective=4.8/(4.8-p[2]);
      const headX=cx+p[0]*scale*perspective,headY=cy-p[1]*scale*perspective;
      // Each real mesh vertex travels from a deterministic screen-wide location.
      const delay=scatter[k+2]*.12;
      const collect=noMotion()?1:smooth(clamp((formation-delay)/(1-delay)));
      const loose=1-collect;
      const drift=noMotion()?0:Math.sin(time*.38+i*.07)*10;
      projected[i*2]=(scatter[k]*width+drift)*loose+headX*collect+Math.sin(collect*Math.PI)*Math.cos(i)*width*.08;
      projected[i*2+1]=(scatter[k+1]*height+drift)*loose+headY*collect+Math.sin(collect*Math.PI)*Math.sin(i)*height*.08;
      light[i]=n[2];
      const neckFade=smooth((mesh.positions[k+1]+.85)/.55);
      visibility[i]=(1-collect)+collect*neckFade;
    }
    const wire=smooth((formation-.68)/.32)*alpha;
    if(wire>.001){
      // Group strokes by facing direction; no per-edge paint state or depth sorting.
      for(let band=0;band<4;band++){
        ctx.beginPath();
        for(let e=0;e<mesh.edges.length;e+=2){
          const a=mesh.edges[e],b=mesh.edges[e+1],facing=(light[a]+light[b])*.5;
          if(facing<.025||Math.min(visibility[a],visibility[b])<.35)continue;
          if(Math.min(3,Math.floor(facing*4))!==band)continue;
          ctx.moveTo(projected[a*2],projected[a*2+1]);ctx.lineTo(projected[b*2],projected[b*2+1]);
        }
        ctx.strokeStyle='rgba(192,138,247,'+(wire*(.1+band*.095))+')';ctx.lineWidth=.55+band*.13;ctx.stroke();
      }
    }
    for(let band=0;band<4;band++){
      ctx.beginPath();
      for(let i=0;i<modelCount;i++){
        if(visibility[i]<.12)continue;
        const facing=light[i],bucket=formation<.75?i%4:Math.min(3,Math.floor(clamp((facing+1)*.5)*4));
        if(bucket!==band)continue;
        // Sparse ambient field becomes the complete head as it assembles.
        if(formation<.12&&i%(width<=650?6:3)!==0)continue;
        const x=projected[i*2],y=projected[i*2+1],radius=(.45+band*.2)*(formation>.8?.8:1);
        if(x< -5||x>width+5||y< -5||y>height+5)continue;
        ctx.moveTo(x+radius,y);ctx.arc(x,y,radius,0,Math.PI*2);
      }
      ctx.fillStyle='rgba(213,166,255,'+(alpha*(.08+band*.14))+')';ctx.fill();
    }
    canvas.style.opacity='1';
    if(!noMotion()&&!document.hidden)invalidate();
  }
  target.addEventListener('pointerdown',event=>{
    if(!mesh||event.button!==0||event.isPrimary===false)return;
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,type:event.pointerType};
    target.setPointerCapture(event.pointerId);target.classList.add('is-dragging');manual=true;target.focus({preventScroll:true});
  });
  target.addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.id)return;
    yaw+=(event.clientX-drag.x)*.009;
    // Touch reserves vertical movement for native page scrolling.
    if(drag.type!=='touch')pitch=clamp(pitch+(event.clientY-drag.y)*.007,-1.2,1.2);
    drag.x=event.clientX;drag.y=event.clientY;invalidate();
  });
  function release(){drag=null;target.classList.remove('is-dragging');}
  target.addEventListener('pointerup',release);target.addEventListener('pointercancel',release);target.addEventListener('lostpointercapture',release);
  function action(name){
    manual=true;
    if(name==='left')yaw-=.35;
    if(name==='right')yaw+=.35;
    if(name==='up')pitch=clamp(pitch-.18,-1.2,1.2);
    if(name==='down')pitch=clamp(pitch+.18,-1.2,1.2);
    if(name==='in')zoom=clamp(zoom+.1,.65,1.45);
    if(name==='out')zoom=clamp(zoom-.1,.65,1.45);
    if(name==='reset'){yaw=0;pitch=0;zoom=1;manual=false;}
    invalidate();
  }
  target.addEventListener('keydown',event=>{
    const keys={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down','+':'in','=':'in','-':'out',Home:'reset',Escape:'reset'};
    if(keys[event.key]){event.preventDefault();action(keys[event.key]);}
  });
  controls.querySelectorAll('[data-face-action]').forEach(button=>button.addEventListener('click',()=>action(button.dataset.faceAction)));
  window.addEventListener('scroll',invalidate,{passive:true});window.addEventListener('resize',resize);
  document.addEventListener('portfolio:motion',()=>{last=0;invalidate();});
  media.addEventListener('change',()=>{last=0;invalidate();});
  document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(frameId);frameId=0;last=0;if(!document.hidden)invalidate();});
  fetch('assets/face/head-mesh.json').then(response=>{if(!response.ok)throw new Error('Mesh unavailable');return response.json();}).then(data=>{
    if(!Array.isArray(data.positions)||data.positions.length<9||data.normals.length!==data.positions.length)throw new Error('Invalid mesh');
    mesh=data;modelCount=mesh.positions.length/3;
    projected=new Float32Array(modelCount*2);light=new Float32Array(modelCount);visibility=new Float32Array(modelCount);scatter=new Float32Array(modelCount*3);
    for(let i=0;i<modelCount;i++){scatter[i*3]=math.random(i,1);scatter[i*3+1]=math.random(i,2);scatter[i*3+2]=math.random(i,3);}
    section.classList.add('face-3d-ready');canvas.hidden=false;controls.hidden=false;help.hidden=false;
    target.setAttribute('tabindex','0');target.setAttribute('aria-label','Interactive 3D face. Drag to rotate. Arrow keys rotate, plus and minus zoom, Home resets.');
    resize();
  }).catch(()=>{
    target.removeAttribute('tabindex');
    section.classList.add('face-fallback');
  });
})();
