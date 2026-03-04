const els = {
  q: document.querySelector("#q"),
  lang: document.querySelector("#lang"),
  perPage: document.querySelector("#perPage"),
  yearMin: document.querySelector("#yearMin"),
  yearMax: document.querySelector("#yearMax"),
  srcWiki: document.querySelector("#srcWiki"),
  srcOpenAlex: document.querySelector("#srcOpenAlex"),
  srcCrossref: document.querySelector("#srcCrossref"),
  btnSearch: document.querySelector("#btnSearch"),
  btnClear: document.querySelector("#btnClear"),
  status: document.querySelector("#status"),
  results: document.querySelector("#results"),
  suggestBox: document.querySelector("#suggestBox"),
  suggestions: document.querySelector("#suggestions"),
  detail: document.querySelector("#detail"),
  btnCopyApa: document.querySelector("#btnCopyApa"),
  btnCopyNotes: document.querySelector("#btnCopyNotes"),
  tabs: Array.from(document.querySelectorAll(".tab")),
  bubbles: Array.from(document.querySelectorAll(".bubble")),
  viewSearch: document.querySelector("#view-search"),
  viewNotes: document.querySelector("#view-notes"),
  viewAi: document.querySelector("#view-ai"),
  viewImages: document.querySelector("#view-images"),
  viewConnexes: document.querySelector("#view-connexes"),
  viewHistory: document.querySelector("#view-history"),

  notesArea: document.querySelector("#notesTextArea"),
  btnNotesCopy: document.querySelector("#btnNotesCopy"),
  btnNotesClear: document.querySelector("#btnNotesClear"),
  btnInsertSummary: document.querySelector("#btnInsertSummary"),
  btnInsertApa: document.querySelector("#btnInsertApa"),
  btnInsertAutoNotes: document.querySelector("#btnInsertAutoNotes"),
  btnGoSearch: document.querySelector("#btnGoSearch"),

  aiQ: document.querySelector("#aiQ"),
  aiUseSelected: document.querySelector("#aiUseSelected"),
  aiUseAll: document.querySelector("#aiUseAll"),
  aiUseNotes: document.querySelector("#aiUseNotes"),
  aiAutoSearch: document.querySelector("#aiAutoSearch"),
  aiAutoLimit: document.querySelector("#aiAutoLimit"),
  btnAiAsk: document.querySelector("#btnAiAsk"),
  btnAiCopy: document.querySelector("#btnAiCopy"),
  btnAiClear: document.querySelector("#btnAiClear"),
  btnAiToNotes: document.querySelector("#btnAiToNotes"),
  aiOut: document.querySelector("#aiOut"),
  aiModeQuestions: document.querySelector("#aiModeQuestions"),
  aiModeExtraits: document.querySelector("#aiModeExtraits"),
  aiExcerptBox: document.querySelector("#aiExcerptBox"),
  aiExcerpt: document.querySelector("#aiExcerpt"),
  aiForPodcast: document.querySelector("#aiForPodcast"),
  aiAudience: document.querySelector("#aiAudience"),
  bibAuthor: document.querySelector("#bibAuthor"),
  bibYear: document.querySelector("#bibYear"),
  bibTitle: document.querySelector("#bibTitle"),
  bibUrl: document.querySelector("#bibUrl"),
  btnAiAnalyze: document.querySelector("#btnAiAnalyze"),

  btnConnexesToSearch: document.querySelector("#btnConnexesToSearch"),
  connexesFromQuery: document.querySelector("#connexesFromQuery"),
  connexesFromSelected: document.querySelector("#connexesFromSelected"),
  connexesRecent: document.querySelector("#connexesRecent"),

  btnHistoryClear: document.querySelector("#btnHistoryClear"),
  btnHistoryToSearch: document.querySelector("#btnHistoryToSearch"),
  historyList: document.querySelector("#historyList"),

  // Images
  imgQ: document.querySelector("#imgQ"),
  imgSrcWiki: document.querySelector("#imgSrcWiki"),
  imgSrcCommons: document.querySelector("#imgSrcCommons"),
  imgSrcOpenverse: document.querySelector("#imgSrcOpenverse"),
  imgSrcLoC: document.querySelector("#imgSrcLoC"),
  imgSrcMet: document.querySelector("#imgSrcMet"),
  imgSrcArtic: document.querySelector("#imgSrcArtic"),
  imgSrcNasa: document.querySelector("#imgSrcNasa"),
  imgPerPage: document.querySelector("#imgPerPage"),
  btnImgSearch: document.querySelector("#btnImgSearch"),
  btnImgClear: document.querySelector("#btnImgClear"),
  imgStatus: document.querySelector("#imgStatus"),
  imgResults: document.querySelector("#imgResults"),
  imgUrl: document.querySelector("#imgUrl"),
  imgFile: document.querySelector("#imgFile"),
  btnImgReverse: document.querySelector("#btnImgReverse"),
  btnOpenTinEye: document.querySelector("#btnOpenTinEye"),
  btnMakeTempUrl: document.querySelector("#btnMakeTempUrl"),
  imgReverseLinks: document.querySelector("#imgReverseLinks"),
  imgPreview: document.querySelector("#imgPreview"),
};

/** @typedef {"wikipedia"|"openalex"|"crossref"} Source */

const state = {
  activeTab: /** @type {"all"|Source} */ ("all"),
  selected: null,
  lastQuery: "",
  results: /** @type {Array<any>} */ ([]),
  controllers: /** @type {AbortController[]} */ ([]),
  view: /** @type {"search"|"images"|"ai"|"notes"|"connexes"|"history"} */ ("search"),
  history: /** @type {Array<{key:string,title:string,source:Source,url?:string,year?:string,when:number}>} */ ([]),
  lastAiAnswer: "",
  aiMode: /** @type {"questions"|"extraits"} */ ("questions"),
  img: {
    results: /** @type {Array<any>} */ ([]),
    query: "",
    fileHash: "",
  },
};

const CACHE_KEY = "shsearch.cache.v1";
const cache = loadCache();
const NOTES_KEY = "mugueteye.notes.v1";

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return { recent: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { recent: [] };
    if (!Array.isArray(parsed.recent)) parsed.recent = [];
    return parsed;
  } catch {
    return { recent: [] };
  }
}

function saveCache() {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore
  }
}

function setStatus(text) {
  els.status.textContent = text;
}

function toast(msg) {
  let t = document.querySelector(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  window.clearTimeout(toast._tid);
  toast._tid = window.setTimeout(() => t.classList.remove("show"), 1200);
}

function setView(next) {
  const v = next || "search";
  state.view = v;
  if (els.viewSearch) els.viewSearch.hidden = v !== "search";
  if (els.viewNotes) els.viewNotes.hidden = v !== "notes";
  if (els.viewAi) els.viewAi.hidden = v !== "ai";
  if (els.viewImages) els.viewImages.hidden = v !== "images";
  if (els.viewConnexes) els.viewConnexes.hidden = v !== "connexes";
  if (els.viewHistory) els.viewHistory.hidden = v !== "history";

  for (const b of els.bubbles || []) {
    const is = b.dataset.view === v;
    b.classList.toggle("active", is);
    if (is) b.setAttribute("aria-current", "page");
    else b.removeAttribute("aria-current");
  }

  const hash = `#${v}`;
  if (location.hash !== hash) history.replaceState(null, "", hash);

  if (v === "connexes") renderConnexes();
  if (v === "history") renderHistory();
  if (v === "images") {
    // keep the image query in sync with the main query if empty
    if (els.imgQ && !normalizeSpace(els.imgQ.value)) els.imgQ.value = normalizeSpace(els.q?.value || "");
    renderImageResults();
    renderReverseLinks();
  }
}

function loadNotes() {
  try {
    return localStorage.getItem(NOTES_KEY) || "";
  } catch {
    return "";
  }
}

function saveNotes(text) {
  try {
    localStorage.setItem(NOTES_KEY, text);
  } catch {
    // ignore
  }
}

function getSettings() {
  const perPage = clampInt(parseInt(els.perPage.value, 10), 1, 50, 10);
  const yearMin = parseMaybeInt(els.yearMin.value);
  const yearMax = parseMaybeInt(els.yearMax.value);
  const lang = els.lang.value === "en" ? "en" : "fr";
  return {
    perPage,
    yearMin,
    yearMax,
    lang,
    sources: {
      wikipedia: !!els.srcWiki.checked,
      openalex: !!els.srcOpenAlex.checked,
      crossref: !!els.srcCrossref.checked,
    },
  };
}

function parseMaybeInt(v) {
  const s = String(v || "").trim();
  if (!s) return null;
  const n = parseInt(s, 10);
  if (!Number.isFinite(n)) return null;
  return n;
}

function firstNonEmpty(...vals) {
  for (const v of vals) {
    const t = normalizeSpace(v);
    if (t) return t;
  }
  return "";
}

function clampInt(n, min, max, fallback) {
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeSpace(s) {
  return String(s || "").replace(/\s+/g, " ").trim();
}

function truncate(s, n) {
  const t = normalizeSpace(s);
  if (t.length <= n) return t;
  return t.slice(0, n - 1).trimEnd() + "…";
}

function toTitleCaseMaybe(s) {
  const t = normalizeSpace(s);
  if (!t) return "";
  return t;
}

// ---------- Text tools (no paid AI) ----------

const STOP_FR = new Set([
  "a",
  "à",
  "alors",
  "au",
  "aucun",
  "aussi",
  "autre",
  "avant",
  "avec",
  "avoir",
  "bon",
  "car",
  "ce",
  "cela",
  "ces",
  "ceux",
  "chaque",
  "ci",
  "comme",
  "comment",
  "dans",
  "de",
  "des",
  "du",
  "dedans",
  "depuis",
  "devrait",
  "doit",
  "donc",
  "dos",
  "début",
  "elle",
  "elles",
  "en",
  "encore",
  "essai",
  "est",
  "et",
  "eu",
  "fait",
  "faites",
  "fois",
  "font",
  "force",
  "hors",
  "ici",
  "il",
  "ils",
  "je",
  "juste",
  "la",
  "le",
  "les",
  "leur",
  "là",
  "ma",
  "maintenant",
  "mais",
  "mes",
  "mine",
  "moins",
  "mon",
  "mot",
  "même",
  "ni",
  "nommés",
  "notre",
  "nous",
  "nouveaux",
  "ou",
  "où",
  "par",
  "parce",
  "parole",
  "pas",
  "personnes",
  "peut",
  "peu",
  "pièce",
  "plupart",
  "pour",
  "pourquoi",
  "quand",
  "que",
  "quel",
  "quelle",
  "quelles",
  "quels",
  "qui",
  "sa",
  "sans",
  "ses",
  "seulement",
  "si",
  "sien",
  "son",
  "sont",
  "sous",
  "soyez",
  "sur",
  "ta",
  "tandis",
  "tellement",
  "tels",
  "tes",
  "ton",
  "tous",
  "tout",
  "trop",
  "très",
  "tu",
  "un",
  "une",
  "vos",
  "votre",
  "vous",
  "vu",
  "ça",
  "étaient",
  "état",
  "étions",
  "été",
  "être",
]);

const STOP_EN = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "have",
  "he",
  "her",
  "his",
  "i",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "or",
  "she",
  "that",
  "the",
  "their",
  "them",
  "they",
  "this",
  "to",
  "was",
  "were",
  "with",
  "you",
  "your",
]);

