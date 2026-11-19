
document.addEventListener("DOMContentLoaded", async () => {
  const supabaseClient =
    window.supabaseClient || window.soraSupabaseClient;

  const qnaList = document.getElementById("qnaList");
  const manageMessage = document.getElementById("manageMessage");

  if (!supabaseClient) {
    manageMessage.textContent = "Supabase belum terhubung.";
    return;
  }

  const {
    data: { user },
    error: authError
  } = await supabaseClient.auth.getUser();

  if (authError || !user) {
    window.location.href = "login.html";
    return;
  }

  function showMessage(message, color = "#563746") {
    manageMessage.textContent = message;
    manageMessage.style.color = color;
  }

  function createButton(text, className, callback) {
    const button = document.createElement("button");

    button.textContent = text;
    button.className = className;
    button.type = "button";

    button.addEventListener("click", callback);

    return button;
  }

  function getPublicUrl(slug) {
    return new URL(
      "qna.html?u=" + encodeURIComponent(slug),
      window.location.href
    ).href;
  }

  async function copyText(text, successMessage) {
    try {
      await navigator.clipboard.writeText(text);
      showMessage(successMessage, "#278348");
    } catch (error) {
      const textarea = document.createElement("textarea");

      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";

      document.body.appendChild(textarea);
      textarea.select();

      const copied = document.execCommand("copy");

      textarea.remove();

      if (copied) {
        showMessage(successMessage, "#278348");
      } else {
        showMessage("Gagal menyalin.", "#C62828");
      }
    }
  }

  /* ========================================
     QR CODE MODAL
  ======================================== */

  function showQrModal(page) {
    const publicUrl = getPublicUrl(page.slug);

    const overlay = document.createElement("div");
    overlay.className = "qr-modal-overlay";

    const modal = document.createElement("div");
    modal.className = "qr-modal";

    const title = document.createElement("h2");
    title.textContent = "QR Code Q&A";

    const description = document.createElement("p");
    description.textContent = page.title;

    const qrBox = document.createElement("div");
    qrBox.className = "qr-code-box";

    const linkText = document.createElement("p");
    linkText.textContent = publicUrl;

    const actions = document.createElement("div");
    actions.className = "qr-modal-actions";

    const downloadButton = createButton(
      "⬇️ Unduh QR Code",
      "qr-download-button",
      () => {
        const canvas = qrBox.querySelector("canvas");
        const image = qrBox.querySelector("img");

        let imageUrl = "";

        if (canvas) {
          imageUrl = canvas.toDataURL("image/png");
        } else if (image && image.src) {
          imageUrl = image.src;
        }

        if (!imageUrl) {
          alert("QR Code belum berhasil dibuat.");
          return;
        }

        const link = document.createElement("a");

        link.href = imageUrl;
        link.download =
          (page.slug || "sora-qna") + "-qr.png";

        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    );

    const copyLinkButton = createButton(
      "🔗 Salin Link Q&A",
      "copy-button",
      () => copyText(publicUrl, "Link Q&A berhasil disalin!")
    );

    const closeButton = createButton(
      "Tutup",
      "qr-close-button",
      () => overlay.remove()
    );

    actions.appendChild(downloadButton);
    actions.appendChild(copyLinkButton);
    actions.appendChild(closeButton);

    modal.appendChild(title);
    modal.appendChild(description);
    modal.appendChild(qrBox);
    modal.appendChild(linkText);
    modal.appendChild(actions);

    overlay.appendChild(modal);

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        overlay.remove();
      }
    });

    document.body.appendChild(overlay);

    if (typeof QRCode === "undefined") {
      qrBox.textContent =
        "Library QR Code gagal dimuat. Periksa koneksi internet.";
      return;
    }

    new QRCode(qrBox, {
      text: publicUrl,
      width: 200,
      height: 200,
      colorDark: "#563746",
      colorLight: "#FFFFFF",
      correctLevel: QRCode.CorrectLevel.H
    });
  }

  /* ========================================
     LOAD PAGE STATISTICS
  ======================================== */

  async function loadPageStatistics(pageIds) {
    const statistics = {};

    pageIds.forEach((id) => {
      statistics[id] = {
        visits: 0,
        questions: 0
      };
    });

    if (pageIds.length === 0) {
      return statistics;
    }

    /* ========================================
       COUNT VISITS
    ======================================== */

    const {
      data: visits,
      error: visitsError
    } = await supabaseClient
      .from("qna_visits")
      .select("page_id")
      .in("page_id", pageIds);

    if (visitsError) {
      console.error("Visit statistics error:", visitsError);
    } else {
      (visits || []).forEach((visit) => {
        if (statistics[visit.page_id]) {
          statistics[visit.page_id].visits++;
        }
      });
    }

    /* ========================================
       COUNT QUESTIONS
    ======================================== */

    const {
      data: questions,
      error: questionsError
    } = await supabaseClient
      .from("qna_questions")
      .select("qna_page_id")
      .in("qna_page_id", pageIds);

    if (questionsError) {
      console.error("Question statistics error:", questionsError);
    } else {
      (questions || []).forEach((question) => {
        if (statistics[question.qna_page_id]) {
          statistics[question.qna_page_id].questions++;
        }
      });
    }

    return statistics;
  }

  /* ========================================
     LOAD QNA PAGES
  ======================================== */

  async function loadQnaPages() {
    qnaList.innerHTML = "";
    showMessage("Memuat halaman Q&A...");

    const {
      data: pages,
      error
    } = await supabaseClient
      .from("qna_pages")
      .select("id, slug, title, description, created_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      showMessage("Gagal memuat halaman Q&A.", "#C62828");
      return;
    }

    if (!pages || pages.length === 0) {
      showMessage("");

      const emptyMessage = document.createElement("div");
      emptyMessage.className = "empty-message";
      emptyMessage.textContent =
        "Kamu belum memiliki halaman Q&A.";

      qnaList.appendChild(emptyMessage);
      return;
    }

    const pageIds = pages.map(page => page.id);

    showMessage("Memuat statistik...");

    const statistics = await loadPageStatistics(pageIds);

    showMessage("");

    /* ========================================
       CREATE QNA CARDS
    ======================================== */

    pages.forEach((page) => {
      const stats = statistics[page.id] || {
        visits: 0,
        questions: 0
      };

      const card = document.createElement("div");
      card.className = "qna-card";

      const title = document.createElement("h3");
      title.textContent = page.title || "Halaman Q&A";

      const description = document.createElement("p");
      description.textContent =
        page.description || "Tidak ada deskripsi.";

      const slugText = document.createElement("p");
      slugText.textContent = "Slug: " + page.slug;

      /* ========================================
         STATISTICS
      ======================================== */

      const statsContainer = document.createElement("div");
      statsContainer.className = "qna-page-stats";

      const visitStat = document.createElement("div");
      visitStat.className = "qna-stat-item";

      const visitIcon = document.createElement("span");
      visitIcon.textContent = "👁️";

      const visitLabel = document.createElement("span");
      visitLabel.textContent = "Pengunjung: ";

      const visitNumber = document.createElement("strong");
      visitNumber.textContent = stats.visits;

      visitStat.appendChild(visitIcon);
      visitStat.appendChild(visitLabel);
      visitStat.appendChild(visitNumber);

      const questionStat = document.createElement("div");
      questionStat.className = "qna-stat-item";

      const questionIcon = document.createElement("span");
      questionIcon.textContent = "💌";

      const questionLabel = document.createElement("span");
      questionLabel.textContent = "Pertanyaan: ";

      const questionNumber = document.createElement("strong");
      questionNumber.textContent = stats.questions;

      questionStat.appendChild(questionIcon);
      questionStat.appendChild(questionLabel);
      questionStat.appendChild(questionNumber);

      statsContainer.appendChild(visitStat);
      statsContainer.appendChild(questionStat);

      /* ========================================
         ACTIONS
      ======================================== */

      const actions = document.createElement("div");
      actions.className = "qna-actions";

      // Buka halaman
      const openButton = document.createElement("a");
      openButton.textContent = "👁️ Buka Halaman";
      openButton.className = "open-button";
      openButton.href =
        "qna.html?u=" + encodeURIComponent(page.slug);
      openButton.target = "_blank";
      openButton.rel = "noopener noreferrer";

      // Edit
      const editButton = document.createElement("button");
      editButton.textContent = "✏️ Edit";
      editButton.className = "edit-button";
      editButton.type = "button";

      editButton.addEventListener("click", () => {
        window.location.href =
          "edit-qna.html?id=" + encodeURIComponent(page.id);
      });

      // Salin slug
      const copySlugButton = createButton(
        "📋 Salin Slug",
        "copy-button",
        () => copyText(page.slug, "Slug berhasil disalin!")
      );

      // Salin link
      const copyLinkButton = createButton(
        "🔗 Salin Link",
        "copy-button",
        () => copyText(
          getPublicUrl(page.slug),
          "Link Q&A berhasil disalin!"
        )
      );

      // QR Code
      const qrButton = createButton(
        "📱 QR Code",
        "qr-button",
        () => showQrModal(page)
      );

      // Hapus
      const deleteButton = createButton(
        "🗑️ Hapus",
        "delete-button",
        async () => {
          const confirmed = confirm(
            "Yakin ingin menghapus halaman Q&A ini?"
          );

          if (!confirmed) return;

          deleteButton.disabled = true;
          deleteButton.textContent = "Menghapus...";

          const {
            error: deleteError
          } = await supabaseClient
            .from("qna_pages")
            .delete()
            .eq("id", page.id)
            .eq("owner_id", user.id);

          if (deleteError) {
            console.error(deleteError);

            alert("Gagal menghapus halaman Q&A.");

            deleteButton.disabled = false;
            deleteButton.textContent = "🗑️ Hapus";
            return;
          }

          showMessage(
            "Halaman Q&A berhasil dihapus!",
            "#278348"
          );

          await loadQnaPages();
        }
      );

      actions.appendChild(openButton);
      actions.appendChild(editButton);
      actions.appendChild(copySlugButton);
      actions.appendChild(copyLinkButton);
      actions.appendChild(qrButton);
      actions.appendChild(deleteButton);

      card.appendChild(title);
      card.appendChild(description);
      card.appendChild(slugText);
      card.appendChild(statsContainer);
      card.appendChild(actions);

      qnaList.appendChild(card);
    });
  }

  /* ========================================
     START
  ======================================== */

  await loadQnaPages();
});
