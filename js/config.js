// Isi dari Supabase: Project Settings -> API (Project URL & anon public key)
window.APF_CONFIG = {
  supabaseUrl: window.location.origin + '/sb',
  supabaseAnonKey: 'sb_publishable_ZTfhKAi7rYz4jJFTpHq38w_LsngGKhy',
    providers: ['discord'],
  // Pendaftaran email hanya boleh dari domain berikut. Kosongkan ([]) untuk mengizinkan semua domain.
  allowedEmailDomains: ['gmail.com','googlemail.com','yahoo.com','yahoo.co.id','ymail.com','proton.me','protonmail.com','pm.me','outlook.com','hotmail.com','live.com','icloud.com'],
  videoTitle: 'Streaming', // judul bagian video di semua artikel (bisa ditimpa per artikel lewat "videoTitle" di posts.json)
  audioTitle: 'Audio', // judul bagian audio (bisa ditimpa per artikel lewat "audioTitle" di posts.json)
  authors: { 'Admin': '/images/admin.webp' }
};
