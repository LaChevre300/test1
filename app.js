function byId(id) {
  return document.getElementById(id);
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function downloadText(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function initTheme() {
  const btn = byId("themeToggle");
  if (!btn) return;
  const stored = localStorage.getItem("theme");
  if (stored === "dark") {
    document.body.classList.add("dark");
    btn.textContent = "☀️";
  }
  btn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const dark = document.body.classList.contains("dark");
    btn.textContent = dark ? "☀️" : "🌙";
    localStorage.setItem("theme", dark ? "dark" : "light");
  });
}

function initPagesMenu() {
  const btn = byId("menuToggle");
  const nav = byId("pagesNav");
  if (!btn || !nav) return;
  btn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

async function loadAlerts() {
  const alertesTexte = byId("alertesTexte");
  if (!alertesTexte) return;
  try {
    const res = await fetch(
      "https://api.weather.gc.ca/collections/alerts/items?lang=fr&f=json&limit=20",
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) throw new Error("API erreur");
    const payload = await res.json();
    const alerts = (payload.features || []).filter((a) =>
      JSON.stringify(a.properties || {}).toLowerCase().includes("quebec")
    );
    if (!alerts.length) {
      alertesTexte.textContent = "Aucune alerte majeure détectée au Québec actuellement.";
      return;
    }
    alertesTexte.textContent = alerts
      .slice(0, 2)
      .map((a) => a.properties?.event || "Alerte active")
      .join(" | ");
  } catch {
    alertesTexte.textContent =
      "Alerte API indisponible. Vérifiez Urgence Québec pour la veille en temps réel.";
  }
}

function scoreToLabel(score) {
  if (score >= 75) return "Avancé";
  if (score >= 50) return "Intermédiaire";
  return "Débutant";
}

function buildActionPlan(score, risk) {
  const actions = [];
  if (score < 40) {
    actions.push("Priorisez l'eau: 4L/jour/personne pour 72h minimum.");
    actions.push("Montez un BOB complet sous 7 jours.");
    actions.push("Rédigez un plan familial imprimé et testé.");
  } else if (score < 70) {
    actions.push("Complétez IFAK et communication radio.");
    actions.push("Testez une évacuation réelle de 10 km.");
    actions.push("Ajoutez redondance énergie/éclairage.");
  } else {
    actions.push("Maintenez des exercices trimestriels.");
    actions.push("Renforcez OPSEC et protocoles multi-risques.");
    actions.push("Formez tous les membres aux gestes de base.");
  }
  if (risk === "tempete") actions.push("Scénario tempête: renforcer chauffage de secours.");
  if (risk === "inondation") actions.push("Scénario inondation: surélever les stocks critiques.");
  if (risk === "froid") actions.push("Scénario froid: pièce refuge isolée et couches thermiques.");
  if (risk === "panne") actions.push("Scénario panne: autonomie électrique minimale 5 jours.");
  return actions;
}

function initQuiz() {
  const form = byId("quizForm");
  const scoreBtn = byId("quizScoreBtn");
  const pdfBtn = byId("quizPdfBtn");
  const result = byId("quizResult");
  const actionList = byId("quizActionPlan");
  if (!form || !scoreBtn || !pdfBtn || !result || !actionList) return;

  function compute() {
    const fd = new FormData(form);
    const total =
      toNumber(fd.get("familySize")) +
      toNumber(fd.get("location")) +
      Math.min(10, toNumber(fd.get("waterDays")) * 2) +
      toNumber(fd.get("bobReady")) +
      toNumber(fd.get("ghbReady")) +
      toNumber(fd.get("heatingBackup")) +
      toNumber(fd.get("ifak")) +
      toNumber(fd.get("comms")) +
      toNumber(fd.get("familyPlan"));
    const score = Math.round((Math.min(total, 90) / 90) * 100);
    const risk = String(fd.get("mainRisk") || "tempete");
    const level = scoreToLabel(score);
    const actions = buildActionPlan(score, risk);
    return { score, level, risk, actions };
  }

  let last = null;

  scoreBtn.addEventListener("click", () => {
    if (!form.reportValidity()) return;
    last = compute();
    result.textContent = `${last.score}% prêt - Niveau ${last.level}`;
    actionList.innerHTML = "";
    last.actions.forEach((a) => {
      const li = document.createElement("li");
      li.textContent = a;
      actionList.appendChild(li);
    });
  });

  pdfBtn.addEventListener("click", () => {
    if (!form.reportValidity()) return;
    if (!last) last = compute();
    if (window.jspdf?.jsPDF) {
      const doc = new window.jspdf.jsPDF();
      doc.setFontSize(16);
      doc.text("Plan d'action survivaliste", 10, 16);
      doc.setFontSize(11);
      doc.text(`Score: ${last.score}% - ${last.level}`, 10, 26);
      doc.text(`Risque principal: ${last.risk}`, 10, 34);
      doc.text("Actions prioritaires:", 10, 44);
      last.actions.forEach((line, idx) => doc.text(`- ${line}`, 12, 54 + idx * 8));
      doc.save("plan-action-survivaliste.pdf");
      return;
    }
    downloadText(
      "plan-action-survivaliste.txt",
      [`Score: ${last.score}%`, ...last.actions.map((a) => `- ${a}`)].join("\n")
    );
  });
}

function initRiskMap() {
  const mapDiv = byId("riskMap");
  const insights = byId("mapInsights");
  if (!mapDiv || !insights) return;
  if (!window.L) {
    insights.textContent = "Carte indisponible hors ligne.";
    return;
  }
  const map = window.L.map(mapDiv).setView([52.2, -71.5], 5.2);
  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  const points = [
    {
      name: "Montréal - Inondations",
      coords: [45.5019, -73.5674],
      stat: "Crues printanières possibles.",
      tip: "Prévoir évacuation rive et coupure électrique."
    },
    {
      name: "Québec - Verglas",
      coords: [46.8139, -71.208],
      stat: "Pannes hivernales possibles.",
      tip: "Préparer chauffage de secours et radio météo."
    },
    {
      name: "Saguenay - Grand froid",
      coords: [48.428, -71.0683],
      stat: "Températures extrêmes.",
      tip: "Isolation renforcée et vêtements multicouches."
    }
  ];
  points.forEach((p) => {
    const marker = window.L.marker(p.coords).addTo(map);
    marker.bindPopup(`<strong>${p.name}</strong><br>${p.stat}`);
    marker.on("click", () => {
      insights.textContent = `${p.name}: ${p.stat} Conseil: ${p.tip}`;
    });
  });
}

function initDownloadChecklistCTA() {
  const btn = byId("downloadChecklistBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const lines = [
      "[ ] Eau 72h",
      "[ ] BOB complet",
      "[ ] Plan familial imprimé",
      "[ ] IFAK à jour",
      "[ ] Radio chargée",
      "[ ] Route d'évacuation validée"
    ];
    if (window.jspdf?.jsPDF) {
      const doc = new window.jspdf.jsPDF();
      doc.text("Checklist gratuite survivaliste", 10, 16);
      lines.forEach((line, i) => doc.text(line, 10, 28 + i * 8));
      doc.save("checklist-survie.pdf");
      return;
    }
    downloadText("checklist-survie.txt", lines.join("\n"));
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
      alert("Veuillez entrer une URL Canva valide.");
      return;
    }
    frame.src = url;
  });
}

