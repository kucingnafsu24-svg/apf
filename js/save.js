/* Simpan (TANPA login, disimpan di browser lewat favorites.js) + Bagikan.
   - Halaman artikel: tombol Simpan & Bagikan di akhir artikel, tepat di atas komentar.
   Daftar simpanan dibuka lewat ikon penanda di header (saved.html). */
(function(){
var C=window.APF_CONFIG||{};
var ICON='<svg viewBox="0 0 24 24"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg>';
var SHARE='<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>';
var st=document.createElement('style');
st.textContent='.sv-btn svg{display:block;width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}'+
 '.sv-row{display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin:28px 0 8px;padding-top:18px;border-top:1px solid var(--line)}'+
 '.sv-btn{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border:1px solid var(--line);border-radius:20px;background:var(--bg);color:var(--head);font-size:14px;font-weight:600;cursor:pointer}'+
 '.sv-btn:hover{background:var(--card)}'+
 '.sv-btn.on{background:var(--link);border-color:var(--link);color:#fff}'+
 '.sv-btn.on svg{fill:currentColor}'+
 '.sv-btn[disabled]{opacity:.6;cursor:wait}'+
 '.sv-share{position:relative}'+
 '.sv-menu{position:absolute;z-index:20;top:calc(100% + 6px);left:0;min-width:200px;padding:6px;border:1px solid var(--line);border-radius:10px;background:var(--bg);box-shadow:0 8px 24px rgba(0,0,0,.18)}'+
 '.sv-menu[hidden]{display:none}'+
 '.sv-menu a,.sv-menu button{display:flex;align-items:center;width:100%;padding:9px 12px;border-radius:6px;color:var(--head);font:inherit;font-size:14px;text-align:left;text-decoration:none;cursor:pointer;background:none;border:0}'+
 '.sv-menu a:hover,.sv-menu button:hover{background:var(--card)}'+
 '.sv-msg{font-size:13px;color:var(--alt)}.sv-msg a{color:var(--link);text-decoration:underline}';
document.head.appendChild(st);

/* ===== bagian halaman artikel ===== */
if(!document.getElementById('article'))return;
var qs=new URLSearchParams(location.search);
var slug=(qs.get('s')||decodeURIComponent(location.pathname.split('/').filter(Boolean).pop()||'')).toLowerCase();
var S=window.APF_SAVED;
var saved=false,btn,msgEl,shBtn,menu;

var tries=0,t=setInterval(function(){
 if(document.querySelector('.article .back')){clearInterval(t);mount()}else if(++tries>150)clearInterval(t);
},100);

function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function say(html){msgEl.innerHTML=html;}
function paint(){
 if(!btn)return;
 btn.classList.toggle('on',saved);btn.setAttribute('aria-pressed',saved?'true':'false');
 btn.querySelector('span').textContent=saved?'Tersimpan':'Simpan';
}
function refresh(){if(!S||!btn)return;saved=S.hasPost(slug);paint()}
function copyText(txt,done){
 var fb=function(){try{var x=document.createElement('textarea');x.value=txt;x.setAttribute('readonly','');x.style.cssText='position:fixed;top:0;left:0;opacity:0';document.body.appendChild(x);x.select();var r=document.execCommand('copy');document.body.removeChild(x);done(r)}catch(e){done(false)}};
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(function(){done(true)},fb);else fb();
}
function shareUrl(){return location.origin+location.pathname}
function shareTitle(){var h=document.querySelector('.article h1');return (h&&h.textContent.trim())||document.title}
function closeMenu(){if(menu&&!menu.hidden){menu.hidden=true;shBtn.setAttribute('aria-expanded','false')}}
function openMenu(){
 var u=encodeURIComponent(shareUrl()),tt=encodeURIComponent(shareTitle());
 menu.innerHTML='<button type="button" data-copy="1">Salin link</button>'+
  '<a target="_blank" rel="noopener noreferrer" href="https://wa.me/?text='+tt+'%20'+u+'">WhatsApp</a>'+
  '<a target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/sharer/sharer.php?u='+u+'">Facebook</a>'+
  '<a target="_blank" rel="noopener noreferrer" href="https://x.com/intent/tweet?text='+tt+'&url='+u+'">X</a>'+
  '<a target="_blank" rel="noopener noreferrer" href="https://t.me/share/url?url='+u+'&text='+tt+'">Telegram</a>';
 menu.hidden=false;shBtn.setAttribute('aria-expanded','true');
}

function mount(){
 if(document.getElementById('sv-row'))return;
 var ref=document.getElementById('comments')||document.querySelector('.pnav')||document.querySelector('.rec')||document.querySelector('.back');
 if(!ref)return;
 var row=document.createElement('div');row.className='sv-row';row.id='sv-row';
 row.innerHTML=(S?'<button type="button" class="sv-btn" id="sv-btn" aria-pressed="false">'+ICON+'<span>Simpan</span></button>':'')+
  '<div class="sv-share"><button type="button" class="sv-btn" id="sv-share" aria-haspopup="true" aria-expanded="false">'+SHARE+'<span>Bagikan</span></button><div class="sv-menu" id="sv-menu" hidden></div></div>'+
  '<span class="sv-msg" id="sv-msg" role="status"></span>';
 ref.parentNode.insertBefore(row,ref);
 btn=row.querySelector('#sv-btn');msgEl=row.querySelector('#sv-msg');shBtn=row.querySelector('#sv-share');menu=row.querySelector('#sv-menu');

 /* Bagikan */
 shBtn.onclick=function(){
  if(navigator.share&&/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)){
   navigator.share({title:shareTitle(),url:shareUrl()}).catch(function(){});return}
  if(menu.hidden)openMenu();else closeMenu();
 };
 menu.onclick=function(e){
  var c=e.target.closest&&e.target.closest('[data-copy]');
  if(c){copyText(shareUrl(),function(ok){say(ok?'Link disalin.':'Gagal menyalin link.');closeMenu()});return}
  if(e.target.closest&&e.target.closest('a'))setTimeout(closeMenu,50);
 };
 document.addEventListener('click',function(e){if(!e.target.closest||!e.target.closest('.sv-share'))closeMenu()});
 document.addEventListener('keydown',function(e){if(e.key==='Escape')closeMenu()});

 /* Simpan (tanpa login; disimpan di browser ini) */
 if(!S||!btn)return;
 btn.onclick=function(){
  var want=!saved,ok=want?S.addPost(slug):S.delPost(slug);
  if(!ok){say('Gagal menyimpan: penyimpanan browser tidak tersedia.');return}
  saved=want;paint();
  say(want?'Disimpan. <a href="/saved.html">Lihat daftar</a>':'Dihapus dari simpanan.');
 };
 refresh();
 window.addEventListener('storage',refresh);window.addEventListener('pageshow',refresh);
}
})();
