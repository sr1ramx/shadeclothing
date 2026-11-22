"""Optimize generated RGBA photographs and measure the hook pivot, without changing artwork."""
from pathlib import Path
from PIL import Image, ImageDraw
import json, shutil

root = Path(__file__).resolve().parents[1]
paths = json.loads((root.parent / 'reference-study/generated-paths.json').read_text())
out = root / 'dist/assets/tailoring'
out.mkdir(parents=True, exist_ok=True)
originals = root.parent / 'tailoring-source'
originals.mkdir(exist_ok=True)
meta = {}
sheet = Image.new('RGB', (1440, 850), '#f8f7f3')
for index, (slug, source) in enumerate(paths.items()):
    im = Image.open(source).convert('RGBA')
    shutil.copy2(source, originals / f'{slug}.png')
    alpha = im.getchannel('A')
    assert alpha.getextrema()[0] == 0, f'{slug}: transparency missing'
    strong = alpha.point(lambda value: 255 if value > 190 else 0)
    box = strong.getbbox()
    hook_y = box[1] + 4
    coords = [(x, y) for y in range(box[1], box[1] + 10) for x in range(im.width) if strong.getpixel((x, y))]
    hook_x = sum(p[0] for p in coords) / len(coords)
    optimized = im.resize((640, 960), Image.Resampling.LANCZOS)
    optimized.save(out / f'{slug}.webp', 'WEBP', quality=89, method=6)
    meta[slug] = {'width': 640, 'height': 960, 'hook': {'x': round(hook_x / im.width, 5), 'y': round(hook_y / im.height, 5)}}
    proof = Image.new('RGBA', im.size, '#f8f7f3')
    proof.alpha_composite(im)
    proof.thumbnail((230, 360))
    x, y = (index % 6) * 240, (index // 6) * 420
    sheet.paste(proof.convert('RGB'), (x + 5, y + 20))
    ImageDraw.Draw(sheet).text((x + 8, y + 385), slug, fill='#333025')
(root / 'dist/rail-assets.js').write_text('window.RAIL_ASSETS=' + json.dumps(meta, separators=(',', ':')) + ';\n')
sheet.save(root.parent / 'reference-study/tailoring-proof.jpg', quality=94)
print(f'Exported {len(meta)} photographs, {sum(p.stat().st_size for p in out.glob("*.webp"))/1024/1024:.2f} MB')
