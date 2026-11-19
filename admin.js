
/* ========================================
   SORA - ADMIN PANEL
======================================== */

const db =
  window.soraSupabaseClient ||
  window.supabaseClient;

const adminMessage =
  document.getElementById("adminMessage");

const adminIdentity =
  document.getElementById("adminIdentity");

const suggestionTable =
  document.getElementById("suggestionTable");

const refreshButton =
  document.getElementById("refreshButton");


/* ========================================
   CHECK ADMIN ACCESS
======================================== */

async function checkAdmin() {
  if (!db) {
    adminMessage.textContent =
      "Koneksi Supabase tidak tersedia.";

    return false;
  }

  const { data: authData, error: authError } =
    await db.auth.getUser();

  if (authError || !authData.user) {
    adminMessage.textContent =
      "Silakan login terlebih dahulu.";

    adminIdentity.textContent =
      "Belum login";

    return false;
  }

  const user = authData.user;

  adminIdentity.textContent =
    user.email || user.id;

  const { data: adminData, error: adminError } =
    await db
      .from("sora_admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

  if (adminError || !adminData) {
    console.error("Admin verification error:", adminError);

    adminMessage.textContent =
      "Akses ditolak. Akun ini bukan Admin SORA.";

    return false;
  }

  adminMessage.textContent =
    "Admin terverifikasi. Berikut saran yang masuk.";

  return true;
}


/* ========================================
   LOAD SUGGESTIONS
======================================== */

async function loadSuggestions() {
  suggestionTable.innerHTML = `
    <tr>
      <td colspan="5" class="admin-empty">
        Memuat saran...
      </td>
    </tr>
  `;

  refreshButton.disabled = true;
  refreshButton.textContent = "Memuat...";

  const { data, error } = await db
    .from("suggestions")
    .select("id, user_id, category, message, created_at")
    .order("created_at", { ascending: false });

  refreshButton.disabled = false;
  refreshButton.textContent = "🔄 Refresh Saran";

  if (error) {
    console.error("Suggestions error:", error);

    suggestionTable.innerHTML = `
      <tr>
        <td colspan="5" class="admin-empty">
          Gagal memuat saran.
        </td>
      </tr>
    `;

    adminMessage.textContent =
      "Gagal mengambil data. Periksa izin database.";

    return;
  }

  if (!data || data.length === 0) {
    suggestionTable.innerHTML = `
      <tr>
        <td colspan="5" class="admin-empty">
          Belum ada saran yang masuk.
        </td>
      </tr>
    `;

    adminMessage.textContent =
      "Admin terverifikasi. Belum ada saran.";

    return;
  }

  adminMessage.textContent =
    `Admin terverifikasi. ${data.length} saran ditemukan.`;

  data.forEach((suggestion) => {
    const row = document.createElement("tr");

    const categoryCell = document.createElement("td");
    categoryCell.textContent = suggestion.category;

    const messageCell = document.createElement("td");
    messageCell.textContent = suggestion.message;

    const userCell = document.createElement("td");
    userCell.textContent = suggestion.user_id;

    const dateCell = document.createElement("td");

    dateCell.textContent = suggestion.created_at
      ? new Date(suggestion.created_at).toLocaleString("id-ID")
      : "-";

    const actionCell = document.createElement("td");

    const deleteButton = document.createElement("button");

    deleteButton.textContent = "Hapus";
    deleteButton.className = "admin-delete";

    deleteButton.addEventListener("click", async () => {
      const confirmed = confirm(
        "Apakah kamu yakin ingin menghapus saran ini?"
      );

      if (!confirmed) return;

      deleteButton.disabled = true;
      deleteButton.textContent = "Menghapus...";

      const { error: deleteError } = await db
        .from("suggestions")
        .delete()
        .eq("id", suggestion.id);

      if (deleteError) {
        console.error("Delete error:", deleteError);

        alert("Saran gagal dihapus.");

        deleteButton.disabled = false;
        deleteButton.textContent = "Hapus";

        return;
      }

      row.remove();

      adminMessage.textContent =
        "Saran berhasil dihapus.";

      if (suggestionTable.children.length === 0) {
        suggestionTable.innerHTML = `
          <tr>
            <td colspan="5" class="admin-empty">
              Belum ada saran yang masuk.
            </td>
          </tr>
        `;
      }
    });

    actionCell.appendChild(deleteButton);

    row.appendChild(categoryCell);
    row.appendChild(messageCell);
    row.appendChild(userCell);
    row.appendChild(dateCell);
    row.appendChild(actionCell);

    suggestionTable.appendChild(row);
  });
}


/* ========================================
   REFRESH BUTTON
======================================== */

refreshButton.addEventListener("click", async () => {
  await loadSuggestions();
});


/* ========================================
   INITIALIZE
======================================== */

async function initializeAdmin() {
  const authorized = await checkAdmin();

  if (!authorized) {
    suggestionTable.innerHTML = "";
    refreshButton.disabled = true;

    return;
  }

  await loadSuggestions();
}

initializeAdmin();
