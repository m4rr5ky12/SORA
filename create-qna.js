
document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("qnaForm");
  const button = document.getElementById("createButton");
  const result = document.getElementById("result");

  // Periksa login
  const { data: { user }, error: authError } =
    await supabaseClient.auth.getUser();

  if (authError || !user) {
    window.location.replace("login.html");
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = document.getElementById("qnaTitle").value.trim();
    const description =
      document.getElementById("qnaDescription").value.trim();

    const anonymous = document.getElementById("anonymousMode").checked;
    const identified = document.getElementById("identifiedMode").checked;

    if (!anonymous && !identified) {
      result.style.color = "#d95f91";
      result.textContent = "Pilih minimal satu mode pengiriman.";
      return;
    }

    if (!title) {
      result.style.color = "#d95f91";
      result.textContent = "Judul halaman wajib diisi.";
      return;
    }

    button.disabled = true;
    button.textContent = "Menyimpan...";
    result.textContent = "";

    try {
      // Membuat slug unik
      const slug = (
        title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 35) || "sora"
      ) + "-" + crypto.randomUUID().slice(0, 8);

      // Simpan halaman ke Supabase
      const { data, error } = await supabaseClient
        .from("qna_pages")
        .insert({
          owner_id: user.id,
          slug: slug,
          title: title,
          description: description,
          anonymous_enabled: anonymous,
          identified_enabled: identified
        })
        .select("id, slug, title")
        .single();

      if (error) throw error;

      // Link publik sementara
      const publicLink = new URL(
        "qna.html",
        window.location.href
      );

      publicLink.searchParams.set("u", data.slug);

      result.style.color = "#39865b";
      result.innerHTML = `
        <strong>Halaman Q&A berhasil dibuat! 💗</strong>
        <p>Link Q&A kamu:</p>
        <p><a href="${publicLink.href}">${publicLink.href}</a></p>
        <button type="button" id="copyLink"
          style="margin-top:10px;padding:10px;background:#f7c5d8;color:#563746">
          Salin Link
        </button>
        <p style="margin-top:12px">
          Halaman publik akan bisa digunakan setelah fitur pengiriman selesai dibuat.
        </p>
      `;

      document.getElementById("copyLink").addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(publicLink.href);
          document.getElementById("copyLink").textContent = "Link tersalin!";
        } catch {
          result.insertAdjacentHTML(
            "beforeend",
            "<p>Salin link secara manual dari alamat di atas.</p>"
          );
        }
      });

      button.textContent = "Berhasil Dibuat";

    } catch (error) {
      console.error(error);
      result.style.color = "#d95f91";
      result.textContent = "Gagal membuat Q&A: " + error.message;
      button.disabled = false;
      button.textContent = "Buat Halaman Q&A";
    }
  });
});
