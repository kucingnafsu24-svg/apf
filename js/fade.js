/* Animasi fade saat membuka halaman (masuk) dan pindah halaman (keluar) */
(function(){
 var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(reduce)return;
 var st=document.createElement('style');
 st.textContent='@keyframes pgIn{from{opacity:0}to{opacity:1}}'+
  'body{animation:pgIn .3s ease both}'+
  'body.pg-out{opacity:0;transition:opacity .2s ease;pointer-events:none}';
 document.head.appendChild(st);

 document.addEventListener('click',function(e){
  if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  var a=e.target.closest&&e.target.closest('a[href]');
  if(!a||a.target==='_blank'||a.hasAttribute('download'))return;
  var u;try{u=new URL(a.href,location.href)}catch(x){return}
  if(u.origin!==location.origin)return;
  if(u.pathname===location.pathname&&u.search===location.search)return; /* anchor/hash di halaman yang sama */
  e.preventDefault();
  document.body.classList.add('pg-out');
  setTimeout(function(){location.href=u.href},200);
 });

 /* tombol Kembali/Maju browser: pastikan halaman tidak tertinggal transparan */
 window.addEventListener('pageshow',function(e){
  if(e.persisted)document.body.classList.remove('pg-out');
 });
})();
