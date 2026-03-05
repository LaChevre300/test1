const SCREEN_WIDTH = 1280;
const SCREEN_HEIGHT = 720;
const TILE_SIZE = 16;
const PLAYER_SIZE = 32;
const DAY_START = 6 * 60;
const DAY_END = 26 * 60;
const SAVE_KEY = "ferme-des-quatre-brumes-save-v1";
const TOOL_KEYS = ["Hoe", "WateringCan", "Axe", "Pickaxe", "Scythe", "FishingRod"];

const ZONES = [
  { id: "farm", x: 0, y: 0, w: 40, h: 30, label: "Ferme" },
  { id: "village", x: 45, y: 0, w: 30, h: 25, label: "Village" },
  { id: "forest", x: 0, y: 35, w: 35, h: 35, label: "Forêt Brumeuse" },
  { id: "river", x: 45, y: 30, w: 25, h: 20, label: "Rivière" },
  { id: "hill", x: 75, y: 30, w: 20, h: 20, label: "Colline Mystique" },
];

const WORLD_WIDTH = 95;
const WORLD_HEIGHT = 70;
const LABORABLE = { x: 9, y: 8, w: 20, h: 20 };
const BRIDGE_TILES = [
  { x: 56, y: 36 },
  { x: 57, y: 36 },
  { x: 58, y: 36 },
  { x: 59, y: 36 },
];

const WEATHER_TABLE = [
  { id: "sunny", chance: 70 },
  { id: "rain", chance: 20 },
  { id: "storm", chance: 10 },
];

const SEASONS = ["spring", "summer", "autumn", "winter"];
const SEASON_LABELS = {
  fr: { spring: "Printemps", summer: "Été", autumn: "Automne", winter: "Hiver" },
  en: { spring: "Spring", summer: "Summer", autumn: "Autumn", winter: "Winter" },
};

const TRANSLATIONS = {
  fr: {
    titlePitch: "Vacances à la campagne, ferme mystique et secrets dans les brumes.",
    langButton: "Langue: Français",
    continue: "Continuer",
    newGame: "Nouvelle partie",
    noSave: "Aucune sauvegarde trouvée.",
    day: "Jour",
    energy: "Énergie",
    money: "Argent",
    weather: "Météo",
    season: "Saison",
    activeTool: "Outil",
    selectedSeed: "Graine",
    none: "Aucune",
    inventory: "Inventaire",
    journal: "Journal",
    crafting: "Craft",
    pause: "Pause",
    save: "Sauvegarder",
    close: "Fermer",
    shippingBin: "Boîte de vente",
    chest: "Coffre",
    transferChest: "Vers coffre",
    transferInv: "Vers inventaire",
    sellOne: "Vendre x1",
    questCompleted: "Quête terminée",
    shopClosed: "La boutique est fermée (09:00-18:00).",
    shopTitle: "Boutique de Pierre",
    buy: "Acheter",
    build: "Construire",
    openInventory: "Tab: inventaire",
    openJournal: "J: journal",
    openCraft: "C: craft",
    interact: "E: interagir",
    speedTime: "Espace: temps x4",
    fishingTitle: "Pêche",
    fishingHint: "Maintiens E ou clic gauche dans la zone verte.",
    fishingWin: "Poisson attrapé !",
    fishingLose: "Le poisson s'est échappé...",
    festivalTitle: "Festival de saison",
    festivalClose: "Profite de la journée !",
    endingTitle: "Les Brumes se lèvent",
    endingText: "Le secret ancien est apaisé. La vallée respire enfin.",
    endingStats: "Statistiques",
    newGamePlus: "New Game+",
    manualSaveDone: "Sauvegarde manuelle effectuée.",
    autoSaveDone: "Sauvegarde automatique de fin de journée.",
    hillLocked: "La Colline Mystique est verrouillée. Parle à Lucas.",
    bridgeLocked: "Le pont est brisé. Répare-le d'abord.",
    notEnoughEnergy: "Pas assez d'énergie.",
    cropOutSeason: "Cette culture n'aime pas cette saison.",
    noSeedSelected: "Choisis une graine dans l'inventaire.",
    quest: "Quête",
    hearts: "Cœurs",
  },
  en: {
    titlePitch: "Countryside vacation, mystical farm and secrets hidden in the mist.",
    langButton: "Language: English",
    continue: "Continue",
    newGame: "New Game",
    noSave: "No save found.",
    day: "Day",
    energy: "Energy",
    money: "Money",
    weather: "Weather",
    season: "Season",
    activeTool: "Tool",
    selectedSeed: "Seed",
    none: "None",
    inventory: "Inventory",
    journal: "Journal",
    crafting: "Crafting",
    pause: "Pause",
    save: "Save",
    close: "Close",
    shippingBin: "Shipping bin",
    chest: "Chest",
    transferChest: "To chest",
    transferInv: "To inventory",
    sellOne: "Ship x1",
    questCompleted: "Quest completed",
    shopClosed: "The shop is closed (09:00-18:00).",
    shopTitle: "Pierre's Shop",
    buy: "Buy",
    build: "Build",
    openInventory: "Tab: inventory",
    openJournal: "J: journal",
    openCraft: "C: crafting",
    interact: "E: interact",
    speedTime: "Space: time x4",
    fishingTitle: "Fishing",
    fishingHint: "Hold E or left click within the green zone.",
    fishingWin: "Fish caught!",
    fishingLose: "The fish got away...",
    festivalTitle: "Season Festival",
    festivalClose: "Enjoy your day!",
    endingTitle: "The Mists Recede",
    endingText: "The old secret is soothed. The valley can breathe again.",
    endingStats: "Stats",
    newGamePlus: "New Game+",
    manualSaveDone: "Manual save completed.",
    autoSaveDone: "End-of-day autosave complete.",
    hillLocked: "Mystic Hill is locked. Speak with Lucas.",
    bridgeLocked: "The bridge is broken. Repair it first.",
    notEnoughEnergy: "Not enough energy.",
    cropOutSeason: "This crop does not grow this season.",
    noSeedSelected: "Select a seed from inventory.",
    quest: "Quest",
    hearts: "Hearts",
  },
};

const ITEM_DEFS = {
  wood: baseItem("wood", "Bois", "Wood", "resource", 8),
  stone: baseItem("stone", "Pierre", "Stone", "resource", 10),
  fiber: baseItem("fiber", "Fibre", "Fiber", "resource", 6),
  fish_common: baseItem("fish_common", "Poisson argenté", "Silver Fish", "food", 45),
  fish_river: baseItem("fish_river", "Truite de rivière", "River Trout", "food", 70),
  fish_rare: baseItem("fish_rare", "Lune bleue", "Blue Moonfish", "food", 150),
  egg: baseItem("egg", "Œuf", "Egg", "animal", 50),
  milk: baseItem("milk", "Lait", "Milk", "animal", 120),
  wool: baseItem("wool", "Laine", "Wool", "animal", 140),
  truffle: baseItem("truffle", "Truffe", "Truffle", "animal", 250),
  duck_feather: baseItem("duck_feather", "Plume soyeuse", "Silky Feather", "animal", 95),
  cheese: baseItem("cheese", "Fromage", "Cheese", "food", 240),
  mayonnaise: baseItem("mayonnaise", "Mayonnaise", "Mayonnaise", "food", 75),
  cloth: baseItem("cloth", "Tissu fin", "Fine Cloth", "resource", 220),
  truffle_oil: baseItem("truffle_oil", "Huile de truffe", "Truffle Oil", "food", 420),
  jam: baseItem("jam", "Confiture", "Jam", "food", 180),
  smoked_fish: baseItem("smoked_fish", "Poisson fumé", "Smoked Fish", "food", 160),
  hay_bale: baseItem("hay_bale", "Botte de foin", "Hay Bale", "resource", 30),
  fertilizer: baseItem("fertilizer", "Engrais", "Fertilizer", "resource", 35),
  fence: baseItem("fence", "Clôture", "Fence", "resource", 50),
  lamp: baseItem("lamp", "Lampe", "Lamp", "resource", 100),
  repair_kit: baseItem("repair_kit", "Kit de réparation", "Repair Kit", "resource", 180),
  ancient_charm: baseItem("ancient_charm", "Charme ancien", "Ancient Charm", "resource", 0),
  "machine_cheese_press": baseItem("machine_cheese_press", "Fromagerie", "Cheese Press", "resource", 0),
  "machine_mayo_bench": baseItem("machine_mayo_bench", "Atelier Mayo", "Mayo Bench", "resource", 0),
  "machine_loom": baseItem("machine_loom", "Métier à laine", "Loom", "resource", 0),
  "machine_oil_press": baseItem("machine_oil_press", "Presse à huile", "Oil Press", "resource", 0),
  "machine_jam_jar": baseItem("machine_jam_jar", "Marmite à confiture", "Jam Pot", "resource", 0),
  "machine_smoker": baseItem("machine_smoker", "Fumoir", "Smoker", "resource", 0),
};

const CROPS = [
  crop("carrot", "Carotte", "Carrot", "spring", 4, 20, 35, 0),
  crop("turnip", "Navet", "Turnip", "spring", 3, 15, 25, 0),
  crop("strawberry", "Fraise", "Strawberry", "spring", 8, 100, 120, 3),
  crop("potato", "Pomme de terre", "Potato", "spring", 5, 35, 50, 0),
  crop("tomato", "Tomate", "Tomato", "summer", 7, 50, 60, 3),
  crop("corn", "Maïs", "Corn", "summer", 10, 80, 100, 4),
  crop("sunflower", "Tournesol", "Sunflower", "summer", 6, 45, 90, 0),
  crop("melon", "Melon", "Melon", "summer", 11, 120, 170, 0),
  crop("pumpkin", "Citrouille", "Pumpkin", "autumn", 10, 100, 180, 0),
  crop("apple", "Pomme", "Apple", "autumn", 8, 70, 120, 2),
  crop("mushroom", "Champignon", "Mushroom", "autumn", 5, 30, 80, 0),
  crop("cranberry", "Canneberge", "Cranberry", "autumn", 6, 65, 90, 2),
];

for (const c of CROPS) {
  ITEM_DEFS[c.seedItem] = baseItem(c.seedItem, `Graines ${c.nameFr}`, `${c.nameEn} Seeds`, "seed", c.seedPrice);
  ITEM_DEFS[c.harvestItem] = baseItem(c.harvestItem, c.nameFr, c.nameEn, "crop", c.harvestPrice);
}

