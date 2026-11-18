/* Kartu info di halaman tag (mis. /tag/Mori%20Calliope, /cosplayer/Nama, /?tag=tag:Nama).
   Data dari /data/tag-info.json, kuncinya "grup:nama" huruf kecil semua, contoh "tag:mori calliope".
   Isi: name?, banner? (gambar lebar di atas kartu), image?, desc? (\n = paragraf baru), info? {Label:Isi}, tabs? (false = sembunyikan; atau daftar mis. ["post","video"]; bawaan: post, livestream, video), links? [{url, name?, type?, icon?}] (logo otomatis dari alamat: youtube, x/twitter, pixiv, fanbox, patreon, discord, tiktok, instagram, facebook, threads), more? (alamat /g/slug untuk halaman detail lengkap) */
(function(){
 var list=document.getElementById('posts');
 if(!list)return;                                   /* hanya di index.html */
 var G=['artist','genre','category','parody','tag','cosplayer','game pc','language','publisher','developer','vtubers','youtubers'];
 /* samakan bentuk kunci: huruf kecil, spasi rapi, "file" = "category" */
 function norm(s){
  s=String(s||'');var i=s.indexOf(':');if(i<1)return '';
  var g=s.slice(0,i).trim().toLowerCase().replace(/[-_]+/g,' ').replace(/\s+/g,' '),v=s.slice(i+1).trim().toLowerCase().replace(/\s+/g,' ');
  if(g==='file')g='category';return g+':'+v}
 function key(){
  var q=new URLSearchParams(location.search).get('tag');
  if(q)return norm(q);
  var m=location.pathname.match(/^\/([^\/]+)\/([^\/]+)\/?$/);if(!m)return '';
  try{var g2=decodeURIComponent(m[1]).toLowerCase().replace(/-/g,' '),v=decodeURIComponent(m[2])}catch(e){return ''}
  return G.indexOf(g2)>-1?norm(g2+':'+v):''}
 var k=key();if(!k)return;
 var safe=function(u){return typeof u==='string'&&/^(https?:\/\/|\/(?!\/))/.test(u)};
 function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}

 /* logo sosial media: kotak berwarna seragam + simbol putih (SVG inline) */
 var IC={
  youtube:'<path fill="currentColor" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.600 12 3.600 12 3.600s-7.500 0-9.400.5A3 3 0 0 0 .5 6.200C0 8.100 0 12 0 12s0 3.900.5 5.800a3 3 0 0 0 2.100 2.100c1.900.5 9.400.5 9.400.5s7.500 0 9.400-.5a3 3 0 0 0 2.100-2.100c.5-1.900.5-5.800.5-5.800s0-3.900-.5-5.800zM9.600 15.600V8.400l6.200 3.600z"/>',
  x:'<path fill="currentColor" transform="translate(2 2) scale(.8)" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>',
  instagram:'<defs><linearGradient id="tiIg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#fdc468"/><stop offset=".35" stop-color="#f77737"/><stop offset=".65" stop-color="#d62976"/><stop offset="1" stop-color="#5851db"/></linearGradient></defs><rect width="24" height="24" rx="6" fill="url(#tiIg)"/><rect x="5.6" y="5.6" width="12.8" height="12.8" rx="4" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="12" cy="12" r="3.1" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="16.1" cy="7.9" r="1.05" fill="#fff"/>',
  facebook:'<rect width="24" height="24" rx="6" fill="#1877f2"/><path fill="#fff" d="M13.2 20.5v-7.3h2.4l.4-2.8h-2.8V8.7c0-.8.3-1.4 1.4-1.4h1.5V4.8c-.3 0-1.1-.1-2.1-.1-2.2 0-3.7 1.300-3.700 3.800v1.900H7.900v2.800h2.400v7.300z"/>',
  discord:'<rect width="24" height="24" rx="6" fill="#5865f2"/><path fill="#fff" transform="translate(3.6 3.8) scale(.7)" d="M19.3 5.3A16 16 0 0 0 15.4 4l-.5 1a15 15 0 0 0-4.8 0L9.6 4a16 16 0 0 0-3.9 1.3C3.2 9 2.5 12.6 2.9 16.1a16 16 0 0 0 4.8 2.4l1-1.6c-.6-.2-1.1-.5-1.6-.8l.4-.3a11.5 11.5 0 0 0 9.8 0l.4.3c-.5.3-1 .6-1.6.8l1 1.6a16 16 0 0 0 4.8-2.4c.5-4.1-.8-7.6-2.7-10.8zM9.3 14c-.9 0-1.6-.8-1.6-1.8s.7-1.8 1.6-1.8 1.6.8 1.6 1.8-.7 1.8-1.6 1.8zm5.4 0c-.9 0-1.6-.8-1.6-1.8s.7-1.8 1.6-1.8 1.6.8 1.6 1.8-.7 1.8-1.6 1.8z"/>',
  tiktok:'<path transform="translate(2.5 2.5) scale(.8)" d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5M14 4c.3 2.4 2 4 4.5 4.2" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
  threads:'<path d="M16.4 10.6c-.3-2.300-1.800-3.600-4.300-3.600-2.800 0-4.400 1.900-4.400 5s1.600 5 4.400 5c2.400 0 3.800-1.200 3.800-2.900 0-1.700-1.400-2.600-3.200-2.600-1.400 0-2.300.7-2.300 1.600 0 .9.700 1.400 1.600 1.400 1.600 0 2.400-1.100 2.400-3.200" fill="none" stroke="currentColor" stroke-width="1.700" stroke-linecap="round" stroke-linejoin="round"/>',
  patreon:'<rect width="24" height="24" rx="6" fill="#ff424d"/><circle cx="14.2" cy="10.2" r="4.6" fill="#fff"/><rect x="5.5" y="5.6" width="3.3" height="12.8" rx=".6" fill="#fff"/>',
  pixiv:'<rect width="24" height="24" rx="6" fill="#0096fa"/><rect x="8" y="7" width="2.5" height="11" fill="#fff"/><circle cx="13.4" cy="10.9" r="3.1" fill="none" stroke="#fff" stroke-width="2.4"/>',
  fanbox:'<rect width="24" height="24" rx="6" fill="#0096fa"/><path fill="#fff" d="M8 6.400h8.600v2.500h-6v2.300h5v2.500h-5V18H8z"/>',
  link:'<rect width="24" height="24" rx="6" fill="#6b7280"/><circle cx="12" cy="12" r="6.200" fill="none" stroke="#fff" stroke-width="1.600"/><path d="M5.800 12h12.400M12 5.800c2 2 2 10.400 0 12.400M12 5.800c-2 2-2 10.400 0 12.400" fill="none" stroke="#fff" stroke-width="1.300"/>'
 };
 var NM={youtube:'YouTube',x:'X',instagram:'Instagram',facebook:'Facebook',discord:'Discord',tiktok:'TikTok',threads:'Threads',patreon:'Patreon',pixiv:'Pixiv',fanbox:'Pixiv Fanbox',tako:'Tako',trakteer:'Trakteer',saweria:'Saweria',linktree:'Linktree',iwara:'Iwara',subscribestar:'SubscribeStar',bluesky:'Bluesky',spotify:'Spotify',applemusic:'Apple Music',bandcamp:'Bandcamp',link:'Link'};
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
  if(/(^|\.)tako\.id$/.test(h))return 'tako';
  if(/(^|\.)trakteer\.id$/.test(h))return 'trakteer';
  if(/(^|\.)saweria\.co$/.test(h))return 'saweria';
  if(/(^|\.)linktr\.ee$/.test(h))return 'linktree';
  if(/(^|\.)iwara\.tv$/.test(h))return 'iwara';
  if(/(^|\.)subscribestar\.(adult|com)$/.test(h))return 'subscribestar';
  if(/(^|\.)(bsky\.app|bsky\.social)$/.test(h))return 'bluesky';
  if(/(^|\.)spotify\.com$/.test(h))return 'spotify';
  if(/(^|\.)music\.apple\.com$/.test(h))return 'applemusic';
  if(/(^|\.)bandcamp\.com$/.test(h))return 'bandcamp';
  return 'link'}
 /* Logo resmi: taruh filenya di /images/icons/<nama>.svg (atau .png / .webp), mis. facebook.svg, tiktok.svg.
    Folder bisa diganti lewat iconDir di config.js. Bila file tidak ada, dipakai ikon bawaan (kotak berwarna). */
 var ICD=String((window.APF_CONFIG&&window.APF_CONFIG.iconDir)||'/images/icons/').replace(/\/?$/,'/');
 var ICF={},ICW={};
 function logoUrl(k,cb){
  if(k in ICF)return cb(ICF[k]);
  if(ICW[k])return ICW[k].push(cb);
  ICW[k]=[cb];
  var ex=['svg','png','webp'],i=0;
  function fin(){var w=ICW[k];delete ICW[k];w.forEach(function(f){f(ICF[k])})}
  (function next(){
   if(i>=ex.length){ICF[k]='';fin();return}
   var im=new Image(),u=ICD+k+'.'+ex[i++];
   im.onload=function(){ICF[k]=u;fin()};im.onerror=next;im.src=u})()}
 var MONO={youtube:1,x:1,tiktok:1,threads:1}; /* ikut warna tema (currentColor) */
 function icon(k){
  var s=el('span','ti-ic ic-'+k);
  s.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">'+(IC[k]||IC.link)+'</svg>';
  logoUrl(k,function(u){if(!u)return;
   if(MONO[k]){s.classList.add('ti-m');s.style.setProperty('--m','url("'+u+'")');s.innerHTML='';return}
   var im=new Image();im.alt='';im.width=20;im.height=20;im.src=u;s.innerHTML='';s.appendChild(im)});
  return s}


 /* teks deskripsi: tautan <a href="..."> dan alamat http(s) otomatis jadi link; tag HTML lain dibuang */
 function alink(p,u,txt){
  if(!/^https?:\/\//i.test(u)){p.appendChild(document.createTextNode(txt));return}
  var a=el('a','',txt||u);a.href=u;a.target='_blank';a.rel='noopener nofollow';p.appendChild(a)}
 function plain(p,txt){
  txt=txt.replace(/<[^>]*>/g,'');
  var re=/https?:\/\/[^\s<]+/g,last=0,m;
  while((m=re.exec(txt))){p.appendChild(document.createTextNode(txt.slice(last,m.index)));alink(p,m[0],m[0]);last=re.lastIndex}
  p.appendChild(document.createTextNode(txt.slice(last)))}
 function rich(p,txt){
  var re=/<a\s[^>]*?href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,last=0,m;
  while((m=re.exec(txt))){plain(p,txt.slice(last,m.index));alink(p,m[1],m[2].replace(/<[^>]*>/g,''));last=re.lastIndex}
  plain(p,txt.slice(last))}

 /* tab penyaring Post / Livestream / Video: dibaca dari grup tag "Category" (bisa diganti lewat
    typeGroup di config.js) di posts.json. Nilai "post", "video", "livestream" (juga live/stream/streaming);
    nilai lain di grup itu (membership, vtuber, dst.) diabaikan. Satu artikel boleh punya lebih dari satu. */
 var TT={post:'Post',livestream:'Livestream',video:'Video'};
 var TGRP=String((window.APF_CONFIG&&window.APF_CONFIG.typeGroup)||'category').toLowerCase();
 function typesOf(p){
  var out=[],tg=(p&&p.tags&&typeof p.tags==='object')?p.tags:{};
  [].concat(tg[TGRP]||[]).forEach(function(v){
   var x=String(v).toLowerCase().trim(),k=/^(live|stream|streaming|livestream|live stream)$/.test(x)?'livestream':(x==='video'||x==='post')?x:'';
   if(k&&out.indexOf(k)<0)out.push(k)});
  return out}
 /* app.js memuat artikel secara asinkron, jadi kait filternya baru ada setelah itu: tunggu sampai siap */
 function whenHook(cb){
  if(window.apfFilter&&window.apfAll)return cb();
  var n=0,iv=setInterval(function(){
   if(window.apfFilter&&window.apfAll){clearInterval(iv);cb()}
   else if(++n>150){clearInterval(iv);try{console.info('[tag-info] app.js belum menyediakan apfFilter: tab tidak ditampilkan. Pastikan js/app.js versi terbaru terpasang.')}catch(e){}}
  },100)}
 function cats(p){return [].concat((p&&p.tags&&p.tags[TGRP])||[]).map(function(v){return String(v).trim()}).filter(Boolean)}
 /* vtubers/youtubers: tab tetap Post/Livestream/Video. artist: tab dibuat dari nilai Category milik artikel artist itu.
    Bisa diatur per entri: "hideTabs": ["animation"] (sembunyikan tab tertentu), "tabs": false | ["post","video"] | "category" (paksa tab dinamis) | "type" (paksa tab tetap) */
 function tabs(box,cfg,grp,hide){
  if(cfg===false||!window.apfFilter||!window.apfAll)return;
  var all=window.apfAll(),defs=[];
  var mode=Array.isArray(cfg)?'fixed':cfg==='category'?'dynamic':cfg==='type'?'fixed':
   grp==='artist'?'dynamic':(/^(vtubers?|youtubers?)$/.test(grp)?'fixed':'');
  if(mode==='fixed'){
   var keys=Array.isArray(cfg)?cfg.filter(function(k){return TT[k]}):['post','livestream','video'];
   keys.forEach(function(k){
    var test=function(p){return typesOf(p).indexOf(k)>-1},n=0;all.forEach(function(p){if(test(p))n++});
    defs.push({k:k,label:TT[k],n:n,test:test})})}
  else if(mode==='dynamic'){
   var seen={},order=[];
   all.forEach(function(p){cats(p).forEach(function(v){var l=v.toLowerCase();if(!seen[l]){seen[l]={label:v,n:0};order.push(l)}seen[l].n++})});
   order.sort(function(a,b){return seen[b].n-seen[a].n||seen[a].label.localeCompare(seen[b].label)});
   order.forEach(function(l){defs.push({k:l,label:seen[l].label,n:seen[l].n,test:function(p){return cats(p).some(function(v){return v.toLowerCase()===l})}})})}
  /* hideTabs: cocok bila sama persis dengan nama tab, atau muncul sebagai kata utuh di dalamnya
     ("animation" menyembunyikan "animation", "2d animation", dan "3d animation") */
  var hd=[].concat(hide||[]).map(function(x){return String(x).toLowerCase().trim()}).filter(Boolean);
  var flat=function(s){return ' '+String(s).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()+' '};
  if(hd.length)defs=defs.filter(function(d){return !hd.some(function(x){return x===d.k||x===String(d.label).toLowerCase()||flat(d.label).indexOf(flat(x))>-1})});
  if(!defs.length)return;
  defs.unshift({k:'',label:'Semua',n:all.length,test:null});
  var bar=el('div','ti-tabs'),btns={};bar.setAttribute('role','tablist');
  defs.forEach(function(d){
   var b=el('button','',d.label);b.type='button';b.setAttribute('role','tab');
   b.appendChild(el('span','ti-n',String(d.n)));
   b.onclick=function(){set(d)};bar.appendChild(b);btns[d.k]=b});
  function set(d){
   Object.keys(btns).forEach(function(x){var on=x===d.k;btns[x].className=on?'on':'';btns[x].setAttribute('aria-selected',on?'true':'false')});
   var u=new URLSearchParams(location.search);u.delete('page');if(d.k)u.set('type',d.k);else u.delete('type');
   var q=u.toString();try{history.replaceState(null,'',location.pathname+(q?'?'+q:''))}catch(e){}
   window.apfFilter(d.test)}
  box.appendChild(bar);
  var c=String(new URLSearchParams(location.search).get('type')||'').toLowerCase(),start=defs[0];
  defs.forEach(function(d){if(d.k&&d.k===c)start=d});
  set(start)}
 var s=document.createElement('style');
 s.textContent='.ti{margin:0 0 20px;border:1px solid var(--line);border-radius:12px;background:var(--card);overflow:hidden}'+
  '.ti-bn{display:block;width:100%;aspect-ratio:16/5;max-height:240px;object-fit:cover;background:var(--line)}'+
  '.ti-in{display:flex;gap:16px;padding:16px}'+
  '.ti.has-bn .ti-img{margin-top:-48px;border:3px solid var(--card)}'+
  '.ti-img{flex:none;width:96px;height:96px;border-radius:50%;object-fit:cover;background:var(--line)}'+
  '.ti-b{min-width:0;flex:1}'+
  '.ti h3{margin:0 0 6px;font-size:18px;font-weight:600;color:var(--head)}'+
  '.ti p{margin:0 0 8px;font-size:14px;line-height:1.6;color:var(--head);overflow-wrap:anywhere}'+
  '.ti p a{color:var(--link);text-decoration:underline}'+
  '.ti dl{display:grid;grid-template-columns:auto 1fr;gap:4px 14px;margin:10px 0;font-size:13px}'+
  '.ti dt{color:var(--alt);font-weight:600}.ti dd{margin:0;color:var(--head);overflow-wrap:anywhere}'+
  '.ti dd{display:flex;flex-wrap:wrap;align-items:center;gap:4px 16px}.ti-v{display:flex;align-items:center;gap:6px}'+
  '.ti-v.ti-mem{color:#2ba640;font-weight:600}.ti-v.ti-mem::before{content:"\\2605";flex:none;width:15px;height:15px;border-radius:50%;background:#2ba640;color:#fff;font-size:10px;line-height:15px;text-align:center}'+
  '.ti-v.ti-pat{color:#ff424d;font-weight:600}.ti-v.ti-fan{color:#0096fa;font-weight:600}'+
  '.ti-l{display:flex;flex-direction:column;align-items:stretch;gap:8px;flex:none;width:176px}'+
  '.ti-l a{display:flex;align-items:center;gap:7px;padding:6px 12px;border:1px solid var(--line);border-radius:999px;font-size:13px;font-weight:600;color:var(--head)}'+
  '.ti-ic{display:inline-flex;flex:none;line-height:0}.ti-ic svg{display:block}.ti-ic img{display:block;width:20px;height:20px;object-fit:contain}'+
  '.ti-ic.ti-m{width:20px;height:20px;background:currentColor;-webkit-mask:var(--m) center/contain no-repeat;mask:var(--m) center/contain no-repeat}'+
  '.ic-youtube{color:#f00}.ic-x,.ic-threads,.ic-tiktok{color:var(--head)}.ic-instagram{color:#e4405f}.ic-facebook{color:#1877f2}.ic-discord{color:#5865f2}.ic-patreon{color:#ff424d}.ic-pixiv,.ic-fanbox{color:#0096fa}.ic-link{color:var(--alt)}'+
  '.ti-l a:hover{border-color:var(--link)}'+
  '.ti-tabs{display:flex;gap:4px;padding:0 12px;border-top:1px solid var(--line);overflow-x:auto}'+
  '.ti-tabs button{flex:none;display:flex;align-items:center;gap:6px;padding:12px 14px;border:0;border-bottom:2px solid transparent;border-radius:0;background:none;color:var(--alt);font:inherit;font-size:14px;font-weight:600;cursor:pointer}'+
  '.ti-tabs button:hover{background:none;color:var(--head)}'+
  '.ti-tabs button.on{color:var(--head);border-bottom-color:var(--link)}'+
  '.ti-n{padding:1px 7px;border-radius:999px;background:var(--line);color:var(--alt);font-size:11px;font-weight:600}'+
  '@media(max-width:560px){.ti-tabs{justify-content:flex-start}.ti-bn{aspect-ratio:16/7}.ti-in{flex-direction:column;align-items:center;text-align:center}.ti dl{text-align:left}.ti-l{width:100%;max-width:320px}}';
 document.head.appendChild(s);

 fetch('/data/tag-info.json',{cache:'no-cache'}).then(function(r){return r.json()}).then(function(d){
  var o=null,ks=[];
  if(d&&typeof d==='object')Object.keys(d).forEach(function(n){var nk=norm(n);ks.push(nk);if(!o&&nk===k&&d[n]&&typeof d[n]==='object')o=d[n]});
  if(!o){try{console.info('[tag-info] tidak ada entri untuk "'+k+'". Kunci yang terbaca:',ks)}catch(e){}return}
  var box=el('div','ti'),inn=el('div','ti-in');
  if(safe(o.banner)){var bn=el('img','ti-bn');bn.src=o.banner;bn.alt='';bn.onerror=function(){bn.remove();box.classList.remove('has-bn')};box.appendChild(bn);box.classList.add('has-bn')}
  if(safe(o.image)){var im=el('img','ti-img');im.alt='';im.width=96;im.height=96;im.onerror=function(){im.remove()};im.src=o.image;inn.appendChild(im)}
  var b=el('div','ti-b');
  b.appendChild(el('h3','',String(o.name||k.slice(k.indexOf(':')+1))));
  if(o.desc)String(o.desc).split('\n').forEach(function(t){if(t.trim()){var p=el('p');rich(p,t);b.appendChild(p)}});
  if(o.info&&typeof o.info==='object'){
   var dl=el('dl');Object.keys(o.info).forEach(function(n){
    dl.appendChild(el('dt','',n));
    /* gaya per label: Patreon = merah + logo Patreon, Fanbox/Pixiv = biru + logo Fanbox, Membership lain = hijau + bintang */
    var kd=/patreon/i.test(n)?'pat':/fanbox|pixiv/i.test(n)?'fan':/membership/i.test(n)?'mem':'';
    var dd=el('dd');
    [].concat(o.info[n]).forEach(function(v){
     var ln=el('div','ti-v'+(kd?' ti-'+kd:''));
     if(kd==='pat')ln.appendChild(icon('patreon'));else if(kd==='fan')ln.appendChild(icon('fanbox'));
     ln.appendChild(document.createTextNode(String(v)));dd.appendChild(ln)});
    dl.appendChild(dd)});b.appendChild(dl)}
  var L=[].concat(o.links||[]);if(safe(o.more))L.push({name:'Info lengkap',url:o.more,self:1});
  var W=null;
  if(L.length){var w=el('div','ti-l');L.forEach(function(l){
   if(!l||!safe(l.url))return;
   var k=l.self?'':(NM[l.type]?l.type:kind(l.url)),a=el('a');a.href=l.url;
   if(k||l.icon){
    if(safe(l.icon)){var ic=el('span','ti-ic'),ii=el('img');ii.alt='';ii.onerror=function(){ic.remove()};ii.src=l.icon;ic.appendChild(ii);a.appendChild(ic)}
    else a.appendChild(icon(k))}
   a.appendChild(document.createTextNode(String(l.name||(k&&NM[k])||l.url)));
   if(!l.self){a.target='_blank';a.rel='noopener'}w.appendChild(a)});W=w}
  inn.appendChild(b);if(W)inn.appendChild(W);box.appendChild(inn);whenHook(function(){tabs(box,o.tabs,k.slice(0,k.indexOf(':')),o.hideTabs)});
  var t=document.querySelector('.title');
  if(t&&t.parentNode)t.parentNode.insertBefore(box,t);else list.parentNode.insertBefore(box,list);
 }).catch(function(){});
})();
