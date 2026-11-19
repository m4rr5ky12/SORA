
// ==============================
// SORA - SISTEM AUTENTIKASI
// ==============================

const SORA_URL = "http://127.0.0.1:5503";

// ==============================
// PENDAFTARAN AKUN
// ==============================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("displayName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const button = document.getElementById("registerButton");
    const message = document.getElementById("message");

    button.disabled = true;
    button.textContent = "Mendaftarkan...";
    message.textContent = "";

    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name
          },
          emailRedirectTo: `${SORA_URL}/login.html`
        }
      });

      if (error) throw error;

      message.style.color = "green";

      if (data.session) {
        message.textContent = "Akun berhasil dibuat! Mengalihkan...";

        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1500);
      } else {
        message.textContent =
          "Pendaftaran berhasil! Silakan periksa email untuk verifikasi akun.";
      }

    } catch (error) {
      message.style.color = "#d95f91";
      message.textContent = error.message;
    } finally {
      button.disabled = false;
      button.textContent = "Daftar Sekarang";
    }
  });
}

// ==============================
// LOGIN AKUN
// ==============================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const button = document.getElementById("loginButton");
    const message = document.getElementById("message");

    button.disabled = true;
    button.textContent = "Memeriksa akun...";
    message.textContent = "";

    try {
      const { data, error } =
        await supabaseClient.auth.signInWithPassword({
          email,
          password
        });

      if (error) throw error;

      message.style.color = "green";
      message.textContent = "Login berhasil! Mengalihkan...";

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1000);

    } catch (error) {
      message.style.color = "#d95f91";
      message.textContent = error.message;
    } finally {
      button.disabled = false;
      button.textContent = "Masuk Sekarang";
    }
  });
}
