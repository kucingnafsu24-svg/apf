/* Sinkron Simpan postingan & Artist favorit ke AKUN (hanya jika sedang login).
   - Tanpa login: tidak ada yang berubah, semua tetap di browser (favorites.js).
   - Dengan login: tiap simpan/hapus ikut dikirim ke Supabase; saat halaman dibuka, isi akun digabung
     dengan daftar di browser ini (gabungan, tidak ada yang hilang), sehingga ikut ke perangkat lain.
   Tabel: saved_posts (post_slug) dan favorite_artists (artist_key, artist_name). */
(function(){
var S=window.APF_SAVED,C=window.APF_CONFIG||{};
if(!S||!S.ok||!C.supabaseUrl||!C.supabaseAnonKey||/GANTI/.test(C.supabaseUrl))return;
var ref='';try{ref=new URL(C.supabaseUrl,location.href).hostname.split('.')[0]}catch(e){return}
var MK='apf_sync_uid',lc=function(s){return String(s==null?'':s).trim().toLowerCase()};
function session(){try{var s=JSON.parse(localStorage.getItem('sb-'+ref+'-auth-token'));return s&&s.user&&s.refresh_token?s:null}catch(e){return null}}
function warn(e){try{console.warn('[favorit] sinkron akun gagal:',(e&&e.message)||e)}catch(x){}}
function ping(){try{window.dispatchEvent(new Event('storage'))}catch(e){}}

var sbP=null;
function client(){
 if(sbP)return sbP;
 sbP=new Promise(function(res,rej){
  function mk(){try{res(window.supabase.createClient(C.supabaseUrl,C.supabaseAnonKey))}catch(e){sbP=null;rej(e)}}
  if(window.supabase)return mk();
  var sc=document.createElement('script');sc.src='/js/lib.js';sc.onload=mk;
  sc.onerror=function(){sbP=null;rej(new Error('gagal memuat layanan akun'))};document.head.appendChild(sc)});
 return sbP}

var T={post:{tb:'saved_posts',col:'post_slug',sel:'post_slug,created_at'},
       artist:{tb:'favorite_artists',col:'artist_key',sel:'artist_key,artist_name,created_at'}};
function row(kind,k,n){var o={};o[T[kind].col]=k;if(kind==='artist')o.artist_name=n||k;return o}

function push(kind,k,n){
 if(!session())return;
 client().then(function(sb){var t=T[kind];
  return sb.from(t.tb).select(t.col).eq(t.col,k).maybeSingle().then(function(r){
   if(r.error)throw r.error;if(r.data)return;
   return sb.from(t.tb).insert(row(kind,k,n)).then(function(x){if(x.error&&x.error.code!=='23505')throw x.error})})}).catch(warn)}
function drop(kind,k){
 if(!session())return;
 client().then(function(sb){var t=T[kind];
  return sb.from(t.tb).delete().eq(t.col,k).then(function(x){if(x.error)throw x.error})}).catch(warn)}

/* bungkus fungsi simpan/hapus: tetap simpan lokal, lalu kirim ke akun bila login */
var o={ap:S.addPost,dp:S.delPost,aa:S.addArtist,da:S.delArtist};
S.addPost=function(s){var ok=o.ap(s);if(ok)push('post',lc(s));return ok};
S.delPost=function(s){var ok=o.dp(s);if(ok)drop('post',lc(s));return ok};
S.addArtist=function(n){var ok=o.aa(n);if(ok)push('artist',lc(n),String(n).trim());return ok};
S.delArtist=function(n){var ok=o.da(n);if(ok)drop('artist',lc(n));return ok};

/* saat halaman dibuka: gabungkan akun <-> browser ini */
var started=false;
function pull(){
 var s=session();if(!s||started)return;started=true;
 var uid=s.user.id,prev=null;try{prev=localStorage.getItem(MK)}catch(e){}
 if(prev&&prev!==uid){S.clear();ping()} /* akun lain di perangkat yang sama: jangan campur */
 client().then(function(sb){
  return Promise.all(['post','artist'].map(function(kind){var t=T[kind];
   return sb.from(t.tb).select(t.sel).order('created_at',{ascending:false}).then(function(r){
    if(r.error){warn(r.error);return {ok:false}}
    var rem=(r.data||[]).map(function(x){return{k:lc(x[t.col]),n:x.artist_name||x[t.col],t:Date.parse(x.created_at)||Date.now()}});
    var changed=S.merge(kind,rem),have={};rem.forEach(function(x){have[x.k]=1});
    var loc=(kind==='post'?S.posts():S.artists()).filter(function(x){return !have[x.k]});
    if(!loc.length)return {ok:true,changed:changed};
    return sb.from(t.tb).insert(loc.map(function(x){return row(kind,x.k,x.n)})).then(function(x){
     if(x.error){warn(x.error);return {ok:false,changed:changed}}return {ok:true,changed:changed}})}) }))})
 .then(function(rs){
  if(rs.some(function(r){return r.changed}))ping();
  if(rs.every(function(r){return r.ok})){try{localStorage.setItem(MK,uid)}catch(e){}}
 }).catch(function(e){started=false;warn(e)})}

/* sudah logout (pernah sinkron, kini tak ada sesi): kosongkan salinan lokal agar tidak bocor ke akun/pengunjung berikutnya */
try{if(!session()&&localStorage.getItem(MK)){localStorage.removeItem(MK);S.clear();ping()}}catch(e){}
setTimeout(pull,document.getElementById('saved')?0:1500);
})();
