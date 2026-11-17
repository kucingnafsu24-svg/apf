/* Kartu info di halaman tag (mis. /tag/Mori%20Calliope, /cosplayer/Nama, /?tag=tag:Nama).
   Data dari /data/tag-info.json, kuncinya "grup:nama" huruf kecil semua, contoh "tag:mori calliope".
   Isi: name?, banner? (gambar lebar di atas kartu), image?, desc? (\n = paragraf baru), info? {Label:Isi}, links? [{name,url}], more? (alamat /g/slug untuk halaman detail lengkap) */
(function(){
 var list=document.getElementById('posts');
 if(!list)return;                                   /* hanya di index.html */
 var G=['artist','genre','category','parody','tag','cosplayer','game pc','language','publisher','developer','vtubers'];
 function key(){
  var q=new URLSearchParams(location.search).get('tag');
  if(q){var i=q.indexOf(':');if(i<1)return '';var g=q.slice(0,i).toLowerCase();if(g==='file')g='category';return g+':'+q.slice(i+1).toLowerCase()}
  var m=location.pathname.match(/^\/([^\/]+)\/([^\/]+)\/?$/);if(!m)return '';
  try{var g2=decodeURIComponent(m[1]).toLowerCase().replace(/-/g,' '),v=decodeURIComponent(m[2]).toLowerCase()}catch(e){return ''}
  return G.indexOf(g2)>-1?g2+':'+v:''}
 var k=key();if(!k)return;
 var safe=function(u){return typeof u==='string'&&/^(https?:\/\/|\/(?!\/))/.test(u)};
 function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}

 var s=document.createElement('style');
 s.textContent='.ti{margin:0 0 20px;border:1px solid var(--line);border-radius:12px;background:var(--card);overflow:hidden}'+
  '.ti-bn{display:block;width:100%;aspect-ratio:16/5;max-height:240px;object-fit:cover;background:var(--line)}'+
  '.ti-in{display:flex;gap:16px;padding:16px}'+
  '.ti.has-bn .ti-img{margin-top:-48px;border:3px solid var(--card)}'+
  '.ti-img{flex:none;width:96px;height:96px;border-radius:50%;object-fit:cover;background:var(--line)}'+
  '.ti-b{min-width:0;flex:1}'+
  '.ti h3{margin:0 0 6px;font-size:18px;font-weight:600;color:var(--head)}'+
  '.ti p{margin:0 0 8px;font-size:14px;line-height:1.6;color:var(--head)}'+
  '.ti dl{display:grid;grid-template-columns:auto 1fr;gap:4px 14px;margin:10px 0;font-size:13px}'+
  '.ti dt{color:var(--alt);font-weight:600}.ti dd{margin:0;color:var(--head);overflow-wrap:anywhere}'+
  '.ti-l{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}'+
  '.ti-l a{padding:6px 12px;border:1px solid var(--line);border-radius:999px;font-size:13px;font-weight:600;color:var(--link)}'+
  '.ti-l a:hover{border-color:var(--link)}'+
  '@media(max-width:560px){.ti-bn{aspect-ratio:16/7}.ti-in{flex-direction:column;align-items:center;text-align:center}.ti dl{text-align:left}.ti-l{justify-content:center}}';
 document.head.appendChild(s);

 fetch('/data/tag-info.json',{cache:'no-cache'}).then(function(r){return r.json()}).then(function(d){
  var o=d&&d[k];if(!o||typeof o!=='object')return;
  var box=el('div','ti'),inn=el('div','ti-in');
  if(safe(o.banner)){var bn=el('img','ti-bn');bn.src=o.banner;bn.alt='';bn.onerror=function(){bn.remove();box.classList.remove('has-bn')};box.appendChild(bn);box.classList.add('has-bn')}
  if(safe(o.image)){var im=el('img','ti-img');im.alt='';im.width=96;im.height=96;im.onerror=function(){im.remove()};im.src=o.image;inn.appendChild(im)}
  var b=el('div','ti-b');
  b.appendChild(el('h3','',String(o.name||k.slice(k.indexOf(':')+1))));
  if(o.desc)String(o.desc).split('\n').forEach(function(t){if(t.trim())b.appendChild(el('p','',t))});
  if(o.info&&typeof o.info==='object'){
   var dl=el('dl');Object.keys(o.info).forEach(function(n){dl.appendChild(el('dt','',n));dl.appendChild(el('dd','',String(o.info[n])))});b.appendChild(dl)}
  var L=[].concat(o.links||[]);if(safe(o.more))L.push({name:'Info lengkap',url:o.more,self:1});
  if(L.length){var w=el('div','ti-l');L.forEach(function(l){
   if(!l||!safe(l.url))return;var a=el('a','',String(l.name||l.url));a.href=l.url;
   if(!l.self){a.target='_blank';a.rel='noopener'}w.appendChild(a)});b.appendChild(w)}
  inn.appendChild(b);box.appendChild(inn);
  var t=document.querySelector('.title');
  if(t&&t.parentNode)t.parentNode.insertBefore(box,t);else list.parentNode.insertBefore(box,list);
 }).catch(function(){});
})();
