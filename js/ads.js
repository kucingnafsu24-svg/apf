/* Iklan dari data/ads.json. Slot: "top" (#bx-top, hanya di index.html) dan "side" (#bx-side, index.html & post.html).
   Tiap slot boleh berisi satu iklan atau daftar iklan (dipilih acak setiap halaman dibuka).
   Isi iklan: image, url, alt, width, height, text, active (false = dimatikan). */
(function(){
 var SLOTS={top:'bx-top',side:'bx-side'};
 var ok=function(u){return typeof u==='string'&&/^(https?:\/\/|\/(?!\/))/.test(u)};
 function pick(v){
  var a=Array.isArray(v)?v:(v&&typeof v==='object'?[v]:[]);
  a=a.filter(function(x){return x&&typeof x==='object'&&x.active!==false&&(ok(x.image)||x.text)});
  return a.length?a[Math.floor(Math.random()*a.length)]:null}
 function build(ad){
  var a=document.createElement('a');
  if(ok(ad.url)){a.href=ad.url;a.target='_blank';a.rel='noopener sponsored'}
  if(ok(ad.image)){
   var im=document.createElement('img');im.src=ad.image;im.alt=String(ad.alt||'Sponsor');
   if(+ad.width)im.width=+ad.width;if(+ad.height)im.height=+ad.height;a.appendChild(im)}
  else{a.className='bx-ph';a.textContent=String(ad.text)}
  return a}
 fetch('/data/ads.json',{cache:'no-cache'}).then(function(r){return r.json()}).then(function(cfg){
  if(!cfg||typeof cfg!=='object')return;
  Object.keys(SLOTS).forEach(function(k){
   var box=document.getElementById(SLOTS[k]);
   if(!box||!(k in cfg))return;              /* slot tidak ada di halaman / tidak diatur: biarkan bawaan HTML */
   var body=box.querySelector('.bx-body'),ad=pick(cfg[k]);
   if(!ad){box.style.display='none';return}  /* tidak ada iklan aktif: sembunyikan kotaknya */
   if(body){body.innerHTML='';body.appendChild(build(ad))}
  })
 }).catch(function(){});
})();
