/* Simpan postingan (khusus akun login). Data disimpan di tabel Supabase "saved_posts".
   - Semua halaman yang memuat file ini: tambah ikon "Tersimpan" di header.
   - Halaman artikel: tambah tombol Simpan / Tersimpan di bawah tanggal. */
(function(){
var C=window.APF_CONFIG||{};
var ICON='<svg viewBox="0 0 24 24"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg>';
var st=document.createElement('style');
st.textContent='.sv-link{display:inline-flex;align-items:center;justify-content:center;padding:8px;border-radius:50%;color:var(--head)}'+
 '.sv-link:hover{background:var(--card)}'+
 '.sv-link svg,.sv-btn svg{display:block;width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}'+
 '@media(max-width:760px){.sv-link{padding:10px}}'+
 '.sv-row{display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin:0 0 16px}'+
 '.sv-btn{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border:1px solid var(--line);border-radius:20px;background:var(--bg);color:var(--head);font-size:14px;font-weight:600;cursor:pointer}'+
 '.sv-btn:hover{background:var(--card)}'+
 '.sv-btn.on{background:var(--link);border-color:var(--link);color:#fff}'+
 '.sv-btn.on svg{fill:currentColor}'+
 '.sv-btn[disabled]{opacity:.6;cursor:wait}'+
 '.sv-msg{font-size:13px;color:var(--alt)}.sv-msg a{color:var(--link);text-decoration:underline}';
document.head.appendChild(st);

/* ikon di header */
var tl=document.querySelector('.tools');
if(tl&&!document.getElementById('sv-link')){
 var a=document.createElement('a');a.id='sv-link';a.className='sv-link';a.href='/saved.html';
 a.setAttribute('aria-label','Postingan tersimpan');a.title='Postingan tersimpan';a.innerHTML=ICON;
 tl.insertBefore(a,document.getElementById('theme'));
}

/* tombol simpan di halaman artikel */
if(!document.getElementById('article'))return;
if(!window.supabase||!C.supabaseUrl||!C.supabaseAnonKey){console.warn('[save] supabase-js / APF_CONFIG belum siap');return}
var sb=window.supabase.createClient(C.supabaseUrl,C.supabaseAnonKey);
var qs=new URLSearchParams(location.search);
var slug=(qs.get('s')||decodeURIComponent(location.pathname.split('/').filter(Boolean).pop()||'')).toLowerCase();
if(!slug)return;
var user=null,saved=false,busy=false,btn,msgEl;

var tries=0,t=setInterval(function(){
 var m=document.querySelector('.article .meta');
 if(m){clearInterval(t);mount(m)}else if(++tries>150)clearInterval(t);
},100);

function paint(){
 btn.classList.toggle('on',saved);btn.setAttribute('aria-pressed',saved?'true':'false');
 btn.querySelector('span').textContent=saved?'Tersimpan':'Simpan';
}
function say(html){msgEl.innerHTML=html}
function refresh(){
 if(!user){saved=false;paint();return}
 sb.from('saved_posts').select('post_slug').eq('post_slug',slug).maybeSingle()
  .then(function(r){saved=!!r.data;paint()},function(){});
}
function mount(meta){
 if(document.getElementById('sv-row'))return;
 var row=document.createElement('div');row.className='sv-row';row.id='sv-row';
 row.innerHTML='<button type="button" class="sv-btn" id="sv-btn" aria-pressed="false">'+ICON+'<span>Simpan</span></button><span class="sv-msg" id="sv-msg" role="status"></span>';
 meta.parentNode.insertBefore(row,meta.nextSibling);
 btn=row.querySelector('#sv-btn');msgEl=row.querySelector('#sv-msg');
 btn.onclick=function(){
  if(!user){location.href='/login.html?next='+encodeURIComponent(location.pathname+location.search);return}
  if(busy)return;busy=true;btn.disabled=true;
  var want=!saved;
  var q=want?sb.from('saved_posts').insert({post_slug:slug}):sb.from('saved_posts').delete().eq('post_slug',slug);
  Promise.resolve(q).then(function(r){
   busy=false;btn.disabled=false;
   if(r.error&&!(want&&r.error.code==='23505')){say('Gagal menyimpan. Coba lagi.');return}
   saved=want;paint();
   say(want?'Disimpan. <a href="/saved.html">Lihat daftar</a>':'Dihapus dari simpanan.');
  }).catch(function(){busy=false;btn.disabled=false;say('Gagal menyimpan. Coba lagi.')});
 };
 sb.auth.getSession().then(function(r){user=r.data.session&&r.data.session.user;refresh()}).catch(function(){});
 sb.auth.onAuthStateChange(function(_e,s){var n=s&&s.user;if((n&&n.id)!==(user&&user.id)){user=n;refresh()}});
}
})();
