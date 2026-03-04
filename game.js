(() => {
  "use strict";

  const MAX_STAT = 100;
  const MIN_STAT = 0;
  const START_YEAR = 1187;
  const MAX_LOG = 220;
  const ACTIONS_PER_YEAR = 3;

  const COUNTRIES = [
    "Royaume de France",
    "Royaume d'Angleterre",
    "Royaume de Castille",
    "Saint-Empire romain",
    "République de Venise",
    "Califat d'Al-Andalus",
    "Royaume de Pologne",
    "Empire byzantin"
  ];

  const SOCIAL_CLASSES = [
    { name: "Paysannerie", baseMoney: 20, mods: { strength: 8, happiness: -4 } },
    { name: "Artisanat", baseMoney: 45, mods: { intelligence: 5, reputation: 3 } },
    { name: "Bourgeoisie marchande", baseMoney: 90, mods: { intelligence: 8, happiness: 4 } },
    { name: "Petite noblesse", baseMoney: 170, mods: { looks: 5, reputation: 10, sanity: -3 } },
    { name: "Haute noblesse", baseMoney: 320, mods: { reputation: 18, looks: 7, happiness: -6 } },
    { name: "Clergé", baseMoney: 75, mods: { sanity: 10, intelligence: 6, happiness: -2 } }
  ];

  const MALE_NAMES = [
    "Aymon",
    "Gautier",
    "Hugues",
    "Renaud",
    "Jehan",
    "Thierry",
    "Tristan",
    "Aubert",
    "Perrin",
    "Roland",
    "Géraud",
    "Amaury",
    "Enguerrand",
    "Blaise"
  ];

  const FEMALE_NAMES = [
    "Aliénor",
    "Ysabeau",
    "Agnès",
    "Berthe",
    "Jeanne",
    "Constance",
    "Alix",
    "Margot",
    "Isolde",
    "Mathilde",
    "Héloïse",
    "Pétronille",
    "Sybille",
    "Adèle"
  ];

  const SURNAMES = [
    "de Valmont",
    "du Lys",
    "de Rochebrune",
    "de Noirmont",
    "des Tisserands",
    "d'Aubecourt",
    "de Mireval",
    "de Cendreval",
    "des Frênes",
    "de Chanterive",
    "des Corbeaux",
    "de l'Orme"
  ];

  const JOBS = [
    { title: "Manœuvre", minInt: 0, minEdu: 0, salary: 18, prestige: -2 },
    { title: "Serviteur de cour", minInt: 25, minEdu: 0, salary: 22, prestige: 4 },
    { title: "Forgeron", minInt: 35, minEdu: 1, salary: 28, prestige: 6 },
    { title: "Scribe", minInt: 45, minEdu: 1, salary: 31, prestige: 10 },
    { title: "Marchand itinérant", minInt: 45, minEdu: 1, salary: 35, prestige: 12 },
    { title: "Bailli", minInt: 55, minEdu: 2, salary: 42, prestige: 18 },
    { title: "Médecin", minInt: 62, minEdu: 3, salary: 52, prestige: 24 },
    { title: "Artiste de cour", minInt: 58, minEdu: 2, salary: 45, prestige: 22 },
    { title: "Capitaine de garde", minInt: 42, minEdu: 1, salary: 47, prestige: 21 },
    { title: "Conseiller royal", minInt: 68, minEdu: 3, salary: 70, prestige: 34 }
  ];

  const EDU_LEVELS = ["Aucun", "Apprentissage", "Formation supérieure", "Université", "Érudition"];

  const RANDOM_ITEMS = [
    "dague ouvragée",
    "anneau d'argent",
    "cape brodée",
    "grimoire jauni",
    "amulette étrange",
    "bourse usée",
    "flasque d'alcool fort",
    "perle noire",
    "lettre compromettante",
    "instrument de musique"
  ];

  const RANDOM_ANIMALS = [
    "chien de garde",
    "chat de grange",
    "faucon",
    "cheval",
    "mule",
    "chèvre",
    "corbeau apprivoisé",
    "porc robuste",
    "loup apprivoisé"
  ];

  const ILLNESSES = [
    "fièvre des marais",
    "peste locale",
    "infection pulmonaire",
    "mal de ventre chronique",
    "goutte douloureuse",
    "faiblesse nerveuse"
  ];

  const INJURIES = [
    "bras fracturé",
    "cicatrice profonde",
    "jambe foulée",
    "côte fêlée",
    "mauvaise brûlure"
  ];

  const MENTAL_ISSUES = [
    "paranoïa",
    "anxiété chronique",
    "insomnie sévère",
    "mélancolie noire",
    "hallucinations"
  ];

  const CHECKLIST = [
    "Création aléatoire complète (nom, pays, sexe, classe, famille, stats).",
    "Bouton annuel « Passer une année » avec événements et choix.",
    "Mort possible par maladie, crime, accident, prison, vieillesse.",
    "Relations parents/fratrie/belle-famille + interactions variées.",
    "Enfance et école (résultats, clubs, bagarres, exclusions).",
    "Santé physique, mentale, dépendances, chirurgie et risques.",
    "Études supérieures, dettes étudiantes, progression académique.",
    "Carrières nombreuses (travaux simples, prestige, art, politique).",
    "Système social complet (amis, ennemis, collègues, voisins).",
    "Couple, mariage, infidélité, divorce, enfants bio/adoption.",
    "Gestion familiale (héritage, pension, tests de parentalité).",
    "Argent, prêts, faillite, investissements, propriétés, luxe.",
    "Criminalité (vols, braquages, mafias, fraude, corruption).",
    "Prison avec gameplay interne (bagarres, gangs, évasions).",
    "Événements aléatoires fréquents et défis de trajectoire.",
    "Animaux et inventaire conservables / revendables.",
    "Legacy multi-générationnel avec incarnation d'un enfant."
  ];

  const ui = {
    newLifeBtn: document.getElementById("new-life-btn"),
    ageBtn: document.getElementById("age-btn"),
    statusStrip: document.getElementById("status-strip"),
    statsList: document.getElementById("stats-list"),
    resourcesList: document.getElementById("resources-list"),
    conditionsList: document.getElementById("conditions-list"),
    relationsList: document.getElementById("relations-list"),
    eventCard: document.getElementById("event-card"),
    log: document.getElementById("log"),
    actionsRoot: document.getElementById("actions-root"),
    inventoryList: document.getElementById("inventory-list"),
    animalsList: document.getElementById("animals-list"),
    childrenList: document.getElementById("children-list"),
    featureChecklist: document.getElementById("feature-checklist"),
    actionCategoryTemplate: document.getElementById("action-category-template")
  };

  let game = null;

  function rnd(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function chance(probability) {
    return Math.random() < probability;
  }

  function pick(list) {
    return list[rnd(0, list.length - 1)];
  }

  function clamp(value, min = MIN_STAT, max = MAX_STAT) {
    return Math.max(min, Math.min(max, value));
  }

  function weightedPick(weighted) {
    const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = Math.random() * total;
    for (const entry of weighted) {
      roll -= entry.weight;
      if (roll <= 0) {
        return entry.value;
      }
    }
    return weighted[weighted.length - 1].value;
  }

  function sexName() {
    return chance(0.5) ? "Homme" : "Femme";
  }

  function randomFirstName(sex) {
    return sex === "Homme" ? pick(MALE_NAMES) : pick(FEMALE_NAMES);
  }

  function newPerson(role, minAge, maxAge, surname) {
    const sex = sexName();
    return {
      id: crypto.randomUUID(),
      role,
      sex,
      name: `${randomFirstName(sex)} ${surname}`,
      age: rnd(minAge, maxAge),
      alive: true,
      closeness: rnd(35, 85)
    };
  }

  function statBlock(classMods = {}, inheritedStats = null) {
    const base = {
      health: rnd(45, 78),
      happiness: rnd(35, 75),
      intelligence: rnd(35, 75),
      looks: rnd(30, 80),
      strength: rnd(30, 80),
      sanity: rnd(35, 75),
      reputation: rnd(20, 65)
    };
    for (const [key, mod] of Object.entries(classMods)) {
      base[key] = clamp(base[key] + mod);
    }
    if (inheritedStats) {
      base.health = clamp(base.health + Math.round((inheritedStats.health - 50) * 0.15));
      base.intelligence = clamp(
        base.intelligence + Math.round((inheritedStats.intelligence - 50) * 0.15)
      );
      base.looks = clamp(base.looks + Math.round((inheritedStats.looks - 50) * 0.15));
      base.reputation = clamp(base.reputation + Math.round((inheritedStats.reputation - 50) * 0.15));
    }
    return base;
  }

  function createInitialCharacter(generation, inherited = null) {
    const surname = inherited?.surname || pick(SURNAMES);
    const socialClass = inherited?.className
      ? SOCIAL_CLASSES.find((entry) => entry.name === inherited.className) || pick(SOCIAL_CLASSES)
      : pick(SOCIAL_CLASSES);
    const sex = inherited?.sex || sexName();
    const age = inherited?.age ?? 0;
    const country = inherited?.country || pick(COUNTRIES);
    const firstName = inherited?.firstName || randomFirstName(sex);

    const parentA = newPerson("Parent", rnd(21, 32), rnd(38, 52), surname);
    const parentB = newPerson("Parent", rnd(20, 31), rnd(37, 52), surname);
    const siblingsCount = rnd(0, 4);
    const siblings = Array.from({ length: siblingsCount }, () =>
      newPerson("Frère/Sœur", 0, 14, surname)
    );

    const inlaws = chance(0.2) ? [newPerson("Belle-famille", 24, 64, pick(SURNAMES))] : [];
    const inheritedMoney = inherited?.inheritedMoney || 0;
    const stats = statBlock(socialClass.mods, inherited?.stats || null);

    return {
      firstName,
      surname,
      fullName: `${firstName} ${surname}`,
      country,
      sex,
      socialClass: socialClass.name,
      age,
      alive: true,
      yearBorn: START_YEAR - age,
      stats,
      money: socialClass.baseMoney + inheritedMoney,
      debt: inherited?.debtCarry || 0,
      fame: inherited?.fameCarry || 0,
      notoriety: inherited?.notorietyCarry || 0,
      karma: rnd(-10, 10),
      actionsLeft: ACTIONS_PER_YEAR,
      school: {
        enrolled: age < 16,
        expelled: false,
        grade: rnd(35, 75),
        clubs: []
      },
      educationLevel: inherited?.educationLevel || 0,
      universityDebt: 0,
      job: null,
      salary: 0,
      careerLevel: 0,
      politicalLevel: 0,
      celebrity: 0,
      criminal: {
        record: inherited?.recordCarry || 0,
        inPrison: false,
        yearsLeft: 0,
        gangPrison: false
      },
      family: {
        parents: [parentA, parentB],
        siblings,
        spouse: null,
        inlaws,
        children: inherited?.childrenCarry || []
      },
      social: {
        friends: [],
        enemies: [],
        neighbors: [],
        colleagues: []
      },
      inventory: inherited?.inventory || ["vêtements usés"],
      animals: inherited?.animals || [],
      properties: inherited?.properties || [],
      vehicles: inherited?.vehicles || [],
      conditions: {
        illnesses: [],
        injuries: [],
        mental: [],
        addictions: []
      },
      deceasedCause: null,
      generation
    };
  }

  function bootstrapGame(inherited = null) {
    const generation = inherited?.generation || 1;
    game = {
      worldYear: inherited?.worldYear || START_YEAR,
      dynastyName: inherited?.surname || null,
      log: [],
      pendingEvent: null,
      character: createInitialCharacter(generation, inherited),
      achievements: []
    };
    game.dynastyName = game.character.surname;
    addLog(
      `Début de la génération ${game.character.generation} : ${game.character.fullName} naît en ${game.character.country}.`,
      "good"
    );
    spawnAmbientPeople();
    ensureChecklist();
    render();
  }

  function ensureChecklist() {
    ui.featureChecklist.innerHTML = "";
    CHECKLIST.forEach((entry) => {
      const div = document.createElement("div");
      div.className = "check-item";
      div.textContent = `✓ ${entry}`;
      ui.featureChecklist.append(div);
    });
  }

  function addLog(text, tone = "neutral") {
    const prefix = `[${game.worldYear}] `;
    game.log.unshift({ text: `${prefix}${text}`, tone });
    if (game.log.length > MAX_LOG) {
      game.log = game.log.slice(0, MAX_LOG);
    }
  }

  function changeStat(key, delta) {
    const c = game.character;
    c.stats[key] = clamp(c.stats[key] + delta);
  }

  function changeMoney(amount) {
    const c = game.character;
    c.money = Math.round((c.money + amount) * 100) / 100;
  }

  function addUnique(list, value) {
    if (!list.includes(value)) {
      list.push(value);
    }
  }

  function removeRandom(list) {
    if (!list.length) {
      return null;
    }
    const index = rnd(0, list.length - 1);
    return list.splice(index, 1)[0];
  }

  function addCondition(kind, value) {
    const list = game.character.conditions[kind];
    addUnique(list, value);
  }

  function clearCondition(kind) {
    const list = game.character.conditions[kind];
    if (!list.length) {
      return null;
    }
    return removeRandom(list);
  }

  function relationshipPulse(collection, delta) {
    collection.forEach((person) => {
      if (!person.alive) {
        return;
      }
      person.closeness = clamp(person.closeness + delta, 0, 100);
    });
  }

  function getTotalDebt() {
    return Math.max(0, Math.round((game.character.debt + game.character.universityDebt) * 100) / 100);
  }

  function spend(cost) {
    if (game.character.money >= cost) {
      changeMoney(-cost);
      return true;
    }
    game.character.debt += cost - game.character.money;
    game.character.money = 0;
    addLog("Faute de liquidités, tu t'endettes davantage.", "warn");
    return false;
  }

  function aliveChildren() {
    return game.character.family.children.filter((child) => child.alive);
  }

  function makeChild(adopted = false) {
    const c = game.character;
    const sex = sexName();
    const child = {
      id: crypto.randomUUID(),
      name: `${randomFirstName(sex)} ${c.surname}`,
      sex,
      age: 0,
      alive: true,
      adopted,
      bond: rnd(35, 75),
      stats: {
        intelligence: clamp(rnd(30, 75) + Math.round((c.stats.intelligence - 50) * 0.2)),
        health: clamp(rnd(35, 80) + Math.round((c.stats.health - 50) * 0.2)),
        looks: clamp(rnd(30, 75) + Math.round((c.stats.looks - 50) * 0.2)),
        reputation: clamp(rnd(20, 65) + Math.round((c.stats.reputation - 50) * 0.15))
      }
    };
    c.family.children.push(child);
    addLog(
      adopted
        ? `Tu accueilles ${child.name} dans ta famille par adoption.`
        : `${child.name} vient de naître. Une nouvelle branche de la dynastie apparaît.`,
      "good"
    );
    changeStat("happiness", 8);
  }

  function spawnAmbientPeople() {
    const c = game.character;
    const neighborsCount = rnd(1, 3);
    c.social.neighbors = Array.from({ length: neighborsCount }, () =>
      newPerson("Voisin", 16, 70, pick(SURNAMES))
    );
    const friendCount = rnd(0, 2);
    c.social.friends = Array.from({ length: friendCount }, () =>
      newPerson("Ami", 5, 50, pick(SURNAMES))
    );
  }

  function randomFertilityChance() {
    const c = game.character;
    if (c.age < 16 || c.age > 55) {
      return 0;
    }
    const base = c.age < 36 ? 0.34 : c.age < 45 ? 0.2 : 0.09;
    return base + (c.stats.health - 50) / 250;
  }

  function tryCrime(name, rewardMin, rewardMax, baseArrest, baseDeath, yearsPrison) {
    const c = game.character;
    if (chance(baseDeath + c.criminal.record * 0.01)) {
      kill(`mort lors de "${name}"`);
      return;
    }
    const arrestChance = baseArrest + c.criminal.record * 0.03 - c.stats.intelligence / 300;
    if (chance(Math.max(0.05, arrestChance))) {
      addLog(`La garde t'arrête pendant ${name}.`, "bad");
      const trialConviction = 0.55 + c.criminal.record * 0.05 - c.stats.reputation / 350;
      if (chance(Math.max(0.2, trialConviction))) {
        c.criminal.inPrison = true;
        c.criminal.yearsLeft = rnd(yearsPrison[0], yearsPrison[1]);
        c.criminal.record += 1;
        changeStat("reputation", -12);
        changeStat("happiness", -9);
        changeMoney(-rnd(5, 28));
        addLog(
          `Jugement défavorable. Tu es envoyé(e) en prison pour ${c.criminal.yearsLeft} an(s).`,
          "bad"
        );
      } else {
        addLog("Le tribunal manque de preuves. Tu ressors libre, mais surveillé(e).", "warn");
        c.criminal.record += 1;
      }
      return;
    }
    const loot = rnd(rewardMin, rewardMax);
    changeMoney(loot);
    c.notoriety = clamp(c.notoriety + rnd(2, 8), -100, 100);
    changeStat("happiness", rnd(1, 5));
    addLog(`"${name}" réussit. Gain discret de ${loot} pièces.`, "good");
  }

  function joinWorkforce() {
    const c = game.character;
    const job = weightedPick(
      JOBS.filter((entry) => c.stats.intelligence >= entry.minInt && c.educationLevel >= entry.minEdu).map(
        (entry) => ({ value: entry, weight: 1 + entry.prestige / 20 })
      )
    );
    if (!job) {
      addLog("Aucun employeur sérieux ne te retient pour l'instant.", "warn");
      return;
    }
    c.job = job.title;
    c.salary = job.salary;
    c.careerLevel = Math.max(0, Math.round(job.prestige / 10));
    addLog(`Tu obtiens un poste de ${job.title}.`, "good");
    changeStat("reputation", rnd(1, 5));
  }

  function annualSalaryAndBills() {
    const c = game.character;
    if (c.job) {
      const income = Math.max(0, c.salary + rnd(-4, 8));
      changeMoney(income);
      addLog(`Tu touches ${income} pièces grâce à ton travail (${c.job}).`, "neutral");
    }
    if (c.properties.length) {
      const passive = rnd(4, 20) * c.properties.length;
      changeMoney(passive);
      addLog(`Tes biens rapportent ${passive} pièces de revenus locatifs.`, "good");
    }
    if (getTotalDebt() > 0) {
      const interest = Math.max(2, Math.round(getTotalDebt() * 0.07));
      game.character.debt += interest;
      addLog(`Les dettes grandissent de ${interest} pièces avec les intérêts.`, "warn");
      changeStat("happiness", -2);
    }
  }

  function processAgingRelations() {
    const c = game.character;
    for (const relative of c.family.parents) {
      if (!relative.alive) {
        continue;
      }
      relative.age += 1;
      if (relative.age > rnd(58, 92) && chance(0.16)) {
        relative.alive = false;
        addLog(`${relative.name} (${relative.role}) meurt cette année.`, "warn");
        if (chance(0.35)) {
          const inheritance = rnd(10, 120);
          changeMoney(inheritance);
          addLog(`Tu reçois ${inheritance} pièces d'héritage.`, "good");
        }
      }
    }

    for (const sibling of c.family.siblings) {
      if (!sibling.alive) {
        continue;
      }
      sibling.age += 1;
      if (chance(0.05) && sibling.age >= 18) {
        sibling.closeness = clamp(sibling.closeness + rnd(-8, 8), 0, 100);
      }
      if (sibling.age > rnd(62, 94) && chance(0.12)) {
        sibling.alive = false;
        addLog(`${sibling.name} quitte ce monde.`, "warn");
      }
    }

    for (const child of c.family.children) {
      if (!child.alive) {
        continue;
      }
      child.age += 1;
      if (chance(0.04)) {
        child.bond = clamp(child.bond + rnd(-9, 9), 0, 100);
      }
      if (child.age > rnd(58, 93) && chance(0.12)) {
        child.alive = false;
      }
    }

    if (c.family.spouse?.alive) {
      c.family.spouse.age += 1;
      if (chance(0.03)) {
        c.family.spouse.closeness = clamp(c.family.spouse.closeness + rnd(-7, 7), 0, 100);
      }
      if (c.family.spouse.age > rnd(62, 95) && chance(0.14)) {
        c.family.spouse.alive = false;
        addLog(`Ton/ta partenaire ${c.family.spouse.name} décède.`, "bad");
        changeStat("happiness", -15);
      }
    }

    relationshipPulse(c.social.friends, chance(0.25) ? rnd(-3, 2) : 0);
    relationshipPulse(c.social.enemies, chance(0.25) ? rnd(-2, 3) : 0);
  }

  function processEducationAndCareer() {
    const c = game.character;
    if (c.age < 16 && !c.school.expelled) {
      c.school.enrolled = true;
      c.school.grade = clamp(c.school.grade + rnd(-5, 6));
      if (chance(0.05)) {
        addLog("Une altercation éclate à l'école.", "warn");
        if (chance(0.3)) {
          changeStat("strength", 2);
          changeStat("health", -4);
        }
      }
    } else {
      c.school.enrolled = false;
    }

    if (c.age >= 16 && c.job && !c.criminal.inPrison) {
      const promotionRoll = 0.06 + c.stats.intelligence / 700 + c.careerLevel * 0.02;
      if (chance(promotionRoll)) {
        c.careerLevel += 1;
        c.salary += rnd(4, 12);
        changeStat("reputation", rnd(2, 7));
        addLog("Tu obtiens une promotion après une année agitée.", "good");
      }
      if (chance(0.04)) {
        c.salary = Math.max(6, c.salary - rnd(3, 8));
        addLog("Le budget du seigneur baisse: ta paie est réduite.", "warn");
      }
      if (chance(0.03 + c.criminal.record * 0.02)) {
        addLog("Ton passé trouble ressort. Tu perds ton emploi.", "bad");
        c.job = null;
        c.salary = 0;
        c.careerLevel = 0;
      }
    }
  }

  function processHealth() {
    const c = game.character;
    if (c.conditions.addictions.length) {
      changeStat("health", -rnd(1, 3) * c.conditions.addictions.length);
      changeStat("sanity", -rnd(1, 3));
      if (chance(0.18)) {
        addCondition("illnesses", pick(ILLNESSES));
        addLog("Tes excès aggravent ton état de santé.", "bad");
      }
    }
    if (c.conditions.illnesses.length) {
      changeStat("health", -rnd(1, 4) * c.conditions.illnesses.length);
      changeStat("happiness", -rnd(1, 3));
    }
    if (c.conditions.mental.length) {
      changeStat("sanity", -rnd(1, 4) * c.conditions.mental.length);
      changeStat("happiness", -rnd(1, 3));
    }
    if (chance(0.06)) {
      addCondition("injuries", pick(INJURIES));
      addLog("Un accident te laisse une nouvelle blessure.", "warn");
      changeStat("health", -8);
    }
  }

  function processPrison() {
    const c = game.character;
    if (!c.criminal.inPrison) {
      return;
    }
    c.criminal.yearsLeft -= 1;
    changeStat("happiness", -3);
    changeStat("sanity", -2);
    if (chance(0.22)) {
      addLog("La vie carcérale t'épuise psychologiquement.", "bad");
    }
    if (chance(0.08)) {
      addCondition("injuries", pick(INJURIES));
      changeStat("health", -7);
      addLog("Une bagarre en prison te blesse.", "bad");
    }
    if (c.criminal.yearsLeft <= 0) {
      c.criminal.inPrison = false;
      c.criminal.gangPrison = false;
      addLog("Tu sors de prison avec une réputation complexe.", "warn");
      changeStat("reputation", -3);
    }
  }

  function processFamePolitics() {
    const c = game.character;
    if (c.celebrity > 0 && chance(0.12)) {
      const gain = rnd(5, 22);
      changeMoney(gain);
      addLog(`Une apparition publique renforce ta célébrité (+${gain} pièces).`, "good");
    }
    if (c.politicalLevel > 0 && chance(0.09)) {
      changeStat("reputation", rnd(-3, 8));
      if (chance(0.25)) {
        addLog("Un scandale politique éclate autour de ton entourage.", "warn");
      }
    }
  }

  function mortalityCheck() {
    const c = game.character;
    if (!c.alive) {
      return;
    }
    const ageRisk = c.age < 45 ? 0.003 : c.age < 60 ? 0.015 : c.age < 75 ? 0.05 : 0.13;
    const healthRisk = (50 - c.stats.health) * 0.0015;
    const mentalRisk = c.stats.sanity < 20 ? 0.025 : 0;
    const illnessRisk = c.conditions.illnesses.length * 0.02;
    const injuryRisk = c.conditions.injuries.length * 0.01;
    const prisonRisk = c.criminal.inPrison ? 0.03 : 0;
    const addictionRisk = c.conditions.addictions.length * 0.018;
    const totalRisk = Math.max(0, ageRisk + healthRisk + mentalRisk + illnessRisk + injuryRisk + prisonRisk + addictionRisk);

    if (chance(totalRisk)) {
      const cause = weightedPick([
        { value: "vieillesse", weight: Math.max(1, c.age - 45) },
        { value: "maladie brutale", weight: 4 + c.conditions.illnesses.length * 3 },
        { value: "accident fatal", weight: 3 + c.conditions.injuries.length * 2 },
        { value: "surdose", weight: 1 + c.conditions.addictions.length * 3 },
        { value: "violence en détention", weight: c.criminal.inPrison ? 6 : 1 },
        { value: "règlement de comptes", weight: 1 + Math.max(0, c.notoriety / 20) }
      ]);
      kill(cause);
    }
  }

  function kill(cause) {
    const c = game.character;
    c.alive = false;
    c.deceasedCause = cause;
    addLog(`Fin de vie: ${c.fullName} meurt (${cause}).`, "bad");
    render();
  }

  function summaryText() {
    const c = game.character;
    const heirs = aliveChildren();
    return `Âge: ${c.age} ans · Fortune: ${Math.round(c.money)} pièces · Enfants vivants: ${
      heirs.length
    } · Casier: ${c.criminal.record} · Réputation: ${c.stats.reputation} · Célébrité: ${c.celebrity}.`;
  }

  function continueAsChild(childId) {
    const heir = aliveChildren().find((child) => child.id === childId);
    if (!heir) {
      return;
    }
    const legacyData = {
      generation: game.character.generation + 1,
      surname: game.character.surname,
      firstName: heir.name.split(" ")[0],
      age: Math.max(14, heir.age),
      sex: heir.sex,
      country: game.character.country,
      className: game.character.socialClass,
      inheritedMoney: Math.max(0, Math.round(game.character.money * 0.7)),
      debtCarry: Math.round(game.character.debt * 0.45),
      fameCarry: Math.round(game.character.celebrity * 0.5),
      notorietyCarry: Math.round(game.character.notoriety * 0.4),
      recordCarry: Math.round(game.character.criminal.record * 0.4),
      stats: {
        health: heir.stats.health,
        intelligence: heir.stats.intelligence,
        looks: heir.stats.looks,
        reputation: heir.stats.reputation
      },
      educationLevel: Math.min(4, Math.max(0, Math.floor(heir.age / 8))),
      inventory: [...game.character.inventory.slice(0, 6)],
      properties: [...game.character.properties.slice(0, 4)],
      vehicles: [...game.character.vehicles.slice(0, 3)],
      animals: [...game.character.animals.slice(0, 4)],
      childrenCarry: [],
      worldYear: game.worldYear
    };
    bootstrapGame(legacyData);
    addLog(`Tu incarnes désormais ${game.character.fullName}, héritier(e) de la lignée.`, "good");
    render();
  }

  function consumeAction() {
    if (!game.character.alive) {
      return false;
    }
    if (game.pendingEvent) {
      addLog("Résous l'événement annuel en cours avant d'agir ailleurs.", "warn");
      return false;
    }
    if (game.character.actionsLeft <= 0) {
      addLog("Tu n'as plus d'actions libres cette année. Vieillis pour continuer.", "warn");
      return false;
    }
    game.character.actionsLeft -= 1;
    return true;
  }

  function randomEventPool() {
    const c = game.character;
    const pool = [];
    pool.push({
      text: "Un collecteur d'impôts te propose un arrangement discret.",
      choices: [
        {
          label: "Payer plein tarif",
          run: () => {
            spend(rnd(8, 22));
            changeStat("reputation", 2);
          }
        },
        {
          label: "Négocier dans l'ombre",
          run: () => {
            if (chance(0.45)) {
              changeMoney(rnd(5, 16));
              c.notoriety = clamp(c.notoriety + 4, -100, 100);
            } else {
              tryCrime("fraude fiscale", 3, 12, 0.35, 0.01, [1, 3]);
            }
          }
        },
        {
          label: "Le dénoncer au seigneur",
          run: () => {
            changeStat("reputation", 6);
            changeStat("happiness", -2);
            if (chance(0.2)) {
              addLog("Le collecteur jure de se venger.", "warn");
              c.notoriety = clamp(c.notoriety + 6, -100, 100);
            }
          }
        }
      ]
    });

    pool.push({
      text: "Une rumeur sur ton nom circule dans la gazette locale.",
      choices: [
        {
          label: "Ignorer",
          run: () => {
            changeStat("sanity", -1);
          }
        },
        {
          label: "Acheter le silence",
          run: () => {
            spend(rnd(6, 20));
            changeStat("reputation", rnd(1, 6));
          }
        },
        {
          label: "Contre-attaquer publiquement",
          run: () => {
            if (chance(0.45)) {
              changeStat("reputation", 8);
              c.celebrity = clamp(c.celebrity + 6, 0, 100);
            } else {
              changeStat("reputation", -8);
              c.notoriety = clamp(c.notoriety + 7, -100, 100);
            }
          }
        }
      ]
    });

    pool.push({
      text: "Un voyageur te propose une carte au trésor douteuse.",
      choices: [
        {
          label: "Acheter",
          run: () => {
            spend(rnd(4, 18));
            if (chance(0.35)) {
              const loot = rnd(20, 90);
              changeMoney(loot);
              addLog(`La piste mène à un butin de ${loot} pièces.`, "good");
            } else {
              addCondition("injuries", pick(INJURIES));
              changeStat("health", -9);
            }
          }
        },
        {
          label: "Refuser poliment",
          run: () => {
            changeStat("sanity", 2);
          }
        },
        {
          label: "Voler la carte",
          run: () => {
            tryCrime("vol de carte au trésor", 8, 30, 0.3, 0.02, [1, 3]);
          }
        }
      ]
    });

    if (c.age < 16) {
      pool.push({
        text: "Un élève t'humilie devant la classe.",
        choices: [
          {
            label: "Te taire",
            run: () => {
              changeStat("happiness", -4);
              changeStat("sanity", -2);
            }
          },
          {
            label: "Te battre",
            run: () => {
              if (chance(0.45)) {
                changeStat("strength", 4);
                changeStat("reputation", 3);
              } else {
                addCondition("injuries", pick(INJURIES));
                changeStat("health", -7);
              }
              if (chance(0.25)) {
                c.school.expelled = true;
                c.school.enrolled = false;
                addLog("Tu es temporairement renvoyé(e) de l'école.", "warn");
              }
            }
          },
          {
            label: "Prévenir un adulte",
            run: () => {
              changeStat("sanity", 3);
              changeStat("reputation", 2);
            }
          }
        ]
      });
    }

    if (c.age >= 16) {
      pool.push({
        text: "Un rival professionnel tente de te discréditer.",
        choices: [
          {
            label: "Jouer l'apaisement",
            run: () => {
              changeStat("reputation", 3);
              changeStat("happiness", -2);
            }
          },
          {
            label: "Saboter son travail",
            run: () => {
              if (chance(0.5)) {
                changeMoney(rnd(6, 22));
                changeStat("reputation", -2);
              } else {
                tryCrime("sabotage de rival", 4, 16, 0.28, 0.01, [1, 2]);
              }
            }
          },
          {
            label: "Le provoquer en duel",
            run: () => {
              if (chance(0.35)) {
                kill("duel mortel");
              } else {
                addCondition("injuries", pick(INJURIES));
                changeStat("reputation", 5);
              }
            }
          }
        ]
      });
    }

    if (c.family.spouse?.alive) {
      pool.push({
        text: "Ton/ta partenaire demande un engagement plus sérieux.",
        choices: [
          {
            label: "Faire un grand geste",
            run: () => {
              spend(rnd(10, 35));
              c.family.spouse.closeness = clamp(c.family.spouse.closeness + 11, 0, 100);
              changeStat("happiness", 7);
            }
          },
          {
            label: "Reporter la discussion",
            run: () => {
              c.family.spouse.closeness = clamp(c.family.spouse.closeness - 7, 0, 100);
            }
          },
          {
            label: "Rompre brutalement",
            run: () => {
              changeStat("happiness", -14);
              c.family.spouse = null;
            }
          }
        ]
      });
    }
    return pool;
  }

  function generateAnnualEvent() {
    if (!game.character.alive) {
      return;
    }
    const pool = randomEventPool();
    game.pendingEvent = pick(pool);
  }

  function nextYear() {
    const c = game.character;
    if (!c.alive) {
      addLog("La vie est terminée. Choisis un héritier ou lance une nouvelle vie.", "warn");
      render();
      return;
    }
    if (game.pendingEvent) {
      addLog("Un événement t'attend encore. Prends d'abord une décision.", "warn");
      render();
      return;
    }
    game.worldYear += 1;
    c.age += 1;
    c.actionsLeft = ACTIONS_PER_YEAR;
    addLog(`Tu franchis une nouvelle année: ${game.worldYear}.`, "neutral");

    processAgingRelations();
    annualSalaryAndBills();
    processEducationAndCareer();
    processHealth();
    processPrison();
    processFamePolitics();

    if (c.age >= 16 && c.family.spouse?.alive && chance(randomFertilityChance() * 0.2)) {
      makeChild(false);
    }
    if (chance(0.06) && c.age >= 18) {
      addLog("Une opportunité inattendue surgit dans ta ville.", "good");
      changeStat("happiness", 2);
    }
    if (chance(0.05) && c.age >= 16) {
      addCondition("mental", pick(MENTAL_ISSUES));
      addLog("Le poids des années fragilise ton esprit.", "warn");
    }
    if (chance(0.04)) {
      addCondition("illnesses", pick(ILLNESSES));
      addLog("Une maladie saisonnière se déclare.", "warn");
    }

    mortalityCheck();
    if (c.alive) {
      generateAnnualEvent();
    }
    render();
  }

  function getActionsByCategory() {
    const c = game.character;
    const isPrison = c.criminal.inPrison;
    const canWork = c.age >= 14 && !isPrison;
    const actions = {
      Famille: [
        {
          label: "Passer du temps avec la famille",
          when: () => true,
          run: () => {
            if (!consumeAction()) return;
            relationshipPulse(c.family.parents, 4);
            relationshipPulse(c.family.siblings, 3);
            changeStat("happiness", 6);
            addLog("Tu consacres du temps aux proches.", "good");
          }
        },
        {
          label: "Offrir un cadeau",
          when: () => true,
          run: () => {
            if (!consumeAction()) return;
            spend(rnd(3, 15));
            relationshipPulse(c.family.parents, 6);
            relationshipPulse(c.family.siblings, 5);
            if (c.family.spouse) c.family.spouse.closeness = clamp(c.family.spouse.closeness + 8, 0, 100);
            changeStat("happiness", 3);
            addLog("Ton cadeau adoucit plusieurs tensions familiales.", "good");
          }
        },
        {
          label: "Insulter un proche",
          when: () => true,
          run: () => {
            if (!consumeAction()) return;
            relationshipPulse(c.family.parents, -10);
            relationshipPulse(c.family.siblings, -12);
            if (c.family.spouse) c.family.spouse.closeness = clamp(c.family.spouse.closeness - 14, 0, 100);
            changeStat("happiness", chance(0.4) ? 2 : -6);
            changeStat("reputation", -5);
            addLog("Ta colère laisse des traces dans la famille.", "bad");
          }
        },
        {
          label: "Couper les liens avec un membre",
          when: () => true,
          run: () => {
            if (!consumeAction()) return;
            if (c.family.siblings.length && chance(0.6)) {
              const removed = c.family.siblings.splice(rnd(0, c.family.siblings.length - 1), 1)[0];
              addLog(`Tu coupes les ponts avec ${removed.name}.`, "warn");
            } else if (c.family.parents.length) {
              const aliveParents = c.family.parents.filter((p) => p.alive);
              if (aliveParents.length) {
                const target = pick(aliveParents);
                target.closeness = 0;
                addLog(`Tu romps avec ${target.name}.`, "warn");
              }
            }
            changeStat("sanity", chance(0.5) ? 2 : -4);
          }
        },
        {
          label: "Aider financièrement la famille",
          when: () => c.money > 5,
          run: () => {
            if (!consumeAction()) return;
            const amount = rnd(5, Math.min(40, Math.max(7, Math.floor(c.money / 2))));
            changeMoney(-amount);
            relationshipPulse(c.family.parents, 7);
            relationshipPulse(c.family.siblings, 6);
            changeStat("reputation", 4);
            addLog(`Tu offres ${amount} pièces aux proches.`, "good");
          }
        },
        {
          label: "Visiter la belle-famille",
          when: () => !!c.family.spouse,
          run: () => {
            if (!consumeAction()) return;
            if (!c.family.inlaws.length) {
              c.family.inlaws.push(newPerson("Belle-famille", 28, 72, pick(SURNAMES)));
            }
            relationshipPulse(c.family.inlaws, rnd(-4, 9));
            changeStat("happiness", rnd(-3, 5));
            addLog("La belle-famille est... fidèle à sa réputation.", "neutral");
          }
        },
        {
          label: "Rédiger un testament",
          when: () => c.age >= 25,
          run: () => {
            if (!consumeAction()) return;
            changeStat("sanity", 3);
            changeStat("happiness", -1);
            addLog("Ton testament est mis à jour. La succession devient plus claire.", "neutral");
          }
        }
      ],
      "École & carrière": [
        {
          label: "Étudier sérieusement",
          when: () => c.school.enrolled || c.educationLevel < 4,
          run: () => {
            if (!consumeAction()) return;
            c.school.grade = clamp(c.school.grade + rnd(3, 10));
            changeStat("intelligence", rnd(2, 6));
            if (chance(0.12)) {
              c.educationLevel = Math.min(4, c.educationLevel + 1);
              addLog("Tu franchis un palier académique.", "good");
            } else {
              addLog("Tu passes de longues heures sur les manuscrits.", "good");
            }
          }
        },
        {
          label: "Sécher les cours",
          when: () => c.school.enrolled && !c.school.expelled,
          run: () => {
            if (!consumeAction()) return;
            c.school.grade = clamp(c.school.grade - rnd(6, 13));
            changeStat("happiness", rnd(2, 6));
            if (chance(0.28)) {
              c.school.expelled = true;
              c.school.enrolled = false;
              addLog("L'école te renvoie après plusieurs absences.", "bad");
            } else {
              addLog("Tu évites les cours pour traîner en ville.", "warn");
            }
          }
        },
        {
          label: "Intégrer une activité parascolaire",
          when: () => c.age < 20 && !c.criminal.inPrison,
          run: () => {
            if (!consumeAction()) return;
            const club = pick(["tir à l'arc", "théâtre", "chant liturgique", "échecs", "escrime"]);
            addUnique(c.school.clubs, club);
            changeStat("happiness", 5);
            changeStat("reputation", 2);
            addLog(`Tu rejoins le club de ${club}.`, "good");
          }
        },
        {
          label: "Chercher un travail",
          when: () => canWork,
          run: () => {
            if (!consumeAction()) return;
            if (!c.job) {
              joinWorkforce();
            } else {
              addLog(`Tu as déjà un emploi (${c.job}).`, "warn");
            }
          }
        },
        {
          label: "Demander une promotion",
          when: () => !!c.job && !isPrison,
          run: () => {
            if (!consumeAction()) return;
            const odds = 0.2 + c.stats.intelligence / 350 + c.stats.reputation / 450;
            if (chance(Math.min(0.85, odds))) {
              const raise = rnd(4, 14);
              c.salary += raise;
              c.careerLevel += 1;
              changeStat("reputation", 6);
              addLog(`Promotion acceptée. Salaire +${raise}.`, "good");
            } else {
              changeStat("happiness", -5);
              addLog("Ton supérieur refuse sèchement ta demande.", "bad");
            }
          }
        },
        {
          label: "Saboter un collègue",
          when: () => !!c.job && !isPrison,
          run: () => {
            if (!consumeAction()) return;
            if (chance(0.42)) {
              changeStat("reputation", 2);
              changeMoney(rnd(3, 15));
              addLog("Ton sabotage reste discret et te profite.", "warn");
            } else {
              changeStat("reputation", -11);
              if (chance(0.35)) {
                c.job = null;
                c.salary = 0;
                addLog("Tu es démasqué(e) et licencié(e).", "bad");
              } else {
                addLog("L'affaire reste floue, mais on se méfie de toi.", "bad");
              }
            }
          }
        },
        {
          label: "Entrer à l'université",
          when: () => c.age >= 16 && c.educationLevel >= 1 && !isPrison,
          run: () => {
            if (!consumeAction()) return;
            const tuition = rnd(20, 65);
            c.universityDebt += tuition;
            c.educationLevel = Math.min(4, c.educationLevel + 1);
            changeStat("intelligence", rnd(5, 12));
            changeStat("happiness", rnd(-5, 4));
            addLog(
              `Tu t'inscris en études supérieures. Coût reporté en dette: ${tuition} pièces.`,
              "warn"
            );
          }
        },
        {
          label: "Ouvrir une échoppe",
          when: () => c.age >= 18 && !isPrison,
          run: () => {
            if (!consumeAction()) return;
            const cost = rnd(20, 90);
            spend(cost);
            if (chance(0.45 + c.stats.intelligence / 300)) {
              const gain = rnd(25, 120);
              changeMoney(gain);
              changeStat("reputation", 5);
              addLog(`Ton échoppe décolle. Bénéfice initial: ${gain} pièces.`, "good");
            } else {
              changeStat("happiness", -8);
              c.debt += rnd(8, 35);
              addLog("L'échoppe peine à survivre. Les dettes augmentent.", "bad");
            }
          }
        },
        {
          label: "Se lancer en politique locale",
          when: () => c.age >= 24 && c.stats.reputation >= 45 && !isPrison,
          run: () => {
            if (!consumeAction()) return;
            if (chance(0.35 + c.stats.reputation / 250)) {
              c.politicalLevel += 1;
              changeStat("reputation", 7);
              addLog("Tu obtiens une fonction politique locale.", "good");
            } else {
              changeStat("reputation", -6);
              addLog("Ta candidature déclenche des moqueries.", "bad");
            }
          }
        },
        {
          label: "Poursuivre une carrière artistique",
          when: () => c.age >= 14 && !isPrison,
          run: () => {
            if (!consumeAction()) return;
            if (chance(0.4 + c.stats.looks / 300)) {
              c.celebrity = clamp(c.celebrity + rnd(6, 13), 0, 100);
              changeMoney(rnd(4, 24));
              changeStat("happiness", 6);
              addLog("Tu fais sensation dans un spectacle public.", "good");
            } else {
              changeStat("happiness", -3);
              addLog("Le public reste froid et distant.", "warn");
            }
          }
        }
      ],
      "Santé & mental": [
        {
          label: "Consulter un médecin",
          when: () => !isPrison,
          run: () => {
            if (!consumeAction()) return;
            spend(rnd(4, 20));
            const cured = clearCondition("illnesses");
            if (cured) {
              changeStat("health", rnd(6, 14));
              addLog(`Le médecin soulage ta ${cured}.`, "good");
            } else {
              changeStat("health", 2);
              addLog("Aucun mal grave détecté, mais la consultation rassure.", "neutral");
            }
          }
        },
        {
          label: "Aller à l'hôpital monastique",
          when: () => !isPrison,
          run: () => {
            if (!consumeAction()) return;
            spend(rnd(8, 28));
            if (chance(0.65)) {
              clearCondition("injuries");
              clearCondition("illnesses");
              changeStat("health", rnd(8, 18));
              addLog("Le traitement fonctionne au-delà des attentes.", "good");
            } else {
              addCondition("illnesses", pick(ILLNESSES));
              changeStat("health", -10);
              addLog("Le remède aggrave ton état.", "bad");
            }
          }
        },
        {
          label: "Voir un psy / confesseur",
          when: () => !isPrison,
          run: () => {
            if (!consumeAction()) return;
            spend(rnd(2, 12));
            const healed = clearCondition("mental");
            changeStat("sanity", rnd(7, 14));
            changeStat("happiness", rnd(3, 8));
            addLog(
              healed
                ? `Tu apprivoises progressivement ta ${healed}.`
                : "La discussion t'apaise en profondeur.",
              "good"
            );
          }
        },
        {
          label: "Entraînement physique intense",
          when: () => true,
          run: () => {
            if (!consumeAction()) return;
            changeStat("strength", rnd(4, 10));
            changeStat("health", rnd(2, 7));
            if (chance(0.2)) {
              addCondition("injuries", pick(INJURIES));
              changeStat("health", -8);
              addLog("L'entraînement tourne mal et cause une blessure.", "warn");
            } else {
              addLog("Tu gagnes en endurance.", "good");
            }
          }
        },
        {
          label: "Repos total",
          when: () => true,
          run: () => {
            if (!consumeAction()) return;
            changeStat("health", rnd(3, 9));
            changeStat("happiness", rnd(2, 8));
            changeStat("sanity", rnd(3, 8));
            addLog("Tu prends enfin le temps de souffler.", "good");
          }
        },
        {
          label: "Soirée taverne (alcool)",
          when: () => true,
          run: () => {
            if (!consumeAction()) return;
            spend(rnd(3, 12));
            changeStat("happiness", rnd(4, 10));
            changeStat("sanity", rnd(-6, 3));
            if (chance(0.3)) addCondition("addictions", "alcool");
            if (chance(0.18)) addCondition("injuries", pick(INJURIES));
            addLog("La taverne offre du réconfort... et des risques.", "warn");
          }
        },
        {
          label: "Essayer l'opium",
          when: () => c.age >= 16,
          run: () => {
            if (!consumeAction()) return;
            spend(rnd(4, 18));
            changeStat("happiness", rnd(2, 11));
            changeStat("health", rnd(-10, -2));
            addCondition("addictions", "opium");
            if (chance(0.2)) addCondition("mental", pick(MENTAL_ISSUES));
            addLog("L'expérience laisse une empreinte ambiguë.", "bad");
          }
        },
        {
          label: "Chirurgie esthétique artisanale",
          when: () => c.age >= 18,
          run: () => {
            if (!consumeAction()) return;
            spend(rnd(15, 55));
            if (chance(0.55)) {
              changeStat("looks", rnd(5, 15));
              changeStat("reputation", rnd(2, 8));
              addLog("L'opération améliore ton apparence.", "good");
            } else {
              addCondition("injuries", "cicatrice du visage");
              changeStat("looks", -12);
              changeStat("health", -8);
              addLog("L'opération tourne mal et laisse des séquelles.", "bad");
            }
          }
        }
      ],
      "Relations & amour": [
        {
          label: "Se faire un nouvel ami",
          when: () => !isPrison,
          run: () => {
            if (!consumeAction()) return;
            const friend = newPerson("Ami", Math.max(8, c.age - 12), c.age + 12, pick(SURNAMES));
            c.social.friends.push(friend);
            changeStat("happiness", 5);
            addLog(`Tu te rapproches de ${friend.name}.`, "good");
          }
        },
        {
          label: "Créer un ennemi juré",
          when: () => true,
          run: () => {
            if (!consumeAction()) return;
            const enemy = newPerson("Ennemi", Math.max(10, c.age - 14), c.age + 14, pick(SURNAMES));
            c.social.enemies.push(enemy);
            changeStat("reputation", chance(0.4) ? 4 : -4);
            changeStat("sanity", -2);
            addLog(`${enemy.name} devient ton rival déclaré.`, "warn");
          }
        },
        {
          label: "Flirter au marché",
          when: () => c.age >= 14 && !isPrison,
          run: () => {
            if (!consumeAction()) return;
            if (chance(0.48 + c.stats.looks / 300)) {
              const partner = newPerson("Partenaire", Math.max(14, c.age - 8), c.age + 8, pick(SURNAMES));
              partner.closeness = rnd(45, 80);
              c.family.spouse = partner;
              addLog(`Le flirt fonctionne: tu te mets en couple avec ${partner.name}.`, "good");
              changeStat("happiness", 8);
            } else {
              addLog("Le flirt tombe à plat.", "warn");
              changeStat("happiness", -3);
            }
          }
        },
        {
          label: "Demander en mariage",
          when: () => !!c.family.spouse && c.family.spouse.alive && c.age >= 18,
          run: () => {
            if (!consumeAction()) return;
            if (chance(0.45 + c.family.spouse.closeness / 200)) {
              c.family.spouse.role = "Époux/Épouse";
              changeStat("happiness", 10);
              changeStat("reputation", 4);
              addLog(`Mariage célébré avec ${c.family.spouse.name}.`, "good");
            } else {
              c.family.spouse.closeness = clamp(c.family.spouse.closeness - 14, 0, 100);
              changeStat("happiness", -8);
              addLog("La proposition est refusée.", "bad");
            }
          }
        },
        {
          label: "Tromper ton partenaire",
          when: () => !!c.family.spouse && c.family.spouse.alive,
          run: () => {
            if (!consumeAction()) return;
            changeStat("happiness", rnd(2, 8));
            if (chance(0.55)) {
              c.family.spouse.closeness = clamp(c.family.spouse.closeness - 25, 0, 100);
              changeStat("reputation", -11);
              if (chance(0.3)) {
                addLog("Ton couple éclate après l'infidélité.", "bad");
                c.family.spouse = null;
              } else {
                addLog("Ton infidélité est découverte.", "bad");
              }
            } else {
              addLog("Ton secret reste caché... pour l'instant.", "warn");
            }
          }
        },
        {
          label: "Rompre",
          when: () => !!c.family.spouse,
          run: () => {
            if (!consumeAction()) return;
            c.family.spouse = null;
            changeStat("happiness", rnd(-12, -4));
            addLog("Tu mets fin à la relation.", "warn");
          }
        },
        {
          label: "Avoir un enfant",
          when: () => c.age >= 16 && !!c.family.spouse,
          run: () => {
            if (!consumeAction()) return;
            if (chance(randomFertilityChance())) {
              makeChild(false);
            } else {
              changeStat("happiness", -4);
              addLog("Cette tentative ne donne pas de naissance.", "warn");
            }
          }
        },
        {
          label: "Adopter un enfant",
          when: () => c.age >= 22 && !isPrison,
          run: () => {
            if (!consumeAction()) return;
            spend(rnd(8, 40));
            makeChild(true);
          }
        },
        {
          label: "Faire un test de parentalité",
          when: () => c.family.children.length > 0,
          run: () => {
            if (!consumeAction()) return;
            spend(rnd(3, 14));
            if (chance(0.2)) {
              changeStat("happiness", -12);
              changeStat("sanity", -6);
              addLog("Le test soulève une vérité dérangeante.", "bad");
            } else {
              changeStat("sanity", 4);
              addLog("Le test apaise les doutes.", "good");
            }
          }
        },
        {
          label: "Lancer une procédure de divorce",
          when: () => !!c.family.spouse && c.age >= 18,
          run: () => {
            if (!consumeAction()) return;
            const cost = rnd(8, 35);
            spend(cost);
            changeStat("happiness", -9);
            if (c.family.children.length) {
              const pension = rnd(5, 20);
              c.debt += pension;
              addLog(`Le divorce impose une pension annuelle de ${pension} pièces.`, "warn");
            }
            c.family.spouse = null;
            addLog("Le divorce est prononcé.", "bad");
          }
        }
      ],
      "Argent & biens": [
        {
          label: "Acheter une maison",
          when: () => !isPrison,
          run: () => {
            if (!consumeAction()) return;
            const price = rnd(30, 120);
            spend(price);
            const house = `maison #${rnd(100, 999)}`;
            c.properties.push(house);
            changeStat("happiness", 7);
            addLog(`Tu acquiers ${house}.`, "good");
          }
        },
        {
          label: "Vendre une maison",
          when: () => c.properties.length > 0,
          run: () => {
            if (!consumeAction()) return;
            const sold = removeRandom(c.properties);
            const gain = rnd(25, 140);
            changeMoney(gain);
            changeStat("happiness", -2);
            addLog(`Tu vends ${sold} pour ${gain} pièces.`, "good");
          }
        },
        {
          label: "Acheter une monture / charrette",
          when: () => !isPrison,
          run: () => {
            if (!consumeAction()) return;
            const cost = rnd(12, 55);
            spend(cost);
            const vehicle = pick(["charrette", "cheval de voyage", "calèche", "mulet de bât"]);
            c.vehicles.push(vehicle);
            addLog(`Tu obtiens ${vehicle}.`, "good");
          }
        },
        {
          label: "Acheter un objet de luxe",
          when: () => !isPrison,
          run: () => {
            if (!consumeAction()) return;
            spend(rnd(10, 45));
            const item = pick(RANDOM_ITEMS);
            c.inventory.push(item);
            changeStat("happiness", 6);
            changeStat("reputation", 3);
            addLog(`Tu ajoutes ${item} à tes possessions.`, "good");
          }
        },
        {
          label: "Vendre un objet",
          when: () => c.inventory.length > 0,
          run: () => {
            if (!consumeAction()) return;
            const sold = removeRandom(c.inventory);
            const gain = rnd(4, 28);
            changeMoney(gain);
            addLog(`Tu vends "${sold}" pour ${gain} pièces.`, "neutral");
          }
        },
        {
          label: "Investir dans une guilde marchande",
          when: () => c.age >= 16 && !isPrison,
          run: () => {
            if (!consumeAction()) return;
            const stake = rnd(10, 60);
            spend(stake);
            if (chance(0.45 + c.stats.intelligence / 350)) {
              const profit = rnd(15, 120);
              changeMoney(profit);
              changeStat("happiness", 5);
              addLog(`Investissement rentable (+${profit} pièces).`, "good");
            } else {
              changeStat("happiness", -5);
              addLog("La guilde s'effondre et ton investissement aussi.", "bad");
            }
          }
        },
        {
          label: "Contracter un prêt bancaire",
          when: () => !isPrison,
          run: () => {
            if (!consumeAction()) return;
            const amount = rnd(15, 80);
            c.debt += amount;
            changeMoney(amount);
            addLog(`Tu contractes un prêt de ${amount} pièces.`, "warn");
          }
        },
        {
          label: "Rembourser une partie de la dette",
          when: () => getTotalDebt() > 0 && c.money > 0,
          run: () => {
            if (!consumeAction()) return;
            const payment = Math.min(c.money, rnd(10, 70), getTotalDebt());
            changeMoney(-payment);
            if (c.debt >= payment) {
              c.debt -= payment;
            } else {
              const rest = payment - c.debt;
              c.debt = 0;
              c.universityDebt = Math.max(0, c.universityDebt - rest);
            }
            changeStat("sanity", 4);
            addLog(`Tu rembourses ${Math.round(payment)} pièces de dettes.`, "good");
          }
        },
        {
          label: "Jouer aux dés",
          when: () => true,
          run: () => {
            if (!consumeAction()) return;
            const bet = rnd(2, 25);
            spend(bet);
            if (chance(0.44)) {
              const win = rnd(5, 55);
              changeMoney(win);
              changeStat("happiness", 5);
              addLog(`Tu remportes ${win} pièces à la table de jeu.`, "good");
            } else {
              changeStat("happiness", -4);
              if (chance(0.25)) addCondition("addictions", "jeu");
              addLog("La chance te fuit aux dés.", "warn");
            }
          }
        },
        {
          label: "Partir en voyage",
          when: () => !isPrison,
          run: () => {
            if (!consumeAction()) return;
            spend(rnd(8, 48));
            changeStat("happiness", rnd(4, 12));
            changeStat("reputation", rnd(-2, 6));
            if (chance(0.18)) {
              addCondition("injuries", pick(INJURIES));
              changeStat("health", -9);
              addLog("Le voyage dégénère en incident violent.", "warn");
            } else {
              addLog("Le voyage élargit ton horizon.", "good");
            }
          }
        },
        {
          label: "Acheter un animal",
          when: () => !isPrison,
          run: () => {
            if (!consumeAction()) return;
            spend(rnd(3, 25));
            const animal = pick(RANDOM_ANIMALS);
            c.animals.push(animal);
            changeStat("happiness", 5);
            addLog(`Tu accueilles un ${animal}.`, "good");
          }
        }
      ],
      "Crime & prison": isPrison
        ? [
            {
              label: "Rester discret en cellule",
              when: () => true,
              run: () => {
                if (!consumeAction()) return;
                changeStat("sanity", 2);
                if (chance(0.15)) {
                  c.criminal.yearsLeft = Math.max(0, c.criminal.yearsLeft - 1);
                  addLog("Ton comportement réduit ta peine d'un an.", "good");
                } else {
                  addLog("Tu traverses une journée calme en détention.", "neutral");
                }
              }
            },
            {
              label: "Rejoindre un gang de prison",
              when: () => true,
              run: () => {
                if (!consumeAction()) return;
                c.criminal.gangPrison = true;
                changeStat("reputation", -4);
                changeStat("strength", 3);
                addLog("Tu rejoins un groupe influent derrière les barreaux.", "warn");
              }
            },
            {
              label: "Provoquer une bagarre en prison",
              when: () => true,
              run: () => {
                if (!consumeAction()) return;
                if (chance(0.25)) {
                  kill("bagarre mortelle en prison");
                  return;
                }
                addCondition("injuries", pick(INJURIES));
                changeStat("strength", 4);
                changeStat("health", -6);
                addLog("Tu survis à une bagarre, mais pas sans traces.", "bad");
              }
            },
            {
              label: "Tenter une évasion",
              when: () => true,
              run: () => {
                if (!consumeAction()) return;
                if (chance(0.22 + c.stats.intelligence / 400)) {
                  c.criminal.inPrison = false;
                  c.criminal.yearsLeft = 0;
                  c.criminal.record += 1;
                  changeStat("sanity", -4);
                  addLog("Évasion réussie. Tu redeviens libre, mais traqué(e).", "good");
                } else {
                  c.criminal.yearsLeft += rnd(1, 4);
                  changeStat("happiness", -8);
                  addLog("Évasion ratée: la peine est allongée.", "bad");
                }
              }
            },
            {
              label: "Suivre des cours en détention",
              when: () => true,
              run: () => {
                if (!consumeAction()) return;
                changeStat("intelligence", rnd(2, 7));
                if (chance(0.2)) c.educationLevel = Math.min(4, c.educationLevel + 1);
                addLog("Tu étudies pour mieux préparer la sortie.", "good");
              }
            }
          ]
        : [
            {
              label: "Vol à l'étalage",
              when: () => c.age >= 10,
              run: () => {
                if (!consumeAction()) return;
                tryCrime("vol à l'étalage", 2, 14, 0.26, 0.0, [1, 2]);
              }
            },
            {
              label: "Pickpocket au marché",
              when: () => c.age >= 12,
              run: () => {
                if (!consumeAction()) return;
                tryCrime("pickpocket", 5, 25, 0.32, 0.01, [1, 3]);
              }
            },
            {
              label: "Cambriolage nocturne",
              when: () => c.age >= 16,
              run: () => {
                if (!consumeAction()) return;
                tryCrime("cambriolage", 10, 60, 0.42, 0.03, [2, 5]);
              }
            },
            {
              label: "Braquer un convoi",
              when: () => c.age >= 18,
              run: () => {
                if (!consumeAction()) return;
                tryCrime("braquage de convoi", 20, 130, 0.56, 0.08, [3, 8]);
              }
            },
            {
              label: "Lancer une escroquerie",
              when: () => c.age >= 16,
              run: () => {
                if (!consumeAction()) return;
                tryCrime("escroquerie", 8, 55, 0.38, 0.01, [2, 4]);
              }
            },
            {
              label: "Organiser de la contrebande",
              when: () => c.age >= 18,
              run: () => {
                if (!consumeAction()) return;
                tryCrime("contrebande", 15, 90, 0.47, 0.05, [3, 7]);
              }
            },
            {
              label: "Rejoindre la mafia locale",
              when: () => c.age >= 18,
              run: () => {
                if (!consumeAction()) return;
                c.notoriety = clamp(c.notoriety + 18, -100, 100);
                c.criminal.record += chance(0.2) ? 1 : 0;
                changeStat("reputation", -8);
                changeMoney(rnd(12, 55));
                addLog("Tu deviens affilié(e) à une organisation mafieuse.", "bad");
              }
            },
            {
              label: "Corrompre un officier",
              when: () => c.age >= 18,
              run: () => {
                if (!consumeAction()) return;
                spend(rnd(8, 40));
                if (chance(0.46)) {
                  c.criminal.record = Math.max(0, c.criminal.record - 1);
                  addLog("La corruption efface une partie de ton dossier.", "warn");
                } else {
                  tryCrime("tentative de corruption", 0, 0, 0.48, 0.01, [2, 4]);
                }
              }
            },
            {
              label: "Commanditer un meurtre",
              when: () => c.age >= 21,
              run: () => {
                if (!consumeAction()) return;
                tryCrime("meurtre commandité", 0, 25, 0.68, 0.14, [7, 14]);
                c.notoriety = clamp(c.notoriety + 20, -100, 100);
              }
            }
          ],
      "Loisirs & spiritualité": [
        {
          label: "Participer à un tournoi",
          when: () => !isPrison,
          run: () => {
            if (!consumeAction()) return;
            if (chance(0.38 + c.stats.strength / 280)) {
              const prize = rnd(10, 70);
              changeMoney(prize);
              changeStat("reputation", 8);
              addLog(`Tu brilles au tournoi (+${prize} pièces).`, "good");
            } else {
              addCondition("injuries", pick(INJURIES));
              changeStat("health", -8);
              addLog("Tu quittes le tournoi blessé(e).", "warn");
            }
          }
        },
        {
          label: "Partir à la chasse",
          when: () => !isPrison,
          run: () => {
            if (!consumeAction()) return;
            if (chance(0.52)) {
              changeMoney(rnd(4, 24));
              changeStat("happiness", 6);
              addLog("La chasse est fructueuse.", "good");
            } else {
              addCondition("injuries", pick(INJURIES));
              changeStat("health", -7);
              addLog("La chasse tourne court après un accident.", "warn");
            }
          }
        },
        {
          label: "Effectuer un pèlerinage",
          when: () => !isPrison,
          run: () => {
            if (!consumeAction()) return;
            spend(rnd(6, 25));
            changeStat("sanity", rnd(5, 12));
            changeStat("happiness", rnd(3, 10));
            if (chance(0.1)) {
              addLog("Tu reviens avec un objet rare.", "good");
              c.inventory.push("relique sacrée");
            } else {
              addLog("Le pèlerinage apaise tes doutes.", "good");
            }
          }
        },
        {
          label: "S'investir dans la charité",
          when: () => !isPrison,
          run: () => {
            if (!consumeAction()) return;
            const donation = rnd(4, 30);
            spend(donation);
            changeStat("reputation", 9);
            changeStat("happiness", 4);
            addLog(`Tes dons de ${donation} pièces améliorent ton image publique.`, "good");
          }
        },
        {
          label: "Fêter au village",
          when: () => true,
          run: () => {
            if (!consumeAction()) return;
            spend(rnd(2, 12));
            changeStat("happiness", rnd(4, 9));
            if (chance(0.22)) addCondition("addictions", "alcool");
            if (chance(0.2)) addCondition("injuries", pick(INJURIES));
            addLog("La fête t'emporte, avec son lot de surprises.", "warn");
          }
        },
        {
          label: "Écrire une chronique publique",
          when: () => c.age >= 14 && !isPrison,
          run: () => {
            if (!consumeAction()) return;
            if (chance(0.45 + c.stats.intelligence / 320)) {
              c.celebrity = clamp(c.celebrity + rnd(3, 12), 0, 100);
              changeStat("reputation", 6);
              addLog("Ta chronique devient populaire.", "good");
            } else {
              changeStat("reputation", -4);
              addLog("Ton texte attire moqueries et débats.", "warn");
            }
          }
        },
        {
          label: "Lancer une rumeur ciblée",
          when: () => c.age >= 12,
          run: () => {
            if (!consumeAction()) return;
            if (chance(0.5)) {
              changeStat("reputation", rnd(2, 7));
              c.notoriety = clamp(c.notoriety + 4, -100, 100);
              addLog("La rumeur te sert bien.", "warn");
            } else {
              changeStat("reputation", -9);
              addLog("La rumeur est retracée jusqu'à toi.", "bad");
            }
          }
        }
      ]
    };

    return actions;
  }

  function executeEventChoice(index) {
    if (!game.pendingEvent || !game.character.alive) {
      return;
    }
    const option = game.pendingEvent.choices[index];
    if (!option) {
      return;
    }
    option.run();
    addLog(`Décision annuelle: ${option.label}.`, "neutral");
    game.pendingEvent = null;
    mortalityCheck();
    render();
  }

  function renderStatus() {
    const c = game.character;
    const status = [
      `Année: ${game.worldYear}`,
      `Âge: ${c.age} ans`,
      `Génération: ${c.generation}`,
      `Dynastie: ${c.surname}`,
      `Classe: ${c.socialClass}`,
      `Pays: ${c.country}`,
      `Argent: ${Math.round(c.money)} pièces`,
      `Dettes: ${Math.round(getTotalDebt())} pièces`,
      `Actions restantes: ${c.actionsLeft}`,
      c.criminal.inPrison ? `Prison: ${c.criminal.yearsLeft} an(s)` : "Statut: libre"
    ];
    ui.statusStrip.innerHTML = "";
    status.forEach((line) => {
      const div = document.createElement("div");
      div.className = "status-item";
      div.textContent = line;
      ui.statusStrip.append(div);
    });
  }

  function renderStats() {
    const c = game.character;
    const labels = [
      ["Santé", "health"],
      ["Bonheur", "happiness"],
      ["Intelligence", "intelligence"],
      ["Apparence", "looks"],
      ["Force", "strength"],
      ["Mental", "sanity"],
      ["Réputation", "reputation"]
    ];
    ui.statsList.innerHTML = "";
    labels.forEach(([label, key]) => {
      const wrap = document.createElement("div");
      wrap.className = "stat";
      const value = c.stats[key];
      wrap.innerHTML = `
        <span>${label}</span>
        <div class="bar-wrap"><div class="bar" style="width:${value}%"></div></div>
        <strong>${value}</strong>
      `;
      ui.statsList.append(wrap);
    });
  }

  function renderResources() {
    const c = game.character;
    const lines = [
      `Emploi: ${c.job || "Aucun"}`,
      `Salaire annuel: ${c.salary || 0}`,
      `Niveau d'éducation: ${EDU_LEVELS[c.educationLevel]}`,
      `Dette universitaire: ${Math.round(c.universityDebt)}`,
      `Notoriété criminelle: ${Math.round(c.notoriety)}`,
      `Célébrité: ${Math.round(c.celebrity)}`,
      `Rang politique: ${c.politicalLevel}`,
      `Casier judiciaire: ${c.criminal.record}`
    ];
    ui.resourcesList.innerHTML = "";
    lines.forEach((line) => {
      const li = document.createElement("li");
      li.textContent = line;
      ui.resourcesList.append(li);
    });
  }

  function renderConditions() {
    const c = game.character;
    const entries = [
      ...c.conditions.illnesses.map((entry) => `Maladie: ${entry}`),
      ...c.conditions.injuries.map((entry) => `Blessure: ${entry}`),
      ...c.conditions.mental.map((entry) => `Trouble mental: ${entry}`),
      ...c.conditions.addictions.map((entry) => `Dépendance: ${entry}`)
    ];
    ui.conditionsList.innerHTML = "";
    if (!entries.length) {
      const li = document.createElement("li");
      li.textContent = "Aucune condition majeure.";
      ui.conditionsList.append(li);
      return;
    }
    entries.forEach((entry) => {
      const li = document.createElement("li");
      li.textContent = entry;
      ui.conditionsList.append(li);
    });
  }

  function renderRelations() {
    const c = game.character;
    const lines = [];
    const aliveParents = c.family.parents.filter((p) => p.alive);
    const aliveSiblings = c.family.siblings.filter((s) => s.alive);
    lines.push(`Parents vivants: ${aliveParents.length}`);
    lines.push(`Frères/Sœurs vivants: ${aliveSiblings.length}`);
    lines.push(`Conjoint(e): ${c.family.spouse?.name || "Aucun"}`);
    lines.push(`Enfants vivants: ${aliveChildren().length}`);
    lines.push(`Amis: ${c.social.friends.filter((f) => f.alive).length}`);
    lines.push(`Ennemis: ${c.social.enemies.filter((f) => f.alive).length}`);
    lines.push(`Voisins: ${c.social.neighbors.filter((f) => f.alive).length}`);
    ui.relationsList.innerHTML = "";
    lines.forEach((line) => {
      const li = document.createElement("li");
      li.textContent = line;
      ui.relationsList.append(li);
    });
  }

  function renderEvent() {
    const c = game.character;
    ui.eventCard.innerHTML = "";
    if (!c.alive) {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `<h3 class="event-title">Fin de vie</h3><p>${summaryText()}</p>`;
      const heirs = aliveChildren();
      if (heirs.length) {
        const choices = document.createElement("div");
        choices.className = "choice-list";
        heirs.forEach((heir) => {
          const btn = document.createElement("button");
          btn.className = "choice-btn";
          btn.textContent = `Incarner ${heir.name} (${heir.age} ans)`;
          btn.addEventListener("click", () => continueAsChild(heir.id));
          choices.append(btn);
        });
        wrapper.append(choices);
      } else {
        const p = document.createElement("p");
        p.textContent = "Aucun héritier direct vivant. Lance une nouvelle vie.";
        wrapper.append(p);
      }
      ui.eventCard.append(wrapper);
      return;
    }

    if (!game.pendingEvent) {
      ui.eventCard.innerHTML = `
        <h3 class="event-title">Aucun événement en attente</h3>
        <p>Passe une année pour déclencher un nouvel épisode narratif.</p>
      `;
      return;
    }

    const title = document.createElement("h3");
    title.className = "event-title";
    title.textContent = game.pendingEvent.text;
    const list = document.createElement("div");
    list.className = "choice-list";
    game.pendingEvent.choices.forEach((choice, index) => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.textContent = choice.label;
      btn.addEventListener("click", () => executeEventChoice(index));
      list.append(btn);
    });
    ui.eventCard.append(title, list);
  }

  function renderLog() {
    ui.log.innerHTML = "";
    game.log.forEach((entry) => {
      const line = document.createElement("div");
      line.className = "log-entry";
      if (entry.tone === "good") line.classList.add("tag-good");
      if (entry.tone === "warn") line.classList.add("tag-warn");
      if (entry.tone === "bad") line.classList.add("tag-bad");
      line.textContent = entry.text;
      ui.log.append(line);
    });
  }

  function renderActions() {
    const c = game.character;
    ui.actionsRoot.innerHTML = "";
    const categories = getActionsByCategory();
    Object.entries(categories).forEach(([categoryName, actions]) => {
      const template = ui.actionCategoryTemplate.content.cloneNode(true);
      const details = template.querySelector("details");
      const summary = template.querySelector("summary");
      const buttons = template.querySelector(".action-buttons");
      summary.textContent = categoryName;

      actions.forEach((action) => {
        if (!action.when()) {
          return;
        }
        const btn = document.createElement("button");
        btn.className = "action-btn";
        btn.textContent = action.label;
        btn.disabled = !c.alive || (c.actionsLeft <= 0 && !game.pendingEvent);
        btn.addEventListener("click", () => {
          action.run();
          render();
        });
        buttons.append(btn);
      });
      ui.actionsRoot.append(details);
    });
  }

  function renderCollections() {
    const c = game.character;
    const fill = (element, list, emptyText) => {
      element.innerHTML = "";
      if (!list.length) {
        const li = document.createElement("li");
        li.textContent = emptyText;
        element.append(li);
        return;
      }
      list.slice(0, 20).forEach((entry) => {
        const li = document.createElement("li");
        li.textContent = typeof entry === "string" ? entry : entry.name;
        element.append(li);
      });
    };
    fill(ui.inventoryList, c.inventory, "Inventaire vide.");
    fill(ui.animalsList, c.animals, "Aucun animal.");
    fill(
      ui.childrenList,
      c.family.children
        .filter((child) => child.alive)
        .map((child) => `${child.name} (${child.age} ans${child.adopted ? ", adopté(e)" : ""})`),
      "Aucun enfant vivant."
    );
  }

  function render() {
    renderStatus();
    renderStats();
    renderResources();
    renderConditions();
    renderRelations();
    renderEvent();
    renderLog();
    renderActions();
    renderCollections();
  }

  ui.newLifeBtn.addEventListener("click", () => bootstrapGame());
  ui.ageBtn.addEventListener("click", nextYear);

  bootstrapGame();
})();
