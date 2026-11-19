
/* ========================================
   SORA - DASHBOARD
   Statistik Q&A dan Pengunjung
======================================== */

document.addEventListener("DOMContentLoaded", async () => {
  const userName = document.getElementById("userName");
  const welcomeName = document.getElementById("welcomeName");
  const logoutButton = document.getElementById("logoutButton");

  const totalQna = document.getElementById("totalQna");
  const totalQuestions = document.getElementById("totalQuestions");
  const totalVisits = document.getElementById("totalVisits");

  const adminMenu = document.getElementById("adminMenu");

  const db =
    window.soraSupabaseClient ||
    window.supabaseClient;

  /* ========================================
     CHECK CONNECTION
  ======================================== */

  if (!db) {
    console.error("Supabase tidak terhubung.");

    if (totalQna) totalQna.textContent = "0";
    if (totalQuestions) totalQuestions.textContent = "0";
    if (totalVisits) totalVisits.textContent = "0";

    return;
  }

  /* ========================================
     CHECK LOGIN
  ======================================== */

  try {
    const {
      data: { user },
      error
    } = await db.auth.getUser();

    if (error || !user) {
      window.location.replace("login.html");
      return;
    }

    /* ========================================
       LOAD PROFILE
    ======================================== */

    const {
      data: profile,
      error: profileError
    } = await db
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Profile error:", profileError);
    }

    const name =
      profile?.display_name ||
      user.user_metadata?.display_name ||
      user.email?.split("@")[0] ||
      "Pengguna SORA";

    if (userName) {
      userName.textContent = name;
    }

    if (welcomeName) {
      welcomeName.textContent = name;
    }

    /* ========================================
       CHECK ADMIN STATUS
    ======================================== */

    if (adminMenu) {
      adminMenu.style.display = "none";

      const {
        data: adminData,
        error: adminError
      } = await db
        .from("sora_admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (adminError) {
        console.error("Admin check error:", adminError);
      }

      if (adminData) {
        adminMenu.style.display = "flex";
      }
    }

    /* ========================================
       LOAD QNA PAGES
    ======================================== */

    const {
      data: pages,
      error: pagesError
    } = await db
      .from("qna_pages")
      .select("id")
      .eq("owner_id", user.id);

    if (pagesError) {
      console.error("Q&A pages error:", pagesError);

      if (totalQna) totalQna.textContent = "!";
      if (totalQuestions) totalQuestions.textContent = "!";
      if (totalVisits) totalVisits.textContent = "!";

      return;
    }

    const pageCount = pages?.length || 0;

    if (totalQna) {
      totalQna.textContent = pageCount;
    }

    /* ========================================
       HANDLE EMPTY QNA PAGES
    ======================================== */

    const pageIds = (pages || []).map(page => page.id);

    if (pageIds.length === 0) {
      if (totalQuestions) {
        totalQuestions.textContent = "0";
      }

      if (totalVisits) {
        totalVisits.textContent = "0";
      }

      return;
    }

    /* ========================================
       COUNT TOTAL QUESTIONS
    ======================================== */

    const {
      count: questionCount,
      error: questionsError
    } = await db
      .from("qna_questions")
      .select("id", {
        count: "exact",
        head: true
      })
      .in("qna_page_id", pageIds);

    if (questionsError) {
      console.error("Questions error:", questionsError);

      if (totalQuestions) {
        totalQuestions.textContent = "!";
      }
    } else {
      if (totalQuestions) {
        totalQuestions.textContent = questionCount ?? 0;
      }
    }

    /* ========================================
       COUNT TOTAL VISITS
    ======================================== */

    const {
      count: visitCount,
      error: visitsError
    } = await db
      .from("qna_visits")
      .select("id", {
        count: "exact",
        head: true
      })
      .in("page_id", pageIds);

    if (visitsError) {
      console.error("Visits error:", visitsError);

      if (totalVisits) {
        totalVisits.textContent = "!";
      }
    } else {
      if (totalVisits) {
        totalVisits.textContent = visitCount ?? 0;
      }
    }

  } catch (error) {
    console.error("Dashboard error:", error);

    if (userName) {
      userName.textContent = "Pengguna SORA";
    }

    if (totalQna) {
      totalQna.textContent = "!";
    }

    if (totalQuestions) {
      totalQuestions.textContent = "!";
    }

    if (totalVisits) {
      totalVisits.textContent = "!";
    }
  }

  /* ========================================
     LOGOUT
  ======================================== */

  if (logoutButton) {
    logoutButton.addEventListener("click", async (event) => {
      event.preventDefault();

      logoutButton.disabled = true;
      logoutButton.textContent = "Keluar...";

      const { error } = await db.auth.signOut();

      if (error) {
        alert("Gagal keluar: " + error.message);

        logoutButton.disabled = false;
        logoutButton.textContent = "Keluar";

        return;
      }

      window.location.replace("login.html");
    });
  }
});
