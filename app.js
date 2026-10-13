(function(){
var r=document.documentElement,$=function(i){return document.getElementById(i)};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var fmt=function(d){return new Date(d+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'})};
try{var t=localStorage.getItem('theme');if(t)r.setAttribute('data-theme',t)}catch(e){}
$('theme').onclick=function(){
 var d=r.getAttribute('data-theme')==='dark'||(!r.getAttribute('data-theme')&&matchMedia('(prefers-color-scheme:dark)').matches);
 var n=d?'light':'dark';r.setAttribute('data-theme',n);try{localStorage.setItem('theme',n)}catch(e){}};
$('sbtn').onclick=function(){var s=$('search');s.classList.toggle('open');if(s.classList.contains('open'))$('q').focus()};

fetch('/data/posts.json').then(function(x){return x.json()}).then(init).catch(function(){
 var m=$('posts')||$('article');if(m)m.innerHTML='<div class="empty">Gagal memuat data artikel.</div>'});

function init(P){
function thumb(p,big){var b=p.comments?'<span class="badge"><svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-11.6 7.1L3 20l1-4.6A8 8 0 1 1 21 12z"/></svg>'+p.comments+'</span>':'';
 var st=p.thumb.title.length>6?' style="font-size:'+(big?36:18)+'px"':'';
 return '<'+(big?'div':'a href="/post/'+p.slug+'"')+' class="thumb '+p.thumb.cls+'">'+b+'<span><strong'+st+'>'+esc(p.thumb.title)+'</strong><small>'+esc(p.thumb.sub)+'</small></span></'+(big?'div':'a')+'>'}
function meta(p){return '<div class="meta"><span class="av">'+esc(p.author[0])+'</span><b>'+esc(p.author)+'</b> in '+p.labels.map(function(l){return '<a href="/?label='+encodeURIComponent(l)+'">'+esc(l)+'</a>'}).join(' / ')+'</div>'}
function card(p){
 return '<article class="post"><div>'+(p.sponsored?'<div class="tag">Sponsored</div>':meta(p))+
 '<h3><a href="/post/'+p.slug+'">'+esc(p.title)+'</a></h3><p>'+esc(p.excerpt)+'</p>'+
 (p.sponsored?'<a class="more" href="/post/'+p.slug+'">Read more</a>':'<span class="date">'+fmt(p.date)+'</span>')+'</div>'+thumb(p)+'</article>'}

if($('pop')){
 var pop=P.slice().sort(function(a,b){return b.comments-a.comments}).slice(0,3);
 $('pop').innerHTML=pop.map(function(p){return '<a href="/post/'+p.slug+'">'+esc(p.title)+'</a>'}).join('');
 var L={};P.forEach(function(p){p.labels.forEach(function(l){L[l]=1})});
 $('labels').innerHTML=Object.keys(L).map(function(l){return '<a href="/?label='+encodeURIComponent(l)+'">'+esc(l)+'</a>'}).join('');
}

var list=$('posts'),qs=new URLSearchParams(location.search);
if(list){
 var label=qs.get('label');
 var data=label?P.filter(function(p){return p.labels.indexOf(label)>-1}):P;
 if(label)$('ttl').textContent='Label: '+label;
 var render=function(a){list.innerHTML=a.length?a.map(card).join(''):'<div class="empty">Tidak ada artikel.</div>'};
 var filter=function(v){v=v.toLowerCase();render(data.filter(function(p){return (p.title+p.excerpt+p.labels.join(' ')).toLowerCase().indexOf(v)>-1}))};
 render(data);
 $('view').onclick=function(){var g=list.classList.toggle('grid');$('vl').textContent=g?'Grid':'List'};
 $('q').oninput=function(e){filter(e.target.value)};
 if(qs.get('q')){$('q').value=qs.get('q');$('search').classList.add('open');filter(qs.get('q'))}
}else{
 var slug=decodeURIComponent(location.pathname.split('/').filter(Boolean).pop()||'');
 var p=P.filter(function(x){return x.slug===slug})[0],a=$('article');
 if(!p){document.title='Tidak ditemukan — Fletro Pro';a.innerHTML='<div class="empty">Artikel tidak ditemukan.</div><a class="back" href="/">← Kembali</a>'}
 else{
  document.title=p.title+' — Fletro Pro';
  var d=document.querySelector('meta[name=description]');if(d)d.content=p.excerpt;
  if(p.fullpage){$('layout').classList.add('full');document.querySelector('aside').style.display='none'}
  a.innerHTML='<div class="crumb"><a href="/">Home</a> / '+esc(p.labels[0])+'</div><h1>'+esc(p.title)+'</h1>'+meta(p)+
   '<div class="meta"><span>'+fmt(p.date)+'</span></div>'+thumb(p,true)+'<div class="entry">'+p.content+'</div><a class="back" href="/">← Semua artikel</a>';
 }
 $('q').onkeydown=function(e){if(e.key==='Enter'&&e.target.value)location.href='/?q='+encodeURIComponent(e.target.value)};
}
}
})();
