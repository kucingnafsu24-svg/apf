/* Simpan postingan & Artist favorit — TANPA login.
   Data disimpan di localStorage browser ini (tetap ada selama data browser tidak dihapus,
   dan tidak ikut berpindah antar perangkat/browser).
   Kunci: apf_saved_posts (postingan) dan apf_fav_artists (artist). */
(function(){
var KP='apf_saved_posts',KA='apf_fav_artists';
var lc=function(s){return String(s==null?'':s).trim().toLowerCase()};
function read(k){try{var a=JSON.parse(localStorage.getItem(k));return Array.isArray(a)?a.filter(function(x){return x&&typeof x.k==='string'&&x.k}):[]}catch(e){return []}}
function write(k,a){try{localStorage.setItem(k,JSON.stringify(a));return true}catch(e){return false}}
function has(key,k){k=lc(k);return read(key).some(function(x){return x.k===k})}
function add(key,k,n){k=lc(k);if(!k)return false;var a=read(key);if(a.some(function(x){return x.k===k}))return true;a.unshift({k:k,n:n||k,t:Date.now()});return write(key,a)}
function del(key,k){k=lc(k);return write(key,read(key).filter(function(x){return x.k!==k}))}
var ok=(function(){try{var x='__apf';localStorage.setItem(x,'1');localStorage.removeItem(x);return true}catch(e){return false}})();
var S=window.APF_SAVED={ok:ok,
 posts:function(){return read(KP)},artists:function(){return read(KA)},
 hasPost:function(s){return has(KP,s)},addPost:function(s){return add(KP,s,String(s))},delPost:function(s){return del(KP,s)},
 hasArtist:function(n){return has(KA,n)},addArtist:function(n){return add(KA,n,String(n).trim())},delArtist:function(n){return del(KA,n)},
 /* dipakai favorites-sync.js (akun login): gabung item dari server; kosongkan daftar lokal */
 merge:function(kind,items){var key=kind==='artist'?KA:KP,a=read(key),seen={},ch=false;a.forEach(function(x){seen[x.k]=1});
  items.forEach(function(i){var k=lc(i.k);if(k&&!seen[k]){seen[k]=1;a.push({k:k,n:i.n||k,t:i.t||Date.now()});ch=true}});
  if(ch){a.sort(function(x,y){return y.t-x.t});write(key,a)}return ch},
 clear:function(){write(KP,[]);write(KA,[])}};

/* ikon penanda di header (semua halaman) -> daftar tersimpan */
var tl=document.querySelector('.tools');
if(tl&&!tl.querySelector('.bm')){
 var a=document.createElement('a');a.className='bm';a.href='/saved.html';
 a.setAttribute('aria-label','Tersimpan & favorit');a.title='Tersimpan & favorit';
 a.innerHTML='<svg viewBox="0 0 24 24"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg>';
 tl.appendChild(a);
}

/* menu garis tiga (HP, <=760px): blok "Tersimpan" dengan ikon + jumlah.
   app.js menimpa isi #topics, jadi blok dipasang ulang otomatis bila hilang. Di komputer blok tidak dipasang. */
var tp=document.getElementById('topics'),mq=window.matchMedia?window.matchMedia('(max-width:760px)'):null;
if(tp&&mq){
 var BK='<svg viewBox="0 0 24 24"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg>',
     HT='<svg viewBox="0 0 24 24"><path d="M12 21s-7-4.5-9.3-9A5.4 5.4 0 0 1 12 6.6 5.4 5.4 0 0 1 21.3 12C19 16.5 12 21 12 21z"/></svg>';
 var mk=function(){
  var d=document.createElement('div');d.className='tp-saved';
  d.innerHTML='<div class="tp-h">Tersimpan</div>'+
   '<a class="tp-i" href="/saved.html">'+BK+'<span>Postingan tersimpan</span><b data-n="p"></b></a>'+
   '<a class="tp-i" href="/saved.html#artist">'+HT+'<span>Artist favorit</span><b data-n="a"></b></a>';
  return d};
 var counts=function(d){
  var p=S.posts().length,a=S.artists().length,bp=d.querySelector('[data-n="p"]'),ba=d.querySelector('[data-n="a"]');
  bp.textContent=p||'';ba.textContent=a||''};
 var sync=function(){
  var f=tp.firstElementChild,has=!!(f&&f.classList.contains('tp-saved'));
  if(mq.matches){if(!has){f=mk();tp.insertBefore(f,tp.firstChild)}counts(f)}
  else if(has)tp.removeChild(f)};
 new MutationObserver(sync).observe(tp,{childList:true});
 if(mq.addEventListener)mq.addEventListener('change',sync);else if(mq.addListener)mq.addListener(sync);
 var mb=document.getElementById('menu');if(mb)mb.addEventListener('click',sync);
 window.addEventListener('storage',sync);window.addEventListener('pageshow',sync);
 sync();
}

/* tombol Favorit di halaman artist (index.html: /artist/Nama atau /?tag=artist:Nama) */
function artistName(){
 var q=new URLSearchParams(location.search).get('tag'),g='',v='';
 if(q){var i=q.indexOf(':');if(i>0){g=q.slice(0,i);v=q.slice(i+1)}}
 else{var m=location.pathname.match(/^\/([^\/]+)\/([^\/]+)\/?$/);if(m){try{g=decodeURIComponent(m[1]);v=decodeURIComponent(m[2])}catch(e){}}}
 return g.trim().toLowerCase()==='artist'?v.trim():'';
}
var h=document.getElementById('ttl'),tt=h&&h.parentNode,name=document.getElementById('posts')?artistName():'';
if(name&&tt){
 var b=document.createElement('button');b.type='button';b.className='fv-btn';
 b.innerHTML='<svg viewBox="0 0 24 24"><path d="M12 21s-7-4.5-9.3-9A5.4 5.4 0 0 1 12 6.6 5.4 5.4 0 0 1 21.3 12C19 16.5 12 21 12 21z"/></svg><span></span>';
 var paint=function(){var on=S.hasArtist(name);b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false');b.querySelector('span').textContent=on?'Difavoritkan':'Favorit'};
 paint();
 b.onclick=function(){if(S.hasArtist(name))S.delArtist(name);else S.addArtist(name);paint()};
 tt.insertBefore(b,tt.querySelector('i'));
 window.addEventListener('storage',paint);window.addEventListener('pageshow',paint);
}
})();
