
const cardTheme = document.getElementById("cardTheme");
const cardColor = document.getElementById("cardColor");
const cardTextColor = document.getElementById("cardTextColor");
const cardFont = document.getElementById("cardFont");
const cardStyle = document.getElementById("cardStyle");
const cardSize = document.getElementById("cardSize");
const showOwner = document.getElementById("showOwner");

const cardShadow = document.getElementById("cardShadow");
const cardBorder = document.getElementById("cardBorder");
const cardGlow = document.getElementById("cardGlow");
const cardDecoration = document.getElementById("cardDecoration");

const cardWatermark = document.getElementById("cardWatermark");
const cardWatermarkPosition = document.getElementById("cardWatermarkPosition");
const cardWatermarkSize = document.getElementById("cardWatermarkSize");
const cardWatermarkTheme = document.getElementById("cardWatermarkTheme");

const cardLogo = document.getElementById("cardLogo");
const cardLogoPosition = document.getElementById("cardLogoPosition");
const cardLogoSize = document.getElementById("cardLogoSize");

const answerPreview = document.getElementById("answerPreview");
const previewOwner = document.getElementById("previewOwner");
const previewQuestion = answerPreview.querySelector(".preview-question");
const previewAnswer = answerPreview.querySelector(".preview-answer");
const previewDecoration = document.getElementById("previewDecoration");
const previewWatermark = document.getElementById("previewWatermark");
const previewLogo = document.getElementById("previewLogo");

const saveButton = document.getElementById("saveAnswerSettings");
const answerMessage = document.getElementById("answerMessage");

let currentPageId = null;

const themes = {
  pink: {
    name: "Pink Rose",
    background: "#FFFFFF",
    text: "#563746",
    question: "#FCE4ED",
    answer: "#FFFFFF"
  },
  dark: {
    name: "Dark Mode",
    background: "#202124",
    text: "#FFFFFF",
    question: "#35383D",
    answer: "#292B30"
  },
  midnight: {
    name: "Midnight Blue",
    background: "#101B35",
    text: "#EAF1FF",
    question: "#20345B",
    answer: "#182743"
  },
  neon: {
    name: "Neon Gaming",
    background: "#15151F",
    text: "#B8FFEA",
    question: "#29213F",
    answer: "#202A35"
  },
  minimal: {
    name: "Minimalist",
    background: "#F5F5F5",
    text: "#333333",
    question: "#E8E8E8",
    answer: "#FFFFFF"
  },
  nature: {
    name: "Nature Green",
    background: "#EAF4E8",
    text: "#24452C",
    question: "#D0E7CF",
    answer: "#F7FFF5"
  }
};

const decorations = {
  none: "",
  star: "⭐",
  heart: "❤️",
  sparkle: "✨"
};

const watermarkThemes = {
  classic: {
    className: "theme-classic",
    text: "SORA. - Your space, your story."
  },
  elegant: {
    className: "theme-elegant",
    text: "SORA. - Your space, your story."
  },
  neon: {
    className: "theme-neon",
    text: "SORA. - Your space, your story."
  },
  minimal: {
    className: "theme-minimal",
    text: "SORA."
  }
};

function showMessage(message, success = false) {
  answerMessage.textContent = message;
  answerMessage.style.color = success ? "green" : "#c0392b";
}

function applyTheme(themeName) {
  const theme = themes[themeName] || themes.pink;

  cardColor.value = theme.background;
  cardTextColor.value = theme.text;

  updatePreview();
}

function updateWatermarkTheme() {
  const selectedTheme =
    watermarkThemes[cardWatermarkTheme.value] ||
    watermarkThemes.classic;

  previewWatermark.classList.remove(
    "theme-classic",
    "theme-elegant",
    "theme-neon",
    "theme-minimal"
  );

  previewWatermark.classList.add(selectedTheme.className);
  previewWatermark.textContent = selectedTheme.text;
}

/* ==========================================
   LOGO SORA ASLI
   ========================================== */

function updateLogoPreview() {
  // Tampilkan atau sembunyikan logo
  previewLogo.hidden = !cardLogo.checked;

  // Reset class ukuran dan posisi
  previewLogo.classList.remove(
    "logo-small",
    "logo-medium",
    "logo-large",
    "logo-top",
    "logo-bottom"
  );

  // Terapkan ukuran logo
  previewLogo.classList.add(
    "logo-" + cardLogoSize.value
  );

  // Terapkan posisi logo
  previewLogo.classList.add(
    "logo-" + cardLogoPosition.value
  );

  // Urutan posisi dalam preview flex
  if (cardLogoPosition.value === "top") {
    previewLogo.style.order = "0";
  } else {
    previewLogo.style.order = "5";
  }

  // Pastikan gambar menggunakan logo asli
  previewLogo.src = "assets/logo-sora.png";

  previewLogo.alt = "Logo SORA Anonymous Q&A";

  previewLogo.style.objectFit = "contain";
}

