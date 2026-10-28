(function(){
var $=function(i){return document.getElementById(i)};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var escRe=function(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')};
var fmt=function(d){try{return new Date(d+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}catch(e){return d}};
var ico='<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
var clock='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
var posts=null,loading=null,vals={},tagGroup={},hasTagGroup=false;
var known={title:1,author:1,label:1,tag:1,before:1,after:1,artist:1,category:1,file:1};
var OPS=[['tag','Filter berdasarkan tag'],['artist','Filter berdasarkan artist'],['label','Filter berdasarkan label'],['parody','Filter berdasarkan parodi'],['character','Filter berdasarkan karakter'],['genre','Filter berdasarkan genre'],['language','Filter berdasarkan bahasa'],['category','Filter berdasarkan kategori'],['title','Cari teks judul']];
var lower=function(x){return String(x).toLowerCase()};
var uniq=function(a){var s={};return a.filter(function(x){var k=lower(x);if(s[k])return false;s[k]=1;return true})};
var norm=function(s){return lower(s).normalize('NFKD').replace(/[\u0300-\u036f]/g,'')};
var toks=function(s){return norm(s).split(/[^\p{L}\p{N}]+/u).filter(Boolean)};
function ed(a,b,max){
 var al=a.length,bl=b.length,i,j;if(Math.abs(al-bl)>max)return max+1;
 var p2=null,p=[],c;for(j=0;j<=bl;j++)p[j]=j;
 for(i=1;i<=al;i++){c=[i];var rm=i;
  for(j=1;j<=bl;j++){var x=a[i-1]===b[j-1]?0:1,v=Math.min(p[j]+1,c[j-1]+1,p[j-1]+x);
   if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])v=Math.min(v,p2[j-2]+1);
   c[j]=v;if(v<rm)rm=v}
  if(rm>max)return max+1;p2=p;p=c}
 return p[bl]}
/* kata mirip: salah ketik 1-2 huruf, atau awalan kata yang mirip */
function near(tk,w){
 w=norm(w);var n=w.length,max=n<=2?0:n<=6?1:2;if(!n)return false;
 return tk.some(function(t){
  if(t.indexOf(w)>-1)return true;
  if(!max||(n===3&&t.length<4))return false;
  if(Math.abs(t.length-n)<=max&&ed(t,w,max)<=max)return true;
  return t.length>n&&ed(t.slice(0,n),w,max)<=max})}
var vcase={};
/* nilai yang sama tapi beda huruf besar/kecil dihitung satu (tampilan memakai penulisan pertama) */
function addVal(k,v){vals[k]=vals[k]||{};vcase[k]=vcase[k]||{};var l=lower(v),c=vcase[k][l];if(c==null){c=v;vcase[k][l]=v}vals[k][c]=(vals[k][c]||0)+1}

function load(){
 if(posts)return Promise.resolve(posts);
 if(!loading)loading=fetch('/data/posts.json').then(function(r){return r.json()}).then(function(a){
  var tmp=document.createElement('textarea');
  posts=(Array.isArray(a)?a:[]).filter(Boolean).map(function(p){
   var title=String(p.title||'Tanpa judul'),author=String(p.author||'Admin');
   var labs=(p.labels&&p.labels.length)?p.labels.map(String):[];
   var tgo={},tgl={},tall=[];
   if(p.tags&&typeof p.tags==='object'&&!Array.isArray(p.tags))Object.keys(p.tags).forEach(function(k){
    var kk=lower(k);if(kk==='file')kk='category';if(kk==='tags')kk='tag';if(kk==='tag')hasTagGroup=true;
    var v=[].concat(p.tags[k]).map(function(x){return String(x).trim()}).filter(Boolean);
    if(v.length)tgo[kk]=(tgo[kk]||[]).concat(v)});
   Object.keys(tgo).forEach(function(k){tgo[k]=uniq(tgo[k]);tgl[k]=tgo[k].map(lower);known[k]=1;
    tgo[k].forEach(function(x){tall.push(lower(x));
     if(k!=='artist'){addVal('tag',x);if(k!=='tag')addVal(k,x);tagGroup[lower(x)]=tagGroup[lower(x)]||k}})});
   var lab=uniq(labs);tgl.label=lab.map(lower);lab.forEach(function(x){addVal('label',x)});
   (tgo.artist||[]).forEach(function(x){addVal('artist',x)});tgl.artist=(tgo.artist||[]).map(lower);
   tmp.innerHTML=String(p.content||'').replace(/<[^>]*>/g,' ');
   var text=String(tmp.value).replace(/\s+/g,' ').trim(),ex=String(p.excerpt||''),labels=labs.length?labs:['Umum'];
   return {slug:String(p.slug||title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')).toLowerCase(),
    title:title,author:author,labels:labels,date:String(p.date||''),excerpt:ex,image:p.image||'',text:text,
    tgl:tgl,tall:tall,ltk:toks(title),
    lt:lower(title),ll:labels.concat(tall).join(' ').toLowerCase(),la:lower(author),le:lower(ex),lx:lower(text)}});
  return posts}).catch(function(){posts=[];return posts});
 return loading;
}

/* ---- sintaks: kata, "frasa", key:nilai (berisi), key:"nilai" (persis), -key:nilai (kecualikan) ---- */
function parse(q){
 var words=[],ops=[],hl=[],tk=[],re=/(-?)([a-z_][\w-]*):(?:"([^"]*)"|(\S+))|"([^"]+)"|(\S+)/gi,m;
 q=String(q||'');
 while((m=re.exec(q))){
  var key=m[2]?lower(m[2]):'';
  if(key&&known[key]){
   var raw=(m[3]!=null?m[3]:m[4]).trim(),val=lower(raw);
   if(val){var o={type:'op',neg:m[1]==='-',key:key,val:val,raw:raw,exact:m[3]!=null};ops.push(o);tk.push(o);if(!o.neg)hl.push(val)}
  }else{
   var rw=(m[5]||m[6]||m[0]).replace(/^"|"$/g,''),w=lower(rw);
   if(w){words.push(w);hl.push(w);tk.push({type:'word',w:w,raw:rw})}
  }
 }
 return {words:words,ops:ops,hl:hl,toks:tk};
}
function fmtTok(t){return t.type==='word'?(/\s/.test(t.raw)?'"'+t.raw+'"':t.raw):(t.neg?'-':'')+t.key+':'+((t.exact||/\s/.test(t.raw))?'"'+t.raw+'"':t.raw)}
function build(t){return t.map(fmtTok).join(' ')}
/* token operator lengkap di ujung teks: key:"nilai", atau key:nilai bila nilainya persis sama dengan yang ada */
function lastTok(q){
 var m=/(?:^|\s)(-?)([a-z_][\w-]*):(?:"([^"]*)"|([^\s"]+))$/i.exec(q);
 if(!m||!known[lower(m[2])])return null;
 var quoted=m[3]!=null,raw=quoted?m[3]:m[4],key=lower(m[2]);
 if(!raw)return null;
 if(!quoted&&vals[key]){var exact=Object.keys(vals[key]).some(function(v){return lower(v)===lower(raw)});if(!exact)return null}
 var t=m[0].replace(/^\s/,'');
 return {start:q.length-t.length,neg:m[1]==='-',key:key,raw:raw,quoted:quoted,token:t};
}
/* token yang sedang diketik: key:"ma / key:ma  atau awalan operator */
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
 if(k==='title')return p.lt.indexOf(v)>-1||(!op.exact&&near(p.ltk,v));
 else if(k==='author')list=[p.la];
 else if(k==='tag')list=p.tall;
 else{if(k==='file')k='category';list=p.tgl[k]||[]}
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
   if(!s&&near(p.ltk,w))s+=3;
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
var qurl=function(t){var s=build(t);return s?'/?q='+encodeURIComponent(s):'/'};

