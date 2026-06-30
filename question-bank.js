/**
 * Organized catalog of pre-built DBQ / LEQ / SAQ / supplemental questions.
 */
document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("question-bank-root");
  if (!root || !window.APUSH_PROMPT_BANK) return;

  const bank = window.APUSH_PROMPT_BANK;
  const tabs = root.querySelectorAll("[data-bank-tab]");
  const panels = document.querySelectorAll("#question-bank-panels [data-bank-panel]");
  const search = document.getElementById("question-bank-search");
  let activeTab = "dbq";

  function escapeHtml(v) {
    const d = document.createElement("div");
    d.textContent = String(v ?? "");
    return d.innerHTML;
  }

  function renderDbqCard(item) {
    const sources = (item.sources || []).slice(0, 6);
    const hasRealSourceText = sources.some((source) => {
      const title = String(source?.title || "");
      const excerpt = String(source?.excerpt || "");
      return !/^Document\s+\d+/i.test(title) && !/Evidence excerpt/i.test(excerpt);
    });
    return `
      <article class="qb-card qb-card--dbq" data-period="${item.period}">
        <header class="qb-card__head">
          <span class="qb-card__badge">Period ${escapeHtml(item.period)}</span>
          <span class="qb-card__id">${escapeHtml(item.id)}</span>
        </header>
        <h3 class="qb-card__title">${escapeHtml(item.label || "Document-Based Question")}</h3>
        <p class="qb-card__prompt">${escapeHtml(item.prompt)}</p>
        <p class="qb-card__meta">6-document source set · ${item.points || 7} points</p>
        <div class="qb-card__actions">
          <button type="button" class="submit-btn qb-action-btn" data-qb-action="dbq" data-qb-id="${escapeHtml(item.id)}">Practice This DBQ</button>
        </div>
        ${hasRealSourceText ? `
        <div class="qb-source-grid">
          ${sources
            .map(
              (s, i) => `
            <details class="qb-source" ${i === 0 ? "open" : ""}>
              <summary>Doc ${i + 1}: ${escapeHtml(s.title)}</summary>
              <p class="qb-source__type">${escapeHtml(s.source)}</p>
              <p class="qb-source__excerpt">${escapeHtml(s.excerpt)}</p>
            </details>`
            )
            .join("")}
        </div>
        ` : `<p class="qb-card__hint">Use "Practice This DBQ" to load the full document packet in the DBQ modal.</p>`}
      </article>`;
  }

  function renderLeqCard(item) {
    return `
      <article class="qb-card qb-card--leq" data-period="${item.period}">
        <header class="qb-card__head">
          <span class="qb-card__badge">Period ${escapeHtml(item.period)}</span>
          <span class="qb-card__id">${escapeHtml(item.id)}</span>
        </header>
        <p class="qb-card__prompt">${escapeHtml(item.prompt)}</p>
        <p class="qb-card__meta">LEQ · ${item.points || 6} points</p>
        <div class="qb-card__actions">
          <button type="button" class="submit-btn qb-action-btn" data-qb-action="leq" data-qb-id="${escapeHtml(item.id)}">Start LEQ Practice</button>
        </div>
      </article>`;
  }

  function renderSaqCard(item) {
    return `
      <article class="qb-card qb-card--saq" data-period="${item.period}">
        <header class="qb-card__head">
          <span class="qb-card__badge">Period ${escapeHtml(item.period)}</span>
          <span class="qb-card__id">${escapeHtml(item.id)}</span>
        </header>
        <p class="qb-card__prompt"><strong>${escapeHtml(item.prompt)}</strong></p>
        <p class="qb-card__question">${escapeHtml(item.question)}</p>
        <div class="qb-card__actions">
          <button type="button" class="submit-btn qb-action-btn" data-qb-action="saq" data-qb-id="${escapeHtml(item.id)}">Open SAQ Drill</button>
        </div>
      </article>`;
  }

  function renderSupCard(item) {
    return `
      <article class="qb-card qb-card--sup" data-period="${item.period}" data-skill="${escapeHtml(item.skill)}">
        <header class="qb-card__head">
          <span class="qb-card__badge">P${escapeHtml(item.period)} · ${escapeHtml(item.skill)}</span>
          <span class="qb-card__id">${escapeHtml(item.id)}</span>
        </header>
        <p class="qb-card__question">${escapeHtml(item.question)}</p>
        <p class="qb-card__source"><strong>Source:</strong> ${escapeHtml(item.source)} <span class="qb-card__source-type">(${escapeHtml(item.sourceType)})</span></p>
        <p class="qb-card__hint">${escapeHtml(item.answerHint)}</p>
        <div class="qb-card__actions">
          <button type="button" class="submit-btn qb-action-btn" data-qb-action="supplemental" data-qb-id="${escapeHtml(item.id)}">Use This Prompt</button>
        </div>
      </article>`;
  }

  function getSupplementalBySkill(skill) {
    return (bank.supplemental || []).filter((item) => String(item?.skill || "").toLowerCase() === skill);
  }

  function fillPanel(name) {
    const panel = document.querySelector(`#question-bank-panels [data-bank-panel="${name}"]`);
    if (!panel || panel.dataset.filled === "true") return;
    let html = "";
    if (name === "dbq") html = bank.dbqs.map(renderDbqCard).join("");
    if (name === "leq") html = bank.leqs.map(renderLeqCard).join("");
    if (name === "saq") html = bank.saqs.map(renderSaqCard).join("");
    if (name === "supplemental") {
      html = (bank.supplemental || [])
        .filter((item) => String(item?.skill || "").toLowerCase() !== "mcq")
        .map(renderSupCard)
        .join("");
    }
    panel.innerHTML = html || "<p class=\"qb-empty\">No items in this bank.</p>";
    panel.dataset.filled = "true";
  }

  function switchTab(target) {
    activeTab = target;
    tabs.forEach((t) => {
      const on = t.getAttribute("data-bank-tab") === target;
      t.classList.toggle("qb-tab--active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    panels.forEach((p) => {
      const on = p.getAttribute("data-bank-panel") === target;
      p.hidden = !on;
      p.classList.toggle("qb-panel--active", on);
      if (on) fillPanel(target);
    });
    applySearch();
  }

  function applySearch() {
    const q = (search?.value || "").trim().toLowerCase();
    const activePanel = document.querySelector(`#question-bank-panels [data-bank-panel="${activeTab}"]`);
    if (!activePanel) return;
    activePanel.querySelectorAll(".qb-card").forEach((card) => {
      const text = card.textContent.toLowerCase();
      card.hidden = q.length > 0 && !text.includes(q);
    });
  }

  function runAction(action, id) {
    const handlers = window.APUSHPromptBankActions || {};
    const invoke = () => {
      if (action === "dbq" && typeof handlers.openDbqById === "function") {
        handlers.openDbqById(id);
        return true;
      }
      if (action === "leq" && typeof handlers.openLeqById === "function") {
        handlers.openLeqById(id);
        return true;
      }
      if (action === "saq" && typeof handlers.openSaqById === "function") {
        handlers.openSaqById(id);
        return true;
      }
      if (action === "supplemental" && typeof handlers.openSupplementalById === "function") {
        handlers.openSupplementalById(id);
        return true;
      }
      return false;
    };

    if (invoke()) return;

    document.addEventListener(
      "apush-qb-actions-ready",
      () => {
        if (!invoke()) {
          window.alert("Practice tools could not load. Please refresh the page and try again.");
        }
      },
      { once: true }
    );
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      switchTab(tab.getAttribute("data-bank-tab"));
    });
  });

  root.addEventListener("click", (event) => {
    const btn = event.target.closest(".qb-action-btn");
    if (!btn) return;
    runAction(btn.getAttribute("data-qb-action"), btn.getAttribute("data-qb-id"));
  });

  if (search) search.addEventListener("input", applySearch);
  switchTab("dbq");

  const stats = document.getElementById("question-bank-stats");
  if (stats) {
    const supplementalFrq = (bank.supplemental || []).filter(
      (item) => String(item?.skill || "").toLowerCase() !== "mcq"
    ).length;
    stats.textContent = `${bank.dbqs.length} DBQs · ${bank.leqs.length} LEQs · ${bank.saqs.length} SAQs · ${supplementalFrq} supplemental FRQ`;
  }
});
