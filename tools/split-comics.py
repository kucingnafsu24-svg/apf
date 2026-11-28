#!/usr/bin/env python3
"""
Memisahkan komik dari data/posts.json ke data/comic.json.

Pakai (dari folder proyek):
    python tools/split-comics.py                 # membaca data/posts.json
    python tools/split-comics.py path/posts.json # atau tentukan file sendiri

Hasil:
    data/posts.json        -> hanya post biasa
    data/comic.json        -> hanya komik
    data/posts.backup.json -> salinan posts.json asli (aman, tidak ditimpa bila sudah ada)

Sebuah post dianggap komik bila salah satu nama grup tag, nilai tag, atau label-nya
adalah Manga / Komik / Comic (huruf besar/kecil bebas) - sama seperti aturan lama di
config.js (postTypes.comic). Ubah daftar lewat --types, mis. --types Manga,Manhwa
"""
import argparse, json, os, shutil, sys

p = argparse.ArgumentParser()
p.add_argument('src', nargs='?', default='data/posts.json')
p.add_argument('--types', default='Manga,Komik,Comic')
p.add_argument('--dry', action='store_true', help='hanya hitung, tidak menulis file')
a = p.parse_args()

types = {t.strip().lower() for t in a.types.split(',') if t.strip()}
d = os.path.dirname(os.path.abspath(a.src))

with open(a.src, encoding='utf-8-sig') as f:
    raw = json.load(f)
wrapped = isinstance(raw, dict) and isinstance(raw.get('posts'), list)
items = raw['posts'] if wrapped else raw
if not isinstance(items, list):
    sys.exit('Format tidak dikenal: posts.json harus berupa daftar [ ... ] atau {"posts":[ ... ]}')

def is_comic(x):
    if not isinstance(x, dict):
        return False
    vals = []
    tags = x.get('tags')
    if isinstance(tags, dict):
        for k, v in tags.items():
            vals.append(str(k))
            vals += [str(i) for i in (v if isinstance(v, list) else [v])]
    vals += [str(l) for l in (x.get('labels') or [])]
    return any(v.strip().lower() in types for v in vals)

posts = [x for x in items if not is_comic(x)]
comics = [x for x in items if is_comic(x)]

slug = lambda x: str(x.get('slug') or x.get('title', '')).strip().lower()
dup = sorted({slug(x) for x in comics} & {slug(x) for x in posts})
print('Total entri : %d' % len(items))
print('Post biasa  : %d' % len(posts))
print('Komik       : %d' % len(comics))
if dup:
    print('\nPERINGATAN: slug yang sama ada di post DAN komik (komentar/simpanan akan tercampur):')
    for s in dup: print('  -', s)

if a.dry:
    sys.exit(0)

bak = os.path.join(d, 'posts.backup.json')
if not os.path.exists(bak):
    shutil.copyfile(a.src, bak)
dump = lambda path, data: open(path, 'w', encoding='utf-8').write(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
dump(a.src, {**raw, 'posts': posts} if wrapped else posts)
dump(os.path.join(d, 'comic.json'), comics)
print('\nSelesai: %s dan %s ditulis.' % (a.src, os.path.join(d, 'comic.json')))
