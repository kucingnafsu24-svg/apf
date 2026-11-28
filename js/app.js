(function(){
var r=document.documentElement;
var MODE=window.APF_MODE||{comic:false,data:'/data/posts.json',base:'/g/',home:'/'};
var dummy={style:{},children:[],classList:{add:function(){},remove:function(){},toggle:function(){return false},contains:function(){return false}},addEventListener:function(){},scrollTo:function(){},focus:function(){}};
var $=function(i){var e=document.getElementById(i);return e||(i==='posts'||i==='pop'||i==='labels'||i==='article'?null:dummy)};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var fmt=function(d){return new Date(d+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'})};

function withCounts(P){
 var C=window.APF_CONFIG;
 if(!Array.isArray(P)||!C||!C.supabaseUrl||/GANTI/.test(C.supabaseUrl))return P;
 return fetch(C.supabaseUrl+'/rest/v1/comment_counts?select=post_slug,total',{headers:{apikey:C.supabaseAnonKey}})
  .then(function(r){return r.ok?r.json():null}).then(function(a){
   if(!Array.isArray(a))return P;
   var m={};a.forEach(function(x){m[x.post_slug]=x.total});
   P.forEach(function(p){if(p&&p.slug)p.comments=m[String(p.slug).toLowerCase()]||0});
   return P}).catch(function(){return P});
}
fetch(MODE.data).then(function(x){return x.json()}).then(withCounts).then(init).catch(function(e){
 var m=$('posts')||$('article');if(m)m.innerHTML='<div class="empty">Gagal memuat artikel. Periksa '+MODE.data.slice(1)+' (kemungkinan ada koma berlebih, kurung kurang, atau tanda kutip salah).<br><small>'+esc(e&&e.message||e)+'</small></div>';console.error(e)});

function init(P){
if(!Array.isArray(P))P=[];
var ciu=function(a){var z={};return a.filter(function(x){var k=String(x).trim().toLowerCase();if(z[k])return false;z[k]=1;return true})};
P=P.filter(Boolean).map(function(p){
 p.title=p.title||'Tanpa judul';
 p.slug=p.slug||p.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 p.slug=String(p.slug).toLowerCase();
 p.author=p.author||'Admin';
 p.hasLabels=!!(p.labels&&p.labels.length);
 p.labels=p.hasLabels?ciu(p.labels):['Umum'];
 p.date=p.date||new Date().toISOString().slice(0,10);
 p.comments=+p.comments||0;
 p.content=String(p.content==null?'':p.content).trim();
 /* deskripsi otomatis bila "excerpt" kosong: ambil dari awal isi artikel (tanpa HTML/kode) */
 p.excerpt=String(p.excerpt||'').trim();
 if(!p.excerpt&&p.content){
  var tx=p.content.replace(/<(script|style|pre|code)[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]*>/g,' ').replace(/\[[^\]]*\]/g,' ').replace(/https?:\/\/\S+/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
  if(tx.length>150){tx=tx.slice(0,150);var sp=tx.lastIndexOf(' ');if(sp>90)tx=tx.slice(0,sp);tx=tx.replace(/[\s,.;:\-]+$/,'')+'…'}
  p.excerpt=tx}
 p.thumb=p.thumb||{cls:'t1',title:p.title.slice(0,14),sub:''};
 p.thumb.cls=p.thumb.cls||'t1';p.thumb.title=p.thumb.title||'';p.thumb.sub=p.thumb.sub||'';
 var tg={};
 if(p.tags&&typeof p.tags==='object'&&!Array.isArray(p.tags)){Object.keys(p.tags).forEach(function(k){
  var a=ciu([].concat(p.tags[k]).map(function(x){return String(x).trim()}).filter(Boolean)),kk=k.toLowerCase();
  if(a.length)tg[kk]=ciu((tg[kk]||[]).concat(a))})}
 if(tg.file){tg.category=ciu((tg.category||[]).concat(tg.file));delete tg.file}
 p.tags=tg;
 return p});
/* hidden:true -> hanya disembunyikan dari daftar beranda (index). Tetap muncul di pencarian, kategori, label, dan bisa dibuka lewat /g/slug */
var isHid=function(p){return p.hidden===true||p.hidden==='true'};
var HID=[];
var GN={artist:'Artist',genre:'Genre',category:'Category'},TG=(window.APF_CONFIG&&window.APF_CONFIG.tagGroups)||{};
Object.keys(TG).forEach(function(k){GN[k.toLowerCase()]=TG[k]});
function gname(k){return GN[k]||(k.charAt(0).toUpperCase()+k.slice(1))}
var PRETTY={};['artist','genre','category','parody','tag','cosplayer','game pc','language','publisher','developer','vtubers','vtuber','youtubers','youtuber'].forEach(function(g){PRETTY[g]=1});
function tlink(k,v){k=String(k).toLowerCase();if(MODE.comic)return MODE.home+'?tag='+encodeURIComponent(k+':'+v);return PRETTY[k]?'/'+encodeURIComponent(k.replace(/\s+/g,'-'))+'/'+encodeURIComponent(v):'/?tag='+encodeURIComponent(k+':'+v)}
function llink(l){if(MODE.comic)return MODE.home+'?label='+encodeURIComponent(l);return '/label/'+encodeURIComponent(l)}
function labelFromUrl(){var q=new URLSearchParams(location.search).get('label');if(q)return q;
 var m=location.pathname.match(/^\/label\/([^\/]+)\/?$/i);if(!m)return '';try{return decodeURIComponent(m[1])}catch(e){return m[1]}}
function tagFromUrl(){var q=new URLSearchParams(location.search).get('tag');if(q)return q;
 var m=location.pathname.match(/^\/([^\/]+)\/([^\/]+)\/?$/);if(!m)return '';
 try{var g=decodeURIComponent(m[1]).toLowerCase().replace(/-/g,' '),v=decodeURIComponent(m[2])}catch(e){return ''}
 return PRETTY[g]?g+':'+v:''}
function chips(p){var ks=Object.keys(p.tags);if(!ks.length)return '';
 return '<div class="tagrows">'+ks.map(function(k){return '<div class="tagrow"><span>'+esc(gname(k))+'</span>'+
  p.tags[k].map(function(v){return '<a class="tg tg-'+esc(k.replace(/[^a-z0-9]/g,''))+'" href="'+tlink(k,v)+'">'+esc(v)+'</a>'}).join('')+'</div>'}).join('')+'</div>'}
function thumb(p,big){var b=p.comments?'<span class="badge"><svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-11.6 7.1L3 20l1-4.6A8 8 0 1 1 21 12z"/></svg>'+p.comments+'</span>':'';
 if(p.image)return '<'+(big?'div':'a href="'+MODE.base+encodeURIComponent(p.slug)+'"')+' class="thumb">'+b+'<img src="'+esc(p.image)+'"'+(p.imageFull?' data-full="'+esc(p.imageFull)+'"':'')+' alt="" loading="lazy"></'+(big?'div':'a')+'>';
 var st=p.thumb.title.length>6?' style="font-size:'+(big?36:18)+'px"':'';
 return '<'+(big?'div':'a href="'+MODE.base+encodeURIComponent(p.slug)+'"')+' class="thumb '+p.thumb.cls+'">'+b+'<span><strong'+st+'>'+esc(p.thumb.title)+'</strong><small>'+esc(p.thumb.sub)+'</small></span></'+(big?'div':'a')+'>'}
function avatar(p){var C=window.APF_CONFIG||{},u=p.authorImage||(C.authors&&C.authors[p.author]);
 return u?'<img class="av" src="'+esc(u)+'" alt="" loading="lazy">':'<span class="av">'+esc(p.author[0])+'</span>'}
/* Video: satu tombol per video/episode, pilihan server digabung dalam satu dropdown.
   Format posts.json:
   "videos":[ {"title":"Episode 1","servers":[{"name":"Server 1","url":"https://..."},{"name":"Server 2","url":"https://..."}]} ]
   Bentuk lama {title,url} atau "https://..." tetap bisa; entri dengan title sama otomatis digabung jadi satu video. */
var VG=[];
function vlist(p){var g=[],m={};
 (Array.isArray(p.videos)?p.videos:[]).forEach(function(v,i){
  var o=typeof v==='string'?{url:v}:(v||{}),raw=Array.isArray(o.servers)?o.servers:(Array.isArray(o.urls)?o.urls:null),title=String(o.title||('Server '+(i+1)));
  var ss=(raw||[o]).map(function(x){var q=typeof x==='string'?{url:x}:(x||{});return {name:String((raw?(q.name||q.title):'')||q.server||''),url:String(q.url||'')}}).filter(function(x){return /^https:\/\//.test(x.url)});
  if(!ss.length)return;
  if(m[title])m[title].s=m[title].s.concat(ss);else{m[title]={title:title,s:ss};g.push(m[title])}});
 g.forEach(function(x){x.s.forEach(function(s,j){if(!s.name)s.name='Server '+(j+1)})});return g}
function srvOpts(x){return x.s.map(function(s,j){return '<option value="'+j+'">'+esc(s.name)+'</option>'}).join('')}
function videos(p){var g=vlist(p);if(!g.length)return '';VG=g;
 var vt=String([p.videoTitle,p.videostitle,p.videosTitle].filter(function(x){return x!=null&&String(x).trim()})[0]||'').trim()||'Streaming';
 return '<div class="sec"><div class="sec-h">'+esc(vt)+'</div><div class="sec-b"><div class="vplayer" id="vplayer">'+
  (g.length>1?'<div class="vtabs">'+g.map(function(x,i){return '<button type="button"'+(i?'':' class="on"')+' data-g="'+i+'">'+esc(x.title)+'</button>'}).join('')+'</div>':'')+
  (g.some(function(x){return x.s.length>1})?'<label class="vsrv"'+(g[0].s.length>1?'':' hidden')+'>Server <select class="vsel" aria-label="Pilih server">'+srvOpts(g[0])+'</select></label>':'')+
  '<div class="video"><iframe src="'+esc(g[0].s[0].url)+'" allowfullscreen scrolling="no" frameborder="0" loading="lazy"></iframe></div></div></div></div>'}
/* Pemutar audio: post.audio=[{title,url}], post.audioTitle = judul bagian (bawaan "Musik") */
function alist(p){return (Array.isArray(p.audio)?p.audio:[]).map(function(a){
 if(!a||typeof a!=='object')return null;
 var u=String(a.url||'');if(!/^(https?:\/\/|\/(?!\/))/.test(u))return null;
 try{u=encodeURI(decodeURI(u))}catch(e){}
 return {title:String(a.title||'Track'),url:u}}).filter(Boolean)}
function audios(p){var a=alist(p);if(!a.length)return '';
 var t=String(p.audioTitle||'').trim()||'Musik';
 return '<div class="sec"><div class="sec-h">'+esc(t)+'</div><div class="sec-b"><div class="aud" id="aud">'+
  '<div class="aud-now" id="aud-now"></div><audio id="aud-el" controls preload="none"></audio>'+
  '<ol class="aud-list">'+a.map(function(x,i){return '<li><button type="button" data-i="'+i+'" data-u="'+esc(x.url)+'">'+esc(x.title)+'</button></li>'}).join('')+'</ol></div></div></div>'}
function bindAudios(){var w=document.getElementById('aud');if(!w)return;
 if(!document.getElementById('aud-css')){var st=document.createElement('style');st.id='aud-css';
  st.textContent='.aud-now{margin-bottom:8px;font-weight:600;color:var(--head);overflow-wrap:anywhere}'+
   '.aud audio{display:block;width:100%;margin-bottom:10px}'+
   '.aud-list{list-style:none;margin:0;padding:0;max-height:360px;overflow-y:auto;border:1px solid var(--line);border-radius:10px}'+
   '.aud-list li+li{border-top:1px solid var(--line)}'+
   '.aud-list button{display:block;width:100%;padding:10px 12px;border:0;background:none;color:var(--head);font:inherit;font-size:14px;text-align:left;cursor:pointer;overflow-wrap:anywhere}'+
   '.aud-list button:hover{background:var(--card)}'+
   '.aud-list button.on{background:var(--card);color:var(--link);font-weight:600}';
  document.head.appendChild(st)}
 var el=document.getElementById('aud-el'),now=document.getElementById('aud-now'),bs=w.querySelectorAll('.aud-list button'),cur=0;
 if(!el||!bs.length)return;
 function mark(i){cur=i;[].forEach.call(bs,function(b,k){b.classList.toggle('on',k===i)});now.textContent=bs[i].textContent}
 function play(i){if(i<0||i>=bs.length)return;mark(i);el.src=bs[i].getAttribute('data-u');var r=el.play();if(r&&r.catch)r.catch(function(){})}
 w.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.aud-list button');if(b)play(+b.getAttribute('data-i'))});
 el.addEventListener('ended',function(){play(cur+1)});
 el.addEventListener('error',function(){if(el.getAttribute('src'))now.textContent=bs[cur].textContent+' (gagal dimuat)'});
 el.src=bs[0].getAttribute('data-u');mark(0)}
function dlist(p){var d=Array.isArray(p.download)?p.download:(p.download?[p.download]:[]);
 return d.filter(Boolean).map(function(g){
  var links=(Array.isArray(g.links)?g.links:[]).map(function(l){l=l||{};return {name:String(l.name||l.title||'Download'),url:String(l.url||'')}}).filter(function(l){return /^https?:\/\//.test(l.url)});
  return {title:g.title?String(g.title):'',links:links}}).filter(function(g){return g.links.length})}
function downloads(p){var g=dlist(p);if(!g.length)return '';
 return '<div class="sec"><div class="sec-h">Unduh</div><div class="sec-b">'+(/\/g\/tutorial\/?$/i.test(location.pathname)?'':'<a class="dl-tut" href="/g/tutorial" target="_blank" rel="noopener">Tutorial download</a>')+g.map(function(x){
  return '<div class="dl-card">'+(x.title?'<div class="dl-t">'+esc(x.title)+'</div>':'')+'<div class="dl-links">'+
   x.links.map(function(l){return '<a class="dl-btn" href="'+esc(l.url)+'" target="_blank" rel="noopener nofollow">'+esc(l.name)+'</a>'}).join('')+'</div></div>'}).join('')+'</div></div>'}
/* Tombol "Salin" di pojok kanan atas tiap kotak kode (seperti GitHub) */
function bindCode(){
 var bs=document.querySelectorAll('.entry pre');
 [].forEach.call(bs,function(pre){
  if(pre.parentNode.classList.contains('cb'))return;
  var w=document.createElement('div');w.className='cb';pre.parentNode.insertBefore(w,pre);w.appendChild(pre);
  var b=document.createElement('button');b.type='button';b.className='cb-btn';b.setAttribute('aria-label','Salin kode');
  b.innerHTML='<svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg><span>Salin</span>';
  w.appendChild(b);
  var tm;
  b.onclick=function(){
   var t=pre.textContent.replace(/\n$/,'');
   var done=function(ok){var sp=b.querySelector('span');sp.textContent=ok?'Tersalin!':'Gagal';b.classList.toggle('ok',ok);clearTimeout(tm);tm=setTimeout(function(){sp.textContent='Salin';b.classList.remove('ok')},1600)};
   var fb=function(){try{var x=document.createElement('textarea');x.value=t;x.setAttribute('readonly','');x.style.cssText='position:fixed;top:0;left:0;opacity:0';document.body.appendChild(x);x.select();var r=document.execCommand('copy');document.body.removeChild(x);done(r)}catch(e){done(false)}};
   if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(function(){done(true)},fb);else fb();
  };
 });
}
function bindVideos(){var vp=document.getElementById('vplayer');if(!vp)return;
 var fr=vp.querySelector('iframe'),bs=vp.querySelectorAll('.vtabs button'),lab=vp.querySelector('.vsrv'),sel=vp.querySelector('.vsel'),cur=0;
 function pick(i){cur=i;if(!sel)return;sel.innerHTML=srvOpts(VG[i]);lab.hidden=VG[i].s.length<2}
 [].forEach.call(bs,function(b){b.onclick=function(){var i=+b.getAttribute('data-g');fr.src=VG[i].s[0].url;[].forEach.call(bs,function(x){x.className=''});b.className='on';pick(i)}});
 if(sel)sel.onchange=function(){var x=VG[cur].s[+sel.value];if(x)fr.src=x.url}}
function glist(p){return (Array.isArray(p.gallery)?p.gallery:[]).map(function(g){
 var o=typeof g==='string'?{url:g}:(g||{});return {url:String(o.url||''),cap:o.caption?String(o.caption):''}}).filter(function(g){return /^(https?:\/\/|\/(?!\/))/.test(g.url)})}
function gallery(p){var g=glist(p);if(!g.length)return '';
 return '<div class="gal" id="gal">'+g.map(function(x,i){return '<a class="gal-i" href="'+esc(x.url)+'" data-i="'+i+'"><img src="'+esc(x.url)+'" alt="'+esc(x.cap)+'" loading="lazy"></a>'}).join('')+'</div>'}
function bindGallery(p){var g=glist(p),el=document.getElementById('gal');if(!el||!g.length)return;
 var lb=null,i=0,im,cp;
 function show(n){i=(n+g.length)%g.length;im.src=g[i].url;cp.textContent=(g[i].cap?g[i].cap+'  ':'')+(g.length>1?'('+(i+1)+'/'+g.length+')':'')}
 function close(){if(lb){lb.hidden=true;document.documentElement.style.overflow=''}}
 function open(n){
  if(!lb){lb=document.createElement('div');lb.className='lb'+(g.length<2?' one':'');
   lb.innerHTML='<button type="button" class="lb-x" aria-label="Tutup">\u2715</button><button type="button" class="lb-p" aria-label="Sebelumnya">\u2039</button><img alt=""><button type="button" class="lb-n" aria-label="Berikutnya">\u203A</button><div class="lb-c"></div>';
   document.body.appendChild(lb);im=lb.querySelector('img');cp=lb.querySelector('.lb-c');
   lb.addEventListener('click',function(e){var c=e.target.className;
    if(c==='lb-x'||e.target===lb)close();else if(c==='lb-p')show(i-1);else if(c==='lb-n')show(i+1)})}
  lb.hidden=false;show(n);document.documentElement.style.overflow='hidden'}
 [].forEach.call(el.querySelectorAll('.gal-i'),function(a){a.onclick=function(e){e.preventDefault();open(+a.getAttribute('data-i'))}});
 document.addEventListener('keydown',function(e){if(!lb||lb.hidden)return;
  if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(i-1);if(e.key==='ArrowRight')show(i+1)})}
function related(cur,side){
 var CW=(window.APF_CONFIG&&window.APF_CONFIG.relatedWeights)||{};
 var W={artist:5,label:3,category:3,genre:1,other:0.5};Object.keys(CW).forEach(function(k){if(typeof CW[k]==='number')W[k]=CW[k]});
 var lc=function(x){return String(x).toLowerCase()},has=function(a,v){return (a||[]).some(function(x){return lc(x)===lc(v)})};
 var labs=function(p){return p.hasLabels?p.labels:[]};
 function score(p){var s=0,why='';
  (cur.tags.artist||[]).forEach(function(a){if(has(p.tags.artist,a)){s+=W.artist;why=why||'Artist yang sama'}});
  labs(cur).forEach(function(l){if(has(labs(p),l)){s+=W.label;why=why||'Label yang sama'}});
  (cur.tags.category||[]).forEach(function(v){if(has(p.tags.category,v)){s+=W.category;why=why||'Kategori yang sama'}});
  (cur.tags.genre||[]).forEach(function(v){if(has(p.tags.genre,v)){s+=W.genre;why=why||'Genre yang sama'}});
  Object.keys(cur.tags).forEach(function(k){if(k==='artist'||k==='genre'||k==='category')return;
   cur.tags[k].forEach(function(v){if(has(p.tags[k],v)){s+=W.other;why=why||gname(k)+' yang sama'}})});
  return {p:p,s:s,why:why}}
 var all=P.filter(function(p){return p!==cur&&p.slug!==cur.slug}).map(score);
 if(side){var vv=all.filter(function(x){return postType(x.p)==='video'&&vlist(x.p).length});if(vv.length)all=vv}
 all.sort(function(a,b){return b.s-a.s||(a.p.date<b.p.date?1:a.p.date>b.p.date?-1:0)});
 var N=side?10:6,pick=all.filter(function(x){return x.s>0}).slice(0,N);
 if(pick.length<(side?N:4))all.filter(function(x){return x.s<=0}).slice(0,N-pick.length).forEach(function(x){x.why='Terbaru';pick.push(x)});
 if(!pick.length)return '';
 if(side)return '<section class="yt-rec"><h2>Video lainnya</h2>'+pick.map(function(x){
  return '<a class="yt-i" href="'+MODE.base+encodeURIComponent(x.p.slug)+'">'+thumb(x.p,true)+'<span class="yt-tx"><b>'+esc(x.p.title)+'</b><small>'+esc(x.p.author)+'</small><small>'+fmt(x.p.date)+'</small></span></a>'}).join('')+'</section>';
 return '<section class="rec"><div class="title"><h2>Rekomendasi untuk Anda</h2><i></i></div><div class="rec-grid">'+pick.map(function(x){
  return '<div class="rec-i">'+thumb(x.p)+'<h3><a href="'+MODE.base+encodeURIComponent(x.p.slug)+'">'+esc(x.p.title)+'</a></h3><div class="rec-m">'+(x.why?'<span>'+esc(x.why)+'</span>':'')+'<span>'+fmt(x.p.date)+'</span></div></div>'}).join('')+'</div></section>'}
function authorLine(p){return '<div class="meta">'+avatar(p)+'<b>'+esc(p.author)+'</b></div>'}
function chipRow(k,vals){return '<div class="tagrow"><span>'+esc(gname(k))+'</span>'+vals.map(function(v){
 return '<a class="tg tg-'+esc(k.replace(/[^a-z0-9]/g,''))+'" href="'+tlink(k,v)+'">'+esc(v)+'</a>'}).join('')+'</div>'}
function labelRow(p){
 if(!p.hasLabels)return '';
 return '<div class="tagrow"><span>Label</span>'+p.labels.map(function(l){
  return '<a class="tg tg-label" href="'+llink(l)+'">'+esc(l)+'</a>'}).join('')+'</div>'}
function artistRow(p){return p.tags.artist?chipRow('artist',p.tags.artist):''}
function bottomRows(p){var ks=[];
 if(p.tags.genre)ks.push('genre');
 Object.keys(p.tags).forEach(function(k){if(k!=='artist'&&k!=='genre'&&k!=='category')ks.push(k)});
 if(p.tags.category)ks.push('category');
 var h=labelRow(p)+artistRow(p)+ks.map(function(k){return chipRow(k,p.tags[k])}).join('');
 if(!h)return '';
 return '<div class="tagrows tagbottom">'+h+'</div>'}
function meta(p){return '<div class="meta">'+avatar(p)+'<b>'+esc(p.author)+'</b><span>post '+fmt(p.date)+'</span></div>'}
/* halaman tag VTuber/YouTuber: daftar tampil seperti halaman channel YouTube (kartu video 16:9 dalam grid) */
var YT=false;
function ytCard(p){var u=''+MODE.base+encodeURIComponent(p.slug),hv=vlist(p).length;
 return '<article class="ytc"><a class="ytc-th" href="'+u+'" tabindex="-1" aria-hidden="true">'+thumb(p,true)+(hv?'<span class="ytc-play">\u25B6 Video</span>':'')+'</a>'+
  '<div class="ytc-tx">'+avatar(p)+'<div><h3><a href="'+u+'">'+esc(p.title)+'</a></h3><div class="ytc-m">'+esc(p.author)+'</div><div class="ytc-m">'+fmt(p.date)+'</div></div></div></article>'}
/* jenis isi di halaman channel: 'video' (video/livestream) atau 'post' (tulisan komunitas), dibaca dari grup tag Category */
function ytKind(p){var g=String((window.APF_CONFIG&&window.APF_CONFIG.typeGroup)||'category').toLowerCase(),
 c=[].concat((p.tags&&p.tags[g])||[]).map(function(x){return String(x).toLowerCase().trim()}),
 v=c.some(function(x){return /^(video|live|stream|streaming|livestream|live stream)$/.test(x)});
 if(v)return 'video';if(c.indexOf('post')>-1)return 'post';return vlist(p).length?'video':'post'}
/* kartu "Post" ala tab Postingan/Komunitas YouTube: avatar + nama + tanggal, teks, gambar lebar di bawahnya */
function ytPost(p){var u=''+MODE.base+encodeURIComponent(p.slug),tx=String(p.excerpt||'').trim();
 return '<article class="ytp" data-slug="'+esc(p.slug)+'"><div class="ytp-h">'+avatar(p)+'<div><b>'+esc(p.author)+'</b><small>'+fmt(p.date)+'</small></div></div>'+
  '<h3 class="ytp-t"><a href="'+u+'">'+esc(p.title)+'</a></h3>'+(tx&&tx!==String(p.title).trim()?'<p class="ytp-p">'+esc(tx)+'</p>':'')+
  (p.image?'<a class="ytp-i" href="'+u+'"><img src="'+esc(p.image)+'" alt="" loading="lazy"></a>':'')+
  '<div class="ytp-f"><button type="button" class="ytp-cm" aria-expanded="false"><svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-11.6 7.1L3 20l1-4.6A8 8 0 1 1 21 12z"/></svg><span>'+(p.comments||0)+'</span> Komentar</button><a class="ytp-open" href="'+u+'">Buka postingan</a></div></article>'}
function card(p){
 if(YT)return ytKind(p)==='post'?ytPost(p):ytCard(p);
 return '<article class="post"><div>'+(p.sponsored?'<div class="tag">Sponsored</div>':meta(p))+
 '<h3><a href="'+MODE.base+encodeURIComponent(p.slug)+'">'+esc(p.title)+'</a></h3>'+(p.excerpt?'<p>'+esc(p.excerpt)+'</p>':'')+
 '<a class="more" href="'+MODE.base+encodeURIComponent(p.slug)+'">Read more</a>'+'</div>'+thumb(p)+'</article>'}

var L={},Lk={};P.forEach(function(p){p.labels.forEach(function(l){var k=String(l).toLowerCase();if(!Lk[k]){Lk[k]=1;L[l]=1}})});
if($('pop')){
 var pop=P.slice().sort(function(a,b){return b.comments-a.comments}).slice(0,3);
 $('pop').innerHTML=pop.map(function(p){return '<a href="'+MODE.base+encodeURIComponent(p.slug)+'">'+esc(p.title)+'</a>'}).join('');
}
if($('labels')){
 $('labels').innerHTML=Object.keys(L).map(function(l){return '<a href="'+llink(l)+'">'+esc(l)+'</a>'}).join('');
}

var qs0=new URLSearchParams(location.search),cur=labelFromUrl(),curTag=String(tagFromUrl()).toLowerCase(),curPost=null;
var lc2=function(x){return String(x).toLowerCase()};
/* jenis post: 'video' (khusus YouTuber/VTuber & hanya bila post punya video) / 'comic' bila ada category/tag/label yang cocok dengan config.postTypes, selain itu '' */
function postType(p){if(MODE.comic)return 'comic';var T=(window.APF_CONFIG&&window.APF_CONFIG.postTypes)||{},v=[];
 Object.keys(p.tags||{}).forEach(function(k){v.push(k);v=v.concat(p.tags[k])}); /* nama grup tag (mis. vtubers) juga ikut dicocokkan */
 v=v.concat(p.labels||[]).map(lc2);
 var hit=function(a){return (a||[]).some(function(x){return v.indexOf(lc2(x))>-1})};
 return hit(T.comic)?'comic':(hit(T.video)?'video':'')}
var AR={},ARk={};P.forEach(function(p){(p.tags.artist||[]).forEach(function(a){var k=lc2(a),c=ARk[k]||(ARk[k]=a);AR[c]=(AR[c]||0)+1})});
var auto=Object.keys(AR).length?Object.keys(AR).sort(function(a,b){return AR[b]-AR[a]||a.localeCompare(b)}).map(function(a){return {name:a,artist:a}}):Object.keys(L).map(function(l){return {name:l}});
/* satu topik: {"name":"Maplestar","artist":"Maplestar"} -> /?tag=artist:Maplestar
   juga boleh genre/category/language/...; {"name":"x","label":"x"} -> /?label=x; {"name":"x","url":"..."} -> url bebas */
function topicOf(t){
 if(t.url)return {u:t.url};
 var ks=Object.keys(t).filter(function(k){k=lc2(k);return k!=='name'&&k!=='url'&&k!=='label'});
 if(ks.length){var k=ks[0],g=lc2(k),v=String(t[k]==null||t[k]===''?t.name:t[k]);
  if(g==='tag'&&v.indexOf(':')>0){g=lc2(v.slice(0,v.indexOf(':')));v=v.slice(v.indexOf(':')+1)}
  if(g==='file')g='category';
  return {u:tlink(g,v),g:g,v:v}}
 var l=t.label||t.name;return {u:llink(l),l:l}}
/* tombol menu di header (Art, Animation, dst): hanya ditandai saat halaman kategori/tag-nya sendiri yang dibuka, bukan saat membaca artikel */
var markNav=function(){var ct=curTag.replace(/^file:/,'category:');[].forEach.call(document.querySelectorAll('nav a'),function(a){
 var m=(a.getAttribute('href')||'').match(/^\/([^\/]+)\/(.+)$/),on=false;
 if(m){var g,v;try{g=lc2(decodeURIComponent(m[1]));v=lc2(decodeURIComponent(m[2]))}catch(e){g=lc2(m[1]);v=lc2(m[2])}
  on=ct===g+':'+v}
 if(a.getAttribute('href')==='/comics')on=!!MODE.comic;a.classList.toggle('on',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')})};
var drawTopics=function(a){$('topics').innerHTML=a.map(function(t){
  var o=topicOf(t),on=false;
  if(o.g)on=curTag===lc2(o.g+':'+o.v)||!!(curPost&&(curPost.tags[o.g]||[]).some(function(x){return lc2(x)===lc2(o.v)}));
  else if(o.l)on=cur!=null&&lc2(o.l)===lc2(cur);
  return '<a'+(on?' class="on"':'')+' href="'+esc(o.u)+'">'+esc(t.name)+'</a>'}).join('');
 var tp=$('topics'),on=tp.querySelector&&tp.querySelector('a.on');if(on)tp.scrollLeft=Math.max(0,on.offsetLeft-(tp.clientWidth-on.offsetWidth)/2);markNav()};
markNav();
(MODE.comic?Promise.resolve(null):fetch('/data/topics.json').then(function(x){return x.json()})).then(function(a){drawTopics(Array.isArray(a)&&a.length?a:auto)}).catch(function(){drawTopics(auto)});
var list=$('posts'),qs=new URLSearchParams(location.search);
if(list){
 var label=labelFromUrl(),tag=tagFromUrl(),tk='',tv='';
 if(tag.indexOf(':')>0){tk=tag.slice(0,tag.indexOf(':')).toLowerCase();tv=tag.slice(tag.indexOf(':')+1);if(tk==='file')tk='category'}
 YT=/^(vtubers?|youtubers?)$/.test(tk);
 var data=label?P.filter(function(p){return p.labels.some(function(l){return lc2(l)===lc2(label)})}):tv?P.filter(function(p){return (p.tags[tk]||[]).some(function(x){return lc2(x)===lc2(tv)})}):P.filter(function(p){return !isHid(p)});
 if(!MODE.comic&&!label&&!tv&&!qs.get('q'))fetch('/data/slider.json').then(function(x){return x.json()}).then(slider).catch(function(){});
 if(MODE.comic){document.title='Komik — All Pirate File';if(!label&&!tv)$('ttl').textContent='Komik Terbaru'}
 if(label)$('ttl').textContent='Label: '+label;
 if(tv)$('ttl').textContent=gname(tk)+': '+tv;
 /* halaman kategori/tag/label: judul disembunyikan dari tampilan (tetap ada untuk pembaca layar & SEO) */
 if(label||tv)$('ttl').style.cssText='position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap';
 /* halaman: 8 artikel per halaman, nomor halaman di ?page=N */
 var PER=8,page=Math.max(1,parseInt(qs.get('page'),10)||1),pg=document.createElement('div');
 if(YT){list.classList.add('yt-grid');var vb=$('view');if(vb)vb.style.display='none'}
 pg.className='pager';pg.setAttribute('role','navigation');pg.setAttribute('aria-label','Halaman');list.parentNode.insertBefore(pg,list.nextSibling);
 var pageUrl=function(n){var u=new URLSearchParams(location.search);if(n>1)u.set('page',n);else u.delete('page');var q=u.toString();return location.pathname+(q?'?'+q:'')};
 var render=function(a){
  var pages=Math.max(1,Math.ceil(a.length/PER));page=Math.min(Math.max(page,1),pages);
  document.body.classList.toggle('pg-more',page>1); /* HP: slider disembunyikan di halaman 2 dst (lihat style.css) */
  list.innerHTML=a.length?a.slice((page-1)*PER,page*PER).map(card).join(''):'<div class="empty">Tidak ada artikel.</div>';
  if(pages<2){pg.innerHTML='';return}
  /* nomor halaman: jendela 8 angka (1-8). Tetap 1-8 sampai halaman 8, lalu bergeser satu per satu (2-9, 3-10, ...) */
  var h='<button type="button" data-p="'+(page-1)+'"'+(page<2?' disabled':'')+' aria-label="Sebelumnya">\u2039</button>',W=8,st=Math.max(1,page-W+2),en=Math.min(pages,st+W-1);
  st=Math.max(1,en-W+1);
  for(var n=st;n<=en;n++)h+='<button type="button" data-p="'+n+'"'+(n===page?' class="on" aria-current="page"':'')+'>'+n+'</button>';
  h+='<button type="button" data-p="'+(page+1)+'"'+(page>=pages?' disabled':'')+' aria-label="Berikutnya">\u203a</button>';
  pg.innerHTML=h};
 pg.onclick=function(e){var b=e.target.closest&&e.target.closest('button[data-p]');if(!b||b.disabled)return;
  page=parseInt(b.getAttribute('data-p'),10);history.pushState(null,'',pageUrl(page));render(data);
  window.scrollTo(0,0)};
 window.addEventListener('popstate',function(){if(qs.get('q'))return;page=Math.max(1,parseInt(new URLSearchParams(location.search).get('page'),10)||1);render(data)});
 if(!qs.get('q'))render(data);
 /* kait untuk tag-info.js: tab Post/Livestream/Video menyaring daftar tag (pagination ikut) */
 var all=data;window.apfAll=function(){return all};
 window.apfFilter=function(fn){data=fn?all.filter(fn):all;page=1;history.replaceState(null,'',pageUrl(1));render(data)};
 $('view').onclick=function(){var g=list.classList.toggle('grid');$('vl').textContent=g?'Grid':'List'};
}else{
 var slug=(qs.get('s')||decodeURIComponent(location.pathname.split('/').filter(Boolean).pop()||'')).toLowerCase();
 var p=P.concat(HID).filter(function(x){return x.slug===slug})[0],a=$('article');
 /* tautan lama: komik yang dulu dibuka lewat /g/slug dialihkan ke /k/slug */
 if(!p&&!MODE.comic)fetch('/data/comic.json').then(function(r){return r.json()}).then(function(c){
  if(Array.isArray(c)&&c.some(function(x){return x&&String(x.slug||'').toLowerCase()===slug}))location.replace('/k/'+encodeURIComponent(slug))}).catch(function(){});
 if(!p){document.title='404 - Artikel tidak ditemukan — All Pirate File';a.innerHTML='<div style="text-align:center;padding:56px 0"><p style="margin:0;font-size:80px;line-height:1;font-weight:700;color:var(--link)">404</p><h1 style="margin:12px 0 8px;font-size:22px;font-weight:600;color:var(--head)">Artikel tidak ditemukan</h1><p style="margin:0 0 24px;color:var(--alt);font-size:14px;line-height:1.6">Alamat yang kamu buka tidak ada, sudah dihapus, atau salah ketik.</p><a href="/" style="display:inline-flex;padding:11px 20px;border-radius:8px;background:var(--link);color:#fff;font-size:14px;font-weight:600">Kembali ke beranda</a></div>'}
 else{
  cur=p.labels[0];curPost=p;
  document.title=p.title+' — Fletro Pro';
  var d=document.querySelector('meta[name=description]');if(d)d.content=p.excerpt;
  if(p.fullpage){$('layout').classList.add('full');document.querySelector('aside').style.display='none'}
  /* tombol ke artikel lain di dalam "content": tulis [post:slug] atau [post:slug|Teks tombol] */
  /* hapus baris "Copy" sisa tempel dari GitHub yang berdiri tepat sebelum kotak kode */
  var cc=function(t){return String(t).replace(/(^|\n)[ \t]*Copy[ \t]*(?=\r?\n[ \t]*<pre)/g,'$1')};
  var pb=function(t){return t.replace(/\[post:([a-z0-9_-]+)(?:\|([^\]\n]*))?\]/gi,function(m,s,l){s=s.toLowerCase();
   var q=P.concat(HID).filter(function(x){return x.slug===s})[0];
   if(!q){try{console.warn('[post:'+s+'] tidak ditemukan di posts.json')}catch(e){}return ''}
   return '<a class="postbtn" href="'+MODE.base+encodeURIComponent(q.slug)+'">'+esc((l&&l.trim())||q.title)+'</a>'})};
  /* jenis post (video / komik) ditentukan dari category/tag/label lewat config.js -> postTypes */
  var ty=postType(p),vd=videos(p),ent=p.content?'<div class="entry">'+pb(cc(p.content))+'</div>':'';
  a.classList.remove('is-video','is-comic');
  var hd='<div class="crumb" hidden></div><h1>'+esc(p.title)+'</h1>'+authorLine(p)+'<div class="meta"><span>'+fmt(p.date)+'</span></div>';
  var lay=$('layout');lay.classList.remove('yt');
  var oldRec=document.querySelector('aside .yt-rec');if(oldRec)oldRec.remove();
  if(ty==='video'&&vd){
   /* VIDEO (YouTuber/VTuber): tata letak mirip halaman tonton YouTube */
   a.classList.add('is-video');lay.classList.add('yt');
   var hs=[];Object.keys(p.tags).forEach(function(k){p.tags[k].forEach(function(v){hs.push('<a href="'+tlink(k,v)+'">#'+esc(String(v).replace(/\s+/g,''))+'</a>')})});
   var rs=related(p,true),sd=document.querySelector('aside');if(rs&&sd)sd.insertAdjacentHTML('afterbegin',rs);
   a.innerHTML='<div class="crumb" hidden></div>'+vd+'<h1>'+esc(p.title)+'</h1>'+
    '<div class="yt-ch">'+avatar(p)+'<div class="yt-name"><b>'+esc(p.author)+'</b><small>'+fmt(p.date)+'</small></div><div id="yt-actions"></div></div>'+
    '<div class="yt-desc clamp"><div class="yt-body"><div class="yt-meta"><b>'+fmt(p.date)+'</b>'+(hs.length?' <span class="yt-tags">'+hs.slice(0,6).join(' ')+'</span>':'')+'</div>'+ent+bottomRows(p)+'</div><button type="button" class="yt-more">Selengkapnya</button></div>'+
    gallery(p)+audios(p)+downloads(p)+'<a class="back" href="'+MODE.home+'">\u2190 Semua artikel</a>';
   var dsc=a.querySelector('.yt-desc'),bd=dsc.querySelector('.yt-body'),mb=dsc.querySelector('.yt-more');
   if(bd.scrollHeight<=bd.clientHeight+2){dsc.classList.remove('clamp');mb.hidden=true}
   mb.onclick=function(){var c=dsc.classList.toggle('clamp');mb.textContent=c?'Selengkapnya':'Tampilkan lebih sedikit'}}
  else{
   if(ty==='comic')a.classList.add('is-comic');
   a.innerHTML=hd+thumb(p,true)+ent+gallery(p)+bottomRows(p)+vd+audios(p)+downloads(p)+related(p)+'<a class="back" href="'+MODE.home+'">\u2190 Semua artikel</a>'}
  bindVideos();bindAudios();bindGallery(p);bindCode();
 }
}
}

function slider(f){
 if(!Array.isArray(f)||!f.length)return;
 var tr=$('track'),sl=$('slider'),dots=$('dots'),i=0,timer;
 tr.innerHTML=f.map(function(s){
  var cap='<div class="cap">'+(s.label||s.date?'<small>'+esc([s.label,s.date?fmt(s.date):''].filter(Boolean).join(' · '))+'</small>':'')+(s.title?'<h3>'+esc(s.title)+'</h3>':'')+'</div>';
  var href=esc(s.url||'#');
  return s.image?'<a class="slide" href="'+href+'"><img src="'+esc(s.image)+'" alt="'+esc(s.title||'')+'" loading="lazy">'+cap+'</a>'
   :'<a class="slide ph thumb '+esc(s.cls||'t1')+'" href="'+href+'">'+cap+'</a>'}).join('');
 dots.innerHTML=f.map(function(_,k){return '<button aria-label="Slide '+(k+1)+'"></button>'}).join('');
 sl.hidden=false;
 var go=function(n){i=(n+f.length)%f.length;tr.scrollTo({left:i*tr.clientWidth})};
 var mark=function(){i=Math.round(tr.scrollLeft/tr.clientWidth);[].forEach.call(dots.children,function(d,k){d.className=k===i?'on':''})};
 tr.addEventListener('scroll',mark);mark();
 $('sprev').onclick=function(){go(i-1)};$('snext').onclick=function(){go(i+1)};
 [].forEach.call(dots.children,function(d,k){d.onclick=function(){go(k)}});
 var play=function(){clearInterval(timer);if(f.length>1)timer=setInterval(function(){go(i+1)},5000)};
 sl.onmouseenter=function(){clearInterval(timer)};sl.onmouseleave=play;play();
}
})();
