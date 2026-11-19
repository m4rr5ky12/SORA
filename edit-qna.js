
document.addEventListener("DOMContentLoaded", async () => {
  const qnaList = document.getElementById("qnaList");
  const manageMessage = document.getElementById("manageMessage");

  const supabase =
    window.soraSupabaseClient || window.supabaseClient;

  if (!supabase) {
    manageMessage.textContent = "Supabase belum terhubung.";
    return;
  }

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    window.location.href = "login.html";
    return;
  }

  async function loadQnaPages() {
    qnaList.innerHTML = "";
    manageMessage.textContent = "Memuat halaman Q&A...";

    const { data: pages, error } = await supabase
      .from("qna_pages")
      .select("id, slug, title, description, created_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      manageMessage.textContent =
        "Gagal mengambil data: " + error.message;
      return;
    }

    manageMessage.textContent = "";

    if (!pages || pages.length === 0) {
      qnaList.innerHTML = `
        <div class="empty-state">
          <h3>Belum Ada Halaman Q&A</h3>
          <p>Silakan buat halaman Q&A terlebih dahulu.</p>
          <a href="create-qna.html" class="button">
            Buat Halaman Q&A
          </a>
        </div>
      `;
      return;
    }

    pages.forEach((page) => {
      const card = document.createElement("div");
      card.className = "qna-card";

      const title = document.createElement("h3");
      title.textContent = page.title || "Tanpa Judul";

      const description = document.createElement("p");
      description.textContent =
        page.description || "Tidak ada deskripsi.";

      const slugLabel = document.createElement("small");
      slugLabel.textContent = "Slug: " + page.slug;

      const dateLabel = document.createElement("small");
      dateLabel.textContent =
        "Dibuat: " +
        new Date(page.created_at).toLocaleDateString("id-ID");

      // Tombol Edit
      const editButton = document.createElement("button");
      editButton.textContent = "✏️ Edit";

      editButton.addEventListener("click", () => {
        window.location.href =
          "edit-qna.html?id=" + encodeURIComponent(page.id);
      });

      // Tombol Salin Slug
      const copyButton = document.createElement("button");
      copyButton.textContent = "📋 Salin Slug";

      copyButton.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(page.slug);
          copyButton.textContent = "Berhasil Disalin!";

          setTimeout(() => {
            copyButton.textContent = "📋 Salin Slug";
          }, 2000);
        } catch {
          alert("Gagal menyalin slug.");
        }
      });

      // Tombol Hapus
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "🗑️ Hapus";
      deleteButton.className = "delete-button";

      deleteButton.addEventListener("click", async () => {
        const confirmed = confirm(
          `Yakin ingin menghapus halaman "${page.title}"?`
        );

        if (!confirmed) return;

        deleteButton.disabled = true;
        deleteButton.textContent = "Menghapus...";

        const { error: deleteError } = await supabase
          .from("qna_pages")
          .delete()
          .eq("id", page.id)
          .eq("owner_id", user.id);

        if (deleteError) {
          alert(
            "Gagal menghapus halaman: " +
            deleteError.message
          );

          deleteButton.disabled = false;
          deleteButton.textContent = "🗑️ Hapus";
          return;
        }

        await loadQnaPages();
      });

      card.appendChild(title);
      card.appendChild(description);
      card.appendChild(slugLabel);
      card.appendChild(dateLabel);
      card.appendChild(editButton);
      card.appendChild(copyButton);
      card.appendChild(deleteButton);

      qnaList.appendChild(card);
    });
  }

  await loadQnaPages();
});