function tokenize(text) {
  const t = String(text || "")
    .toLowerCase()
    .replace(/[’'"]/g, " ")
    .replace(/[^a-zàâçéèêëîïôùûüÿñæœ0-9\s-]/gi, " ");
  return t.split(/\s+/).filter(Boolean);
}

function tokenizeForSearch(text, lang) {
  const stop = lang === "en" ? STOP_EN : STOP_FR;
  return tokenize(text).filter((w) => w.length >= 3 && !stop.has(w));
}

function keywordCandidates(text, lang) {
  const stop = lang === "en" ? STOP_EN : STOP_FR;
  const tokens = tokenize(text).filter((w) => w.length >= 4 && !stop.has(w));
  const freq = new Map();
  for (const w of tokens) freq.set(w, (freq.get(w) || 0) + 1);
  return [...freq.entries()].sort((a, b) => b[1] - a[1]);
}

function extractKeywords(text, lang, n = 10) {
  const ranked = keywordCandidates(text, lang);
  const out = [];
  for (const [w] of ranked) {
    if (!out.includes(w)) out.push(w);
    if (out.length >= n) break;
  }
  return out;
}

function splitSentences(text) {
  const t = normalizeSpace(text);
  if (!t) return [];
  // keep it simple; works ok for FR/EN.
  return t
    .split(/(?<=[\.\!\?])\s+(?=[A-ZÀÂÇÉÈÊËÎÏÔÙÛÜŸ])/g)
    .map((s) => s.trim())
    .filter((s) => s.length >= 25);
}

function extractYears(text) {
  const t = String(text || "");
  const ys = new Set();
  for (const m of t.matchAll(/\b(19\d{2}|20\d{2})\b/g)) ys.add(m[1]);
  return [...ys].sort();
}

function containsUrl(text) {
  return /https?:\/\/\S+/i.test(String(text || ""));
}

function tfidfRankSentences(question, blocks, lang, max = 6) {
  const qTokens = tokenizeForSearch(question, lang);
  if (!qTokens.length) return [];

  const sentences = [];
  for (const b of blocks) {
    for (const s of splitSentences(b.text)) {
      sentences.push({ s, from: b.title });
    }
  }
  if (!sentences.length) return [];

  const docs = sentences.map((x) => tokenizeForSearch(x.s, lang));
  const df = new Map();
  for (const toks of docs) {
    const uniq = new Set(toks);
    for (const w of uniq) df.set(w, (df.get(w) || 0) + 1);
  }
  const N = docs.length;
  const idf = (w) => Math.log((N + 1) / ((df.get(w) || 0) + 1)) + 1;

  const scored = sentences.map((x, i) => {
    const toks = docs[i];
    if (!toks.length) return { ...x, score: 0 };
    const tf = new Map();
    for (const w of toks) tf.set(w, (tf.get(w) || 0) + 1);
    let score = 0;
    let hits = 0;
    for (const q of qTokens) {
      const c = tf.get(q) || 0;
      if (c) {
        hits++;
        score += (1 + Math.log(c)) * idf(q);
      }
    }
    // Normalize by length; boost denser sentences
    score = score / Math.sqrt(toks.length);
    if (hits >= 2) score *= 1.15;
    // Prefer sentences containing numbers/dates when question is factual
    if (/\b(quand|date|année|combien|pourcentage|statistique|when|year|how many|percent)\b/i.test(question) && /\d/.test(x.s)) {
      score *= 1.12;
    }
    return { ...x, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const picked = scored.filter((x) => x.score > 0).slice(0, max);
  return picked;
}

function extractClaimsToCheck(text, lang, max = 6) {
  const sents = splitSentences(text);
  const out = [];
  for (const s of sents) {
    const hasNumber = /\b\d{1,3}(?:[.,]\d+)?\b/.test(s) || /\b(19\d{2}|20\d{2})\b/.test(s);
    const hasSuperlative = /\b(toujours|jamais|tous|aucun|le meilleur|le pire|always|never|all|none|best|worst)\b/i.test(s);
    const hasCausal = /\b(parce que|donc|cause|entraîne|résulte|because|therefore|leads to|results in)\b/i.test(s);
    if (hasNumber || hasSuperlative || hasCausal) out.push(s);
    if (out.length >= max) break;
  }
  if (!out.length && sents.length) out.push(sents[0]);
  return out.slice(0, max);
}

function summarizeExtractive(text, lang, maxSentences = 3) {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return "";
  if (sentences.length <= maxSentences) return sentences.join(" ");

  const stop = lang === "en" ? STOP_EN : STOP_FR;
  const freq = new Map();
  for (const s of sentences) {
    for (const w of tokenize(s)) {
      if (w.length < 4 || stop.has(w)) continue;
      freq.set(w, (freq.get(w) || 0) + 1);
    }
  }

  const scored = sentences.map((s, idx) => {
    let score = 0;
    for (const w of tokenize(s)) score += freq.get(w) || 0;
    // prefer early sentences slightly (news-like abstracts)
    score *= 1 + Math.max(0, (6 - idx)) * 0.03;
    return { s, idx, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const picked = scored.slice(0, maxSentences).sort((a, b) => a.idx - b.idx).map((x) => x.s);
  return picked.join(" ");
}

function splitParagraphs(text) {
  return String(text || "")
    .split(/\n{2,}/g)
    .map((p) => normalizeSpace(p))
    .filter((p) => p.length >= 30);
}

function ratioAllCaps(text) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  if (!words.length) return 0;
  const caps = words.filter((w) => w.length >= 4 && w === w.toUpperCase() && /[A-ZÀÂÇÉÈÊËÎÏÔÙÛÜŸ]/.test(w)).length;
  return caps / words.length;
}

function detectTone(text, lang) {
  const t = String(text || "");
  const exclam = (t.match(/!/g) || []).length;
  const quest = (t.match(/\?/g) || []).length;
  const capsRatio = ratioAllCaps(t);
  const len = t.length;

  const lex = lang === "en"
    ? {
        conflict: ["fight", "enemy", "attack", "corrupt", "rigged", "lie", "fake", "disaster", "hate"],
        defensive: ["truth", "fact", "hoax", "witch hunt", "unfair"],
        rally: ["together", "great", "win", "strong", "patriot", "proud", "support"],
        fear: ["danger", "crime", "threat", "terror", "invasion"],
      }
    : {
        conflict: ["attaque", "ennemi", "corrompu", "truqué", "mensonge", "fake", "désastre", "haine"],
        defensive: ["vérité", "faits", "canular", "injuste", "chasse aux sorcières"],
        rally: ["ensemble", "grand", "victoire", "fort", "patriote", "fier", "soutien"],
        fear: ["danger", "crime", "menace", "terror", "invasion"],
      };

  const low = t.toLowerCase();
  const score = (arr) => arr.reduce((acc, w) => acc + (low.includes(w) ? 1 : 0), 0);
  const sConflict = score(lex.conflict);
  const sDef = score(lex.defensive);
  const sRally = score(lex.rally);
  const sFear = score(lex.fear);

  const labels = [];
  if (sConflict || exclam >= 3 || capsRatio > 0.05) labels.push(lang === "en" ? "confrontational" : "conflictuel");
  if (sDef) labels.push(lang === "en" ? "defensive" : "défensif");
  if (sRally) labels.push(lang === "en" ? "rallying" : "rassembleur");
  if (sFear) labels.push(lang === "en" ? "fear-evoking" : "inquiétant / alarmiste");
  if (!labels.length) labels.push(lang === "en" ? "neutral / informational" : "plutôt neutre / informatif");

  const cues = [];
  if (exclam) cues.push(`${exclam} !`);
  if (quest) cues.push(`${quest} ?`);
  if (capsRatio > 0.03) cues.push(lang === "en" ? "many ALL‑CAPS words" : "beaucoup de MAJUSCULES");
  if (len < 400) cues.push(lang === "en" ? "short / punchy" : "court / percutant");

  return { labels, cues };
}

function detectStrategies(text, lang) {
  const t = String(text || "");
  const low = t.toLowerCase();
  const strategies = [];

  // repetition: repeated 3+ times of same word (excluding stopwords) or repeated short phrases
  const tokens = tokenize(t).filter((w) => w.length >= 4);
  const freq = new Map();
  for (const w of tokens) freq.set(w, (freq.get(w) || 0) + 1);
  const rep = [...freq.entries()].filter(([, c]) => c >= 4).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([w, c]) => `${w} ×${c}`);
  if (rep.length) strategies.push({ name: lang === "en" ? "Repetition / emphasis" : "Répétition / insistance", evidence: rep.join(", ") });

  if ((t.match(/!/g) || []).length >= 3) strategies.push({ name: lang === "en" ? "Exclamations / escalation" : "Exclamations / dramatisation", evidence: "!" });
  if (ratioAllCaps(t) > 0.04) strategies.push({ name: lang === "en" ? "ALL‑CAPS signaling" : "Signalement en MAJUSCULES", evidence: "MAJUSCULES" });

  const usThem = lang === "en"
    ? (/\b(we|our|us)\b/.test(low) && /\b(they|them|their)\b/.test(low))
    : (/\b(nous|notre|nos)\b/.test(low) && /\b(eux|leur|leurs|ils|elles)\b/.test(low));
  if (usThem) strategies.push({ name: lang === "en" ? "Us vs. them framing" : "Cadrage “nous” vs “eux”", evidence: lang === "en" ? "we/they" : "nous/eux" });

  const slogans = lang === "en"
    ? ["make", "great again", "fake news", "witch hunt"]
    : ["fake news", "rendre", "grand", "encore"];
  const foundSlogans = slogans.filter((s) => low.includes(s)).slice(0, 3);
  if (foundSlogans.length) strategies.push({ name: lang === "en" ? "Slogans / catchphrases" : "Slogans / formules", evidence: foundSlogans.join(", ") });

  const attacks = lang === "en"
    ? ["corrupt", "crooked", "weak", "loser", "liar"]
    : ["corrompu", "faible", "menteur", "honte", "traître"];
  const foundAttacks = attacks.filter((w) => low.includes(w)).slice(0, 4);
  if (foundAttacks.length) strategies.push({ name: lang === "en" ? "Attacks / delegitimization" : "Attaques / délégitimation", evidence: foundAttacks.join(", ") });

  if (!strategies.length) strategies.push({ name: lang === "en" ? "No strong rhetorical markers detected" : "Pas de marqueurs rhétoriques très saillants", evidence: "" });
  return strategies;
}

function detectThemes(text, lang) {
  const low = String(text || "").toLowerCase();
  const themes = lang === "en"
    ? [
        { k: "Immigration / borders", w: ["immigration", "border", "illegal", "migrant", "deport", "asylum"] },
        { k: "Economy / jobs", w: ["economy", "jobs", "inflation", "tax", "wage", "industry", "trade"] },
        { k: "Security / crime", w: ["security", "crime", "police", "terror", "threat", "violence"] },
        { k: "Identity / nation", w: ["nation", "patriot", "identity", "culture", "values", "flag"] },
        { k: "Institutions / democracy", w: ["election", "court", "constitution", "democracy", "institution", "corruption"] },
        { k: "Media / platforms", w: ["media", "press", "fake news", "platform", "social", "facebook", "twitter"] },
      ]
    : [
        { k: "Immigration / frontières", w: ["immigration", "frontière", "illégal", "migrant", "expulsion", "asile"] },
        { k: "Économie / emploi", w: ["économie", "emploi", "inflation", "taxe", "salaire", "industrie", "commerce"] },
        { k: "Sécurité / crime", w: ["sécurité", "crime", "police", "terror", "menace", "violence"] },
        { k: "Identité / nation", w: ["nation", "patriote", "identité", "culture", "valeurs", "drapeau"] },
        { k: "Institutions / démocratie", w: ["élection", "tribunal", "constitution", "démocratie", "institution", "corruption"] },
        { k: "Médias / plateformes", w: ["médias", "presse", "fake news", "plateforme", "réseaux", "facebook", "twitter"] },
      ];

  const scored = themes
    .map((t) => ({ theme: t.k, score: t.w.reduce((acc, w) => acc + (low.includes(w) ? 1 : 0), 0) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  if (scored.length) return scored.map((x) => x.theme);
  const kws = extractKeywords(text, lang, 8);
  return kws.length ? kws.map((k) => (lang === "en" ? `Theme: ${k}` : `Thème: ${k}`)) : [];
}

function buildApaFromBib(settings) {
  const author = normalizeSpace(els.bibAuthor?.value || "");
  const year = normalizeSpace(els.bibYear?.value || "") || "n.d.";
  const title = normalizeSpace(els.bibTitle?.value || "");
  const url = normalizeSpace(els.bibUrl?.value || "");
  if (!author || !title || !url) return null;
  const siteName = ""; // unknown; user can put organization in author
  const apa = apaForWebPage({ author, year, title, siteName, url, retrieved: formatRetrievedToday() });
  const inText = author.includes(",") ? `(${author.split(",")[0]}, ${year})` : `(${author}, ${year})`;
  return { apa, inText };
}

function analyzeExcerpt(text, settings) {
  const lang = settings.lang;
  const corpus = normalizeSpace(text);
  if (!corpus) return "";

  const paras = splitParagraphs(corpus);
  const baseText = paras.length ? paras.join("\n\n") : corpus;
  const kw = extractKeywords(baseText, lang, 12);
  const themes = detectThemes(baseText, lang);
  const tone = detectTone(baseText, lang);
  const strategies = detectStrategies(baseText, lang);
  const years = extractYears(baseText);
  const claims = extractClaimsToCheck(baseText, lang, 6);

  const podcast = !!els.aiForPodcast?.checked;
  const audience = String(els.aiAudience?.value || "general");
  const voice = audience === "academique" ? "académique" : audience === "etudiant" ? "pédagogique" : "grand public";

  const intro = summarizeExtractive(baseText, lang, 1);
  const dev = summarizeExtractive(baseText, lang, 3);
  const concl = summarizeExtractive(baseText, lang, 1);

  const ideas = generateIdeas({ title: "Analyse d'extraits", text: baseText, keywords: kw, lang });

  const lines = [];
  lines.push("Œil vigilant: analyse automatique (locale). Je signale les manques/incohérences potentielles, mais tu dois vérifier les sources.");
  lines.push("");

  if (podcast) {
    lines.push("Résumé exploitable pour un balado (base de script)");
    lines.push(`- Style visé: ${voice}`);
    if (years.length) lines.push(`- Repères temporels détectés: ${years.join(", ")}`);
    lines.push("");
    lines.push("Intro (30–45 s)");
    lines.push(intro ? intro : "(à compléter)");
    lines.push("");
    lines.push("Développement (2–4 min)");
    lines.push(dev ? dev : "(à compléter)");
    lines.push("");
    lines.push("Conclusion (30–45 s)");
    lines.push(concl ? concl : "(à compléter)");
    lines.push("");
    lines.push("Mini‑plan de balado (segments)");
    lines.push("- 0:00 Contexte (qui parle? où? quand? quelle plateforme?)");
    lines.push("- 0:30 Résumé + 2 idées fortes");
    lines.push("- 1:20 Thèmes centraux (avec exemples)");
    lines.push("- 2:20 Ton & stratégies (comment ça persuade?)");
    lines.push("- 3:20 Enjeux/conséquences (plusieurs points de vue)");
    lines.push("- 4:20 Ouverture: questions de recherche + ce qu’il faut vérifier");
    lines.push("");
  } else {
    lines.push("Résumé");
    lines.push(summarizeExtractive(baseText, lang, 4) || "(à compléter)");
    lines.push("");
  }

  lines.push("Analyse du contenu");
  lines.push(`- Thèmes majeurs: ${themes.length ? themes.join(", ") : "(non détectés — ajoute du contexte)"}`);
  lines.push(`- Ton (indices): ${tone.labels.join(", ")}${tone.cues.length ? ` — ${tone.cues.join(" · ")}` : ""}`);
  lines.push("- Stratégies de communication (indices):");
  for (const s of strategies.slice(0, 6)) lines.push(`  - ${s.name}${s.evidence ? `: ${s.evidence}` : ""}`);
  lines.push("");

  lines.push("Œil vigilant: points à vérifier (claims)");
  for (const c of claims) lines.push(`- ${c}`);
  lines.push("");

  lines.push("Œil vigilant: informations manquantes (si applicable)");
  const miss = [];
  if (!years.length) miss.push(lang === "en" ? "No date/year detected" : "Aucune date/année détectée");
  if (!containsUrl(baseText)) miss.push(lang === "en" ? "No source URL in the pasted text" : "Aucune URL de source dans le texte collé");
  if (!miss.length) miss.push(lang === "en" ? "No obvious missing metadata detected" : "Pas de manque évident détecté");
  for (const m of miss) lines.push(`- ${m}`);
  lines.push("");

  lines.push("Problématiques (sciences humaines)");
  for (const p of ideas.problematiques.slice(0, 6)) lines.push(`- ${p}`);
  lines.push("");

  lines.push("Conséquences et enjeux (points de vue)");
  const views = lang === "en"
    ? [
        "Partisans: legitimacy, authenticity, mobilization",
        "Opponents: polarization, misinformation, harm to institutions",
        "Researchers: effects on trust, agenda-setting, platform dynamics",
        "Journalists: verification constraints, amplification, framing",
      ]
    : [
        "Partisans: authenticité, mobilisation, sentiment de représentation",
        "Opposants: polarisation, désinformation, délégitimation des institutions",
        "Chercheurs: effets sur la confiance, l’agenda médiatique, dynamique des plateformes",
        "Journalistes: vérification, amplification involontaire, cadrage",
      ];
  for (const v of views) lines.push(`- ${v}`);
  lines.push("");

  lines.push("Pistes de solutions / réflexion (à discuter)");
  const sol = lang === "en"
    ? [
        "Media literacy: how to verify and contextualize excerpts",
        "Platform governance: transparency, moderation, recommendation systems",
        "Journalism: slow news, context boxes, corrections",
        "Research: triangulate sources, compare across platforms and time",
      ]
    : [
        "Éducation aux médias: vérifier, contextualiser, dater les extraits",
        "Gouvernance des plateformes: transparence, modération, recommandations",
        "Journalisme: formats lents, encadrés de contexte, corrections visibles",
        "Recherche: trianguler les sources, comparer plateformes et périodes",
      ];
  for (const s of sol) lines.push(`- ${s}`);
  lines.push("");

  lines.push("Citations / APA 7 (si données fournies)");
  const bib = buildApaFromBib(settings);
  if (bib) {
    lines.push(`- Référence APA 7: ${bib.apa}`);
    lines.push(`- Citation dans le texte: ${bib.inText}`);
  } else {
    lines.push("- Je garde un œil: il manque au moins auteur/organisation, titre, URL/source (et idéalement l’année) pour générer une référence APA fiable.");
  }
  lines.push("Rappel: cite tes sources, et évite le plagiat (paraphrase + référence).");

  return lines.join("\n");
}

function generateIdeas({ title, text, keywords, lang }) {
  const kws = keywords && keywords.length ? keywords : extractKeywords(`${title}\n${text}`, lang, 8);
  const k1 = kws[0] || (lang === "en" ? "this phenomenon" : "ce phénomène");
  const k2 = kws[1] || (lang === "en" ? "social dynamics" : "dynamiques sociales");
  const k3 = kws[2] || (lang === "en" ? "institutions" : "institutions");

  const problematiques = lang === "en"
    ? [
        `To what extent does ${k1} shape ${k2} in specific contexts?`,
        `How do actors negotiate ${k1} within ${k3}, and with what effects?`,
        `What mechanisms explain the link between ${k1} and ${k2}?`,
        `Which groups benefit from or are harmed by ${k1}, and why?`,
      ]
    : [
        `Dans quelle mesure ${k1} transforme ${k2} selon les contextes (âge, classe, genre, territoire) ?`,
        `Comment les acteurs négocient-ils ${k1} au sein des ${k3}, et avec quels effets ?`,
        `Quels mécanismes expliquent le lien entre ${k1} et ${k2} (normes, ressources, rapports de pouvoir) ?`,
        `Qui bénéficie de ${k1} et qui en subit les coûts, et pourquoi ?`,
      ];

  const consequences = lang === "en"
    ? [
        `Social: polarization, inequality, belonging/exclusion around ${k1}.`,
        `Cultural: shifts in representations and narratives linked to ${k2}.`,
        `Political: policy framing, legitimacy conflicts, governance of ${k3}.`,
        `Individual: identity, stress, agency in situations involving ${k1}.`,
      ]
    : [
        `Social: polarisation, inégalités, inclusion/exclusion autour de ${k1}.`,
        `Culturel: transformation des représentations et des récits liés à ${k2}.`,
        `Politique: cadrage des politiques publiques, conflits de légitimité, gouvernance des ${k3}.`,
        `Individuel: identité, stress, marges de manœuvre dans les situations liées à ${k1}.`,
      ];

  const solutions = lang === "en"
    ? [
        `Design a comparative study (cases) to isolate what changes with ${k1}.`,
        `Use mixed methods: interviews + corpus analysis to connect ${k2} and practices.`,
        `Map stakeholders and incentives to understand choices within ${k3}.`,
        `Test interventions/policies and define measurable indicators (before/after).`,
      ]
    : [
        `Faire une comparaison (cas) pour isoler ce qui change avec ${k1}.`,
        `Méthodes mixtes: entretiens + analyse de corpus pour relier ${k2} et pratiques.`,
        `Cartographier acteurs/intérêts pour comprendre les décisions dans les ${k3}.`,
        `Évaluer des dispositifs/politiques avec des indicateurs (avant/après).`,
      ];

  const carrefours = lang === "en"
    ? [
        `Power / inequality`,
        `Norms / deviance`,
        `Identity / recognition`,
        `Institutions / organizations`,
        `Space / territory`,
        `Technology / mediation`,
        `Memory / narrative`,
      ]
    : [
        `Pouvoir / inégalités`,
        `Normes / déviance`,
        `Identité / reconnaissance`,
        `Institutions / organisations`,
        `Espace / territoire`,
        `Technologie / médiation`,
        `Mémoire / récit`,
      ];

  return { problematiques, consequences, solutions, carrefours, kws: kws.slice(0, 10) };
}

// ---------- APA 7 helpers ----------

function formatAuthorApa(name) {
  const t = normalizeSpace(name);
  if (!t) return "";
  // "First Middle Last" -> "Last, F. M."
  const parts = t.split(" ");
  if (parts.length === 1) return parts[0];
  const last = parts[parts.length - 1];
  const firsts = parts.slice(0, -1).map((p) => (p[0] ? p[0].toUpperCase() + "." : "")).join(" ");
  return `${last}, ${firsts}`.trim();
}

function joinAuthorsApa(names) {
  const list = (names || []).filter(Boolean).map(formatAuthorApa).filter(Boolean);
  if (list.length === 0) return "";
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} & ${list[1]}`;
  return `${list.slice(0, -1).join(", ")}, & ${list[list.length - 1]}`;
}

function formatDateY(dateStr) {
  if (!dateStr) return "n.d.";
  const y = String(dateStr).slice(0, 4);
  return /^\d{4}$/.test(y) ? y : "n.d.";
}

function formatRetrievedToday() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const m = d.toLocaleString("fr-FR", { month: "long" });
  const day = d.getDate();
  return `${day} ${m} ${yyyy}`;
}

function normalizeUrlForDedup(url) {
  const u = String(url || "").trim();
  if (!u) return "";
  try {
    const parsed = new URL(u);
    parsed.hash = "";
    if ((parsed.protocol === "http:" && parsed.port === "80") || (parsed.protocol === "https:" && parsed.port === "443")) {
      parsed.port = "";
    }
    const drop = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];
    for (const k of drop) parsed.searchParams.delete(k);
    return parsed.toString();
  } catch {
    return u.replace(/#.*$/, "");
  }
}

function normTitleKey(title) {
  return normalizeSpace(String(title || ""))
    .toLowerCase()
    .replace(/[\u2019']/g, "")
    .replace(/[^a-zàâçéèêëîïôùûüÿñæœ0-9\s-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreResult(r, queryTokens) {
  const title = String(r.title || "");
  const text = String(r.abstract || r.extract || r.snippet || "");
  const tt = tokenize(title).join(" ");
  const tx = tokenize(text).join(" ");

  let tHits = 0;
  let xHits = 0;
  for (const q of queryTokens) {
    if (tt.includes(q)) tHits++;
    if (tx.includes(q)) xHits++;
  }

  const hasRichText = text && text.length >= 700 ? 1 : text && text.length >= 250 ? 0.5 : 0;
  const hasDoi = r.doi ? 1 : 0;
  const hasYear = r.year ? 1 : 0;
  const year = r.year ? parseInt(r.year, 10) : 0;
  const recency = year ? Math.max(0, Math.min(1, (year - 1990) / 40)) : 0;

  const sourceBoost = r.source === "openalex" ? 0.35 : r.source === "crossref" ? 0.25 : 0.0;

  return tHits * 2.4 + xHits * 1.0 + hasRichText * 1.2 + hasDoi * 0.7 + hasYear * 0.2 + recency * 0.6 + sourceBoost;
}

function computeSuggestedKeywords(results, lang, limit = 12) {
  const stop = lang === "en" ? STOP_EN : STOP_FR;
  const freq = new Map();
  for (const r of results) {
    const base = `${r.title || ""}\n${r.abstract || r.extract || r.snippet || ""}`;
    for (const w of tokenize(base)) {
      if (w.length < 4 || stop.has(w)) continue;
      freq.set(w, (freq.get(w) || 0) + 1);
    }
  }
  const ranked = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w);
  const out = [];
  for (const w of ranked) {
    if (out.includes(w)) continue;
    out.push(w);
    if (out.length >= limit) break;
  }
  return out;
}

function renderSuggestions(query, results, settings) {
  if (!els.suggestBox || !els.suggestions) return;
  const qTokens = new Set(tokenizeForSearch(query, settings.lang));
  const kws = computeSuggestedKeywords(results, settings.lang, 14).filter((k) => !qTokens.has(k));

  if (!kws.length) {
    els.suggestBox.style.display = "none";
    els.suggestions.innerHTML = "";
    return;
  }

  els.suggestBox.style.display = "";
  els.suggestions.innerHTML = kws
    .slice(0, 12)
    .map(
      (k) =>
        `<button class="kw" type="button" data-kw="${escapeHtml(k)}" title="Ajouter à la recherche">${escapeHtml(k)}</button>`
    )
    .join("");
}

if (els.suggestions) {
  els.suggestions.addEventListener("click", (e) => {
    const b = e.target.closest("[data-kw]");
    if (!b) return;
    const kw = String(b.dataset.kw || "").trim();
    if (!kw) return;
    const cur = normalizeSpace(els.q.value);
    const next = normalizeSpace(`${cur} ${kw}`);
    if (next === cur) return;
    els.q.value = next;
    runSearch();
  });
}

function apaForWebPage({ author, year, title, siteName, url, retrieved }) {
  const a = author ? author.trim() : "";
  const y = year || "n.d.";
  const t = title ? title.trim() : "";
  const s = siteName ? siteName.trim() : "";
  const r = retrieved || formatRetrievedToday();
  const who = a || s || "Auteur inconnu";
  const titlePart = t ? `${t}.` : "Sans titre.";
  const sitePart = s ? ` ${s}.` : "";
  return `${who}. (${y}). ${titlePart}${sitePart} Consulté le ${r}, sur ${url}`;
}

function apaForArticle({ authors, year, title, container, volume, issue, pages, doi, url }) {
  const a = joinAuthorsApa(authors);
  const y = year || "n.d.";
  const t = title ? title.trim().replace(/\s+/g, " ") : "Sans titre";
  const j = container ? container.trim() : "";
  const vol = volume ? String(volume).trim() : "";
  const iss = issue ? String(issue).trim() : "";
  const pp = pages ? String(pages).trim() : "";
  const volIss = vol ? `, ${vol}${iss ? `(${iss})` : ""}` : "";
  const pagesPart = pp ? `, ${pp}` : "";
  const where = j ? ` *${j}*${volIss}${pagesPart}.` : ".";
  const link = doi ? ` https://doi.org/${doi.replace(/^https?:\/\/(dx\.)?doi\.org\//, "")}` : url ? ` ${url}` : "";
  const who = a || "Auteur inconnu";
  return `${who}. (${y}). ${t}.${where}${link}`.replace(/\s+\./g, ".").replace(/\.\./g, ".");
}

// ---------- Sources ----------

function abortInFlight() {
  for (const c of state.controllers) c.abort();
  state.controllers = [];
}

function createController() {
  const c = new AbortController();
  state.controllers.push(c);
  return c;
}

async function fetchJson(url, signal) {
  const res = await fetch(url, { signal, headers: { "accept": "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

// ---------- Images ----------

function setImgStatus(text) {
  if (els.imgStatus) els.imgStatus.textContent = text;
}

function hamming(a, b) {
  if (!a || !b || a.length !== b.length) return 1e9;
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d;
}

function computeDHashFromCanvas(ctx, w, h) {
  // dHash: 9x8 grayscale compare adjacent columns -> 64 bits
  const img = ctx.getImageData(0, 0, w, h).data;
  const gray = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = img[i];
      const g = img[i + 1];
      const b = img[i + 2];
      gray.push(r * 0.2126 + g * 0.7152 + b * 0.0722);
    }
  }
  let bits = "";
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const left = gray[y * 9 + x];
      const right = gray[y * 9 + x + 1];
      bits += left < right ? "1" : "0";
    }
  }
  return bits;
}

async function dhashFromImageSrc(src) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.decoding = "async";
  img.referrerPolicy = "no-referrer";
  img.src = src;
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = 9;
  canvas.height = 8;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, 9, 8);
  return computeDHashFromCanvas(ctx, 9, 8);
}

async function dhashFromFile(file) {
  const bmp = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = 9;
  canvas.height = 8;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(bmp, 0, 0, 9, 8);
  bmp.close?.();
  return computeDHashFromCanvas(ctx, 9, 8);
}

function renderImageResults() {
  if (!els.imgResults) return;
  const list = state.img?.results || [];
  if (!list.length) {
    els.imgResults.innerHTML = "";
    setImgStatus("Prêt.");
    return;
  }

  els.imgResults.innerHTML = list
    .map((it) => {
      const srcBadge =
        it.source === "commons"
          ? `<span class="badge">Commons</span>`
          : it.source === "openverse"
            ? `<span class="badge">Openverse</span>`
            : it.source === "loc"
              ? `<span class="badge">LoC</span>`
              : `<span class="badge ok">Wikipedia</span>`;
      const title = it.title || "Sans titre";
      const sim = Number.isFinite(it.simDist) ? `Sim: ${it.simDist}` : "";
      const sub = [it.pageTitle, it.creator, it.licenseShort, sim].filter(Boolean).join(" · ");
      const thumb = it.thumb || "";
      const openUrl = it.openUrl || it.url || "";
      return `
        <div class="imgCard" tabindex="0" data-open="${escapeHtml(openUrl)}">
          ${thumb ? `<img class="imgThumb" src="${escapeHtml(thumb)}" alt="${escapeHtml(title)}" loading="lazy" />` : `<div class="imgThumb"></div>`}
          <div class="imgMeta">
            <div class="badgeRow">${srcBadge}${it.licenseShort ? `<span class="badge">${escapeHtml(it.licenseShort)}</span>` : ""}</div>
            <div class="imgTitle">${escapeHtml(truncate(title, 70))}</div>
            ${sub ? `<div class="imgSub">${escapeHtml(truncate(sub, 90))}</div>` : ""}
          </div>
        </div>
      `;
    })
    .join("");

  els.imgResults.querySelectorAll("[data-open]").forEach((el) => {
    el.addEventListener("click", () => {
      const u = el.getAttribute("data-open");
      if (u) window.open(u, "_blank", "noopener");
    });
    el.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const u = el.getAttribute("data-open");
      if (u) window.open(u, "_blank", "noopener");
    });
  });
}

async function searchWikipediaImages(query, lang, limit, signal) {
  const base = lang === "en" ? "https://en.wikipedia.org/w/api.php" : "https://fr.wikipedia.org/w/api.php";
  const url =
    `${base}?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}` +
    `&gsrlimit=${limit}&prop=pageimages|info&piprop=thumbnail&pithumbsize=420&inprop=url&format=json&origin=*`;
  const data = await fetchJson(url, signal);
  const pages = Object.values(data?.query?.pages || {});
  return pages
    .filter((p) => p?.thumbnail?.source)
    .map((p) => ({
      source: "wikipedia",
      title: p.title,
      pageTitle: p.title,
      thumb: p.thumbnail.source,
      openUrl: p.fullurl,
      licenseShort: "",
      raw: p,
    }));
}

async function searchCommonsImages(query, limit, signal) {
  const api = "https://commons.wikimedia.org/w/api.php";
  const sUrl = `${api}?action=query&list=search&srnamespace=6&srsearch=${encodeURIComponent(query)}&srlimit=${limit}&format=json&origin=*`;
  const sData = await fetchJson(sUrl, signal);
  const titles = (sData?.query?.search || []).map((x) => x.title).filter(Boolean).slice(0, limit);
  if (!titles.length) return [];

  const t = titles.map(encodeURIComponent).join("|");
  const iUrl =
    `${api}?action=query&titles=${t}` +
    `&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=420&format=json&origin=*`;
  const iData = await fetchJson(iUrl, signal);
  const pages = Object.values(iData?.query?.pages || {});
  return pages
    .map((p) => {
      const ii = p?.imageinfo?.[0];
      const meta = ii?.extmetadata || {};
      const licenseShort = meta?.LicenseShortName?.value ? String(meta.LicenseShortName.value).replace(/<[^>]+>/g, "") : "";
      const descUrl = ii?.descriptionurl || "";
      const url = ii?.url || "";
      const thumb = ii?.thumburl || "";
      return {
        source: "commons",
        title: p?.title?.replace(/^File:/, "") || "Fichier",
        pageTitle: p?.title || "",
        thumb,
        openUrl: descUrl || url,
        licenseShort,
        raw: p,
      };
    })
    .filter((x) => x.thumb);
}

async function searchOpenverseImages(query, limit, signal) {
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=${limit}`;
  const data = await fetchJson(url, signal);
  const items = (data?.results || []).map((r) => ({
    source: "openverse",
    title: r?.title || r?.id || "Image",
    pageTitle: r?.source || "",
    creator: r?.creator || "",
    thumb: r?.thumbnail || r?.url || "",
    openUrl: r?.foreign_landing_url || r?.url || "",
    licenseShort: r?.license ? String(r.license).toUpperCase() : "",
    raw: r,
  }));
  return items.filter((x) => x.thumb && x.openUrl);
}

async function searchLocImages(query, limit, signal) {
  // Library of Congress Pictures search (JSON)
  const url = `https://www.loc.gov/pictures/search/?q=${encodeURIComponent(query)}&fo=json&c=${limit}`;
  const res = await fetch(url, { signal, headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const items = (data?.results || []).map((r) => ({
    source: "loc",
    title: r?.title || "LoC item",
    pageTitle: r?.created_published_date || "",
    creator: r?.creator || "",
    thumb: r?.image?.thumb || r?.image?.square || "",
    openUrl: r?.links?.item || r?.url || "",
    licenseShort: "",
    raw: r,
  }));
  return items.filter((x) => x.thumb && x.openUrl);
}

async function searchMetImages(query, limit, signal) {
  // The Met Collection API (public, no key)
  const sUrl = `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=${encodeURIComponent(query)}`;
  const sRes = await fetch(sUrl, { signal });
  if (!sRes.ok) throw new Error(`HTTP ${sRes.status}`);
  const sData = await sRes.json();
  const ids = (sData?.objectIDs || []).slice(0, Math.min(limit, 30));
  if (!ids.length) return [];

  // Fetch object details (limit concurrency)
  const out = [];
  const concurrency = 6;
  let idx = 0;
  async function worker() {
    while (idx < ids.length) {
      const id = ids[idx++];
      try {
        const oUrl = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`;
        const oRes = await fetch(oUrl, { signal });
        if (!oRes.ok) continue;
        const o = await oRes.json();
        const thumb = o?.primaryImageSmall || o?.primaryImage || "";
        const openUrl = o?.objectURL || "";
        if (!thumb || !openUrl) continue;
        out.push({
          source: "met",
          title: o?.title || `Met object ${id}`,
          pageTitle: o?.objectDate || "",
          creator: o?.artistDisplayName || o?.culture || "",
          thumb,
          openUrl,
          licenseShort: "Public domain",
          raw: o,
        });
      } catch {
        // ignore
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return out.slice(0, limit);
}

async function searchArticImages(query, limit, signal) {
  // Art Institute of Chicago API (no key)
  const url =
    `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(query)}` +
    `&fields=id,title,image_id,artist_title,date_display,thumbnail&limit=${limit}`;
  const data = await fetchJson(url, signal);
  const items = (data?.data || []).map((r) => {
    const imageId = r?.image_id || "";
    if (!imageId) return null;
    const thumb = `https://www.artic.edu/iiif/2/${encodeURIComponent(imageId)}/full/843,/0/default.jpg`;
    const openUrl = `https://www.artic.edu/artworks/${r.id}`;
    return {
      source: "artic",
      title: r?.title || "Artwork",
      pageTitle: r?.date_display || "",
      creator: r?.artist_title || "",
      thumb,
      openUrl,
      licenseShort: "",
      raw: r,
    };
  });
  return items.filter(Boolean);
}

async function searchNasaImages(query, limit, signal) {
  const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image`;
  const data = await fetchJson(url, signal);
  const items = (data?.collection?.items || []).slice(0, limit).map((it) => {
    const d = it?.data?.[0] || {};
    const link = (it?.links || []).find((l) => l?.render === "image") || (it?.links || [])[0];
    const thumb = link?.href || "";
    const openUrl = it?.href || (d?.nasa_id ? `https://images.nasa.gov/details/${encodeURIComponent(d.nasa_id)}` : "");
    return {
      source: "nasa",
      title: d?.title || "NASA image",
      pageTitle: d?.date_created ? String(d.date_created).slice(0, 10) : "",
      creator: d?.photographer || d?.center || "",
      thumb,
      openUrl,
      licenseShort: "",
      raw: it,
    };
  });
  return items.filter((x) => x.thumb && x.openUrl);
}

function renderReverseLinks() {
  if (!els.imgReverseLinks) return;
  const u = normalizeSpace(els.imgUrl?.value || "");
  if (!u) {
    els.imgReverseLinks.innerHTML = `<span class="kw" style="border-style:dashed;">Colle une URL d’image</span>`;
    return;
  }

  const enc = encodeURIComponent(u);
  const links = [
    { name: "TinEye", url: `https://tineye.com/search?url=${enc}` },
    { name: "Google Images", url: `https://www.google.com/searchbyimage?image_url=${enc}` },
    { name: "Google Lens", url: `https://lens.google.com/uploadbyurl?url=${enc}` },
    { name: "Bing", url: `https://www.bing.com/images/search?q=imgurl:${enc}&view=detailv2&iss=sbi&FORM=IRSBIQ` },
  ];

  els.imgReverseLinks.innerHTML = links
    .map((l) => `<a class="kw" href="${escapeHtml(l.url)}" target="_blank" rel="noopener">${escapeHtml(l.name)}</a>`)
    .join("");
}

async function applyLocalSimilarityIfPossible() {
  const fileHash = state.img.fileHash;
  if (!fileHash) return;
  const list = state.img.results || [];
  // Compute hashes for up to 24 thumbs (best effort; CORS may block some sources)
  const slice = list.slice(0, 24);
  await Promise.allSettled(
    slice.map(async (it) => {
      if (!it.thumb) return;
      try {
        const h = await dhashFromImageSrc(it.thumb);
        it.simDist = hamming(fileHash, h);
      } catch {
        it.simDist = undefined;
      }
    })
  );
  list.sort((a, b) => (Number.isFinite(a.simDist) ? a.simDist : 1e9) - (Number.isFinite(b.simDist) ? b.simDist : 1e9));
  state.img.results = list;
  renderImageResults();
}

async function searchWikipedia(query, lang, limit, signal) {
  const base = lang === "en" ? "https://en.wikipedia.org/w/api.php" : "https://fr.wikipedia.org/w/api.php";
  const url = `${base}?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=${limit}&format=json&origin=*`;
  const data = await fetchJson(url, signal);
  const items = (data?.query?.search || []).map((x) => ({
    source: "wikipedia",
    id: String(x.pageid),
    title: x.title,
    snippet: normalizeSpace(String(x.snippet || "").replace(/<[^>]+>/g, "")),
    url: `${base.replace("/w/api.php", "")}/?curid=${x.pageid}`,
    year: null,
    authors: [],
    raw: x,
  }));
  return items;
}

async function wikipediaDetails(pageid, lang, signal) {
  const base = lang === "en" ? "https://en.wikipedia.org/w/api.php" : "https://fr.wikipedia.org/w/api.php";
  const url = `${base}?action=query&prop=extracts|info|revisions&explaintext=1&exintro=0&inprop=url&rvprop=timestamp&pageids=${encodeURIComponent(
    pageid
  )}&format=json&origin=*`;
  const data = await fetchJson(url, signal);
  const page = data?.query?.pages?.[pageid];
  if (!page) return null;
  return {
    title: page.title,
    extract: normalizeSpace(page.extract || ""),
    fullurl: page.fullurl || null,
    timestamp: page?.revisions?.[0]?.timestamp || null,
  };
}

function reconstructOpenAlexAbstract(abstract_inverted_index) {
  if (!abstract_inverted_index || typeof abstract_inverted_index !== "object") return "";
  const positions = [];
  for (const [word, idxs] of Object.entries(abstract_inverted_index)) {
    if (!Array.isArray(idxs)) continue;
    for (const i of idxs) positions.push([i, word]);
  }
  positions.sort((a, b) => a[0] - b[0]);
  return normalizeSpace(positions.map(([, w]) => w).join(" "));
}

async function searchOpenAlex(query, settings, signal) {
  const { perPage, yearMin, yearMax } = settings;
  const filters = [];
  if (yearMin) filters.push(`from_publication_date:${yearMin}-01-01`);
  if (yearMax) filters.push(`to_publication_date:${yearMax}-12-31`);
  const filterStr = filters.length ? `&filter=${encodeURIComponent(filters.join(","))}` : "";
  const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=${perPage}${filterStr}`;
  const data = await fetchJson(url, signal);
  const items = (data?.results || []).map((w) => {
    const year = w?.publication_year ? String(w.publication_year) : w?.publication_date ? formatDateY(w.publication_date) : null;
    const authors =
      (w?.authorships || [])
        .map((a) => a?.author?.display_name)
        .filter(Boolean)
        .slice(0, 8) || [];
    const doi = w?.doi ? String(w.doi).replace(/^https?:\/\/(dx\.)?doi\.org\//, "") : null;
    const container = w?.host_venue?.display_name || "";
    const abstract = reconstructOpenAlexAbstract(w?.abstract_inverted_index);
    const urlBest = w?.primary_location?.landing_page_url || w?.id || (doi ? `https://doi.org/${doi}` : null);
    return {
      source: "openalex",
      id: w?.id || (doi ? `doi:${doi}` : crypto.randomUUID()),
      title: toTitleCaseMaybe(w?.title || "Sans titre"),
      snippet: truncate(abstract || w?.display_name || "", 220),
      url: urlBest,
      year,
      doi,
      authors,
      container,
      abstract,
      raw: w,
    };
  });
  return items;
}

async function searchCrossref(query, settings, signal) {
  const { perPage, yearMin, yearMax } = settings;
  const filters = [];
  if (yearMin) filters.push(`from-pub-date:${yearMin}`);
  if (yearMax) filters.push(`until-pub-date:${yearMax}`);
  const filterStr = filters.length ? `&filter=${encodeURIComponent(filters.join(","))}` : "";
  const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${perPage}${filterStr}`;
  const data = await fetchJson(url, signal);
  const items = (data?.message?.items || []).map((w) => {
    const title = Array.isArray(w?.title) ? w.title[0] : w?.title || "Sans titre";
    const authors =
      (w?.author || [])
        .map((a) => [a?.given, a?.family].filter(Boolean).join(" ").trim())
        .filter(Boolean)
        .slice(0, 8) || [];
    const year = w?.issued?.["date-parts"]?.[0]?.[0] ? String(w.issued["date-parts"][0][0]) : null;
    const container = Array.isArray(w?.["container-title"]) ? w["container-title"][0] : w?.["container-title"] || "";
    const doi = w?.DOI ? String(w.DOI) : null;
    const urlBest = w?.URL || (doi ? `https://doi.org/${doi}` : null);
    const abstract = normalizeSpace(String(w?.abstract || "").replace(/<[^>]+>/g, ""));
    const pages = w?.page ? String(w.page) : "";
    const volume = w?.volume ? String(w.volume) : "";
    const issue = w?.issue ? String(w.issue) : "";
    return {
      source: "crossref",
      id: doi ? `doi:${doi}` : urlBest || crypto.randomUUID(),
      title: toTitleCaseMaybe(title),
      snippet: truncate(abstract || `${container} ${year || ""}`.trim(), 220),
      url: urlBest,
      year,
      doi,
      authors,
      container,
      abstract,
      pages,
      volume,
      issue,
      raw: w,
    };
  });
  return items;
}

