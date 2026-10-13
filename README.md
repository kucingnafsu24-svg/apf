# Fletro Pro — Versi Web (Vercel)

Situs statis, tanpa build. Deploy: `vercel` (framework preset: Other) atau import repo ke Vercel.

- `data/posts.json` — semua artikel (tambah objek baru = artikel baru, URL `/post/<slug>`)
- `css/style.css` — tampilan & tema
- `js/app.js` — render daftar, detail, label, pencarian, dark mode

Field artikel: image? (URL gambar sampul), featured? (tampil di slider), slug, title, author, labels[], date (YYYY-MM-DD), comments, excerpt, thumb{cls,title,sub}, content (HTML), sponsored?, fullpage?
Tes lokal: `npx vercel dev` (rewrite /post/:slug butuh vercel.json).