function initPlanEditor() {
  const editor = byId("familyPlanEditor");
  const saveBtn = byId("savePlanBtn");
  const exportBtn = byId("exportPlanTxtBtn");
  if (!editor || !saveBtn || !exportBtn) return;
  const key = "family-plan";
  const stored = localStorage.getItem(key);
  if (stored) editor.textContent = stored;
  saveBtn.addEventListener("click", () => {
    localStorage.setItem(key, editor.textContent);
    alert("Plan familial sauvegardé.");
  });
  exportBtn.addEventListener("click", () => {
    downloadText("plan-familial.txt", editor.textContent);
  });
}

function initGearWeightTable() {
  const table = byId("gearTable");
  const output = byId("totalWeight");
  if (!table || !output) return;
  function update() {
    let total = 0;
    table.querySelectorAll("tbody tr").forEach((row) => {
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
  const distance = byId("distanceInput");
  const speed = byId("vitesseInput");
  const btn = byId("simulateEvacBtn");
  const out = byId("evacOutput");
  if (!distance || !speed || !btn || !out) return;
  btn.addEventListener("click", () => {
    const d = toNumber(distance.value, 0);
    const v = toNumber(speed.value, 0);
    if (d <= 0 || v <= 0) return;
    const hours = d / v;
    const calories = Math.round(hours * 450);
    out.textContent = `Temps estimé: ${hours.toFixed(1)}h | Besoin: ${calories} kcal.`;
  });
}

function initCacheUpload() {
  const input = byId("cacheMapUpload");
  const status = byId("cacheMapStatus");
  if (!input || !status) return;
  input.addEventListener("change", () => {
    const f = input.files?.[0];
    status.textContent = f ? `Fichier chargé: ${f.name}` : "Aucun fichier importé.";
  });
}

function initTabs() {
  document.querySelectorAll(".tabs").forEach((container) => {
    const tabs = [...container.querySelectorAll(".tab")];
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("is-active"));
        tab.classList.add("is-active");
        const panels = container.parentElement.querySelectorAll(".tab-panel");
        panels.forEach((p) => p.classList.remove("active-tab-panel"));
        const target = byId(tab.dataset.target);
        if (target) target.classList.add("active-tab-panel");
      });
    });
  });
}

