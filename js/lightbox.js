/* Klik gambar di isi artikel -> gambar itu diganti di tempat dengan FILE ASLI (tanpa jendela terpisah, tanpa tombol unduh).
   Di halaman artikel tetap dimuat versi .webp (ringan); file asli baru dimuat saat gambar diklik.
   Cara menentukan file asli:
   1) Eksplisit : <img src='/images/Folder/2.webp' data-full='/images/asli/2.png'>
                  (thumbnail besar di atas artikel: tulis "imageFull" di posts.json)
   2) Otomatis  : tanpa data-full, dicoba file di folder & nama yang sama dengan ekstensi
                  png, jpg, jpeg, gif (urutan bisa diubah lewat fullExt di config.js).
   Bila file asli tidak ada, gambar tetap versi .webp. */
(function(){
 var art=document.getElementById('article');
 if(!art)return;
 var EXT=(window.APF_CONFIG&&window.APF_CONFIG.fullExt)||['png','jpg','jpeg','gif'];

 var s=document.createElement('style');
 s.textContent='.entry img,#article div.thumb img{cursor:zoom-in}.entry a img{cursor:pointer}'+
  '#article img.is-loading{cursor:progress;opacity:.65;transition:opacity .2s}'+
  '#article img.is-orig{cursor:default}';
 document.head.appendChild(s);

 function candidates(img){
  var f=img.getAttribute('data-full');
  if(f)return [f];
  var src=img.getAttribute('src')||'',m=src.match(/^([^?#]+)\.webp(?:[?#].*)?$/i);
  if(!m)return [];
  return EXT.map(function(e){return m[1]+'.'+e});
 }
 function load(img){
  if(img.classList.contains('is-orig')||img.classList.contains('is-loading'))return;
  var list=candidates(img);
  if(!list.length)return;
  img.classList.add('is-loading');
  (function next(){
   var u=list.shift();
   if(!u){img.classList.remove('is-loading');return}
   var t=new Image();
   t.onload=function(){
    img.removeAttribute('srcset');img.removeAttribute('sizes');
    img.src=t.src;img.classList.remove('is-loading');img.classList.add('is-orig')};
   t.onerror=next;
   t.src=u;
  })();
 }

 art.addEventListener('click',function(e){
  var t=e.target;
  if(!t||t.tagName!=='IMG'||!(t.closest('.entry')||t.closest('div.thumb')))return;   /* isi artikel + gambar thumbnail besar di atas artikel */
  if(t.closest('a'))return;                 /* gambar yang sudah berupa link dibiarkan */
  e.preventDefault();load(t);
 });
})();
