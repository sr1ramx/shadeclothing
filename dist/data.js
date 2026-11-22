// The Atelier capsule: fourteen individual designs, each photographed in three views.
const CAPSULE=[
 ['essential-oxford','Ivory Oxford Shirt','Shirts',2190,'shirt-01','Warm ivory','#e8e1d0','Cotton Oxford','Regular','A button-down collar, a clean chest pocket and a softly curved hem. A considered everyday essential.'],
 ['coastal-linen','Coastal Linen Shirt','Shirts',2490,'shirt-02','Stone','#bdb19b','Linen','Relaxed','Light, tactile linen with an open spread collar and an easy silhouette.'],
 ['moss-camp-shirt','Moss Camp Collar Shirt','Shirts',2290,'shirt-03','Muted olive','#6f7860','Linen-cotton blend','Relaxed','A relaxed camp collar and short sleeves, finished with a clean straight hem.'],
 ['navy-poplin','Navy Poplin Shirt','Shirts',2390,'shirt-04','Deep navy','#283340','Cotton poplin','Tailored','A sharp collar, clean placket and smooth poplin texture for a refined outline.'],
 ['blue-stripe-oxford','Blue Stripe Oxford','Shirts',2490,'shirt-05','Chalk blue stripe','#a7b6bd','Striped cotton Oxford','Regular','Fine blue and ivory stripes bring quiet character to a timeless button-down.'],
 ['black-twill-overshirt','Black Twill Overshirt','Shirts',3290,'shirt-06','Washed black','#30332f','Cotton twill','Relaxed','Substantial twill, two chest pockets and room for a light layer beneath.'],
 ['ecru-resort-shirt','Ecru Textured Shirt','Shirts',2590,'shirt-07','Ecru','#d9d2bc','Textured cotton','Relaxed','An easy short-sleeved shirt with a soft resort collar and a tactile weave.'],
 ['pleated-trouser','Charcoal Pleated Trouser','Trousers',2890,'pant-01','Charcoal','#484b47','Woven suiting blend','Relaxed tapered','A generous top block, single pleat and clean tapered leg.'],
 ['stone-chino','Stone Straight Chino','Trousers',2690,'pant-02','Stone','#b5a88e','Cotton twill','Straight','A clean flat front and straight leg in a versatile stone cotton twill.'],
 ['olive-cargo','Olive Utility Trouser','Trousers',2990,'pant-03','Deep olive','#636c52','Cotton ripstop','Relaxed','Subtle cargo pockets and an easy, practical shape without unnecessary bulk.'],
 ['navy-tailored-trouser','Navy Tailored Trouser','Trousers',3190,'pant-04','Deep navy','#2b3542','Woven suiting blend','Tailored','A defined crease and a refined taper for days that call for a little structure.'],
 ['black-wide-leg','Black Wide Leg Trouser','Trousers',2990,'pant-05','Black','#292b28','Draped woven blend','Wide leg','An understated wide-leg silhouette with a fluid drape and a clean waistband.'],
 ['washed-indigo-denim','Washed Indigo Denim','Trousers',3290,'pant-06','Washed indigo','#53677c','Cotton denim','Straight','Classic five-pocket construction with a gentle wash and an effortless straight leg.'],
 ['cream-linen-trouser','Cream Linen Trouser','Trousers',2990,'pant-07','Warm cream','#d9d3bc','Linen blend','Relaxed','Soft linen texture, a relaxed leg and a drawcord waist for an easy off-duty rhythm.']
];
window.PRODUCTS=CAPSULE.map((a,i)=>({id:a[0],name:a[1],category:a[2],price:a[3],asset:i,color:a[5],swatch:a[6],fabric:a[7],fit:a[8],description:a[9],views:Object.fromEntries(['front','side','back'].map(v=>[v,`assets/atelier/${a[4]}-${v}.webp`])),sizes:a[2]==='Trousers'?['28','30','32','34','36']:['S','M','L','XL','XXL'],sku:'SHD-A'+String(i+1).padStart(2,'0'),care:a[7].includes('suiting')||a[7].includes('Draped')?'Professional dry clean recommended. Store on a shaped trouser hanger.':'Gentle cold wash with similar colors. Dry in shade. Iron on reverse at low heat.',note:'Generated sample design. Front, side and back views show the same illustrative garment.'}));
