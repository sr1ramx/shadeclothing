/* One continuous position controls the depth line; details settle on the nearest look. */
(()=>{
const looks=[
 {name:'Everyday structure',copy:'Utility, softened. An olive layer with a clean charcoal foundation.',pieces:[0,2]},
 {name:'The quiet essential',copy:'An ivory Oxford and a relaxed pleat. Considered from morning to evening.',pieces:[1,2]},
 {name:'After hours',copy:'Deep navy tailoring. A little structure, a confident presence.',pieces:[3,2]},
 {name:'A longer view',copy:'Generous proportions and warm taupe. Room to move, room to layer.',pieces:[4,16]},
 {name:'Texture in focus',copy:'A rust knit, an open collar and a clean trouser. Understated by design.',pieces:[5,2]},
 {name:'Off the clock',copy:'Soft sage layers and an easy dark base. Your own rhythm.',pieces:[7,10]}
];
const stage=document.querySelector('#runway-stage');if(!stage)return;
const line=document.querySelector('#runway-line'),rail=document.querySelector('#runway-rail'),title=document.querySelector('#look-title'),countEl=document.querySelector('#look-count'),description=document.querySelector('#look-description'),dots=document.querySelector('#runway-dots');
const N=looks.length,wrap=n=>((n%N)+N)%N,reduced=matchMedia('(prefers-reduced-motion: reduce)');
line.innerHTML=looks.map((l,i)=>`<div class="runway-model" data-look="${i}" aria-hidden="true"><svg viewBox="0 0 200 600"><svg x="0" y="0" width="200" height="600" viewBox="${i*200} 0 200 600" preserveAspectRatio="none"><image href="assets/runway-men.png" width="1200" height="600" preserveAspectRatio="none"/></svg></svg></div>`).join('');
dots.innerHTML=looks.map((l,i)=>`<button aria-label="Show look ${i+1}: ${l.name}" aria-pressed="${i===0}" data-look="${i}"></button>`).join('');
const models=[...line.children];let position=0,target=0,active=-1,frameId=0,last=0,drag=null,wheelTimer;
// Each stop specifies horizontal center, feet, height, blur, opacity.
const stops=[[1.2,1.12,1.15,0,0],[.73,.94,.76,0,1],[.48,.84,.56,.4,1],[.31,.76,.42,1.5,.9],[.19,.70,.32,3,.65],[.10,.66,.25,5,.3],[.03,.63,.18,7,0]];
function details(i){if(i===active)return;active=i;const l=looks[i];title.textContent=l.name;description.textContent=l.copy;countEl.textContent=String(i+1).padStart(2,'0')+' / 06';document.querySelector('#look-announcement').textContent=`Look ${i+1} of 6. ${l.name}.`;rail.innerHTML=`<div class="runway-rail-heading"><h2 class="eyebrow">In this look</h2><span>SHADES STUDIO</span></div>${l.pieces.map(j=>{const p=P[j];return `<article class="runway-piece"><a class="runway-piece-image" href="${url(p)}" aria-label="View ${p.name}">${visual(p)}</a><div class="runway-piece-meta"><div><h3><a href="${url(p)}">${p.name}</a></h3><p>${money(p.price)}</p></div><a href="${url(p)}" aria-label="Choose size for ${p.name}">＋</a></div></article>`}).join('')}<p class="runway-disclaimer">Sample styling imagery. View each piece for its own front and back views, details and size selection.</p>`;rail.classList.remove('changing');void rail.offsetWidth;rail.classList.add('changing');[...dots.children].forEach((b,j)=>b.setAttribute('aria-pressed',String(j===i)));}
function paint(){const w=stage.clientWidth,h=stage.clientHeight;models.forEach((m,i)=>{let d=wrap(i-position+1)-1;const index=Math.floor(d)+1,f=d-Math.floor(d);const a=stops[index],b=stops[Math.min(index+1,6)],v=a.map((n,j)=>n+(b[j]-n)*f),height=h*v[2],width=height/3;m.style.width=width+'px';m.style.height=height+'px';m.style.transform=`translate3d(${w*v[0]-width/2}px,${h*v[1]-height}px,0)`;m.style.filter=`blur(${v[3]}px)`;m.style.opacity=v[4];m.style.zIndex=100-Math.round(d*10);m.style.pointerEvents=v[4]>.4?'auto':'none';});details(wrap(Math.round(position)));}
function frame(t){frameId=0;const dt=last?Math.min(t-last,50):16;last=t;position=reduced.matches?target:position+(target-position)*(1-Math.exp(-dt*.009));if(Math.abs(position-target)<.0004)position=target;paint();if(position!==target)frameId=requestAnimationFrame(frame);else last=0;}
function wake(){if(!frameId)frameId=requestAnimationFrame(frame)}
function move(n){clearTimeout(wheelTimer);target=Math.round(target)+n;wake()}
function select(i){const current=wrap(Math.round(target));let delta=i-current;if(delta>3)delta-=6;if(delta< -3)delta+=6;move(delta)}
document.querySelector('#runway-prev').onclick=()=>move(-1);document.querySelector('#runway-next').onclick=()=>move(1);dots.onclick=e=>{const b=e.target.closest('[data-look]');if(b)select(+b.dataset.look)};
stage.addEventListener('keydown',e=>{if(e.target!==stage)return;if(['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();if(e.key==='Home')select(0);else if(e.key==='End')select(5);else move(['ArrowRight','ArrowDown'].includes(e.key)?1:-1)}});
stage.addEventListener('wheel',e=>{if(Math.abs(e.deltaY+e.deltaX)<2)return;e.preventDefault();const factor=e.deltaMode===1?16:e.deltaMode===2?stage.clientHeight:1;target+=Math.max(-120,Math.min(120,(e.deltaY+e.deltaX)*factor))/420;wake();clearTimeout(wheelTimer);wheelTimer=setTimeout(()=>{target=Math.round(target);wake()},150)},{passive:false});
stage.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('button,a'))return;clearTimeout(wheelTimer);drag={x:e.clientX,start:target,moved:0,look:e.target.closest('[data-look]')?.dataset.look};stage.setPointerCapture(e.pointerId)});
stage.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x;drag.moved=Math.max(drag.moved,Math.abs(dx));target=drag.start+dx/Math.max(150,stage.clientWidth*.2);wake()});
function release(e){if(!drag)return;const old=drag;drag=null;target=Math.round(target);if(e.type==='pointerup'&&old.moved<6&&old.look!==undefined)select(+old.look);wake()}
stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('lostpointercapture',release);new ResizeObserver(()=>{paint()}).observe(stage);reduced.addEventListener('change',wake);paint();
})();
