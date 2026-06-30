/**
 * Animated theme toggler — spring morph (motion/react-style physics, no build).
 * Mounts into [data-theme-toggler-root]. Syncs data-theme on <html>.
 */
(function () {
  const GUEST_THEME_KEY = "apush_guest_theme";
  const SPRING = { stiffness: 380, damping: 30 };
  const BTN_SPRING = { stiffness: 400, damping: 25 };

  function readIsDark() {
    const theme = document.documentElement.getAttribute("data-theme");
    if (theme === "dark" || theme === "light") return theme === "dark";
    return document.documentElement.classList.contains("dark");
  }

  function persistTheme(theme) {
    if (
      window.AuthManager &&
      typeof window.AuthManager.isAuthenticated === "function" &&
      window.AuthManager.isAuthenticated()
    ) {
      window.AuthManager.updateSetting("theme", theme);
    } else {
      sessionStorage.setItem(GUEST_THEME_KEY, theme);
    }
  }

  function applyTheme(dark) {
    const theme = dark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("dark", dark);
    persistTheme(theme);
  }

  function playTick() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ac = new AC();
      if (ac.state === "suspended") ac.resume();
      const rate = ac.sampleRate;
      const len = Math.floor(rate * 0.006);
      const buf = ac.createBuffer(1, len, rate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        const t = i / len;
        const sine = Math.sin(2 * Math.PI * 3400 * t);
        const noise = Math.random() * 2 - 1;
        ch[i] = (sine * 0.6 + noise * 0.4) * (1 - t) ** 3;
      }
      const src = ac.createBufferSource();
      const gain = ac.createGain();
      src.buffer = buf;
      gain.gain.value = 0.08;
      src.connect(gain);
      gain.connect(ac.destination);
      src.start();
    } catch {
      /* silent */
    }
  }

  function makeSpring(initial, target, config) {
    return {
      value: initial,
      target,
      velocity: 0,
      stiffness: config.stiffness,
      damping: config.damping,
    };
  }

  function stepSpring(s, dt) {
    const force = -s.stiffness * (s.value - s.target) - s.damping * s.velocity;
    s.velocity += force * dt;
    s.value += s.velocity * dt;
    return Math.abs(s.value - s.target) > 0.02 || Math.abs(s.velocity) > 0.02;
  }

  function runSpringLoop(springs, onDone) {
    let last = performance.now();
    function frame(now) {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      let anyActive = false;
      springs.forEach(({ spring, apply }) => {
        const active = stepSpring(spring, dt);
        apply(spring.value);
        if (active) anyActive = true;
        else {
          spring.value = spring.target;
          spring.velocity = 0;
          apply(spring.value);
        }
      });
      if (anyActive) requestAnimationFrame(frame);
      else if (onDone) onDone();
    }
    requestAnimationFrame(frame);
  }

  function mountThemeToggler(root) {
    if (root.dataset.themeTogglerMounted === "true") return;
    root.dataset.themeTogglerMounted = "true";

    const maskId = "att-mask-" + Math.random().toString(36).slice(2, 9);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "theme-toggle att-btn att-btn--vanilla";
    btn.setAttribute("aria-label", "Toggle dark mode");
    btn.title = "Toggle dark mode";

    btn.innerHTML = `
      <svg class="att-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <mask id="${maskId}">
          <rect width="100%" height="100%" fill="white"></rect>
          <circle class="att-moon-cutout" cx="33" cy="0" r="9" fill="black"></circle>
        </mask>
        <circle class="att-body" cx="12" cy="12" r="5" fill="currentColor" stroke="none" mask="url(#${maskId})"></circle>
        <g class="att-rays">
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="5.64" y1="5.64" x2="4.22" y2="4.22"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          <line x1="5.64" y1="18.36" x2="4.22" y2="19.78"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        </g>
      </svg>
    `;

    const icon = btn.querySelector(".att-icon");
    const cutout = btn.querySelector(".att-moon-cutout");
    const body = btn.querySelector(".att-body");
    const rays = btn.querySelector(".att-rays");

    let isFirst = true;
    let btnScaleSpring = makeSpring(1, 1, BTN_SPRING);

    function applyBtnScale(v) {
      btn.style.transform = "scale(" + v + ")";
    }

    function setDarkVisual(dark, animate) {
      btn.classList.toggle("att-btn--dark", dark);
      root.classList.toggle("att-root--dark", dark);

      const targets = {
        rotate: dark ? 270 : 0,
        cx: dark ? 17 : 33,
        cy: dark ? 8 : 0,
        r: dark ? 9 : 5,
        rayOpacity: dark ? 0 : 1,
        rayScale: dark ? 0 : 1,
        rayRotate: dark ? -30 : 0,
      };

      if (!animate || isFirst) {
        icon.style.transform = "rotate(" + targets.rotate + "deg)";
        cutout.setAttribute("cx", String(targets.cx));
        cutout.setAttribute("cy", String(targets.cy));
        body.setAttribute("r", String(targets.r));
        rays.style.opacity = String(targets.rayOpacity);
        rays.style.transform =
          "scale(" + targets.rayScale + ") rotate(" + targets.rayRotate + "deg)";
        isFirst = false;
        return;
      }

      const rotateMatch = icon.style.transform.match(/rotate\(([-0-9.]+)deg\)/);
      const rayMatch = rays.style.transform.match(/scale\(([-0-9.]+)\)\s*rotate\(([-0-9.]+)deg\)/);
      const rotateSpring = makeSpring(
        rotateMatch ? parseFloat(rotateMatch[1]) : 0,
        targets.rotate,
        SPRING
      );
      const cxSpring = makeSpring(parseFloat(cutout.getAttribute("cx")) || 33, targets.cx, SPRING);
      const cySpring = makeSpring(parseFloat(cutout.getAttribute("cy")) || 0, targets.cy, SPRING);
      const rSpring = makeSpring(parseFloat(body.getAttribute("r")) || 5, targets.r, SPRING);
      const opSpring = makeSpring(parseFloat(rays.style.opacity) || 1, targets.rayOpacity, SPRING);
      const scaleSpring = makeSpring(rayMatch ? parseFloat(rayMatch[1]) : 1, targets.rayScale, SPRING);
      const rayRotSpring = makeSpring(
        rayMatch ? parseFloat(rayMatch[2]) : 0,
        targets.rayRotate,
        SPRING
      );

      runSpringLoop([
        { spring: rotateSpring, apply: (v) => { icon.style.transform = "rotate(" + v + "deg)"; } },
        { spring: cxSpring, apply: (v) => { cutout.setAttribute("cx", String(v)); } },
        { spring: cySpring, apply: (v) => { cutout.setAttribute("cy", String(v)); } },
        { spring: rSpring, apply: (v) => { body.setAttribute("r", String(v)); } },
        { spring: opSpring, apply: (v) => { rays.style.opacity = String(v); } },
        {
          spring: scaleSpring,
          apply: (v) => {
            const rot = rayRotSpring.value;
            rays.style.transform = "scale(" + v + ") rotate(" + rot + "deg)";
          },
        },
        {
          spring: rayRotSpring,
          apply: (v) => {
            const sc = scaleSpring.value;
            rays.style.transform = "scale(" + sc + ") rotate(" + v + "deg)";
          },
        },
      ]);
    }

    btn.addEventListener("mouseenter", () => {
      btnScaleSpring.target = 1.1;
      runSpringLoop([{ spring: btnScaleSpring, apply: applyBtnScale }]);
    });
    btn.addEventListener("mouseleave", () => {
      btnScaleSpring.target = 1;
      runSpringLoop([{ spring: btnScaleSpring, apply: applyBtnScale }]);
    });
    btn.addEventListener("mousedown", () => {
      btnScaleSpring.target = 0.86;
      runSpringLoop([{ spring: btnScaleSpring, apply: applyBtnScale }]);
    });
    btn.addEventListener("mouseup", () => {
      btnScaleSpring.target = btn.matches(":hover") ? 1.1 : 1;
      runSpringLoop([{ spring: btnScaleSpring, apply: applyBtnScale }]);
    });

    btn.addEventListener("click", () => {
      const nextDark = !readIsDark();
      applyTheme(nextDark);
      setDarkVisual(nextDark, true);
      playTick();
    });

    root.replaceChildren(btn);
    setDarkVisual(readIsDark(), false);

    const observer = new MutationObserver(() => {
      setDarkVisual(readIsDark(), true);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });
  }

  function init() {
    document.querySelectorAll("[data-theme-toggler-root]").forEach(mountThemeToggler);
    if (typeof window.syncAuthThemeToggles === "function") {
      window.syncAuthThemeToggles();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
