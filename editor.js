
const editorForm = document.getElementById("editorForm");
const pageSelect = document.getElementById("pageSelect");
const pageTitle = document.getElementById("pageTitle");
const pageDescription = document.getElementById("pageDescription");
const anonymousEnabled = document.getElementById("anonymousEnabled");
const identifiedEnabled = document.getElementById("identifiedEnabled");

const themeName = document.getElementById("themeName");
const backgroundColor = document.getElementById("backgroundColor");
const backgroundImage = document.getElementById("backgroundImage");
const removeBackgroundImage = document.getElementById("removeBackgroundImage");
const backgroundImagePreview = document.getElementById("backgroundImagePreview");

const boxColor = document.getElementById("boxColor");
const textColor = document.getElementById("textColor");
const fontFamily = document.getElementById("fontFamily");
const fontSize = document.getElementById("fontSize");
const boxPosition = document.getElementById("boxPosition");

const stickerPosition = document.getElementById("stickerPosition");
const stickerSize = document.getElementById("stickerSize");

const editorMessage = document.getElementById("editorMessage");
const designPreview = document.getElementById("designPreview");
const previewCard = document.getElementById("previewCard");
const previewTitle = document.getElementById("previewTitle");
const previewDescription = document.getElementById("previewDescription");

const stickerPreview = document.getElementById("stickerPreview");
const clearStickers = document.getElementById("clearStickers");

let currentUser = null;
let currentPages = [];
let currentBackgroundUrl = null;
let removeCurrentBackground = false;
let selectedImageFile = null;
let temporaryImageUrl = null;
let selectedStickers = [];

async function initializeEditor() {
  const { data: { user }, error } = await supabaseClient.auth.getUser();

  if (error || !user) {
    window.location.href = "login.html";
    return;
  }

  currentUser = user;
  await loadPages();
}

async function loadPages() {
  const { data, error } = await supabaseClient
    .from("qna_pages")
    .select("*")
    .eq("owner_id", currentUser.id)
    .order("created_at", { ascending: false });

  if (error) {
    editorMessage.textContent = "Gagal memuat halaman Q&A.";
    console.error(error);
    return;
  }

  currentPages = data || [];
  pageSelect.innerHTML = "";

  if (currentPages.length === 0) {
    editorMessage.textContent = "Kamu belum memiliki halaman Q&A.";
    return;
  }

  currentPages.forEach((page) => {
    const option = document.createElement("option");
    option.value = page.id;
    option.textContent = page.title;
    pageSelect.appendChild(option);
  });

  loadSelectedPage();
}

function loadSelectedPage() {
  const page = currentPages.find(
    item => item.id === pageSelect.value
  );

  if (!page) return;

  pageTitle.value = page.title || "";
  pageDescription.value = page.description || "";

  anonymousEnabled.checked = page.anonymous_enabled;
  identifiedEnabled.checked = page.identified_enabled;

  themeName.value = page.theme_name || "Pink Rose Premium";
  backgroundColor.value = page.background_color || "#FFF5F9";
  boxColor.value = page.box_color || "#FFFFFF";
  textColor.value = page.text_color || "#563746";

  fontFamily.value = page.font_family || "Arial, sans-serif";
  fontSize.value = page.font_size || "16px";
  boxPosition.value = page.box_position || "center";

  stickerPosition.value = page.sticker_position || "center";
  stickerSize.value = page.sticker_size || "30px";

  currentBackgroundUrl = page.background_image_url || null;
  removeCurrentBackground = false;
  selectedImageFile = null;
  backgroundImage.value = "";

  selectedStickers = Array.isArray(page.stickers)
    ? [...page.stickers]
    : [];

  if (temporaryImageUrl) {
    URL.revokeObjectURL(temporaryImageUrl);
    temporaryImageUrl = null;
  }

  updateStickerButtons();
  showBackgroundPreview(currentBackgroundUrl);
  renderStickers();
  updatePreview();
}

function updateStickerButtons() {
  document.querySelectorAll(".sticker-option").forEach(button => {
    const sticker = button.textContent.trim();
    button.classList.toggle(
      "selected",
      selectedStickers.includes(sticker)
    );
  });
}

