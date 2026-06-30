/**
 * APUSH HUB — rule-based site assistant (no AI, no API).
 * Keyword + quick-chip matching for navigation and study help.
 */
(function () {
  "use strict";

  if (document.getElementById("cw-bubble")) return;

  const PAGES = {
    home: "index.html",
    units: "units.html",
    resources: "resources.html",
    dashboard: "dashboard.html",
    schedule: "schedule.html",
    settings: "index.html?settings=1",
    login: "login.html",
    questionBank: "resources.html#question-bank",
    unit1: "unit-study.html?period=1",
    unit2: "unit-study.html?period=2",
    unit3: "unit-study.html?period=3",
    unit4: "unit-study.html?period=4",
    unit5: "unit-study.html?period=5",
    unit6: "unit-study.html?period=6",
    unit7: "unit-study.html?period=7",
    unit8: "unit-study.html?period=8",
    timeline: "index.html#timeline-heading",
  };

  const GREETING =
    "Welcome to the <strong>APUSH Archive Assistant</strong>. I can guide you to units, practice tools, DBQ/LEQ/SAQ help, your dashboard, and more — no account required for browsing tips.";
  const GREETING_CHIPS = [
    "Site map",
    "DBQ help",
    "Question bank",
    "Go to Dashboard",
  ];

  const FALLBACK =
    "I didn't catch that. Try a quick chip below, or type things like <em>resources</em>, <em>period 3</em>, <em>dbq</em>, or <em>dashboard</em>. Type <strong>help</strong> for a full command list.";
  const FALLBACK_ALTERNATES = [
    "Hmm — try naming a page (<em>units</em>, <em>schedule</em>) or a skill (<em>dbq</em>, <em>leq</em>). Chips below are shortcuts.",
    "Not sure yet. Ask about a <strong>period</strong>, the <strong>question bank</strong>, or say <strong>site map</strong> for an overview.",
    "I can route you to study tools and pages. Type <em>help</em> or tap a chip — e.g. <em>Period 5</em> or <em>Go to Resources</em>.",
  ];
  const FALLBACK_CHIPS = ["Help", "Site map", "Go to Resources", "DBQ help"];

  const HISTORY_KEY = "apush_assistant_history";
  const MAX_HISTORY = 60;

  /** Exact chip label → response (checked before keyword scan) */
  const CHIP_MAP = {
    "Site map": {
      answer:
        "<strong>Main pages:</strong><br>• Home — overview & timeline<br>• Units — all 8 periods<br>• Resources — DBQ/LEQ/SAQ tools & question bank<br>• Dashboard — your progress<br>• Schedule — live study sessions<br>• Settings — gear icon (top right) for theme & preferences",
      chips: ["Go to Home", "Go to Units", "Go to Resources", "Go to Dashboard"],
    },
    Help: {
      answer:
        "<strong>Commands I understand:</strong><br>• Navigation: <em>home, units, resources, dashboard, schedule, settings, login</em><br>• Writing: <em>dbq, leq, saq, question bank</em><br>• Study: <em>period 1-8, timeline, exam readiness, practice</em><br>• Account: <em>sign in, create account, progress</em>",
      chips: ["Site map", "DBQ help", "Question bank", "Go to Units"],
    },
    "Go to Home": { answer: "Opening the homepage…", navigate: PAGES.home, chips: ["Explore periods", "Timeline", "Go to Resources"] },
    "Go to Units": { answer: "Opening Explore the Periods…", navigate: PAGES.units, chips: ["Period 3", "Period 5", "Go to Resources"] },
    "Go to Resources": {
      answer: "Opening The Resource Archive — filters, portfolio tools, and the pre-built question bank.",
      navigate: PAGES.resources,
      chips: ["Question bank", "DBQ help", "LEQ help", "SAQ help"],
    },
    "Go to Dashboard": {
      answer: "Opening Your Study Archive to check readiness and progress.",
      navigate: PAGES.dashboard,
      chips: ["Exam readiness", "Go to Schedule", "Go to Units"],
    },
    "Go to Schedule": { answer: "Opening Study Timeline…", navigate: PAGES.schedule, chips: ["Go to Dashboard", "Go to Units"] },
    "Go to Settings": { answer: "Opening Settings…", openSettings: true, chips: ["Theme help", "Go to Dashboard"] },
    "Go to Login": { answer: "Opening sign-in / create account…", navigate: PAGES.login, chips: ["Go to Home", "Go to Dashboard"] },
    "Question bank": {
      answer:
        "The <strong>Pre-Built Question Bank</strong> has 20 DBQs (6 sources each), 20 LEQs, 100 SAQs, and 100 supplemental prompts. Use the tabs on the Resources page, then click <strong>Practice This DBQ</strong> or similar buttons on each card.",
      navigate: PAGES.questionBank,
      chips: ["DBQ help", "LEQ help", "SAQ help", "Supplemental prompts"],
    },
    "DBQ help": {
      answer:
        "<strong>DBQ workflow:</strong><br>1. Go to <a href=\"resources.html\">Resources</a><br>2. Open <strong>DBQ Annotation Tool</strong> or a period DBQ practice card<br>3. Or use the Question Bank → DBQ tab → <strong>Practice This DBQ</strong><br>4. Read all 6 documents, annotate, then draft in the scorer.",
      navigate: PAGES.resources,
      chips: ["Question bank", "Open annotation tool", "Period 5 DBQ"],
    },
    "LEQ help": {
      answer:
        "<strong>LEQ tips:</strong> Use the <strong>LEQ Outline Generator</strong> on Resources, or Question Bank → LEQ → <strong>Start LEQ Practice</strong>. Build a defensible thesis, context, two body paragraphs with evidence, and synthesis.",
      navigate: PAGES.resources,
      chips: ["Question bank", "Go to Resources", "Writing tips"],
    },
    "SAQ help": {
      answer:
        "<strong>SAQ practice:</strong> On Resources, open any <strong>SAQ Practice Set</strong> or use Question Bank → SAQ → <strong>Open SAQ Drill</strong>. Answer in 2–4 sentences with specific evidence.",
      navigate: PAGES.resources,
      chips: ["Question bank", "Go to Resources", "Practice questions"],
    },
    "Supplemental prompts": {
      answer:
        "Supplemental drills mix LEQ, SAQ, MCQ, and DBQ-style prompts with source hints. Find them under Question Bank → <strong>Supplemental</strong> tab → <strong>Use This Prompt</strong>.",
      navigate: PAGES.questionBank,
      chips: ["Question bank", "DBQ help", "LEQ help"],
    },
    "Open annotation tool": {
      answer: "On Resources, click the <strong>DBQ Annotation Tool</strong> card to open the document viewer and rubric scorer.",
      navigate: PAGES.resources,
      chips: ["DBQ help", "Question bank"],
    },
    "Explore periods": {
      answer: "All eight APUSH periods are on the Units page as exhibit-style cards. Pick any period to open the full unit study guide.",
      navigate: PAGES.units,
      chips: ["Period 1", "Period 3", "Period 7"],
    },
    Timeline: {
      answer: "The homepage has a compact <strong>Timeline of American History</strong>. I'll scroll you there now.",
      navigate: PAGES.timeline,
      chips: ["Go to Home", "Period 3", "Go to Units"],
    },
    "Exam readiness": {
      answer:
        "Exam readiness on the <strong>homepage</strong> and <strong>dashboard</strong> reflects period mastery, practice volume, and study consistency. Open Dashboard for your full study archive.",
      chips: ["Go to Dashboard", "Go to Home", "Practice questions"],
    },
    "Practice questions": {
      answer: "MCQ, SAQ, DBQ, and LEQ practice live under Resources and in the Question Bank.",
      navigate: PAGES.resources,
      chips: ["Question bank", "SAQ help", "DBQ help"],
    },
    "Writing tips": {
      answer:
        "<strong>FRQ reminders:</strong><br>• Thesis must answer the prompt<br>• Cite documents by name/number (DBQ)<br>• Explain <em>why</em> evidence supports your claim<br>• Use period-accurate vocabulary",
      chips: ["DBQ help", "LEQ help", "SAQ help"],
    },
    "Theme help": {
      answer: "Toggle light/dark mode with the theme control in the top nav, or click the <strong>⚙️ gear icon</strong> for appearance, accessibility, and account settings.",
      openSettings: true,
      chips: ["Go to Settings"],
    },
    "Period 1": { answer: "Opening Period 1 — Colonial America (1607–1754)…", navigate: PAGES.unit1, chips: ["Go to Units", "Period 2"] },
    "Period 2": { answer: "Opening Period 2 — Revolution & Republic…", navigate: PAGES.unit2, chips: ["Go to Units", "Period 3"] },
    "Period 3": { answer: "Opening Period 3 — Expansion & Reform…", navigate: PAGES.unit3, chips: ["Go to Units", "Period 4"] },
    "Period 4": { answer: "Opening Period 4 — Crisis & Civil War…", navigate: PAGES.unit4, chips: ["Go to Units", "Period 5"] },
    "Period 5": { answer: "Opening Period 5 — Gilded Age…", navigate: PAGES.unit5, chips: ["Period 5 DBQ", "Go to Units"] },
    "Period 6": { answer: "Opening Period 6 — Modern America Emerges…", navigate: PAGES.unit6, chips: ["Go to Units", "Period 7"] },
    "Period 7": { answer: "Opening Period 7 — Postwar America…", navigate: PAGES.unit7, chips: ["Go to Units", "Period 8"] },
    "Period 8": { answer: "Opening Period 8 — Contemporary U.S.…", navigate: PAGES.unit8, chips: ["Go to Units", "Go to Home"] },
    "Period 5 DBQ": {
      answer: "Opening Resources for DBQ practice — filter by Period 5 or use the Question Bank DBQ tab.",
      navigate: PAGES.questionBank,
      chips: ["DBQ help", "Question bank"],
    },
  };

  const RESPONSES = [
    {
      keywords: ["hi", "hello", "hey", "start", "help me"],
      answer: GREETING,
      chips: GREETING_CHIPS,
    },
    {
      keywords: ["help", "commands", "what can you do", "menu", "options"],
      answer: CHIP_MAP.Help.answer,
      chips: CHIP_MAP.Help.chips,
    },
    {
      keywords: ["site map", "sitemap", "pages", "navigate", "where can i go"],
      answer: CHIP_MAP["Site map"].answer,
      chips: CHIP_MAP["Site map"].chips,
    },
    {
      keywords: ["home", "homepage", "main page", "landing"],
      answer: "The homepage has the hero, exam readiness, period cards, timeline, and review tools.",
      navigate: PAGES.home,
      chips: ["Timeline", "Exam readiness", "Go to Units"],
    },
    {
      keywords: ["unit", "units", "periods", "explore periods", "curriculum"],
      answer: "Browse all eight APUSH periods with themes, dates, and study guides.",
      navigate: PAGES.units,
      chips: ["Period 1", "Period 3", "Period 7", "Go to Units"],
    },
    {
      keywords: ["period 1", "colonial", "1607", "jamestown"],
      answer: CHIP_MAP["Period 1"].answer,
      navigate: PAGES.unit1,
      chips: ["Go to Units", "Period 2"],
    },
    {
      keywords: ["period 2", "revolution", "1754", "independence"],
      answer: CHIP_MAP["Period 2"].answer,
      navigate: PAGES.unit2,
      chips: ["Go to Units", "Period 3"],
    },
    {
      keywords: ["period 3", "early republic", "1800", "market revolution"],
      answer: CHIP_MAP["Period 3"].answer,
      navigate: PAGES.unit3,
      chips: ["Go to Units", "Period 4"],
    },
    {
      keywords: ["period 4", "civil war", "reconstruction", "1844", "1877"],
      answer: CHIP_MAP["Period 4"].answer,
      navigate: PAGES.unit4,
      chips: ["Go to Units", "Period 5"],
    },
    {
      keywords: ["period 5", "gilded", "industrial", "1865", "1898"],
      answer: CHIP_MAP["Period 5"].answer,
      navigate: PAGES.unit5,
      chips: ["Period 5 DBQ", "Go to Units"],
    },
    {
      keywords: ["period 6", "progressive", "wwi", "wwii", "depression", "1890", "1945"],
      answer: CHIP_MAP["Period 6"].answer,
      navigate: PAGES.unit6,
      chips: ["Go to Units", "Period 7"],
    },
    {
      keywords: ["period 7", "cold war", "civil rights", "1945", "1980"],
      answer: CHIP_MAP["Period 7"].answer,
      navigate: PAGES.unit7,
      chips: ["Go to Units", "Period 8"],
    },
    {
      keywords: ["period 8", "modern", "contemporary", "1980", "present", "reagan"],
      answer: CHIP_MAP["Period 8"].answer,
      navigate: PAGES.unit8,
      chips: ["Go to Units", "Go to Home"],
    },
    {
      keywords: ["resource", "materials", "tools", "archive"],
      answer: CHIP_MAP["Go to Resources"].answer,
      navigate: PAGES.resources,
      chips: CHIP_MAP["Go to Resources"].chips,
    },
    {
      keywords: ["question bank", "pre-built", "prompt bank", "dbq tab", "100 saq"],
      answer: CHIP_MAP["Question bank"].answer,
      navigate: PAGES.questionBank,
      chips: CHIP_MAP["Question bank"].chips,
    },
    {
      keywords: ["dbq", "document based", "documents", "annotation", "source packet"],
      answer: CHIP_MAP["DBQ help"].answer,
      navigate: PAGES.resources,
      chips: CHIP_MAP["DBQ help"].chips,
    },
    {
      keywords: ["leq", "long essay", "essay prompt", "outline generator"],
      answer: CHIP_MAP["LEQ help"].answer,
      navigate: PAGES.resources,
      chips: CHIP_MAP["LEQ help"].chips,
    },
    {
      keywords: ["saq", "short answer"],
      answer: CHIP_MAP["SAQ help"].answer,
      navigate: PAGES.resources,
      chips: CHIP_MAP["SAQ help"].chips,
    },
    {
      keywords: ["mcq", "multiple choice", "practice drill"],
      answer: "MCQ drills are on the Resources page under the MCQ portfolio section. Open any MCQ practice card to start.",
      navigate: PAGES.resources,
      chips: ["Practice questions", "Go to Resources"],
    },
    {
      keywords: ["supplemental", "extra questions", "bonus"],
      answer: CHIP_MAP["Supplemental prompts"].answer,
      navigate: PAGES.questionBank,
      chips: CHIP_MAP["Supplemental prompts"].chips,
    },
    {
      keywords: ["dashboard", "progress", "study archive", "my stats", "readiness"],
      answer: CHIP_MAP["Go to Dashboard"].answer,
      navigate: PAGES.dashboard,
      chips: ["Exam readiness", "Go to Schedule", "Go to Units"],
    },
    {
      keywords: ["schedule", "calendar", "study plan", "tasks", "upcoming"],
      answer: CHIP_MAP["Go to Schedule"].answer,
      navigate: PAGES.schedule,
      chips: ["Go to Dashboard", "Go to Units"],
    },
    {
      keywords: ["setting", "preferences", "theme", "dark mode", "font size"],
      answer: CHIP_MAP["Theme help"].answer,
      openSettings: true,
      chips: CHIP_MAP["Theme help"].chips,
    },
    {
      keywords: ["timeline", "chronology", "dates", "1491", "1776", "1861"],
      answer: CHIP_MAP.Timeline.answer,
      navigate: PAGES.timeline,
      chips: CHIP_MAP.Timeline.chips,
    },
    {
      keywords: ["sign in", "signin", "log in", "login", "create account", "register", "account"],
      answer: "Use the <strong>Sign In</strong> button on the intro screen, or open Settings to manage your account and preferences.",
      chips: ["Go to Settings", "Go to Dashboard", "Go to Home"],
    },
    {
      keywords: ["metrics", "simulator", "projected", "success metrics"],
      answer: "The <strong>Success Metrics Lab</strong> on the homepage lets you adjust study hours and accuracy to model projected outcomes.",
      navigate: "index.html#metrics-heading",
      chips: ["Go to Home", "Exam readiness"],
    },
    {
      keywords: ["challenge", "daily", "generate challenge"],
      answer: "Scroll to <strong>Daily History Challenge</strong> on the homepage and click Generate Challenge for a quick SAQ/DBQ/LEQ-style prompt.",
      navigate: "index.html#challenge-heading",
      chips: ["Go to Home", "Practice questions"],
    },
    {
      keywords: ["study guide", "key terms", "vocabulary", "concept"],
      answer: "Each unit study page includes key concepts, people, events, vocabulary, and practice. Open any period from Units.",
      navigate: PAGES.units,
      chips: ["Period 3", "Go to Units"],
    },
    {
      keywords: ["exam", "ap exam", "test prep", "review"],
      answer:
        "For exam prep: check <strong>Dashboard</strong> readiness, drill <strong>Question Bank</strong>, review <strong>Units</strong>, and use DBQ/LEQ/SAQ tools on <strong>Resources</strong>.",
      chips: ["Question bank", "DBQ help", "Go to Dashboard", "Go to Units"],
    },
    {
      keywords: ["thanks", "thank you", "thx"],
      answer: "You're welcome — good luck with your review. Ask anytime you need directions around the site.",
      chips: ["Site map", "DBQ help", "Go to Units"],
    },
    {
      keywords: ["bye", "goodbye", "see you"],
      answer: "Good luck studying. I'll be here in the corner if you need directions.",
      chips: [],
    },
  ];

  let opened = false;
  let els = {};
  let lastResponseKey = null;
  const responseVariantIndex = {};

  function loadHistory() {
    try {
      const raw = sessionStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function persistHistory(who, html) {
    const hist = loadHistory();
    hist.push({ who, html, ts: Date.now() });
    if (hist.length > MAX_HISTORY) hist.splice(0, hist.length - MAX_HISTORY);
    try {
      sessionStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
    } catch {
      /* storage full — ignore */
    }
  }

  function renderMsgRow(who, html, save) {
    const row = document.createElement("div");
    row.className = "cw-msg" + (who === "user" ? " user" : "");
    if (who === "bot") {
      row.innerHTML =
        '<div class="cw-bubble-icon" aria-hidden="true">AH</div><div class="cw-text">' + html + "</div>";
    } else {
      row.innerHTML = '<div class="cw-text">' + escapeHtml(html) + "</div>";
    }
    els.msgs.appendChild(row);
    els.msgs.scrollTop = els.msgs.scrollHeight;
    if (save !== false) persistHistory(who, html);
  }

  function mountWidget() {
    const tpl = document.createElement("template");
    tpl.innerHTML = `
      <button id="cw-bubble" type="button" aria-label="Open APUSH study assistant" aria-expanded="false">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>
      </button>
      <div id="cw-window" role="dialog" aria-label="APUSH study assistant" aria-hidden="true">
        <div id="cw-header">
          <div id="cw-header-info">
            <div id="cw-avatar" aria-hidden="true">AH</div>
            <div>
              <div id="cw-title">Archive Assistant</div>
              <div id="cw-subtitle">Guided help — no AI</div>
            </div>
          </div>
          <button type="button" id="cw-close" aria-label="Close assistant">✕</button>
        </div>
        <div id="cw-msgs" aria-live="polite"></div>
        <div id="cw-quick"></div>
        <form id="cw-form">
          <input id="cw-input" type="text" placeholder="Try: dbq, period 3, dashboard…" autocomplete="off" />
          <button type="submit" id="cw-send" aria-label="Send">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
          </button>
        </form>
      </div>`;
    document.body.append(tpl.content);

    els = {
      bubble: document.getElementById("cw-bubble"),
      window: document.getElementById("cw-window"),
      msgs: document.getElementById("cw-msgs"),
      quick: document.getElementById("cw-quick"),
      input: document.getElementById("cw-input"),
      form: document.getElementById("cw-form"),
      close: document.getElementById("cw-close"),
    };

    els.bubble.addEventListener("click", toggle);
    els.close.addEventListener("click", toggle);
    els.form.addEventListener("submit", (e) => {
      e.preventDefault();
      send();
    });
  }

  function toggle() {
    opened = !opened;
    els.window.classList.toggle("open", opened);
    els.bubble.setAttribute("aria-expanded", opened ? "true" : "false");
    els.window.setAttribute("aria-hidden", opened ? "false" : "true");

    if (opened && els.msgs.children.length === 0) {
      restoreConversation();
    }
    if (opened) {
      setTimeout(() => els.input.focus(), 200);
    }
  }

  function restoreConversation() {
    const hist = loadHistory();
    if (!hist.length) {
      addMsg("bot", GREETING);
      setChips(GREETING_CHIPS);
      return;
    }
    hist.forEach((entry) => renderMsgRow(entry.who, entry.html, false));
    const lastBot = [...hist].reverse().find((e) => e.who === "bot");
    if (lastBot && lastBot.html.includes("Commands I understand")) {
      setChips(CHIP_MAP.Help.chips);
    } else {
      setChips(FALLBACK_CHIPS);
    }
  }

  function addMsg(who, html) {
    renderMsgRow(who, html, true);
  }

  function setChips(chips) {
    els.quick.innerHTML = "";
    if (!chips || !chips.length) return;
    chips.forEach((label) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cw-chip";
      btn.textContent = label;
      btn.addEventListener("click", () => process(label));
      els.quick.appendChild(btn);
    });
  }

  function send() {
    const text = els.input.value.trim();
    if (!text) return;
    els.input.value = "";
    process(text);
  }

  function escapeHtml(value) {
    const d = document.createElement("div");
    d.textContent = String(value ?? "");
    return d.innerHTML;
  }

  function findMatch(text) {
    const trimmed = text.trim();
    if (CHIP_MAP[trimmed]) return { ...CHIP_MAP[trimmed], key: "chip:" + trimmed };

    const lower = trimmed.toLowerCase();

    const periodMatch = lower.match(/period\s*(\d)/);
    if (periodMatch) {
      const n = periodMatch[1];
      const key = "Period " + n;
      if (CHIP_MAP[key]) return { ...CHIP_MAP[key], key: "chip:" + key };
    }

    let best = null;
    let bestLen = 0;
    let bestKeyword = "";
    for (const r of RESPONSES) {
      for (const k of r.keywords) {
        if (lower.includes(k) && k.length > bestLen) {
          bestLen = k.length;
          best = r;
          bestKeyword = k;
        }
      }
    }
    if (best) return { ...best, key: "kw:" + bestKeyword };
    return null;
  }

  function pickAnswer(matched) {
    if (!matched) {
      const key = "fallback";
      if (lastResponseKey === key) {
        responseVariantIndex[key] = ((responseVariantIndex[key] || 0) + 1) % FALLBACK_ALTERNATES.length;
      } else {
        responseVariantIndex[key] = 0;
      }
      lastResponseKey = key;
      return {
        answer: FALLBACK_ALTERNATES[responseVariantIndex[key]],
        chips: FALLBACK_CHIPS,
      };
    }

    const key = matched.key || "generic";
    const pool = matched.alternates ? [matched.answer, ...matched.alternates] : [matched.answer];
    if (lastResponseKey !== key) {
      responseVariantIndex[key] = 0;
    } else if (pool.length > 1) {
      responseVariantIndex[key] = ((responseVariantIndex[key] || 0) + 1) % pool.length;
    } else {
      responseVariantIndex[key] = 0;
    }
    lastResponseKey = key;
    return { ...matched, answer: pool[responseVariantIndex[key]] };
  }

  function process(text) {
    addMsg("user", text);
    setChips([]);

    const matched = findMatch(text);

    setTimeout(() => {
      const resolved = pickAnswer(matched);
      if (matched) {
        addMsg("bot", resolved.answer);
        setChips(resolved.chips || matched.chips || []);
        if (matched.openSettings) {
          setTimeout(() => {
            if (typeof window.openUnifiedSettings === "function") {
              window.openUnifiedSettings();
            } else {
              window.location.href = PAGES.settings;
            }
          }, 700);
        } else if (matched.navigate) {
          setTimeout(() => {
            window.location.href = matched.navigate;
          }, 700);
        }
      } else {
        addMsg("bot", resolved.answer);
        setChips(resolved.chips || FALLBACK_CHIPS);
      }
    }, 280);
  }

  function init() {
    mountWidget();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.APUSHSiteAssistant = { process, toggle, CHIP_MAP, RESPONSES };
})();
