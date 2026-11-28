/* Mode situs. Komik dipisah dari post biasa:
   - post biasa : daftar di /            data/posts.json   baca di /g/slug
   - komik      : daftar di /comics      data/comic.json   baca di /k/slug  */
window.APF_MODE = (function () {
  var c = /^\/(comics|k)(\/|$)/i.test(location.pathname);
  return { comic: c, data: c ? '/data/comic.json' : '/data/posts.json', base: c ? '/k/' : '/g/', home: c ? '/comics' : '/' };
})();

// Isi dari Supabase: Project Settings -> API (Project URL & anon public key)
window.APF_CONFIG = {
  supabaseUrl: window.location.origin + '/sb',
  supabaseAnonKey: 'sb_publishable_ZTfhKAi7rYz4jJFTpHq38w_LsngGKhy',
    providers: ['discord'],
  // Jenis post: post yang punya category/tag/label ini otomatis memakai tampilan Video (khusus YouTuber/VTuber, dan hanya bila post punya video) atau Komik (huruf besar/kecil bebas).
  postTypes: { video: ['Vtubers','Vtuber','Youtuber','Youtubers','Youtube Membership'], comic: ['Manga','Komik','Comic'] },
  // Pendaftaran email hanya boleh dari domain berikut. Kosongkan ([]) untuk mengizinkan semua domain.
  allowedEmailDomains: ['gmail.com','googlemail.com','yahoo.com','yahoo.co.id','ymail.com','proton.me','protonmail.com','pm.me','outlook.com','hotmail.com','live.com','icloud.com'],
  videoTitle: 'Streaming', // judul bagian video di semua artikel (bisa ditimpa per artikel lewat "videoTitle" di posts.json)
  audioTitle: 'Audio', // judul bagian audio (bisa ditimpa per artikel lewat "audioTitle" di posts.json)
  authors: { 'Admin': '/images/admin.webp' }
};