// ---------- UI rendering ----------

function badge(source) {
  if (source === "wikipedia") return `<span class="badge ok">Wikipedia</span>`;
  if (source === "openalex") return `<span class="badge">OpenAlex</span>`;
  return `<span class="badge">Crossref</span>`;
}

function renderResults() {
  const tab = state.activeTab;
  const list = tab === "all" ? state.results : state.results.filter((r) => r.source === tab);

  if (!list.length) {
    els.results.innerHTML = `<div class="result"><div class="rTitle">Aucun résultat.</div><div class="rMeta">Essaye une autre requête ou active d’autres sources.</div></div>`;
    return;
  }

  els.results.innerHTML = list
    .map((r) => {
      const isSel = !!(state.selected && r.source === state.selected.source && String(r.id) === String(state.selected.id));
      const metaParts = [];
      if (r.year) metaParts.push(escapeHtml(String(r.year)));
      if (r.authors?.length) metaParts.push(escapeHtml(r.authors.slice(0, 3).join(", ") + (r.authors.length > 3 ? "…" : "")));
      if (r.container) metaParts.push(escapeHtml(String(r.container)));
      if (r.url) metaParts.push(`<a href="${escapeHtml(r.url)}" target="_blank" rel="noopener">ouvrir</a>`);
      return `
        <div class="result ${isSel ? "selected" : ""}" data-source="${escapeHtml(r.source)}" data-id="${escapeHtml(String(r.id))}" tabindex="0">
          <div class="badgeRow">
            ${badge(r.source)}
            ${r.doi ? `<span class="badge warn">DOI</span>` : ""}
          </div>
          <div class="rTitle">${escapeHtml(r.title || "Sans titre")}</div>
          <div class="rMeta">${metaParts.join(" · ")}</div>
          ${r.snippet ? `<div class="rMeta" style="margin-top:8px">${escapeHtml(r.snippet)}</div>` : ""}
        </div>
      `;
    })
    .join("");
}

