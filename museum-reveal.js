/**
 * Scroll-reveal + image load-in for museum sections.
 * Re-scans after login when #app-shell becomes visible.
 */
(function () {
  let observer = null;

  function motionAllowed() {
    if (document.documentElement.getAttribute("data-reduced-motion") === "true") return false;
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function markVisible(el) {
    if (!el) return;
    el.classList.add("reveal-visible");
    const timeline = el.closest(".timeline-section");
    if (timeline) timeline.classList.add("timeline-visible");
  }

  function inViewport(el) {
    const rect = el.getBoundingClientRect();
    const h = window.innerHeight || document.documentElement.clientHeight;
    return rect.top < h * 0.92 && rect.bottom > h * 0.05;
  }

  function scanReveal(force) {
    const nodes = document.querySelectorAll(".reveal:not(.reveal-visible)");
    if (!nodes.length && !force) return;

    if (!motionAllowed()) {
      nodes.forEach(markVisible);
      document.querySelectorAll(".timeline-section").forEach((t) => t.classList.add("timeline-visible"));
      return;
    }

    if (observer) observer.disconnect();

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            markVisible(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -4% 0px", threshold: 0.06 }
    );

    nodes.forEach((el) => observer.observe(el));

    requestAnimationFrame(() => {
      nodes.forEach((el) => {
        if (inViewport(el)) {
          markVisible(el);
          observer.unobserve(el);
        }
      });
    });
  }

  function preloadBackgroundThumb(el) {
    if (el.classList.contains("image-loaded")) return;
    const inline = el.style.backgroundImage || "";
    const fromData = el.getAttribute("data-bg") || "";
    const match = (inline || fromData).match(/url\(["']?([^"')]+)/);
    const url = match ? match[1] : "";
    if (!url) {
      el.classList.add("image-loaded");
      return;
    }
    const img = new Image();
    const done = () => el.classList.add("image-loaded");
    img.onload = done;
    img.onerror = done;
    img.src = url;
  }

  function initImages() {
    document.querySelectorAll(".unit-card__thumb").forEach(preloadBackgroundThumb);

    document.querySelectorAll(".image-frame__img, .image-frame img").forEach((img) => {
      const frame = img.closest(".image-frame");
      const done = () => frame && frame.classList.add("image-loaded");
      if (img.complete && img.naturalWidth > 0) done();
      else {
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      }
    });
  }

  function refresh() {
    initImages();
    scanReveal(true);
  }

  function onAppShellRevealed() {
    setTimeout(refresh, 80);
    setTimeout(refresh, 400);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", refresh);
  } else {
    refresh();
  }

  window.addEventListener("apush:login", onAppShellRevealed);
  window.addEventListener("apush:session-restored", onAppShellRevealed);
  window.addEventListener("apush:app-shell-revealed", onAppShellRevealed);

  window.APUSHReveal = { refresh };
})();
