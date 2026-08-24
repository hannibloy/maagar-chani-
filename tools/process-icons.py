#!/usr/bin/env python3
"""
עיבוד אייקונים: לוקח PNG גולמיים מ-incoming/, חותך שוליים שקופים,
מרבע, מקטין ושומר ב-site/assets/icons/ בשם הנכון.

שימוש:
    python3 tools/process-icons.py                     # מעבד כל incoming/*.png לפי שמם
    python3 tools/process-icons.py in.png motif-sun    # קובץ אחד עם שם יעד מפורש

שם קובץ ב-incoming שמתחיל בשם יעד חוקי (למשל motif-sun (3).png) מזוהה לבד.
"""
import re
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
INCOMING = ROOT / 'incoming'
OUT = ROOT / 'site' / 'assets' / 'icons'

VALID = set(
    ['menu-home', 'menu-maagar', 'menu-about', 'menu-contact'] +
    ['cluster-' + s for s in ['resilience', 'emergency', 'life-skills', 'tools',
                              'holidays', 'school-year', 'jewish', 'branding', 'more']] +
    ['motif-' + s for s in ['anchor', 'bridge', 'compass', 'breath', 'book', 'crown',
                            'matza', 'candle', 'cards', 'sun', 'tree', 'hands', 'chat',
                            'medal', 'flower', 'clock', 'shield', 'house', 'heart',
                            'star', 'palette', 'bag', 'toolbox', 'leaf']]
)
SIZE = {'menu': 256}  # ברירת מחדל לשאר: 512


def target_for(stem: str):
    stem = re.sub(r'\s*\(\d+\)$', '', stem.strip().lower())
    for name in sorted(VALID, key=len, reverse=True):
        if stem == name or stem.startswith(name):
            return name
    return None


def process(src: Path, name: str):
    im = Image.open(src).convert('RGBA')
    bbox = im.getbbox()  # חיתוך שוליים שקופים
    if bbox:
        im = im.crop(bbox)
    # ריבוע עם ~8% שוליים
    side = max(im.size)
    pad = int(side * 0.08)
    canvas = Image.new('RGBA', (side + 2 * pad,) * 2, (0, 0, 0, 0))
    canvas.paste(im, ((canvas.width - im.width) // 2, (canvas.height - im.height) // 2), im)
    size = SIZE.get(name.split('-')[0], 512)
    canvas = canvas.resize((size, size), Image.LANCZOS)
    OUT.mkdir(parents=True, exist_ok=True)
    out = OUT / f'{name}.png'
    canvas.save(out, 'PNG', optimize=True)
    print(f'✓ {src.name} → {out.relative_to(ROOT)} ({out.stat().st_size // 1024}KB)')


def main():
    if len(sys.argv) == 3:
        name = sys.argv[2]
        if name not in VALID:
            sys.exit(f'שם יעד לא מוכר: {name}\nהשמות החוקיים ב-site/assets/icons/README.md')
        process(Path(sys.argv[1]), name)
        return

    files = sorted(INCOMING.glob('*.png')) if INCOMING.exists() else []
    if not files:
        sys.exit(f'אין קבצי PNG ב-{INCOMING.relative_to(ROOT)}/')
    done = skipped = 0
    for f in files:
        name = target_for(f.stem)
        if name:
            process(f, name)
            done += 1
        else:
            print(f'? {f.name} — לא זוהה שם יעד, דילגתי (אפשר לעבד ידנית: process-icons.py "{f}" motif-x)')
            skipped += 1
    print(f'\n{done} עובדו, {skipped} דולגו')


if __name__ == '__main__':
    main()
