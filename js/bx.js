/* Kotak sponsor dari data/bx.json. Slot: "top" (#bx-top, hanya di index.html) dan "side" (#bx-side, index.html & post.html).
   Tiap slot boleh berisi satu iklan atau daftar iklan (dipilih acak setiap halaman dibuka).
   Isi iklan: image, url, alt, width, height, text, active (false = dimatikan).
   "tab": {"side": {"label": "Partner", "open": false}} membuat kotak berbentuk tab lipat khusus mobile (<=760px); di PC tampil biasa. */
(function(){
 var SLOTS={top:'bx-top',side:'bx-side'};
 var ok=function(u){return typeof u==='string'&&/^(https?:\/\/|\/(?!\/))/.test(u)};
 function pick(v){
  var a=Array.isArray(v)?v:(v&&typeof v==='object'?[v]:[]);
  a=a.filter(function(x){return x&&typeof x==='object'&&x.active!==false&&(ok(x.image)||x.text)});
  return a.length?a[Math.floor(Math.random()*a.length)]:null}
 function build(ad,lazy){
  var a=document.createElement('a');
  if(ok(ad.url)){a.href=ad.url;a.target='_blank';a.rel='noopener sponsored'}
  if(ok(ad.image)){
   var im=document.createElement('img');im.src=ad.image;im.alt=String(ad.alt||'');
   if(lazy)im.loading='lazy';
   if(+ad.width)im.width=+ad.width;if(+ad.height)im.height=+ad.height;a.appendChild(im)}
  else{a.className='bx-ph';a.textContent=String(ad.text)}
  return a}
 function css(){
  if(document.getElementById('bx-css'))return;
  var s=document.createElement('style');s.id='bx-css';
  /* tab lipat hanya di mobile (<=760px); di PC kotak tampil seperti biasa */
  s.textContent='.bx-tab{display:none}'+
   '@media(max-width:760px){'+
   '.bx.tabbed{padding:0}'+
   '.bx.tabbed .bx-label{display:none}'+
   '.bx.tabbed:not(.open) .bx-body{display:none}'+
   '.bx.tabbed .bx-body{padding:4px 12px 12px}'+
   '.bx-tab{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;padding:12px 14px;border:0;background:none;color:var(--head);font:inherit;font-size:13px;font-weight:600;text-align:left;cursor:pointer}'+
   '.bx-tab:focus-visible{outline:2px solid var(--link);outline-offset:-2px;border-radius:10px}'+
   '.bx-tab i{flex:none;width:7px;height:7px;margin:-3px 2px 0 0;border:solid currentColor;border-width:0 2px 2px 0;transform:rotate(45deg);transition:transform .2s}'+
   '.bx.tabbed.open .bx-tab i{margin-top:3px;transform:rotate(-135deg)}'+
   '}';
  document.head.appendChild(s)}
 function tabify(box,body,tc){
  css();
  var open=!!(tc&&tc.open),btn=document.createElement('button');
  body.id=body.id||(box.id+'-b');
  btn.type='button';btn.className='bx-tab';btn.setAttribute('aria-controls',body.id);
  var t=document.createElement('span');t.textContent=String((tc&&tc.label)||'Partner');
  btn.appendChild(t);btn.appendChild(document.createElement('i'));
  function set(o){open=o;box.classList.toggle('open',o);btn.setAttribute('aria-expanded',o?'true':'false')}
  btn.addEventListener('click',function(){set(!open)});
  box.classList.add('tabbed');box.insertBefore(btn,body);set(open)}
 fetch('/data/bx.json',{cache:'no-cache'}).then(function(r){return r.json()}).then(function(cfg){
  if(!cfg||typeof cfg!=='object')return;
  Object.keys(SLOTS).forEach(function(k){
   var box=document.getElementById(SLOTS[k]);
   if(!box||!(k in cfg))return;              /* slot tidak ada di halaman / tidak diatur: biarkan bawaan HTML */
   var body=box.querySelector('.bx-body'),ad=pick(cfg[k]);
   if(!ad){box.style.display='none';return}  /* tidak ada iklan aktif: sembunyikan kotaknya */
   var tc=cfg.tab&&cfg.tab[k];
   if(body){body.innerHTML='';body.appendChild(build(ad,!!tc));if(tc&&!box.classList.contains('tabbed'))tabify(box,body,tc===true?{}:tc)}
  })
 }).catch(function(){});
})();
