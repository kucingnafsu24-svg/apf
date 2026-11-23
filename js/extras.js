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

 /* ---------- 1b) Dock Trakteer bawah (mobile) ---------- */
 try{
  var dk=document.getElementById('dock'),dx=document.getElementById('dock-x');
  if(dk&&dx){
   var mq=window.matchMedia('(max-width:760px)');
   var key='dock-min',saved=false;
   try{saved=sessionStorage.getItem(key)==='1'}catch(e){}
   var paint=function(min){
    dk.classList.toggle('min',min);
    dx.innerHTML=min?'&#9650;':'&#10005;';
    dx.setAttribute('aria-label',min?'Buka':'Tutup');
    document.body.classList.toggle('has-dock',!min&&mq.matches);
   };
   var tk=dk.querySelector('.s-tk');if(tk)tk.textContent='Donate kami disini';
   dk.hidden=false;
   paint(saved);
   dx.addEventListener('click',function(){
    var m=!dk.classList.contains('min');
    paint(m);try{sessionStorage.setItem(key,m?'1':'0')}catch(e){}
   });
   var onmq=function(){paint(dk.classList.contains('min'))};
   if(mq.addEventListener)mq.addEventListener('change',onmq);
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
   var a=document.createElement('a');a.className=cls;a.href='/g/'+encodeURIComponent(x.slug);
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


/* ---------- Mode gelap/terang di dalam menu garis tiga (HANYA mobile, <=760px) ---------- */
(function(){
 try{
  var tp=document.getElementById('topics');if(!tp)return;
  var r=document.documentElement,B=document.body;
  var MOON='<svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  var SUN='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var isDark=function(){var t=r.getAttribute('data-theme');return t==='dark'||(!t&&window.matchMedia&&matchMedia('(prefers-color-scheme:dark)').matches)};
  var paint=function(b){var d=isDark();b.innerHTML=(d?SUN:MOON)+'<span>'+(d?'Mode terang':'Mode gelap')+'</span>';b.setAttribute('aria-label',d?'Ganti ke mode terang':'Ganti ke mode gelap')};
  var ensure=function(){
   var b=document.getElementById('tp-theme'),has=!!tp.querySelector('a');
   if(!has){if(b)b.remove();B.classList.remove('tm-in-menu');return}
   if(b)return;
   b=document.createElement('button');b.type='button';b.id='tp-theme';b.className='tp-theme';paint(b);
   b.onclick=function(e){e.stopPropagation();var n=isDark()?'light':'dark';r.setAttribute('data-theme',n);try{localStorage.setItem('theme',n)}catch(x){}paint(b)};
   tp.appendChild(b);B.classList.add('tm-in-menu');
  };
  new MutationObserver(ensure).observe(tp,{childList:true});
  ensure();
 }catch(e){}
})();
