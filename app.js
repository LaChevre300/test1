const state = {
  lastQuiz: null,
  searchKeywords: [
    "eau purification",
    "bob quebec",
    "ghb evacuation",
    "hypothermie rewarming",
    "radio frs montreal",
    "latrine vip",
    "rocket stove",
    "ifak",
    "opsec famille"
  ],
  riskPoints: [
    {
      name: "Montréal - Inondations printanières",
      coords: [45.5019, -73.5674],
      stat: "Risque riverain élevé lors des crues du Saint-Laurent.",
      advice: "Préparer route Ouest, stock sec surélevé et coupure électrique préventive."
    },
    {
      name: "Québec - Tempêtes hivernales",
      coords: [46.8139, -71.208],
      stat: "Épisodes de verglas et pannes prolongées possibles.",
      advice: "Prioriser chauffage d'appoint, isolation pièce refuge et radio météo."
    },
    {
      name: "Saguenay - Grand froid",
      coords: [48.428, -71.0683],
      stat: "Froid extrême et isolement ponctuel.",
      advice: "Prévoir couches thermiques, carburant, plan voisinage et check médical."
    },
    {
      name: "Gatineau - Vents violents",
      coords: [45.4765, -75.7013],
      stat: "Rafales intenses lors de cellules orageuses.",
      advice: "Fixer équipements extérieurs et prévoir trousse coupure longue."
    }
  ]
};

function byId(id) {
  return document.getElementById(id);
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function downloadText(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function initTheme() {
  const themeToggle = byId("themeToggle");
  if (!themeToggle) return;
  const stored = localStorage.getItem("theme");
  if (stored === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️";
  }
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const dark = document.body.classList.contains("dark");
    themeToggle.textContent = dark ? "☀️" : "🌙";
    localStorage.setItem("theme", dark ? "dark" : "light");
  });
}

function initMenu() {
  const menuToggle = byId("menuToggle");
  const sideNav = byId("sideNav");
  if (!menuToggle || !sideNav) return;
  menuToggle.addEventListener("click", () => sideNav.classList.toggle("open"));
  sideNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => sideNav.classList.remove("open"));
  });
}

function updateBreadcrumb() {
  const breadcrumb = byId("breadcrumb");
  if (!breadcrumb) return;
  const hash = window.location.hash || "#accueil";
  const active = document.querySelector(`.side-nav a[href="${hash}"]`);
  const crumb = active?.dataset.crumb || "Accueil";
  breadcrumb.textContent = `Accueil > ${crumb}`;
}

function initBreadcrumbAndActiveLink() {
  const links = [...document.querySelectorAll(".side-nav a")];
  links.forEach((link) => {
    link.addEventListener("click", () => {
      links.forEach((l) => l.classList.remove("active-link"));
      link.classList.add("active-link");
      updateBreadcrumb();
    });
  });
  window.addEventListener("hashchange", updateBreadcrumb);
  updateBreadcrumb();
}

