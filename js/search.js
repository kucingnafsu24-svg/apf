(function(){
var $=function(i){return document.getElementById(i)};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var escRe=function(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')};
var fmt=function(d){try{return new Date(d+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}catch(e){return d}};
var ico='<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
var posts=null,loading=null;

function load(){
 if(posts)return Promise.resolve(posts);
 if(!loading)loading=fetch('/data/posts.json').then(function(r){return r.json()}).then(function(a){
  var tmp=document.createElement('textarea');
  posts=(Array.isArray(a)?a:[]).filter(Boolean).map(function(p){
   var title=String(p.title||'Tanpa judul'),author=String(p.author||'Admin');
   var labels=(p.labels&&p.labels.length)?p.labels.map(String):['Umum'];
   tmp.innerHTML=String(p.content||'').replace(/<[^>]*>/g,' ');
   var text=String(tmp.value).replace(/\s+/g,' ').trim(),ex=String(p.excerpt||'');
   return {slug:String(p.slug||title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')).toLowerCase(),
    title:title,author:author,labels:labels,date:String(p.date||''),excerpt:ex,image:p.image||'',text:text,
    lt:title.toLowerCase(),ll:labels.join(' ').toLowerCase(),la:author.toLowerCase(),le:ex.toLowerCase(),lx:text.toLowerCase()}});
  return posts}).catch(function(){posts=[];return posts});
 return loading;
}

function terms(q){return String(q||'').toLowerCase().split(/\s+/).filter(Boolean)}

function run(o){
 var t=terms(o.q),out=[];
 posts.forEach(function(p){
  if(o.label&&p.labels.indexOf(o.label)<0)return;
  if(o.from&&(!p.date||p.date<o.from))return;
  if(o.to&&(!p.date||p.date>o.to))return;
  var score=0;
  for(var i=0;i<t.length;i++){
   var s=0,w=t[i],sc=o.scope||'all';
   if(sc==='all'||sc==='title'){var k=p.lt.indexOf(w);if(k>-1)s+=k===0?6:5}
   if(sc==='all'||sc==='label'){if(p.ll.indexOf(w)>-1)s+=4}
   if(sc==='all'||sc==='author'){if(p.la.indexOf(w)>-1)s+=2}
   if(sc==='all'||sc==='content'){if(p.le.indexOf(w)>-1)s+=2;if(p.lx.indexOf(w)>-1)s+=1}
   if(!s)return;
   score+=s}
  out.push({p:p,s:score});
 });
 var by=o.sort||'rel';
 out.sort(function(a,b){
  if(by==='old')return a.p.date<b.p.date?-1:a.p.date>b.p.date?1:0;
  if(by==='az')return a.p.title.localeCompare(b.p.title);
  if(by==='rel'&&b.s!==a.s)return b.s-a.s;
  return a.p.date<b.p.date?1:a.p.date>b.p.date?-1:0});
 return out.map(function(x){return x.p});
}

function hl(text,t){
 var h=esc(text);if(!t.length)return h;
 var re=new RegExp('('+t.map(function(w){return escRe(esc(w))}).join('|')+')','gi');
 return h.replace(re,'<mark>$1</mark>');
}
function snippet(p,t){
 var i=t.length?p.lx.indexOf(t[0]):-1,s;
 if(i>-1){var a=Math.max(0,i-50);s=(a?'… ':'')+p.text.slice(a,a+160)+(a+160<p.text.length?' …':'')}
 else s=p.excerpt||p.text.slice(0,160);
 return hl(s,t);
}
var href=function(p){return '/post.html?s='+encodeURIComponent(p.slug)};

/* ---------- kotak cari di header + hasil cepat ---------- */
/* Pasang kotak cari di header otomatis jika halaman belum punya (mis. post.html lama) */
(function(){
 var tools=document.querySelector('.tools');
 if(!tools||$('sres'))return;
 var ob=$('sbtn');if(ob&&ob.parentNode)ob.parentNode.removeChild(ob);
 var op=$('search');if(op&&op.parentNode)op.parentNode.removeChild(op);
 var box=document.createElement('div');box.className='sbox';
 box.innerHTML=ico+'<input id="q" placeholder="Cari artikel…" aria-label="Cari artikel" autocomplete="off"><div class="sres" id="sres"></div>';
 var btn=document.createElement('button');btn.id='sbtn';btn.setAttribute('aria-label','Cari');btn.innerHTML=ico;
 tools.insertBefore(btn,tools.firstChild);tools.insertBefore(box,btn);
})();
var q=$('q'),res=$('sres');
function quick(){
 if(!q||!res)return;
 var v=q.value.trim();
 if(!v){res.classList.remove('open');res.innerHTML='';return}
 load().then(function(){
  var t=terms(v),all=run({q:v,sort:'rel'}),top=all.slice(0,6);
  res.innerHTML=(top.length?top.map(function(p){
    return '<a href="'+esc(href(p))+'"><b>'+hl(p.title,t)+'</b><span>'+esc(p.labels.join(' / '))+'</span></a>'}).join(''):
    '<div class="sres-empty">Tidak ada hasil untuk "'+esc(v)+'"</div>')+
   '<button type="button" class="sres-all" data-m="1">'+(all.length>6?'Lihat semua '+all.length+' hasil':'Pencarian lanjutan')+' →</button>';
  res.classList.add('open');
  var b=res.querySelector('.sres-all');if(b)b.onclick=function(){openModal(q.value)};
 });
}
if(q){
 q.oninput=quick;
 q.onfocus=function(){if(q.value.trim())quick()};
 q.onkeydown=function(e){
  if(e.key==='Enter'&&q.value.trim()){e.preventDefault();openModal(q.value)}
  if(e.key==='Escape'){res&&res.classList.remove('open');q.blur()}};
}
document.addEventListener('click',function(e){
 if(res&&!e.target.closest('.sbox'))res.classList.remove('open')});
document.addEventListener('keydown',function(e){
 if(e.key==='/'&&q&&!/INPUT|TEXTAREA|SELECT/.test((document.activeElement||{}).tagName||'')){e.preventDefault();q.focus()}});
var sb=$('sbtn');if(sb)sb.onclick=function(){openModal('')};

/* ---------- pencarian lanjutan (modal) ---------- */
var modal=null;
function build(){
 modal=document.createElement('div');modal.className='smodal';modal.hidden=true;
 modal.innerHTML='<div class="sm" role="dialog" aria-label="Pencarian lanjutan">'+
  '<div class="sm-top">'+ico+'<input id="sq" placeholder="Cari judul, isi, label, penulis…" autocomplete="off"><button type="button" class="sm-x" id="sx" aria-label="Tutup"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>'+
  '<div class="sm-filters">'+
   '<label>Cari di<select id="sf-scope"><option value="all">Semua</option><option value="title">Judul</option><option value="content">Isi &amp; ringkasan</option><option value="label">Label</option><option value="author">Penulis</option></select></label>'+
   '<label>Label<select id="sf-label"><option value="">Semua label</option></select></label>'+
   '<label>Urutkan<select id="sf-sort"><option value="rel">Paling sesuai</option><option value="new">Terbaru</option><option value="old">Terlama</option><option value="az">Judul A–Z</option></select></label>'+
   '<label>Dari tanggal<input type="date" id="sf-from"></label>'+
   '<label>Sampai tanggal<input type="date" id="sf-to"></label>'+
   '<button type="button" class="sm-reset" id="sf-reset">Atur ulang</button></div>'+
  '<div class="sm-count" id="sm-count"></div><div class="sm-list" id="sm-list"></div></div>';
 document.body.appendChild(modal);
 modal.addEventListener('mousedown',function(e){if(e.target===modal)closeModal()});
 $('sx').onclick=closeModal;
 ['sq','sf-scope','sf-label','sf-sort','sf-from','sf-to'].forEach(function(id){
  $(id).addEventListener(id==='sq'?'input':'change',update)});
 $('sf-reset').onclick=function(){$('sf-scope').value='all';$('sf-label').value='';$('sf-sort').value='rel';$('sf-from').value='';$('sf-to').value='';update()};
 document.addEventListener('keydown',function(e){if(e.key==='Escape'&&modal&&!modal.hidden)closeModal()});
}
function update(){
 var o={q:$('sq').value,scope:$('sf-scope').value,label:$('sf-label').value,sort:$('sf-sort').value,from:$('sf-from').value,to:$('sf-to').value};
 var t=terms(o.q),list=$('sm-list'),cnt=$('sm-count');
 var filtered=o.label||o.from||o.to;
 if(!t.length&&!filtered){cnt.textContent='';list.innerHTML='<div class="sm-empty">Ketik kata kunci atau pilih filter untuk mulai mencari.</div>';return}
 var r=run(o);
 cnt.textContent=r.length+' hasil';
 list.innerHTML=r.length?r.map(function(p){
  return '<a class="sm-item" href="'+esc(href(p))+'">'+(p.image?'<img src="'+esc(p.image)+'" alt="" loading="lazy">':'')+
   '<div><b>'+hl(p.title,t)+'</b><small>'+esc(p.labels.join(' / '))+(p.date?' · '+esc(fmt(p.date)):'')+' · '+esc(p.author)+'</small>'+
   '<p>'+snippet(p,t)+'</p></div></a>'}).join(''):'<div class="sm-empty">Tidak ada artikel yang cocok. Coba kata lain atau longgarkan filter.</div>';
}
function openModal(v){
 if(!modal)build();
 if(res)res.classList.remove('open');
 load().then(function(){
  var sel=$('sf-label');
  if(sel.options.length<2){var s={};posts.forEach(function(p){p.labels.forEach(function(l){s[l]=1})});
   Object.keys(s).sort().forEach(function(l){var o=document.createElement('option');o.value=l;o.textContent=l;sel.appendChild(o)})}
  $('sq').value=v||'';
  modal.hidden=false;document.documentElement.style.overflow='hidden';
  update();$('sq').focus();
 });
}
function closeModal(){if(modal){modal.hidden=true;document.documentElement.style.overflow=''}}

var qp=new URLSearchParams(location.search).get('q');
if(qp)openModal(qp);
window.APF_SEARCH={load:load,run:run,hl:hl,terms:terms};
})();
