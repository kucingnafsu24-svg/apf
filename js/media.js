/* Merapikan jarak gambar/video di isi artikel.
   Isi artikel memakai white-space:pre-line, sehingga baris kosong di antara tag gambar/video
   di posts.json tampil sebagai celah ekstra. Script ini membuang celah itu. */
(function(){
 var art=document.getElementById('article');
 if(!art)return;
 var MEDIA=/^(IMG|VIDEO|IFRAME|FIGURE)$/;
 function isMedia(n){return n&&n.nodeType===1&&MEDIA.test(n.tagName)}
 function tidy(){
  var list=art.querySelectorAll('.entry');
  for(var i=0;i<list.length;i++){
   var en=list[i];
   if(en.getAttribute('data-tidy'))continue;
   en.setAttribute('data-tidy','1');
   var nodes=Array.prototype.slice.call(en.childNodes);
   nodes.forEach(function(n){
    if(n.nodeType!==3||n.nodeValue.trim())return;
    if(isMedia(n.previousSibling)||isMedia(n.nextSibling))en.removeChild(n);
   });
  }
 }
 tidy();
 try{new MutationObserver(tidy).observe(art,{childList:true,subtree:true})}catch(e){}
})();
