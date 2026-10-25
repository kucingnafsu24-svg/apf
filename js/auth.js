(function(){
var C=window.APF_CONFIG||{},ok=!!(C.supabaseUrl&&C.supabaseAnonKey&&!/GANTI/.test(C.supabaseUrl));
var ref=ok?((C.supabaseUrl.match(/\/\/([^.]+)\./)||[])[1]||''):'';
var isLogin=!!document.getElementById('login-page');

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
  nm=s?(((s.user.user_metadata||{}).name)||String(s.user.email||'Akun').split('@')[0]):'Masuk';
 a.className='acct'+(s?' in':'');
 a.href='/login.html'+(s?'':'?next='+encodeURIComponent(location.pathname+location.search));
 a.setAttribute('aria-label',s?'Akun saya':'Masuk atau daftar');
 a.innerHTML='<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg><span class="acct-a"></span><span class="acct-t"></span>';
 a.querySelector('.acct-t').textContent=nm;
 a.querySelector('.acct-a').textContent=nm.charAt(0).toUpperCase();
 tl.appendChild(a);
}
if(!isLogin)return;

/* ---------- halaman login ---------- */
var $=function(i){return document.getElementById(i)};
var r=document.documentElement;
try{var t=localStorage.getItem('theme');if(t)r.setAttribute('data-theme',t)}catch(e){}
$('theme').onclick=function(){
 var d=r.getAttribute('data-theme')==='dark'||(!r.getAttribute('data-theme')&&matchMedia('(prefers-color-scheme:dark)').matches);
 var n=d?'light':'dark';r.setAttribute('data-theme',n);try{localStorage.setItem('theme',n)}catch(e){}};

var H={in:['Masuk ke akun','Masuk untuk berkomentar dan menyimpan aktivitasmu.'],
 up:['Buat akun baru','Gratis. Cukup nama, email, dan kata sandi.'],
 fg:['Atur ulang kata sandi','Kami kirim tautan reset ke email akunmu.'],
 new:['Kata sandi baru','Masukkan kata sandi baru untuk akunmu.'],
 me:['Akunmu','Kamu sudah masuk.']};
function say(text,err){var m=$('msg');m.hidden=!text;m.textContent=text||'';m.className=err?'err':''}
function view(v){
 say('');
 ['in','up','fg','new'].forEach(function(k){$('f-'+k).hidden=(k!==v)});
 $('me').hidden=(v!=='me');
 $('tabs').hidden=!(v==='in'||v==='up');
 [].forEach.call($('tabs').children,function(b){b.className=b.getAttribute('data-v')===v?'on':''});
 $('h').textContent=H[v][0];$('sub').textContent=H[v][1]}
[].forEach.call($('tabs').children,function(b){b.onclick=function(){view(b.getAttribute('data-v'))}});
[].forEach.call(document.querySelectorAll('[data-go]'),function(b){b.onclick=function(){view(b.getAttribute('data-go'))}});

function nextUrl(){var n=new URLSearchParams(location.search).get('next')||'/';return (n.charAt(0)==='/'&&n.charAt(1)!=='/'&&n.charAt(1)!=='\\')?n:'/'}
function human(e){var m=String(e&&e.message||e||'');
 if(/invalid login/i.test(m))return 'Email atau kata sandi salah.';
 if(/not confirmed/i.test(m))return 'Email belum dikonfirmasi. Cek kotak masuk (dan folder spam).';
 if(/already registered|already been registered/i.test(m))return 'Email ini sudah terdaftar. Coba masuk.';
 if(/rate limit|too many/i.test(m))return 'Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.';
 if(/password/i.test(m)&&/(least|short|weak)/i.test(m))return 'Kata sandi terlalu lemah. Gunakan minimal 8 karakter.';
 return 'Terjadi kesalahan: '+m}

if(!ok||!window.supabase){say('Login belum aktif: isi supabaseUrl dan supabaseAnonKey di js/config.js.',true);
 ['f-in','f-up','f-fg','f-new'].forEach(function(i){$(i).hidden=true});$('tabs').hidden=true;return}

var sb=supabase.createClient(C.supabaseUrl,C.supabaseAnonKey);
var recovery=/type=recovery/.test(location.hash);
function showMe(u){$('me-n').textContent=(u.user_metadata&&u.user_metadata.name)||String(u.email).split('@')[0];$('me-e').textContent=u.email;view('me')}

sb.auth.onAuthStateChange(function(ev){if(ev==='PASSWORD_RECOVERY'){recovery=true;view('new')}});
sb.auth.getSession().then(function(x){var u=x.data&&x.data.session&&x.data.session.user;
 if(recovery)view('new');else if(u)showMe(u);else view('in')});

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
 need(n,'Nama tampilan wajib diisi.');need(mail(e),'Format email tidak valid.');
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

$('out').onclick=function(){sb.auth.signOut().then(function(){location.href='/'})};
})();