function showBackgroundPreview(url) {
  if (url) {
    backgroundImagePreview.style.backgroundImage =
      `url("${url}")`;
    backgroundImagePreview.style.backgroundSize = "cover";
    backgroundImagePreview.style.backgroundPosition = "center";
    backgroundImagePreview.style.minHeight = "130px";
    backgroundImagePreview.textContent = "Pratinjau gambar background";
    backgroundImagePreview.style.color = "#563746";
  } else {
    backgroundImagePreview.style.backgroundImage = "none";
    backgroundImagePreview.style.minHeight = "auto";
    backgroundImagePreview.textContent = "Belum ada gambar background";
  }
}

function renderStickers() {
  stickerPreview.replaceChildren();

  if (selectedStickers.length === 0) {
    stickerPreview.textContent = "Belum ada stiker dipilih";
    return;
  }

  selectedStickers.forEach((sticker) => {
    const item = document.createElement("span");
    item.textContent = sticker;
    item.title = "Klik untuk menghapus stiker ini";

    item.style.fontSize = stickerSize.value;
    item.addEventListener("click", () => {
      selectedStickers = selectedStickers.filter(
        selected => selected !== sticker
      );

      updateStickerButtons();
      renderStickers();
      updatePreview();
    });

    stickerPreview.appendChild(item);
  });
}

function updatePreview() {
  previewTitle.textContent = pageTitle.value || "Kirim Pertanyaan";
  previewDescription.textContent =
    pageDescription.value || "Kirim pertanyaan atau ceritamu di sini.";

  designPreview.style.backgroundColor = backgroundColor.value;
  designPreview.style.color = textColor.value;

  const imageUrl = selectedImageFile
    ? temporaryImageUrl
    : (removeCurrentBackground ? null : currentBackgroundUrl);

  designPreview.style.backgroundImage = imageUrl
    ? `url("${imageUrl}")`
    : "none";

  designPreview.style.backgroundSize = "cover";
  designPreview.style.backgroundPosition = "center";

  previewCard.style.backgroundColor = boxColor.value;
  previewCard.style.color = textColor.value;
  previewCard.style.fontFamily = fontFamily.value;
  previewCard.style.fontSize = fontSize.value;

  previewCard.style.marginLeft = "auto";
  previewCard.style.marginRight = "auto";

  if (boxPosition.value === "left") {
    previewCard.style.marginLeft = "0";
    previewCard.style.marginRight = "auto";
  } else if (boxPosition.value === "right") {
    previewCard.style.marginLeft = "auto";
    previewCard.style.marginRight = "0";
  }

  const stickerDisplay = document.getElementById("previewStickers");

  if (stickerDisplay) {
    stickerDisplay.replaceChildren();

    stickerDisplay.style.justifyContent =
      stickerPosition.value === "left" ? "flex-start" :
      stickerPosition.value === "right" ? "flex-end" :
      "center";

    stickerDisplay.style.fontSize = stickerSize.value;
    stickerDisplay.style.gap = "12px";

    selectedStickers.forEach(sticker => {
      const item = document.createElement("span");
      item.textContent = sticker;
      stickerDisplay.appendChild(item);
    });
  }

  renderStickers();
}

document.querySelectorAll(".sticker-options").forEach(category => {
  category.querySelectorAll(".sticker-option").forEach(button => {
    button.addEventListener("click", () => {
      const sticker = button.textContent.trim();

      if (selectedStickers.includes(sticker)) {
        selectedStickers = selectedStickers.filter(
          item => item !== sticker
        );
      } else {
        selectedStickers.push(sticker);
      }

      updateStickerButtons();
      renderStickers();
      updatePreview();
    });
  });
});

clearStickers.addEventListener("click", () => {
  selectedStickers = [];
  updateStickerButtons();
  renderStickers();
  updatePreview();
});

function applyTheme() {
  if (themeName.value === "Pink Rose Premium") {
    backgroundColor.value = "#FFF5F9";
    boxColor.value = "#FFFFFF";
    textColor.value = "#563746";
  }

  if (themeName.value === "Soft Pink") {
    backgroundColor.value = "#FCE4ED";
    boxColor.value = "#FFFFFF";
    textColor.value = "#563746";
  }

  if (themeName.value === "Dark Rose") {
    backgroundColor.value = "#241722";
    boxColor.value = "#563746";
    textColor.value = "#FFFFFF";
  }

  updatePreview();
}

