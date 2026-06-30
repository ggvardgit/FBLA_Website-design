/**
 * Login / signup page — local AuthManager or Supabase when configured.
 */
(function () {
  function ensureAuthReady() {
    if (window.AuthManager && typeof window.AuthManager.init === "function") {
      window.AuthManager.init();
    }
  }

  function showError(msg) {
    const el = document.getElementById("error-message");
    if (!el) return;
    el.textContent = msg;
    el.style.display = "block";
    el.classList.add("show");
    const ok = document.getElementById("success-message");
    if (ok) {
      ok.style.display = "none";
      ok.classList.remove("show");
    }
  }

  function showSuccess(msg) {
    const el = document.getElementById("success-message");
    if (!el) return;
    el.textContent = msg;
    el.style.display = "block";
    el.classList.add("show");
    const err = document.getElementById("error-message");
    if (err) {
      err.style.display = "none";
      err.classList.remove("show");
    }
  }

  function clearMessages() {
    ["error-message", "success-message"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.style.display = "none";
        el.classList.remove("show");
        el.textContent = "";
      }
    });
  }

  function goHome() {
    window.location.href = "index.html";
  }

  async function handleSignIn(e) {
    e.preventDefault();
    clearMessages();
    ensureAuthReady();

    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;
    const btn = document.getElementById("submit-btn");

    if (!email || !password) {
      showError("Email and password are required.");
      return;
    }
    if (password.length < 8) {
      showError("Password must be at least 8 characters.");
      return;
    }
    if (!window.AuthManager) {
      showError("Authentication is unavailable. Please refresh the page.");
      return;
    }

    if (btn) btn.disabled = true;

    try {
      if (window.SupabaseAuth?.isConfigured()) {
        const { user } = await window.SupabaseAuth.signIn(email, password);
        await window.SupabaseAuth.syncSessionToAuthManager(user);
      } else {
        window.AuthManager.authenticate(email, password);
      }
      showSuccess("Login successful! Redirecting…");
      setTimeout(goHome, 400);
    } catch (err) {
      showError(err.message || "Sign in failed.");
      if (btn) btn.disabled = false;
    }
  }

  async function handleSignUp(e) {
    e.preventDefault();
    clearMessages();
    ensureAuthReady();

    const email = document.getElementById("signup-email")?.value.trim();
    const password = document.getElementById("signup-password")?.value;
    const confirm = document.getElementById("signup-confirm")?.value;
    const btn = document.getElementById("signup-btn");

    if (!email || !password) {
      showError("Email and password are required.");
      return;
    }
    if (password.length < 8) {
      showError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      showError("Passwords do not match.");
      return;
    }
    if (!window.AuthManager) {
      showError("Authentication is unavailable. Please refresh the page.");
      return;
    }

    if (btn) btn.disabled = true;

    try {
      if (window.SupabaseAuth?.isConfigured()) {
        const result = await window.SupabaseAuth.signUp(email, password);
        if (result.needsVerification) {
          showSuccess(
            "Account created! Check your email to verify your account, then sign in."
          );
          if (btn) btn.disabled = false;
          return;
        }
        if (result.user) {
          await window.SupabaseAuth.syncSessionToAuthManager(result.user);
        }
      } else {
        window.AuthManager.createAccount(email, password);
        window.AuthManager.authenticate(email, password);
      }
      showSuccess("Account created! Redirecting…");
      setTimeout(goHome, 400);
    } catch (err) {
      showError(err.message || "Could not create account.");
      if (btn) btn.disabled = false;
    }
  }

  function showSignupForm() {
    document.getElementById("login-form")?.style.setProperty("display", "none");
    document.getElementById("login-footer")?.style.setProperty("display", "none");
    document.getElementById("signup-section")?.style.setProperty("display", "block");
    clearMessages();
  }

  function showLoginForm() {
    document.getElementById("signup-section")?.style.setProperty("display", "none");
    document.getElementById("login-form")?.style.setProperty("display", "");
    document.getElementById("login-footer")?.style.setProperty("display", "");
    clearMessages();
  }

  function initLoginPage() {
    ensureAuthReady();

    if (window.AuthManager?.isAuthenticated?.()) {
      goHome();
      return;
    }

    document.getElementById("toggle-password")?.addEventListener("click", () => {
      const input = document.getElementById("password");
      const btn = document.getElementById("toggle-password");
      if (!input || !btn) return;
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.textContent = show ? "Hide" : "Show";
    });

    document.getElementById("login-form")?.addEventListener("submit", handleSignIn);
    document.getElementById("signup-form")?.addEventListener("submit", handleSignUp);

    document.getElementById("create-account-link")?.addEventListener("click", (e) => {
      e.preventDefault();
      showSignupForm();
    });

    document.getElementById("back-to-login")?.addEventListener("click", (e) => {
      e.preventDefault();
      showLoginForm();
    });

    if (new URLSearchParams(window.location.search).has("signup")) {
      showSignupForm();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLoginPage);
  } else {
    initLoginPage();
  }
})();
