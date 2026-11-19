
/* ========================================
   SORA - SUPABASE CONNECTION
======================================== */

const SORA_SUPABASE_URL = "https://luejjvqnbulfbyjyvrrv.supabase.co";

const SORA_SUPABASE_KEY =
  "sb_publishable_3TSP8h3K4voKDa_C0mN0QA_D6niT4yi";

if (!window.supabase || !window.supabase.createClient) {
  console.error("Library Supabase gagal dimuat.");
} else {
  const client = window.supabase.createClient(
    SORA_SUPABASE_URL,
    SORA_SUPABASE_KEY
  );

  // Nama koneksi yang digunakan oleh halaman lama
  window.supabaseClient = client;

  // Nama koneksi yang digunakan oleh halaman baru
  window.soraSupabaseClient = client;

  console.log("SORA Supabase berhasil terhubung.");
}
