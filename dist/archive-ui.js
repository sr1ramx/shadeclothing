/* One homepage: a viewport-sized 3D showroom, followed by the SHADES store. */
window.initShadesHero=function(){
 document.body.classList.add('archive-home');
 const products=P.filter(p=>p.archive),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let stage=null,opened=null,busy=false,lastFocus=null,active=-1,scrollBeforeDetail=0;
 const collections=[['archive','The archive drop',products[0],'Graphic forms. Considered streetwear.'],['tailoring','The tailored edit',P.find(p=>p.rail),'Quiet structure. A natural presence.'],['everyday','Everyday essentials',P[0],'Good pieces, on repeat.']];
 document.querySelector('#main').innerHTML=`
 <section id="home" class="archive-room is-entered is-integrated" aria-label="SHADES interactive menswear showroom">
  <canvas id="archive-canvas" aria-label="A three-dimensional chrome clothing rack with eight archive garments"></canvas>
  <div class="archive-showroom-ui">
   <h1 class="archive-category">man / clothing</h1>
   <button class="archive-hover-label" id="archive-hover" hidden></button>
   <p class="archive-instruction">Drag the rail · hover to explore · click to inspect</p>
   <nav class="archive-categories" aria-label="Showroom categories"><a href="#store">Store</a><button data-archive-filter="all" class="is-active" aria-pressed="true">Man</button><button data-archive-filter="layers" aria-pressed="false">Layers</button></nav>
   <a class="archive-scroll" href="#store">Scroll to the store<span aria-hidden="true"></span></a>
   <div class="archive-piece-access" aria-label="Choose an archive piece">${products.map((p,i)=>`<button data-archive-piece="${i}">Inspect ${p.name}</button>`).join('')}</div>
  </div>
  <p class="archive-loading-note" role="status">Preparing the showroom…</p><p id="archive-status" class="sr-only" role="status"></p>
  <div class="archive-fallback" hidden><p>The interactive room is unavailable in this browser.</p><a href="#store">Explore the collection below</a></div>
 </section>
 <div class="home-continuation">
  <section id="store" class="section home-store" aria-labelledby="home-store-title">
   <div class="section-head"><div><span class="eyebrow">THE SHADES STORE</span><h2 id="home-store-title">Find your next everyday.</h2></div><p>A considered wardrobe.<br>From quiet essentials to pieces with presence.</p></div>
   <div class="home-store-tools"><div class="home-store-filters" role="group" aria-label="Filter the homepage collection">${[['all','All pieces'],['archive','Streetwear'],['tailoring','Tailoring'],['everyday','Everyday']].map(([key,label])=>`<button data-home-filter="${key}" aria-pressed="${key==='all'}">${label}</button>`).join('')}</div><label class="home-search-label" for="home-search">Search collection<input id="home-search" type="search" placeholder="Search the collection" autocomplete="off"></label></div>
   <p id="home-results" class="home-results" role="status"></p><div id="home-store-grid" class="products"></div><button class="home-load-more" id="home-load-more">Show more pieces</button>
   <p class="home-sample-note">Sample collection, prices and sizing. Live orders and payments are not enabled.</p>
  </section>
  <section id="collections" class="section home-collections" aria-labelledby="home-collections-title"><div class="section-head"><div><span class="eyebrow">THREE PERSPECTIVES. ONE WARDROBE.</span><h2 id="home-collections-title">Find your own rhythm.</h2></div></div><div class="home-collection-grid">${collections.map(([key,name,p,copy])=>`<a class="home-collection" href="#store" data-home-collection="${key}"><div class="home-collection-image">${visual(p)}</div><h3>${name}</h3><p>${copy}</p><span>Explore the edit</span></a>`).join('')}</div></section>
  <section id="journal" class="section home-journal" aria-labelledby="home-journal-title"><div class="home-journal-art">${visual(products[0])}${visual(products[4])}<span>THE SHADES EDIT</span></div><div class="home-journal-copy"><span class="eyebrow">STYLE NOTES / IN GOOD FORM</span><h2 id="home-journal-title">Presence,<br>without the effort.</h2><p>Good style leaves room for the person wearing it. Explore the textures, layers and proportions behind the collection.</p><a class="text-link" href="lookbook.html">Open the lookbook</a><div id="runway" class="home-runway"><span class="eyebrow">FASHION RUNWAY</span><p>A new perspective on the considered wardrobe.</p><a class="text-link" href="runway.html">Explore Fashion Runway</a></div></div></section>
  <section id="about" class="section home-philosophy" aria-labelledby="home-about-title"><span class="eyebrow">SHADES / COIMBATORE</span><div><h2 id="home-about-title">Style is how<br>you carry yourself.</h2><p>Contemporary menswear with room for your own point of view. Clean shirts, relaxed trousers, tactile layers and pieces that make getting dressed feel effortless.</p><a class="text-link" href="about.html">Our story</a></div></section>
  ${newsletter()}
 </div>`;
 const room=document.querySelector('.archive-room'),label=room.querySelector('#archive-hover'),status=room.querySelector('#archive-status');
 const touch=matchMedia('(pointer: coarse), (max-width: 760px)');
 const instruction=()=>room.querySelector('.archive-instruction').textContent=touch.matches?'Swipe to browse · tap a piece, then tap again to inspect':'Drag the rail · hover to explore · click to inspect';instruction();touch.addEventListener('change',instruction);

 // The section navigation and search stay on this homepage.
 const order=[...products,...P.filter(p=>p.rail),...P.filter(p=>!p.archive&&!p.rail)];
 let filter='all',limit=12;
 function renderStore(){
  const query=document.querySelector('#home-search').value.trim().toLowerCase();
  const matches=order.filter(p=>(filter==='all'||filter==='archive'&&p.archive||filter==='tailoring'&&p.rail||filter==='everyday'&&!p.archive&&!p.rail)&&`${p.name} ${p.color} ${p.fabric}`.toLowerCase().includes(query));
  document.querySelector('#home-store-grid').innerHTML=matches.length?matches.slice(0,limit).map(card).join(''):'<p class="home-no-results">No pieces match your search. Try another fabric, color or style.</p>';
  document.querySelector('#home-results').textContent=`${matches.length} pieces in this edit`;
  const more=document.querySelector('#home-load-more');more.hidden=limit>=matches.length;more.textContent=`Show more pieces (${Math.max(0,matches.length-limit)})`;
  document.querySelectorAll('[data-home-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.homeFilter===filter)));
 }
 document.querySelectorAll('[data-home-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.homeFilter;limit=12;renderStore()});
 document.querySelector('#home-search').oninput=()=>{limit=12;renderStore()};
 document.querySelector('#home-load-more').onclick=()=>{limit+=12;renderStore()};
 document.querySelectorAll('[data-home-collection]').forEach(a=>a.addEventListener('click',()=>{filter=a.dataset.homeCollection;limit=12;document.querySelector('#home-search').value='';renderStore()}));
 renderStore();
 document.querySelector('[data-home-search]')?.addEventListener('click',()=>document.querySelector('#home-search').focus({preventScroll:true}));
 let scrollFrame=0;
 function updateHeader(){scrollFrame=0;document.body.classList.toggle('past-showroom',window.scrollY>room.offsetHeight-85);}
 window.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateHeader)},{passive:true});updateHeader();
 if(location.hash)requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView({behavior:'instant'}));

 const detail=document.createElement('dialog');detail.className='archive-product';detail.setAttribute('aria-labelledby','archive-product-name');document.body.append(detail);
 function showHover(index,point){active=index;if(index<0||opened){label.hidden=true;return;}label.textContent=products[index].name.toUpperCase();label.hidden=false;label.style.left=point.x+'px';label.style.top=point.y+'px';}
 function hoverPosition(point){if(!label.hidden){label.style.left=point.x+'px';label.style.top=point.y+'px';}}
 function closeDetail({restoreFocus=true}={}){
  if(!detail.open||busy)return;detail.close();opened=null;room.inert=false;document.documentElement.classList.remove('archive-detail-open');document.body.classList.remove('archive-inspecting');stage?.hideSelected(false);stage?.closeProduct();
  if(restoreFocus)lastFocus?.focus({preventScroll:true});window.scrollTo({top:scrollBeforeDetail,behavior:'instant'});
 }
 function selectProduct(index){
  if(!stage||opened)return;const p=products[index];opened=p;lastFocus=document.activeElement;scrollBeforeDetail=window.scrollY;window.scrollTo({top:room.offsetTop,behavior:'instant'});label.hidden=true;stage.selectProduct(index);room.inert=true;document.documentElement.classList.add('archive-detail-open');document.body.classList.add('archive-inspecting');
  detail.innerHTML=`<button class="archive-detail-close" aria-label="Return to clothing rack">Back to rack</button><a href="cart.html" class="archive-detail-cart" aria-label="View shopping bag">${icon('bag')}<span data-cart-count>${count()}</span></a><section class="archive-product-info"><span class="archive-drop">SHADES / ARCHIVE DROP 01</span><h2 id="archive-product-name">${p.name}</h2><p>${p.description}</p><div class="archive-product-price">${money(p.price)}</div><div class="archive-product-color"><i style="background:${p.swatch}" aria-hidden="true"></i>${p.color} / ${p.fabric}</div><form id="archive-add"><fieldset><legend>SIZE</legend><div class="archive-sizes">${p.sizes.map(size=>`<label><input type="radio" required name="size" value="${size}"><span>${size}</span></label>`).join('')}</div></fieldset><button class="archive-add" type="submit">ADD TO CART</button><p class="archive-add-status" role="status"></p></form><div class="archive-detail-links"><a href="${url(p)}">Full product details</a><a href="cart.html">View cart</a></div><p class="archive-product-note">Sample archive · No payment is taken.</p></section><div class="archive-fold-origin" aria-hidden="true"></div>`;
  const target=document.querySelector('#bag-icon').getBoundingClientRect();detail.querySelector('.archive-detail-cart').style.cssText=`left:${target.left}px;top:${target.top}px;width:${target.width}px;height:${target.height}px;`;
  detail.showModal();stage.setDetailOrigin(detail.querySelector('.archive-fold-origin'));
  detail.querySelector('.archive-detail-close').onclick=()=>closeDetail();
  detail.querySelector('form').onsubmit=async e=>{
   e.preventDefault();if(busy)return;const size=new FormData(e.target).get('size');if(!p.sizes.includes(size))return;
   busy=true;const button=detail.querySelector('.archive-add'),message=detail.querySelector('.archive-add-status'),back=detail.querySelector('.archive-detail-close'),sizes=detail.querySelector('fieldset');
   button.disabled=back.disabled=sizes.disabled=true;detail.setAttribute('aria-busy','true');button.innerHTML='<i class="archive-spinner" aria-hidden="true"></i> ADDING...';message.textContent='Preparing your selection.';
   try{
    stage.hideSelected(true);await window.addHeroToBag(p,size,detail.querySelector('.archive-fold-origin'));
    button.textContent='ADDED TO CART';message.textContent='ADDED TO CART';status.textContent=`${p.name}, size ${size}, added to cart. The complete rack is ready to explore.`;
    await new Promise(resolve=>setTimeout(resolve,reduced.matches?0:350));
    busy=false;stage.hideSelected(false);closeDetail({restoreFocus:false});
   }catch{message.textContent='Unable to add this piece. Please try again.';button.textContent='ADD TO CART';}
   finally{stage.hideSelected(false);busy=false;button.disabled=back.disabled=sizes.disabled=false;detail.removeAttribute('aria-busy');}
  };
 }
 detail.addEventListener('cancel',e=>{e.preventDefault();closeDetail()});
 label.onclick=()=>{if(active>=0)selectProduct(active)};
 room.querySelectorAll('[data-archive-piece]').forEach(button=>{button.onfocus=()=>stage?.focusPiece(Number(button.dataset.archivePiece));button.onclick=()=>selectProduct(Number(button.dataset.archivePiece));});
 room.querySelectorAll('[data-archive-filter]').forEach(button=>button.onclick=()=>{room.querySelectorAll('[data-archive-filter]').forEach(b=>{b.classList.toggle('is-active',b===button);b.setAttribute('aria-pressed',String(b===button))});stage?.filter(button.dataset.archiveFilter);status.textContent=button.dataset.archiveFilter==='layers'?'Showing jackets and hoodies.':'Showing all eight archive pieces.';});
 import('./archive-scene.mjs?v=homepage-1').then(async({createArchiveStage})=>{
  stage=await createArchiveStage({canvas:room.querySelector('canvas'),products,onHover:showHover,onHoverPosition:hoverPosition,onSelect:selectProduct,reduced});stage.enter();room.classList.add('is-ready');room.querySelector('.archive-loading-note').textContent='';status.textContent='Eight archive pieces. Explore the showroom or scroll into the store below.';
 }).catch(error=>{console.error('SHADES showroom:',error);room.classList.add('scene-unavailable');room.querySelector('.archive-loading-note').hidden=true;room.querySelector('.archive-fallback').hidden=false;});
};
