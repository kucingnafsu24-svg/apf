/* Fitur tambahan, berdiri sendiri (tidak mengubah app.js):
   1) Menu topik (mobile): tombol buka/tutup panel samping
   2) Navigasi artikel Sebelumnya / Selanjutnya di post.html */
(function(){
 /* ---------- 1) Menu topik mobile ---------- */
 try{
  var b=document.getElementById('menu'),B=document.body;
  if(b){
   var set=function(o){B.classList.toggle('topics-open',o);b.setAttribute('aria-expanded',o?'true':'false')};
   b.addEventListener('click',function(e){e.stopPropagation();set(!B.classList.contains('topics-open'))});
   document.addEventListener('click',function(e){if(B.classList.contains('topics-open')&&!(e.target.closest&&e.target.closest('#topics')))set(false)});
   document.addEventListener('keydown',function(e){if(e.key==='Escape')set(false)});
  }
 }catch(e){}

 /* ---------- 2) Sebelumnya / Selanjutnya ---------- */
 var art=document.getElementById('article');
 if(!art)return;

 try{
  var css='.pnav{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:36px}'+
   '.pnav a{display:flex;flex-direction:column;gap:4px;min-width:0;padding:14px 16px;border:1px solid var(--line);border-radius:10px;background:var(--card);transition:border-color .15s}'+
   '.pnav a:hover{border-color:var(--link)}'+
   '.pnav small{font-size:12px;color:var(--link);font-weight:500}'+
   '.pnav b{font-size:14px;line-height:1.4;font-weight:600;color:var(--head);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}'+
   '.pnav .nx{text-align:right}'+
   '@media(max-width:760px){.pnav{margin-top:28px;gap:8px}.pnav a{padding:12px}.pnav b{font-size:13px}}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 }catch(e){}

 function slugOf(p){
  var s=p.slug;
  if(s==null||s==='')s=String(p.title||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  return String(s).toLowerCase();
 }
 var qs=new URLSearchParams(location.search);
 var cur=(qs.get('s')||decodeURIComponent(location.pathname.split('/').filter(Boolean).pop()||'')).toLowerCase();

 function build(list){
  /* satu entri per slug (yang pertama), urut terbaru -> terlama; tanggal sama mengikuti urutan file */
  var seen={},items=[];
  list.forEach(function(p,k){
   if(!p||typeof p!=='object')return;
   var s=slugOf(p);if(!s||seen[s])return;seen[s]=1;
   items.push({slug:s,title:String(p.title||'Tanpa judul'),date:String(p.date||''),k:k});
  });
  items.sort(function(a,b){return a.date<b.date?1:a.date>b.date?-1:a.k-b.k});
  var i=-1;items.forEach(function(x,n){if(x.slug===cur)i=n});
  if(i<0)return null;
  var older=items[i+1]||null,newer=items[i-1]||null;
  if(!older&&!newer)return null;
  var nav=document.createElement('div');
  nav.className='pnav';nav.setAttribute('role','navigation');nav.setAttribute('aria-label','Navigasi artikel');
  function box(x,cls,label){
   if(!x){nav.appendChild(document.createElement('span'));return}
   var a=document.createElement('a');a.className=cls;a.href='/post.html?s='+encodeURIComponent(x.slug);
   a.rel=cls==='pv'?'prev':'next';
   var s=document.createElement('small');s.textContent=label;
   var t=document.createElement('b');t.textContent=x.title;
   a.appendChild(s);a.appendChild(t);nav.appendChild(a);
  }
  box(older,'pv','\u2039 Sebelumnya');box(newer,'nx','Selanjutnya \u203a');
  return nav;
 }

 var navEl=null,done=false;
 function place(){
  if(done||!navEl)return;
  if(!art.querySelector('h1'))return;            /* tunggu artikel selesai dirender app.js */
  if(art.querySelector('.pnav')){done=true;return}
  var rec=art.querySelector('.rec'),back=art.querySelector('a.back');
  if(rec)art.insertBefore(navEl,rec);
  else if(back)art.insertBefore(navEl,back);
  else art.appendChild(navEl);
  done=true;
 }

 fetch('/data/posts.json').then(function(r){return r.json()}).then(function(list){
  if(!Array.isArray(list))return;
  navEl=build(list);if(!navEl)return;
  place();
  if(!done){
   var mo=new MutationObserver(function(){place();if(done)mo.disconnect()});
   mo.observe(art,{childList:true});
  }
 }).catch(function(){});
})();
