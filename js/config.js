// Isi dari Supabase: Project Settings -> API (Project URL & anon public key)
window.APF_CONFIG = {
  supabaseUrl: window.location.origin + '/sb',
  supabaseAnonKey: 'sb_publishable_ZTfhKAi7rYz4jJFTpHq38w_LsngGKhy',
    providers: ['discord'],
  videoTitle: 'Streaming', // judul bagian video di semua artikel (bisa ditimpa per artikel lewat "videoTitle" di posts.json)
  audioTitle: 'Audio', // judul bagian audio (bisa ditimpa per artikel lewat "audioTitle" di posts.json)
  authors: { 'Admin': '/images/admin.webp' }
};
