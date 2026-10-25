(function(){
var C=window.APF_CONFIG||{};
if(!window.supabase||!C.supabaseUrl||/GANTI/.test(C.supabaseUrl)||/GANTI/.test(C.supabaseAnonKey||''))return;
var sb=window.supabase.createClient(C.supabaseUrl,C.supabaseAnonKey);
var qs=new URLSearchParams(location.search);
var slug=(qs.get('s')||decodeURIComponent(location.pathname.split('/').filter(Boolean).pop()||'')).toLowerCase();
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var safeImg=function(u){return /^https:\/\//.test(u||'')?u:''};
var ago=function(d){var s=(Date.now()-new Date(d))/1000;if(s<60)return 'baru saja';if(s<3600)return Math.floor(s/60)+' menit lalu';if(s<86400)return Math.floor(s/3600)+' jam lalu';if(s<2592000)return Math.floor(s/86400)+' hari lalu';return new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})};
var names={discord:'Discord',facebook:'Facebook'};
var user=null,root;

var tries=0,t=setInterval(function(){
 var found=document.querySelector('.crumb'),missing=!found&&document.querySelector('.article .empty')&&document.querySelector('.back');
 if(found||missing||++tries>150){clearInterval(t);if(found&&slug)start(document.querySelector('.entry')||document.querySelector('.back'))}
},100);

function start(anchor){
 root=document.createElement('section');root.className='comments';root.id='comments';
 var ref=document.querySelector('.rec')||document.querySelector('.back');
 anchor.parentNode.insertBefore(root,ref||anchor.nextSibling);
 root.innerHTML='<div class="empty">Memuat komentar…</div>';
 sb.auth.getSession().then(function(r){user=r.data.session&&r.data.session.user;draw()}).catch(function(){draw()});
 sb.auth.onAuthStateChange(function(_e,s){var n=s&&s.user;if((n&&n.id)!==(user&&user.id)){user=n;draw()}});
}

var list=[];
function draw(){
 var h='<div class="title"><h2>Komentar</h2><span class="c-count" id="c-count">0</span><i></i></div>';
 if(user){
  var m=user.user_metadata||{},nm=m.display_name||m.full_name||m.name||m.user_name||'Anda',av=safeImg(m.avatar_custom||m.avatar_url||m.picture);
  h+='<div class="c-card c-compose"><div class="c-me">'+(av?'<img src="'+esc(av)+'" alt="">':'<span class="av">'+esc(Array.from(nm)[0]||'?')+'</span>')+'<b>'+esc(nm)+'</b><button class="c-out" id="c-out">Keluar</button></div>'+
   '<textarea id="c-body" maxlength="1000" placeholder="Tulis komentar…"></textarea>'+
   '<div class="c-row"><span class="c-info" id="c-msg"><span id="c-cnt">0</span>/1000</span><button class="c-send" id="c-send">Kirim komentar</button></div></div>';
 }else{
  h+='<div class="c-card c-login"><p>Masuk untuk ikut berkomentar</p><div class="c-provs">'+(C.providers||['discord']).map(function(p){return '<button class="c-prov p-'+esc(p)+'" data-p="'+esc(p)+'">Masuk dengan '+esc(names[p]||p)+'</button>'}).join('')+'<a class="c-prov p-mail" style="background:var(--link)" href="/login.html?next='+encodeURIComponent(location.pathname+location.search)+'">Masuk dengan email</a></div></div>';
 }
 h+='<div class="c-list" id="c-list"><div class="empty">Memuat komentar…</div></div>';
 root.innerHTML=h;
 [].forEach.call(root.querySelectorAll('.c-prov'),function(b){b.onclick=function(){
  sb.auth.signInWithOAuth({provider:b.dataset.p,options:{redirectTo:location.origin+'/post.html?s='+encodeURIComponent(slug)}})}});
 var o=document.getElementById('c-out');if(o)o.onclick=function(){sb.auth.signOut()};
 var s=document.getElementById('c-send');if(s)s.onclick=send;
 var tb=document.getElementById('c-body');if(tb)tb.oninput=function(){var m=document.getElementById('c-msg');m.className='c-info';m.innerHTML='<span id="c-cnt">'+tb.value.length+'</span>/1000'};
 load();
}

var seq=0;
function load(){
 var my=++seq;
 sb.from('comments').select('id,user_id,author_name,avatar_url,body,created_at').eq('post_slug',slug).order('created_at',{ascending:false}).limit(100)
 .then(function(r){
  var el=document.getElementById('c-list');if(!el||my!==seq)return;
  if(r.error){console.error('Muat komentar gagal:',r.error);el.innerHTML='<div class="empty">Komentar tidak dapat dimuat: '+esc(r.error.message||'')+'</div>';return}
  list=r.data||[];
  var cn=document.getElementById('c-count');if(cn)cn.textContent=list.length;
  el.innerHTML=list.length?list.map(function(c){
   var av=safeImg(c.avatar_url);
   return '<div class="c-card c-item">'+(av?'<img src="'+esc(av)+'" alt="" loading="lazy">':'<span class="av">'+esc(Array.from(c.author_name||'?')[0])+'</span>')+
    '<div><div class="c-h"><b>'+esc(c.author_name)+'</b><span>'+ago(c.created_at)+'</span>'+(user&&user.id===c.user_id?'<button class="c-del" data-id="'+c.id+'">Hapus</button>':'')+'</div>'+
    '<p>'+esc(c.body)+'</p></div></div>'}).join(''):'<div class="empty">Belum ada komentar.</div>';
  [].forEach.call(el.querySelectorAll('.c-del'),function(b){b.onclick=function(){
   if(!confirm('Hapus komentar ini?'))return;
   sb.from('comments').delete().eq('id',b.dataset.id).then(load)}});
 });
}

function send(){
 var ta=document.getElementById('c-body'),msg=document.getElementById('c-msg'),btn=document.getElementById('c-send');
 var v=ta.value.trim();if(!v){msg.className='c-info err';msg.textContent='Komentar kosong.';return}
 btn.disabled=true;msg.className='c-info';
 sb.from('comments').insert({post_slug:slug,body:v}).then(function(r){
  btn.disabled=false;
  if(r.error){msg.className='c-info err';console.error('Komentar gagal:',r.error);msg.textContent=/cepat/i.test(r.error.message||'')?'Terlalu cepat, tunggu sebentar.':'Gagal mengirim: '+(r.error.message||'kesalahan tidak diketahui')+(r.error.code?' ['+r.error.code+']':'');return}
  ta.value='';msg.innerHTML='<span id="c-cnt">0</span>/1000';load();
 });
}
})();