function renderDetail(item, settings) {
  if (!item) {
    els.detail.className = "detail empty";
    els.detail.innerHTML = `
      <div class="emptyState">
        <div class="emptyTitle">Sélectionne un résultat</div>
        <div class="emptyText">Tu auras un résumé, des idées et la citation APA 7.</div>
      </div>
    `;
    els.btnCopyApa.disabled = true;
    els.btnCopyNotes.disabled = true;
    return;
  }

  const title = item.title || "Sans titre";
  const lang = settings.lang;
  const rawText = normalizeSpace(item.abstract || item.extract || item.snippet || "");
  const summary = rawText ? summarizeExtractive(rawText, lang, 3) : "";
  const keywords = extractKeywords(`${title}\n${rawText}`, lang, 10);
  const ideas = generateIdeas({ title, text: rawText, keywords, lang });

  const apa = buildApa(item, settings);
  const notes = buildNotes({ item, summary, ideas, keywords, apa, lang });

  els.detail.className = "detail";
  els.detail.innerHTML = `
    <div class="section">
      <div class="sectionTitle">Référence</div>
      <div class="sectionBody">
        <div><strong>${escapeHtml(title)}</strong></div>
        <div style="margin-top:6px;color:rgba(245,250,255,0.72);font-size:12px;">
          ${escapeHtml(item.source)}${item.year ? ` · ${escapeHtml(String(item.year))}` : ""}${item.url ? ` · <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener">ouvrir la source</a>` : ""}
        </div>
      </div>
    </div>

    <div class="section">
      <div class="sectionTitle">Résumé (automatique)</div>
      <div class="sectionBody">${escapeHtml(summary || (lang === "en" ? "No text available to summarize." : "Pas assez de texte disponible pour résumer."))}</div>
      <div class="kws">${ideas.kws.map((k) => `<span class="kw">${escapeHtml(k)}</span>`).join("")}</div>
    </div>

    <div class="section">
      <div class="sectionTitle">Idées de problématique</div>
      <div class="sectionBody"><ul style="margin:0;padding-left:18px;">${ideas.problematiques.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul></div>
    </div>

    <div class="section">
      <div class="sectionTitle">Conséquences possibles (axes)</div>
      <div class="sectionBody"><ul style="margin:0;padding-left:18px;">${ideas.consequences.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul></div>
    </div>

    <div class="section">
      <div class="sectionTitle">Pistes de solutions / angles d’analyse</div>
      <div class="sectionBody"><ul style="margin:0;padding-left:18px;">${ideas.solutions.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul></div>
    </div>

    <div class="section">
      <div class="sectionTitle">Concepts-carrefour (pour cadrer)</div>
      <div class="sectionBody"><div class="kws">${ideas.carrefours.map((x) => `<span class="kw">${escapeHtml(x)}</span>`).join("")}</div></div>
    </div>

    <div class="section">
      <div class="sectionTitle">Citation APA 7 (auto)</div>
      <div class="sectionBody mono" id="apaText">${escapeHtml(apa)}</div>
    </div>

    <div class="section">
      <div class="sectionTitle">Notes (copier-coller)</div>
      <div class="sectionBody mono" id="notesText">${escapeHtml(notes)}</div>
    </div>
  `;

  els.btnCopyApa.disabled = false;
  els.btnCopyNotes.disabled = false;
  els.btnCopyApa.onclick = async () => {
    try {
      await navigator.clipboard.writeText(apa);
      toast("Citation APA copiée.");
    } catch {
      toast("Copie impossible (navigateur).");
    }
  };
  els.btnCopyNotes.onclick = async () => {
    try {
      await navigator.clipboard.writeText(notes);
      toast("Notes copiées.");
    } catch {
      toast("Copie impossible (navigateur).");
    }
  };
}

function buildNotes({ item, summary, ideas, keywords, apa, lang }) {
  const lines = [];
  lines.push(`Titre: ${item.title || "Sans titre"}`);
  lines.push(`Source: ${item.source}`);
  if (item.url) lines.push(`URL: ${item.url}`);
  if (item.doi) lines.push(`DOI: ${item.doi}`);
  if (item.year) lines.push(`Année: ${item.year}`);
  if (item.authors?.length) lines.push(`Auteurs: ${item.authors.join("; ")}`);
  if (item.container) lines.push(`Revue / Support: ${item.container}`);
  lines.push("");
  lines.push(lang === "en" ? "Auto-summary:" : "Résumé auto:");
  lines.push(summary || "(vide)");
  lines.push("");
  lines.push(lang === "en" ? "Keywords:" : "Mots-clés:");
  lines.push((keywords || []).join(", ") || "(aucun)");
  lines.push("");
  lines.push(lang === "en" ? "Problem statement ideas:" : "Idées de problématique:");
  for (const p of ideas.problematiques) lines.push(`- ${p}`);
  lines.push("");
  lines.push(lang === "en" ? "Consequences (axes):" : "Conséquences (axes):");
  for (const c of ideas.consequences) lines.push(`- ${c}`);
  lines.push("");
  lines.push(lang === "en" ? "Solutions / angles:" : "Solutions / angles:");
  for (const s of ideas.solutions) lines.push(`- ${s}`);
  lines.push("");
  lines.push("APA 7:");
  lines.push(apa);
  return lines.join("\n");
}

function buildApa(item, settings) {
  if (item.source === "wikipedia") {
    const year = item.timestamp ? formatDateY(item.timestamp) : "n.d.";
    const siteName = settings.lang === "en" ? "Wikipedia" : "Wikipédia";
    return apaForWebPage({
      author: siteName === "Wikipedia" ? "Wikipedia contributors" : "Contributeurs de Wikipédia",
      year,
      title: item.title,
      siteName,
      url: item.url || "",
      retrieved: formatRetrievedToday(),
    });
  }

  // OpenAlex/Crossref as "article-like" if we have container/doi; else fallback to web page.
  const isArticleLike = !!(item.container || item.doi);
  if (isArticleLike) {
    return apaForArticle({
      authors: item.authors || [],
      year: item.year || "n.d.",
      title: item.title,
      container: item.container || "",
      volume: item.volume || "",
      issue: item.issue || "",
      pages: item.pages || "",
      doi: item.doi || "",
      url: item.url || "",
    });
  }

  return apaForWebPage({
    author: (item.authors || [])[0] || "",
    year: item.year || "n.d.",
    title: item.title,
    siteName: item.source,
    url: item.url || "",
    retrieved: formatRetrievedToday(),
  });
}

function appendToNotes(block) {
  if (!els.notesArea) return;
  const cur = String(els.notesArea.value || "");
  const sep = cur.trim() ? "\n\n---\n\n" : "";
  const next = cur + sep + block;
  els.notesArea.value = next;
  saveNotes(next);
  toast("Ajouté aux notes.");
}

function pickEvidenceBlocks(settings) {
  const blocks = [];
  const used = [];

  const useSelected = !!els.aiUseSelected?.checked;
  const useAll = !!els.aiUseAll?.checked;

  if (useSelected && state.selected) {
    const t = normalizeSpace(state.selected.extract || state.selected.abstract || state.selected.snippet || "");
    if (t) {
      blocks.push({ title: state.selected.title || "Sans titre", text: t, item: state.selected });
      used.push(state.selected);
    }
  }

  if (useAll) {
    const top = state.results.slice(0, 12);
    for (const r of top) {
      if (useSelected && state.selected && r.source === state.selected.source && String(r.id) === String(state.selected.id)) continue;
      const t = normalizeSpace(r.abstract || r.extract || r.snippet || "");
      if (!t) continue;
      blocks.push({ title: r.title || "Sans titre", text: t, item: r });
      used.push(r);
    }
  }

  const useNotes = !!els.aiUseNotes?.checked;
  if (useNotes && els.notesArea) {
    const t = normalizeSpace(String(els.notesArea.value || ""));
    if (t) blocks.push({ title: "Mes notes", text: t, item: null });
  }

  return { blocks, usedItems: used };
}

async function autoSearchWikipediaEvidence(question, settings) {
  const limit = clampInt(parseInt(String(els.aiAutoLimit?.value || "3"), 10), 1, 8, 3);
  const auto = !!els.aiAutoSearch?.checked;
  if (!auto) return { blocks: [], usedItems: [] };

  const q = normalizeSpace(question);
  if (!q) return { blocks: [], usedItems: [] };

  // Use Wikipedia search as a general "no API key" fallback for factual questions.
  const c = new AbortController();
  const items = await searchWikipedia(q, settings.lang, limit, c.signal);
  const top = items.slice(0, limit);
  const enriched = await Promise.allSettled(
    top.map(async (it) => {
      try {
        const d = await wikipediaDetails(it.id, settings.lang, c.signal);
        if (!d) return it;
        return { ...it, extract: d.extract, url: d.fullurl || it.url, timestamp: d.timestamp };
      } catch {
        return it;
      }
    })
  );

  const blocks = [];
  const usedItems = [];
  for (const s of enriched) {
    if (s.status !== "fulfilled") continue;
    const it = s.value;
    const t = normalizeSpace(it.extract || it.snippet || "");
    if (!t) continue;
    blocks.push({ title: it.title || "Wikipédia", text: t, item: it });
    usedItems.push(it);
  }
  return { blocks, usedItems };
}

function bestSentencesForQuestion(question, blocks, lang) {
  // Backward-compatible wrapper (now TF‑IDF based).
  const picked = tfidfRankSentences(question, blocks, lang, 6);
  return picked.map((p) => ({ s: p.s, score: p.score, from: p.from }));
}

async function aiAnswer(question, settings) {
  const q = normalizeSpace(question);
  if (!q) return "";

  let { blocks, usedItems } = pickEvidenceBlocks(settings);
  let corpus = blocks.map((b) => `${b.title}\n${b.text}`).join("\n\n");
  const lang = settings.lang;

  // If we have too little material, auto-search Wikipedia.
  if (normalizeSpace(corpus).length < 450) {
    const auto = await autoSearchWikipediaEvidence(q, settings).catch(() => ({ blocks: [], usedItems: [] }));
    if (auto.blocks.length) {
      blocks = [...blocks, ...auto.blocks];
      usedItems = [...usedItems, ...auto.usedItems];
      corpus = blocks.map((b) => `${b.title}\n${b.text}`).join("\n\n");
    }
  }

  const keywords = extractKeywords(`${q}\n${corpus}`, lang, 14);
  const ideas = generateIdeas({ title: q, text: corpus, keywords, lang });
  const evidence = tfidfRankSentences(q, blocks, lang, 7);
  const years = extractYears(corpus);
  const claims = extractClaimsToCheck(corpus, lang, 6);

  const lines = [];
  lines.push("Œil vigilant — réponse structurée (locale, sources ouvertes)");
  lines.push(`Question: ${q}`);
  if (years.length) lines.push(`Repères temporels détectés: ${years.join(", ")}`);
  lines.push("");

  const isPodcast = /\b(balado|podcast|script|intro|conclusion)\b/i.test(q);
  const isPlan = /\b(plan|structure|outline)\b/i.test(q);

  const synth = summarizeExtractive(corpus, lang, isPodcast ? 4 : 3);
  lines.push(isPodcast ? "Résumé pour balado (base de script)" : "Synthèse (à vérifier)");
  lines.push(synth ? synth : "(Pas assez de texte disponible pour synthétiser.)");
  lines.push("");

  if (isPodcast || isPlan) {
    lines.push("Mini‑plan (proposition)");
    lines.push("- Intro: contexte + pourquoi c’est important");
    lines.push("- Partie 1: thèses/arguments (avec 2 extraits)");
    lines.push("- Partie 2: thèmes + stratégies de communication");
    lines.push("- Partie 3: enjeux/conséquences (plusieurs points de vue)");
    lines.push("- Conclusion: limites + ce qu’il faut vérifier + ouverture");
    lines.push("");
  }

  lines.push("Points clés (tirés des sources)");
  const topPts = evidence.slice(0, 4).map((e) => `- ${e.s}`);
  if (topPts.length) lines.push(...topPts);
  else lines.push("- (Je manque de texte exploitable: active “tous les résultats” ou colle des extraits.)");
  lines.push("");

  if (evidence.length) {
    lines.push("Extraits pertinents (avec provenance)");
    for (const e of evidence) lines.push(`- (${e.from}) ${e.s}`);
    lines.push("");
  }

  lines.push("Analyse rapide (thèmes / ton / stratégies)");
  const themes = detectThemes(corpus, lang).slice(0, 6);
  const tone = detectTone(corpus, lang);
  const strat = detectStrategies(corpus, lang).slice(0, 6);
  lines.push(`- Thèmes: ${themes.length ? themes.join(", ") : "(non détectés)"}`);
  lines.push(`- Ton: ${tone.labels.join(", ")}${tone.cues.length ? ` — ${tone.cues.join(" · ")}` : ""}`);
  lines.push("- Stratégies (indices):");
  for (const s of strat) lines.push(`  - ${s.name}${s.evidence ? `: ${s.evidence}` : ""}`);
  lines.push("");

  lines.push("Problématiques (sciences humaines)");
  for (const p of ideas.problematiques.slice(0, 6)) lines.push(`- ${p}`);
  lines.push("");

  lines.push("Conséquences / enjeux (axes)");
  for (const c of ideas.consequences.slice(0, 6)) lines.push(`- ${c}`);
  lines.push("");

  lines.push("Pistes de solutions / réflexion");
  for (const s of ideas.solutions.slice(0, 6)) lines.push(`- ${s}`);
  lines.push("");

  lines.push("Œil vigilant: points à vérifier (claims)");
  for (const c of claims) lines.push(`- ${c}`);
  lines.push("");

  lines.push("Œil vigilant: ce qui manque souvent (si applicable)");
  const miss = [];
  if (!years.length) miss.push(lang === "en" ? "Dates/years missing" : "Dates/années manquantes");
  if (!containsUrl(corpus)) miss.push(lang === "en" ? "No URLs to cite" : "Pas d’URL à citer (risque de citation incomplète)");
  if (!usedItems.length) miss.push(lang === "en" ? "No sources selected" : "Aucune source sélectionnée");
  if (!miss.length) miss.push(lang === "en" ? "Nothing obvious" : "Rien d’évident");
  for (const m of miss) lines.push(`- ${m}`);
  lines.push("");

  const cited = usedItems.slice(0, 5);
  if (cited.length) {
    lines.push("Sources (APA 7):");
    for (const it of cited) lines.push(`- ${buildApa(it, settings)}`);
  }

  return lines.join("\n");
}

function renderAi(text) {
  state.lastAiAnswer = text || "";
  if (!els.aiOut) return;
  if (!text) {
    els.aiOut.className = "aiOut empty";
    els.aiOut.innerHTML = `<div class="emptyTitle">Pose une question</div><div class="emptyText">Sélectionne un résultat et/ou active “tous les résultats”, puis clique “Répondre”.</div>`;
    if (els.btnAiCopy) els.btnAiCopy.disabled = true;
    if (els.btnAiToNotes) els.btnAiToNotes.disabled = true;
    return;
  }
  els.aiOut.className = "aiOut";
  els.aiOut.innerHTML = `<div class="section"><div class="sectionTitle">Réponse</div><div class="sectionBody mono">${escapeHtml(text)}</div></div>`;
  if (els.btnAiCopy) els.btnAiCopy.disabled = false;
  if (els.btnAiToNotes) els.btnAiToNotes.disabled = false;
}

// ---------- Interaction ----------

function setAiMode(mode) {
  const m = mode === "extraits" ? "extraits" : "questions";
  state.aiMode = m;
  const isQ = m === "questions";
  if (els.aiExcerptBox) els.aiExcerptBox.hidden = isQ;
  if (els.aiModeQuestions) {
    els.aiModeQuestions.classList.toggle("active", isQ);
    els.aiModeQuestions.setAttribute("aria-selected", isQ ? "true" : "false");
  }
  if (els.aiModeExtraits) {
    els.aiModeExtraits.classList.toggle("active", !isQ);
    els.aiModeExtraits.setAttribute("aria-selected", !isQ ? "true" : "false");
  }
  if (isQ) renderAi("");
  else renderAi("");
}

function setActiveTab(tab) {
  state.activeTab = tab;
  for (const b of els.tabs) {
    const is = b.dataset.tab === tab;
    b.classList.toggle("active", is);
    b.setAttribute("aria-selected", is ? "true" : "false");
  }
  renderResults();
}

async function selectResult(source, id) {
  const s = String(source || "");
  const i = String(id || "");
  const idx = state.results.findIndex((r) => r.source === s && String(r.id) === i);
  if (idx < 0) return;

  const settings = getSettings();
  state.selected = state.results[idx];
  renderResults();
  renderDetail(state.selected, settings);

  // Add to session history
  try {
    const key = `${state.selected.source}:${String(state.selected.id)}`;
    const entry = {
      key,
      title: state.selected.title || "Sans titre",
      source: state.selected.source,
      url: state.selected.url || "",
      year: state.selected.year || "",
      when: Date.now(),
    };
    state.history = [entry, ...state.history.filter((x) => x.key !== key)].slice(0, 30);
  } catch {
    // ignore
  }

  // If it's Wikipedia, fetch the full extract for better summaries/notes.
  if (state.selected?.source === "wikipedia" && !state.selected.extract) {
    try {
      const enriched = await enrichSelected(state.selected, settings);
      // Update only if the same result is still selected.
      if (enriched && state.selected && state.selected.source === s && String(state.selected.id) === i) {
        state.results[idx] = enriched;
        state.selected = enriched;
        renderResults();
        renderDetail(enriched, settings);
      }
    } catch {
      // ignore enrichment failure
    }
  }
}

function renderHistory() {
  if (!els.historyList) return;
  if (!state.history.length) {
    els.historyList.innerHTML = `<div class="result"><div class="rTitle">Aucun élément.</div><div class="rMeta">L’historique se remplit quand tu consultes des fiches.</div></div>`;
    return;
  }
  els.historyList.innerHTML = state.history
    .map((h) => {
      const meta = [h.source, h.year].filter(Boolean).join(" · ");
      return `<div class="historyItem" tabindex="0" data-key="${escapeHtml(h.key)}">
        <div class="badgeRow">${badge(h.source)}</div>
        <div class="rTitle">${escapeHtml(h.title)}</div>
        <div class="rMeta">${escapeHtml(meta)}${h.url ? ` · <a href="${escapeHtml(h.url)}" target="_blank" rel="noopener">ouvrir</a>` : ""}</div>
      </div>`;
    })
    .join("");
}

function renderConnexes() {
  const settings = getSettings();
  const query = normalizeSpace(els.q?.value || "");

  const makeButtons = (arr, builder) =>
    (arr || [])
      .filter(Boolean)
      .slice(0, 16)
      .map((x) => `<button class="kw" type="button" data-q="${escapeHtml(builder(x))}">${escapeHtml(x)}</button>`)
      .join("");

  if (els.connexesFromQuery) {
    const kws = computeSuggestedKeywords(state.results, settings.lang, 14);
    const base = query || (settings.lang === "en" ? "topic" : "sujet");
    const items = kws.filter((k) => !tokenizeForSearch(base, settings.lang).includes(k));
    els.connexesFromQuery.innerHTML = makeButtons(items, (k) => normalizeSpace(`${base} ${k}`));
  }

  if (els.connexesFromSelected) {
    if (!state.selected) {
      els.connexesFromSelected.innerHTML = `<span class="kw" style="border-style:dashed;">Sélectionne d’abord un résultat</span>`;
    } else {
      const text = `${state.selected.title || ""}\n${state.selected.abstract || state.selected.extract || state.selected.snippet || ""}`;
      const kws = extractKeywords(text, settings.lang, 12);
      const base = query || normTitleKey(state.selected.title || "");
      const items = kws.filter((k) => !tokenizeForSearch(base, settings.lang).includes(k));
      els.connexesFromSelected.innerHTML = makeButtons(items, (k) => normalizeSpace(`${base} ${k}`));
    }
  }

  if (els.connexesRecent) {
    const recent = (cache.recent || []).slice(0, 12);
    els.connexesRecent.innerHTML = recent
      .map((q) => `<button class="kw" type="button" data-q="${escapeHtml(q)}">${escapeHtml(q)}</button>`)
      .join("");
  }
}

function wireConnexesClicks() {
  const handler = (e) => {
    const b = e.target.closest("[data-q]");
    if (!b) return;
    const q = String(b.dataset.q || "").trim();
    if (!q) return;
    els.q.value = q;
    runSearch();
    toast("Recherche relancée.");
  };
  els.connexesFromQuery?.addEventListener("click", handler);
  els.connexesFromSelected?.addEventListener("click", handler);
  els.connexesRecent?.addEventListener("click", handler);
}

els.results.addEventListener("click", (e) => {
  const el = e.target.closest(".result");
  if (!el) return;
  selectResult(el.dataset.source, el.dataset.id);
});

els.results.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const el = e.target.closest(".result");
  if (!el) return;
  selectResult(el.dataset.source, el.dataset.id);
});

for (const b of els.tabs) {
  b.addEventListener("click", () => setActiveTab(b.dataset.tab));
}

for (const b of els.bubbles || []) {
  b.addEventListener("click", () => setView(b.dataset.view));
}

els.btnGoSearch?.addEventListener("click", () => setView("search"));
els.btnConnexesToSearch?.addEventListener("click", () => setView("search"));
els.btnHistoryToSearch?.addEventListener("click", () => setView("search"));
els.btnAiToNotes?.addEventListener("click", () => {
  if (!state.lastAiAnswer) return;
  appendToNotes(`IA:\n${state.lastAiAnswer}`);
});

els.btnAiCopy?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(String(state.lastAiAnswer || ""));
    toast("Réponse copiée.");
  } catch {
    toast("Copie impossible (navigateur).");
  }
});

els.btnAiClear?.addEventListener("click", () => {
  if (els.aiQ) els.aiQ.value = "";
  renderAi("");
});

els.btnAiAsk?.addEventListener("click", async () => {
  const settings = getSettings();
  const q = String(els.aiQ?.value || "");
  renderAi("Œil vigilant: je rassemble des sources…");
  const ans = await aiAnswer(q, settings);
  renderAi(ans);
});

// Images view
els.btnImgClear?.addEventListener("click", () => {
  if (els.imgQ) els.imgQ.value = "";
  if (els.imgUrl) els.imgUrl.value = "";
  if (els.imgFile) els.imgFile.value = "";
  state.img.results = [];
  if (els.imgPreview) {
    els.imgPreview.style.display = "none";
    els.imgPreview.innerHTML = "";
  }
  renderImageResults();
  renderReverseLinks();
  setImgStatus("Prêt.");
});

els.imgUrl?.addEventListener("input", () => renderReverseLinks());

els.imgFile?.addEventListener("change", async () => {
  if (!els.imgPreview) return;
  const f = els.imgFile.files?.[0];
  if (!f) {
    els.imgPreview.style.display = "none";
    els.imgPreview.innerHTML = "";
    state.img.fileHash = "";
    return;
  }
  const url = URL.createObjectURL(f);
  els.imgPreview.style.display = "";
  els.imgPreview.innerHTML = `<img src="${escapeHtml(url)}" alt="Aperçu" /><div class="rMeta">Fichier local: ${escapeHtml(
    f.name
  )}<br/>Astuce: pour retrouver l’origine/similaires, il faut une URL publique (ex: la page Wikipedia/Commons où tu as trouvé l’image).</div>`;

  // Local similarity (best effort)
  try {
    state.img.fileHash = await dhashFromFile(f);
    if (state.img.results?.length) {
      setImgStatus("Analyse visuelle locale…");
      await applyLocalSimilarityIfPossible();
      setImgStatus(`Images: ${state.img.results.length} (triées par similarité locale quand possible)`);
    }
  } catch {
    state.img.fileHash = "";
  }
});

els.btnImgReverse?.addEventListener("click", () => {
  renderReverseLinks();
  const u = normalizeSpace(els.imgUrl?.value || "");
  if (!u) return toast("Colle une URL d’image (publique) pour lancer la recherche inversée.");
  // open the first reverse search in a new tab (TinEye) as a starting point
  window.open(`https://tineye.com/search?url=${encodeURIComponent(u)}`, "_blank", "noopener");
});

els.btnOpenTinEye?.addEventListener("click", () => {
  // Some services block cross-site uploads. Opening the official page is the most reliable.
  window.open("https://tineye.com/", "_blank", "noopener");
  toast("TinEye ouvert: dépose l’image sur la page.");
});

async function uploadTemp0x0(file) {
  const fd = new FormData();
  fd.append("file", file, file.name || "image.png");
  const res = await fetch("https://0x0.st", { method: "POST", body: fd });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = (await res.text()).trim();
  // 0x0 returns the URL as plain text
  if (!/^https?:\/\/\S+$/i.test(text)) throw new Error("Réponse inattendue");
  return text;
}

els.btnMakeTempUrl?.addEventListener("click", async () => {
  const f = els.imgFile?.files?.[0];
  if (!f) return toast("Choisis un fichier image d’abord.");
  if (!els.imgUrl) return;
  try {
    toast("Création d’une URL temporaire…");
    const url = await uploadTemp0x0(f);
    els.imgUrl.value = url;
    renderReverseLinks();
    toast("URL créée. Tu peux lancer la recherche inversée.");
  } catch {
    toast("Impossible de créer une URL (site bloqué ou CORS). Utilise TinEye/Google en manuel.");
  }
});

els.btnImgSearch?.addEventListener("click", async () => {
  const settings = getSettings();
  const q = normalizeSpace(els.imgQ?.value || "");
  if (!q) return toast("Entre des mots-clés pour chercher des images.");
  const limit = clampInt(parseInt(els.imgPerPage?.value || "12", 10), 6, 60, 12);
  const useWiki = !!els.imgSrcWiki?.checked;
  const useCommons = !!els.imgSrcCommons?.checked;
  const useOpenverse = !!els.imgSrcOpenverse?.checked;
  const useLoc = !!els.imgSrcLoC?.checked;
  const useMet = !!els.imgSrcMet?.checked;
  const useArtic = !!els.imgSrcArtic?.checked;
  const useNasa = !!els.imgSrcNasa?.checked;
  if (!useWiki && !useCommons && !useOpenverse && !useLoc && !useMet && !useArtic && !useNasa) {
    return toast("Active au moins une source d’images.");
  }

  setImgStatus("Recherche d’images…");
  els.btnImgSearch.disabled = true;

  const controller = new AbortController();
  const tasks = [];
  if (useWiki) tasks.push(searchWikipediaImages(q, settings.lang, limit, controller.signal));
  if (useCommons) tasks.push(searchCommonsImages(q, limit, controller.signal));
  if (useOpenverse) tasks.push(searchOpenverseImages(q, limit, controller.signal));
  if (useLoc) tasks.push(searchLocImages(q, limit, controller.signal));
  if (useMet) tasks.push(searchMetImages(q, limit, controller.signal));
  if (useArtic) tasks.push(searchArticImages(q, limit, controller.signal));
  if (useNasa) tasks.push(searchNasaImages(q, limit, controller.signal));

  const settled = await Promise.allSettled(tasks);
  const out = [];
  const errs = [];
  for (const s of settled) {
    if (s.status === "fulfilled") out.push(...s.value);
    else errs.push(s.reason?.message || "Erreur");
  }

  // Dédoublonnage + tri pertinence
  const seen = new Set();
  const qTokens = tokenizeForSearch(q, settings.lang);
  const score = (it) => {
    const t = tokenize(`${it.title || ""} ${it.pageTitle || ""} ${it.creator || ""}`).join(" ");
    let hits = 0;
    for (const tok of qTokens) if (t.includes(tok)) hits++;
    const srcBoost = it.source === "met" || it.source === "artic" ? 0.8 : it.source === "commons" ? 0.45 : it.source === "wikipedia" ? 0.35 : 0.2;
    return hits * 1.6 + srcBoost;
  };

  const deduped = [];
  for (const it of out) {
    const key = normalizeUrlForDedup(it.openUrl || it.url || it.thumb || "");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    it._score = score(it);
    deduped.push(it);
  }
  deduped.sort((a, b) => (b._score || 0) - (a._score || 0));
  state.img.results = deduped;
  renderImageResults();
  setImgStatus(
    errs.length ? `Images: ${deduped.length} (certains échecs: ${errs.join(", ")})` : `Images: ${deduped.length}`
  );
  els.btnImgSearch.disabled = false;

  if (state.img.fileHash) {
    setImgStatus("Analyse visuelle locale…");
    await applyLocalSimilarityIfPossible();
    setImgStatus(
      errs.length
        ? `Images: ${state.img.results.length} (triées par similarité locale quand possible; certains échecs: ${errs.join(", ")})`
        : `Images: ${state.img.results.length} (triées par similarité locale quand possible)`
    );
  }
});

els.aiModeQuestions?.addEventListener("click", () => setAiMode("questions"));
els.aiModeExtraits?.addEventListener("click", () => setAiMode("extraits"));

els.btnAiAnalyze?.addEventListener("click", () => {
  const settings = getSettings();
  const t = String(els.aiExcerpt?.value || "");
  const out = analyzeExcerpt(t, settings);
  renderAi(out);
});

els.btnHistoryClear?.addEventListener("click", () => {
  state.history = [];
  renderHistory();
  toast("Historique vidé.");
});

els.historyList?.addEventListener("click", (e) => {
  const it = e.target.closest("[data-key]");
  if (!it) return;
  const [source, ...rest] = String(it.dataset.key).split(":");
  const id = rest.join(":");
  if (!source || !id) return;
  selectResult(source, id);
  setView("search");
});

els.historyList?.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const it = e.target.closest("[data-key]");
  if (!it) return;
  const [source, ...rest] = String(it.dataset.key).split(":");
  const id = rest.join(":");
  if (!source || !id) return;
  selectResult(source, id);
  setView("search");
});

