import * as THREE from './vendor/three.module.js';

export async function createArchiveStage({canvas,products,onHover,onHoverPosition,onSelect,reduced}){
 const gs=window.gsap,mobile=matchMedia('(max-width: 760px)'),scene=new THREE.Scene();
 scene.background=new THREE.Color('#30383c');scene.fog=new THREE.Fog('#69767c',16,35);
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.outputColorSpace=THREE.SRGBColorSpace;
 const camera=new THREE.PerspectiveCamera(38,1,.1,70),raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),world=new THREE.Vector3();
 const motion={x:3.4,y:2.6,z:16,lookX:0,lookY:1.35,lookZ:0,pan:0,offset:0},cursor={x:0,y:0};
 let entered=false,selected=-1,hovered=-1,hiddenSelection=false,drag=null,suppress=false,destroyed=false,frame=0,previous=0,phase=0,filterMode='all',detailOrigin=null,modeMobile=mobile.matches;
 const root=new THREE.Group(),rack=new THREE.Group();scene.add(root);root.add(rack);
 function tween(target,values,duration=.6){if(!gs||reduced.matches){for(const[k,v]of Object.entries(values))if(typeof v==='number')target[k]=v;values.onComplete?.();return;}return gs.to(target,{...values,duration,ease:'power3.out',overwrite:'auto'});}
 function noiseTexture(){const data=new Uint8Array(64*64*4);let seed=19;for(let i=0;i<64*64;i++){seed=(seed*16807)%2147483647;const n=110+seed%36;data.set([n,n,n,255],i*4);}const texture=new THREE.DataTexture(data,64,64);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(20,20);texture.needsUpdate=true;return texture;}
 const grain=noiseTexture(),wallMaterial=new THREE.MeshStandardMaterial({color:'#afb4b5',roughness:1,bumpMap:grain,bumpScale:.008});
 // A real curved cyclorama joins the matte floor to the studio wall.
 const path=[[12,0],[-2,0]];for(let i=1;i<=24;i++){const a=i/24*Math.PI/2;path.push([-2-2*Math.sin(a),2*(1-Math.cos(a))]);}path.push([-4,11]);
 const roomPositions=[],roomUvs=[],roomIndices=[];for(let i=0;i<path.length;i++){for(const x of [-22,22]){roomPositions.push(x,path[i][1],path[i][0]);roomUvs.push(x/44+.5,i/path.length);}}for(let i=0;i<path.length-1;i++){const a=i*2;roomIndices.push(a,a+1,a+2,a+1,a+3,a+2);}const roomGeometry=new THREE.BufferGeometry();roomGeometry.setAttribute('position',new THREE.Float32BufferAttribute(roomPositions,3));roomGeometry.setAttribute('uv',new THREE.Float32BufferAttribute(roomUvs,2));roomGeometry.setIndex(roomIndices);roomGeometry.computeVertexNormals();
 const cyclorama=new THREE.Mesh(roomGeometry,wallMaterial);cyclorama.receiveShadow=true;scene.add(cyclorama);
 const hemi=new THREE.HemisphereLight('#dbe0e2','#525e64',1.25);scene.add(hemi);
 const key=new THREE.SpotLight('#f3f3e9',180,30,Math.PI/3.3,.7,2);key.position.set(-3.5,7,4);key.target.position.set(0,1,0);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.0003;key.shadow.normalBias=.018;key.shadow.radius=5;key.shadow.blurSamples=8;key.shadow.intensity=.45;scene.add(key,key.target);
 const fill=new THREE.DirectionalLight('#dce5ed',1.4);fill.position.set(5,4,2);scene.add(fill);
 // Broad softbox reflections give the chrome its studio finish without a remote HDR file.
 const environment=new THREE.Scene();environment.background=new THREE.Color('#8a9298');const envRoom=new THREE.Mesh(new THREE.BoxGeometry(24,16,24),new THREE.MeshBasicMaterial({color:'#69747c',side:THREE.BackSide}));environment.add(envRoom);
 for(const [x,y,z,w,h,ry] of [[-5,4,3,2,8,Math.PI/2],[5,3,0,1.4,7,-Math.PI/2],[0,7,0,9,3,0],[0,2,-5,7,.8,0]]){const softbox=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:'#ffffff',side:THREE.DoubleSide}));softbox.position.set(x,y,z);softbox.rotation.y=ry;if(y===7)softbox.rotation.x=Math.PI/2;environment.add(softbox);}
 const pmrem=new THREE.PMREMGenerator(renderer),envTarget=pmrem.fromScene(environment,.04,.1,40);scene.environment=envTarget.texture;pmrem.dispose();environment.traverse(o=>{o.geometry?.dispose();if(o.material)o.material.dispose()});
 const chrome=new THREE.MeshPhysicalMaterial({color:'#ccd1d3',metalness:1,roughness:.14,clearcoat:1,clearcoatRoughness:.1,envMapIntensity:1.3});
 function cylinder(a,b,r=.03,material=chrome){const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),direction=to.clone().sub(from),mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,direction.length(),20),material);mesh.position.copy(from).add(to).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());mesh.castShadow=true;return mesh;}
 function tube(points,r=.025){return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),48,r,12,false),chrome);}
 function buildRack(){rack.traverse(o=>o.geometry?.dispose());rack.clear();const half=mobile.matches?1.6:3.65;const points=[new THREE.Vector2(.16,.015),new THREE.Vector2(.26,.055),new THREE.Vector2(.28,.12),new THREE.Vector2(.24,.22),new THREE.Vector2(.15,.4),new THREE.Vector2(.075,.65),new THREE.Vector2(.035,.88)];
  for(const sign of [-1,1]){const foot=new THREE.Mesh(new THREE.LatheGeometry(points,48),chrome);foot.position.x=sign*half;foot.castShadow=true;foot.receiveShadow=true;rack.add(foot);rack.add(cylinder([sign*half,.76,0],[sign*half,2.62,0],.031));const corner=tube([[sign*half,2.58,0],[sign*half,2.73,0],[sign*(half-.055),2.82,0],[sign*(half-.15),2.86,0],[sign*(half-.24),2.86,0]],.03);corner.castShadow=true;rack.add(corner);}
  rack.add(cylinder([-half+.2,2.86,0],[half-.2,2.86,0],.03));
 }
 buildRack();
 const textureLoader=new THREE.TextureLoader(),metadata=window.ARCHIVE_ASSETS,items=[],pickable=[];
 function profile(u,v,depth){return depth*(.3+.7*Math.pow(Math.max(0,Math.sin(Math.PI*u)),.7)*Math.pow(Math.max(0,Math.sin(Math.PI*v)),.45))+.008*Math.sin(u*19+v*7)*Math.sin(v*Math.PI);}
 function makeSurface(p,meta,height,back=false){const bounds=meta.bounds,width=height*(bounds.right-bounds.left)/(bounds.bottom-bounds.top)*meta.width/meta.height,positions=[],uvs=[],indices=[],columns=36,rows=52;
  for(let y=0;y<=rows;y++)for(let x=0;x<=columns;x++){const u=x/columns,v=y/rows;positions.push((u-.5)*width,-v*height,(back?-1:1)*profile(u,v,p.archive.depth));uvs.push(bounds.left+u*(bounds.right-bounds.left),1-(bounds.top+v*(bounds.bottom-bounds.top)));}
  for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){const a=y*(columns+1)+x,b=a+1,c=a+columns+1,d=c+1;if(back)indices.push(a,b,c,b,d,c);else indices.push(a,c,b,b,c,d);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();return {geometry,width};
 }
 function makeSides(p,meta,height,width){const positions=[],indices=[],points=meta.outline,b=meta.bounds;for(const point of points){const u=(point[0]-b.left)/(b.right-b.left),v=(point[1]-b.top)/(b.bottom-b.top),x=(u-.5)*width,y=-v*height,z=profile(u,v,p.archive.depth);positions.push(x,y,z,x,y,-z);}for(let i=0;i<points.length;i++){const a=i*2,b=((i+1)%points.length)*2;indices.push(a,b,a+1,b,b+1,a+1);}const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;}
 function makeHanger(p){const group=new THREE.Group();const hook=tube([[-.055,-.033,0],[-.045,.025,0],[.005,.045,0],[.054,.02,0],[.05,-.03,0],[0,-.083,0],[0,-.15,0]],.008);group.add(hook);const shoulder=p.archive.kind==='trouser'?.26:.29;group.add(tube([[0,-.14,0],[-shoulder,-.28,0],[0,-.285,0],[shoulder,-.28,0],[0,-.14,0]],.008));if(p.archive.kind==='trouser')for(const x of [-.22,.22]){const clip=new THREE.Mesh(new THREE.BoxGeometry(.055,.07,.025),chrome);clip.position.set(x,-.3,.012);group.add(clip);}return group;}
 await Promise.all(products.map(async(p,index)=>{
  const meta=metadata[p.id],texture=await textureLoader.loadAsync(p.views.front);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
  const image=texture.image,sampleCanvas=document.createElement('canvas');sampleCanvas.width=128;sampleCanvas.height=192;const ctx=sampleCanvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,128,192);const pixels=ctx.getImageData(0,0,128,192),alphaPixels=new Uint8Array(128*192*4);for(let i=0;i<128*192;i++){const a=pixels.data[i*4+3];alphaPixels.set([a,a,a,255],i*4);}const alphaMap=new THREE.DataTexture(alphaPixels,128,192);alphaMap.flipY=true;alphaMap.needsUpdate=true;
  const frontMaterial=new THREE.MeshStandardMaterial({map:texture,roughness:.95,alphaTest:.42,side:THREE.FrontSide,emissive:'#ffffff',emissiveMap:texture,emissiveIntensity:.18});
  const backMaterial=new THREE.MeshStandardMaterial({color:p.swatch,alphaMap,alphaTest:.42,roughness:1,bumpMap:grain,bumpScale:.003,side:THREE.FrontSide});
  const edgeMaterial=new THREE.MeshStandardMaterial({color:p.swatch,roughness:1,side:THREE.DoubleSide});
  const group=new THREE.Group(),body=new THREE.Group();group.position.set(0,2.86,0);group.add(makeHanger(p));body.position.y=p.archive.kind==='trouser'?-.3:-.19;group.add(body);
  const frontData=makeSurface(p,meta,p.archive.height),front=new THREE.Mesh(frontData.geometry,frontMaterial),back=new THREE.Mesh(makeSurface(p,meta,p.archive.height,true).geometry,backMaterial),edge=new THREE.Mesh(makeSides(p,meta,p.archive.height,frontData.width),edgeMaterial);body.add(front,back,edge);
  for(const mesh of [front,back]){mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.index=index;pickable.push(mesh);}
  front.customDepthMaterial=new THREE.MeshDepthMaterial({map:texture,alphaTest:.42,depthPacking:THREE.RGBADepthPacking});
  back.customDepthMaterial=new THREE.MeshDepthMaterial({alphaMap,alphaTest:.42,depthPacking:THREE.RGBADepthPacking});
  root.add(group);items[index]={p,group,body,front,width:frontData.width,pixels:pixels.data,state:{scale:1,z:0,swing:0,velocity:0},baseRotation:p.archive.angle,slot:index,visible:true};
 }));
 let filtered=items.map((_,i)=>i);
 function baseCamera(){return mobile.matches?{x:.15,y:2.1,z:7.4,lookX:0,lookY:1.5,lookZ:0}:{x:.15,y:2.15,z:8.5,lookX:0,lookY:1.45,lookZ:0};}
 function filteredPosition(index){const slot=filtered.indexOf(index),spacing=mobile.matches?.9:.83,total=filtered.length*spacing;let x=(slot-(mobile.matches?0:(filtered.length-1)/2))*spacing-motion.offset+motion.pan;const start=-total/2;return ((x-start)%total+total)%total+start;}
 function layout(dt=1/60){items.forEach((item,index)=>{const s=item.state,isSelected=index===selected,isHovered=index===hovered;const goal=isSelected?(mobile.matches?1.5/(item.p.archive.height+.35):1.62):isHovered?1.23:1;const goalZ=isSelected?2.25:isHovered?.28:0;const blend=reduced.matches?1:1-Math.exp(-dt*12);s.scale+=(goal-s.scale)*blend;s.z+=(goalZ-s.z)*blend;s.velocity+=(-s.swing*120-s.velocity*18)*dt;s.swing+=s.velocity*dt;
   item.group.scale.setScalar(s.scale);const x=filteredPosition(index);item.visible=filtered.includes(index)&&(Math.abs(x)<(mobile.matches?1.38:3.38)||isSelected);item.group.visible=item.visible&&!(hiddenSelection&&isSelected);item.group.position.x+=((isSelected?(mobile.matches?0:-camera.aspect*.62):x)-item.group.position.x)*blend;item.group.position.y+=((isSelected?(mobile.matches?3.45:2.9):2.86)-item.group.position.y)*blend;item.group.position.z=s.z;item.group.rotation.y+=((isSelected?-.02:isHovered?item.baseRotation*.12:item.baseRotation)-item.group.rotation.y)*blend;item.group.rotation.z=reduced.matches?0:s.swing+Math.sin(phase+index*.8)*.003;
  });
 }
 function projectedLabel(index){const item=items[index],point=new THREE.Vector3(0,-.2-item.p.archive.height-.10,0);item.group.localToWorld(point);point.project(camera);return {x:(point.x*.5+.5)*canvas.clientWidth,y:(-.5*point.y+.5)*canvas.clientHeight};}
 function setHovered(index){if(hovered===index)return;hovered=index;canvas.style.cursor=index>=0?'pointer':'grab';if(index>=0)items[index].state.velocity+=.045;onHover(index,index>=0?projectedLabel(index):{x:0,y:0});}
 function pick(e){if(!entered||selected>=0||drag?.moved>6)return -1;const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(pickable.filter(mesh=>items[mesh.userData.index].visible),false);
  for(const hit of hits){const item=items[hit.object.userData.index];if(!hit.uv)continue;const x=Math.max(0,Math.min(127,Math.round(hit.uv.x*127))),y=Math.max(0,Math.min(191,Math.round((1-hit.uv.y)*191)));if(item.pixels[(y*128+x)*4+3]>140)return hit.object.userData.index;}return -1;
 }
 canvas.addEventListener('pointermove',e=>{if(drag&&drag.id===e.pointerId){const dx=e.clientX-drag.x;drag.moved=Math.max(drag.moved,Math.abs(dx));if(drag.moved>6){canvas.setPointerCapture(e.pointerId);suppress=true;motion.offset=drag.offset-dx*(mobile.matches?.006:.005);setHovered(-1);}return;}if(e.pointerType==='mouse'){cursor.x=(e.clientX/canvas.clientWidth-.5);cursor.y=(e.clientY/canvas.clientHeight-.5);setHovered(pick(e));}});
 canvas.addEventListener('pointerleave',()=>{cursor.x=cursor.y=0;if(!drag)setHovered(-1)});
 canvas.addEventListener('pointerdown',e=>{if(!entered||selected>=0||e.button!==0)return;drag={id:e.pointerId,x:e.clientX,offset:motion.offset,moved:0};suppress=false;});
 function release(e){if(!drag||drag.id!==e.pointerId)return;const moved=drag.moved>6;drag=null;if(!moved){const index=pick(e);if(index>=0){if(e.pointerType==='mouse'||hovered===index)onSelect(index);else setHovered(index);}}setTimeout(()=>suppress=false,0);}
 canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',()=>{drag=null});canvas.addEventListener('lostpointercapture',()=>{drag=null});
 function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=mobile.matches?43:38;camera.updateProjectionMatrix();if(modeMobile!==mobile.matches){modeMobile=mobile.matches;motion.offset=motion.pan=0;buildRack();if(entered&&selected<0)tween(motion,baseCamera(),0);}layout();}
 new ResizeObserver(resize).observe(canvas);resize();
 function updateDetailOrigin(){if(selected<0||!detailOrigin)return;const item=items[selected],box=new THREE.Box3().setFromObject(item.body),min=new THREE.Vector3(1,1,1),max=new THREE.Vector3(-1,-1,-1);for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){const v=new THREE.Vector3(x,y,z).project(camera);min.min(v);max.max(v);}detailOrigin.style.cssText=`left:${(min.x*.5+.5)*canvas.clientWidth}px;top:${(-max.y*.5+.5)*canvas.clientHeight}px;width:${(max.x-min.x)*.5*canvas.clientWidth}px;height:${(max.y-min.y)*.5*canvas.clientHeight}px;`;}
 function render(time){if(destroyed)return;const dt=previous?Math.min((time-previous)/1000,.04):1/60;previous=time;phase+=reduced.matches?0:dt*.5;layout(dt);camera.position.set(motion.x+(reduced.matches?0:cursor.x*.22),motion.y+(reduced.matches?0:-cursor.y*.06),motion.z);camera.lookAt(motion.lookX,motion.lookY,motion.lookZ);renderer.render(scene,camera);if(hovered>=0&&selected<0)onHoverPosition(projectedLabel(hovered));updateDetailOrigin();if(!document.hidden)frame=requestAnimationFrame(render);}
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);previous=0;}else if(!destroyed){cancelAnimationFrame(frame);frame=requestAnimationFrame(render);}});
 reduced.addEventListener('change',()=>{if(reduced.matches){gs?.killTweensOf(motion);Object.assign(motion,entered?baseCamera():{x:3.4,y:2.6,z:16,lookX:0,lookY:1.35,lookZ:0});}previous=0;});
 window.addEventListener('pagehide',event=>{cancelAnimationFrame(frame);previous=0;if(!event.persisted){destroyed=true;renderer.dispose();envTarget.dispose();}});
 window.addEventListener('pageshow',event=>{if(event.persisted&&!destroyed){cancelAnimationFrame(frame);previous=0;frame=requestAnimationFrame(render);}});
 if(renderer.compileAsync)await renderer.compileAsync(scene,camera);canvas.dataset.renderer='webgl2';canvas.dataset.garments=String(items.length);canvas.dataset.ready='true';frame=requestAnimationFrame(render);
 return {
  enter(){entered=true;setHovered(-1);tween(motion,{...baseCamera()},reduced.matches?0:3.1);},
  introduction(){entered=false;selected=-1;setHovered(-1);tween(motion,{x:3.4,y:2.6,z:16,lookX:0,lookY:1.35,lookZ:0,offset:0,pan:0},2.6);},
  selectProduct(index){selected=index;setHovered(-1);tween(motion,mobile.matches?{x:0,y:2.3,z:7.4,lookX:0,lookY:1.55,lookZ:.4}:{x:.1,y:2.2,z:7,lookX:0,lookY:1.5,lookZ:.5},1.15);},
  closeProduct(){selected=-1;detailOrigin=null;tween(motion,baseCamera(),1);},
  hideSelected(value){hiddenSelection=value;},setDetailOrigin(el){detailOrigin=el;updateDetailOrigin();},
  focusPiece(index){if(!filtered.includes(index))return;const slot=filtered.indexOf(index),spacing=mobile.matches?.9:.83;tween(motion,{offset:(slot-(mobile.matches?0:(filtered.length-1)/2))*spacing,pan:0},.7);setHovered(index);},
  filter(value){filterMode=value;filtered=items.map((item,i)=>value==='layers'&&!['hoodie','jacket'].includes(item.p.archive.kind)?-1:i).filter(i=>i>=0);motion.offset=motion.pan=0;setHovered(-1);layout();},
 };
}
