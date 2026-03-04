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
};

/** @typedef {"wikipedia"|"openalex"|"crossref"} Source */

const state = {
  activeTab: /** @type {"all"|Source} */ ("all"),
  selected: null,
  lastQuery: "",
  results: /** @type {Array<any>} */ ([]),
  controllers: /** @type {AbortController[]} */ ([]),
};

const CACHE_KEY = "shsearch.cache.v1";
const cache = loadCache();

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

// ---------- Interaction ----------

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

