"""Optimize photographic textures and derive silhouettes for volumetric cloth meshes."""
from pathlib import Path
from PIL import Image, ImageDraw
import json, shutil, cv2
import numpy as np

root = Path(__file__).resolve().parents[1]
paths = json.loads((root.parent / 'archive-reference/generated-paths.json').read_text())
out = root / 'dist/assets/archive'
out.mkdir(parents=True, exist_ok=True)
originals = root.parent / 'archive-source'
originals.mkdir(exist_ok=True)
metadata = {}
sheet = Image.new('RGB', (1200, 900), '#d8d8d4')
for i, (slug, source) in enumerate(paths.items()):
    image = Image.open(source).convert('RGBA')
    assert image.getchannel('A').getextrema()[0] == 0
    shutil.copy2(source, originals / f'{slug}.png')
    optimized = image.resize((640, 960), Image.Resampling.LANCZOS)
    optimized.save(out / f'{slug}.webp', 'WEBP', quality=90, method=6)
    mask = (np.array(optimized)[:, :, 3] > 180).astype(np.uint8) * 255
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    contour = max(contours, key=cv2.contourArea)
    contour = cv2.approxPolyDP(contour, 1.25, True)
    x, y, w, h = cv2.boundingRect(contour)
    metadata[slug] = {'width': 640, 'height': 960, 'bounds': {'left': x/640, 'top': y/960, 'right': (x+w)/640, 'bottom': (y+h)/960}, 'outline': [[round(float(p[0][0])/640, 5), round(float(p[0][1])/960, 5)] for p in contour]}
    proof = Image.new('RGBA', image.size, '#d8d8d4')
    proof.alpha_composite(image)
    proof.thumbnail((290, 410))
    sheet.paste(proof.convert('RGB'), ((i % 4) * 300 + 5, (i // 4) * 450))
    ImageDraw.Draw(sheet).text(((i % 4) * 300 + 8, (i // 4) * 450 + 420), slug, fill='#222222')
(root / 'dist/archive-assets.js').write_text('window.ARCHIVE_ASSETS=' + json.dumps(metadata, separators=(',', ':')) + ';\n')
sheet.save(root.parent / 'archive-reference/artwork-proof.jpg', quality=94)
print(f'Exported {len(metadata)} photographs with mesh outlines, {sum(p.stat().st_size for p in out.glob("*.webp"))/1024/1024:.2f} MB')
