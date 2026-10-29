(function(){
var C=window.APF_CONFIG||{};
if(!window.supabase){console.warn('[comments] library supabase-js belum termuat sebelum comments.js');return}
if(!C.supabaseUrl||!C.supabaseAnonKey||/GANTI/.test(C.supabaseUrl)||/GANTI/.test(C.supabaseAnonKey)){console.warn('[comments] APF_CONFIG.supabaseUrl / supabaseAnonKey belum diisi');return}
var sb=window.supabase.createClient(C.supabaseUrl,C.supabaseAnonKey);
var qs=new URLSearchParams(location.search);
var slug=(qs.get('s')||decodeURIComponent(location.pathname.split('/').filter(Boolean).pop()||'')).toLowerCase();
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var safeImg=function(u){return /^https:\/\//.test(u||'')?u:''};
var fmt=function(d){return new Date(d).toLocaleDateString('sv-SE')};
var loginUrl=function(){return '/login.html?next='+encodeURIComponent(location.pathname+location.search)};

/* Reaksi artikel. Ganti emoji dengan gambar: tambahkan img:'https://...' di APF_CONFIG.reactions */
var REACT=C.reactions||[{k:'upvote',t:'Upvote',e:'👍'},{k:'suki',t:'Suki',e:'💖'},{k:'apsih',t:'Apsih',e:'😒'}];
var EMOJI='😀 😁 😂 🤣 😊 😍 🥰 😘 😎 🤔 😅 😭 😢 😡 🥺 😳 😴 🙏 👍 👎 👏 🙌 💪 🔥 ✨ 💖 💔 🎉 👀 😈 🤤 😏'.split(' ');

var user=null,root,list=[],likes={},mine={},sort='top',rc={},myReact=null,pending=null,spoiler=false;

var tries=0,t=setInterval(function(){
 var found=document.querySelector('.crumb'),missing=!found&&document.querySelector('.article .empty')&&document.querySelector('.back');
 if(found||missing||++tries>150){clearInterval(t);if(!found)console.warn('[comments] elemen .crumb tidak ditemukan, komentar tidak ditampilkan');if(!slug)console.warn('[comments] slug kosong');if(found&&slug)start(document.querySelector('.entry')||document.querySelector('.back'))}
},100);

function start(anchor){
 root=document.createElement('section');root.className='comments';root.id='comments';
 var ref=document.querySelector('.rec')||document.querySelector('.back');
 anchor.parentNode.insertBefore(root,ref||anchor.nextSibling);
 root.innerHTML='<div class="empty">Memuat komentar…</div>';
 console.log('[comments] slug:',slug);
 var rt;sb.channel('comments-'+slug).on('postgres_changes',{event:'*',schema:'public',table:'comments'},function(){clearTimeout(rt);rt=setTimeout(load,400)}).subscribe(function(st){console.log('[comments] realtime:',st)});
 sb.auth.getSession().then(function(r){user=r.data.session&&r.data.session.user;draw()}).catch(function(){draw()});
 sb.auth.onAuthStateChange(function(_e,s){var n=s&&s.user;if((n&&n.id)!==(user&&user.id)){user=n;draw()}});
}

function toast(m){
 var el=document.getElementById('cx-msg');if(!el)return;
 el.textContent=m;el.className='cx-msg show';clearTimeout(toast.t);toast.t=setTimeout(function(){el.className='cx-msg'},3500);
}

function ico(n){
 var p={emoji:'<circle cx="12" cy="12" r="9"/><path d="M8.5 14.2a4.2 4.2 0 0 0 7 0"/><path d="M9 9.5h.01M15 9.5h.01"/>',
 gif:'<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M8.5 10.5h-2v3h2v-1.2h-1M11.5 10.5v3M14 13.5v-3h2M14 12h1.5"/>',
 img:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m21 16-5-5-9 9"/>',
 eye:'<path d="M3 3l18 18M10.6 6.2A10 10 0 0 1 12 6c5 0 8.5 4.2 9.5 6a12 12 0 0 1-2.4 3M6.5 7.6C4.4 9 3 11 2.5 12c1 1.8 4.5 6 9.5 6 1.5 0 2.8-.4 4-.9"/><path d="M9.9 10a3 3 0 0 0 4.1 4.1"/>',
 heart:'<path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z"/>'};
 return '<svg viewBox="0 0 24 24">'+p[n]+'</svg>';
}

function draw(){
 var h='<div class="cx-react" id="cx-react"></div>';
 var me='';
 if(user){
  var m=user.user_metadata||{},nm=m.display_name||m.full_name||m.name||m.user_name||'Anda',av=safeImg(m.avatar_custom||m.avatar_url||m.picture);
  me='<span class="cx-me">'+(av?'<img src="'+esc(av)+'" alt="">':'<span class="av">'+esc(Array.from(nm)[0]||'?')+'</span>')+'<b>'+esc(nm)+'</b></span>';
 }
 h+='<div class="cx-box"><textarea id="c-body" maxlength="1000" placeholder="Komen di mari…"></textarea>'+
  '<div class="cx-prev" id="cx-prev" hidden></div>'+
  '<div class="cx-bar"><div class="cx-tools">'+
   '<button type="button" class="cx-t" id="t-emoji" title="Emoji">'+ico('emoji')+'</button>'+
   '<button type="button" class="cx-t" id="t-gif" title="GIF (tempel link)">'+ico('gif')+'</button>'+
   '<button type="button" class="cx-t" id="t-img" title="Gambar">'+ico('img')+'</button>'+
   '<button type="button" class="cx-t" id="t-spo" title="Tandai spoiler" aria-pressed="false">'+ico('eye')+'</button>'+
   '<div class="cx-emoji" id="cx-emoji" hidden>'+EMOJI.map(function(e){return '<button type="button">'+e+'</button>'}).join('')+'</div>'+
   '<input type="file" id="cx-file" accept="image/*" hidden></div>'+
  '<div class="cx-right">'+me+'<span class="cx-cnt"><span id="c-cnt">0</span> Kata</span>'+
   (user?'<button type="button" class="cx-btn" id="c-out">Keluar</button>':'<a class="cx-btn" href="'+esc(loginUrl())+'">Login</a>')+
   '<button type="button" class="cx-btn cx-send" id="c-send">Kirim</button></div></div>'+
  '<div class="cx-msg" id="cx-msg"></div></div>'+
  '<div class="cx-head"><h2><span id="c-count">0</span> Komentar</h2><div class="cx-sort" id="cx-sort">'+
   [['new','Terbaru'],['old','Terlama'],['top','Terpopuler']].map(function(s){return '<button type="button" data-s="'+s[0]+'" class="'+(sort===s[0]?'on':'')+'">'+s[1]+'</button>'}).join('')+'</div></div>'+
  '<div class="c-list" id="c-list"><div class="empty">Memuat komentar…</div></div>';
 root.innerHTML=h;pending=null;spoiler=false;
 bindCompose();drawReact();loadReact();load();
}

function bindCompose(){
 var $=function(i){return document.getElementById(i)};
 var ta=$('c-body');
 ta.oninput=function(){var v=ta.value.trim();$('c-cnt').textContent=v?v.split(/\s+/).length:0};
 var o=$('c-out');if(o)o.onclick=function(){sb.auth.signOut()};
 $('c-send').onclick=send;
 var em=$('cx-emoji');
 $('t-emoji').onclick=function(e){e.stopPropagation();em.hidden=!em.hidden};
 em.onclick=function(e){var b=e.target.closest('button');if(!b)return;
  var s=ta.selectionStart==null?ta.value.length:ta.selectionStart,en=ta.selectionEnd==null?s:ta.selectionEnd;
  ta.value=ta.value.slice(0,s)+b.textContent+ta.value.slice(en);ta.focus();ta.selectionStart=ta.selectionEnd=s+b.textContent.length;ta.oninput()};
 document.addEventListener('click',function(e){if(em&&!em.contains(e.target))em.hidden=true});
 var spo=$('t-spo');
 spo.onclick=function(){spoiler=!spoiler;spo.classList.toggle('on',spoiler);spo.setAttribute('aria-pressed',spoiler)};
 $('t-gif').onclick=function(){
  if(!user)return toast('Login dulu untuk melampirkan GIF.');
  var u=prompt('Tempel link GIF/gambar (https://…)');if(!u)return;u=u.trim();
  if(!/^https:\/\/\S+$/.test(u)||u.length>500)return toast('Link harus diawali https://');
  setPending({url:u})};
 var f=$('cx-file');
 $('t-img').onclick=function(){if(!user)return toast('Login dulu untuk mengirim gambar.');f.click()};
 f.onchange=function(){var x=f.files[0];f.value='';if(x)prep(x)};
}

function setPending(p){
 pending=p;var el=document.getElementById('cx-prev');if(!el)return;
 if(!p){el.hidden=true;el.innerHTML='';return}
 el.hidden=false;el.innerHTML='<img src="'+esc(p.url||p.preview)+'" alt=""><button type="button" aria-label="Hapus lampiran">✕</button>';
 el.querySelector('button').onclick=function(){setPending(null)};
}

function prep(file){
 if(!/^image\//.test(file.type))return toast('File harus berupa gambar.');
 if(file.type==='image/gif'&&file.size<=500*1024){return setPending({blob:file,type:'image/gif',ext:'gif',preview:URL.createObjectURL(file)})}
 var img=new Image(),u=URL.createObjectURL(file);
 img.onload=function(){
  var max=1280,r=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');
  c.width=Math.round(img.width*r);c.height=Math.round(img.height*r);
  c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);
  var q=.82;
  (function go(){c.toBlob(function(b){
   if(!b)return toast('Gagal memproses gambar.');
   if(b.size>500*1024&&q>.4){q-=.14;return go()}
   if(b.size>500*1024)return toast('Gambar terlalu besar (maks 500 KB).');
   setPending({blob:b,type:'image/webp',ext:'webp',preview:URL.createObjectURL(b)});
  },'image/webp',q)})();
 };
 img.onerror=function(){toast('Gambar tidak dapat dibaca.')};
 img.src=u;
}

/* ---------- Reaksi artikel ---------- */
function drawReact(){
 var el=document.getElementById('cx-react');if(!el)return;
 var tot=0;REACT.forEach(function(r){tot+=rc[r.k]||0});
 el.innerHTML='<h3>Upvote</h3><div class="cx-rtot">'+tot+' Reactions</div><div class="cx-rlist">'+
  REACT.map(function(r){return '<button type="button" class="cx-r'+(myReact===r.k?' on':'')+'" data-k="'+esc(r.k)+'">'+
   '<span class="cx-rb">'+(rc[r.k]||0)+'</span>'+(safeImg(r.img)?'<img src="'+esc(r.img)+'" alt="">':'<span class="cx-re">'+esc(r.e||'👍')+'</span>')+'<span>'+esc(r.t)+'</span></button>'}).join('')+'</div>';
 [].forEach.call(el.querySelectorAll('.cx-r'),function(b){b.onclick=function(){react(b.dataset.k)}});
}
function loadReact(){
 sb.from('reaction_counts').select('kind,total').eq('post_slug',slug).then(function(r){
  if(r.error)return console.error('Reaksi gagal:',r.error);
  rc={};(r.data||[]).forEach(function(x){rc[x.kind]=x.total});drawReact()});
 if(user)sb.from('post_reactions').select('kind').eq('post_slug',slug).eq('user_id',user.id).maybeSingle().then(function(r){
  myReact=r.data?r.data.kind:null;drawReact()});
}
function react(k){
 if(!user){if(confirm('Login dulu untuk memberi reaksi. Lanjut ke halaman login?'))location.href=loginUrl();return}
 var prev=myReact,op;
 if(prev===k){myReact=null;rc[k]=Math.max(0,(rc[k]||1)-1);op=sb.from('post_reactions').delete().eq('post_slug',slug).eq('user_id',user.id)}
 else{
  if(prev)rc[prev]=Math.max(0,(rc[prev]||1)-1);
  rc[k]=(rc[k]||0)+1;myReact=k;
  op=prev?sb.from('post_reactions').update({kind:k}).eq('post_slug',slug).eq('user_id',user.id):sb.from('post_reactions').insert({post_slug:slug,kind:k});
 }
 drawReact();
 op.then(function(r){if(r.error){console.error(r.error);loadReact()}});
}

/* ---------- Komentar ---------- */
var seq=0;
function load(){
 var my=++seq;
 var q1=sb.from('comments_live').select('id,user_id,author_name,avatar_url,body,image_url,spoiler,created_at').eq('post_slug',slug).order('created_at',{ascending:false}).limit(300);
 var q2=sb.from('comment_like_counts').select('comment_id,total').eq('post_slug',slug);
 var q3=user?sb.from('comment_likes').select('comment_id').eq('user_id',user.id):Promise.resolve({data:[]});
 Promise.all([q1,q2,q3]).then(function(a){
  var el=document.getElementById('c-list');if(!el||my!==seq)return;
  if(a[0].error){console.error('Muat komentar gagal:',a[0].error);el.innerHTML='<div class="empty">Komentar tidak dapat dimuat: '+esc(a[0].error.message||'')+'</div>';return}
  list=a[0].data||[];likes={};mine={};
  console.log('[comments] slug=',slug,'jumlah=',list.length);
  if(a[1].error)console.error('Like count gagal:',a[1].error);
  (a[1].data||[]).forEach(function(x){likes[x.comment_id]=x.total});
  (a[2].data||[]).forEach(function(x){mine[x.comment_id]=1});
  var cn=document.getElementById('c-count');if(cn)cn.textContent=list.length;
  render();
 });
}

function render(){
 var el=document.getElementById('c-list');if(!el)return;
 var arr=list.slice();
 if(sort==='old')arr.reverse();
 else if(sort==='top')arr.sort(function(a,b){return (likes[b.id]||0)-(likes[a.id]||0)||new Date(b.created_at)-new Date(a.created_at)});
 el.innerHTML=arr.length?arr.map(function(c){
  var av=safeImg(c.avatar_url),img=safeImg(c.image_url),n=likes[c.id]||0;
  var body=(c.body?'<p>'+esc(c.body)+'</p>':'')+(img?'<a class="cx-pic" href="'+esc(img)+'" target="_blank" rel="noopener"><img src="'+esc(img)+'" alt="" loading="lazy"></a>':'');
  if(c.spoiler)body='<div class="cx-spo" title="Klik untuk membuka spoiler">'+body+'<span class="cx-spl">Spoiler — klik untuk lihat</span></div>';
  return '<div class="c-item">'+(av?'<img class="cx-av" src="'+esc(av)+'" alt="" loading="lazy">':'<span class="av">'+esc(Array.from(c.author_name||'?')[0])+'</span>')+
   '<div><div class="c-h"><b>'+esc(c.author_name)+'</b><span>'+fmt(c.created_at)+'</span>'+(user&&user.id===c.user_id?'<button type="button" class="c-del" data-id="'+c.id+'">Hapus</button>':'')+'</div>'+
   body+'<div class="cx-act"><button type="button" class="cx-lk'+(mine[c.id]?' on':'')+'" data-id="'+c.id+'">'+ico('heart')+'<span>'+(n||'')+'</span></button></div></div></div>'}).join(''):'<div class="empty">Belum ada komentar.</div>';
 [].forEach.call(el.querySelectorAll('.c-del'),function(b){b.onclick=function(){
  if(!confirm('Hapus komentar ini?'))return;
  sb.from('comments').delete().eq('id',b.dataset.id).then(load)}});
 [].forEach.call(el.querySelectorAll('.cx-spo'),function(b){b.onclick=function(){b.classList.add('open')}});
 [].forEach.call(el.querySelectorAll('.cx-lk'),function(b){b.onclick=function(){like(b.dataset.id)}});
 var so=document.getElementById('cx-sort');
 if(so)[].forEach.call(so.querySelectorAll('button'),function(b){b.onclick=function(){sort=b.dataset.s;[].forEach.call(so.querySelectorAll('button'),function(x){x.classList.toggle('on',x===b)});render()}});
}

function like(id){
 if(!user){if(confirm('Login dulu untuk memberi like. Lanjut ke halaman login?'))location.href=loginUrl();return}
 var on=!!mine[id],op;
 if(on){delete mine[id];likes[id]=Math.max(0,(likes[id]||1)-1);op=sb.from('comment_likes').delete().eq('comment_id',id).eq('user_id',user.id)}
 else{mine[id]=1;likes[id]=(likes[id]||0)+1;op=sb.from('comment_likes').insert({comment_id:id})}
 render();
 op.then(function(r){if(r.error){console.error(r.error);load()}});
}

function send(){
 if(!user){location.href=loginUrl();return}
 var ta=document.getElementById('c-body'),btn=document.getElementById('c-send');
 var v=ta.value.trim();
 if(!v&&!pending)return toast('Komentar kosong.');
 btn.disabled=true;
 var up=Promise.resolve(pending&&pending.url?pending.url:null);
 if(pending&&pending.blob){
  var path=user.id+'/'+Date.now()+'.'+pending.ext;
  up=sb.storage.from('comment-images').upload(path,pending.blob,{contentType:pending.type,cacheControl:'31536000'}).then(function(r){
   if(r.error)throw r.error;return sb.storage.from('comment-images').getPublicUrl(path).data.publicUrl});
 }
 up.then(function(url){
  return sb.from('comments').insert({post_slug:slug,body:v,image_url:url,spoiler:spoiler&&!!(v||url)});
 }).then(function(r){
  btn.disabled=false;
  if(r.error){console.error('Komentar gagal:',r.error);return toast(/cepat/i.test(r.error.message||'')?'Terlalu cepat, tunggu sebentar.':'Gagal mengirim: '+(r.error.message||'kesalahan tidak diketahui'))}
  ta.value='';document.getElementById('c-cnt').textContent='0';setPending(null);
  spoiler=false;var s=document.getElementById('t-spo');if(s){s.classList.remove('on');s.setAttribute('aria-pressed','false')}
  sort='new';var so=document.getElementById('cx-sort');if(so)[].forEach.call(so.querySelectorAll('button'),function(x){x.classList.toggle('on',x.dataset.s==='new')});
  load();
 }).catch(function(e){btn.disabled=false;console.error(e);toast('Gagal mengunggah gambar: '+(e.message||''))});
}
})();