els.btnClear.addEventListener("click", () => {
  els.q.value = "";
  state.results = [];
  state.selected = null;
  setStatus("Prêt.");
  renderResults();
  renderDetail(null, getSettings());
  renderSuggestions("", [], getSettings());
  els.q.focus();
});

// Notes tool
if (els.notesArea) {
  els.notesArea.value = loadNotes();
  let noteTid = 0;
  els.notesArea.addEventListener("input", () => {
    window.clearTimeout(noteTid);
    noteTid = window.setTimeout(() => saveNotes(els.notesArea.value), 250);
  });
}

els.btnNotesCopy?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(String(els.notesArea?.value || ""));
    toast("Notes copiées.");
  } catch {
    toast("Copie impossible (navigateur).");
  }
});
els.btnNotesClear?.addEventListener("click", () => {
  if (!els.notesArea) return;
  els.notesArea.value = "";
  saveNotes("");
  toast("Notes effacées.");
});

els.btnInsertApa?.addEventListener("click", () => {
  if (!state.selected) return toast("Sélectionne un résultat d’abord.");
  const settings = getSettings();
  const apa = buildApa(state.selected, settings);
  appendToNotes(`APA 7:\n${apa}`);
});

els.btnInsertSummary?.addEventListener("click", () => {
  if (!state.selected) return toast("Sélectionne un résultat d’abord.");
  const settings = getSettings();
  const rawText = normalizeSpace(state.selected.abstract || state.selected.extract || state.selected.snippet || "");
  const summary = rawText ? summarizeExtractive(rawText, settings.lang, 3) : "(vide)";
  appendToNotes(`Résumé auto:\n${summary}`);
});