function initWaterCalculator() {
  const calcBtn = byId("calcWaterStockBtn");
  const csvBtn = byId("exportWaterCsvBtn");
  const out = byId("waterStockOutput");
  if (!calcBtn || !csvBtn || !out) return;
  function compute() {
    const people = toNumber(byId("waterPeopleInput")?.value, 0);
    const days = toNumber(byId("waterDaysInput")?.value, 0);
    const winter = toNumber(byId("waterWinterInput")?.value, 0);
    return { people, days, winter, total: people * days * (4 + winter) };
  }
  calcBtn.addEventListener("click", () => {
    const data = compute();
    out.textContent = `Stock recommandé: ${data.total.toFixed(1)} L.`;
  });
  csvBtn.addEventListener("click", () => {
    const d = compute();
    const csv = ["personnes,jours,supp_hiver,total_litres", `${d.people},${d.days},${d.winter},${d.total}`].join("\n");
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
    downloadText(
      "menu-survie-30j.txt",
      "Menu 30 jours (extrait)\nJ1: Porridge + soupe lentilles\nJ2: Riz/haricots\nJ3: Quinoa/conserve"
    );
  });
}

function initAbriEnergyCalculators() {
  const rBtn = byId("calcRValueBtn");
  const rIn = byId("rValueInput");
  const rOut = byId("rValueOutput");
  if (rBtn && rIn && rOut) {
    rBtn.addEventListener("click", () => {
      const r = toNumber(rIn.value, 0);
      const level = r < 2 ? "faible" : r < 4 ? "moyenne" : "bonne";
      rOut.textContent = `Isolation ${level} (R=${r}).`;
    });
  }
  const eBtn = byId("calcEnergyBtn");
  const eIn = byId("energyNeedInput");
  const eOut = byId("energyOutput");
  if (eBtn && eIn && eOut) {
    eBtn.addEventListener("click", () => {
      const need = toNumber(eIn.value, 0);
      const coverage = need / 400;
      eOut.textContent = `Avec 100W (~400Wh/j), couverture: ${coverage.toFixed(1)} jour(s).`;
    });
  }
}

function initIfakList() {
  const container = byId("ifakList");
  if (!container) return;
  const items = Array.from({ length: 50 }, (_, i) => `Item IFAK ${i + 1}`);
  container.innerHTML = "";
  items.forEach((item, i) => {
    const label = document.createElement("label");
    label.className = "ifak-item";
    label.innerHTML = `<input type="checkbox" /> ${i + 1}. ${item}`;
    container.appendChild(label);
  });
}

function initMorseTrainer() {
  const input = byId("morseInput");
  const btn = byId("playMorseBtn");
  if (!input || !btn) return;
  const alphabet = {
    A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..", J: ".---",
    K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-",
    U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..", " ": "/"
  };
  btn.addEventListener("click", () => {
    const seq = [...input.value.toUpperCase()].map((c) => alphabet[c] || "").join(" ");
    alert(`Morse: ${seq}`);
  });
}

function initSkills() {
  const grid = byId("skillsGrid");
  if (!grid) return;
  const skills = Array.from({ length: 50 }, (_, i) => `${i + 1}. Compétence pratique`);
  grid.innerHTML = "";
  skills.forEach((s) => {
    const chip = document.createElement("span");
    chip.textContent = s;
    grid.appendChild(chip);
  });
}

function initAnnexChecklist() {
  const box = byId("annexChecklist");
  const progress = byId("annexProgress");
  if (!box || !progress) return;
  const key = "annex-checklist";
  const items = Array.from({ length: 20 }, (_, i) => `Checklist ${i + 1}`);
  box.innerHTML = "";
  items.forEach((item) => {
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
      const pct = Math.round((selected.length / inputs.length) * 100);
      progress.textContent = `${pct}% complété (${selected.length}/${inputs.length})`;
    });
  });
  const selected = inputs.filter((i) => i.checked).length;
  progress.textContent = `${Math.round((selected / inputs.length) * 100)}% complété (${selected}/${inputs.length})`;
}

function initGlossarySearch() {
  const input = byId("glossarySearchInput");
  const out = byId("glossaryResults");
  if (!input || !out) return;
  const terms = [
    { term: "BOB", def: "Sac d'évacuation 72h." },
    { term: "GHB", def: "Sac retour domicile." },
    { term: "IFAK", def: "Trousse individuelle de secours." }
  ];
  for (let i = 4; i <= 200; i += 1) {
    terms.push({ term: `Terme-${i}`, def: `Définition survivaliste ${i}.` });
  }
  function render(list) {
    out.innerHTML = "";
    list.slice(0, 40).forEach((t) => {
      const d = document.createElement("div");
      d.className = "glossary-item";
      d.innerHTML = `<strong>${t.term}</strong><p>${t.def}</p>`;
      out.appendChild(d);
    });
  }
  render(terms);
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      render(terms);
      return;
    }
    render(terms.filter((t) => t.term.toLowerCase().includes(q) || t.def.toLowerCase().includes(q)));
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
    const p = await Notification.requestPermission();
    status.textContent = `Permission: ${p}`;
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
  initPagesMenu();
  loadAlerts();
  initQuiz();
  initRiskMap();
  initDownloadChecklistCTA();
  initCanvaEmbed();
  initPlanEditor();
  initGearWeightTable();
  initEvacSimulator();
  initCacheUpload();
  initTabs();
  initWaterCalculator();
  initFoodMenuExport();
  initAbriEnergyCalculators();
  initIfakList();
  initMorseTrainer();
  initSkills();
  initAnnexChecklist();
  initGlossarySearch();
  initNotifications();
  initServiceWorker();
});
