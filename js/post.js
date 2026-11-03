/* Halaman menonton (post.html?id=...) */
var cur=null;
var SEED={v1:[{n:"Dewi",t:"Penjelasannya rapi dan mudah diikuti!"}],v3:[{n:"Raka",t:"Ditunggu video lanjutannya."}]};
function getC(id){var a=store("vk_comments",{});return a[id]===undefined?(SEED[id]||[]):a[id]}
function setC(id,l){var a=store("vk_comments",{});a[id]=l;put("vk_comments",a)}
function mine(k){return user?(store(k,{})[user.e]||[]):[]}
function flip(k,val){var a=store(k,{}),l=a[user.e]||[],i=l.indexOf(val);if(i>-1)l.splice(i,1);else l.push(val);a[user.e]=l;put(k,a)}
function side(v){return '<a class="vid" href="post.html?id='+esc(v.id)+'"><div class="th" style="'+bg(v)+'"><span class="dur">'+esc(v.d)+'</span></div><div><h3>'+esc(v.t)+'</h3><div class="meta">'+esc(v.ch)+'<br>'+esc(v.v)+' ditonton · '+esc(v.a)+'</div></div></a>'}

function draw(){
  var app=$("#app");
  if(loadErr){app.innerHTML='<div class="empty">Gagal memuat data/posts.json. Buka situs lewat Vercel atau server lokal, bukan langsung dari file.</div>';return}
  var v=videos.find(function(x){return x.id===new URLSearchParams(location.search).get("id")});
  if(!v){app.innerHTML='<div class="empty">Video tidak ditemukan. <a class="ch" style="text-decoration:underline" href="index.html">Kembali ke beranda</a></div>';return}
  cur=v;document.title=v.t+" - Videoku";
  var player=v.src?'<video controls src="'+esc(v.src)+'"></video>':'<div><b>Video contoh</b><p>Isi kolom src di posts.json dengan alamat file videomu agar diputar di sini.</p></div>';
  var others=videos.filter(function(x){return x.id!==v.id}).sort(function(a,b){return (b.cid===v.cid)-(a.cid===v.cid)});
  var href="index.html#channel-"+esc(v.cid);
  app.innerHTML='<div class="pw"><section class="pmain"><div class="player" '+(v.src?'':'style="'+bg(v)+'"')+'>'+player+'</div>'+
  '<h1 class="ptitle">'+esc(v.t)+'</h1>'+
  '<div class="prow"><div class="pch"><a class="av" href="'+href+'">'+esc(v.ch[0].toUpperCase())+'</a><div><a class="chname" href="'+href+'">'+esc(v.ch)+'</a><div class="meta" id="fc"></div></div><button class="btn pri" id="fb"></button></div>'+
  '<div class="pact"><button class="btn" id="lb"></button><button class="btn" id="db" aria-label="Tidak suka">👎</button><button class="btn" id="sb">Bagikan</button></div></div>'+
  '<div class="desc"><b>'+esc(v.v)+' ditonton · '+esc(v.a)+'</b><p>'+esc(v.desc||"Belum ada deskripsi.")+'</p></div>'+
  '<div class="cm" id="cm"></div></section><aside class="side">'+others.map(side).join("")+'</aside></div>';
  $("#fb").onclick=function(){if(!user){openAuth("login");return}flip("vk_follow",v.cid);paint()};
  $("#lb").onclick=function(){react("vk_likes","vk_dislikes")};
  $("#db").onclick=function(){react("vk_dislikes","vk_likes")};
  $("#sb").onclick=function(){var b=this;try{navigator.clipboard.writeText(location.href).then(function(){b.textContent="Tautan disalin";setTimeout(function(){b.textContent="Bagikan"},1600)})}catch(e){}};
  paint();drawComments();
}
function react(k,o){
  if(!user){openAuth("login");return}
  if(mine(k).indexOf(cur.id)<0&&mine(o).indexOf(cur.id)>-1)flip(o,cur.id);
  flip(k,cur.id);paint();
}
function paint(){
  var v=cur,f=mine("vk_follow").indexOf(v.cid)>-1,l=mine("vk_likes").indexOf(v.id)>-1;
  $("#fc").textContent=fmt((chan(v.cid).followers||0)+(f?1:0))+" pengikut";
  $("#fb").textContent=f?"Mengikuti":"Ikuti";$("#fb").className="btn"+(f?"":" pri");
  $("#lb").textContent="👍 "+(l?"Disukai · ":"")+fmt(v.likes+(l?1:0));$("#lb").className="btn"+(l?" on":"");
  $("#db").className="btn"+(mine("vk_dislikes").indexOf(v.id)>-1?" on":"");
}
function drawComments(){
  var id=cur.id,list=getC(id),box=$("#cm");
  var form=user?'<div class="cform"><div class="av">'+esc(user.n[0].toUpperCase())+'</div><input id="ci" type="text" placeholder="Tulis komentar" maxlength="300" aria-label="Tulis komentar"><button class="btn pri" id="cs">Kirim</button></div>'
    :'<div class="cform"><span class="meta">Masuk dulu untuk berkomentar.</span><button class="btn sm" id="cl">Masuk</button></div>';
  box.innerHTML='<h4>'+list.length+' komentar</h4>'+form+list.map(function(c,i){
    var can=user&&c.e&&c.e===user.e;
    return '<div class="c"><div class="av">'+esc(c.n[0].toUpperCase())+'</div><div><b>'+esc(c.n)+'</b>'+(can?' <button class="btn del" data-i="'+i+'">Hapus</button>':'')+'<p>'+esc(c.t)+'</p></div></div>'}).join("");
  var cs=$("#cs"),cl=$("#cl");
  if(cs){var send=function(){var t=$("#ci").value.trim();if(!t)return;var l=getC(id).slice();l.unshift({n:user.n,e:user.e,t:t});setC(id,l);drawComments()};cs.onclick=send;$("#ci").onkeydown=function(e){if(e.key==="Enter")send()}}
  if(cl)cl.onclick=function(){openAuth("login")};
  box.querySelectorAll(".del").forEach(function(b){b.onclick=function(){var l=getC(id).slice();l.splice(+b.dataset.i,1);setC(id,l);drawComments()}});
}
function onAuth(){if(cur){paint();drawComments()}}
$("#q").onkeydown=function(e){if(e.key==="Enter")location.href="index.html?q="+encodeURIComponent(this.value)};
load().then(draw);
