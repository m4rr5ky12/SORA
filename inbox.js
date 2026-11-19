
const inboxList = document.getElementById("inboxList");
const inboxMessage = document.getElementById("inboxMessage");

let ownerName = "SORA USER";

const themes = {
  pink: {
    background: "#FFFFFF",
    text: "#563746",
    question: "#FCE4ED",
    answer: "#FFFFFF"
  },
  dark: {
    background: "#202124",
    text: "#FFFFFF",
    question: "#35383D",
    answer: "#292B30"
  },
  midnight: {
    background: "#101B35",
    text: "#EAF1FF",
    question: "#20345B",
    answer: "#182743"
  },
  neon: {
    background: "#15151F",
    text: "#B8FFEA",
    question: "#29213F",
    answer: "#202A35"
  },
  minimal: {
    background: "#F5F5F5",
    text: "#333333",
    question: "#E8E8E8",
    answer: "#FFFFFF"
  },
  nature: {
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
    text: "SORA. - Your space, your story.",
    font: "Arial, sans-serif",
    weight: "bold",
    style: "normal",
    spacing: "1px",
    opacity: "0.7",
    shadow: "none"
  },
  elegant: {
    text: "SORA. - Your space, your story.",
    font: "Georgia, serif",
    weight: "normal",
    style: "italic",
    spacing: "2px",
    opacity: "0.8",
    shadow: "none"
  },
  neon: {
    text: "SORA. - Your space, your story.",
    font: "Arial, sans-serif",
    weight: "bold",
    style: "normal",
    spacing: "3px",
    opacity: "1",
    shadow: "0 0 5px currentColor, 0 0 12px currentColor"
  },
  minimal: {
    text: "SORA.",
    font: "Arial, sans-serif",
    weight: "normal",
    style: "normal",
    spacing: "1px",
    opacity: "0.45",
    shadow: "none"
  }
};

// ========================================
// PESAN
// ========================================

function showMessage(message, success = false) {
  inboxMessage.textContent = message;
  inboxMessage.style.color = success ? "green" : "#c0392b";
}

// ========================================
// BUTTON
// ========================================

function createButton(text, color) {
  const button = document.createElement("button");

  button.type = "button";
  button.textContent = text;
  button.style.background = color;
  button.style.color = "#fff";
  button.style.border = "none";
  button.style.borderRadius = "9px";
  button.style.padding = "11px 15px";
  button.style.marginTop = "12px";
  button.style.marginRight = "7px";
  button.style.cursor = "pointer";

  return button;
}

// ========================================
// SHARE ANSWER CARD
// ========================================

