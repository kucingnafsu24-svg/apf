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
$('sbtn').onclick=function(){var s=$('search');s.classList.toggle('open');if(s.classList.contains('open'))$('q').focus()};

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
 p.labels=(p.labels&&p.labels.length)?p.labels:['Umum'];
 p.date=p.date||new Date().toISOString().slice(0,10);
 p.comments=+p.comments||0;
 p.excerpt=p.excerpt||'';
 p.content=p.content||'<p>'+esc(p.excerpt)+'</p>';
 p.thumb=p.thumb||{cls:'t1',title:p.title.slice(0,14),sub:''};
 p.thumb.cls=p.thumb.cls||'t1';p.thumb.title=p.thumb.title||'';p.thumb.sub=p.thumb.sub||'';
 return p});
function thumb(p,big){var b=p.comments?'<span class="badge"><svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-11.6 7.1L3 20l1-4.6A8 8 0 1 1 21 12z"/></svg>'+p.comments+'</span>':'';
 if(p.image)return '<'+(big?'div':'a href="/post.html?s='+encodeURIComponent(p.slug)+'"')+' class="thumb">'+b+'<img src="'+esc(p.image)+'" alt="'+esc(p.title)+'" loading="lazy"></'+(big?'div':'a')+'>';
 var st=p.thumb.title.length>6?' style="font-size:'+(big?36:18)+'px"':'';
 return '<'+(big?'div':'a href="/post.html?s='+encodeURIComponent(p.slug)+'"')+' class="thumb '+p.thumb.cls+'">'+b+'<span><strong'+st+'>'+esc(p.thumb.title)+'</strong><small>'+esc(p.thumb.sub)+'</small></span></'+(big?'div':'a')+'>'}
function avatar(p){var C=window.APF_CONFIG||{},u=p.authorImage||(C.authors&&C.authors[p.author]);
 return u?'<img class="av" src="'+esc(u)+'" alt="" loading="lazy">':'<span class="av">'+esc(p.author[0])+'</span>'}
function meta(p){return '<div class="meta">'+avatar(p)+'<b>'+esc(p.author)+'</b> in '+p.labels.map(function(l){return '<a href="/?label='+encodeURIComponent(l)+'">'+esc(l)+'</a>'}).join(' / ')+'</div>'}
function card(p){
 return '<article class="post"><div>'+(p.sponsored?'<div class="tag">Sponsored</div>':meta(p))+
 '<h3><a href="/post.html?s='+encodeURIComponent(p.slug)+'">'+esc(p.title)+'</a></h3><p>'+esc(p.excerpt)+'</p>'+
 (p.sponsored?'<a class="more" href="/post.html?s='+encodeURIComponent(p.slug)+'">Read more</a>':'<span class="date">'+fmt(p.date)+'</span>')+'</div>'+thumb(p)+'</article>'}

var L={};P.forEach(function(p){p.labels.forEach(function(l){L[l]=1})});
if($('pop')){
 var pop=P.slice().sort(function(a,b){return b.comments-a.comments}).slice(0,3);
 $('pop').innerHTML=pop.map(function(p){return '<a href="/post.html?s='+encodeURIComponent(p.slug)+'">'+esc(p.title)+'</a>'}).join('');
}
if($('labels')){
 $('labels').innerHTML=Object.keys(L).map(function(l){return '<a href="/?label='+encodeURIComponent(l)+'">'+esc(l)+'</a>'}).join('');
}

var cur=new URLSearchParams(location.search).get('label');
var auto=Object.keys(L).map(function(l){return {name:l}});
var drawTopics=function(a){$('topics').innerHTML=a.map(function(t){var u=t.url||'/?label='+encodeURIComponent(t.label||t.name);var on=(t.label||t.name)===cur&&!t.url;return '<a'+(on?' class="on"':'')+' href="'+esc(u)+'">'+esc(t.name)+'</a>'}).join('')};
fetch('/data/topics.json').then(function(x){return x.json()}).then(function(a){drawTopics(Array.isArray(a)&&a.length?a:auto)}).catch(function(){drawTopics(auto)});
var list=$('posts'),qs=new URLSearchParams(location.search);
if(list){
 var label=qs.get('label');
 var data=label?P.filter(function(p){return p.labels.indexOf(label)>-1}):P;
 if(!label)fetch('/data/slider.json').then(function(x){return x.json()}).then(slider).catch(function(){});
 if(label)$('ttl').textContent='Label: '+label;
 var render=function(a){list.innerHTML=a.length?a.map(card).join(''):'<div class="empty">Tidak ada artikel.</div>'};
 var filter=function(v){v=v.toLowerCase();render(data.filter(function(p){return (p.title+p.excerpt+p.labels.join(' ')).toLowerCase().indexOf(v)>-1}))};
 render(data);
 $('view').onclick=function(){var g=list.classList.toggle('grid');$('vl').textContent=g?'Grid':'List'};
 $('q').oninput=function(e){filter(e.target.value)};
 if(qs.get('q')){$('q').value=qs.get('q');$('search').classList.add('open');filter(qs.get('q'))}
}else{
 var slug=(qs.get('s')||decodeURIComponent(location.pathname.split('/').filter(Boolean).pop()||'')).toLowerCase();
 var p=P.filter(function(x){return x.slug===slug})[0],a=$('article');
 if(!p){document.title='Tidak ditemukan — Fletro Pro';a.innerHTML='<div class="empty">Artikel tidak ditemukan.</div><a class="back" href="/">← Kembali</a>'}
 else{
  cur=p.labels[0];
  document.title=p.title+' — Fletro Pro';
  var d=document.querySelector('meta[name=description]');if(d)d.content=p.excerpt;
  if(p.fullpage){$('layout').classList.add('full');document.querySelector('aside').style.display='none'}
  a.innerHTML='<div class="crumb"><a href="/">Home</a> / '+esc(p.labels[0])+'</div><h1>'+esc(p.title)+'</h1>'+meta(p)+
   '<div class="meta"><span>'+fmt(p.date)+'</span></div>'+thumb(p,true)+'<div class="entry">'+p.content+'</div><a class="back" href="/">← Semua artikel</a>';
 }
 $('q').onkeydown=function(e){if(e.key==='Enter'&&e.target.value)location.href='/?q='+encodeURIComponent(e.target.value)};
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
