const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../dist'),context={window:{}};
for(const file of ['rail-assets.js','archive-assets.js','data.js'])vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),context);
const products=context.window.PRODUCTS,capsule=products.filter(p=>!p.rail&&!p.archive),tailoring=products.filter(p=>p.rail),archive=products.filter(p=>p.archive);
assert.equal(products.length,34);assert.equal(new Set(products.map(p=>p.id)).size,34);
assert.equal(capsule.filter(p=>p.category==='Shirts').length,7);assert.equal(capsule.filter(p=>p.category==='Trousers').length,7);assert.equal(tailoring.length,12);assert.equal(archive.length,8);
const hashes=new Set();let total=0;
for(const p of products){
 assert.equal(Object.keys(p.views).length,p.singleView?1:3);assert.equal(new Set(p.sizes).size,p.sizes.length);assert(p.price>0);
 if(p.rail){assert(p.hook.x>.4&&p.hook.x<.6);assert(p.hook.y>0&&p.hook.y<.1);assert.equal(p.imageWidth,640);assert.equal(p.imageHeight,960);}
 if(p.archive){const meta=context.window.ARCHIVE_ASSETS[p.id];assert(meta);assert(meta.outline.length>20);assert(meta.bounds.left<meta.bounds.right);assert(meta.bounds.top<meta.bounds.bottom);assert(p.archive.depth>0);}
 for(const ref of Object.values(p.views)){
  const file=path.join(root,ref);assert(fs.existsSync(file),`${p.id}: missing ${ref}`);
  const bytes=fs.readFileSync(file);assert.equal(bytes.toString('ascii',8,12),'WEBP');assert(bytes.length>10000,'Asset is unexpectedly small');
  const hash=crypto.createHash('sha256').update(bytes).digest('hex');assert(!hashes.has(hash),'A photograph is duplicated');hashes.add(hash);total+=bytes.length;
 }
}
assert.equal(hashes.size,62);assert(total<6*1024*1024,'Image budget exceeded');
for(const name of fs.readdirSync(root)){
 if(name.endsWith('.js'))new vm.Script(fs.readFileSync(path.join(root,name),'utf8'),{filename:name});
 if(name.endsWith('.html'))for(const match of fs.readFileSync(path.join(root,name),'utf8').matchAll(/(?:src|href)="([^"#?]+)(?:[?#][^"]*)?"/g)){
  const ref=match[1];if(!/^(https?:|data:)/.test(ref))assert(fs.existsSync(path.join(root,ref)),`${name}: missing ${ref}`);
 }
}
console.log(`PASS: 34 products, 8 volumetric archive assets, 62 distinct WebP photographs, ${(total/1024/1024).toFixed(2)} MB; silhouettes, local links and script syntax valid.`);