function initSearch() {
  const datalist = byId("searchSuggestions");
  const form = byId("searchForm");
  const input = byId("siteSearch");
  if (!datalist || !form || !input) return;

  const sections = [...document.querySelectorAll(".panel")];
  const keywords = new Set(state.searchKeywords);
  sections.forEach((s) => {
    if (s.dataset.title) keywords.add(s.dataset.title.toLowerCase());
  });
  keywords.forEach((word) => {
    const option = document.createElement("option");
    option.value = word;
    datalist.appendChild(option);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const q = input.value.trim().toLowerCase();
    if (!q) return;
    const match = sections.find((s) => s.textContent.toLowerCase().includes(q));
    if (!match) {
      alert("Aucun résultat précis. Essayez un mot-clé plus simple.");
      return;
    }
    match.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${match.id}`);
    updateBreadcrumb();
  });
}

function initTabs() {
  document.querySelectorAll(".tabs").forEach((tabsContainer) => {
    const tabs = [...tabsContainer.querySelectorAll(".tab")];
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("is-active"));
        tab.classList.add("is-active");
        const panels = tabsContainer.parentElement.querySelectorAll(".tab-panel");
        panels.forEach((p) => p.classList.remove("active-tab-panel"));
        const target = document.getElementById(tab.dataset.target);
        if (target) target.classList.add("active-tab-panel");
      });
    });
  });
}

function buildActionPlan(score, risk, location) {
  const actions = [];
  if (score < 40) {
    actions.push("Priorité 1: constituer un stock eau 72h (4L/j/pers minimum).");
    actions.push("Priorité 2: monter un BOB complet sous 7 jours.");
    actions.push("Priorité 3: rédiger et imprimer le plan familial.");
  } else if (score < 70) {
    actions.push("Compléter IFAK et vérifier les médicaments critiques.");
    actions.push("Tester une évacuation de 10 km avec charge réelle.");
    actions.push("Renforcer la redondance communication (radio + plan fréquence).");
  } else {
    actions.push("Niveau solide: basculer sur exercices trimestriels.");
    actions.push("Optimiser OPSEC et scénarios multi-risques.");
    actions.push("Former tous les membres aux protocoles feu/eau/santé.");
  }

  if (risk === "inondation") actions.push("Risque inondation: préparer surélévation des stocks et coupure électrique.");
  if (risk === "tempete") actions.push("Risque tempête: renforcer autonomie chaleur et éclairage 5 jours.");
  if (risk === "panne") actions.push("Risque panne: prévoir alimentation radio/téléphone hors réseau.");
  if (risk === "froid") actions.push("Risque grand froid: couches thermiques et pièce refuge isolée.");
  if (location.includes("Montréal")) actions.push("Contexte urbain: prévoir congestion et routes alternatives piéton/vélo.");

  return actions;
}

function scoreToLabel(score) {
  if (score >= 75) return "Avancé";
  if (score >= 50) return "Intermédiaire";
  return "Débutant";
}

function initQuiz() {
  const form = byId("quizForm");
  const scoreBtn = byId("quizScoreBtn");
  const pdfBtn = byId("quizPdfBtn");
  const result = byId("quizResult");
  const actionList = byId("quizActionPlan");
  if (!form || !scoreBtn || !pdfBtn || !result || !actionList) return;

  function computeQuiz() {
    const fd = new FormData(form);
    const locationValue = String(fd.get("location") || "");
    const locationLabel =
      locationValue === "10"
        ? "Montréal urbain"
        : locationValue === "8"
          ? "Laval / Rive-Sud"
          : locationValue === "6"
            ? "Zone périurbaine"
            : "Zone isolée";

    const rawScore =
      toNumber(fd.get("familySize")) +
      toNumber(fd.get("location")) +
      Math.min(10, toNumber(fd.get("waterDays")) * 2) +
      toNumber(fd.get("bobReady")) +
      toNumber(fd.get("ghbReady")) +
      toNumber(fd.get("heatingBackup")) +
      toNumber(fd.get("ifak")) +
      toNumber(fd.get("comms")) +
      toNumber(fd.get("familyPlan"));

    const maxWithoutRisk = 90;
    const score = Math.round((Math.min(rawScore, maxWithoutRisk) / maxWithoutRisk) * 100);
    const risk = String(fd.get("mainRisk") || "tempete");
    const actions = buildActionPlan(score, risk, locationLabel);
    const label = scoreToLabel(score);

    return { score, label, actions, risk, locationLabel, waterDays: toNumber(fd.get("waterDays")) };
  }

  scoreBtn.addEventListener("click", () => {
    if (!form.reportValidity()) return;
    state.lastQuiz = computeQuiz();
    const { score, label, actions } = state.lastQuiz;
    result.textContent = `${score}% prêt - Niveau ${label}.`;
    actionList.innerHTML = "";
    actions.forEach((a) => {
      const li = document.createElement("li");
      li.textContent = a;
      actionList.appendChild(li);
    });
  });

  pdfBtn.addEventListener("click", () => {
    if (!form.reportValidity()) return;
    if (!state.lastQuiz) state.lastQuiz = computeQuiz();
    const quiz = state.lastQuiz;

    if (window.jspdf?.jsPDF) {
      const doc = new window.jspdf.jsPDF();
      doc.setFontSize(16);
      doc.text("Plan d'action survivaliste personnalisé", 10, 14);
      doc.setFontSize(11);
      doc.text(`Score préparation: ${quiz.score}% (${quiz.label})`, 10, 24);
      doc.text(`Localisation: ${quiz.locationLabel}`, 10, 32);
      doc.text(`Risque principal: ${quiz.risk}`, 10, 40);
      doc.text(`Stock eau déclaré: ${quiz.waterDays} jour(s)`, 10, 48);
      doc.text("Actions prioritaires:", 10, 60);
      quiz.actions.forEach((line, idx) => doc.text(`- ${line}`, 12, 70 + idx * 8));
      doc.save("plan-action-survivaliste.pdf");
      return;
    }

    downloadText(
      "plan-action-survivaliste.txt",
      [
        `Score: ${quiz.score}% (${quiz.label})`,
        `Localisation: ${quiz.locationLabel}`,
        `Risque principal: ${quiz.risk}`,
        ...quiz.actions.map((a) => `- ${a}`)
      ].join("\n")
    );
  });
}

function initRiskMap() {
  const mapDiv = byId("riskMap");
  const insights = byId("mapInsights");
  if (!mapDiv || !insights) return;
  if (!window.L) {
    insights.textContent = "Leaflet indisponible hors-ligne: carte désactivée.";
    return;
  }

  const map = window.L.map(mapDiv, { scrollWheelZoom: true }).setView([52.2, -71.5], 5.2);
  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  state.riskPoints.forEach((point) => {
    const marker = window.L.marker(point.coords).addTo(map);
    marker.bindPopup(`<strong>${point.name}</strong><br>${point.stat}`);
    marker.on("click", () => {
      insights.textContent = `${point.name}: ${point.stat} Conseil: ${point.advice}`;
    });
  });
}

async function loadAlerts() {
  const alertesTexte = byId("alertesTexte");
  if (!alertesTexte) return;
  try {
    const res = await fetch(
      "https://api.weather.gc.ca/collections/alerts/items?lang=fr&f=json&limit=25",
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) throw new Error("Erreur API");
    const payload = await res.json();
    const features = payload.features || [];
    const qcAlerts = features.filter((f) => {
      const area = JSON.stringify(f.properties || {}).toLowerCase();
      return area.includes("quebec") || area.includes("québec");
    });
    if (!qcAlerts.length) {
      alertesTexte.textContent = "Aucune alerte majeure détectée au Québec actuellement.";
      return;
    }
    const formatted = qcAlerts
      .slice(0, 2)
      .map((f) => f.properties?.event || f.properties?.description || "Alerte active")
      .join(" | ");
    alertesTexte.textContent = formatted;
  } catch {
    alertesTexte.textContent =
      "API indisponible: consultez Urgence Québec et Environnement Canada.";
  }
}

function initDownloadChecklistCTA() {
  const btn = byId("downloadChecklistBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const lines = [
      "[ ] Eau 72h (4L/pers/jour)",
      "[ ] BOB complet (autonomie 72h)",
      "[ ] Plan familial imprimé",
      "[ ] IFAK à jour",
      "[ ] Radio + batteries",
      "[ ] Itinéraires d'évacuation Nord/Sud"
    ];
    if (window.jspdf?.jsPDF) {
      const doc = new window.jspdf.jsPDF();
      doc.setFontSize(16);
      doc.text("Checklist Survivaliste Gratuite", 10, 16);
      doc.setFontSize(11);
      lines.forEach((line, i) => doc.text(line, 10, 28 + i * 8));
      doc.save("checklist-survie.pdf");
      return;
    }
    downloadText("checklist-survie.txt", lines.join("\n"));
  });
}

function initPlanEditor() {
  const editor = byId("familyPlanEditor");
  const saveBtn = byId("savePlanBtn");
  const exportBtn = byId("exportPlanTxtBtn");
  if (!editor || !saveBtn || !exportBtn) return;

  const key = "family-plan-editor";
  const existing = localStorage.getItem(key);
  if (existing) editor.textContent = existing;

  saveBtn.addEventListener("click", () => {
    localStorage.setItem(key, editor.textContent);
    alert("Plan familial sauvegardé localement.");
  });
  exportBtn.addEventListener("click", () => {
    downloadText("plan-familial.txt", editor.textContent);
  });
}

function initCanvaEmbed() {
  const input = byId("canvaUrlInput");
  const btn = byId("loadCanvaBtn");
  const frame = byId("canvaFrame");
  if (!input || !btn || !frame) return;
  btn.addEventListener("click", () => {
    const url = input.value.trim();
    if (!url.startsWith("https://www.canva.com/")) {
      alert("Utilisez une URL Canva valide (https://www.canva.com/...)");
      return;
    }
    frame.src = url;
  });
}

function initGearWeightTable() {
  const table = byId("gearTable");
  const output = byId("totalWeight");
  if (!table || !output) return;

  function update() {
    const rows = [...table.querySelectorAll("tbody tr")];
    let total = 0;
    rows.forEach((row) => {
      const checked = row.querySelector('input[type="checkbox"]')?.checked;
      const weight = toNumber(row.querySelector(".weight-input")?.value, 0);
      if (checked) total += weight;
    });
    output.textContent = `Poids total estimé sélectionné: ${total.toFixed(1)} kg`;
  }

  table.querySelectorAll('input[type="checkbox"], .weight-input').forEach((el) => {
    el.addEventListener("input", update);
    el.addEventListener("change", update);
  });
  update();
}

function initEvacSimulator() {
  const distanceInput = byId("distanceInput");
  const vitesseInput = byId("vitesseInput");
  const btn = byId("simulateEvacBtn");
  const output = byId("evacOutput");
  if (!distanceInput || !vitesseInput || !btn || !output) return;

  btn.addEventListener("click", () => {
    const d = toNumber(distanceInput.value, 0);
    const v = toNumber(vitesseInput.value, 1);
    if (d <= 0 || v <= 0) return;
    const hours = d / v;
    const calories = Math.round(hours * 450);
    output.textContent = `Temps estimé: ${hours.toFixed(1)}h | Besoin énergétique: ~${calories} kcal/personne.`;
  });
}

function initCacheUpload() {
  const input = byId("cacheMapUpload");
  const status = byId("cacheMapStatus");
  if (!input || !status) return;
  input.addEventListener("change", () => {
    const file = input.files?.[0];
    status.textContent = file
      ? `Fichier chargé: ${file.name} (${Math.round(file.size / 1024)} Ko).`
      : "Aucun fichier importé.";
  });
}

function computeWaterStock() {
  const p = toNumber(byId("waterPeopleInput")?.value, 0);
  const d = toNumber(byId("waterDaysInput")?.value, 0);
  const w = toNumber(byId("waterWinterInput")?.value, 0);
  return p * d * (4 + w);
}

function initWaterCalculator() {
  const calcBtn = byId("calcWaterStockBtn");
  const csvBtn = byId("exportWaterCsvBtn");
  const output = byId("waterStockOutput");
  if (!calcBtn || !csvBtn || !output) return;

  calcBtn.addEventListener("click", () => {
    const litres = computeWaterStock();
    output.textContent = `Stock recommandé: ${litres.toFixed(1)} litres.`;
  });

  csvBtn.addEventListener("click", () => {
    const p = toNumber(byId("waterPeopleInput")?.value, 0);
    const d = toNumber(byId("waterDaysInput")?.value, 0);
    const w = toNumber(byId("waterWinterInput")?.value, 0);
    const total = computeWaterStock();
    const csv = ["personnes,jours,supplement_hiver_l,total_litres", `${p},${d},${w},${total}`].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "stock-eau.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  });
}

function initFoodMenuExport() {
  const btn = byId("exportMenuBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const menu = [
      "Menu 30j (extrait):",
      "J1: Porridge + soupe lentilles + pemmican",
      "J2: Riz haricots + légumes fermentés",
      "J3: Quinoa + poisson conserve + kale",
      "... répéter en rotation avec variations allergènes"
    ].join("\n");
    downloadText("menu-survie-30j.txt", menu);
  });
}

function initAbriEnergieCalculators() {
  const rBtn = byId("calcRValueBtn");
  const rInput = byId("rValueInput");
  const rOut = byId("rValueOutput");
  if (rBtn && rInput && rOut) {
    rBtn.addEventListener("click", () => {
      const val = toNumber(rInput.value, 0);
      const level = val < 2 ? "faible" : val < 4 ? "moyenne" : "bonne";
      rOut.textContent = `Isolation ${level} (R=${val}). Viser R>=4 pour grand froid prolongé.`;
    });
  }

  const eBtn = byId("calcEnergyBtn");
  const eIn = byId("energyNeedInput");
  const eOut = byId("energyOutput");
  if (eBtn && eIn && eOut) {
    eBtn.addEventListener("click", () => {
      const wh = toNumber(eIn.value, 0);
      const days = wh / 400;
      eOut.textContent = `Avec un panneau 100W (~400Wh/j utile), couverture: ${days.toFixed(1)} jour(s) de besoin quotidien.`;
    });
  }
}

function initIfakList() {
  const container = byId("ifakList");
  if (!container) return;
  const items = [
    "Tourniquet CAT", "Pansement israélien", "QuikClot", "Gants nitrile", "Ciseaux trauma",
    "Garrot secondaire", "Bandes cohésives", "Compresses stériles", "Masque RCR", "Sérum physiologique",
    "Antiseptique", "Ibuprofène 400mg", "Paracétamol", "Antihistaminique", "Crème brûlure",
    "Pince à échardes", "Pansements ampoules", "Pansements doigts", "Bandage triangulaire", "Couverture survie",
    "Ruban médical", "Gel hydroalcoolique", "Thermomètre", "SpO2 portable", "Sucre rapide",
    "Sels réhydratation", "Carnet allergies", "Liste traitements", "Stylo lampe", "Sifflet secours",
    "Écharpe immobilisation", "Pommade antibiotique", "Pansement thoracique", "Patch anti-frottement",
    "Pinces hémostatiques", "Spray nasal", "Pastilles gorge", "Vitamine C", "Bâton de glucose",
    "Coussin froid", "Coussin chaud", "Mini attelle", "Lingettes", "Sac déchets biomédicaux",
    "Sangle fixation", "Couteau médical", "Notice premiers secours", "Carte groupe sanguin",
    "Bracelet médical", "Médicaments personnels"
  ];
  container.innerHTML = "";
  items.forEach((item, index) => {
    const line = document.createElement("label");
    line.className = "ifak-item";
    line.innerHTML = `<input type="checkbox" /> ${index + 1}. ${item}`;
    container.appendChild(line);
  });
}

function initMorseTrainer() {
  const input = byId("morseInput");
  const btn = byId("playMorseBtn");
  if (!input || !btn) return;
  const morse = {
    A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..", J: ".---",
    K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-",
    U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..", 1: ".----", 2: "..---", 3: "...--",
    4: "....-", 5: ".....", 6: "-....", 7: "--...", 8: "---..", 9: "----.", 0: "-----", " ": "/"
  };

  btn.addEventListener("click", async () => {
    const text = input.value.toUpperCase();
    const seq = [...text].map((c) => morse[c] || "").join(" ");
    if (!seq) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      let t = ctx.currentTime;
      const dot = 0.08;
      const freq = 680;
      for (const ch of seq) {
        if (ch === ".") {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.value = freq;
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + dot);
          t += dot * 2;
        } else if (ch === "-") {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.value = freq;
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + dot * 3);
          t += dot * 4;
        } else {
          t += dot * 4;
        }
      }
    } catch {
      alert("Audio non disponible sur cet appareil.");
    }
  });
}

function initSkills() {
  const container = byId("skillsGrid");
  if (!container) return;
  const base = [
    "Couture terrain", "Jardin vertical Montréal", "Purification eau", "Allumage ferro rod", "Noeuds paracorde",
    "Lecture carte", "Orientation nocturne", "Cuisine rocket stove", "Lacto-fermentation", "Réparation tarp"
  ];
  const skills = [];
  for (let i = 0; i < 50; i += 1) {
    skills.push(`${i + 1}. ${base[i % base.length]}`);
  }
  container.innerHTML = "";
  skills.forEach((s) => {
    const chip = document.createElement("span");
    chip.textContent = s;
    container.appendChild(chip);
  });
}

function computeChecklistProgress(container) {
  const boxes = [...container.querySelectorAll('input[type="checkbox"]')];
  const done = boxes.filter((b) => b.checked).length;
  const total = boxes.length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0, boxes };
}

function initAnnexChecklist() {
  const box = byId("annexChecklist");
  const progress = byId("annexProgress");
  if (!box || !progress) return;
  const key = box.dataset.key || "checklist-annexes";
  const checks = [
    "Documents identité", "Assurances", "Ordonnances", "Contacts urgences", "Plan foyer",
    "Inventaire cuisine", "Inventaire eau", "Inventaire médicaments", "Route A", "Route B",
    "Route C", "Point rally A", "Point rally B", "Plan voisinage", "Kit hiver véhicule",
    "Batteries", "Radio", "Lampe secours", "Cash urgence", "Clés duplicata"
  ];

  box.innerHTML = "";
  checks.forEach((item) => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" value="${item}" /> ${item}`;
    box.appendChild(label);
  });

  const saved = JSON.parse(localStorage.getItem(key) || "[]");
  const inputs = [...box.querySelectorAll('input[type="checkbox"]')];
  inputs.forEach((input) => {
    input.checked = saved.includes(input.value);
    input.addEventListener("change", () => {
      const selected = inputs.filter((i) => i.checked).map((i) => i.value);
      localStorage.setItem(key, JSON.stringify(selected));
      update();
    });
  });

  function update() {
    const { done, total, pct } = computeChecklistProgress(box);
    progress.textContent = `${pct}% complété (${done}/${total})`;
  }
  update();
}

