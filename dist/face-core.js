'use strict';
window.PortfolioFaceMath=Object.freeze({
  clamp:(v,lo=0,hi=1)=>Math.max(lo,Math.min(hi,v)),
  smooth(v){v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);},
  rotate(x,y,z,yaw,pitch){
    const a=x*Math.cos(yaw)+z*Math.sin(yaw),b=-x*Math.sin(yaw)+z*Math.cos(yaw);
    return [a,y*Math.cos(pitch)-b*Math.sin(pitch),y*Math.sin(pitch)+b*Math.cos(pitch)];
  },
  progress(top,height){return this.smooth((height*1.15-top)/(height*1.05));},
  random(i,seed){const v=Math.sin(i*127.1+seed*311.7)*43758.5453;return v-Math.floor(v);}
});
