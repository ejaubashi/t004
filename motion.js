// Each scene has a scroll runway and a viewport that stays pinned inside it.
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
let serviceScene, serviceLock=null;
export function scrollToService(index){
  if(!serviceScene || motionQuery.matches)return;
  serviceLock=index;
  window.scrollTo({top:serviceScene.top+(index/4)*serviceScene.runway,behavior:'smooth'});
}
export function initMotion(selectService){
 const reduced=motionQuery.matches;
 document.documentElement.classList.add(reduced?'motion-reduced':'motion-enabled');
 const scenes=[];
 const wrap=(el,cls)=>{el.classList.add('motion-scene',cls);const viewport=document.createElement('div');viewport.className='scene-viewport';viewport.append(...el.childNodes);el.append(viewport);return viewport};
 const wordStage=document.querySelector('.word-stage');
 const wordView=wrap(wordStage,'typography-scene');
 const wordField=wordView.querySelector('.word-field');
 const wordCenter=wordView.querySelector('.word-center');
 const wordSpans=[...wordField.children];
 wordSpans.forEach((el,i)=>{
   el.style.setProperty('--column',i%7-3);
   el.style.setProperty('--row',Math.floor(i/7)-4);
   el.style.setProperty('--depth',i%3===0?-25:i%3===1?0:25);
 });
 const material=document.querySelector('.material');
 const values=document.createElement('section');values.className='motion-scene values-scene';values.setAttribute('aria-label','Our values');
 material.before(values);const valuesView=document.createElement('div');valuesView.className='scene-viewport';values.append(valuesView);
 const panels=[material,...document.querySelectorAll('.value')];
 panels.forEach(el=>valuesView.append(el));
 const blackout=document.createElement('div');blackout.className='scene-blackout';valuesView.append(blackout);
 const senses=document.querySelector('.senses');wrap(senses,'senses-scene');
 const engineering=document.querySelector('.engineering');wrap(engineering,'engineering-scene');
 const model=engineering.querySelector('.model');
 const layers=[...model.children];
 // SVG geometry replaces flat gradient stripes with a line drawing of the facade.
 const svg=(content)=>`<svg viewBox="0 0 200 600" preserveAspectRatio="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;
 let hex='',tri='',ribs='';
 for(let y=-40;y<650;y+=100)for(let x=-45;x<260;x+=150)hex+=`<path d="M${x},${y+50}l25,-50h50l25,50l-25,50h-50Z"/>`;
 for(let y=0;y<=600;y+=25)tri+=`<path d="M0,${y}h200"/>`;
 for(let x=-1000;x<1000;x+=50)tri+=`<path d="M${x},0l346,600M${x},0l-346,600"/>`;
 for(let y=0;y<600;y+=60)ribs+=`<path d="M12,${y}h176v24H12z" fill="currentColor"/>`;
 layers[0].innerHTML=svg('<rect x="2" y="2" width="196" height="596"/>');layers[1].innerHTML=svg(hex);layers[2].innerHTML=svg(tri);layers[3].innerHTML=svg(ribs+'<path d="M94,0h12v600H94z" fill="currentColor"/>');
 const engineeringCopy=engineering.querySelector('.engineering-copy');
 const copyHeading=engineeringCopy.querySelector('h2');
 const services=document.querySelector('.services');wrap(services,'services-scene');
 const tabs=services.querySelector('.service-tabs');
 const serviceArt=services.querySelector('.service-art');
 const serviceDescription=services.querySelector('#service-description');
 const add=(el,render)=>{const scene={el,render,p:0,target:0,top:0,runway:1};scenes.push(scene);return scene};
 add(wordStage,p=>{
   const turn=smooth(.08,.72,p),exit=smooth(.76,1,p);
   wordField.style.transform=`translate3d(0,${lerp(12,-10,p)}vh,${lerp(-550,120,turn)-exit*1100}px) rotateX(${lerp(0,64,turn)}deg) rotateY(${lerp(0,-26,turn)}deg) rotateZ(${lerp(0,83,turn)}deg)`;
   wordField.style.opacity=String(1-exit*.85);
   wordCenter.style.opacity=String(1-smooth(.03,.2,p));
   wordCenter.style.transform=`translate(-50%,-50%) scale(${1+smooth(0,.2,p)*.35})`;
   wordSpans.forEach((el,i)=>{const pulse=(Math.sin(p*9+i*1.7)+1)/2;el.style.opacity=String(lerp(.05,.95,pulse)*(1-exit*.65));});
 });
 add(values,p=>{
   const phase=p*3;
   panels.forEach((el,i)=>{
     const alpha=i===0?1-smooth(.4,.75,phase):i===1?smooth(.4,.75,phase)*(1-smooth(1.35,1.7,phase)):i===2?smooth(1.35,1.7,phase)*(1-smooth(2.3,2.65,phase)):smooth(2.3,2.65,phase);
     el.style.opacity=String(alpha);
     el.style.visibility=alpha<.001?'hidden':'visible';
     const img=el.querySelector('img,.grain,.mesh');
     if(img)img.style.transform=`scale(${lerp(1.2,1.02,clamp(phase-i+.75))}) translate3d(0,${lerp(3,-3,p)}%,0)`;
     const copy=el.querySelector('.value-copy');
     if(copy){const appear=smooth(i===1?.65:i===2?1.65:2.6,i===1?.88:i===2?1.88:2.84,phase);copy.style.opacity=String(appear);copy.style.transform=`translateY(${(1-appear)*32}px)`;}
   });
   blackout.style.opacity=String(Math.max(0,1-Math.abs(phase-.56)/.12,1-Math.abs(phase-1.51)/.12)*.93);
 });
 add(senses,p=>{
   const spans=senses.querySelectorAll('h2>span');
   spans[0].style.transform=`translateX(${lerp(-25,0,smooth(0,.4,p))}vw)`;
   spans[1].style.transform=`translateY(${lerp(35,-10,p)}vh)`;
   senses.querySelector('h2').style.opacity=String(1-smooth(.8,1,p));
 });
 add(engineering,p=>{
   const reveal=smooth(.08,.5,p),edge=smooth(.72,1,p);
   model.style.transform=`translate3d(${lerp(12,-12,reveal)}%,0,${lerp(-150,80,reveal)}px) rotateX(${lerp(0,7,reveal)}deg) rotateY(${lerp(-5,-35,reveal)-edge*53}deg)`;
   layers.forEach((el,i)=>{const distance=(i-1.5)*lerp(4,150,reveal);el.style.transform=`translate3d(${distance}px,0,${(i-1.5)*lerp(4,75,reveal)}px)`;});
   engineeringCopy.style.opacity=String(smooth(.02,.18,p));
   engineeringCopy.style.transform=`translateY(${(1-smooth(.02,.18,p))*25}px)`;
   const detail=p>.73;copyHeading.innerHTML=detail?'Detail<br>as Discipline':'Engineering<br>as Foundation';
   engineering.querySelector('.chapter').lastElementChild.textContent=detail?'04 / 04':p>.5?'03 / 04':p>.25?'02 / 04':'01 / 04';
 });
 serviceScene=add(services,p=>{
   const continuous=p*4,index=serviceLock??Math.round(continuous);
   selectService(index);
   if(serviceLock!==null&&Math.abs(continuous-serviceLock)<.015)serviceLock=null;
   const active=tabs.children[index];
   if(active){const x=active.offsetLeft-services.clientWidth*.5+active.offsetWidth*.5;tabs.style.transform=`translateX(${-x}px)`;}
   const between=Math.abs(continuous-index)*2;
   serviceArt.style.opacity=String(1-between*.65);
   serviceArt.style.transform=`translateY(${between*35}px)`;
   serviceDescription.style.opacity=String(1-between*.7);
 });
 const nav=[...document.querySelectorAll('nav a')];
 const navTargets=nav.map(a=>document.querySelector(a.hash));
 let navIndex=-1,frame=0,lastTime=0;
 function measure(){
   for(const s of scenes){s.top=s.el.getBoundingClientRect().top+scrollY;s.runway=Math.max(1,s.el.offsetHeight-innerHeight);}
   requestFrame();
 }
 function update(time){
   frame=0;const dt=Math.min(64,time-lastTime||16);lastTime=time;
   let unsettled=false;
   if(!reduced)for(const s of scenes){
     s.target=clamp((scrollY-s.top)/s.runway);
     const diff=s.target-s.p;
     s.p=Math.abs(diff)<.0001?s.target:s.p+diff*(1-Math.exp(-dt/100));
     if(Math.abs(diff)>.0001)unsettled=true;
     if(scrollY+innerHeight>=s.top-50&&scrollY<=s.top+s.el.offsetHeight+50)s.render(s.p);
   }
   let index=0;navTargets.forEach((el,i)=>{if(el.getBoundingClientRect().top<innerHeight*.45)index=i});
   if(index!==navIndex){navIndex=index;nav.forEach((a,i)=>a.classList.toggle('active',i===index));document.querySelector('.nav-line').style.width=`${29+index*13}%`;}
   if(unsettled)requestFrame();
 }
 function requestFrame(){if(!frame)frame=requestAnimationFrame(update)}
 window.addEventListener('scroll',requestFrame,{passive:true});
 window.addEventListener('wheel',()=>{serviceLock=null},{passive:true});
 window.addEventListener('touchmove',()=>{serviceLock=null},{passive:true});
 window.addEventListener('resize',measure);
 // Recalculate after fonts and images establish final dimensions.
 measure();scenes.forEach(s=>{s.p=clamp((scrollY-s.top)/s.runway);if(!reduced)s.render(s.p)});
 document.fonts.ready.then(measure);
 const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target)}}},{threshold:.08});
 const observeCards=()=>document.querySelectorAll('.project-card:not([data-motion-ready])').forEach((el,i)=>{el.dataset.motionReady='true';el.style.setProperty('--reveal-delay',`${i%3*90}ms`);observer.observe(el)});
 observeCards();new MutationObserver(()=>{observeCards();measure()}).observe(document.querySelector('.project-grid'),{childList:true});
 motionQuery.addEventListener('change',()=>location.reload());
}
