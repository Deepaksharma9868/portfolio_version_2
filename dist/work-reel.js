'use strict';
(() => {
  const root=document.getElementById('work');
  if(!root)return;
  const cards=Array.from(root.querySelectorAll('.reel-card'));
  if(!cards.length)return;
  const stage=root.querySelector('.work-reel-stage');
  const filters=Array.from(root.querySelectorAll('[data-filter]'));
  const byId=id=>document.getElementById(id);
  const pauseButton=byId('reel-autoplay');
  const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
  let selected=0,filtered=cards.slice(),localPaused=false,visible=false,hovered=false,focused=false,timer=0,startPoint=null;
  const motionDisabled=()=>preference.matches||document.documentElement.classList.contains('motion-paused');
  const data=cards.map(card=>({
    card,button:card.querySelector('.reel-image'),category:card.dataset.category,
    title:card.querySelector('h3').textContent,description:card.querySelector('.reel-copy > p').textContent,
    link:card.querySelector('.reel-copy > a'),tools:Array.from(card.querySelectorAll('.project-tools li')).map(li=>li.textContent)
  }));
  function syncTimer(){
    clearTimeout(timer);
    const disabled=motionDisabled();
    pauseButton.disabled=disabled;
    pauseButton.textContent=disabled?'Motion paused':localPaused?'Play rotation':'Pause rotation';
    pauseButton.setAttribute('aria-pressed',String(localPaused||disabled));
    if(!localPaused&&!disabled&&visible&&!hovered&&!focused&&!document.hidden&&filtered.length>1){
      timer=setTimeout(()=>{selected=(selected+1)%filtered.length;render();},5000);
    }
  }
  function distance(index){
    let value=index-selected;
    if(value>filtered.length/2)value-=filtered.length;
    if(value< -filtered.length/2)value+=filtered.length;
    return value;
  }
  function render(announce=false){
    const step=Math.min(310,Math.max(165,stage.clientWidth*.255));
    for(const item of data){
      const index=filtered.indexOf(item.card),offset=index<0?99:distance(index),abs=Math.abs(offset);
      const shown=abs<=2;
      item.card.hidden=!shown;
      item.card.inert=!shown;
      item.card.setAttribute('aria-hidden',String(!shown));
      item.card.classList.toggle('is-active',offset===0);
      item.button.tabIndex=offset===0?0:-1;
      item.button.setAttribute('aria-pressed',String(offset===0));
      item.card.style.setProperty('--reel-x',offset*step+'px');
      item.card.style.setProperty('--reel-z',-abs*155+'px');
      item.card.style.setProperty('--reel-angle',-offset*17+'deg');
      item.card.style.setProperty('--reel-tilt',offset*2+'deg');
      item.card.style.setProperty('--reel-opacity',abs===0?'1':abs===1?'.8':'.38');
      item.card.style.setProperty('--reel-order',String(5-abs));
    }
    const active=data.find(item=>item.card===filtered[selected]);
    byId('reel-category').textContent=active.category;
    byId('reel-title').textContent=active.title;
    byId('reel-description').textContent=active.description;
    byId('reel-open').href=active.link.href;
    byId('reel-open').textContent=active.link.textContent;
    byId('reel-counter').textContent=String(selected+1).padStart(2,'0')+' / '+String(filtered.length).padStart(2,'0');
    byId('reel-tools').replaceChildren(...active.tools.map(tool=>{const li=document.createElement('li');li.textContent=tool;return li;}));
    if(announce)byId('reel-announcement').textContent='Project '+(selected+1)+' of '+filtered.length+': '+active.title;
    syncTimer();
  }
  function choose(index){
    const focusOnCard=data.some(item=>item.button===document.activeElement);
    localPaused=true;selected=(index+filtered.length)%filtered.length;render(true);
    if(focusOnCard)filtered[selected].querySelector('.reel-image').focus({preventScroll:true});
  }
  byId('reel-prev').addEventListener('click',()=>choose(selected-1));
  byId('reel-next').addEventListener('click',()=>choose(selected+1));
  data.forEach(item=>item.button.addEventListener('click',()=>choose(filtered.indexOf(item.card))));
  filters.forEach(button=>button.addEventListener('click',()=>{
    filtered=cards.filter(card=>button.dataset.filter==='All'||card.dataset.category===button.dataset.filter);
    filters.forEach(filter=>filter.setAttribute('aria-pressed',String(filter===button)));
    choose(0);
  }));
  root.addEventListener('keydown',event=>{
    if(event.target.closest('.reel-filters'))return;
    const actions={ArrowLeft:selected-1,ArrowRight:selected+1,Home:0,End:filtered.length-1};
    if(Object.prototype.hasOwnProperty.call(actions,event.key)){event.preventDefault();choose(actions[event.key]);}
  });
  stage.addEventListener('pointerdown',event=>{if(event.isPrimary!==false&&event.button===0)startPoint={x:event.clientX,y:event.clientY};});
  stage.addEventListener('pointerup',event=>{
    if(!startPoint)return;
    const dx=event.clientX-startPoint.x,dy=event.clientY-startPoint.y;startPoint=null;
    if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3){
      choose(selected+(dx<0?1:-1));
      const cancelClick=e=>{e.preventDefault();e.stopImmediatePropagation();};
      stage.addEventListener('click',cancelClick,{capture:true,once:true});
      setTimeout(()=>stage.removeEventListener('click',cancelClick,true),0);
    }
  });
  stage.addEventListener('pointercancel',()=>{startPoint=null;});
  root.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'){hovered=true;syncTimer();}});
  root.addEventListener('pointerleave',()=>{hovered=false;startPoint=null;syncTimer();});
  root.addEventListener('focusin',()=>{focused=true;syncTimer();});
  root.addEventListener('focusout',()=>{setTimeout(()=>{focused=root.contains(document.activeElement);syncTimer();},0);});
  pauseButton.addEventListener('click',()=>{localPaused=!localPaused;syncTimer();});
  document.addEventListener('portfolio:motion',syncTimer);
  preference.addEventListener('change',syncTimer);
  document.addEventListener('visibilitychange',syncTimer);
  window.addEventListener('resize',()=>render());
  window.addEventListener('hashchange',()=>{
    const index=cards.findIndex(card=>'#'+card.id===location.hash);
    if(index<0)return;
    filtered=cards.slice();filters.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter==='All')));choose(index);
  });
  root.classList.add('reel-ready');
  root.querySelectorAll('.reel-controls,.reel-arrows,.reel-caption').forEach(element=>{element.hidden=false;});
  stage.setAttribute('role','region');stage.setAttribute('aria-roledescription','carousel');stage.style.touchAction='pan-y';
  const initial=cards.findIndex(card=>'#'+card.id===location.hash);
  if(initial>=0){selected=initial;localPaused=true;}
  render();
  if('IntersectionObserver' in window){
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;syncTimer();},{threshold:.15}).observe(stage);
  }
})();