/* ---- riwayat pencarian (disimpan di browser ini): bintang = disematkan, ✕ = hapus ---- */
var HK='apf_hist_v1';
function hLoad(){try{var a=JSON.parse(localStorage.getItem(HK)||'[]');return Array.isArray(a)?a.filter(function(x){return x&&typeof x.q==='string'&&x.q}):[]}catch(e){return []}}
function hSave(a){try{localStorage.setItem(HK,JSON.stringify(a))}catch(e){}}
function hAdd(q){q=String(q||'').trim();if(!q)return;
 var a=hLoad(),i,star=false;for(i=0;i<a.length;i++)if(a[i].q===q){star=!!a[i].s;a.splice(i,1);break}
 a.unshift({q:q,s:star,t:Date.now()});
 var n=0;a=a.filter(function(x){if(x.s)return true;return ++n<=15});hSave(a.slice(0,40))}
function hStar(q){q=String(q||'').trim();if(!q)return;var a=hLoad(),f=false;
 a.forEach(function(x){if(x.q===q){x.s=!x.s;f=true}});if(!f)a.unshift({q:q,s:true,t:Date.now()});hSave(a)}
function hDel(q){hSave(hLoad().filter(function(x){return x.q!==q}))}
function hIsStar(q){return hLoad().some(function(x){return x.q===q&&x.s})}

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

