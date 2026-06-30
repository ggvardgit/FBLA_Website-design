/**
 * Helpers for APUSH pre-built prompt bank (DBQ / LEQ / SAQ / supplemental).
 */
(function () {
  const bank = () => window.APUSH_PROMPT_BANK || { dbqs: [], leqs: [], saqs: [], supplemental: [] };

  function byPeriod(items, period) {
    const p = String(period);
    if (p === "all") return items;
    return items.filter((item) => String(item.period) === p);
  }

  function pick(items, seed) {
    if (!items.length) return null;
    if (seed == null) return items[Math.floor(Math.random() * items.length)];
    const n = Math.abs(Number(seed)) || 0;
    return items[n % items.length];
  }

  function getDbq(period, seed) {
    const list = byPeriod(bank().dbqs, period);
    return pick(list, seed) || pick(bank().dbqs, seed);
  }

  function getLeq(period, seed) {
    const list = byPeriod(bank().leqs, period);
    return pick(list, seed) || pick(bank().leqs, seed);
  }

  function getSaqsForPeriod(period) {
    const list = byPeriod(bank().saqs, period);
    return list.length ? list : bank().saqs;
  }

  function dbqPrompt(period) {
    const item = getDbq(period);
    return item ? item.prompt : null;
  }

  function dbqSources(period) {
    const item = getDbq(period);
    if (!item || !item.sources) return [];
    return item.sources.slice(0, 6);
  }

  function leqPrompt(period) {
    const item = getLeq(period);
    return item ? item.prompt : null;
  }

  function buildLegacySourceTexts(sources) {
    const map = {};
    sources.forEach((s) => {
      map[s.title] = s.fullText || s.excerpt || "";
    });
    return map;
  }

  window.APUSHPromptBank = {
    bank,
    getDbq,
    getLeq,
    getSaqsForPeriod,
    dbqPrompt,
    dbqSources,
    leqPrompt,
    buildLegacySourceTexts,
    byPeriod,
  };
})();