/* ==========================================
   PREVIEW KARTU
   ========================================== */

function updatePreview() {
  const theme = themes[cardTheme.value] || themes.pink;

  answerPreview.style.backgroundColor = cardColor.value;
  answerPreview.style.color = cardTextColor.value;
  answerPreview.style.fontFamily = cardFont.value;

  previewQuestion.style.backgroundColor = theme.question;
  previewQuestion.style.color = cardTextColor.value;

  previewAnswer.style.backgroundColor = theme.answer;
  previewAnswer.style.color = cardTextColor.value;

  // Bentuk kartu
  if (cardStyle.value === "square") {
    answerPreview.style.borderRadius = "0";
  } else if (cardStyle.value === "soft") {
    answerPreview.style.borderRadius = "28px";
  } else {
    answerPreview.style.borderRadius = "16px";
  }

  // Ukuran kartu
  if (cardSize.value === "square") {
    answerPreview.style.aspectRatio = "1 / 1";
    answerPreview.style.maxWidth = "360px";
  } else if (cardSize.value === "landscape") {
    answerPreview.style.aspectRatio = "16 / 9";
    answerPreview.style.maxWidth = "500px";
  } else {
    answerPreview.style.aspectRatio = "9 / 16";
    answerPreview.style.maxWidth = "360px";
  }

  // Bayangan
  const shadows = {
    none: "none",
    light: "0 3px 10px rgba(0,0,0,0.10)",
    medium: "0 8px 22px rgba(0,0,0,0.18)",
    heavy: "0 12px 30px rgba(0,0,0,0.30)"
  };

  answerPreview.style.boxShadow =
    shadows[cardShadow.value] || shadows.medium;

  // Garis tepi
  const borders = {
    none: "none",
    white: "3px solid #FFFFFF",
    black: "3px solid #222222",
    pink: "3px solid #E875A5"
  };

  answerPreview.style.border =
    borders[cardBorder.value] || "none";

  // Glow
  if (cardGlow.checked) {
    answerPreview.style.boxShadow +=
      ", 0 0 22px rgba(232,117,165,0.8)";
  }

  // Dekorasi
  previewDecoration.textContent =
    decorations[cardDecoration.value] || "";

  // Nama pemilik
  previewOwner.hidden = !showOwner.checked;

  // Watermark
  previewWatermark.hidden = !cardWatermark.checked;

  const watermarkSizes = {
    small: "9px",
    medium: "12px",
    large: "17px"
  };

  previewWatermark.style.fontSize =
    watermarkSizes[cardWatermarkSize.value] || "12px";

  // Urutan elemen
  previewDecoration.style.order = "1";
  previewOwner.style.order = "2";
  previewQuestion.style.order = "3";
  previewAnswer.style.order = "4";

  // Posisi watermark
  const watermarkPositions = {
    top: "0",
    center: "3",
    bottom: "6"
  };

  previewWatermark.style.order =
    watermarkPositions[cardWatermarkPosition.value] || "6";

  // Tema watermark
  updateWatermarkTheme();

  // Logo asli SORA
  updateLogoPreview();
}

/* ==========================================
   MEMUAT PENGATURAN
   ========================================== */

