/* Klik gambar di isi artikel -> tampil layar penuh dengan FILE ASLI.
   Di halaman artikel tetap dimuat versi .webp (ringan).
   Cara menentukan file asli:
   Thumbnail besar di atas artikel: tulis "imageFull" di posts.json (opsional), atau otomatis seperti di bawah.
   1) Eksplisit : <img src='/images/Folder/2.webp' data-full='/images/asli/2.png'>
   2) Otomatis  : tanpa data-full, dicoba file di folder & nama yang sama dengan ekstensi
                  png, jpg, jpeg (urutan bisa diubah lewat fullExt di config.js).
   Bila file asli tidak ada, yang tampil tetap versi .webp.
   Tombol Unduh muncul setelah pemuatan selesai (mengunduh file asli, atau .webp bila asli tidak ada). */
(function(){
 var art=document.getElementById('article');
 if(!art)return;
 var EXT=(window.APF_CONFIG&&window.APF_CONFIG.fullExt)||['png','jpg','jpeg'];
 var ov,im,st,dl,seq=0;

 var s=document.createElement('style');
 s.textContent='.entry img,#article div.thumb img{cursor:zoom-in}.entry a img{cursor:pointer}'+
  '.lb{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.92);overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}'+
  '.lb.on{display:flex}'+
  '.lb img{display:block;margin:auto;max-width:100%;max-height:100%;object-fit:contain;cursor:zoom-in}'+
  '.lb.zoom img{max-width:none;max-height:none;object-fit:none;cursor:zoom-out}'+
  '.lb-x{position:fixed;top:max(12px,env(safe-area-inset-top));right:12px;z-index:2;width:40px;height:40px;border:0;border-radius:50%;background:rgba(0,0,0,.6);color:#fff;font-size:20px;line-height:1;cursor:pointer}'+
  '.lb-d{position:fixed;left:50%;transform:translateX(-50%);bottom:max(44px,calc(env(safe-area-inset-bottom) + 30px));z-index:2;padding:10px 18px;border-radius:999px;background:rgba(255,255,255,.92);color:#111;font-size:14px;font-weight:600;text-decoration:none;box-shadow:0 2px 8px rgba(0,0,0,.4)}'+
  '.lb-d[hidden]{display:none}'+
  '.lb-s{position:fixed;left:0;right:0;bottom:max(14px,env(safe-area-inset-bottom));z-index:2;text-align:center;color:#fff;font-size:13px;pointer-events:none;text-shadow:0 1px 3px #000}';
 document.head.appendChild(s);

 function build(){
  if(ov)return;
  ov=document.createElement('div');ov.className='lb';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');
  im=document.createElement('img');im.alt='';
  var x=document.createElement('button');x.type='button';x.className='lb-x';x.setAttribute('aria-label','Tutup');x.textContent='\u2715';
  st=document.createElement('div');st.className='lb-s';
  dl=document.createElement('a');dl.className='lb-d';dl.hidden=true;dl.textContent='\u2193 Unduh';
  dl.addEventListener('click',function(e){e.stopPropagation()});
  ov.appendChild(im);ov.appendChild(x);ov.appendChild(dl);ov.appendChild(st);document.body.appendChild(ov);
  im.addEventListener('click',function(e){e.stopPropagation();ov.classList.toggle('zoom')});
  ov.addEventListener('click',close);
  x.addEventListener('click',function(e){e.stopPropagation();close()});
 }
 function close(){
  if(!ov||!ov.classList.contains('on'))return;
  seq++;ov.classList.remove('on','zoom');im.removeAttribute('src');st.textContent='';dl.hidden=true;
  document.documentElement.style.overflow='';
 }
 function candidates(img){
  var f=img.getAttribute('data-full');
  if(f)return [f];
  var src=img.getAttribute('src')||'',m=src.match(/^([^?#]+)\.webp(?:[?#].*)?$/i);
  if(!m)return [];
  return EXT.map(function(e){return m[1]+'.'+e});
 }
 function setDl(u){
  var n='gambar';
  try{n=decodeURIComponent(String(u).split('?')[0].split('#')[0].split('/').pop())||n}catch(e){}
  dl.href=u;dl.setAttribute('download',n);dl.hidden=false;
 }
 function open(img){
  build();
  var token=++seq,list=candidates(img);
  im.src=img.currentSrc||img.src;           /* langsung tampil versi webp, lalu diganti file asli */
  dl.hidden=true;ov.classList.remove('zoom');ov.classList.add('on');
  document.documentElement.style.overflow='hidden';
  st.textContent=list.length?'Memuat file asli\u2026':'';
  (function next(){
   if(token!==seq)return;
   var u=list.shift();
   if(!u){st.textContent='';setDl(img.currentSrc||img.src);return}
   var t=new Image();
   t.onload=function(){if(token!==seq)return;im.src=t.src;st.textContent='';setDl(t.src)};
   t.onerror=next;
   t.src=u;
  })();
 }

 art.addEventListener('click',function(e){
  var t=e.target;
  if(!t||t.tagName!=='IMG'||!(t.closest('.entry')||t.closest('div.thumb')))return;   /* isi artikel + gambar thumbnail besar di atas artikel */
  if(t.closest('a'))return;                 /* gambar yang sudah berupa link dibiarkan */
  e.preventDefault();open(t);
 });
 document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
})();
