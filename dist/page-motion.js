'use strict';
(() => {
  const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
  const nodes=Array.from(document.querySelectorAll('.work-heading,#about > .eyebrow,#about > div > h2,#about > div > p,#about .skills,#about .resume-block > h3,#about .experience-row,#about .tool-list > div,#about .education > h4,#about .education > p,#contact .contact-top,#contact .contact-copy > *,#contact .contact-details,footer'));
  const reel=document.querySelector('.reel-cards'),stage=document.querySelector('.work-reel-stage'),contact=document.getElementById('contact');
  const clamp=value=>Math.max(0,Math.min(1,value));
  const topOf=element=>{let top=0;for(let node=element;node;node=node.offsetParent)top+=node.offsetTop;return top;};
  let positions=[],stageTop=0,contactTop=0,queued=false;
  function update(){
    queued=false;
    const disabled=preference.matches||document.documentElement.classList.contains('motion-paused');
    const height=window.innerHeight,scroll=window.scrollY;
    nodes.forEach((element,index)=>{
      const progress=disabled?1:clamp((scroll+height*.94-positions[index])/(height*.32));
      const eased=1-Math.pow(1-progress,3);
      element.style.setProperty('--flow-opacity',String(.08+eased*.92));
      element.style.setProperty('--flow-y',(1-eased)*65+'px');
      element.style.setProperty('--flow-scale',String(.965+eased*.035));
    });
    if(reel&&stage){const progress=clamp((scroll+height-stageTop)/(height+stage.offsetHeight));reel.style.setProperty('--reel-float',disabled?'0px':((.5-progress)*40)+'px');}
    if(contact)contact.style.setProperty('--contact-drift',disabled?'0px':((clamp((scroll+height-contactTop)/(height+contact.offsetHeight))-.5)*100)+'px');
  }
  function measure(){
    positions=nodes.map(topOf);stageTop=stage?topOf(stage):0;contactTop=contact?topOf(contact):0;update();
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(update);}}
  nodes.forEach(element=>element.classList.add('flow-reveal'));
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',measure);
  window.addEventListener('load',measure);
  document.addEventListener('portfolio:motion',update);
  preference.addEventListener('change',update);
  if(document.fonts)document.fonts.ready.then(measure);
  if('ResizeObserver' in window)new ResizeObserver(measure).observe(document.querySelector('main'));
  measure();
})();
