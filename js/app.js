(function(){
var r=document.documentElement;
var dummy={style:{},children:[],classList:{add:function(){},remove:function(){},toggle:function(){return false},contains:function(){return false}},addEventListener:function(){},scrollTo:function(){},focus:function(){}};
var $=function(i){var e=document.getElementById(i);return e||(i==='posts'||i==='pop'||i==='labels'||i==='article'?null:dummy)};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var fmt=function(d){return new Date(d+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'})};
try{var t=localStorage.getItem('theme');if(t)r.setAttribute('data-theme',t)}catch(e){}
$('theme').onclick=function(){
 var d=r.getAttribute('data-theme')==='dark'||(!r.getAttribute('data-theme')&&matchMedia('(prefers-color-scheme:dark)').matches);
 var n=d?'light':'dark';r.setAttribute('data-theme',n);try{localStorage.setItem('theme',n)}catch(e){}};

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
fetch('/data/posts.json').then(function(x){return x.json()}).then(withCounts).then(init).catch(function(e){
 var m=$('posts')||$('article');if(m)m.innerHTML='<div class="empty">Gagal memuat artikel. Periksa data/posts.json (kemungkinan ada koma berlebih, kurung kurang, atau tanda kutip salah).<br><small>'+esc(e&&e.message||e)+'</small></div>';console.error(e)});

function init(P){
if(!Array.isArray(P))P=[];
P=P.filter(Boolean).map(function(p){
 p.title=p.title||'Tanpa judul';
 p.slug=p.slug||p.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 p.slug=String(p.slug).toLowerCase();
 p.author=p.author||'Admin';
 p.hasLabels=!!(p.labels&&p.labels.length);
 p.labels=p.hasLabels?p.labels:['Umum'];
 p.date=p.date||new Date().toISOString().slice(0,10);
 p.comments=+p.comments||0;
 p.excerpt=p.excerpt||'';
 p.content=String(p.content==null?'':p.content).trim();
 p.thumb=p.thumb||{cls:'t1',title:p.title.slice(0,14),sub:''};
 p.thumb.cls=p.thumb.cls||'t1';p.thumb.title=p.thumb.title||'';p.thumb.sub=p.thumb.sub||'';
 var tg={};
 if(p.tags&&typeof p.tags==='object'&&!Array.isArray(p.tags)){Object.keys(p.tags).forEach(function(k){
  var a=[].concat(p.tags[k]).map(function(x){return String(x).trim()}).filter(Boolean);
  if(a.length)tg[k.toLowerCase()]=a})}
 if(tg.file){tg.category=(tg.category||[]).concat(tg.file);delete tg.file}
 p.tags=tg;
 return p});
var GN={artist:'Artist',genre:'Genre',category:'Category'},TG=(window.APF_CONFIG&&window.APF_CONFIG.tagGroups)||{};
Object.keys(TG).forEach(function(k){GN[k.toLowerCase()]=TG[k]});
function gname(k){return GN[k]||(k.charAt(0).toUpperCase()+k.slice(1))}
function tlink(k,v){return '/?tag='+encodeURIComponent(k+':'+v)}
function chips(p){var ks=Object.keys(p.tags);if(!ks.length)return '';
 return '<div class="tagrows">'+ks.map(function(k){return '<div class="tagrow"><span>'+esc(gname(k))+'</span>'+
  p.tags[k].map(function(v){return '<a class="tg tg-'+esc(k.replace(/[^a-z0-9]/g,''))+'" href="'+tlink(k,v)+'">'+esc(v)+'</a>'}).join('')+'</div>'}).join('')+'</div>'}
function thumb(p,big){var b=p.comments?'<span class="badge"><svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-11.6 7.1L3 20l1-4.6A8 8 0 1 1 21 12z"/></svg>'+p.comments+'</span>':'';
 if(p.image)return '<'+(big?'div':'a href="/post.html?s='+encodeURIComponent(p.slug)+'"')+' class="thumb">'+b+'<img src="'+esc(p.image)+'" alt="'+esc(p.title)+'" loading="lazy"></'+(big?'div':'a')+'>';
 var st=p.thumb.title.length>6?' style="font-size:'+(big?36:18)+'px"':'';
 return '<'+(big?'div':'a href="/post.html?s='+encodeURIComponent(p.slug)+'"')+' class="thumb '+p.thumb.cls+'">'+b+'<span><strong'+st+'>'+esc(p.thumb.title)+'</strong><small>'+esc(p.thumb.sub)+'</small></span></'+(big?'div':'a')+'>'}
function avatar(p){var C=window.APF_CONFIG||{},u=p.authorImage||(C.authors&&C.authors[p.author]);
 return u?'<img class="av" src="'+esc(u)+'" alt="" loading="lazy">':'<span class="av">'+esc(p.author[0])+'</span>'}
function vlist(p){return (Array.isArray(p.videos)?p.videos:[]).map(function(v,i){
 var o=typeof v==='string'?{url:v}:(v||{});return {title:o.title||('Server '+(i+1)),url:o.url||''}}).filter(function(v){return /^https:\/\//.test(v.url)})}
function videos(p){var v=vlist(p);if(!v.length)return '';
 return '<div class="sec"><div class="sec-h">Streaming</div><div class="sec-b"><div class="vplayer" id="vplayer">'+
  (v.length>1?'<div class="vtabs">'+v.map(function(x,i){return '<button type="button"'+(i?'':' class="on"')+' data-u="'+esc(x.url)+'">'+esc(x.title)+'</button>'}).join('')+'</div>':'')+
  '<div class="video"><iframe src="'+esc(v[0].url)+'" allowfullscreen scrolling="no" frameborder="0" loading="lazy"></iframe></div></div></div></div>'}
function dlist(p){var d=Array.isArray(p.download)?p.download:(p.download?[p.download]:[]);
 return d.filter(Boolean).map(function(g){
  var links=(Array.isArray(g.links)?g.links:[]).map(function(l){l=l||{};return {name:String(l.name||l.title||'Download'),url:String(l.url||'')}}).filter(function(l){return /^https?:\/\//.test(l.url)});
  return {title:g.title?String(g.title):'',links:links}}).filter(function(g){return g.links.length})}
function downloads(p){var g=dlist(p);if(!g.length)return '';
 return '<div class="sec"><div class="sec-h">Unduh</div><div class="sec-b">'+g.map(function(x){
  return '<div class="dl-card">'+(x.title?'<div class="dl-t">'+esc(x.title)+'</div>':'')+'<div class="dl-links">'+
   x.links.map(function(l){return '<a class="dl-btn" href="'+esc(l.url)+'" target="_blank" rel="noopener nofollow">'+esc(l.name)+'</a>'}).join('')+'</div></div>'}).join('')+'</div></div>'}
function bindVideos(){var vp=document.getElementById('vplayer');if(!vp)return;
 var fr=vp.querySelector('iframe'),bs=vp.querySelectorAll('.vtabs button');
 [].forEach.call(bs,function(b){b.onclick=function(){fr.src=b.getAttribute('data-u');[].forEach.call(bs,function(x){x.className=''});b.className='on'}})}
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
function authorLine(p){return '<div class="meta">'+avatar(p)+'<b>'+esc(p.author)+'</b></div>'}
function chipRow(k,vals){return '<div class="tagrow"><span>'+esc(gname(k))+'</span>'+vals.map(function(v){
 return '<a class="tg tg-'+esc(k.replace(/[^a-z0-9]/g,''))+'" href="'+tlink(k,v)+'">'+esc(v)+'</a>'}).join('')+'</div>'}
function artistRow(p){
 var seen={},items=[];
 if(p.hasLabels)p.labels.forEach(function(l){items.push({v:String(l),u:'/?label='+encodeURIComponent(l)})});
 (p.tags.artist||[]).forEach(function(x){items.push({v:x,u:tlink('artist',x)})});
 items=items.filter(function(x){var k=x.v.toLowerCase();if(seen[k])return false;seen[k]=1;return true});
 if(!items.length)return '';
 return '<div class="tagrow"><span>'+esc(gname('artist'))+'</span>'+items.map(function(x){
  return '<a class="tg tg-artist" href="'+esc(x.u)+'">'+esc(x.v)+'</a>'}).join('')+'</div>'}
function bottomRows(p){var ks=[];
 if(p.tags.genre)ks.push('genre');
 Object.keys(p.tags).forEach(function(k){if(k!=='artist'&&k!=='genre'&&k!=='category')ks.push(k)});
 if(p.tags.category)ks.push('category');
 var h=artistRow(p)+ks.map(function(k){return chipRow(k,p.tags[k])}).join('');
 if(!h)return '';
 return '<div class="tagrows tagbottom">'+h+'</div>'}
function meta(p){return '<div class="meta">'+avatar(p)+'<b>'+esc(p.author)+'</b> in '+p.labels.map(function(l){return '<a href="/?label='+encodeURIComponent(l)+'">'+esc(l)+'</a>'}).join(' / ')+'</div>'}
function card(p){
 return '<article class="post"><div>'+(p.sponsored?'<div class="tag">Sponsored</div>':meta(p))+
 '<h3><a href="/post.html?s='+encodeURIComponent(p.slug)+'">'+esc(p.title)+'</a></h3>'+(p.excerpt?'<p>'+esc(p.excerpt)+'</p>':'')+
 (p.sponsored?'<a class="more" href="/post.html?s='+encodeURIComponent(p.slug)+'">Read more</a>':'<span class="date">'+fmt(p.date)+'</span>')+'</div>'+thumb(p)+'</article>'}

var L={};P.forEach(function(p){p.labels.forEach(function(l){L[l]=1})});
if($('pop')){
 var pop=P.slice().sort(function(a,b){return b.comments-a.comments}).slice(0,3);
 $('pop').innerHTML=pop.map(function(p){return '<a href="/post.html?s='+encodeURIComponent(p.slug)+'">'+esc(p.title)+'</a>'}).join('');
}
if($('labels')){
 $('labels').innerHTML=Object.keys(L).map(function(l){return '<a href="/?label='+encodeURIComponent(l)+'">'+esc(l)+'</a>'}).join('');
}

var as=document.querySelector('aside');
if(as){var cnt={};
 P.forEach(function(p){Object.keys(p.tags).forEach(function(k){cnt[k]=cnt[k]||{};p.tags[k].forEach(function(v){cnt[k][v]=(cnt[k][v]||0)+1})})});
 Object.keys(cnt).forEach(function(k){var d=document.createElement('div');d.className='w';
  d.innerHTML='<h4>'+esc(gname(k))+'</h4><div class="labels">'+Object.keys(cnt[k]).sort().map(function(v){
   return '<a href="'+tlink(k,v)+'">'+esc(v)+' <small>'+cnt[k][v]+'</small></a>'}).join('')+'</div>';as.appendChild(d)})}
var cur=new URLSearchParams(location.search).get('label');
var auto=Object.keys(L).map(function(l){return {name:l}});
var drawTopics=function(a){$('topics').innerHTML=a.map(function(t){var u=t.url||'/?label='+encodeURIComponent(t.label||t.name);var on=(t.label||t.name)===cur&&!t.url;return '<a'+(on?' class="on"':'')+' href="'+esc(u)+'">'+esc(t.name)+'</a>'}).join('');var tp=$('topics'),on=tp.querySelector&&tp.querySelector('a.on');if(on)tp.scrollLeft=Math.max(0,on.offsetLeft-(tp.clientWidth-on.offsetWidth)/2)};
fetch('/data/topics.json').then(function(x){return x.json()}).then(function(a){drawTopics(Array.isArray(a)&&a.length?a:auto)}).catch(function(){drawTopics(auto)});
var list=$('posts'),qs=new URLSearchParams(location.search);
if(list){
 var label=qs.get('label'),tag=qs.get('tag')||'',tk='',tv='';
 if(tag.indexOf(':')>0){tk=tag.slice(0,tag.indexOf(':')).toLowerCase();tv=tag.slice(tag.indexOf(':')+1)}
 var data=label?P.filter(function(p){return p.labels.indexOf(label)>-1}):tv?P.filter(function(p){return (p.tags[tk]||[]).indexOf(tv)>-1}):P;
 if(!label&&!tv&&!qs.get('q'))fetch('/data/slider.json').then(function(x){return x.json()}).then(slider).catch(function(){});
 if(label)$('ttl').textContent='Label: '+label;
 if(tv)$('ttl').textContent=gname(tk)+': '+tv;
 var render=function(a){list.innerHTML=a.length?a.map(card).join(''):'<div class="empty">Tidak ada artikel.</div>'};
 if(!qs.get('q'))render(data);
 $('view').onclick=function(){var g=list.classList.toggle('grid');$('vl').textContent=g?'Grid':'List'};
}else{
 var slug=(qs.get('s')||decodeURIComponent(location.pathname.split('/').filter(Boolean).pop()||'')).toLowerCase();
 var p=P.filter(function(x){return x.slug===slug})[0],a=$('article');
 if(!p){document.title='Tidak ditemukan — Fletro Pro';a.innerHTML='<div class="empty">Artikel tidak ditemukan.</div><a class="back" href="/">← Kembali</a>'}
 else{
  cur=p.labels[0];
  document.title=p.title+' — Fletro Pro';
  var d=document.querySelector('meta[name=description]');if(d)d.content=p.excerpt;
  if(p.fullpage){$('layout').classList.add('full');document.querySelector('aside').style.display='none'}
  a.innerHTML='<div class="crumb"><a href="/">Home</a> / '+esc(p.labels[0])+'</div><h1>'+esc(p.title)+'</h1>'+authorLine(p)+
   '<div class="meta"><span>'+fmt(p.date)+'</span></div>'+thumb(p,true)+(p.content?'<div class="entry">'+p.content+'</div>':'')+gallery(p)+bottomRows(p)+videos(p)+downloads(p)+'<a class="back" href="/">← Semua artikel</a>';
  bindVideos();bindGallery(p);
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