async function loadAnswerSettings() {
  try {
    showMessage("Memuat pengaturan...", true);

    const {
      data: { user },
      error: authError
    } = await supabaseClient.auth.getUser();

    if (authError) throw authError;

    if (!user) {
      window.location.href = "login.html";
      return;
    }

    const {
      data: profile,
      error: profileError
    } = await supabaseClient
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    previewOwner.textContent =
      profile?.display_name || "SORA USER";

    const {
      data,
      error
    } = await supabaseClient
      .from("qna_pages")
      .select(`
        id,
        answer_card_theme,
        answer_card_color,
        answer_card_text_color,
        answer_card_font,
        answer_card_style,
        answer_card_show_owner,
        answer_card_size,
        answer_card_shadow,
        answer_card_border,
        answer_card_glow,
        answer_card_decoration,
        answer_card_watermark,
        answer_card_watermark_position,
        answer_card_watermark_size,
        answer_card_watermark_theme,
        answer_card_logo,
        answer_card_logo_position,
        answer_card_logo_size
      `)
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      currentPageId = null;
      saveButton.disabled = true;

      showMessage("Kamu belum membuat halaman Q&A.");
      return;
    }

    currentPageId = data.id;
    saveButton.disabled = false;

    // Tema
    cardTheme.value = themes[data.answer_card_theme]
      ? data.answer_card_theme
      : "pink";

    cardColor.value =
      data.answer_card_color ||
      themes[cardTheme.value].background;

    cardTextColor.value =
      data.answer_card_text_color ||
      themes[cardTheme.value].text;

    // Font dan bentuk
    cardFont.value =
      data.answer_card_font || "Arial, sans-serif";

    cardStyle.value =
      data.answer_card_style || "rounded";

    cardSize.value =
      data.answer_card_size || "story";

    // Efek visual
    cardShadow.value =
      data.answer_card_shadow || "medium";

    cardBorder.value =
      data.answer_card_border || "none";

    cardGlow.checked =
      data.answer_card_glow === true;

    cardDecoration.value =
      decorations[data.answer_card_decoration] !== undefined
        ? data.answer_card_decoration
        : "none";

    // Nama pemilik
    showOwner.checked =
      data.answer_card_show_owner !== false;

    // Watermark
    cardWatermark.checked =
      data.answer_card_watermark !== false;

    cardWatermarkPosition.value =
      data.answer_card_watermark_position || "bottom";

    cardWatermarkSize.value =
      data.answer_card_watermark_size || "medium";

    cardWatermarkTheme.value =
      watermarkThemes[data.answer_card_watermark_theme]
        ? data.answer_card_watermark_theme
        : "classic";

    // Logo
    cardLogo.checked =
      data.answer_card_logo !== false;

    cardLogoPosition.value =
      data.answer_card_logo_position || "top";

    cardLogoSize.value =
      data.answer_card_logo_size || "medium";

    // Perbarui preview
    updatePreview();

    showMessage("Pengaturan berhasil dimuat.", true);

  } catch (error) {
    console.error("Gagal memuat:", error);
    showMessage("Gagal memuat: " + error.message);
  }
}

/* ==========================================
   EVENT TEMA
   ========================================== */

cardTheme.addEventListener("change", () => {
  applyTheme(cardTheme.value);
});

/* ==========================================
   EVENT PREVIEW
   ========================================== */

[
  cardColor,
  cardTextColor,
  cardFont,
  cardStyle,
  cardSize,
  cardShadow,
  cardBorder,
  cardGlow,
  cardDecoration,
  showOwner,
  cardWatermark,
  cardWatermarkPosition,
  cardWatermarkSize,
  cardWatermarkTheme,
  cardLogo,
  cardLogoPosition,
  cardLogoSize
].forEach(element => {
  element.addEventListener("input", updatePreview);
  element.addEventListener("change", updatePreview);
});

/* ==========================================
   SIMPAN PENGATURAN
   ========================================== */

saveButton.addEventListener("click", async () => {
  if (!currentPageId) {
    showMessage("Halaman Q&A belum ditemukan.");
    return;
  }

  saveButton.disabled = true;

  showMessage("Menyimpan pengaturan...", true);

  try {
    const {
      data: { user },
      error: authError
    } = await supabaseClient.auth.getUser();

    if (authError) throw authError;

    if (!user) {
      throw new Error("Silakan login kembali.");
    }

    const {
      data,
      error
    } = await supabaseClient
      .from("qna_pages")
      .update({
        answer_card_theme: cardTheme.value,
        answer_card_color: cardColor.value,
        answer_card_text_color: cardTextColor.value,
        answer_card_font: cardFont.value,
        answer_card_style: cardStyle.value,
        answer_card_show_owner: showOwner.checked,
        answer_card_size: cardSize.value,

        answer_card_shadow: cardShadow.value,
        answer_card_border: cardBorder.value,
        answer_card_glow: cardGlow.checked,
        answer_card_decoration: cardDecoration.value,

        answer_card_watermark: cardWatermark.checked,
        answer_card_watermark_position: cardWatermarkPosition.value,
        answer_card_watermark_size: cardWatermarkSize.value,
        answer_card_watermark_theme: cardWatermarkTheme.value,

        answer_card_logo: cardLogo.checked,
        answer_card_logo_position: cardLogoPosition.value,
        answer_card_logo_size: cardLogoSize.value
      })
      .eq("id", currentPageId)
      .eq("owner_id", user.id)
      .select("id")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      throw new Error(
        "Pengaturan tidak diperbarui. Periksa izin RLS Supabase."
      );
    }

    showMessage("Pengaturan berhasil disimpan!", true);

  } catch (error) {
    console.error("Gagal menyimpan:", error);

    showMessage("Gagal menyimpan: " + error.message);

  } finally {
    saveButton.disabled = false;
  }
});

/* ==========================================
   LOGO GAGAL DIMUAT
   ========================================== */

previewLogo.addEventListener("error", () => {
  console.error(
    "Logo SORA tidak ditemukan. Periksa assets/logo-sora.png"
  );
});

previewLogo.addEventListener("load", () => {
  console.log("Logo SORA berhasil dimuat.");
});

/* ==========================================
   JALANKAN
   ========================================== */

loadAnswerSettings();
