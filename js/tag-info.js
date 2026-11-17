/* Kartu info di halaman tag (mis. /tag/Mori%20Calliope, /cosplayer/Nama, /?tag=tag:Nama).
   Data dari /data/tag-info.json, kuncinya "grup:nama" huruf kecil semua, contoh "tag:mori calliope".
   Isi: name?, banner? (gambar lebar di atas kartu), image?, desc? (\n = paragraf baru), info? {Label:Isi}, links? [{url, name?, type?, icon?}] (logo otomatis dari alamat: youtube, x/twitter, pixiv, fanbox, patreon, discord, tiktok, instagram, facebook, threads), more? (alamat /g/slug untuk halaman detail lengkap) */
(function(){
 var list=document.getElementById('posts');
 if(!list)return;                                   /* hanya di index.html */
 var G=['artist','genre','category','parody','tag','cosplayer','game pc','language','publisher','developer','vtubers'];
 function key(){
  var q=new URLSearchParams(location.search).get('tag');
  if(q){var i=q.indexOf(':');if(i<1)return '';var g=q.slice(0,i).toLowerCase();if(g==='file')g='category';return g+':'+q.slice(i+1).toLowerCase()}
  var m=location.pathname.match(/^\/([^\/]+)\/([^\/]+)\/?$/);if(!m)return '';
  try{var g2=decodeURIComponent(m[1]).toLowerCase().replace(/-/g,' '),v=decodeURIComponent(m[2]).toLowerCase()}catch(e){return ''}
  return G.indexOf(g2)>-1?g2+':'+v:''}
 var k=key();if(!k)return;
 var safe=function(u){return typeof u==='string'&&/^(https?:\/\/|\/(?!\/))/.test(u)};
 function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}

 /* logo sosial media (SVG sederhana, warna mengikuti class .ic-<nama>) */
 var IC={
  youtube:'<path fill-rule="evenodd" d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.3 5 12 5 12 5s-6.3 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.7 2 12 2 12s0 3.300.4 4.800a2.500 2.500 0 0 0 1.800 1.800C5.700 19 12 19 12 19s6.300 0 7.800-.4a2.500 2.500 0 0 0 1.800-1.800c.4-1.500.4-4.800.4-4.800s0-3.300-.4-4.800zM10 15V9l5.200 3z"/>',
  x:'<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>',
  instagram:'<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.500" cy="6.500" r="1.200"/>',
  facebook:'<path d="M13.500 21v-7.500h2.600l.4-3h-3V8.600c0-.9.3-1.500 1.500-1.500h1.600V4.400c-.3 0-1.200-.1-2.300-.1-2.300 0-3.800 1.400-3.800 3.900v2.300H7.900v3h2.600V21z"/>',
  discord:'<path d="M19.300 5.300A16 16 0 0 0 15.400 4l-.5 1a15 15 0 0 0-4.800 0L9.600 4a16 16 0 0 0-3.900 1.300C3.200 9 2.500 12.600 2.900 16.100a16 16 0 0 0 4.800 2.400l1-1.600c-.6-.2-1.100-.5-1.600-.8l.4-.3a11.500 11.500 0 0 0 9.800 0l.4.3c-.5.3-1 .6-1.600.8l1 1.600a16 16 0 0 0 4.800-2.400c.5-4.100-.8-7.600-2.700-10.800zM9.300 14c-.9 0-1.600-.8-1.600-1.800s.7-1.800 1.600-1.800 1.600.8 1.600 1.800-.7 1.800-1.600 1.800zm5.400 0c-.9 0-1.600-.8-1.600-1.800s.7-1.800 1.600-1.800 1.600.8 1.600 1.800-.7 1.800-1.600 1.800z"/>',
  tiktok:'<path d="M14 4v10.500a3.500 3.500 0 1 1-3.500-3.500M14 4c.3 2.400 2 4 4.500 4.200" fill="none" stroke="currentColor" stroke-width="2.200" stroke-linecap="round" stroke-linejoin="round"/>',
  threads:'<text x="12" y="17.500" text-anchor="middle" font-size="17" font-weight="700" font-family="Arial,sans-serif">@</text>',
  patreon:'<circle cx="15" cy="9.500" r="5.500"/><rect x="3" y="3" width="3.500" height="18" rx=".6"/>',
  pixiv:'<rect x="2" y="2" width="20" height="20" rx="5"/><text x="12" y="17" text-anchor="middle" font-size="14" font-weight="800" fill="#fff" font-family="Arial,sans-serif">p</text>',
  fanbox:'<rect x="2" y="2" width="20" height="20" rx="5"/><text x="12" y="17" text-anchor="middle" font-size="14" font-weight="800" fill="#fff" font-family="Arial,sans-serif">F</text>',
  link:'<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" fill="none" stroke="currentColor" stroke-width="1.600"/>'
 };
 var NM={youtube:'YouTube',x:'X',instagram:'Instagram',facebook:'Facebook',discord:'Discord',tiktok:'TikTok',threads:'Threads',patreon:'Patreon',pixiv:'Pixiv',fanbox:'Pixiv Fanbox',link:'Link'};
 function kind(u){
  var h='',p='';try{var x=new URL(u,location.href);h=x.hostname.replace(/^www\./,'').toLowerCase();p=x.pathname.toLowerCase()}catch(e){}
  if(/(^|\.)(youtube\.com|youtu\.be)$/.test(h))return 'youtube';
  if(/(^|\.)(x\.com|twitter\.com)$/.test(h))return 'x';
  if(/(^|\.)fanbox\.cc$/.test(h)||(/(^|\.)pixiv\.net$/.test(h)&&p.indexOf('fanbox')>-1))return 'fanbox';
  if(/(^|\.)pixiv\.net$/.test(h))return 'pixiv';
  if(/(^|\.)patreon\.com$/.test(h))return 'patreon';
  if(/(^|\.)(discord\.gg|discord\.com)$/.test(h))return 'discord';
  if(/(^|\.)tiktok\.com$/.test(h))return 'tiktok';
  if(/(^|\.)instagram\.com$/.test(h))return 'instagram';
  if(/(^|\.)(facebook\.com|fb\.com|fb\.me)$/.test(h))return 'facebook';
  if(/(^|\.)(threads\.net|threads\.com)$/.test(h))return 'threads';
  return 'link'}
 function icon(k){
  var s=el('span','ti-ic ic-'+k);
  s.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">'+(IC[k]||IC.link)+'</svg>';
  return s}

 var s=document.createElement('style');
 s.textContent='.ti{margin:0 0 20px;border:1px solid var(--line);border-radius:12px;background:var(--card);overflow:hidden}'+
  '.ti-bn{display:block;width:100%;aspect-ratio:16/5;max-height:240px;object-fit:cover;background:var(--line)}'+
  '.ti-in{display:flex;gap:16px;padding:16px}'+
  '.ti.has-bn .ti-img{margin-top:-48px;border:3px solid var(--card)}'+
  '.ti-img{flex:none;width:96px;height:96px;border-radius:50%;object-fit:cover;background:var(--line)}'+
  '.ti-b{min-width:0;flex:1}'+
  '.ti h3{margin:0 0 6px;font-size:18px;font-weight:600;color:var(--head)}'+
  '.ti p{margin:0 0 8px;font-size:14px;line-height:1.6;color:var(--head)}'+
  '.ti dl{display:grid;grid-template-columns:auto 1fr;gap:4px 14px;margin:10px 0;font-size:13px}'+
  '.ti dt{color:var(--alt);font-weight:600}.ti dd{margin:0;color:var(--head);overflow-wrap:anywhere}'+
  '.ti-l{display:flex;flex-direction:column;align-items:stretch;gap:8px;flex:none;width:176px}'+
  '.ti-l a{display:flex;align-items:center;gap:7px;padding:6px 12px;border:1px solid var(--line);border-radius:999px;font-size:13px;font-weight:600;color:var(--head)}'+
  '.ti-ic{display:inline-flex;flex:none;line-height:0}.ti-ic img{display:block;width:18px;height:18px;object-fit:contain}'+
  '.ic-youtube{color:#f00}.ic-x,.ic-threads,.ic-tiktok{color:var(--head)}.ic-instagram{color:#e4405f}.ic-facebook{color:#1877f2}.ic-discord{color:#5865f2}.ic-patreon{color:#ff424d}.ic-pixiv,.ic-fanbox{color:#0096fa}.ic-link{color:var(--alt)}'+
  '.ti-l a:hover{border-color:var(--link)}'+
  '@media(max-width:560px){.ti-bn{aspect-ratio:16/7}.ti-in{flex-direction:column;align-items:center;text-align:center}.ti dl{text-align:left}.ti-l{width:100%;max-width:320px}}';
 document.head.appendChild(s);

 fetch('/data/tag-info.json',{cache:'no-cache'}).then(function(r){return r.json()}).then(function(d){
  var o=d&&d[k];if(!o||typeof o!=='object')return;
  var box=el('div','ti'),inn=el('div','ti-in');
  if(safe(o.banner)){var bn=el('img','ti-bn');bn.src=o.banner;bn.alt='';bn.onerror=function(){bn.remove();box.classList.remove('has-bn')};box.appendChild(bn);box.classList.add('has-bn')}
  if(safe(o.image)){var im=el('img','ti-img');im.alt='';im.width=96;im.height=96;im.onerror=function(){im.remove()};im.src=o.image;inn.appendChild(im)}
  var b=el('div','ti-b');
  b.appendChild(el('h3','',String(o.name||k.slice(k.indexOf(':')+1))));
  if(o.desc)String(o.desc).split('\n').forEach(function(t){if(t.trim())b.appendChild(el('p','',t))});
  if(o.info&&typeof o.info==='object'){
   var dl=el('dl');Object.keys(o.info).forEach(function(n){dl.appendChild(el('dt','',n));dl.appendChild(el('dd','',String(o.info[n])))});b.appendChild(dl)}
  var L=[].concat(o.links||[]);if(safe(o.more))L.push({name:'Info lengkap',url:o.more,self:1});
  var W=null;
  if(L.length){var w=el('div','ti-l');L.forEach(function(l){
   if(!l||!safe(l.url))return;
   var k=l.self?'':(IC[l.type]?l.type:kind(l.url)),a=el('a');a.href=l.url;
   if(k||l.icon){
    if(safe(l.icon)){var ic=el('span','ti-ic'),ii=el('img');ii.alt='';ii.onerror=function(){ic.remove()};ii.src=l.icon;ic.appendChild(ii);a.appendChild(ic)}
    else a.appendChild(icon(k))}
   a.appendChild(document.createTextNode(String(l.name||(k&&NM[k])||l.url)));
   if(!l.self){a.target='_blank';a.rel='noopener'}w.appendChild(a)});W=w}
  inn.appendChild(b);if(W)inn.appendChild(W);box.appendChild(inn);
  var t=document.querySelector('.title');
  if(t&&t.parentNode)t.parentNode.insertBefore(box,t);else list.parentNode.insertBefore(box,list);
 }).catch(function(){});
})();