/* ---- panel saran ala nhentai ---- */
var inp=$('q'),res=$('sres'),hi=-1;
var cnt=function(n){return n>=1000?(n/1000).toFixed(1).replace(/\.0$/,'')+'k':String(n)};
var badge=function(g){return '<i class="bd bd-'+esc(String(g).replace(/[^a-z0-9]/gi,'').toLowerCase())+'">'+esc(g)+'</i>'};
var valRow=function(k,v,n,ctx){var g=k==='tag'?(tagGroup[lower(v)]||'tag'):k,d=' data-ctx="'+ctx+'" data-k="'+esc(k)+'" data-v="'+esc(v)+'"';
 var pm=ctx==='c'?'':'<span class="sg-pm inc" role="button" title="Sertakan" data-act="vinc"'+d+'>+</span><span class="sg-pm exc" role="button" title="Kecualikan" data-act="vexc"'+d+'>−</span>';
 return '<div class="sg-val" data-nav="1" data-act="val"'+d+'>'+badge(g)+'<span class="sg-n">'+esc(v)+'</span><em>'+cnt(n)+'</em>'+pm+'<b class="sg-go">→</b></div>'};
function actRows(lt){
 var base=lt.key+':"'+lt.raw+'"',cur=lt.neg;
 return '<button type="button" class="sg-act inc'+(cur?'':' cur')+'" data-nav="1" data-act="inc"><span>+ Sertakan</span><code>'+esc(base)+'</code>'+(cur?'':'<i>aktif</i>')+'</button>'+
  '<button type="button" class="sg-act exc'+(cur?' cur':'')+'" data-nav="1" data-act="exc"><span>− Kecualikan</span><code>'+esc('-'+base)+'</code>'+(cur?'<i>aktif</i>':'')+'</button>'+
  '<button type="button" class="sg-act rm" data-nav="1" data-act="rm"><span>× Hapus</span><code>'+esc(lt.token)+'</code></button>'}
function opRows(prefix,neg){
 var extra=Object.keys(vals).filter(function(k){return k!=='tag'&&k!=='artist'&&!OPS.some(function(o){return o[0]===k})}).map(function(k){return [k,'Filter berdasarkan '+k]});
 return OPS.concat(extra).filter(function(o){var k=o[0],has=k==='title'||(k==='tag'?hasTagGroup:!!(vals[k]&&Object.keys(vals[k]).length));
  return has&&(!prefix||k.indexOf(prefix)===0)}).map(function(o){
  return '<button type="button" class="sg-op" data-nav="1" data-act="op" data-k="'+esc(o[0])+'"><code>'+(neg?'-':'')+esc(o[0])+':…</code><span>'+esc(o[1])+'</span></button>'}).join('')}
function histRows(){
 var a=hLoad().sort(function(x,y){return (y.s?1:0)-(x.s?1:0)||(y.t||0)-(x.t||0)}).slice(0,8);
 return a.map(function(x){return '<div class="sg-hist" data-nav="1" data-act="hist" data-q="'+esc(x.q)+'">'+clock+'<code>'+esc(x.q)+'</code>'+
  '<button type="button" class="sg-ic'+(x.s?' on':'')+'" data-act="hstar" data-q="'+esc(x.q)+'" aria-label="Sematkan">'+(x.s?'★':'☆')+'</button>'+
  '<button type="button" class="sg-ic" data-act="hdel" data-q="'+esc(x.q)+'" aria-label="Hapus riwayat">✕</button></div>'}).join('')}
