
/* ========================================
   SORA - PUBLIC Q&A PAGE
======================================== */

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
// MENERAPKAN TEMA Q&A
// ========================================

function applyPublicTheme(page) {
  const backgroundColor =
    page.page_background_color || "#FFF5F9";

  const boxColor =
    page.page_box_color || "#FFFFFF";

  const textColor =
    page.page_text_color || "#563746";

  const fontFamily =
    page.page_font_family || "Arial, sans-serif";

  const fontSize =
    page.page_font_size || "16px";

  // BACKGROUND HALAMAN

  document.body.style.backgroundColor = backgroundColor;

  document.body.style.color = textColor;

  document.body.style.fontFamily = fontFamily;

  document.body.style.fontSize = fontSize;

  // BACKGROUND IMAGE

  if (page.page_background_image_url) {
    document.body.style.backgroundImage =
      `url("${page.page_background_image_url}")`;

    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.backgroundRepeat = "no-repeat";
  } else {
    document.body.style.backgroundImage = "none";
  }

  // KOTAK UTAMA

  const pageCard = document.querySelector("main");

  if (pageCard) {
    pageCard.style.backgroundColor = boxColor;
    pageCard.style.color = textColor;
    pageCard.style.fontFamily = fontFamily;
    pageCard.style.fontSize = fontSize;

    pageCard.style.marginLeft = "auto";
    pageCard.style.marginRight = "auto";

    if (page.page_box_position === "left") {
      pageCard.style.marginLeft = "0";
      pageCard.style.marginRight = "auto";
    }

    if (page.page_box_position === "right") {
      pageCard.style.marginLeft = "auto";
      pageCard.style.marginRight = "0";
    }
  }

  // ========================================
  // CSS TEMA PRIORITAS TINGGI
  // ========================================

  let themeStyle = document.getElementById(
    "soraPublicTheme"
  );

  if (!themeStyle) {
    themeStyle = document.createElement("style");
    themeStyle.id = "soraPublicTheme";
    document.head.appendChild(themeStyle);
  }

  themeStyle.textContent = `
    body {
      background-color: ${backgroundColor} !important;
      color: ${textColor} !important;
      font-family: ${fontFamily} !important;
      font-size: ${fontSize} !important;
    }

    main {
      background-color: ${boxColor} !important;
      color: ${textColor} !important;
      font-family: ${fontFamily} !important;
      font-size: ${fontSize} !important;
    }

    main,
    main * {
      font-family: ${fontFamily} !important;
    }

    main h1,
    main h2,
    main h3,
    main h4,
    main h5,
    main h6,
    main p,
    main span,
    main label,
    main div {
      color: ${textColor} !important;
    }

    main input,
    main textarea,
    main select {
      background-color: ${boxColor} !important;
      color: ${textColor} !important;
      border-color: ${textColor} !important;
      font-family: ${fontFamily} !important;
      font-size: ${fontSize} !important;
    }

    main input::placeholder,
    main textarea::placeholder {
      color: ${textColor} !important;
      opacity: 0.65 !important;
    }

    main button {
      background-color: ${textColor} !important;
      color: ${boxColor} !important;
      border-color: ${textColor} !important;
      font-family: ${fontFamily} !important;
    }

    main button:hover {
      opacity: 0.85;
    }

    main a {
      color: ${textColor} !important;
    }
  `;

  console.log("Tema publik diterapkan:", {
    backgroundColor,
    boxColor,
    textColor,
    fontFamily,
    fontSize
  });
}

// ========================================
// MEMUAT HALAMAN Q&A
// ========================================

async function loadQnaPage() {
  if (!slug) {
    qnaMessage.textContent = "Link Q&A tidak valid.";
    return;
  }

  try {
    const { data, error } = await supabaseClient.rpc(
      "get_public_qna_page",
      {
        p_slug: slug
      }
    );

    if (error) throw error;

    if (!data || data.length === 0) {
      qnaMessage.textContent =
        "Halaman Q&A tidak ditemukan.";
      return;
    }

    currentPage = data[0];

    // CATAT KUNJUNGAN

    recordVisit();

    // INFORMASI HALAMAN

    qnaTitle.textContent = currentPage.page_title;

    qnaDescription.textContent =
      currentPage.page_description || "";

    ownerAvatar.textContent =
      currentPage.owner_display_name
        ?.charAt(0)
        .toUpperCase() || "S";

    // TERAPKAN TEMA

    applyPublicTheme(currentPage);

    // ========================================
    // STIKER
    // ========================================

    const stickers = Array.isArray(
      currentPage.page_stickers
    )
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

    const stickerSize = allowedSizes.includes(
      requestedSize
    )
      ? requestedSize
      : "30px";

    stickers.forEach((sticker) => {
      if (
        typeof sticker !== "string" ||
        sticker.length > 12
      ) {
        return;
      }

      const stickerElement =
        document.createElement("span");

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

  } catch (error) {
    console.error("Gagal memuat Q&A:", error);

    qnaMessage.textContent =
      "Gagal memuat halaman Q&A.";
  }
}

// ========================================
// MENGIRIM PERTANYAAN
// ========================================

publicQnaForm.addEventListener(
  "submit",
  async (event) => {
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

    if (
      isAnonymous &&
      !currentPage.allow_anonymous
    ) {
      qnaMessage.textContent =
        "Mode anonim tidak tersedia.";

      return;
    }

    if (
      !isAnonymous &&
      !currentPage.allow_identified
    ) {
      qnaMessage.textContent =
        "Mode nama terlihat tidak tersedia.";

      return;
    }

    sendButton.disabled = true;

    qnaMessage.textContent =
      "Mengirim pertanyaan...";

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
        error.message ||
        "Gagal mengirim pertanyaan.";

    } finally {
      sendButton.disabled = false;
    }
  }
);

// ========================================
// JALANKAN
// ========================================

loadQnaPage();