backgroundImage.addEventListener("change", () => {
  const file = backgroundImage.files[0];

  if (!file) return;

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (!allowedTypes.includes(file.type)) {
    editorMessage.textContent =
      "Gunakan gambar JPG, PNG, atau WEBP.";
    backgroundImage.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    editorMessage.textContent =
      "Ukuran gambar maksimal 5 MB.";
    backgroundImage.value = "";
    return;
  }

  if (temporaryImageUrl) {
    URL.revokeObjectURL(temporaryImageUrl);
  }

  selectedImageFile = file;
  removeCurrentBackground = false;
  temporaryImageUrl = URL.createObjectURL(file);

  showBackgroundPreview(temporaryImageUrl);
  updatePreview();

  editorMessage.textContent = "Gambar siap disimpan.";
});

removeBackgroundImage.addEventListener("click", () => {
  selectedImageFile = null;
  removeCurrentBackground = true;
  backgroundImage.value = "";

  if (temporaryImageUrl) {
    URL.revokeObjectURL(temporaryImageUrl);
    temporaryImageUrl = null;
  }

  showBackgroundPreview(null);
  updatePreview();

  editorMessage.textContent = "Gambar akan dihapus setelah disimpan.";
});

[
  pageTitle,
  pageDescription,
  backgroundColor,
  boxColor,
  textColor,
  fontFamily,
  fontSize,
  boxPosition,
  stickerPosition,
  stickerSize
].forEach(element => {
  element.addEventListener("input", updatePreview);
  element.addEventListener("change", updatePreview);
});

themeName.addEventListener("change", applyTheme);
pageSelect.addEventListener("change", loadSelectedPage);

editorForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const page = currentPages.find(
    item => item.id === pageSelect.value
  );

  if (!page) return;

  if (!anonymousEnabled.checked && !identifiedEnabled.checked) {
    editorMessage.textContent =
      "Aktifkan minimal satu mode pengiriman pertanyaan.";
    return;
  }

  editorMessage.textContent = "Menyimpan pengaturan...";

  try {
    let imageUrl = currentBackgroundUrl;

    if (selectedImageFile) {
      const extension = selectedImageFile.name
        .split(".")
        .pop()
        .toLowerCase();

      const filePath =
        `${currentUser.id}/${page.slug}-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabaseClient
        .storage
        .from("qna-backgrounds")
        .upload(filePath, selectedImageFile, {
          upsert: true,
          contentType: selectedImageFile.type
        });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabaseClient
        .storage
        .from("qna-backgrounds")
        .getPublicUrl(filePath);

      imageUrl = publicData.publicUrl;
    }

    if (removeCurrentBackground) {
      imageUrl = null;
    }

    const updates = {
      title: pageTitle.value.trim(),
      description: pageDescription.value.trim(),
      anonymous_enabled: anonymousEnabled.checked,
      identified_enabled: identifiedEnabled.checked,
      theme_name: themeName.value,
      background_color: backgroundColor.value,
      box_color: boxColor.value,
      text_color: textColor.value,
      font_family: fontFamily.value,
      font_size: fontSize.value,
      box_position: boxPosition.value,
      background_image_url: imageUrl,
      stickers: selectedStickers,
      sticker_position: stickerPosition.value,
      sticker_size: stickerSize.value
    };

    const { error } = await supabaseClient
      .from("qna_pages")
      .update(updates)
      .eq("id", page.id)
      .eq("owner_id", currentUser.id);

    if (error) throw error;

    currentBackgroundUrl = imageUrl;
    selectedImageFile = null;
    removeCurrentBackground = false;

    const { data: refreshedPage, error: refreshError } =
      await supabaseClient
        .from("qna_pages")
        .select("*")
        .eq("id", page.id)
        .single();

    if (!refreshError && refreshedPage) {
      Object.assign(page, refreshedPage);
    }

    showBackgroundPreview(currentBackgroundUrl);
    updatePreview();

    editorMessage.textContent =
      "Pengaturan dan stiker berhasil disimpan!";

  } catch (error) {
    console.error(error);
    editorMessage.textContent =
      error.message || "Gagal menyimpan pengaturan.";
  }
});

initializeEditor();
