/**
 * Redirect guests away from app pages to the homepage intro (index.html).
 */
(function () {
  const PUBLIC_PAGES = new Set(["index.html", "login.html", ""]);

  function currentPage() {
    const parts = window.location.pathname.split("/");
    return parts[parts.length - 1] || "index.html";
  }

  function redirectGuest() {
    if (!window.AuthManager || !window.AuthManager.isAuthenticated()) {
      const page = currentPage();
      if (!PUBLIC_PAGES.has(page)) {
        window.location.replace("index.html");
      }
    }
  }

  function run() {
    if (!window.AuthManager) return;
    window.AuthManager.init();
    if (PUBLIC_PAGES.has(currentPage())) return;

    redirectGuest();
    window.addEventListener("apush:session-restored", redirectGuest, { once: true });
    window.addEventListener("apush:login", redirectGuest, { once: true });
    setTimeout(redirectGuest, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
