(function(){
var $=function(i){return document.getElementById(i)};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var escRe=function(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')};
var fmt=function(d){try{return new Date(d+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}catch(e){return d}};
var ico='<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
var posts=null,loading=null,vals={};
var known={title:1,author:1,label:1,tag:1,before:1,after:1,artist:1,category:1,file:1};
var OPS=[['tag','Filter berdasarkan tag'],['artist','Filter berdasarkan artist'],['parody','Filter berdasarkan parodi'],['character','Filter berdasarkan karakter'],['genre','Filter berdasarkan genre'],['language','Filter berdasarkan bahasa'],['category','Filter berdasarkan kategori'],['title','Cari teks judul']];
var lower=function(x){return String(x).toLowerCase()};
var uniq=function(a){var s={};return a.filter(function(x){var k=lower(x);if(s[k])return false;s[k]=1;return true})};

function addVal(k,v){vals[k]=vals[k]||{};vals[k][v]=(vals[k][v]||0)+1}

function load(){
 if(posts)return Promise.resolve(posts);
 if(!loading)loading=fetch('/data/posts.json').then(function(r){return r.json()}).then(function(a){
  var tmp=document.createElement('textarea');
  posts=(Array.isArray(a)?a:[]).filter(Boolean).map(function(p){
   var title=String(p.title||'Tanpa judul'),author=String(p.author||'Admin');
   var labs=(p.labels&&p.labels.length)?p.labels.map(String):[];
   var tgo={},tgl={},tall=[];
   if(p.tags&&typeof p.tags==='object'&&!Array.isArray(p.tags))Object.keys(p.tags).forEach(function(k){
    var kk=lower(k);if(kk==='file')kk='category';
    var v=[].concat(p.tags[k]).map(function(x){return String(x).trim()}).filter(Boolean);
    if(v.length)tgo[kk]=(tgo[kk]||[]).concat(v)});
   var art=uniq(labs.concat(tgo.artist||[]));
   Object.keys(tgo).forEach(function(k){tgo[k]=uniq(tgo[k]);tgl[k]=tgo[k].map(lower);known[k]=1;
    tgo[k].forEach(function(x){tall.push(lower(x));addVal('tag',x);if(k!=='artist')addVal(k,x)})});
   tgl.artist=art.map(lower);art.forEach(function(x){addVal('artist',x)});
   tmp.innerHTML=String(p.content||'').replace(/<[^>]*>/g,' ');
   var text=String(tmp.value).replace(/\s+/g,' ').trim(),ex=String(p.excerpt||''),labels=labs.length?labs:['Umum'];
   return {slug:String(p.slug||title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')).toLowerCase(),
    title:title,author:author,labels:labels,date:String(p.date||''),excerpt:ex,image:p.image||'',text:text,
    tgl:tgl,tall:tall,
    lt:lower(title),ll:labels.concat(tall).join(' ').toLowerCase(),la:lower(author),le:lower(ex),lx:lower(text)}});
  return posts}).catch(function(){posts=[];return posts});
 return loading;
}

/* ---- sintaks: kata, "frasa", key:nilai (berisi), key:"nilai" (persis), -key:nilai (kecualikan) ---- */
function parse(q){
 var words=[],ops=[],hl=[],toks=[],re=/(-?)([a-z_][\w-]*):(?:"([^"]*)"|(\S+))|"([^"]+)"|(\S+)/gi,m;
 q=String(q||'');
 while((m=re.exec(q))){
  var key=m[2]?lower(m[2]):'';
  if(key&&known[key]){
   var raw=(m[3]!=null?m[3]:m[4]).trim(),val=lower(raw);
   if(val){var o={type:'op',neg:m[1]==='-',key:key,val:val,raw:raw,exact:m[3]!=null};ops.push(o);toks.push(o);if(!o.neg)hl.push(val)}
  }else{
   var rw=(m[5]||m[6]||m[0]).replace(/^"|"$/g,''),w=lower(rw);
   if(w){words.push(w);hl.push(w);toks.push({type:'word',w:w,raw:rw})}
  }
 }
 return {words:words,ops:ops,hl:hl,toks:toks};
}
function fmtTok(t){return t.type==='word'?(/\s/.test(t.raw)?'"'+t.raw+'"':t.raw):(t.neg?'-':'')+t.key+':'+((t.exact||/\s/.test(t.raw))?'"'+t.raw+'"':t.raw)}
function build(toks){return toks.map(fmtTok).join(' ')}
function partial(q){
 var m=/(?:^|\s)(-?)([a-z_][\w-]*):("?)([^"]*)$/i.exec(q);
 if(m&&known[lower(m[2])]){var tk=m[0].replace(/^\s/,'');return {start:q.length-tk.length,neg:m[1]==='-',key:lower(m[2]),text:m[4]}}
 var w=/(?:^|\s)(-?)([a-z_][\w-]*)$/i.exec(q);
 if(w){var t2=w[0].replace(/^\s/,'');return {start:q.length-t2.length,neg:w[1]==='-',prefix:lower(w[2])}}
 return null;
}

function opMatch(p,op){
 var v=op.val,k=op.key,list;
 if(k==='before')return !!p.date&&p.date<v;
 if(k==='after')return !!p.date&&p.date>v;
 if(k==='title')list=[p.lt];
 else if(k==='author')list=[p.la];
 else if(k==='tag')list=p.tall;
 else{if(k==='label')k='artist';if(k==='file')k='category';list=p.tgl[k]||[]}
 return list.some(function(x){return op.exact?x===v:x.indexOf(v)>-1});
}
function run(o){
 var P=parse(o.q),t=P.words,out=[];
 posts.forEach(function(p){
  var score=0;
  for(var j=0;j<P.ops.length;j++){var op=P.ops[j];if(opMatch(p,op)===op.neg)return;score+=3}
  for(var i=0;i<t.length;i++){
   var s=0,w=t[i],k=p.lt.indexOf(w);
   if(k>-1)s+=k===0?6:5;
   if(p.ll.indexOf(w)>-1)s+=4;
   if(p.la.indexOf(w)>-1)s+=2;
   if(p.le.indexOf(w)>-1)s+=2;
   if(p.lx.indexOf(w)>-1)s+=1;
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
 return h.replace(new RegExp('('+t.map(function(w){return escRe(esc(w))}).join('|')+')','gi'),'<mark>$1</mark>');
}
function snippet(p,t){
 var i=t.length?p.lx.indexOf(t[0]):-1,s;
 if(i>-1){var a=Math.max(0,i-50);s=(a?'… ':'')+p.text.slice(a,a+160)+(a+160<p.text.length?' …':'')}
 else s=p.excerpt||p.text.slice(0,160);
 return hl(s,t);
}
var href=function(p){return '/post.html?s='+encodeURIComponent(p.slug)};
var qurl=function(toks){var s=build(toks);return s?'/?q='+encodeURIComponent(s):'/'};

/* ---- pasang kotak cari di header bila halaman belum punya ---- */
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

/* ---- kotak cari + saran operator (sertakan / kecualikan / hapus) ---- */
var inp=$('q'),res=$('sres'),mode='inc';
function setOpen(b){if(res)res.classList[b?'add':'remove']('open')}
function refresh(){
 if(!inp||!res)return;
 var q=inp.value,part=partial(q),head=part?q.slice(0,part.start):q,P=parse(head);
 var neg=mode==='exc'||!!(part&&part.neg);
 load().then(function(){
  var h='',chips=P.toks.map(function(t,i){return t.type!=='op'?'':
   '<span class="chip '+(t.neg?'exc':'inc')+'"><button type="button" class="chip-t" data-t="'+i+'" title="Klik untuk menyertakan / mengecualikan">'+(t.neg?'−':'+')+' '+esc(t.key)+': '+esc(t.raw)+'</button><button type="button" class="chip-x" data-r="'+i+'" aria-label="Hapus filter">✕</button></span>'}).join('');
  if(chips)h+='<div class="sg-chips">'+chips+'</div>';
  h+='<div class="sg-mode"><button type="button" data-mode="inc" class="'+(neg?'':'on')+'">Sertakan</button><button type="button" data-mode="exc" class="'+(neg?'on':'')+'">Kecualikan</button></div>';
  var showRes=true;
  if(part&&part.key){
   showRes=false;
   var vv=vals[part.key]||{},ks=Object.keys(vv).filter(function(v){return lower(v).indexOf(lower(part.text))>-1})
    .sort(function(a,b){return vv[b]-vv[a]||a.localeCompare(b)}).slice(0,8);
   h+=ks.length?ks.map(function(v){return '<button type="button" class="sg-row" data-act="val" data-v="'+esc(v)+'"><span>'+esc(v)+'</span><em>'+vv[v]+'</em></button>'}).join(''):
    '<div class="sres-empty">'+(part.key==='title'?'Ketik teks judul yang dicari':'Tidak ada saran untuk "'+esc(part.key)+':"')+'</div>';
  }else if(q===''||/\s$/.test(q)||part){
   var extra=Object.keys(vals).filter(function(k){return k!=='tag'&&k!=='artist'&&!OPS.some(function(o){return o[0]===k})}).map(function(k){return [k,'Filter berdasarkan '+k]});
   var rows=OPS.concat(extra).filter(function(o){return !part||!part.prefix||o[0].indexOf(part.prefix)===0});
   h+=rows.map(function(o){return '<button type="button" class="sg-row" data-act="op" data-k="'+esc(o[0])+'"><code>'+(neg?'-':'')+esc(o[0])+':…</code><span>'+esc(o[1])+'</span></button>'}).join('');
  }
  if(showRes){
   var qq=q.trim();
   if(qq&&(parse(qq).toks.length)){
    var t=parse(qq).hl,all=run({q:qq,sort:'rel'});
    h+=all.length?all.slice(0,6).map(function(p){return '<a href="'+esc(href(p))+'"><b>'+hl(p.title,t)+'</b><span>'+esc(p.labels.join(' / '))+'</span></a>'}).join('')+
     '<a class="sg-all" href="/?q='+encodeURIComponent(qq)+'">Lihat '+(all.length>6?'semua ':'')+all.length+' hasil →</a>':
     '<div class="sres-empty">Tidak ada hasil</div>';
   }
  }
  res.innerHTML=h;setOpen(true);
 });
}
if(inp&&res){
 inp.oninput=refresh;
 inp.onfocus=refresh;
 inp.onkeydown=function(e){
  if(e.key==='Enter'&&inp.value.trim()){e.preventDefault();location.href='/?q='+encodeURIComponent(inp.value.trim())}
  if(e.key==='Escape'){setOpen(false);inp.blur()}};
 res.addEventListener('mousedown',function(e){if(!e.target.closest('a'))e.preventDefault()});
 res.addEventListener('click',function(e){
  var b=e.target.closest('[data-mode],[data-act],[data-t],[data-r]');if(!b)return;
  var q=inp.value,part=partial(q),head=part?q.slice(0,part.start):q,ds=b.dataset||{};
  var neg=mode==='exc'||!!(part&&part.neg);
  if(ds.mode){mode=ds.mode;refresh();inp.focus();return}
  if(ds.t!=null||ds.r!=null){
   var P=parse(head),i=+(ds.t!=null?ds.t:ds.r);
   if(ds.t!=null)P.toks[i].neg=!P.toks[i].neg;else P.toks.splice(i,1);
   var s=build(P.toks);inp.value=s+(s?' ':'')+(part?q.slice(part.start):'');refresh();inp.focus();return}
  if(ds.act==='op'){
   var pre=part?q.slice(0,part.start):q+(q&&!/\s$/.test(q)?' ':'');
   inp.value=pre+(neg?'-':'')+ds.k+':"';refresh();inp.focus();return}
  if(ds.act==='val'&&part){
   inp.value=q.slice(0,part.start)+(part.neg?'-':'')+part.key+':"'+ds.v+'" ';refresh();inp.focus()}
 });
}
document.addEventListener('click',function(e){if(res&&!e.target.closest('.sbox')&&!e.target.closest('#sbtn')){setOpen(false);var bx=document.querySelector('.sbox');if(bx)bx.classList.remove('mob-open')}});
document.addEventListener('keydown',function(e){
 if(e.key==='/'&&inp&&!/INPUT|TEXTAREA|SELECT/.test((document.activeElement||{}).tagName||'')){e.preventDefault();inp.focus()}});
var sb=$('sbtn');
if(sb)sb.onclick=function(e){e.stopPropagation();var bx=document.querySelector('.sbox');if(bx)bx.classList.toggle('mob-open');if(inp)inp.focus()};

/* ---- halaman hasil: /?q=... ---- */
var qp=new URLSearchParams(location.search).get('q'),box=$('posts');
if(qp&&box){
 if(inp)inp.value=qp;
 load().then(function(){
  var P=parse(qp),t=P.hl,r=run({q:qp,sort:'rel'});
  var ttl=$('ttl');if(ttl)ttl.textContent='Hasil pencarian ('+r.length+')';
  var sl=$('slider');if(sl)sl.hidden=true;
  var vb=$('view');if(vb)vb.style.display='none';
  var chips=P.toks.map(function(tk,i){
   if(tk.type!=='op')return '';
   var tg=P.toks.map(function(x,j){return j===i?Object.assign({},x,{neg:!x.neg}):x}),rm=P.toks.filter(function(x,j){return j!==i});
   return '<span class="chip '+(tk.neg?'exc':'inc')+'"><a class="chip-t" href="'+esc(qurl(tg))+'" title="Sertakan / kecualikan">'+(tk.neg?'−':'+')+' '+esc(tk.key)+': '+esc(tk.raw)+'</a><a class="chip-x" href="'+esc(qurl(rm))+'" aria-label="Hapus filter">✕</a></span>'}).join('');
  box.innerHTML=(chips?'<div class="sg-chips sr-chips">'+chips+'</div>':'')+'<div class="sm-list sr">'+(r.length?r.map(function(p){
   return '<a class="sm-item" href="'+esc(href(p))+'">'+(p.image?'<img src="'+esc(p.image)+'" alt="" loading="lazy">':'')+
    '<div><b>'+hl(p.title,t)+'</b><small>'+esc(p.labels.join(' / '))+(p.date?' · '+esc(fmt(p.date)):'')+' · '+esc(p.author)+'</small><p>'+snippet(p,t)+'</p></div></a>'}).join(''):
   '<div class="sm-empty">Tidak ada artikel yang cocok. Coba kata lain atau hapus salah satu filter.</div>')+'</div>';
 });
}
window.APF_SEARCH={load:load,run:run,hl:hl,parse:parse,build:build,partial:partial,refresh:refresh};
})();
