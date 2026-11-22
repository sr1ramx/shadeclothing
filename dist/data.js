const BASE = [
['studio-chore-jacket','Studio Chore Jacket','Outerwear',3490,0,'Muted olive','Cotton canvas','Relaxed','A softly structured layer with three patch pockets, clean buttons, and room for your everyday essentials.'],
['essential-oxford','Essential Oxford Shirt','Shirts',1890,1,'Warm ivory','Cotton Oxford weave','Regular','A clean button-down collar, curved hem and crisp texture make this a wardrobe constant.'],
['pleated-trouser','Pleated Tailored Trouser','Trousers',2690,2,'Charcoal','Woven suiting blend','Relaxed tapered','A generous top block, sharp front pleat and tapered leg balance comfort with a considered silhouette.'],
['modern-suit-jacket','Modern Suit Jacket','Tailoring',6490,3,'Deep navy','Textured suiting blend','Tailored','A two-button jacket with notch lapels, subtle shaping and a versatile single-breasted profile.'],
['longline-overcoat','Longline Overcoat','Outerwear',7990,4,'Warm taupe','Wool-effect woven blend','Oversized','A long, easy silhouette with broad lapels and deep pockets for effortless layering.'],
['textured-knit-polo','Textured Knit Polo','Polos',2290,5,'Terracotta','Cotton knit','Regular','An open, easy collar and textured knit lend everyday dressing a refined point of view.'],
['urban-graphic-tee','Urban Graphic Tee','T-shirts',1290,6,'Washed charcoal','Cotton jersey','Oversized','A relaxed graphic tee with a dropped shoulder and a statement print on the reverse.'],
['archive-hoodie','Archive Heavyweight Hoodie','Sweatshirts',2990,7,'Sage green','Cotton fleece','Oversized','A roomy hood, kangaroo pocket and ribbed cuffs bring shape to a laid-back staple.'],
['flight-bomber','Flight Bomber Jacket','Outerwear',4490,8,'Black','Nylon-effect shell','Regular','A zip-front bomber with ribbed edges, a sleeve pocket and contrasting lining.'],
['washed-denim-jacket','Washed Denim Jacket','Denim',3690,9,'Vintage blue','Cotton denim','Relaxed','Classic chest pockets and a lived-in wash, designed for easy layering over tees.'],
['utility-cargo-pant','Utility Cargo Pant','Trousers',2790,10,'Graphite','Cotton twill','Relaxed','Utility pockets, an adjustable waist and a tapered leg with practical detailing.'],
['straight-denim','Straight Leg Denim','Denim',2890,11,'Washed indigo','Cotton denim','Straight','A classic five-pocket jean with an easy straight leg and a softly faded finish.'],
['weekend-oxford','Weekend Oxford','Shirts',2190,1,'Ivory','Cotton Oxford weave','Relaxed','A looser take on the Oxford, made for wearing open over a tee or loosely tucked.'],
['utility-overshirt','Utility Overshirt','Shirts',2990,0,'Olive','Cotton canvas','Relaxed','Workwear-inspired pockets and a clean collar give this transitional layer its character.'],
['evening-blazer','Evening Blazer','Tailoring',5490,3,'Midnight navy','Woven suiting blend','Tailored','A softly tailored blazer for dinners, events, and evenings with a little more presence.'],
['city-coat','City Layer Coat','Outerwear',6990,4,'Taupe','Brushed woven blend','Relaxed','An easy coat with a generous cut to accommodate knitwear and tailoring beneath.'],
['everyday-pant','Everyday Straight Pant','Trousers',2490,2,'Dark charcoal','Woven suiting blend','Straight','A clean, understated trouser with a straight profile for your daily rotation.'],
['weekender-polo','Weekender Knit Polo','Polos',1990,5,'Burnt clay','Cotton knit','Relaxed','A relaxed knit polo that sits comfortably between casual and dressed-up.']
];
window.PRODUCTS=BASE.map((a,i)=>({id:a[0],name:a[1],category:a[2],price:a[3],asset:a[4],color:a[5],fabric:a[6],fit:a[7],description:a[8],sizes:['S','M','L','XL','XXL'],sku:'SHD-'+String(i+1).padStart(3,'0'),care:a[2]==='Tailoring'||a[4]===4?'Professional dry clean recommended. Store on a shaped hanger.':'Gentle cold wash with similar colors. Dry in shade. Iron on reverse at low heat.',note:i>=12?'Style study: imagery shares the silhouette of the studio collection.':'Sample design with illustrative front and back imagery.'}));
