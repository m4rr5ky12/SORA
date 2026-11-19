
const qnaTitle = document.getElementById("qnaTitle");
const qnaDescription = document.getElementById("qnaDescription");
const ownerAvatar = document.getElementById("ownerAvatar");

const publicQnaForm = document.getElementById("publicQnaForm");
const senderName = document.getElementById("senderName");
const questionText = document.getElementById("questionText");
const anonymousMode = document.getElementById("anonymousMode");
const sendButton = document.getElementById("sendButton");
const qnaMessage = document.getElementById("qnaMessage");

const slug = new URLSearchParams(window.location.search).get("u");

let currentPage = null;

// ========================================
// MENCATAT KUNJUNGAN
// ========================================

async function recordVisit() {
  if (!slug) return;

  try {
    const { data, error } = await supabaseClient.rpc(
      "record_qna_visit",
      {
        p_slug: slug
      }
    );

    if (error) {
      console.error("Gagal mencatat kunjungan:", error);
      return;
    }

    console.log("Kunjungan berhasil dicatat:", data);

  } catch (error) {
    console.error("Kesalahan pencatatan kunjungan:", error);
  }
}

// ========================================
// MEMUAT HALAMAN Q&A
// ========================================

async function loadQnaPage() {
  if (!slug) {
    qnaMessage.textContent = "Link Q&A tidak valid.";
    return;
  }

  const { data, error } = await supabaseClient.rpc(
    "get_public_qna_page",
    {
      p_slug: slug
    }
  );

  if (error || !data || data.length === 0) {
    qnaMessage.textContent = "Halaman Q&A tidak ditemukan.";
    console.error(error);
    return;
  }

  currentPage = data[0];

  // Catat kunjungan menggunakan slug
  recordVisit();

  qnaTitle.textContent = currentPage.page_title;
  qnaDescription.textContent =
    currentPage.page_description || "";

  ownerAvatar.textContent =
    currentPage.owner_display_name?.charAt(0).toUpperCase() || "S";

  // ========================================
  // BACKGROUND HALAMAN
  // ========================================

  document.body.style.backgroundColor =
    currentPage.page_background_color || "#FFF5F9";

  if (currentPage.page_background_image_url) {
    document.body.style.backgroundImage =
      `url("${currentPage.page_background_image_url}")`;

    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.backgroundRepeat = "no-repeat";
  } else {
    document.body.style.backgroundImage = "none";
  }

  document.body.style.color =
    currentPage.page_text_color || "#563746";

  document.body.style.fontFamily =
    currentPage.page_font_family || "Arial, sans-serif";

  document.body.style.fontSize =
    currentPage.page_font_size || "16px";

  // ========================================
  // KOTAK HALAMAN
  // ========================================

  const pageCard = document.querySelector("main");

  if (pageCard) {
    pageCard.style.backgroundColor =
      currentPage.page_box_color || "#FFFFFF";

    pageCard.style.color =
      currentPage.page_text_color || "#563746";

    pageCard.style.fontFamily =
      currentPage.page_font_family || "Arial, sans-serif";

    pageCard.style.fontSize =
      currentPage.page_font_size || "16px";

    pageCard.style.marginLeft = "auto";
    pageCard.style.marginRight = "auto";

    if (currentPage.page_box_position === "left") {
      pageCard.style.marginLeft = "0";
      pageCard.style.marginRight = "auto";
    }

    if (currentPage.page_box_position === "right") {
      pageCard.style.marginLeft = "auto";
      pageCard.style.marginRight = "0";
    }
  }

  // ========================================
  // STIKER
  // ========================================

  const stickers = Array.isArray(currentPage.page_stickers)
    ? currentPage.page_stickers
    : [];

  let stickerContainer =
    document.getElementById("publicStickers");

  if (!stickerContainer) {
    stickerContainer = document.createElement("div");
    stickerContainer.id = "publicStickers";

    if (qnaTitle.parentElement) {
      qnaTitle.parentElement.insertBefore(
        stickerContainer,
        qnaTitle
      );
    }
  }

  stickerContainer.replaceChildren();

  const position =
    currentPage.page_sticker_position || "center";

  stickerContainer.style.display = "flex";
  stickerContainer.style.flexWrap = "wrap";
  stickerContainer.style.alignItems = "center";
  stickerContainer.style.gap = "12px";
  stickerContainer.style.margin = "15px 0";

  stickerContainer.style.justifyContent =
    position === "left"
      ? "flex-start"
      : position === "right"
        ? "flex-end"
        : "center";

  const allowedSizes = [
    "20px",
    "30px",
    "42px",
    "55px"
  ];

  const requestedSize =
    currentPage.page_sticker_size || "30px";

  const stickerSize = allowedSizes.includes(requestedSize)
    ? requestedSize
    : "30px";

  stickers.forEach((sticker) => {
    if (typeof sticker !== "string" || sticker.length > 12) {
      return;
    }

    const stickerElement = document.createElement("span");

    stickerElement.textContent = sticker;
    stickerElement.style.fontSize = stickerSize;
    stickerElement.style.lineHeight = "1.3";

    stickerContainer.appendChild(stickerElement);
  });

  // ========================================
  // MODE PENGIRIMAN
  // ========================================

  if (!currentPage.allow_anonymous) {
    anonymousMode.checked = false;
    anonymousMode.disabled = true;
  } else {
    anonymousMode.checked = true;
    anonymousMode.disabled = false;
  }

  if (
    !currentPage.allow_anonymous &&
    !currentPage.allow_identified
  ) {
    qnaMessage.textContent =
      "Halaman ini sedang tidak menerima pertanyaan.";
    return;
  }

  publicQnaForm.hidden = false;
}

// ========================================
// MENGIRIM PERTANYAAN
// ========================================

publicQnaForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!currentPage) return;

  const name = senderName.value.trim();
  const question = questionText.value.trim();
  const isAnonymous = anonymousMode.checked;

  if (!name || !question) {
    qnaMessage.textContent =
      "Nama dan pertanyaan wajib diisi.";
    return;
  }

  if (isAnonymous && !currentPage.allow_anonymous) {
    qnaMessage.textContent =
      "Mode anonim tidak tersedia.";
    return;
  }

  if (!isAnonymous && !currentPage.allow_identified) {
    qnaMessage.textContent =
      "Mode nama terlihat tidak tersedia.";
    return;
  }

  sendButton.disabled = true;
  qnaMessage.textContent = "Mengirim pertanyaan...";

  try {
    const { error } = await supabaseClient.rpc(
      "submit_qna_question",
      {
        p_slug: slug,
        p_sender_name: name,
        p_question_text: question,
        p_is_anonymous: isAnonymous
      }
    );

    if (error) throw error;

    qnaMessage.textContent =
      "Pertanyaan berhasil dikirim!";

    senderName.value = "";
    questionText.value = "";

  } catch (error) {
    console.error(error);

    qnaMessage.textContent =
      error.message || "Gagal mengirim pertanyaan.";

  } finally {
    sendButton.disabled = false;
  }
});

// ========================================
// JALANKAN
// ========================================

loadQnaPage();