function buildGlossary() {
  const base = [
    ["BOB", "Bug Out Bag, sac d'évacuation 72h."],
    ["GHB", "Get Home Bag, kit pour retour domicile."],
    ["IFAK", "Trousse individuelle de premiers secours trauma."],
    ["SODIS", "Désinfection solaire UV en bouteille transparente."],
    ["TDS", "Total Dissolved Solids, indicateur de minéraux dissous."],
    ["OPSEC", "Discrétion opérationnelle des informations sensibles."],
    ["Giardia", "Parasite fréquent dans eaux de surface."],
    ["FIFO", "First In First Out, rotation de stocks."],
    ["R-Value", "Résistance thermique d'un isolant."],
    ["EMP", "Impulsion électromagnétique potentiellement perturbatrice."]
  ];
  const categories = ["Eau", "Nourriture", "Énergie", "Santé", "Comms", "Sécurité", "Abri", "Feu"];
  const terms = base.map(([term, def]) => ({ term, def }));
  for (let i = terms.length; i < 200; i += 1) {
    const cat = categories[i % categories.length];
    terms.push({
      term: `${cat}-${i + 1}`,
      def: `Terme ${cat.toLowerCase()} #${i + 1}: définition opérationnelle courte pour glossaire survivaliste.`
    });
  }
  return terms;
}