els.btnInsertAutoNotes?.addEventListener("click", () => {
  if (!state.selected) return toast("Sélectionne un résultat d’abord.");
  const settings = getSettings();
  const title = state.selected.title || "Sans titre";
  const rawText = normalizeSpace(state.selected.abstract || state.selected.extract || state.selected.snippet || "");
  const summary = rawText ? summarizeExtractive(rawText, settings.lang, 3) : "";
  const keywords = extractKeywords(`${title}\n${rawText}`, settings.lang, 10);
  const ideas = generateIdeas({ title, text: rawText, keywords, lang: settings.lang });
  const apa = buildApa(state.selected, settings);
  const notes = buildNotes({ item: state.selected, summary, ideas, keywords, apa, lang: settings.lang });
  appendToNotes(notes);
});

els.q.addEventListener("keydown", (e) => {
  if (e.key === "Enter") runSearch();
});

els.btnSearch.addEventListener("click", () => runSearch());

let debounceTid = 0;
els.q.addEventListener("input", () => {
  window.clearTimeout(debounceTid);
  debounceTid = window.setTimeout(() => {
    const v = normalizeSpace(els.q.value);
    if (v && v.length >= 4 && v !== state.lastQuery) runSearch({ silent: true });
  }, 450);
});

async function enrichSelected(item, settings) {
  if (!item || item.source !== "wikipedia") return item;
  const c = createController();
  const d = await wikipediaDetails(item.id, settings.lang, c.signal);
  if (!d) return item;
  return { ...item, extract: d.extract, url: d.fullurl || item.url, timestamp: d.timestamp };
}

