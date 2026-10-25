(function(){
var C=window.APF_CONFIG||{},ok=!!(C.supabaseUrl&&C.supabaseAnonKey&&!/GANTI/.test(C.supabaseUrl));
var ref=ok?((C.supabaseUrl.match(/\/\/([^.]+)\./)||[])[1]||''):'';
var isLogin=!!document.getElementById('login-page');
function who(u){var m=u.user_metadata||{};return m.display_name||m.full_name||m.name||m.user_name||String(u.email||'Akun').split('@')[0]}
function avatarOf(u){var m=u.user_metadata||{},a=m.avatar_custom||m.avatar_url||m.picture||'';return /^https:\/\//.test(a)?a:''}

/* ---------- tombol Masuk / nama akun di header (semua halaman) ---------- */
function session(){try{var s=JSON.parse(localStorage.getItem('sb-'+ref+'-auth-token'));return s&&s.user&&s.refresh_token?s:null}catch(e){return null}}
var tl=document.querySelector('.tools');
if(ok&&tl&&!isLogin){
 var st=document.createElement('style');
 st.textContent='.acct{display:inline-flex;align-items:center;max-width:140px;padding:7px 16px;margin-left:6px;border-radius:20px;font-size:14px;font-weight:600;white-space:nowrap;background:var(--head);color:var(--bg)}.acct:hover{opacity:.85}.acct-t{overflow:hidden;text-overflow:ellipsis}.acct svg,.acct-a{display:none}'+
  '@media(max-width:760px){.acct{max-width:none;margin:0;padding:10px;border-radius:50%;background:none;color:var(--head)}.acct:hover{opacity:1;background:var(--card)}.acct-t{display:none}.acct svg{display:block}'+
  '.acct.in{padding:8px}.acct.in svg{display:none}.acct-a{width:24px;height:24px;border-radius:50%;background:var(--link);color:#fff;font-size:12px;font-weight:600;align-items:center;justify-content:center}.acct.in .acct-a{display:flex}}';
 document.head.appendChild(st);
 var s=session(),a=document.createElement('a'),
  nm=s?who(s.user):'Masuk';
 a.className='acct'+(s?' in':'');
 a.href='/login.html'+(s?'':'?next='+encodeURIComponent(location.pathname+location.search));
 a.setAttribute('aria-label',s?'Akun saya':'Masuk atau daftar');
 a.innerHTML='<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg><span class="acct-a"></span><span class="acct-t"></span>';
 a.querySelector('.acct-t').textContent=nm;
 var av=s?avatarOf(s.user):'',ae=a.querySelector('.acct-a');
 if(av){ae.style.backgroundImage='url('+JSON.stringify(av)+')';ae.style.backgroundSize='cover';ae.style.backgroundPosition='center'}else ae.textContent=(Array.from(nm)[0]||'?').toUpperCase();
 tl.appendChild(a);
}
if(!isLogin)return;

/* ---------- halaman login ---------- */
var $=function(i){return document.getElementById(i)};
var P=Array.isArray(C.providers)?C.providers:[],NM={discord:'Discord',facebook:'Facebook'};
var r=document.documentElement;
try{var t=localStorage.getItem('theme');if(t)r.setAttribute('data-theme',t)}catch(e){}
$('theme').onclick=function(){
 var d=r.getAttribute('data-theme')==='dark'||(!r.getAttribute('data-theme')&&matchMedia('(prefers-color-scheme:dark)').matches);
 var n=d?'light':'dark';r.setAttribute('data-theme',n);try{localStorage.setItem('theme',n)}catch(e){}};

var H={in:['Masuk ke akun','Masuk untuk berkomentar dan menyimpan aktivitasmu.'],
 up:['Buat akun baru','Gratis. Cukup nama, email, dan kata sandi.'],
 fg:['Atur ulang kata sandi','Kami kirim tautan reset ke email akunmu.'],
 new:['Kata sandi baru','Masukkan kata sandi baru untuk akunmu.'],
 me:['Info akun','']};
function say(text,err){var m=$('msg');m.hidden=!text;m.textContent=text||'';m.className=err?'err':''}
function view(v){
 say('');$('acc').className='acc'+(v==='me'?' wide':'');
 ['in','up','fg','new'].forEach(function(k){$('f-'+k).hidden=(k!==v)});
 $('me').hidden=(v!=='me');
 $('oauth').hidden=!(v==='in'||v==='up')||!P.length;
 $('tabs').hidden=!(v==='in'||v==='up');
 [].forEach.call($('tabs').children,function(b){b.className=b.getAttribute('data-v')===v?'on':''});
 $('h').textContent=H[v][0];$('sub').textContent=H[v][1];$('sub').hidden=!H[v][1]}
[].forEach.call($('tabs').children,function(b){b.onclick=function(){view(b.getAttribute('data-v'))}});
[].forEach.call(document.querySelectorAll('[data-go]'),function(b){b.onclick=function(){view(b.getAttribute('data-go'))}});

var RES=/(admin|moderator|staff|owner|allpirate|fletro)/i;
function reserved(n){return RES.test(n.replace(/[^a-z0-9]/gi,''))}
function nextUrl(){var n=new URLSearchParams(location.search).get('next')||'/';return (n.charAt(0)==='/'&&n.charAt(1)!=='/'&&n.charAt(1)!=='\\')?n:'/'}
function human(e){var m=String(e&&e.message||e||'');
 if(/invalid login/i.test(m))return 'Email atau kata sandi salah.';
 if(/not confirmed/i.test(m))return 'Email belum dikonfirmasi. Cek kotak masuk (dan folder spam).';
 if(/already registered|already been registered/i.test(m))return 'Email ini sudah terdaftar. Coba masuk.';
 if(/rate limit|too many/i.test(m))return 'Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.';
 if(/password/i.test(m)&&/(least|short|weak)/i.test(m))return 'Kata sandi terlalu lemah. Gunakan minimal 8 karakter.';
 if(/row-level security|policy/i.test(m))return 'Izin upload belum diatur. Jalankan supabase_avatar.sql di Supabase.';
 if(/bucket not found/i.test(m))return 'Penyimpanan foto belum dibuat. Jalankan supabase_avatar.sql di Supabase.';
 if(/mime|not supported|invalid/i.test(m)&&/image|type|mime/i.test(m))return 'Format gambar tidak didukung.';
 if(/exceed|too large|maximum|payload/i.test(m))return 'Ukuran gambar terlalu besar.';
 return 'Terjadi kesalahan: '+m}

if(!ok||!window.supabase){say('Login belum aktif: isi supabaseUrl dan supabaseAnonKey di js/config.js.',true);
 ['f-in','f-up','f-fg','f-new'].forEach(function(i){$(i).hidden=true});$('tabs').hidden=true;return}

var sb=supabase.createClient(C.supabaseUrl,C.supabaseAnonKey);
var recovery=/type=recovery/.test(location.hash);
var cu=null;
function showMe(u){cu=u;setPic(u);closeEdit('name');closeEdit('pw');$('me-n').textContent=who(u);$('f-prof').elements.name.value=who(u);$('me-e').textContent=u.email;view('me')}

sb.auth.onAuthStateChange(function(ev){if(ev==='PASSWORD_RECOVERY'){recovery=true;view('new')}});
if(P.length){var o=$('oauth');o.innerHTML='<p class="or">atau</p>';
 P.forEach(function(p){var b=document.createElement('button');b.type='button';b.className='oa p-'+p.replace(/[^a-z0-9]/gi,'');b.textContent='Lanjut dengan '+(NM[p]||p);
  b.onclick=function(){sb.auth.signInWithOAuth({provider:p,options:{redirectTo:location.origin+'/login.html?next='+encodeURIComponent(nextUrl())}}).then(function(x){if(x.error)say(human(x.error),true)})};o.appendChild(b)})}
sb.auth.getSession().then(function(x){var u=x.data&&x.data.session&&x.data.session.user;
 if(recovery)view('new');else if(u){if(new URLSearchParams(location.search).has('next'))location.replace(nextUrl());else showMe(u)}else view('in')});

function run(form,fn){
 form.addEventListener('submit',function(e){e.preventDefault();
  var b=form.querySelector('.go'),f=form.elements;say('');b.disabled=true;
  Promise.resolve().then(function(){return fn(f)}).catch(function(err){say(human(err),true)}).then(function(){b.disabled=false})})}
function need(c,m){if(!c)throw new Error(m)}
var mail=function(v){return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)};

run($('f-in'),function(f){
 need(mail(f.email.value.trim()),'Format email tidak valid.');
 return sb.auth.signInWithPassword({email:f.email.value.trim(),password:f.pw.value}).then(function(x){
  if(x.error)throw x.error;location.href=nextUrl()})});

run($('f-up'),function(f){
 var n=f.name.value.trim(),e=f.email.value.trim();
 need(n,'Nama tampilan wajib diisi.');need(!reserved(n),'Nama ini tidak diperbolehkan.');need(mail(e),'Format email tidak valid.');
 need(f.pw.value.length>=8,'Kata sandi minimal 8 karakter.');need(f.pw.value===f.pw2.value,'Kata sandi tidak sama.');
 return sb.auth.signUp({email:e,password:f.pw.value,options:{data:{name:n},emailRedirectTo:location.origin+'/login.html'}}).then(function(x){
  if(x.error)throw x.error;
  if(x.data.session){location.href=nextUrl();return}
  if(x.data.user&&x.data.user.identities&&!x.data.user.identities.length)throw new Error('already registered');
  view('in');say('Akun dibuat. Cek email untuk konfirmasi, lalu masuk.')})});

run($('f-fg'),function(f){
 var e=f.email.value.trim();need(mail(e),'Format email tidak valid.');
 return sb.auth.resetPasswordForEmail(e,{redirectTo:location.origin+'/login.html'}).then(function(x){
  if(x.error)throw x.error;say('Jika email terdaftar, tautan reset sudah dikirim.')})});

run($('f-new'),function(f){
 need(f.pw.value.length>=8,'Kata sandi minimal 8 karakter.');
 return sb.auth.updateUser({password:f.pw.value}).then(function(x){
  if(x.error)throw x.error;history.replaceState(null,'',location.pathname);location.href='/'})});

function nameOk(n){if(!reserved(n))return Promise.resolve(true);
 return sb.rpc('is_admin').then(function(x){return !x.error&&x.data===true},function(){return false})}
run($('f-prof'),function(f){
 var n=f.name.value.trim();
 need(n.length>=2,'Nama minimal 2 karakter.');
 return nameOk(n).then(function(ok){need(ok,'Nama ini tidak diperbolehkan.');
  return sb.auth.updateUser({data:{display_name:n}})}).then(function(x){
  if(x.error)throw x.error;
  $('me-n').textContent=n;if(x.data&&x.data.user){cu=x.data.user;setPic(cu)}closeEdit('name');
  var done=function(){say('Nama diperbarui.')};
  return sb.rpc('sync_my_comments').then(done,done)})});

function setPic(u){var el=$('pic'),a=avatarOf(u);
 el.style.backgroundImage=a?'url('+JSON.stringify(a)+')':'';
 el.textContent=a?'':(Array.from(who(u))[0]||'?').toUpperCase();
 $('pic-rm').hidden=!(u.user_metadata&&u.user_metadata.avatar_custom)}
/* potong persegi 256px + simpan ulang sebagai WebP (JPEG bila browser tak bisa WebP): membuang metadata & memastikan ini gambar asli */
function square(file){return new Promise(function(res,rej){
 var url=URL.createObjectURL(file),im=new Image();
 im.onload=function(){URL.revokeObjectURL(url);
  var w=im.naturalWidth,h=im.naturalHeight,m=Math.min(w,h),c=document.createElement('canvas'),x=c.getContext('2d');
  c.width=c.height=256;x.fillStyle='#fff';x.fillRect(0,0,256,256);x.drawImage(im,(w-m)/2,(h-m)/2,m,m,0,0,256,256);
  encode(c).then(res,rej)};
 im.onerror=function(){URL.revokeObjectURL(url);rej(new Error('File bukan gambar yang valid.'))};
 im.src=url})}
function pbusy(b){$('pic-up').disabled=b;$('pic-pick').disabled=b;$('pic-rm').disabled=b}
function picDone(msg){return function(x){if(x.error)throw x.error;cu=x.data.user;setPic(cu);
 var d=function(){say(msg)};return sb.rpc('sync_my_comments').then(d,d)}}
$('pic-up').onclick=function(){$('pic-file').click()};
$('pic-file').onchange=function(){var inp=$('pic-file'),f=inp.files[0];inp.value='';if(!f)return;
 say('Mengunggah foto…');pbusy(true);
 Promise.resolve().then(function(){
  need(/^image\/(png|jpeg|webp)$/.test(f.type),'Gunakan gambar PNG, JPG, atau WebP.');
  need(f.size<=8*1048576,'Ukuran file maksimal 8 MB.');return square(f)}).then(function(b){
  var path=cu.id+'/avatar';
  return sb.storage.from('avatars').upload(path,b,{upsert:true,contentType:b.type,cacheControl:'3600'}).then(function(x){
   if(x.error)throw x.error;
   var url=sb.storage.from('avatars').getPublicUrl(path).data.publicUrl+'?v='+Date.now();
   return sb.auth.updateUser({data:{avatar_custom:url}})})}).then(picDone('Foto diperbarui.'))
 .catch(function(e){say(human(e),true)}).then(function(){pbusy(false)})};
$('pic-rm').onclick=function(){say('');pbusy(true);
 sb.storage.from('avatars').remove([cu.id+'/avatar']).then(function(){return sb.auth.updateUser({data:{avatar_custom:null}})})
 .then(picDone('Foto dihapus.')).catch(function(e){say(human(e),true)}).then(function(){pbusy(false)})};

function encode(c){return new Promise(function(res,rej){c.toBlob(function(b){if(b&&b.type==='image/webp')return res(b);
 c.toBlob(function(j){j?res(j):rej(new Error('Gagal memproses gambar.'))},'image/jpeg',.88)},'image/webp',.85)})}
function put(b){var path=cu.id+'/avatar';
 return sb.storage.from('avatars').upload(path,b,{upsert:true,contentType:b.type,cacheControl:'3600'}).then(function(x){
  if(x.error)throw x.error;
  var url=sb.storage.from('avatars').getPublicUrl(path).data.publicUrl+'?v='+Date.now();
  return sb.auth.updateUser({data:{avatar_custom:url}})})}
/* avatar bawaan: digambar di browser lalu diunggah lewat jalur yang sama dengan foto sendiri */
var PRESETS=['/images/avatars/1.webp','/images/avatars/2.webp','/images/avatars/3.webp','/images/avatars/4.webp','/images/avatars/5.webp','/images/avatars/6.webp','/images/avatars/7.webp','/images/avatars/8.webp'];
function fromSrc(src){return new Promise(function(res,rej){var im=new Image();
 im.onload=function(){var w=im.naturalWidth,h=im.naturalHeight,m=Math.min(w,h),c=document.createElement('canvas'),x=c.getContext('2d');
  c.width=c.height=256;x.fillStyle='#fff';x.fillRect(0,0,256,256);x.drawImage(im,(w-m)/2,(h-m)/2,m,m,0,0,256,256);res(c)};
 im.onerror=function(){rej(new Error('Gambar avatar tidak ditemukan.'))};im.src=src})}
$('pic-pick').onclick=function(){var g=$('presets');
 if(!g.firstChild)PRESETS.forEach(function(src,i){var b=document.createElement('button'),im=new Image();
  b.type='button';b.setAttribute('aria-label','Avatar '+(i+1));im.alt='';im.src=src;b.appendChild(im);
  b.onclick=function(){say('Menyimpan avatar…');pbusy(true);
   fromSrc(src).then(encode).then(put).then(picDone('Avatar diperbarui.')).catch(function(e){say(human(e),true)}).then(function(){pbusy(false);g.hidden=true})};
  g.appendChild(b)});
 g.hidden=!g.hidden};

function closeEdit(k){var f=$(k==='name'?'f-prof':'f-pw'),b=document.querySelector('[data-edit="'+k+'"]');
 f.hidden=true;if(k==='name'&&cu)f.elements.name.value=who(cu);else f.reset();if(b)b.hidden=false}
[].forEach.call(document.querySelectorAll('[data-edit]'),function(b){b.onclick=function(){
 var f=$(b.getAttribute('data-edit')==='name'?'f-prof':'f-pw'),i=f.querySelector('input');say('');f.hidden=false;b.hidden=true;if(i)i.focus()}});
[].forEach.call(document.querySelectorAll('[data-cancel]'),function(b){b.onclick=function(){closeEdit(b.getAttribute('data-cancel'))}});
run($('f-pw'),function(f){
 need(f.pw.value.length>=8,'Kata sandi minimal 8 karakter.');need(f.pw.value===f.pw2.value,'Kata sandi tidak sama.');
 return sb.auth.updateUser({password:f.pw.value}).then(function(x){if(x.error)throw x.error;closeEdit('pw');say('Kata sandi diperbarui.')})});

$('out').onclick=function(){sb.auth.signOut().then(function(){location.href='/'})};
})();