function initGlossarySearch() {
  const input = byId("glossarySearchInput");
  const out = byId("glossaryResults");
  if (!input || !out) return;
  const terms = buildGlossary();

  function render(list) {
    out.innerHTML = "";
    list.slice(0, 30).forEach((entry) => {
      const div = document.createElement("div");
      div.className = "glossary-item";
      div.innerHTML = `<strong>${entry.term}</strong><p>${entry.def}</p>`;
      out.appendChild(div);
    });
  }

  render(terms);
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      render(terms);
      return;
    }
    const filtered = terms.filter(
      (t) => t.term.toLowerCase().includes(q) || t.def.toLowerCase().includes(q)
    );
    render(filtered);
  });
}

function initNotifications() {
  const btn = byId("notifBtn");
  const status = byId("notifStatus");
  if (!btn || !status) return;
  btn.addEventListener("click", async () => {
    if (!("Notification" in window)) {
      status.textContent = "Notifications non supportées.";
      return;
    }
    const permission = await Notification.requestPermission();
    status.textContent = `Permission notifications: ${permission}`;
  });
}

function initServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("sw.js").catch(() => {
    // Dégradation gracieuse.
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initMenu();
  initBreadcrumbAndActiveLink();
  initSearch();
  initTabs();
  initQuiz();
  initRiskMap();
  loadAlerts();
  initDownloadChecklistCTA();
  initCanvaEmbed();
  initPlanEditor();
  initGearWeightTable();
  initEvacSimulator();
  initCacheUpload();
  initWaterCalculator();
  initFoodMenuExport();
  initAbriEnergieCalculators();
  initIfakList();
  initMorseTrainer();
  initSkills();
  initAnnexChecklist();
  initGlossarySearch();
  initNotifications();
  initServiceWorker();
});