function putRecent(query) {
  const q = normalizeSpace(query);
  if (!q) return;
  cache.recent = [q, ...cache.recent.filter((x) => x !== q)].slice(0, 12);
  saveCache();
}

async function runSearch(opts = {}) {
  const { silent } = opts;
  const query = normalizeSpace(els.q.value);
  if (!query) {
    if (!silent) toast("Entre un mot-clé.");
    return;
  }

  const settings = getSettings();
  if (!settings.sources.wikipedia && !settings.sources.openalex && !settings.sources.crossref) {
    toast("Active au moins une source.");
    return;
  }

  abortInFlight();
  state.lastQuery = query;
  state.selected = null;
  state.results = [];
  renderResults();
  renderDetail(null, settings);
  renderSuggestions("", [], settings);

  setStatus("Recherche…");
  els.btnSearch.disabled = true;

  const tasks = [];
  if (settings.sources.wikipedia) {
    const c = createController();
    tasks.push(
      searchWikipedia(query, settings.lang, settings.perPage, c.signal).then((items) => ({ source: "wikipedia", items }))
    );
  }
  if (settings.sources.openalex) {
    const c = createController();
    tasks.push(searchOpenAlex(query, settings, c.signal).then((items) => ({ source: "openalex", items })));
  }
  if (settings.sources.crossref) {
    const c = createController();
    tasks.push(searchCrossref(query, settings, c.signal).then((items) => ({ source: "crossref", items })));
  }

  const settled = await Promise.allSettled(tasks);
  const next = [];
  const errors = [];
  for (const s of settled) {
    if (s.status === "fulfilled") next.push(...s.value.items);
    else errors.push(s.reason?.message || "Erreur");
  }

  // Dédoublonnage (DOI/URL/titre+année) + tri par pertinence.
  const seen = new Set();
  const deduped = [];
  for (const r of next) {
    const doiKey = r.doi ? `doi:${String(r.doi).toLowerCase()}` : "";
    const urlKey = r.url ? `url:${normalizeUrlForDedup(r.url).toLowerCase()}` : "";
    const titleKey = `t:${normTitleKey(r.title)}|y:${String(r.year || "")}`;
    const key = doiKey || urlKey || titleKey;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(r);
  }

  const qTokens = tokenizeForSearch(query, settings.lang);
  deduped.sort((a, b) => {
    const sb = scoreResult(b, qTokens);
    const sa = scoreResult(a, qTokens);
    if (sb !== sa) return sb - sa;
    const ay = a.year ? parseInt(a.year, 10) : 0;
    const by = b.year ? parseInt(b.year, 10) : 0;
    if (by !== ay) return by - ay;
    return String(a.title || "").localeCompare(String(b.title || ""), "fr");
  });

  state.results = deduped;
  setStatus(
    errors.length
      ? `Résultats: ${deduped.length} (certains échecs: ${errors.join(", ")})`
      : `Résultats: ${deduped.length}`
  );
  els.btnSearch.disabled = false;
  renderResults();
  renderSuggestions(query, state.results, settings);

  putRecent(query);

  // Auto-select the first result and enrich it if needed
  if (state.results.length) {
    const first = state.results[0];
    const enriched = await enrichSelected(first, settings).catch(() => first);
    state.results[0] = enriched;
    state.selected = enriched;
    renderResults();
    renderDetail(enriched, settings);
  }
}

// Initial render
renderResults();
renderDetail(null, getSettings());
setActiveTab("all");
setStatus("Prêt.");
wireConnexesClicks();

// Restore view from hash
const initialView = (location.hash || "").replace("#", "");
if (
  initialView === "images" ||
  initialView === "ai" ||
  initialView === "notes" ||
  initialView === "connexes" ||
  initialView === "history" ||
  initialView === "search"
) {
  setView(initialView);
} else {
  setView("images");
}

setAiMode("questions");