function headRow(q){return '<div class="sg-head" data-nav="1" data-act="go"><span>Cari untuk</span><b>'+esc(q)+'</b><button type="button" class="sg-ic'+(hIsStar(q)?' on':'')+'" data-act="star" aria-label="Simpan pencarian">'+(hIsStar(q)?'★':'☆')+'</button></div>'}
function matchVals(w,limit){
 var l=lower(w),out=[];if(!l)return out;
 Object.keys(vals).forEach(function(k){if(k==='tag')return;Object.keys(vals[k]).forEach(function(v){if(lower(v).indexOf(l)>-1)out.push({k:k,v:v,n:vals[k][v]})})});
 return out.sort(function(a,b){return b.n-a.n}).slice(0,limit)}
function setOpen(b){if(res)res.classList[b?'add':'remove']('open')}
function go(q){q=String(q||'').trim();if(!q)return;hAdd(q);location.href='/?q='+encodeURIComponent(q)}

function refresh(){
 if(!inp||!res)return;
 var q=inp.value;
 load().then(function(){
  var h='',tq=q.trim(),lt=lastTok(q),part=lt?null:partial(q);
  if(!tq){h+=histRows()+opRows('',false)}
  else{
   h+=headRow(tq);
   if(lt){
    h+=actRows(lt);
    var vv=vals[lt.key]||{},found=Object.keys(vv).filter(function(v){return lower(v)===lower(lt.raw)})[0];
    if(lt.quoted){if(found!=null)h+=valRow(lt.key,found,vv[found],'c')}
    else{Object.keys(vv).filter(function(v){return lower(v).indexOf(lower(lt.raw))>-1}).sort(function(x,y){return vv[y]-vv[x]||x.localeCompare(y)}).slice(0,8)
     .forEach(function(v){h+=valRow(lt.key,v,vv[v],'p')})}
   }else if(part&&part.key){
    var pv=vals[part.key]||{},ks=Object.keys(pv).filter(function(v){return lower(v).indexOf(lower(part.text))>-1})
     .sort(function(a,b){return pv[b]-pv[a]||a.localeCompare(b)}).slice(0,10);
    h+=ks.length?ks.map(function(v){return valRow(part.key,v,pv[v],'p')}).join(''):
     '<div class="sres-empty">'+(part.key==='title'?'Ketik teks judul yang dicari':'Tidak ada saran untuk "'+esc(part.key)+':"')+'</div>';
   }else{
    var lw=/\s$/.test(q)?'':q.trim().split(/\s+/).pop().replace(/^-+/,'').replace(/^"|"$/g,'');
    if(part&&part.prefix)h+=opRows(part.prefix,part.neg);
    else if(!lw)h+=opRows('',false);
    var mv=matchVals(lw,5);
    h+=mv.map(function(x){return valRow(x.k,x.v,x.n,'w')}).join('');
    if(parse(tq).toks.length){
     var t=parse(tq).hl,all=run({q:tq,sort:'rel'});
     h+=all.length?all.slice(0,5).map(function(p){return '<a data-nav="1" href="'+esc(href(p))+'"><b>'+hl(p.title,t)+'</b><span>'+esc(p.labels.join(' / '))+'</span></a>'}).join('')+
      '<a class="sg-all" data-nav="1" href="/?q='+encodeURIComponent(tq)+'">Lihat '+(all.length>5?'semua ':'')+all.length+' hasil →</a>':
      (mv.length?'':'<div class="sres-empty">Tidak ada hasil</div>');
    }
   }
  }
  res.innerHTML=h;hi=-1;setOpen(true);
 });
}
if(inp&&res){
 inp.oninput=refresh;
 inp.onfocus=refresh;
 inp.onkeydown=function(e){
  var items=res.querySelectorAll('[data-nav]'),n=items.length;
  if((e.key==='ArrowDown'||e.key==='ArrowUp')&&n){
   e.preventDefault();hi=e.key==='ArrowDown'?(hi+1)%n:(hi<=0?n-1:hi-1);
   [].forEach.call(items,function(el,i){el.classList[i===hi?'add':'remove']('hi')});
   if(items[hi]&&items[hi].scrollIntoView)items[hi].scrollIntoView({block:'nearest'});
   return}
  if(e.key==='Enter'){e.preventDefault();
   if(hi>-1&&items[hi])items[hi].click();else go(inp.value);return}
  if(e.key==='Escape'){setOpen(false);inp.blur()}};
 res.addEventListener('mousedown',function(e){if(!e.target.closest('a'))e.preventDefault()});
 res.addEventListener('click',function(e){
  var b=e.target.closest('[data-act]');if(!b)return;
  var ds=b.dataset||{},act=ds.act,q=inp.value,lt=lastTok(q),part=lt?null:partial(q),keep=true;
  if(act==='go'){go(q);return}
  var place=function(ctx,k,v,neg){
   if(ctx==='p'&&part)return q.slice(0,part.start)+(neg?'-':'')+k+':"'+v+'"';
   if(ctx==='p'&&lt)return q.slice(0,lt.start)+(neg?'-':'')+k+':"'+v+'"';
   if(ctx==='w'){var m=/(\S+)$/.exec(q),st=m?q.length-m[1].length:q.length;return q.slice(0,st)+(neg?'-':'')+k+':"'+v+'"'}
   return q};
  if(act==='hist'){inp.value=ds.q;go(ds.q);return}
  if(act==='star')hStar(q);
  else if(act==='hstar')hStar(ds.q);
  else if(act==='hdel')hDel(ds.q);
  else if(act==='op'){
   var pre=part?q.slice(0,part.start):(q&&!/\s$/.test(q)?q+' ':q);
   inp.value=pre+((part&&part.neg)?'-':'')+ds.k+':"';
  }else if(act==='val'){
   if(ds.ctx==='c')inp.value=q+' ';
   else if(ds.ctx==='p'&&part)inp.value=place('p',ds.k,ds.v,part.neg);
   else if(ds.ctx==='p'&&lt)inp.value=place('p',ds.k,ds.v,lt.neg);
   else if(ds.ctx==='w'){var mm=/(\S+)$/.exec(q);inp.value=place('w',ds.k,ds.v,mm&&mm[1].charAt(0)==='-')}
  }else if(act==='vinc'||act==='vexc'){inp.value=place(ds.ctx,ds.k,ds.v,act==='vexc')}
  else if((act==='inc'||act==='exc')&&lt){inp.value=q.slice(0,lt.start)+(act==='exc'?'-':'')+lt.key+':"'+lt.raw+'"'}
  else if(act==='rm'&&lt){var r=q.slice(0,lt.start).replace(/\s+$/,'');inp.value=r?r+' ':''}
  else keep=false;
  refresh();if(keep&&inp.focus)inp.focus();
 });
}
document.addEventListener('click',function(e){
 if(!res)return;
 /* Saat tag/kategori/filter diklik, daftar saran dirender ulang sehingga elemen yang diklik terlepas dari halaman.
    Dulu itu dianggap "klik di luar" dan kotak cari ikut tertutup. Sekarang diperiksa lewat jalur klik aslinya. */
 var path=e.composedPath?e.composedPath():[],
  inside=path.some(function(n){return n&&n.classList&&(n.classList.contains('sbox')||n.id==='sbtn')})||
   !!(e.target.closest&&(e.target.closest('.sbox')||e.target.closest('#sbtn')));
 if(inside||e.target.isConnected===false)return;
 setOpen(false);var bx=document.querySelector('.sbox');if(bx)bx.classList.remove('mob-open')});
document.addEventListener('keydown',function(e){
 if(e.key==='/'&&inp&&!/INPUT|TEXTAREA|SELECT/.test((document.activeElement||{}).tagName||'')){e.preventDefault();inp.focus()}});
var sb=$('sbtn');
if(sb)sb.onclick=function(e){e.stopPropagation();var bx=document.querySelector('.sbox');if(bx)bx.classList.toggle('mob-open');if(inp)inp.focus()};

/* ---- halaman hasil: /?q=... ---- */
var qp=new URLSearchParams(location.search).get('q'),box=$('posts');
if(qp&&box){
 if(inp)inp.value=qp;
 hAdd(qp);
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
window.APF_SEARCH={load:load,run:run,hl:hl,parse:parse,build:build,partial:partial,lastTok:lastTok,refresh:refresh,hLoad:hLoad,hAdd:hAdd};
})();