const ANIMALS = {
  chicken: animal("chicken", "Poule", "Chicken", "coop", 800, "egg"),
  cow: animal("cow", "Vache", "Cow", "barn", 2500, "milk"),
  sheep: animal("sheep", "Mouton", "Sheep", "barn", 2000, "wool"),
  pig: animal("pig", "Cochon", "Pig", "barn", 3000, "truffle"),
  duck: animal("duck", "Canard", "Duck", "coop", 1500, "duck_feather"),
};

const RECIPES = [
  recipe("fence", "Clôture", "Fence", { wood: 2 }, { fence: 1 }),
  recipe("fertilizer", "Engrais", "Fertilizer", { fiber: 5 }, { fertilizer: 1 }),
  recipe("hay_bale", "Botte de foin", "Hay Bale", { fiber: 3 }, { hay_bale: 1 }),
  recipe("mayo", "Mayonnaise", "Mayonnaise", { egg: 1 }, { mayonnaise: 1 }),
  recipe("repair_kit", "Kit de réparation", "Repair Kit", { wood: 5, stone: 5 }, { repair_kit: 1 }),
  recipe("jam", "Confiture", "Jam", { strawberry_crop: 1 }, { jam: 1 }),
  recipe("cloth", "Tissu fin", "Fine Cloth", { wool: 1 }, { cloth: 1 }),
  recipe("smoked_fish", "Poisson fumé", "Smoked Fish", { fish_common: 1, wood: 1 }, { smoked_fish: 1 }),
  recipe("cheese_press", "Fromagerie", "Cheese Press", { wood: 10, stone: 5 }, { machine_cheese_press: 1 }),
  recipe("mayo_bench", "Atelier Mayo", "Mayo Bench", { wood: 8, stone: 4 }, { machine_mayo_bench: 1 }),
  recipe("loom", "Métier à laine", "Loom", { wood: 12, fiber: 8 }, { machine_loom: 1 }),
  recipe("oil_press", "Presse à huile", "Oil Press", { wood: 14, stone: 6 }, { machine_oil_press: 1 }),
];

const QUESTS = [
  q("q1", "Aidez Pierre", "Livrer 10 carottes à Pierre.", "deliver", { item: "carrot_crop", qty: 10, npc: "Pierre" }, { money: 200 }),
  q("q2", "Retour de la terre", "Labourer 30 cases.", "count", { stat: "tilled", qty: 30 }, { money: 100 }),
  q("q3", "Main verte", "Récolter 20 cultures.", "count", { stat: "harvested", qty: 20 }, { money: 180 }),
  q("q4", "Bois du matin", "Collecter 50 bois.", "count", { stat: "woodCollected", qty: 50 }, { item: "fertilizer", qty: 4 }),
  q("q5", "Conseil du maire", "Livrer 30 pierres à Lucas.", "deliver", { item: "stone", qty: 30, npc: "Lucas" }, { unlockHill: true }),
  q("q6", "Réparer le pont", "Fabriquer et utiliser 1 kit de réparation.", "count", { stat: "bridgeRepaired", qty: 1 }, { money: 250 }),
  q("q7", "Vie au poulailler", "Avoir 2 poules.", "count", { stat: "chickenOwned", qty: 2 }, { money: 200 }),
  q("q8", "Petit déjeuner", "Livrer 8 œufs à Marie.", "deliver", { item: "egg", qty: 8, npc: "Marie" }, { friendship: ["Marie", 80] }),
  q("q9", "La grange", "Construire une grange.", "count", { stat: "barnBuilt", qty: 1 }, { money: 300 }),
  q("q10", "Le lait du soir", "Avoir au moins 1 vache.", "count", { stat: "cowOwned", qty: 1 }, { item: "machine_cheese_press", qty: 1 }),
  q("q11", "Sol vivant", "Crafter 5 engrais.", "count", { stat: "fertilizerCrafted", qty: 5 }, { money: 250 }),
  q("q12", "Souffle de la grotte", "Explorer la grotte de la Forêt Brumeuse.", "count", { stat: "caveVisited", qty: 1 }, { item: "ancient_charm", qty: 1 }),
  q("q13", "Sourire de Marie", "Atteindre 2 cœurs avec Marie.", "count", { stat: "marieHearts", qty: 2 }, { money: 300 }),
  q("q14", "Rivière généreuse", "Pêcher 10 poissons.", "count", { stat: "fishCaught", qty: 10 }, { item: "ancient_charm", qty: 1 }),
  q("q15", "Fête d'automne", "Récolter 10 citrouilles.", "count", { stat: "pumpkinHarvest", qty: 10 }, { money: 400 }),
  q("q16", "Atelier laitier", "Poser 1 machine Fromagerie.", "count", { stat: "cheesePressPlaced", qty: 1 }, { money: 220 }),
  q("q17", "Plateau gourmand", "Produire 3 fromages.", "count", { stat: "cheeseMade", qty: 3 }, { item: "ancient_charm", qty: 1 }),
  q("q18", "Grande ferme", "Avoir 5 animaux.", "count", { stat: "animalOwned", qty: 5 }, { money: 500 }),
  q("q19", "Prêt pour la colline", "Avoir tous les bâtiments.", "count", { stat: "allBuildings", qty: 1 }, { money: 600 }),
  q("q20", "Dévoiler les Brumes", "Rituel aux ruines de la Colline Mystique.", "count", { stat: "mistsRevealed", qty: 1 }, { ending: true }),
];

const NPCS = [
  npc("Pierre", "Marchand", "gem", { x: 55, y: 8 }),
  npc("Marie", "Aubergiste", "egg", { x: 63, y: 9 }),
  npc("Lucas", "Maire", "carrot_crop", { x: 59, y: 14 }),
  npc("Elodie", "Botaniste", "mushroom_crop", { x: 50, y: 18 }),
  npc("Nino", "Pêcheur", "fish_river", { x: 52, y: 34 }),
  npc("Iris", "Artisane", "cloth", { x: 67, y: 16 }),
];

