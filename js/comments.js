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
 var anchor=document.querySelector('.entry');
 if(anchor||++tries>50){clearInterval(t);if(anchor&&slug)start(anchor)}
},100);

function start(anchor){
 root=document.createElement('section');root.className='comments';root.id='comments';
 var back=document.querySelector('.back');
 anchor.parentNode.insertBefore(root,back||anchor.nextSibling);
 sb.auth.getSession().then(function(r){user=r.data.session&&r.data.session.user;draw()});
 sb.auth.onAuthStateChange(function(_e,s){var n=s&&s.user;if((n&&n.id)!==(user&&user.id)){user=n;draw()}});
 draw();
}

var list=[];
function draw(){
 var h='<div class="title"><h2>Komentar</h2><i></i></div>';
 if(user){
  var m=user.user_metadata||{},nm=m.full_name||m.name||m.user_name||'Anda',av=safeImg(m.avatar_url||m.picture);
  h+='<div class="c-me">'+(av?'<img src="'+esc(av)+'" alt="">':'<span class="av">'+esc(nm[0]||'?')+'</span>')+'<b>'+esc(nm)+'</b><button class="c-out" id="c-out">Keluar</button></div>'+
   '<textarea id="c-body" maxlength="1000" placeholder="Tulis komentar…"></textarea>'+
   '<div class="c-row"><span id="c-msg"></span><button class="c-send" id="c-send">Kirim</button></div>';
 }else{
  h+='<div class="c-login"><span>Masuk untuk berkomentar:</span>'+(C.providers||['discord']).map(function(p){return '<button class="c-prov p-'+esc(p)+'" data-p="'+esc(p)+'">'+esc(names[p]||p)+'</button>'}).join('')+'</div>';
 }
 h+='<div class="c-list" id="c-list"><div class="empty">Memuat komentar…</div></div>';
 root.innerHTML=h;
 [].forEach.call(root.querySelectorAll('.c-prov'),function(b){b.onclick=function(){
  sb.auth.signInWithOAuth({provider:b.dataset.p,options:{redirectTo:location.origin+'/post.html?s='+encodeURIComponent(slug)}})}});
 var o=document.getElementById('c-out');if(o)o.onclick=function(){sb.auth.signOut()};
 var s=document.getElementById('c-send');if(s)s.onclick=send;
 load();
}

function load(){
 sb.from('comments').select('id,user_id,author_name,avatar_url,body,created_at').eq('post_slug',slug).order('created_at',{ascending:false}).limit(100)
 .then(function(r){
  var el=document.getElementById('c-list');if(!el)return;
  if(r.error){el.innerHTML='<div class="empty">Komentar tidak dapat dimuat.</div>';return}
  list=r.data||[];
  el.innerHTML=list.length?list.map(function(c){
   var av=safeImg(c.avatar_url);
   return '<div class="c-item">'+(av?'<img src="'+esc(av)+'" alt="" loading="lazy">':'<span class="av">'+esc((c.author_name||'?')[0])+'</span>')+
    '<div><div class="c-h"><b>'+esc(c.author_name)+'</b><span>'+ago(c.created_at)+'</span>'+(user&&user.id===c.user_id?'<button class="c-del" data-id="'+c.id+'">Hapus</button>':'')+'</div>'+
    '<p>'+esc(c.body)+'</p></div></div>'}).join(''):'<div class="empty">Belum ada komentar.</div>';
  [].forEach.call(el.querySelectorAll('.c-del'),function(b){b.onclick=function(){
   if(!confirm('Hapus komentar ini?'))return;
   sb.from('comments').delete().eq('id',b.dataset.id).then(load)}});
 });
}

function send(){
 var ta=document.getElementById('c-body'),msg=document.getElementById('c-msg'),btn=document.getElementById('c-send');
 var v=ta.value.trim();if(!v){msg.textContent='Komentar kosong.';return}
 btn.disabled=true;msg.textContent='';
 sb.from('comments').insert({post_slug:slug,body:v}).then(function(r){
  btn.disabled=false;
  if(r.error){msg.textContent=/cepat/i.test(r.error.message)?'Terlalu cepat, tunggu sebentar.':'Gagal mengirim komentar.';return}
  ta.value='';load();
 });
}
})();
