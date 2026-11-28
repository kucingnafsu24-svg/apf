/* Komentar langsung di kartu "Post" halaman channel VTuber/YouTuber (tanpa membuka postingan).
   Memakai tabel/view Supabase yang sama dengan komentar di halaman artikel: comments_live (baca) & comments (kirim). */
(function(){
var C=window.APF_CONFIG||{};
if(!C.supabaseUrl||!C.supabaseAnonKey||/GANTI/.test(C.supabaseUrl))return;
var sb=null,user=null,ready=null,LIMIT=30;
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var safeImg=function(u){return /^https:\/\//.test(u||'')?u:''};
var fmt=function(d){return new Date(d).toLocaleDateString('sv-SE')};
var loginUrl=function(){return '/login.html?next='+encodeURIComponent(location.pathname+location.search)};

function lib(){
 if(window.supabase)return Promise.resolve();
 return new Promise(function(res,rej){var s=document.createElement('script');s.src='/js/lib.js';s.onload=res;s.onerror=function(){rej(new Error('lib'))};document.head.appendChild(s)})}
function client(){
 if(ready)return ready;
 ready=lib().then(function(){
  sb=window.supabase.createClient(C.supabaseUrl,C.supabaseAnonKey);
  return sb.auth.getSession().then(function(r){
   user=r.data&&r.data.session&&r.data.session.user||null;
   sb.auth.onAuthStateChange(function(_e,s){var n=s&&s.user||null;if((n&&n.id)!==(user&&user.id)){user=n;[].forEach.call(document.querySelectorAll('.ytp-c:not([hidden])'),function(p){load(p.parentNode)})}});
   return sb})});
 ready.catch(function(){ready=null});
 return ready}

function slugOf(art){return String(art.getAttribute('data-slug')||'').toLowerCase()}
function setCount(art,n,more){var s=art.querySelector('.ytp-cm span');if(s)s.textContent=n+(more?'+':'')}

function draw(art,rows){
 var p=art.querySelector('.ytp-c');if(!p)return;
 var items=rows.length?rows.map(function(c){
  var av=safeImg(c.avatar_url);
  return '<div class="ytp-ci">'+(av?'<img class="av" src="'+esc(av)+'" alt="" loading="lazy">':'<span class="av">'+esc(Array.from(c.author_name||'?')[0])+'</span>')+
   '<div><div class="ytp-cn"><b>'+esc(c.author_name)+'</b><span>'+fmt(c.created_at)+'</span>'+(user&&user.id===c.user_id?'<button type="button" class="ytp-cd" data-id="'+esc(c.id)+'">Hapus</button>':'')+'</div>'+
   (c.body?'<p>'+esc(c.body)+'</p>':'')+(safeImg(c.image_url)?'<a href="'+esc(c.image_url)+'" target="_blank" rel="noopener" class="ytp-cp"><img src="'+esc(c.image_url)+'" alt="" loading="lazy"></a>':'')+'</div></div>'}).join(''):'<div class="ytp-ce">Belum ada komentar.</div>';
 var form=user?'<div class="ytp-cf"><textarea maxlength="1000" rows="2" placeholder="Tulis komentar…" aria-label="Komentar"></textarea><button type="button" class="ytp-cs">Kirim</button></div>':
  '<div class="ytp-cl"><a href="'+loginUrl()+'">Login</a> untuk menulis komentar.</div>';
 p.innerHTML=form+'<div class="ytp-cmsg" role="status"></div><div class="ytp-cl2">'+items+'</div>'+
  (rows.length>=LIMIT?'<a class="ytp-call" href="/g/'+encodeURIComponent(art.getAttribute('data-slug'))+'">Lihat semua komentar</a>':'');
 setCount(art,rows.length,rows.length>=LIMIT)}

function load(art){
 var p=art.querySelector('.ytp-c');if(!p)return;
 client().then(function(){
  return sb.from('comments_live').select('id,user_id,author_name,avatar_url,body,image_url,created_at').eq('post_slug',slugOf(art)).order('created_at',{ascending:false}).limit(LIMIT)})
 .then(function(r){
  if(r.error){p.innerHTML='<div class="ytp-ce">Komentar tidak dapat dimuat.</div>';console.error(r.error);return}
  draw(art,r.data||[])})
 .catch(function(){p.innerHTML='<div class="ytp-ce">Komentar tidak dapat dimuat. Coba lagi nanti.</div>'})}

function msg(art,t){var m=art.querySelector('.ytp-cmsg');if(m)m.textContent=t||''}

function send(art){
 var ta=art.querySelector('.ytp-cf textarea'),b=art.querySelector('.ytp-cs');
 if(!ta||!user)return;var v=ta.value.trim();if(!v){msg(art,'Komentar kosong.');return}
 b.disabled=true;msg(art,'');
 sb.from('comments').insert({post_slug:slugOf(art),body:v,image_url:null,spoiler:false}).then(function(r){
  b.disabled=false;
  if(r.error){console.error(r.error);msg(art,/cepat/i.test(r.error.message||'')?'Terlalu cepat, tunggu sebentar.':'Gagal mengirim komentar.');return}
  ta.value='';load(art)})}

document.addEventListener('click',function(e){
 var t=e.target;if(!t.closest)return;
 var cm=t.closest('.ytp-cm');
 if(cm){var art=cm.closest('.ytp'),p=art.querySelector('.ytp-c');
  if(p){p.hidden=!p.hidden;cm.setAttribute('aria-expanded',p.hidden?'false':'true');return}
  p=document.createElement('div');p.className='ytp-c';p.innerHTML='<div class="ytp-ce">Memuat komentar…</div>';
  art.appendChild(p);cm.setAttribute('aria-expanded','true');load(art);return}
 var s=t.closest('.ytp-cs');if(s){send(s.closest('.ytp'));return}
 var d=t.closest('.ytp-cd');
 if(d){var a=d.closest('.ytp');if(!confirm('Hapus komentar ini?'))return;
  sb.from('comments').delete().eq('id',d.getAttribute('data-id')).then(function(){load(a)})}});
document.addEventListener('keydown',function(e){
 if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)&&e.target.closest&&e.target.closest('.ytp-cf')){e.preventDefault();send(e.target.closest('.ytp'))}});
})();
