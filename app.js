const state = {
  searchKeywords: [
    "eau purification",
    "eau stockage",
    "bob quebec",
    "kit survie montreal hiver",
    "abri urgence",
    "radio manivelle",
    "trousse premiers soins",
    "plan familial 72h",
    "feu bow drill",
    "calories survie"
  ]
};

function initTheme() {
  const themeToggle = document.getElementById("themeToggle");
  const stored = localStorage.getItem("theme");
  if (stored === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️";
  }
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    themeToggle.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

function initMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const sideNav = document.getElementById("sideNav");
  menuToggle.addEventListener("click", () => {
    sideNav.classList.toggle("open");
  });
  sideNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => sideNav.classList.remove("open"));
  });
}

function updateBreadcrumb() {
  const breadcrumb = document.getElementById("breadcrumb");
  const hash = window.location.hash || "#accueil";
  const activeLink = document.querySelector(`.side-nav a[href="${hash}"]`);
  const label = activeLink?.dataset.crumb ?? "Accueil";
  breadcrumb.textContent = `Accueil > ${label}`;
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
  const datalist = document.getElementById("searchSuggestions");
  const sections = [...document.querySelectorAll(".panel")];
  const suggestions = new Set(state.searchKeywords);

  sections.forEach((section) => {
    const title = section.dataset.title;
    if (title) suggestions.add(title.toLowerCase());
  });

  suggestions.forEach((word) => {
    const option = document.createElement("option");
    option.value = word;
    datalist.appendChild(option);
  });

  const form = document.getElementById("searchForm");
  const input = document.getElementById("siteSearch");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = input.value.trim().toLowerCase();
    if (!query) return;

    const match = sections.find((section) => {
      const text = section.textContent.toLowerCase();
      return text.includes(query) || section.id.includes(query.replace(/\s+/g, "-"));
    });

    if (!match) {
      alert("Aucun résultat exact. Essayez un mot-clé plus court.");
      return;
    }

    match.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${match.id}`);
    updateBreadcrumb();
  });
}

function initTabs() {
  document.querySelectorAll(".tabs").forEach((tabContainer) => {
    const tabs = [...tabContainer.querySelectorAll(".tab")];
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("is-active"));
        tab.classList.add("is-active");

        const targetId = tab.dataset.target;
        const panels = tabContainer.parentElement.querySelectorAll(".tab-panel");
        panels.forEach((panel) => panel.classList.remove("active-tab-panel"));
        const target = document.getElementById(targetId);
        if (target) target.classList.add("active-tab-panel");
      });
    });
  });
}

function initQuiz() {
  const button = document.getElementById("quizScoreBtn");
  const result = document.getElementById("quizResult");
  button.addEventListener("click", () => {
    const checked = [...document.querySelectorAll('input[name="quiz"]:checked')];
    const score = checked.reduce((sum, item) => sum + Number(item.value), 0);
    let level = "Débutant";
    if (score >= 75) level = "Avancé";
    else if (score >= 50) level = "Intermédiaire";
    result.textContent = `Score: ${score}/100 - Niveau ${level}`;
  });
}

function computeChecklistProgress(container) {
  const boxes = [...container.querySelectorAll('input[type="checkbox"]')];
  const done = boxes.filter((b) => b.checked).length;
  const total = boxes.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  return { total, done, pct, boxes };
}

function initChecklist() {
  const checklist = document.getElementById("bobChecklist");
  const progress = document.getElementById("bobProgress");
  const exportBtn = document.getElementById("exportPdfBtn");
  const resetBtn = document.getElementById("resetChecklistBtn");
  const storageKey = checklist.dataset.key;

  const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
  const boxes = [...checklist.querySelectorAll('input[type="checkbox"]')];
  boxes.forEach((box) => {
    box.checked = saved.includes(box.value);
    box.addEventListener("change", () => {
      const selected = boxes.filter((b) => b.checked).map((b) => b.value);
      localStorage.setItem(storageKey, JSON.stringify(selected));
      update();
    });
  });

  function update() {
    const { pct, done, total } = computeChecklistProgress(checklist);
    progress.textContent = `${pct}% complété (${done}/${total})`;
  }

  exportBtn.addEventListener("click", () => {
    const { boxes: allBoxes } = computeChecklistProgress(checklist);
    const lines = allBoxes.map((b) => `${b.checked ? "[x]" : "[ ]"} ${b.value}`);

    if (window.jspdf?.jsPDF) {
      const doc = new window.jspdf.jsPDF();
      doc.setFontSize(16);
      doc.text("Checklist BOB - Carnet Survivaliste", 10, 16);
      doc.setFontSize(11);
      lines.forEach((line, idx) => doc.text(line, 10, 28 + idx * 8));
      doc.save("checklist-bob.pdf");
      return;
    }

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "checklist-bob.txt";
    link.click();
    URL.revokeObjectURL(link.href);
    alert("jsPDF indisponible hors-ligne: export texte généré.");
  });

  resetBtn.addEventListener("click", () => {
    boxes.forEach((b) => {
      b.checked = false;
    });
    localStorage.removeItem(storageKey);
    update();
  });

  update();
}

function initCalculators() {
  const calcCaloriesBtn = document.getElementById("calcCaloriesBtn");
  const caloriesOutput = document.getElementById("caloriesOutput");
  calcCaloriesBtn.addEventListener("click", () => {
    const poids = Number(document.getElementById("poidsInput").value);
    const age = Number(document.getElementById("ageInput").value);
    if (!poids || !age) return;
    const maintenance = Math.round((22 * poids) * (age > 50 ? 1.1 : 1.2));
    caloriesOutput.textContent = `Ration estimée: ${maintenance} kcal/jour en autonomie active.`;
  });

  const calcEauBtn = document.getElementById("calcEauBtn");
  const eauOutput = document.getElementById("eauOutput");
  calcEauBtn.addEventListener("click", () => {
    const personnes = Number(document.getElementById("personnesInput").value);
    const jours = Number(document.getElementById("joursInput").value);
    const litres = personnes * jours * 4;
    eauOutput.textContent = `Volume recommandé: ${litres} litres (base 4L/jour/personne).`;
  });
}

function initModal() {
  const modal = document.getElementById("glossaryModal");
  document.getElementById("openGlossaryModal").addEventListener("click", () => {
    modal.setAttribute("aria-hidden", "false");
  });
  document.getElementById("closeGlossaryModal").addEventListener("click", () => {
    modal.setAttribute("aria-hidden", "true");
  });
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.setAttribute("aria-hidden", "true");
  });
}

async function loadAlerts() {
  const alertesTexte = document.getElementById("alertesTexte");
  try {
    const response = await fetch(
      "https://api.weather.gc.ca/collections/alerts/items?lang=fr&f=json&limit=2",
      { headers: { Accept: "application/json" } }
    );
    if (!response.ok) throw new Error("API indisponible");
    const payload = await response.json();
    const items = payload.features || [];
    if (!items.length) {
      alertesTexte.textContent = "Aucune alerte météo majeure en ce moment (source API fédérale).";
      return;
    }
    const titles = items
      .map((item) => item.properties?.event || item.properties?.description || "Alerte active")
      .slice(0, 2)
      .join(" | ");
    alertesTexte.textContent = titles;
  } catch {
    alertesTexte.textContent =
      "Flux d'alertes non joignable: vérifiez Urgence Québec et Environnement Canada.";
  }
}

function initNotifications() {
  const notifBtn = document.getElementById("notifBtn");
  const notifStatus = document.getElementById("notifStatus");
  notifBtn.addEventListener("click", async () => {
    if (!("Notification" in window)) {
      notifStatus.textContent = "Notifications non supportées sur cet appareil.";
      return;
    }
    const permission = await Notification.requestPermission();
    notifStatus.textContent = `Permission notifications: ${permission}.`;
  });
}

function initServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker
    .register("sw.js")
    .catch(() => {
      // Si l'enregistrement échoue, le site reste utilisable en mode web standard.
    });
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initMenu();
  initBreadcrumbAndActiveLink();
  initSearch();
  initTabs();
  initQuiz();
  initChecklist();
  initCalculators();
  initModal();
  initNotifications();
  initServiceWorker();
  loadAlerts();
});