class Game {
  constructor() {
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.hud = document.getElementById("hud");
    this.messageLog = document.getElementById("message-log");
    this.overlays = {
      title: document.getElementById("title-overlay"),
      inventory: document.getElementById("inventory-overlay"),
      journal: document.getElementById("journal-overlay"),
      craft: document.getElementById("craft-overlay"),
      shop: document.getElementById("shop-overlay"),
      pause: document.getElementById("pause-overlay"),
      festival: document.getElementById("festival-overlay"),
      ending: document.getElementById("ending-overlay"),
      fishing: document.getElementById("fishing-overlay"),
    };

    this.lang = "fr";
    this.keys = new Set();
    this.pressed = new Set();
    this.mouse = { x: 0, y: 0, worldX: 0, worldY: 0, clicked: false, down: false };
    this.running = false;
    this.lastFrame = 0;
    this.openMenu = "title";
    this.shopTab = "seeds";
    this.inventoryCategory = "all";
    this.selectedInventoryIndex = 0;
    this.selectedSeed = null;
    this.messageTimeout = null;
    this.fishingState = null;
    this.isNewGamePlus = false;

    this.camera = { x: 0, y: 0 };
    this.dayMinute = DAY_START;
    this.day = 1;
    this.seasonIndex = 0;
    this.weather = "sunny";
    this.player = {
      x: 8 * TILE_SIZE,
      y: 7 * TILE_SIZE,
      speed: 64,
      energy: 100,
      money: 500,
      activeToolIndex: 0,
      wateringLevel: 1,
      inventories: {
        bag: createSlots(36),
        chest: createSlots(100),
        shipping: createSlots(10),
      },
    };

    this.stats = {
      tilled: 0,
      harvested: 0,
      woodCollected: 0,
      bridgeRepaired: 0,
      chickenOwned: 0,
      cowOwned: 0,
      fertilizerCrafted: 0,
      caveVisited: 0,
      marieHearts: 0,
      fishCaught: 0,
      pumpkinHarvest: 0,
      cheesePressPlaced: 0,
      cheeseMade: 0,
      animalOwned: 0,
      allBuildings: 0,
      mistsRevealed: 0,
      totalMoneyEarned: 0,
      daysPlayed: 0,
    };

    this.flags = {
      bridgeRepaired: false,
      hillUnlocked: false,
      coopBuilt: false,
      barnBuilt: false,
      caveOpen: false,
      endingSeen: false,
    };

    this.dailyCounters = {
      treeCut: 0,
      rocksBroken: 0,
      fishCaught: 0,
      giftedToday: {},
    };

    this.farmPlots = {};
    this.resources = { trees: [], rocks: [], grass: [] };
    this.animals = [];
    this.fences = [];
    this.machines = [];

    this.npcs = NPCS.map((n) => ({
      ...n,
      x: n.home.x,
      y: n.home.y,
      friendship: 0,
      talkedToday: false,
    }));

    this.questState = {
      active: 0,
      completed: [],
    };

    this.bindDom();
    this.bindInput();
    this.startTitle();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  t(key) {
    return TRANSLATIONS[this.lang][key] ?? key;
  }

  startTitle() {
    this.showOverlay("title");
    this.renderTitleTexts();
  }

  renderTitleTexts() {
    document.getElementById("title-pitch").textContent = this.t("titlePitch");
    document.getElementById("new-game-btn").textContent = this.t("newGame");
    document.getElementById("load-game-btn").textContent = this.t("continue");
    document.getElementById("lang-toggle-btn").textContent = this.t("langButton");
  }

  bindDom() {
    document.getElementById("new-game-btn").addEventListener("click", () => {
      this.newGame(false);
    });
    document.getElementById("load-game-btn").addEventListener("click", () => {
      if (!this.loadGame()) {
        this.say(this.t("noSave"));
      }
    });
    document.getElementById("lang-toggle-btn").addEventListener("click", () => {
      this.lang = this.lang === "fr" ? "en" : "fr";
      this.renderTitleTexts();
      this.renderActiveMenu();
    });

    const overlayRoot = document.getElementById("overlay-root");
    overlayRoot.addEventListener("click", (ev) => {
      const target = ev.target;
      if (!(target instanceof HTMLElement)) return;
      const action = target.dataset.action;
      if (!action) return;
      this.handleUiAction(action, target.dataset.payload || "");
    });
  }

  bindInput() {
    window.addEventListener("keydown", (ev) => {
      if (["Tab", "Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(ev.code)) {
        ev.preventDefault();
      }
      this.keys.add(ev.code);
      this.pressed.add(ev.code);
    });
    window.addEventListener("keyup", (ev) => {
      this.keys.delete(ev.code);
    });
    this.canvas.addEventListener("mousemove", (ev) => {
      const rect = this.canvas.getBoundingClientRect();
      const px = ((ev.clientX - rect.left) / rect.width) * SCREEN_WIDTH;
      const py = ((ev.clientY - rect.top) / rect.height) * SCREEN_HEIGHT;
      this.mouse.x = px;
      this.mouse.y = py;
    });
    this.canvas.addEventListener("mousedown", (ev) => {
      if (ev.button === 0) {
        this.mouse.down = true;
        this.mouse.clicked = true;
      }
    });
    window.addEventListener("mouseup", (ev) => {
      if (ev.button === 0) this.mouse.down = false;
    });
  }

  newGame(isPlus) {
    this.isNewGamePlus = isPlus;
    this.dayMinute = DAY_START;
    this.day = 1;
    this.seasonIndex = 0;
    this.weather = this.rollWeather();
    this.player.x = 8 * TILE_SIZE;
    this.player.y = 7 * TILE_SIZE;
    this.player.energy = 100;
    this.player.money = isPlus ? Math.floor(this.stats.totalMoneyEarned * 0.2) : 500;
    this.player.activeToolIndex = 0;
    this.player.wateringLevel = 1;
    this.player.inventories.bag = createSlots(36);
    this.player.inventories.chest = createSlots(100);
    this.player.inventories.shipping = createSlots(10);
    this.selectedSeed = "carrot_seed";
    this.farmPlots = {};
    this.resources = { trees: [], rocks: [], grass: [] };
    this.animals = [];
    this.fences = [];
    this.machines = [];
    this.flags = {
      bridgeRepaired: false,
      hillUnlocked: false,
      coopBuilt: false,
      barnBuilt: false,
      caveOpen: false,
      endingSeen: false,
    };
    this.stats = {
      tilled: 0,
      harvested: 0,
      woodCollected: 0,
      bridgeRepaired: 0,
      chickenOwned: 0,
      cowOwned: 0,
      fertilizerCrafted: 0,
      caveVisited: 0,
      marieHearts: 0,
      fishCaught: 0,
      pumpkinHarvest: 0,
      cheesePressPlaced: 0,
      cheeseMade: 0,
      animalOwned: 0,
      allBuildings: 0,
      mistsRevealed: 0,
      totalMoneyEarned: 0,
      daysPlayed: 0,
    };
    this.dailyCounters = { treeCut: 0, rocksBroken: 0, fishCaught: 0, giftedToday: {} };
    this.npcs = NPCS.map((n) => ({ ...n, x: n.home.x, y: n.home.y, friendship: 0, talkedToday: false }));
    this.questState = { active: 0, completed: [] };
    this.generateResources();
    this.seedStarterItems();
    this.openMenu = null;
    this.running = true;
    this.showOverlay(null);
    this.say("Bienvenue à la Ferme des Quatre Brumes.");
  }

  seedStarterItems() {
    addItem(this.player.inventories.bag, "carrot_seed", 12);
    addItem(this.player.inventories.bag, "turnip_seed", 8);
    addItem(this.player.inventories.bag, "fiber", 10);
    addItem(this.player.inventories.bag, "wood", 15);
  }

  handleUiAction(action, payload) {
    const [type, id] = action.split(":");
    const value = payload || id || "";
    if (type === "close") {
      this.openMenu = null;
      this.showOverlay(null);
      return;
    }
    if (type === "toggleLang") {
      this.lang = this.lang === "fr" ? "en" : "fr";
      this.renderTitleTexts();
      this.renderActiveMenu();
      return;
    }
    if (type === "save") {
      this.saveGame();
      this.say(this.t("manualSaveDone"));
      this.renderActiveMenu();
      return;
    }
    if (type === "open") {
      this.openMenu = value;
      this.showOverlay(value);
      this.renderActiveMenu();
      return;
    }
    if (type === "selectInv") {
      this.selectedInventoryIndex = Number(value);
      this.renderActiveMenu();
      return;
    }
    if (type === "setCategory") {
      this.inventoryCategory = value;
      this.renderActiveMenu();
      return;
    }
    if (type === "useSeed") {
      this.selectedSeed = value;
      this.say(`${this.t("selectedSeed")}: ${itemName(value, this.lang)}`);
      this.renderActiveMenu();
      return;
    }
    if (type === "toChest") {
      this.moveItemOne(this.player.inventories.bag, this.player.inventories.chest, value);
      this.renderActiveMenu();
      return;
    }
    if (type === "toBag") {
      this.moveItemOne(this.player.inventories.chest, this.player.inventories.bag, value);
      this.renderActiveMenu();
      return;
    }
    if (type === "shipOne") {
      this.moveItemOne(this.player.inventories.bag, this.player.inventories.shipping, value);
      this.renderActiveMenu();
      return;
    }
    if (type === "buy") {
      this.buyShopItem(value);
      this.renderActiveMenu();
      return;
    }
    if (type === "craft") {
      this.craftRecipe(value);
      this.renderActiveMenu();
      return;
    }
    if (type === "festivalClose") {
      this.openMenu = null;
      this.showOverlay(null);
      return;
    }
    if (type === "newGamePlus") {
      this.newGame(true);
      return;
    }
  }

  moveItemOne(from, to, itemId) {
    if (!removeItem(from, itemId, 1)) return;
    if (!addItem(to, itemId, 1)) {
      addItem(from, itemId, 1);
      this.say("Capacité atteinte.");
    }
  }

  saveGame() {
    const payload = {
      lang: this.lang,
      dayMinute: this.dayMinute,
      day: this.day,
      seasonIndex: this.seasonIndex,
      weather: this.weather,
      player: this.player,
      farmPlots: this.farmPlots,
      resources: this.resources,
      animals: this.animals,
      fences: this.fences,
      machines: this.machines,
      npcs: this.npcs,
      questState: this.questState,
      stats: this.stats,
      flags: this.flags,
      selectedSeed: this.selectedSeed,
      isNewGamePlus: this.isNewGamePlus,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  }

  loadGame() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    try {
      const data = JSON.parse(raw);
      this.lang = data.lang || "fr";
      this.dayMinute = data.dayMinute ?? DAY_START;
      this.day = data.day ?? 1;
      this.seasonIndex = data.seasonIndex ?? 0;
      this.weather = data.weather ?? "sunny";
      this.player = data.player;
      this.farmPlots = data.farmPlots ?? {};
      this.resources = data.resources ?? { trees: [], rocks: [], grass: [] };
      this.animals = data.animals ?? [];
      this.fences = data.fences ?? [];
      this.machines = data.machines ?? [];
      this.npcs = data.npcs ?? NPCS.map((n) => ({ ...n, x: n.home.x, y: n.home.y, friendship: 0 }));
      this.questState = data.questState ?? { active: 0, completed: [] };
      this.stats = data.stats ?? this.stats;
      this.flags = data.flags ?? this.flags;
      this.selectedSeed = data.selectedSeed ?? null;
      this.isNewGamePlus = data.isNewGamePlus ?? false;
      this.openMenu = null;
      this.running = true;
      this.showOverlay(null);
      this.renderTitleTexts();
      return true;
    } catch (_err) {
      return false;
    }
  }

  showOverlay(menu) {
    for (const [name, node] of Object.entries(this.overlays)) {
      node.classList.toggle("visible", name === menu);
      if (name !== menu) node.innerHTML = "";
    }
  }

  loop(ts) {
    const dt = Math.min(0.05, (ts - this.lastFrame) / 1000 || 0);
    this.lastFrame = ts;
    this.update(dt);
    this.render();
    this.pressed.clear();
    this.mouse.clicked = false;
    requestAnimationFrame(this.loop);
  }

  update(dt) {
    if (!this.running) return;
    this.handleMenuToggles();
    if (this.openMenu) {
      if (this.openMenu === "fishing") this.updateFishing(dt);
      return;
    }
    const speedFactor = this.keys.has("Space") ? 4 : 1;
    this.updateTime(dt * speedFactor);
    this.updateNpcPositions();
    this.updateAnimals();
    this.handleMovement(dt);
    this.handleInputs();
    this.checkQuestProgress();
  }

  handleMenuToggles() {
    if (this.pressed.has("Escape")) {
      if (this.openMenu) {
        this.openMenu = null;
        this.showOverlay(null);
      } else {
        this.openMenu = "pause";
        this.showOverlay("pause");
        this.renderActiveMenu();
      }
    }
    if (this.openMenu) return;
    if (this.pressed.has("Tab")) {
      this.openMenu = "inventory";
      this.showOverlay("inventory");
      this.renderActiveMenu();
    } else if (this.pressed.has("KeyJ")) {
      this.openMenu = "journal";
      this.showOverlay("journal");
      this.renderActiveMenu();
    } else if (this.pressed.has("KeyC")) {
      this.openMenu = "craft";
      this.showOverlay("craft");
      this.renderActiveMenu();
    }
  }

  renderActiveMenu() {
    if (this.openMenu === "inventory") this.renderInventory();
    if (this.openMenu === "journal") this.renderJournal();
    if (this.openMenu === "craft") this.renderCrafting();
    if (this.openMenu === "shop") this.renderShop();
    if (this.openMenu === "pause") this.renderPause();
    if (this.openMenu === "festival") this.renderFestival();
    if (this.openMenu === "ending") this.renderEnding();
    if (this.openMenu === "fishing") this.renderFishing();
  }

  renderInventory() {
    const overlay = this.overlays.inventory;
    const bagSlots = this.player.inventories.bag.map((slot, i) => {
      if (!slot) return renderSlot(slot, this.lang, i === this.selectedInventoryIndex, `selectInv:${i}`);
      if (this.inventoryCategory !== "all" && ITEM_DEFS[slot.id]?.category !== this.inventoryCategory) {
        return `<div class="slot"></div>`;
      }
      return renderSlot(slot, this.lang, i === this.selectedInventoryIndex, `selectInv:${i}`);
    }).join("");
    const chestSlots = this.player.inventories.chest.filter(Boolean).slice(0, 24).map((slot) => renderCompact(slot, this.lang, `toBag:${slot.id}`)).join("") || `<p class="small">Vide</p>`;
    const shippingSlots = this.player.inventories.shipping.filter(Boolean).map((slot) => renderCompact(slot, this.lang, null)).join("") || `<p class="small">Vide</p>`;

    const seeds = this.player.inventories.bag
      .filter((s) => s && ITEM_DEFS[s.id]?.category === "seed")
      .map((s) => `<button data-action="useSeed:${s.id}" data-payload="${s.id}">${itemName(s.id, this.lang)} x${s.qty}</button>`)
      .join(" ");

    overlay.innerHTML = `
      <div class="window">
        <h2>${this.t("inventory")}</h2>
        <div class="row">
          <button data-action="setCategory:all" data-payload="all">Tout</button>
          <button data-action="setCategory:seed" data-payload="seed">Graines</button>
          <button data-action="setCategory:crop" data-payload="crop">Cultures</button>
          <button data-action="setCategory:resource" data-payload="resource">Ressources</button>
          <button data-action="setCategory:animal" data-payload="animal">Animaux</button>
          <button data-action="close:inventory">${this.t("close")}</button>
        </div>
        <h3>${this.t("selectedSeed")}: ${this.selectedSeed ? itemName(this.selectedSeed, this.lang) : this.t("none")}</h3>
        <div class="row">${seeds || "<span class='small'>Aucune graine.</span>"}</div>
        <h3>Sac 6x6</h3>
        <div class="grid">${bagSlots}</div>
        <div class="row">
          <button data-action="toChest:slot" data-payload="${this.currentSelectedId() ?? ""}">${this.t("transferChest")}</button>
          <button data-action="shipOne:slot" data-payload="${this.currentSelectedId() ?? ""}">${this.t("sellOne")}</button>
        </div>
        <h3>${this.t("chest")} (100)</h3>
        <div class="row">${chestSlots}</div>
        <h3>${this.t("shippingBin")} (10)</h3>
        <div class="row">${shippingSlots}</div>
      </div>
    `;
  }

  currentSelectedId() {
    return this.player.inventories.bag[this.selectedInventoryIndex]?.id ?? null;
  }

  renderJournal() {
    const overlay = this.overlays.journal;
    const activeQuest = QUESTS[this.questState.active];
    const completedIds = new Set(this.questState.completed);
    const cards = QUESTS.map((quest, index) => {
      const done = completedIds.has(quest.id);
      const active = index === this.questState.active;
      const progress = this.questProgressText(quest);
      return `
        <div class="quest ${done ? "success" : ""}">
          <strong>${quest.title}</strong> ${active ? `<span class="badge">${this.t("quest")} active</span>` : ""}
          <div>${quest.description}</div>
          <div class="small">${progress}</div>
          <div class="small">${done ? "Terminé" : "En cours"}</div>
        </div>
      `;
    }).join("");

    overlay.innerHTML = `
      <div class="window">
        <h2>${this.t("journal")}</h2>
        ${activeQuest ? `<p><strong>Actuelle:</strong> ${activeQuest.title}</p>` : "<p>Toutes les quêtes sont terminées.</p>"}
        ${cards}
        <button data-action="close:journal">${this.t("close")}</button>
      </div>
    `;
  }

  renderCrafting() {
    const overlay = this.overlays.craft;
    const cards = RECIPES.map((r) => {
      const can = this.hasIngredients(r.inputs);
      const inputsText = Object.entries(r.inputs).map(([id, qty]) => `${itemName(id, this.lang)} x${qty}`).join(", ");
      const outputsText = Object.entries(r.outputs).map(([id, qty]) => `${itemName(id, this.lang)} x${qty}`).join(", ");
      return `
        <div class="quest">
          <strong>${this.lang === "fr" ? r.nameFr : r.nameEn}</strong>
          <div class="small">${inputsText} → ${outputsText}</div>
          <button data-action="craft:${r.id}" data-payload="${r.id}" ${can ? "" : "disabled"}>${this.t("crafting")}</button>
        </div>
      `;
    }).join("");
    overlay.innerHTML = `
      <div class="window">
        <h2>${this.t("crafting")} (12 recettes)</h2>
        ${cards}
        <button data-action="close:craft">${this.t("close")}</button>
      </div>
    `;
  }

  renderShop() {
    const overlay = this.overlays.shop;
    const season = this.currentSeason();
    const seedItems = CROPS.map((c) => {
      const price = this.dynamicPrice(c.seedPrice, c.season === season);
      const out = c.season !== season;
      return `
        <div class="quest">
          <strong>${itemName(c.seedItem, this.lang)}</strong> <span class="badge">${price}$</span>
          <div class="small">${SEASON_LABELS[this.lang][c.season]} | ${out ? "Hors saison (rare +10%)" : "Abondant (-20%)"}</div>
          <button data-action="buy:${c.seedItem}" data-payload="${c.seedItem}">${this.t("buy")}</button>
        </div>
      `;
    }).join("");

    const animalItems = Object.values(ANIMALS).map((a) => `
      <div class="quest">
        <strong>${this.lang === "fr" ? a.nameFr : a.nameEn}</strong>
        <div class="small">${a.price}$ | ${a.building === "coop" ? "Poulailler" : "Grange"}</div>
        <button data-action="buy:animal_${a.id}" data-payload="animal_${a.id}">${this.t("buy")}</button>
      </div>
    `).join("");

    overlay.innerHTML = `
      <div class="window">
        <h2>${this.t("shopTitle")} - ${this.player.money}$</h2>
        <div class="row">
          <h3>Graines</h3>
        </div>
        ${seedItems}
        <h3>Animaux</h3>
        ${animalItems}
        <h3>Améliorations / Déco</h3>
        <div class="quest">
          <strong>Arrosoir cuivre</strong> <span class="badge">2000$</span>
          <div class="small">Vitesse arrosage x1.5</div>
          <button data-action="buy:upgrade_watering" data-payload="upgrade_watering">${this.t("buy")}</button>
        </div>
        <div class="quest">
          <strong>${this.t("build")} Poulailler</strong> <span class="badge">500 bois + 200 pierre</span>
          <button data-action="buy:build_coop" data-payload="build_coop">${this.t("build")}</button>
        </div>
        <div class="quest">
          <strong>${this.t("build")} Grange</strong> <span class="badge">1000 bois + 500 pierre</span>
          <button data-action="buy:build_barn" data-payload="build_barn">${this.t("build")}</button>
        </div>
        <div class="quest">
          <strong>Lampe</strong> <span class="badge">100$</span>
          <button data-action="buy:lamp" data-payload="lamp">${this.t("buy")}</button>
        </div>
        <button data-action="close:shop">${this.t("close")}</button>
      </div>
    `;
  }

  renderPause() {
    this.overlays.pause.innerHTML = `
      <div class="window">
        <h2>${this.t("pause")}</h2>
        <div class="row">
          <button data-action="save:manual">${this.t("save")}</button>
          <button data-action="toggleLang">${this.t("langButton")}</button>
          <button data-action="close:pause">${this.t("close")}</button>
        </div>
      </div>
    `;
  }

  renderFestival() {
    const season = this.currentSeason();
    this.overlays.festival.innerHTML = `
      <div class="window">
        <h2>${this.t("festivalTitle")} - ${SEASON_LABELS[this.lang][season]}</h2>
        <p>${this.t("festivalClose")}</p>
        <p class="small">Un panier surprise est offert: +200$ et +20 énergie.</p>
        <button data-action="festivalClose:ok">OK</button>
      </div>
    `;
  }

  renderEnding() {
    this.overlays.ending.innerHTML = `
      <div class="window">
        <h2>${this.t("endingTitle")}</h2>
        <p>${this.t("endingText")}</p>
        <h3>${this.t("endingStats")}</h3>
        <p>Jours joués: ${this.stats.daysPlayed}</p>
        <p>Argent total gagné: ${this.stats.totalMoneyEarned}$</p>
        <p>Récoltes: ${this.stats.harvested}</p>
        <button data-action="newGamePlus:start">${this.t("newGamePlus")}</button>
      </div>
    `;
  }

  renderFishing() {
    if (!this.fishingState) return;
    const fs = this.fishingState;
    this.overlays.fishing.innerHTML = `
      <div class="window">
        <h2>${this.t("fishingTitle")}</h2>
        <p class="small">${this.t("fishingHint")}</p>
        <div class="quest">
          <div>Temps: ${fs.timeLeft.toFixed(1)}s</div>
          <div>Progression: ${Math.max(0, Math.floor(fs.progress))}%</div>
          <div class="small">Curseur: ${Math.floor(fs.marker)} / Zone: ${Math.floor(fs.targetStart)}-${Math.floor(fs.targetStart + fs.targetWidth)}</div>
        </div>
      </div>
    `;
  }

  dynamicPrice(base, inSeason) {
    return Math.round(base * (inSeason ? 0.8 : 1.1));
  }

  buyShopItem(id) {
    if (!this.isShopOpen()) {
      this.say(this.t("shopClosed"));
      return;
    }
    if (id === "upgrade_watering") {
      if (this.player.money < 2000 || this.player.wateringLevel >= 2) return;
      this.player.money -= 2000;
      this.player.wateringLevel = 1.5;
      this.say("Arrosoir amélioré !");
      return;
    }
    if (id === "build_coop") {
      if (this.flags.coopBuilt) return;
      if (countItem(this.player.inventories.bag, "wood") < 500 || countItem(this.player.inventories.bag, "stone") < 200) {
        this.say("Ressources insuffisantes.");
        return;
      }
      removeItem(this.player.inventories.bag, "wood", 500);
      removeItem(this.player.inventories.bag, "stone", 200);
      this.flags.coopBuilt = true;
      this.say("Poulailler construit.");
      return;
    }
    if (id === "build_barn") {
      if (this.flags.barnBuilt) return;
      if (countItem(this.player.inventories.bag, "wood") < 1000 || countItem(this.player.inventories.bag, "stone") < 500) {
        this.say("Ressources insuffisantes.");
        return;
      }
      removeItem(this.player.inventories.bag, "wood", 1000);
      removeItem(this.player.inventories.bag, "stone", 500);
      this.flags.barnBuilt = true;
      this.stats.barnBuilt = 1;
      this.say("Grange construite.");
      return;
    }
    if (id === "lamp") {
      if (this.player.money < 100) return;
      this.player.money -= 100;
      addItem(this.player.inventories.bag, "lamp", 1);
      return;
    }
    if (id.startsWith("animal_")) {
      const animalId = id.replace("animal_", "");
      const def = ANIMALS[animalId];
      if (!def) return;
      const buildingOk = def.building === "coop" ? this.flags.coopBuilt : this.flags.barnBuilt;
      if (!buildingOk || this.player.money < def.price) return;
      const countInBuilding = this.animals.filter((a) => ANIMALS[a.type].building === def.building).length;
      const max = def.building === "coop" ? 8 : 4;
      if (countInBuilding >= max) {
        this.say("Capacité atteinte.");
        return;
      }
      this.player.money -= def.price;
      this.animals.push({
        id: `${animalId}_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
        type: animalId,
        happiness: 60,
        fed: false,
        petted: false,
        hasProduct: true,
        x: def.building === "coop" ? 33 + Math.random() * 4 : 34 + Math.random() * 5,
        y: def.building === "coop" ? 9 + Math.random() * 3 : 16 + Math.random() * 3,
      });
      this.stats.animalOwned = this.animals.length;
      this.stats.chickenOwned = this.animals.filter((a) => a.type === "chicken").length;
      this.stats.cowOwned = this.animals.filter((a) => a.type === "cow").length;
      return;
    }
    const crop = CROPS.find((c) => c.seedItem === id);
    if (crop) {
      const price = this.dynamicPrice(crop.seedPrice, crop.season === this.currentSeason());
      if (this.player.money < price) return;
      this.player.money -= price;
      addItem(this.player.inventories.bag, id, 1);
    }
  }

  craftRecipe(recipeId) {
    const r = RECIPES.find((x) => x.id === recipeId);
    if (!r || !this.hasIngredients(r.inputs)) return;
    for (const [id, qty] of Object.entries(r.inputs)) removeItem(this.player.inventories.bag, id, qty);
    for (const [id, qty] of Object.entries(r.outputs)) addItem(this.player.inventories.bag, id, qty);
    if (recipeId === "fertilizer") this.stats.fertilizerCrafted += 1;
    this.say(`${this.t("crafting")}: ${this.lang === "fr" ? r.nameFr : r.nameEn}`);
  }

  hasIngredients(inputs) {
    for (const [id, qty] of Object.entries(inputs)) {
      if (countItem(this.player.inventories.bag, id) < qty) return false;
    }
    return true;
  }

  generateResources() {
    this.resources.trees = [];
    this.resources.rocks = [];
    this.resources.grass = [];
    for (let i = 0; i < 56; i += 1) {
      this.resources.trees.push({
        id: `tree_${i}`,
        x: 2 + Math.floor(Math.random() * 30),
        y: 37 + Math.floor(Math.random() * 30),
        alive: true,
      });
    }
    for (let i = 0; i < 34; i += 1) {
      this.resources.rocks.push({
        id: `rock_${i}`,
        x: 2 + Math.floor(Math.random() * 30),
        y: 37 + Math.floor(Math.random() * 30),
        alive: true,
      });
    }
    for (let i = 0; i < 90; i += 1) {
      this.resources.grass.push({
        id: `grass_${i}`,
        x: 1 + Math.floor(Math.random() * 35),
        y: 35 + Math.floor(Math.random() * 35),
        alive: true,
      });
    }
  }

  updateTime(dt) {
    this.dayMinute += dt * 60;
    if (this.dayMinute >= DAY_END) this.endDay();
  }

  endDay() {
    this.resolveShipping();
    this.advanceCrops();
    this.advanceAnimalsDay();
    this.dayMinute = DAY_START;
    this.day += 1;
    this.stats.daysPlayed += 1;
    if (this.day > 28) {
      this.day = 1;
      this.seasonIndex = (this.seasonIndex + 1) % SEASONS.length;
    }
    this.weather = this.rollWeather();
    this.player.energy = 100;
    this.dailyCounters = { treeCut: 0, rocksBroken: 0, fishCaught: 0, giftedToday: {} };
    for (const npc of this.npcs) npc.talkedToday = false;
    this.regenResources();
    this.checkFestival();
    this.saveGame();
    this.say(this.t("autoSaveDone"));
  }

  resolveShipping() {
    const shipping = this.player.inventories.shipping;
    let gain = 0;
    for (let i = 0; i < shipping.length; i += 1) {
      const slot = shipping[i];
      if (!slot) continue;
      const base = ITEM_DEFS[slot.id]?.sellPrice ?? 0;
      const inSeason = cropFromHarvest(slot.id)?.season === this.currentSeason();
      const value = this.dynamicPrice(base, !!inSeason);
      gain += value * slot.qty;
      shipping[i] = null;
    }
    if (gain > 0) {
      this.player.money += gain;
      this.stats.totalMoneyEarned += gain;
    }
  }

  regenResources() {
    for (const t of this.resources.trees) if (!t.alive && Math.random() < 0.35) t.alive = true;
    for (const r of this.resources.rocks) if (!r.alive && Math.random() < 0.35) r.alive = true;
    for (const g of this.resources.grass) if (!g.alive && Math.random() < 0.65) g.alive = true;
  }

  advanceCrops() {
    for (const key of Object.keys(this.farmPlots)) {
      const p = this.farmPlots[key];
      if (!p.seed) continue;
      const c = CROPS.find((x) => x.id === p.seed);
      const watered = p.watered || this.weather === "rain" || this.weather === "storm";
      if (watered) {
        const multiplier = p.fertilized ? 1.5 : 1;
        p.days += multiplier;
      }
      if (!p.mature && p.days >= c.growDays) p.mature = true;
      p.watered = false;
    }
  }

  advanceAnimalsDay() {
    for (const a of this.animals) {
      if (!a.fed) a.happiness = Math.max(0, a.happiness - 15);
      if (!a.petted) a.happiness = Math.max(0, a.happiness - 5);
      if (a.fed && a.petted) a.happiness = Math.min(100, a.happiness + 10);
      a.hasProduct = a.happiness >= 50 && a.fed;
      a.fed = false;
      a.petted = false;
    }
  }

  checkFestival() {
    if (this.day === 14) {
      this.player.money += 200;
      this.player.energy = Math.min(100, this.player.energy + 20);
      this.openMenu = "festival";
      this.showOverlay("festival");
      this.renderFestival();
    }
  }

  rollWeather() {
    const r = Math.random() * 100;
    let acc = 0;
    for (const w of WEATHER_TABLE) {
      acc += w.chance;
      if (r <= acc) return w.id;
    }
    return "sunny";
  }

  updateNpcPositions() {
    const hour = this.displayHourMinutes().hour;
    for (const npc of this.npcs) {
      if (hour < 9) {
        npc.x = npc.home.x;
        npc.y = npc.home.y + 1;
      } else if (hour < 18) {
        if (npc.name === "Pierre") {
          npc.x = 56;
          npc.y = 8;
        } else if (npc.name === "Nino") {
          npc.x = 53;
          npc.y = 35;
        } else {
          npc.x = npc.home.x;
          npc.y = npc.home.y;
        }
      } else {
        npc.x = npc.home.x;
        npc.y = npc.home.y;
      }
    }
  }

  updateAnimals() {
    for (const a of this.animals) {
      const homeX = ANIMALS[a.type].building === "coop" ? 33 : 34;
      const homeY = ANIMALS[a.type].building === "coop" ? 9 : 16;
      a.x += (Math.random() - 0.5) * 0.02;
      a.y += (Math.random() - 0.5) * 0.02;
      a.x = clamp(a.x, homeX, homeX + 5);
      a.y = clamp(a.y, homeY, homeY + 4);
    }
  }

  handleMovement(dt) {
    const up = this.keys.has("KeyW") || this.keys.has("KeyZ");
    const down = this.keys.has("KeyS");
    const left = this.keys.has("KeyA") || this.keys.has("KeyQ");
    const right = this.keys.has("KeyD");
    const vx = (right ? 1 : 0) - (left ? 1 : 0);
    const vy = (down ? 1 : 0) - (up ? 1 : 0);
    if (!vx && !vy) return;
    const len = Math.hypot(vx, vy) || 1;
    const speed = this.player.speed * dt;
    const nx = this.player.x + (vx / len) * speed;
    const ny = this.player.y + (vy / len) * speed;
    if (!this.collides(nx, this.player.y)) this.player.x = nx;
    if (!this.collides(this.player.x, ny)) this.player.y = ny;
  }

  collides(px, py) {
    const corners = [
      [px, py],
      [px + PLAYER_SIZE - 1, py],
      [px, py + PLAYER_SIZE - 1],
      [px + PLAYER_SIZE - 1, py + PLAYER_SIZE - 1],
    ];
    for (const [cx, cy] of corners) {
      const tx = Math.floor(cx / TILE_SIZE);
      const ty = Math.floor(cy / TILE_SIZE);
      if (tx < 0 || ty < 0 || tx >= WORLD_WIDTH || ty >= WORLD_HEIGHT) return true;
      if (!this.tilePassable(tx, ty)) return true;
    }
    return false;
  }

  tilePassable(tx, ty) {
    if (isInRect(tx, ty, 2, 2, 6, 5)) return false;
    if (isInRect(tx, ty, 31, 6, 8, 5) && this.flags.coopBuilt) return false;
    if (isInRect(tx, ty, 30, 14, 9, 6) && this.flags.barnBuilt) return false;
    if (isInRect(tx, ty, 48, 4, 8, 5)) return false;
    if (isInRect(tx, ty, 58, 5, 8, 5)) return false;
    if (isInRect(tx, ty, 58, 12, 10, 6)) return false;
    if (isInRect(tx, ty, 19, 52, 8, 8) && !this.flags.caveOpen) return false;
    if (inZone(tx, ty, "hill") && !this.flags.hillUnlocked) return false;
    if (inZone(tx, ty, "river")) {
      const riverWalk = isInRect(tx, ty, 45, 30, 25, 3) || isInRect(tx, ty, 45, 47, 25, 3) || isBridgeTile(tx, ty, this.flags.bridgeRepaired);
      if (!riverWalk) return false;
    }
    if (isInRect(tx, ty, 3, 20, 8, 8)) return false;
    if (this.resources.trees.some((t) => t.alive && t.x === tx && t.y === ty)) return false;
    if (this.resources.rocks.some((r) => r.alive && r.x === tx && r.y === ty)) return false;
    return true;
  }

  handleInputs() {
    for (let i = 0; i < 6; i += 1) if (this.pressed.has(`Digit${i + 1}`)) this.player.activeToolIndex = i;
    if (this.pressed.has("KeyE") || this.mouse.clicked) this.interactOrUseTool();
  }

  interactOrUseTool() {
    const tx = Math.floor((this.player.x + PLAYER_SIZE / 2) / TILE_SIZE);
    const ty = Math.floor((this.player.y + PLAYER_SIZE / 2) / TILE_SIZE);
    const facing = this.playerFacingTile(tx, ty);

    if (this.tryNpcInteraction(facing.x, facing.y)) return;
    if (this.tryObjectInteraction(facing.x, facing.y)) return;
    if (this.harvest(facing.x, facing.y) || this.plantSeed(facing.x, facing.y)) {
      this.spendEnergy(1);
      return;
    }
    this.useToolAt(facing.x, facing.y);
  }

  playerFacingTile(tx, ty) {
    const mxWorld = this.camera.x + this.mouse.x;
    const myWorld = this.camera.y + this.mouse.y;
    const mx = Math.floor(mxWorld / TILE_SIZE);
    const my = Math.floor(myWorld / TILE_SIZE);
    if (Math.abs(mx - tx) <= 2 && Math.abs(my - ty) <= 2) return { x: mx, y: my };
    return { x: tx + 1, y: ty };
  }

  tryNpcInteraction(tx, ty) {
    const nearNpc = this.npcs.find((n) => Math.abs(n.x - tx) <= 1 && Math.abs(n.y - ty) <= 1);
    if (!nearNpc) return false;
    if (nearNpc.name === "Pierre" && this.isShopOpen()) {
      this.openMenu = "shop";
      this.showOverlay("shop");
      this.renderShop();
      return true;
    }
    if (nearNpc.name === "Pierre" && !this.isShopOpen()) {
      this.say(this.t("shopClosed"));
      return true;
    }

    const activeQuest = QUESTS[this.questState.active];
    if (activeQuest && activeQuest.type === "deliver" && activeQuest.target.npc === nearNpc.name) {
      const { item, qty } = activeQuest.target;
      if (countItem(this.player.inventories.bag, item) >= qty) {
        removeItem(this.player.inventories.bag, item, qty);
        this.completeQuest(activeQuest.id);
        return true;
      }
    }

    const giftItem = this.currentSelectedId();
    if (giftItem && !this.dailyCounters.giftedToday[nearNpc.name]) {
      removeItem(this.player.inventories.bag, giftItem, 1);
      const gain = nearNpc.gift === giftItem ? 60 : 20;
      nearNpc.friendship = clamp(nearNpc.friendship + gain, 0, 400);
      this.dailyCounters.giftedToday[nearNpc.name] = true;
      this.say(`${nearNpc.name}: +${gain} amitié`);
    } else {
      nearNpc.friendship = clamp(nearNpc.friendship + 5, 0, 400);
      this.say(`${nearNpc.name}: "${this.randomNpcLine(nearNpc.name)}"`);
    }
    if (nearNpc.name === "Marie") this.stats.marieHearts = this.heartsOf("Marie");
    return true;
  }

  randomNpcLine(name) {
    const lines = {
      Pierre: ["Le marché est calme aujourd'hui.", "Les graines fraîches sentent le printemps."],
      Marie: ["Je garde un gâteau pour les bons voisins.", "Un œuf chaud, ça apaise tout."],
      Lucas: ["La colline attend les cœurs courageux.", "Le village compte sur toi."],
      Elodie: ["Les brumes chantent près des baies.", "La forêt te connaît déjà."],
      Nino: ["La rivière parle quand on l'écoute.", "Les truites aiment la patience."],
      Iris: ["Une belle laine raconte une histoire.", "Les ruines ont besoin d'artisans."],
    };
    const set = lines[name] || ["Bonjour."];
    return set[Math.floor(Math.random() * set.length)];
  }

  heartsOf(name) {
    const npc = this.npcs.find((n) => n.name === name);
    if (!npc) return 0;
    return Math.floor(npc.friendship / 100);
  }

  isShopOpen() {
    const hm = this.displayHourMinutes();
    return hm.hour >= 9 && hm.hour < 18;
  }

  tryObjectInteraction(tx, ty) {
    if (isInRect(tx, ty, 8, 5, 1, 1)) {
      this.openMenu = "inventory";
      this.showOverlay("inventory");
      this.renderInventory();
      return true;
    }
    if (isInRect(tx, ty, 10, 5, 1, 1)) {
      this.openMenu = "inventory";
      this.showOverlay("inventory");
      this.renderInventory();
      return true;
    }
    if (isInRect(tx, ty, 19, 52, 8, 8)) {
      this.flags.caveOpen = true;
      this.stats.caveVisited = 1;
      this.say("La grotte murmure un ancien souvenir.");
      return true;
    }
    if (isBridgeSpot(tx, ty)) {
      if (countItem(this.player.inventories.bag, "repair_kit") > 0) {
        removeItem(this.player.inventories.bag, "repair_kit", 1);
        this.flags.bridgeRepaired = true;
        this.stats.bridgeRepaired = 1;
        this.say("Pont réparé !");
      } else {
        this.say(this.t("bridgeLocked"));
      }
      return true;
    }
    if (inZone(tx, ty, "hill") && !this.flags.hillUnlocked) {
      this.say(this.t("hillLocked"));
      return true;
    }
    if (isInRect(tx, ty, 82, 37, 3, 3)) {
      this.tryFinalRitual();
      return true;
    }
    const machine = this.machines.find((m) => m.x === tx && m.y === ty);
    if (machine) {
      this.useMachine(machine);
      return true;
    }
    const animal = this.animals.find((a) => Math.abs(a.x - tx) < 1 && Math.abs(a.y - ty) < 1);
    if (animal) {
      this.interactAnimal(animal);
      return true;
    }
    return false;
  }

  interactAnimal(animal) {
    if (!animal.petted) {
      animal.petted = true;
      animal.happiness = clamp(animal.happiness + 8, 0, 100);
      this.say("Animal caressé.");
      return;
    }
    if (!animal.fed) {
      if (removeItem(this.player.inventories.bag, "hay_bale", 1) || removeItem(this.player.inventories.bag, "fiber", 1)) {
        animal.fed = true;
        animal.happiness = clamp(animal.happiness + 6, 0, 100);
        this.say("Animal nourri.");
        return;
      }
      this.say("Pas de nourriture (foin/fibre).");
      return;
    }
    if (animal.hasProduct) {
      addItem(this.player.inventories.bag, ANIMALS[animal.type].product, 1);
      animal.hasProduct = false;
      this.say(`+1 ${itemName(ANIMALS[animal.type].product, this.lang)}`);
    }
  }

  useMachine(machine) {
    if (machine.type === "machine_cheese_press") {
      if (removeItem(this.player.inventories.bag, "milk", 1)) {
        addItem(this.player.inventories.bag, "cheese", 1);
        this.stats.cheeseMade += 1;
        this.say("Fromage fabriqué.");
      }
      return;
    }
    if (machine.type === "machine_mayo_bench") {
      if (removeItem(this.player.inventories.bag, "egg", 1)) {
        addItem(this.player.inventories.bag, "mayonnaise", 1);
        this.say("Mayonnaise prête.");
      }
      return;
    }
    if (machine.type === "machine_loom") {
      if (removeItem(this.player.inventories.bag, "wool", 1)) {
        addItem(this.player.inventories.bag, "cloth", 1);
        this.say("Tissu tissé.");
      }
      return;
    }
    if (machine.type === "machine_oil_press") {
      if (removeItem(this.player.inventories.bag, "truffle", 1)) {
        addItem(this.player.inventories.bag, "truffle_oil", 1);
        this.say("Huile de truffe.");
      }
    }
  }

  tryFinalRitual() {
    if (this.questState.active !== QUESTS.length - 1) return;
    if (this.currentSeason() !== "autumn") {
      this.say("Le rituel ne répond qu'en automne.");
      return;
    }
    if (countItem(this.player.inventories.bag, "ancient_charm") < 3) {
      this.say("Trois charmes anciens sont nécessaires.");
      return;
    }
    removeItem(this.player.inventories.bag, "ancient_charm", 3);
    this.stats.mistsRevealed = 1;
    this.completeQuest("q20");
  }

  useToolAt(tx, ty) {
    const tool = TOOL_KEYS[this.player.activeToolIndex];
    if (this.player.energy <= 0) {
      this.say(this.t("notEnoughEnergy"));
      return;
    }

    if (tool === "Hoe") {
      if (!isInRect(tx, ty, LABORABLE.x, LABORABLE.y, LABORABLE.w, LABORABLE.h)) return;
      const p = this.getPlot(tx, ty);
      p.tilled = true;
      this.spendEnergy(2);
      this.stats.tilled += 1;
      return;
    }
    if (tool === "WateringCan") {
      const spread = this.player.wateringLevel > 1 ? 2 : 1;
      for (let ox = 0; ox < spread; ox += 1) {
        const p = this.getPlot(tx + ox, ty);
        if (p.tilled) p.watered = true;
      }
      this.spendEnergy(1);
      return;
    }
    if (tool === "Axe") {
      if (this.dailyCounters.treeCut >= 20) return;
      const tree = this.resources.trees.find((t) => t.alive && t.x === tx && t.y === ty);
      if (tree) {
        tree.alive = false;
        this.spendEnergy(3);
        addItem(this.player.inventories.bag, "wood", 3);
        this.dailyCounters.treeCut += 1;
        this.stats.woodCollected += 3;
      }
      return;
    }
    if (tool === "Pickaxe") {
      if (this.dailyCounters.rocksBroken >= 15) return;
      const rock = this.resources.rocks.find((r) => r.alive && r.x === tx && r.y === ty);
      if (rock) {
        rock.alive = false;
        this.spendEnergy(3);
        addItem(this.player.inventories.bag, "stone", 2);
        this.dailyCounters.rocksBroken += 1;
      }
      return;
    }
    if (tool === "Scythe") {
      const g = this.resources.grass.find((x) => x.alive && x.x === tx && x.y === ty);
      if (g) {
        g.alive = false;
        this.spendEnergy(1);
        addItem(this.player.inventories.bag, "fiber", 1);
      }
      return;
    }
    if (tool === "FishingRod") {
      if (this.dailyCounters.fishCaught >= 10) return;
      if (isNearWater(tx, ty, this.flags.bridgeRepaired)) {
        this.startFishing();
      }
      return;
    }
  }

  startFishing() {
    this.fishingState = {
      progress: 0,
      timeLeft: 8,
      marker: 50,
      targetStart: 20 + Math.random() * 50,
      targetWidth: 22,
      velocity: 38,
    };
    this.openMenu = "fishing";
    this.showOverlay("fishing");
    this.renderFishing();
  }

  updateFishing(dt) {
    const fs = this.fishingState;
    if (!fs) return;
    fs.timeLeft -= dt;
    fs.targetStart += Math.sin(performance.now() / 300) * dt * 16;
    fs.targetStart = clamp(fs.targetStart, 4, 74);
    if (this.keys.has("KeyE") || this.mouse.down) fs.marker += fs.velocity * dt;
    else fs.marker -= fs.velocity * dt * 0.75;
    fs.marker = clamp(fs.marker, 0, 100);

    if (fs.marker >= fs.targetStart && fs.marker <= fs.targetStart + fs.targetWidth) fs.progress += dt * 40;
    else fs.progress -= dt * 25;
    fs.progress = clamp(fs.progress, 0, 100);

    if (fs.progress >= 100) {
      this.finishFishing(true);
      return;
    }
    if (fs.timeLeft <= 0) this.finishFishing(false);
    else this.renderFishing();
  }

  finishFishing(success) {
    if (success) {
      const r = Math.random();
      const fish = r < 0.65 ? "fish_common" : r < 0.93 ? "fish_river" : "fish_rare";
      addItem(this.player.inventories.bag, fish, 1);
      this.dailyCounters.fishCaught += 1;
      this.stats.fishCaught += 1;
      this.spendEnergy(4);
      this.say(this.t("fishingWin"));
    } else {
      this.say(this.t("fishingLose"));
    }
    this.fishingState = null;
    this.openMenu = null;
    this.showOverlay(null);
  }

  getPlot(tx, ty) {
    const key = `${tx},${ty}`;
    if (!this.farmPlots[key]) {
      this.farmPlots[key] = {
        tilled: false,
        seed: null,
        days: 0,
        watered: false,
        mature: false,
        fertilized: false,
      };
    }
    return this.farmPlots[key];
  }

  plantSeed(tx, ty) {
    const plot = this.getPlot(tx, ty);
    if (!plot.tilled || plot.seed) return false;
    if (!this.selectedSeed) {
      this.say(this.t("noSeedSelected"));
      return false;
    }
    const crop = CROPS.find((c) => c.seedItem === this.selectedSeed);
    if (!crop) return false;
    if (crop.season !== this.currentSeason()) {
      this.say(this.t("cropOutSeason"));
      return false;
    }
    if (!removeItem(this.player.inventories.bag, this.selectedSeed, 1)) return false;
    plot.seed = crop.id;
    plot.days = 0;
    plot.mature = false;
    return true;
  }

  harvest(tx, ty) {
    const plot = this.getPlot(tx, ty);
    if (!plot.seed || !plot.mature) return false;
    const crop = CROPS.find((c) => c.id === plot.seed);
    addItem(this.player.inventories.bag, crop.harvestItem, 1);
    this.stats.harvested += 1;
    if (crop.id === "pumpkin") this.stats.pumpkinHarvest += 1;
    if (crop.regrow > 0) {
      plot.days = Math.max(0, crop.growDays - crop.regrow);
      plot.mature = false;
    } else {
      plot.seed = null;
      plot.days = 0;
      plot.mature = false;
    }
    return true;
  }

  checkQuestProgress() {
    const qData = QUESTS[this.questState.active];
    if (!qData) return;
    if (qData.type !== "count") return;
    const value = this.readStatForQuest(qData.target.stat);
    if (value >= qData.target.qty) this.completeQuest(qData.id);
  }

  readStatForQuest(statKey) {
    if (statKey === "allBuildings") {
      return this.flags.coopBuilt && this.flags.barnBuilt && this.flags.bridgeRepaired ? 1 : 0;
    }
    if (statKey in this.stats) return this.stats[statKey];
    return 0;
  }

  completeQuest(id) {
    if (this.questState.completed.includes(id)) return;
    const quest = QUESTS.find((qv) => qv.id === id);
    if (!quest) return;
    this.questState.completed.push(id);
    if (quest.reward.money) this.player.money += quest.reward.money;
    if (quest.reward.item) addItem(this.player.inventories.bag, quest.reward.item, quest.reward.qty ?? 1);
    if (quest.reward.friendship) {
      const [name, gain] = quest.reward.friendship;
      const n = this.npcs.find((x) => x.name === name);
      if (n) n.friendship = clamp(n.friendship + gain, 0, 400);
    }
    if (quest.reward.unlockHill) this.flags.hillUnlocked = true;
    if (quest.reward.ending) {
      this.flags.endingSeen = true;
      this.openMenu = "ending";
      this.showOverlay("ending");
      this.renderEnding();
    } else {
      this.questState.active = Math.min(this.questState.active + 1, QUESTS.length - 1);
      this.say(`${this.t("questCompleted")}: ${quest.title}`);
    }
  }

  questProgressText(quest) {
    if (quest.type === "deliver") {
      const have = countItem(this.player.inventories.bag, quest.target.item);
      return `${itemName(quest.target.item, this.lang)}: ${have}/${quest.target.qty}`;
    }
    const value = this.readStatForQuest(quest.target.stat);
    return `${value}/${quest.target.qty}`;
  }

  currentSeason() {
    return SEASONS[this.seasonIndex];
  }

  displayHourMinutes() {
    let total = Math.floor(this.dayMinute);
    if (total >= 24 * 60) total -= 24 * 60;
    const hour = Math.floor(total / 60);
    const minute = total % 60;
    return { hour, minute };
  }

  spendEnergy(amount) {
    const isNight = this.dayMinute >= 22 * 60 || this.dayMinute < 6 * 60;
    const cost = isNight ? amount * 2 : amount;
    this.player.energy = Math.max(0, this.player.energy - cost);
  }

  say(text) {
    this.messageLog.textContent = text;
    this.messageLog.classList.add("visible");
    clearTimeout(this.messageTimeout);
    this.messageTimeout = setTimeout(() => {
      this.messageLog.classList.remove("visible");
    }, 2500);
  }

  render() {
    this.updateHud();
    this.drawWorld();
    this.drawEntities();
  }

  updateHud() {
    const hm = this.displayHourMinutes();
    const hh = String(hm.hour).padStart(2, "0");
    const mm = String(hm.minute).padStart(2, "0");
    const season = SEASON_LABELS[this.lang][this.currentSeason()];
    const activeTool = TOOL_KEYS[this.player.activeToolIndex];
    const weatherLabel = { sunny: "☀️ Soleil", rain: "🌧️ Pluie", storm: "⛈️ Tempête" }[this.weather];
    this.hud.innerHTML = `
      <div><strong>$${this.player.money}</strong> &nbsp; 🍗 ${Math.floor(this.player.energy)}/100</div>
      <div>${hh}:${mm} ${season.slice(0, 5)}.${this.day}</div>
      <div>${this.t("activeTool")}: ${toolLabel(activeTool, this.lang)}</div>
      <div>${this.t("selectedSeed")}: ${this.selectedSeed ? itemName(this.selectedSeed, this.lang) : this.t("none")}</div>
      <div class="small">${weatherLabel}</div>
      <div class="small">${this.t("interact")} | ${this.t("openInventory")} | ${this.t("openJournal")} | ${this.t("openCraft")}</div>
    `;
  }

  drawWorld() {
    this.ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    const camTargetX = this.player.x + PLAYER_SIZE / 2 - SCREEN_WIDTH / 2;
    const camTargetY = this.player.y + PLAYER_SIZE / 2 - SCREEN_HEIGHT / 2;
    this.camera.x = clamp(camTargetX, 0, WORLD_WIDTH * TILE_SIZE - SCREEN_WIDTH);
    this.camera.y = clamp(camTargetY, 0, WORLD_HEIGHT * TILE_SIZE - SCREEN_HEIGHT);

    const startX = Math.floor(this.camera.x / TILE_SIZE);
    const startY = Math.floor(this.camera.y / TILE_SIZE);
    const endX = startX + Math.ceil(SCREEN_WIDTH / TILE_SIZE) + 1;
    const endY = startY + Math.ceil(SCREEN_HEIGHT / TILE_SIZE) + 1;

    for (let ty = startY; ty <= endY; ty += 1) {
      for (let tx = startX; tx <= endX; tx += 1) {
        const sx = tx * TILE_SIZE - this.camera.x;
        const sy = ty * TILE_SIZE - this.camera.y;
        this.ctx.fillStyle = this.baseTileColor(tx, ty);
        this.ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);

        if (isInRect(tx, ty, LABORABLE.x, LABORABLE.y, LABORABLE.w, LABORABLE.h)) {
          const p = this.getPlot(tx, ty);
          this.drawFieldTile(p, sx, sy);
        }
      }
    }

    this.drawBuildings();
    this.drawDecor();
    this.drawForegroundFog();
  }

  baseTileColor(tx, ty) {
    const season = this.currentSeason();
    const night = this.dayMinute >= 22 * 60 || this.dayMinute < 6 * 60;

    if (isInRect(tx, ty, 45, 33, 25, 14)) return "#4b84a5";
    if (isBridgeSpot(tx, ty)) return this.flags.bridgeRepaired ? "#8d6443" : "#553f2a";
    if (isInRect(tx, ty, 3, 20, 8, 8)) return "#4f8ab4";
    if (inZone(tx, ty, "village")) return "#7e8450";
    if (inZone(tx, ty, "forest")) return season === "winter" ? "#6d7f74" : "#5e8456";
    if (inZone(tx, ty, "hill")) return "#6a7d63";
    if (inZone(tx, ty, "river")) return "#7e8f68";
    if (inZone(tx, ty, "farm")) {
      if (season === "winter") return "#8a96a5";
      if (season === "autumn") return "#8d7f54";
      if (season === "summer") return "#6b9550";
      return "#6c9d61";
    }
    let c = "#2d4f3f";
    if (night) c = "#1c2e29";
    return c;
  }

  drawFieldTile(plot, sx, sy) {
    if (!plot.tilled) return;
    this.ctx.fillStyle = "#6a4f38";
    this.ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
    if (plot.seed) {
      if (plot.mature) this.ctx.fillStyle = "#5fc161";
      else this.ctx.fillStyle = "#8abf6f";
      this.ctx.fillRect(sx + 4, sy + 4, 8, 8);
    }
    if (plot.watered) {
      this.ctx.fillStyle = "rgba(80,130,170,0.45)";
      this.ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
    }
  }

  drawBuildings() {
    const b = [
      { x: 2, y: 2, w: 6, h: 5, c: "#8b5f47" },
      { x: 48, y: 4, w: 8, h: 5, c: "#8b5f47" },
      { x: 58, y: 5, w: 8, h: 5, c: "#8b5f47" },
      { x: 58, y: 12, w: 10, h: 6, c: "#7a5540" },
    ];
    if (this.flags.coopBuilt) b.push({ x: 31, y: 6, w: 8, h: 5, c: "#866040" });
    if (this.flags.barnBuilt) b.push({ x: 30, y: 14, w: 9, h: 6, c: "#6f4e39" });
    for (const obj of b) {
      this.ctx.fillStyle = obj.c;
      this.ctx.fillRect(
        obj.x * TILE_SIZE - this.camera.x,
        obj.y * TILE_SIZE - this.camera.y,
        obj.w * TILE_SIZE,
        obj.h * TILE_SIZE,
      );
    }
    this.ctx.fillStyle = "#7a5d38";
    this.ctx.fillRect(8 * TILE_SIZE - this.camera.x, 5 * TILE_SIZE - this.camera.y, TILE_SIZE, TILE_SIZE);
    this.ctx.fillStyle = "#75674a";
    this.ctx.fillRect(10 * TILE_SIZE - this.camera.x, 5 * TILE_SIZE - this.camera.y, TILE_SIZE, TILE_SIZE);
    this.ctx.fillStyle = "#6e5e46";
    this.ctx.fillRect(82 * TILE_SIZE - this.camera.x, 37 * TILE_SIZE - this.camera.y, 3 * TILE_SIZE, 3 * TILE_SIZE);
  }

  drawDecor() {
    for (const g of this.resources.grass) {
      if (!g.alive) continue;
      drawNode(this.ctx, g.x, g.y, this.camera, "#6da66a", 8, 8);
    }
    for (const t of this.resources.trees) {
      if (!t.alive) continue;
      drawNode(this.ctx, t.x, t.y, this.camera, "#467b45", 14, 14);
    }
    for (const r of this.resources.rocks) {
      if (!r.alive) continue;
      drawNode(this.ctx, r.x, r.y, this.camera, "#83888f", 13, 10);
    }

    for (const m of this.machines) {
      this.ctx.fillStyle = "#b18858";
      this.ctx.fillRect(m.x * TILE_SIZE - this.camera.x, m.y * TILE_SIZE - this.camera.y, TILE_SIZE, TILE_SIZE);
    }
    for (const f of this.fences) {
      this.ctx.fillStyle = "#7a5f3f";
      this.ctx.fillRect(f.x * TILE_SIZE - this.camera.x, f.y * TILE_SIZE - this.camera.y, TILE_SIZE, TILE_SIZE);
    }
  }

  drawEntities() {
    for (const npc of this.npcs) {
      const hearts = Math.floor(npc.friendship / 100);
      this.ctx.fillStyle = "#d6c4a2";
      this.ctx.fillRect(npc.x * TILE_SIZE - this.camera.x, npc.y * TILE_SIZE - this.camera.y, 16, 24);
      this.ctx.fillStyle = "#fff8df";
      this.ctx.font = "10px sans-serif";
      this.ctx.fillText(`${npc.name} ${"♥".repeat(hearts)}`, npc.x * TILE_SIZE - this.camera.x - 10, npc.y * TILE_SIZE - this.camera.y - 5);
    }

    for (const a of this.animals) {
      this.ctx.fillStyle = animalColor(a.type);
      this.ctx.fillRect(a.x * TILE_SIZE - this.camera.x, a.y * TILE_SIZE - this.camera.y, 14, 12);
      if (a.hasProduct) {
        this.ctx.fillStyle = "#ffd978";
        this.ctx.fillRect(a.x * TILE_SIZE - this.camera.x + 4, a.y * TILE_SIZE - this.camera.y - 4, 6, 3);
      }
    }

    this.ctx.fillStyle = "#f2d4b5";
    this.ctx.fillRect(this.player.x - this.camera.x, this.player.y - this.camera.y, PLAYER_SIZE, PLAYER_SIZE);
    this.ctx.fillStyle = "#3d534c";
    this.ctx.fillRect(this.player.x - this.camera.x + 8, this.player.y - this.camera.y + 6, 16, 6);
  }

  drawForegroundFog() {
    if (this.currentSeason() === "autumn") {
      this.ctx.fillStyle = "rgba(210,220,235,0.08)";
      this.ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    }
    if (this.dayMinute >= 18 * 60) {
      this.ctx.fillStyle = "rgba(12,18,25,0.22)";
      this.ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    }
    if (this.weather === "rain" || this.weather === "storm") {
      this.ctx.fillStyle = "rgba(150,180,220,0.12)";
      this.ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    }
  }
}

function renderSlot(slot, lang, active, action) {
  if (!slot) return `<div class="slot ${active ? "active" : ""}"></div>`;
  return `<div class="slot ${active ? "active" : ""}" data-action="${action}" data-payload="">${itemName(slot.id, lang)}<br>x${slot.qty}</div>`;
}

function renderCompact(slot, lang, action) {
  const click = action ? `data-action="${action}" data-payload="${slot.id}"` : "";
  return `<div class="slot" ${click}>${itemName(slot.id, lang)} x${slot.qty}</div>`;
}

function toolLabel(tool, lang) {
  const map = {
    Hoe: { fr: "Houe", en: "Hoe" },
    WateringCan: { fr: "Arrosoir", en: "Watering Can" },
    Axe: { fr: "Hache", en: "Axe" },
    Pickaxe: { fr: "Pioche", en: "Pickaxe" },
    Scythe: { fr: "Faux", en: "Scythe" },
    FishingRod: { fr: "Canne à pêche", en: "Fishing Rod" },
  };
  return map[tool]?.[lang] ?? tool;
}

function createSlots(size) {
  return new Array(size).fill(null);
}

function addItem(slots, itemId, qty) {
  if (!ITEM_DEFS[itemId]) return false;
  let remaining = qty;
  for (const slot of slots) {
    if (slot && slot.id === itemId && slot.qty < 99) {
      const can = Math.min(99 - slot.qty, remaining);
      slot.qty += can;
      remaining -= can;
      if (remaining <= 0) return true;
    }
  }
  for (let i = 0; i < slots.length; i += 1) {
    if (!slots[i]) {
      const can = Math.min(99, remaining);
      slots[i] = { id: itemId, qty: can };
      remaining -= can;
      if (remaining <= 0) return true;
    }
  }
  return remaining <= 0;
}

function removeItem(slots, itemId, qty) {
  if (countItem(slots, itemId) < qty) return false;
  let remaining = qty;
  for (let i = slots.length - 1; i >= 0; i -= 1) {
    const slot = slots[i];
    if (!slot || slot.id !== itemId) continue;
    const take = Math.min(slot.qty, remaining);
    slot.qty -= take;
    remaining -= take;
    if (slot.qty <= 0) slots[i] = null;
    if (remaining <= 0) return true;
  }
  return true;
}

function countItem(slots, itemId) {
  return slots.reduce((sum, slot) => sum + (slot && slot.id === itemId ? slot.qty : 0), 0);
}

function baseItem(id, nameFr, nameEn, category, sellPrice) {
  return { id, nameFr, nameEn, category, sellPrice };
}

function crop(id, nameFr, nameEn, season, growDays, seedPrice, harvestPrice, regrow) {
  return {
    id,
    nameFr,
    nameEn,
    season,
    growDays,
    seedPrice,
    harvestPrice,
    regrow,
    seedItem: `${id}_seed`,
    harvestItem: `${id}_crop`,
  };
}

function animal(id, nameFr, nameEn, building, price, product) {
  return { id, nameFr, nameEn, building, price, product };
}

function recipe(id, nameFr, nameEn, inputs, outputs) {
  return { id, nameFr, nameEn, inputs, outputs };
}

function q(id, title, description, type, target, reward) {
  return { id, title, description, type, target, reward };
}

function npc(name, role, gift, home) {
  return { name, role, gift, home };
}

function itemName(itemId, lang) {
  return ITEM_DEFS[itemId] ? (lang === "fr" ? ITEM_DEFS[itemId].nameFr : ITEM_DEFS[itemId].nameEn) : itemId;
}

function cropFromHarvest(itemId) {
  return CROPS.find((c) => c.harvestItem === itemId);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function isInRect(tx, ty, x, y, w, h) {
  return tx >= x && tx < x + w && ty >= y && ty < y + h;
}

function inZone(tx, ty, zoneId) {
  const z = ZONES.find((zone) => zone.id === zoneId);
  if (!z) return false;
  return isInRect(tx, ty, z.x, z.y, z.w, z.h);
}

function isBridgeTile(tx, ty, enabled) {
  if (!isBridgeSpot(tx, ty)) return false;
  return !!enabled;
}

function isBridgeSpot(tx, ty) {
  return BRIDGE_TILES.some((b) => b.x === tx && b.y === ty);
}

function isNearWater(tx, ty, bridgeRepaired) {
  if (isInRect(tx, ty, 45, 33, 25, 14)) return true;
  if (isInRect(tx, ty, 3, 20, 8, 8)) return true;
  if (!bridgeRepaired && BRIDGE_TILES.some((b) => b.x === tx && b.y === ty)) return true;
  return false;
}

function animalColor(type) {
  const map = {
    chicken: "#fff1b8",
    cow: "#eee9df",
    sheep: "#f2f2f2",
    pig: "#f6bec5",
    duck: "#d9f2b3",
  };
  return map[type] || "#f0dcc8";
}

function drawNode(ctx, tx, ty, camera, color, w, h) {
  ctx.fillStyle = color;
  ctx.fillRect(tx * TILE_SIZE - camera.x, ty * TILE_SIZE - camera.y, w, h);
}

const game = new Game();

window.addEventListener("keydown", (ev) => {
  if (ev.code === "KeyF") {
    if (!game.running || game.openMenu) return;
    const tx = Math.floor((game.player.x + PLAYER_SIZE / 2) / TILE_SIZE);
    const ty = Math.floor((game.player.y + PLAYER_SIZE / 2) / TILE_SIZE);
    if (game.harvest(tx + 1, ty) || game.harvest(tx, ty) || game.plantSeed(tx + 1, ty) || game.plantSeed(tx, ty)) {
      game.spendEnergy(1);
    }
    const selected = game.currentSelectedId();
    if (selected && selected.startsWith("machine_")) {
      const px = tx + 1;
      const py = ty;
      if (inZone(px, py, "farm") && !game.machines.some((m) => m.x === px && m.y === py)) {
        if (removeItem(game.player.inventories.bag, selected, 1)) {
          game.machines.push({ type: selected, x: px, y: py });
          if (selected === "machine_cheese_press") game.stats.cheesePressPlaced = 1;
        }
      }
    }
    if (selected === "fence") {
      const fx = tx + 1;
      const fy = ty;
      if (!game.fences.some((f) => f.x === fx && f.y === fy) && removeItem(game.player.inventories.bag, "fence", 1)) {
        game.fences.push({ x: fx, y: fy });
      }
    }
    if (selected === "fertilizer") {
      const p = game.getPlot(tx + 1, ty);
      if (p.tilled && removeItem(game.player.inventories.bag, "fertilizer", 1)) p.fertilized = true;
    }
  }
});
