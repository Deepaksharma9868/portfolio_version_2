'use strict';
(() => {
  const root=document.documentElement;
  const loader=document.getElementById('opening-loader');
  const content=document.getElementById('portfolio-content');
  const opening=document.getElementById('welcome');
  const stage=opening.querySelector('.intro-sticky');
  const introMotion=document.getElementById('intro-motion');
  const mainMotion=document.getElementById('motion');
  const progress=loader.querySelector('[role=progressbar]');
  const fill=document.getElementById('loader-fill');
  const percent=document.getElementById('loader-percent');
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  let settled=0,finished=false,framePending=false;
  let safetyTimer,completionTimer,hideTimer;
  const started=performance.now();
  const preparationCount=2;
  const canMove=()=>!reduce.matches&&!root.classList.contains('motion-paused');
  function syncMotion(){
    const stopped=!canMove();
    introMotion.disabled=reduce.matches;
    introMotion.textContent=reduce.matches?'Motion reduced':stopped?'Resume motion':'Pause motion';
    introMotion.setAttribute('aria-pressed',String(stopped));
    renderScroll();
  }
  introMotion.addEventListener('click',()=>mainMotion.click());
  document.addEventListener('portfolio:motion',syncMotion);
  function focusLanding(){
    const heading=document.querySelector('.name-heading');
    document.getElementById('home').scrollIntoView({behavior:'instant',block:'start'});
    heading.setAttribute('tabindex','-1');
    heading.focus({preventScroll:true});
  }
  function complete(skip){
    if(finished){if(skip)focusLanding();return;}
    finished=true;
    clearTimeout(safetyTimer);clearTimeout(completionTimer);
    root.classList.remove('intro-loading');
    content.inert=false;
    loader.classList.add('is-leaving');
    loader.setAttribute('aria-hidden','true');
    loader.inert=true;
    if(skip)focusLanding();
    else if(loader.contains(document.activeElement))opening.querySelector('a[href="#home"]').focus({preventScroll:true});
    hideTimer=setTimeout(()=>{loader.hidden=true;},reduce.matches?0:550);
    renderScroll();
  }
  function finish(skip=false){
    clearTimeout(completionTimer);
    const remaining=skip||reduce.matches?0:Math.max(0,850-(performance.now()-started));
    if(remaining)completionTimer=setTimeout(()=>complete(skip),remaining);
    else complete(skip);
  }
  function preparationSettled(){
    if(finished)return;
    settled++;
    const value=Math.round(settled/preparationCount*100);
    fill.style.width=value+'%';
    percent.textContent=value+'%';
    progress.setAttribute('aria-valuenow',String(value));
  }
  document.getElementById('loader-skip').addEventListener('click',()=>finish(true));
  loader.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();finish(true);}
    if(event.key==='Tab'){event.preventDefault();document.getElementById('loader-skip').focus();}
  });
  opening.querySelectorAll('a[href="#home"]').forEach(link=>link.addEventListener('click',event=>{
    event.preventDefault();focusLanding();
  }));
  const entries=performance.getEntriesByType?performance.getEntriesByType('navigation'):[];
  const restored=entries[0]&&entries[0].type==='back_forward';
  const linkedSection=location.hash&&location.hash!=='#welcome';
  if(linkedSection)root.classList.add('skip-opening');
  if(reduce.matches||restored||linkedSection){
    finished=true;
    loader.hidden=true;
  }else{
    loader.hidden=false;
    root.classList.add('intro-loading');
    content.inert=true;
    document.getElementById('loader-skip').focus({preventScroll:true});
    const tasks=[window.portfolioIntroReady||Promise.resolve(),document.fonts?document.fonts.ready:Promise.resolve()];
    safetyTimer=setTimeout(()=>finish(false),4500);
    Promise.allSettled(tasks.map(task=>Promise.resolve(task).then(preparationSettled,preparationSettled))).then(()=>finish(false));
  }
  const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
  function renderScroll(){
    framePending=false;
    const rect=opening.getBoundingClientRect();
    const distance=Math.max(1,opening.offsetHeight-window.innerHeight);
    const position=clamp(-rect.top/distance,0,1);
    stage.style.setProperty('--intro-progress',position.toFixed(4));
    const p=canMove()?position:0;
    const departure=canMove()?clamp((-rect.top-distance)/window.innerHeight,0,1):0;
    const vars={
      '--showcase-x':(-65*p)+'px',
      '--showcase-y':(-85*p)+'px',
      '--showcase-scale':String(1+p*.35),
      '--copy-y':(-60*p)+'px',
      '--copy-opacity':String(1-clamp((p-.25)/.6,0,.8)),
      '--scene-opacity':String(1-clamp(departure/.85,0,1)),
      '--glow-y':(-100*p)+'px'
    };
    for(const [name,value] of Object.entries(vars))stage.style.setProperty(name,value);
  }
  function queueScroll(){if(!framePending){framePending=true;requestAnimationFrame(renderScroll);}}
  window.addEventListener('scroll',queueScroll,{passive:true});
  window.addEventListener('resize',queueScroll);
  window.addEventListener('pageshow',event=>{if(event.persisted)finish(false);});
  reduce.addEventListener('change',()=>{if(reduce.matches&&!finished)finish(false);syncMotion();});
  syncMotion();
})();