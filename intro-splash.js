import { initGLSLHills } from "./glsl-hills.js";

function isLoggedIn() {
  return (
    window.AuthManager &&
    typeof window.AuthManager.isAuthenticated === "function" &&
    window.AuthManager.isAuthenticated()
  );
}

function waitForAuthReady() {
  return new Promise((resolve) => {
    if (window.AuthManager && typeof window.AuthManager.init === "function") {
      window.AuthManager.init();
    }
    if (isLoggedIn()) {
      resolve();
      return;
    }
    const finish = () => resolve();
    window.addEventListener("apush:session-restored", finish, { once: true });
    window.addEventListener("apush:login", finish, { once: true });
    setTimeout(finish, 500);
  });
}

function revealApp(splash, shell, cleanup) {
  if (cleanup) cleanup();
  splash.classList.remove("intro-splash--exit");
  splash.hidden = true;
  document.body.classList.remove("intro-active");
  shell.classList.remove("app-shell--gated");
  shell.removeAttribute("inert");
  window.dispatchEvent(new CustomEvent("apush:app-shell-revealed"));
  if (window.APUSHReveal && typeof window.APUSHReveal.refresh === "function") {
    window.APUSHReveal.refresh();
  }
}

function showLoginGate(splash, shell) {
  document.body.classList.add("intro-active");
  shell.classList.add("app-shell--gated");
  shell.setAttribute("inert", "");
  splash.hidden = false;

  const hillsRoot = document.getElementById("glsl-hills-root");
  if (hillsRoot) {
    return initGLSLHills(hillsRoot, { speed: 0.5, cameraZ: 125, planeSize: 256 });
  }
  return null;
}

function hasStoredSession() {
  try {
    return !!localStorage.getItem("apush_session");
  } catch {
    return false;
  }
}

async function initIntroSplash() {
  const splash = document.getElementById("intro-splash");
  const shell = document.getElementById("app-shell");
  if (!splash || !shell) return;

  if (hasStoredSession() || isLoggedIn()) {
    if (window.AuthManager && typeof window.AuthManager.init === "function") {
      window.AuthManager.init();
    }
    revealApp(splash, shell, null);
    return;
  }

  await waitForAuthReady();

  let hillsCleanup = null;

  const onAuthenticated = () => {
    if (!isLoggedIn()) return;
    revealApp(splash, shell, hillsCleanup);
    hillsCleanup = null;
  };

  if (isLoggedIn()) {
    revealApp(splash, shell, null);
    return;
  }

  hillsCleanup = showLoginGate(splash, shell);
  window.addEventListener("apush:session-restored", onAuthenticated);
  window.addEventListener("apush:login", onAuthenticated);

  window.addEventListener("apush:logout", () => {
    if (isLoggedIn()) return;
    hillsCleanup = showLoginGate(splash, shell);
  });
}

function appPath(filename) {
  return new URL(filename, window.location.href).href;
}

function setupIntroAuthButtons() {
  document.getElementById("intro-sign-in-btn")?.addEventListener("click", () => {
    window.location.assign(appPath("login.html"));
  });
  document.getElementById("intro-create-account-btn")?.addEventListener("click", () => {
    window.location.assign(appPath("login.html?signup=1"));
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    setupIntroAuthButtons();
    initIntroSplash();
  });
} else {
  setupIntroAuthButtons();
  initIntroSplash();
}