function createShareButton(question, page, container) {
  if (container.querySelector(".share-answer-card")) return;

  const shareButton = createButton(
    "🖼️ Bagikan Kartu Jawaban",
    "#E875A5"
  );

  shareButton.className = "share-answer-card";

  shareButton.addEventListener("click", async () => {
    if (typeof html2canvas !== "function") {
      showMessage("Fitur pembuat gambar belum tersedia.");
      return;
    }

    shareButton.disabled = true;
    shareButton.textContent = "Menyiapkan kartu...";

    let card = null;

    try {
      const selectedSize = page.answer_card_size || "story";
      const theme = themes[page.answer_card_theme] || themes.pink;

      const dimensions = {
        story: { width: 360, height: 640 },
        square: { width: 600, height: 600 },
        landscape: { width: 640, height: 360 }
      };

      const size = dimensions[selectedSize] || dimensions.story;

      const backgroundColor =
        page.answer_card_color || theme.background;

      const textColor =
        page.answer_card_text_color || theme.text;

      const shadows = {
        none: "none",
        light: "0 3px 10px rgba(0,0,0,0.10)",
        medium: "0 8px 22px rgba(0,0,0,0.18)",
        heavy: "0 12px 30px rgba(0,0,0,0.30)"
      };

      const borders = {
        none: "none",
        white: "3px solid #FFFFFF",
        black: "3px solid #222222",
        pink: "3px solid #E875A5"
      };

      const shadow =
        shadows[page.answer_card_shadow] || shadows.medium;

      const border =
        borders[page.answer_card_border] || "none";

      const glow = page.answer_card_glow === true
        ? ", 0 0 22px rgba(232,117,165,0.8)"
        : "";

      const decoration =
        decorations[page.answer_card_decoration] || "";

      card = document.createElement("div");

      Object.assign(card.style, {
        position: "fixed",
        left: "-10000px",
        top: "0",
        width: size.width + "px",
        height: size.height + "px",
        padding: selectedSize === "landscape"
          ? "25px 35px"
          : "35px",
        boxSizing: "border-box",
        background: backgroundColor,
        color: textColor,
        fontFamily: page.answer_card_font || "Arial, sans-serif",
        borderRadius:
          page.answer_card_style === "square"
            ? "0"
            : page.answer_card_style === "soft"
              ? "28px"
              : "16px",
        border: border,
        boxShadow: shadow + glow,
        textAlign: "center",
        overflow: "hidden",
        overflowWrap: "anywhere",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "stretch"
      });

      // Dekorasi kartu
      if (decoration) {
        const decorationElement = document.createElement("div");

        decorationElement.textContent = decoration;

        Object.assign(decorationElement.style, {
          fontSize: "30px",
          marginBottom: "15px",
          flexShrink: "0"
        });

        card.appendChild(decorationElement);
      }

      // LOGO SORA
      let logoElement = null;

      if (page.answer_card_logo !== false) {
        logoElement = document.createElement("img");

        logoElement.src = "assets/logo-sora.png";
        logoElement.alt = "Logo SORA";
        logoElement.crossOrigin = "anonymous";

        const logoSizes = {
          small: "75px",
          medium: "110px",
          large: "150px"
        };

        const logoWidth =
          logoSizes[page.answer_card_logo_size] || "110px";

        Object.assign(logoElement.style, {
          width: logoWidth,
          height: "auto",
          maxHeight: selectedSize === "landscape" ? "75px" : "110px",
          objectFit: "contain",
          display: "block",
          margin: "0 auto 15px",
          flexShrink: "0"
        });

        logoElement.onerror = () => {
          console.error(
            "Logo SORA gagal dimuat:",
            logoElement.src
          );

          logoElement.style.display = "none";
        };

        try {
          await logoElement.decode();
        } catch (error) {
          console.error("Logo gagal dimuat:", error);
          logoElement.style.display = "none";
        }
      }

      // Posisi logo atas
      if (
        logoElement &&
        page.answer_card_logo_position !== "bottom"
      ) {
        card.appendChild(logoElement);
      }

      // Nama pemilik Q&A
      if (page.answer_card_show_owner !== false) {
        const owner = document.createElement("h2");

        owner.textContent = ownerName;

        Object.assign(owner.style, {
          fontSize: selectedSize === "landscape" ? "22px" : "27px",
          margin: "0 0 18px",
          flexShrink: "0"
        });

        card.appendChild(owner);
      }

      // Kotak pertanyaan
      const questionBox = document.createElement("div");

      Object.assign(questionBox.style, {
        background: theme.question,
        color: textColor,
        padding: selectedSize === "landscape" ? "12px" : "18px",
        borderRadius: "13px",
        marginBottom: "14px",
        flexShrink: "0"
      });

      const questionLabel = document.createElement("p");

      questionLabel.textContent = "PERTANYAAN";

      Object.assign(questionLabel.style, {
        fontSize: "12px",
        fontWeight: "bold",
        margin: "0 0 8px"
      });

      const questionText = document.createElement("h3");

      questionText.textContent = question.question_text;

      Object.assign(questionText.style, {
        fontSize: selectedSize === "landscape" ? "17px" : "20px",
        fontWeight: "normal",
        margin: "0"
      });

      questionBox.append(questionLabel, questionText);

      // Kotak jawaban
      const answerBox = document.createElement("div");

      Object.assign(answerBox.style, {
        background: theme.answer,
        color: textColor,
        padding: selectedSize === "landscape" ? "12px" : "18px",
        borderRadius: "13px",
        flexShrink: "0"
      });

      const answerLabel = document.createElement("p");

      answerLabel.textContent = "JAWABAN";

      Object.assign(answerLabel.style, {
        fontSize: "12px",
        fontWeight: "bold",
        margin: "0 0 8px"
      });

      const answerText = document.createElement("h3");

      answerText.textContent = question.answer_text || "";

      Object.assign(answerText.style, {
        fontSize: selectedSize === "landscape" ? "17px" : "20px",
        fontWeight: "normal",
        margin: "0"
      });

      answerBox.append(answerLabel, answerText);

      // Watermark
      let watermark = null;

      if (page.answer_card_watermark !== false) {
        watermark = document.createElement("div");

        const selectedWatermarkTheme =
          watermarkThemes[page.answer_card_watermark_theme] ||
          watermarkThemes.classic;

        const watermarkSizes = {
          small: "9px",
          medium: "12px",
          large: "17px"
        };

        watermark.textContent = selectedWatermarkTheme.text;

        Object.assign(watermark.style, {
          fontSize:
            watermarkSizes[page.answer_card_watermark_size] || "12px",
          fontFamily: selectedWatermarkTheme.font,
          fontWeight: selectedWatermarkTheme.weight,
          fontStyle: selectedWatermarkTheme.style,
          letterSpacing: selectedWatermarkTheme.spacing,
          opacity: selectedWatermarkTheme.opacity,
          textShadow: selectedWatermarkTheme.shadow,
          color: textColor,
          textAlign: "center",
          marginTop: "15px",
          marginBottom: "15px",
          flexShrink: "0"
        });
      }

      // Susunan watermark
      const watermarkPosition =
        page.answer_card_watermark_position || "bottom";

      if (watermark && watermarkPosition === "top") {
        card.append(watermark, questionBox, answerBox);
      } else if (watermark && watermarkPosition === "center") {
        card.append(questionBox, watermark, answerBox);
      } else {
        card.append(questionBox, answerBox);

        if (watermark) {
          card.appendChild(watermark);
        }
      }

      // Posisi logo bawah
      if (
        logoElement &&
        page.answer_card_logo_position === "bottom"
      ) {
        logoElement.style.marginTop = "15px";
        logoElement.style.marginBottom = "0";
        card.appendChild(logoElement);
      }

      document.body.appendChild(card);

      const canvas = await html2canvas(card, {
        scale: 2,
        backgroundColor,
        useCORS: true,
        allowTaint: false
      });

      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, "image/png");
      });

      if (!blob) {
        throw new Error("Gagal membuat gambar kartu.");
      }

      const file = new File(
        [blob],
        "SORA-Kartu-Jawaban.png",
        { type: "image/png" }
      );

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: "Kartu Jawaban SORA",
          text: "Jawaban dari SORA."
        });

        showMessage("Menu berbagi berhasil dibuka!", true);

      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "SORA-Kartu-Jawaban.png";
        link.click();

        setTimeout(() => URL.revokeObjectURL(url), 1000);

        showMessage("Kartu berhasil diunduh!", true);
      }

    } catch (error) {
      if (error.name === "AbortError") {
        showMessage("Berbagi kartu dibatalkan.");
      } else {
        console.error(error);
        showMessage("Gagal membuat kartu: " + error.message);
      }
    } finally {
      if (card) card.remove();

      shareButton.disabled = false;
      shareButton.textContent = "🖼️ Bagikan Kartu Jawaban";
    }
  });

  container.appendChild(shareButton);
}

// ========================================
// LOAD INBOX
// ========================================

async function loadInbox() {
  inboxList.textContent = "Memuat pertanyaan...";

  try {
    // Gunakan koneksi global SORA
    const db = window.soraSupabaseClient;

    if (!db || typeof db.from !== "function") {
      throw new Error(
        "Koneksi Supabase SORA tidak ditemukan. Periksa supabase.js."
      );
    }

    const {
      data: { user },
      error: authError
    } = await db.auth.getUser();

    if (authError) throw authError;

    if (!user) {
      window.location.href = "login.html";
      return;
    }

    // Ambil profil
    const {
      data: profile,
      error: profileError
    } = await db
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    ownerName = profile?.display_name || "SORA USER";

    // Ambil halaman Q&A
    const {
      data: pages,
      error: pageError
    } = await db
      .from("qna_pages")
      .select(`
        id,
        title,
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
      .eq("owner_id", user.id);

    if (pageError) throw pageError;

    if (!pages || pages.length === 0) {
      inboxList.textContent = "Kamu belum memiliki halaman Q&A.";
      return;
    }

    const pageIds = pages.map(page => page.id);

    // Ambil pertanyaan
    const {
      data: questions,
      error: questionError
    } = await db
      .from("qna_questions")
      .select("*")
      .in("qna_page_id", pageIds)
      .order("created_at", { ascending: false });

    if (questionError) throw questionError;

    inboxList.replaceChildren();

    if (!questions || questions.length === 0) {
      inboxList.textContent = "Belum ada pertanyaan masuk.";
      return;
    }

    // Render pertanyaan
    questions.forEach(question => {
      const page = pages.find(
        item => item.id === question.qna_page_id
      );

      const card = document.createElement("article");

      Object.assign(card.style, {
        background: "#FFFFFF",
        padding: "20px",
        marginBottom: "18px",
        borderRadius: "15px",
        border: "1px solid #F1D8E3"
      });

      const pageName = document.createElement("strong");

      pageName.textContent = page?.title || "Halaman Q&A";

      const sender = document.createElement("p");

      sender.textContent = question.is_anonymous
        ? "Pengirim: Anonim"
        : "Pengirim: " + (question.sender_name || "Tanpa nama");

      const questionText = document.createElement("p");

      questionText.textContent = question.question_text;

      const date = document.createElement("small");

      date.textContent = new Date(
        question.created_at
      ).toLocaleString("id-ID");

      const answerLabel = document.createElement("label");

      answerLabel.textContent = "Jawaban kamu:";

      Object.assign(answerLabel.style, {
        display: "block",
        marginTop: "15px",
        fontWeight: "bold"
      });

      const answerInput = document.createElement("textarea");

      answerInput.value = question.answer_text || "";
      answerInput.placeholder = "Tulis jawaban di sini...";
      answerInput.rows = 4;

      Object.assign(answerInput.style, {
        width: "100%",
        padding: "12px",
        marginTop: "8px",
        borderRadius: "10px",
        border: "1px solid #E8C6D5",
        boxSizing: "border-box"
      });

      // Simpan jawaban
      const saveButton = createButton(
        "Simpan Jawaban",
        "#E875A5"
      );

      saveButton.addEventListener("click", async () => {
        const answer = answerInput.value.trim();

        if (!answer) {
          showMessage("Jawaban tidak boleh kosong.");
          return;
        }

        saveButton.disabled = true;
        saveButton.textContent = "Menyimpan...";

        try {
          const {
            data,
            error
          } = await db
            .from("qna_questions")
            .update({
              answer_text: answer,
              answered_at: new Date().toISOString()
            })
            .eq("id", question.id)
            .select("id")
            .maybeSingle();

          if (error) throw error;

          if (!data) {
            throw new Error("Jawaban tidak berhasil diperbarui.");
          }

          question.answer_text = answer;

          createShareButton(question, page, card);

          showMessage("Jawaban berhasil disimpan!", true);

        } catch (error) {
          console.error(error);
          showMessage("Gagal menyimpan: " + error.message);

        } finally {
          saveButton.disabled = false;
          saveButton.textContent = "Simpan Jawaban";
        }
      });

      // Hapus pertanyaan
      const deleteButton = createButton(
        "Hapus Pertanyaan",
        "#D9534F"
      );

      deleteButton.addEventListener("click", async () => {
        if (!confirm("Yakin ingin menghapus pertanyaan ini?")) {
          return;
        }

        deleteButton.disabled = true;

        try {
          const { error } = await db
            .from("qna_questions")
            .delete()
            .eq("id", question.id);

          if (error) throw error;

          card.remove();

          if (!inboxList.querySelector("article")) {
            inboxList.textContent = "Belum ada pertanyaan masuk.";
          }

          showMessage("Pertanyaan berhasil dihapus.", true);

        } catch (error) {
          console.error(error);
          showMessage("Gagal menghapus: " + error.message);
          deleteButton.disabled = false;
        }
      });

      card.append(
        pageName,
        sender,
        questionText,
        date,
        answerLabel,
        answerInput,
        saveButton,
        deleteButton
      );

      // Tombol berbagi jika sudah dijawab
      if (question.answer_text && page) {
        createShareButton(question, page, card);
      }

      inboxList.appendChild(card);
    });

    showMessage("Pertanyaan berhasil dimuat.", true);

  } catch (error) {
    console.error("SORA Inbox Error:", error);
    inboxList.textContent = "Gagal memuat pertanyaan.";
    showMessage(error.message);
  }
}

// ========================================
// MULAI
// ========================================

loadInbox();
