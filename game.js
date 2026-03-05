(() => {
  "use strict";

  const MAX_STAT = 100;
  const MIN_STAT = 0;
  const MAX_LOG = 220;

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
  const STARTING_SOCIAL_CLASSES = SOCIAL_CLASSES.filter((entry) => entry.name !== "Clergé");

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

  const AVATAR_SKINS = [
    { id: "pale", label: "Clair", color: "#f2d4b1" },
    { id: "warm", label: "Doré", color: "#d9ad7f" },
    { id: "olive", label: "Olive", color: "#c08a5a" },
    { id: "brown", label: "Brun", color: "#8e5c3b" }
  ];
  const AVATAR_HAIR_COLORS = [
    { id: "black", label: "Noir", color: "#1f1a17" },
    { id: "brown", label: "Brun", color: "#5d3a22" },
    { id: "auburn", label: "Roux", color: "#8e4a25" },
    { id: "blond", label: "Blond", color: "#cba76a" }
  ];
  const AVATAR_EYE_COLORS = [
    { id: "brown", label: "Marron", color: "#4a2e1f" },
    { id: "hazel", label: "Noisette", color: "#6a4c2a" },
    { id: "green", label: "Vert", color: "#446b38" },
    { id: "blue", label: "Bleu", color: "#456a8c" }
  ];
  const AVATAR_HAIR_STYLES = ["court", "long", "boucle", "tonsure"];
  const AVATAR_BEARDS = ["aucune", "courte", "longue"];
  const AVATAR_OUTFITS = [
    { id: "linen", label: "Tunique claire", color: "#d8c8a9" },
    { id: "forest", label: "Tunique verte", color: "#5f7d3a" },
    { id: "burgundy", label: "Tunique bordeaux", color: "#7a3431" },
    { id: "navy", label: "Tunique bleue", color: "#3d5572" }
  ];
  const AVATAR_ACCESSORIES = ["aucun", "capuche", "couronne", "bandeau", "chapeau"];

  const CHECKLIST = [
    "Création aléatoire complète (nom, pays, sexe, classe, famille, stats).",
    "Bouton « Vieillir » avec événements et choix.",
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

  const EVENT_BIASES = ["money", "reputation", "health", "learning", "family", "crime", "spiritual", "politics"];
  const MASS_AGE_EVENT_BLUEPRINTS = {
    child: {
      subjects: [
        "Un camarade",
        "Ton instituteur",
        "Un voisin",
        "Le fils du meunier",
        "La fille du forgeron",
        "Un garde municipal",
        "Le sacristain"
      ],
      contexts: [
        "à l'école du bourg",
        "sur la place du marché",
        "près des remparts",
        "devant la taverne",
        "dans la cour familiale"
      ],
      twists: [
        "te confie un secret embarrassant.",
        "te met au défi publiquement.",
        "te réclame un service immédiat.",
        "t'accuse d'une maladresse.",
        "te propose un échange risqué."
      ],
      limit: 28
    },
    teen: {
      subjects: [
        "Un maître de guilde",
        "Un apprenti rival",
        "Un capitaine de garde",
        "Une héritière locale",
        "Un conteur itinérant",
        "Un collecteur d'impôts",
        "Un érudit"
      ],
      contexts: [
        "pendant une foire régionale",
        "à la sortie de l'atelier",
        "dans une ruelle commerçante",
        "au pied du château",
        "dans la salle d'entraînement"
      ],
      twists: [
        "te propose une faveur intéressée.",
        "cherche à tester ton courage.",
        "met ta réputation en jeu.",
        "te promet un accès privilégié.",
        "t'entraîne vers un choix délicat."
      ],
      limit: 28
    },
    adult: {
      subjects: [
        "Le conseil municipal",
        "Un marchand étranger",
        "Une corporation rivale",
        "Un noble influent",
        "Un banquier privé",
        "Un bailli du roi",
        "Une confrérie secrète"
      ],
      contexts: [
        "au sujet d'un contrat majeur",
        "dans un contexte de tension locale",
        "après une plainte officielle",
        "à la veille d'une décision publique",
        "lors d'une négociation tendue"
      ],
      twists: [
        "te demande de prendre parti vite.",
        "te propose un accord ambigu.",
        "cherche à t'utiliser comme intermédiaire.",
        "fait peser une menace discrète.",
        "ouvre une opportunité inattendue."
      ],
      limit: 30
    },
    senior: {
      subjects: [
        "Un chroniqueur",
        "Un ancien compagnon",
        "Un héritier lointain",
        "Un juge local",
        "Un abbé respecté",
        "Un jeune ambitieux",
        "Un notable de province"
      ],
      contexts: [
        "pour trancher une vieille querelle",
        "concernant des archives familiales",
        "dans un débat sur ton héritage",
        "au sujet de ton passé public",
        "autour d'un engagement moral"
      ],
      twists: [
        "ravive des souvenirs sensibles.",
        "met ton autorité à l'épreuve.",
        "pourrait changer ton image durablement.",
        "te force à choisir entre paix et fermeté.",
        "ouvre une dernière chance de réconciliation."
      ],
      limit: 22
    }
  };

  const MASS_CLASS_EVENT_TEXTS = {
    Paysannerie: [
      "Le village organise une corvée imprévue sur les terres communes.",
      "Le seigneur exige une part supplémentaire de récolte.",
      "Un voisin veut partager un nouvel outil coûteux.",
      "Une rumeur de famine pousse les familles à stocker en secret.",
      "Un collecteur se montre étrangement indulgent avec ton foyer.",
      "Un conflit éclate autour de l'usage du puits communal.",
      "Une veillée paysanne tourne au débat politique.",
      "Un ancien promet un terrain abandonné en échange d'un service."
    ],
    Artisanat: [
      "La guilde locale lance un concours de maîtrise technique.",
      "Un client noble réclame une commande impossible sous délai court.",
      "Un apprenti casse une pièce essentielle de l'atelier.",
      "Un concurrent vend des copies de ton travail.",
      "Le maître de guilde soupçonne une fraude sur les matières.",
      "Une commande religieuse peut faire grimper ton prestige.",
      "Une pénurie de bois et de fer frappe les ateliers voisins.",
      "Un marchand étranger offre de diffuser ton savoir-faire."
    ],
    "Bourgeoisie marchande": [
      "Une caravane étrangère propose un partenariat exclusif.",
      "Le prix des épices double en une semaine.",
      "Un comptable signale des écarts dans les livres.",
      "Une dette commerciale menace la réputation de ta maison.",
      "Un rival tente de racheter discrètement tes fournisseurs.",
      "Le port annonce une nouvelle taxe sur les cargaisons.",
      "Un mécène exige une faveur en échange de son appui.",
      "Un accord de monopole se négocie en coulisses."
    ],
    "Petite noblesse": [
      "Un cousin réclame un droit sur un domaine secondaire.",
      "Le bailli t'invite à soutenir publiquement une décision impopulaire.",
      "Un tournoi local peut renforcer ton nom.",
      "Une alliance matrimoniale te serait politiquement utile.",
      "Un officier remet en cause ton autorité devant témoins.",
      "Un banquet tourne à la compétition d'influence.",
      "Une dette d'honneur est évoquée devant la cour.",
      "Un ancien serment familial ressurgit opportunément."
    ],
    "Haute noblesse": [
      "Le roi mandate discrètement ta maison pour une affaire sensible.",
      "Un scandale de cour menace ton cercle proche.",
      "Un rival aristocrate cherche à affaiblir ton blason.",
      "Une fondation prestigieuse demande ton mécénat.",
      "Une rumeur de trahison court dans les salons royaux.",
      "Une charge protocolaire peut renforcer ton pouvoir.",
      "Des vassaux réclament un arbitrage immédiat.",
      "Un diplomate étranger te propose une alliance risquée."
    ],
    Clergé: [
      "Un évêque souhaite t'impliquer dans une enquête doctrinale.",
      "Des fidèles s'opposent à une réforme locale.",
      "Un manuscrit controversé circule dans ton entourage.",
      "Une abbaye réclame ton soutien financier.",
      "Un prédicateur charismatique divise les paroisses voisines.",
      "Une mission de médiation t'est confiée en urgence.",
      "Un noble tente d'acheter ton silence sur un dossier.",
      "Une procession attire autant d'espoir que de tensions."
    ]
  };

  const MASS_CONTEXT_EVENT_TEXTS = {
    city: [
      "Une foire exceptionnelle attire des foules imprévisibles.",
      "Une nouvelle patrouille inspecte sévèrement les quartiers.",
      "Un incendie mineur bouleverse le marché central.",
      "Un débat public oppose marchands et artisans.",
      "Des pèlerins apportent des reliques controversées.",
      "Un théâtre ambulant déclenche un scandale moral.",
      "La rumeur d'un complot secoue les tavernes.",
      "Une charte municipale doit être renégociée.",
      "Un quartier réclame une baisse des impôts.",
      "Des contrebandiers seraient actifs près des quais."
    ],
    job: [
      "Ton employeur reçoit une commande prestigieuse à risque.",
      "Un collègue tente de te faire porter sa faute.",
      "Un client puissant exige un traitement préférentiel.",
      "Un contrôle interne évalue ta loyauté.",
      "Un bonus est promis si tu acceptes un délai impossible.",
      "Un apprenti talentueux demande à travailler sous tes ordres.",
      "Un fournisseur veut imposer de nouveaux tarifs.",
      "Une innovation technique pourrait te donner l'avantage.",
      "Un contrat secret circule entre les cadres.",
      "Une délégation extérieure observe ton efficacité."
    ],
    prison: [
      "Un geôlier te propose un arrangement discret.",
      "Deux factions de détenus cherchent ton soutien.",
      "Une fouille surprise cible ton quartier de cellule.",
      "Un plan d'évasion circule dans le bloc.",
      "Une bagarre générale éclate après le repas.",
      "Un codétenu offre des informations compromettantes.",
      "Le directeur annonce un durcissement des règles.",
      "Un avocat inattendu veut négocier ta situation.",
      "Ton nom apparaît dans un rapport disciplinaire.",
      "Un gardien te demande un service dangereux."
    ],
    spouse: [
      "Ton/ta partenaire réclame une décision sur votre avenir.",
      "Un proche de ton couple attise la méfiance.",
      "Un projet commun peut coûter cher mais unir davantage.",
      "Une jalousie passagère crée une forte tension.",
      "Un cadeau symbolique pourrait réparer un conflit récent.",
      "Une proposition de voyage divise vos priorités.",
      "Un secret du passé ressurgit dans votre foyer.",
      "Votre entourage pousse vers un engagement plus net."
    ]
  };

  const ACTION_FOLLOWUP_EVENTS = {
    Famille: [
      { text: "Un oncle demande une aide urgente.", tone: "warn", run: () => { changeMoney(-rnd(2, 14)); changeStat("reputation", 2); } },
      { text: "Un repas de famille apaise les tensions.", tone: "good", run: () => { changeStat("happiness", rnd(2, 8)); changeStat("sanity", 2); } },
      { text: "Un proche critique tes choix de vie.", tone: "bad", run: () => { changeStat("happiness", -5); changeStat("sanity", -2); } },
      { text: "Tu reçois un petit héritage inattendu.", tone: "good", run: () => { changeMoney(rnd(4, 35)); } },
      { text: "Une querelle familiale éclate.", tone: "warn", run: () => { changeStat("happiness", -4); changeStat("reputation", -2); } },
      { text: "Un parent te confie une relique.", tone: "good", run: () => { game.character.inventory.push("relique familiale"); changeStat("happiness", 4); } },
      { text: "Un cousin disparaît avec une dette commune.", tone: "bad", run: () => { game.character.debt += rnd(2, 18); } },
      { text: "Une lettre chaleureuse renforce vos liens.", tone: "good", run: () => { changeStat("sanity", 3); changeStat("happiness", 3); } },
      { text: "Un conflit d'héritage t'atteint.", tone: "warn", run: () => { changeStat("reputation", -3); changeStat("happiness", -3); } },
      { text: "Réconciliation familiale autour d'un feu.", tone: "good", run: () => { changeStat("happiness", 6); } }
    ],
    "École & carrière": [
      { text: "Un mentor remarque ton potentiel.", tone: "good", minAge: 10, run: () => { changeStat("intelligence", 4); changeStat("reputation", 3); } },
      { text: "Une erreur administrative complique ton parcours.", tone: "warn", minAge: 12, run: () => { changeStat("happiness", -3); } },
      { text: "Ton supérieur t'impose une charge lourde.", tone: "bad", minAge: 16, run: () => { changeStat("sanity", -4); } },
      { text: "Un contrat rentable est signé.", tone: "good", minAge: 16, run: () => { changeMoney(rnd(8, 40)); } },
      { text: "Un outil de travail se casse.", tone: "warn", minAge: 14, run: () => { changeMoney(-rnd(3, 15)); } },
      { text: "Une bourse d'étude réduit tes frais.", tone: "good", minAge: 14, run: () => { game.character.universityDebt = Math.max(0, game.character.universityDebt - rnd(5, 35)); } },
      { text: "Un collègue propage une rumeur.", tone: "bad", minAge: 16, run: () => { changeStat("reputation", -5); } },
      { text: "Tu apprends une technique rare.", tone: "good", minAge: 12, run: () => { changeStat("intelligence", 3); changeStat("strength", 2); } },
      { text: "Un contrôle des comptes t'inquiète.", tone: "warn", minAge: 16, run: () => { changeStat("sanity", -2); if (chance(0.35)) changeMoney(-rnd(4, 18)); } },
      { text: "Ton nom circule parmi les recruteurs.", tone: "good", minAge: 14, run: () => { changeStat("reputation", 4); } }
    ],
    "Santé & mental": [
      { text: "Une tisane monastique te soulage.", tone: "good", run: () => { changeStat("health", 5); } },
      { text: "Nuit agitée, sommeil insuffisant.", tone: "warn", run: () => { changeStat("sanity", -3); changeStat("happiness", -2); } },
      { text: "Une épidémie locale te fragilise.", tone: "bad", run: () => { addCondition("illnesses", pick(ILLNESSES)); changeStat("health", -6); } },
      { text: "Exercices respiratoires bénéfiques.", tone: "good", run: () => { changeStat("sanity", 5); } },
      { text: "Une vieille douleur réapparaît.", tone: "warn", run: () => { changeStat("health", -4); } },
      { text: "Le guérisseur retire une infection.", tone: "good", run: () => { clearCondition("illnesses"); changeStat("health", 4); } },
      { text: "Excès à table.", tone: "bad", run: () => { changeStat("health", -3); changeStat("happiness", 2); } },
      { text: "Balade matinale régénérante.", tone: "good", run: () => { changeStat("health", 3); changeStat("happiness", 3); } },
      { text: "Une chute te laisse courbaturé(e).", tone: "warn", run: () => { addCondition("injuries", pick(INJURIES)); changeStat("health", -5); } },
      { text: "Moment de clarté mentale.", tone: "good", run: () => { clearCondition("mental"); changeStat("sanity", 4); } }
    ],
    "Relations & amour": [
      { text: "Une personne charmante te remarque.", tone: "good", minAge: 14, run: () => { changeStat("happiness", 5); changeStat("looks", 1); } },
      { text: "Un ami se sent trahi.", tone: "bad", minAge: 10, run: () => { changeStat("reputation", -3); changeStat("happiness", -3); } },
      { text: "Un voisin te rend service.", tone: "good", minAge: 8, run: () => { changeStat("happiness", 3); changeMoney(rnd(1, 8)); } },
      { text: "Rivalité amoureuse naissante.", tone: "warn", minAge: 14, run: () => { changeStat("sanity", -2); } },
      { text: "Invitation à une célébration.", tone: "good", minAge: 12, run: () => { changeStat("reputation", 3); } },
      { text: "Un message ambigu sème le doute.", tone: "warn", minAge: 14, run: () => { changeStat("happiness", -2); changeStat("sanity", -2); } },
      { text: "Un enfant de la famille te rend fier/fière.", tone: "good", run: () => { changeStat("happiness", 4); } },
      { text: "Une dispute publique éclate.", tone: "bad", minAge: 12, run: () => { changeStat("reputation", -4); } },
      { text: "Un ancien ennemi se calme.", tone: "good", minAge: 12, run: () => { changeStat("sanity", 2); changeStat("reputation", 2); } },
      { text: "Une rencontre change ton regard sur l'amour.", tone: "good", minAge: 14, run: () => { changeStat("happiness", 6); } }
    ],
    "Argent & biens": [
      { text: "Le marché local monte soudainement.", tone: "good", minAge: 12, run: () => { changeMoney(rnd(5, 28)); } },
      { text: "Un impôt exceptionnel est levé.", tone: "bad", minAge: 12, run: () => { changeMoney(-rnd(4, 24)); } },
      { text: "Une bonne affaire au comptoir.", tone: "good", minAge: 10, run: () => { changeMoney(rnd(2, 16)); } },
      { text: "Un objet de valeur est abîmé.", tone: "warn", minAge: 10, run: () => { if (game.character.inventory.length) removeRandom(game.character.inventory); changeStat("happiness", -2); } },
      { text: "Ton animal attire des acheteurs.", tone: "good", minAge: 8, run: () => { if (game.character.animals.length && chance(0.4)) { removeRandom(game.character.animals); changeMoney(rnd(6, 24)); } } },
      { text: "Frais de réparation imprévus.", tone: "warn", minAge: 12, run: () => { changeMoney(-rnd(3, 20)); } },
      { text: "Un prêt peut être renégocié.", tone: "good", minAge: 16, run: () => { game.character.debt = Math.max(0, game.character.debt - rnd(4, 30)); } },
      { text: "Un voleur rôde dans le quartier.", tone: "bad", minAge: 10, run: () => { changeMoney(-rnd(2, 15)); } },
      { text: "Un marchand te récompense pour ta fidélité.", tone: "good", minAge: 10, run: () => { changeMoney(rnd(3, 18)); changeStat("reputation", 1); } },
      { text: "Une dette oubliée refait surface.", tone: "warn", minAge: 14, run: () => { game.character.debt += rnd(3, 16); } }
    ],
    "Crime & prison": [
      { text: "La garde renforce les patrouilles.", tone: "warn", minAge: 12, run: () => { changeStat("sanity", -2); } },
      { text: "Un indic te souffle une opportunité.", tone: "good", minAge: 14, run: () => { changeMoney(rnd(4, 22)); game.character.notoriety = clamp(game.character.notoriety + 3, -100, 100); } },
      { text: "Un complice te trahit.", tone: "bad", minAge: 14, run: () => { game.character.criminal.record += 1; changeStat("reputation", -6); } },
      { text: "Un geôlier ferme les yeux contre paiement.", tone: "warn", when: (c) => c.criminal.inPrison, run: () => { changeMoney(-rnd(3, 14)); if (chance(0.35)) game.character.criminal.yearsLeft = Math.max(0, game.character.criminal.yearsLeft - 1); } },
      { text: "Tu gagnes du respect en milieu hostile.", tone: "good", minAge: 14, run: () => { changeStat("strength", 3); game.character.notoriety = clamp(game.character.notoriety + 4, -100, 100); } },
      { text: "Une fouille surprise te pénalise.", tone: "bad", minAge: 12, run: () => { changeMoney(-rnd(2, 12)); changeStat("happiness", -3); } },
      { text: "Un dossier se perd mystérieusement.", tone: "good", minAge: 14, run: () => { game.character.criminal.record = Math.max(0, game.character.criminal.record - 1); } },
      { text: "Confrontation violente en ruelle.", tone: "warn", minAge: 14, run: () => { addCondition("injuries", pick(INJURIES)); changeStat("health", -5); } },
      { text: "Un magistrat durcit les peines.", tone: "bad", minAge: 14, run: () => { if (game.character.criminal.inPrison) game.character.criminal.yearsLeft += 1; } },
      { text: "Un marchand corrompu te verse une prime.", tone: "good", minAge: 16, run: () => { changeMoney(rnd(5, 26)); } }
    ],
    "Loisirs & spiritualité": [
      { text: "Une fête de village te ressource.", tone: "good", minAge: 10, run: () => { changeStat("happiness", 5); } },
      { text: "Une prière te calme profondément.", tone: "good", minAge: 8, run: () => { changeStat("sanity", 4); } },
      { text: "Un pari tourne mal.", tone: "bad", minAge: 14, run: () => { changeMoney(-rnd(2, 14)); changeStat("happiness", -2); } },
      { text: "Tu gagnes un petit tournoi local.", tone: "good", minAge: 12, run: () => { changeMoney(rnd(4, 20)); changeStat("reputation", 3); } },
      { text: "Un spectacle te donne des idées.", tone: "good", minAge: 10, run: () => { changeStat("intelligence", 2); } },
      { text: "Une chasse frustrante te fatigue.", tone: "warn", minAge: 12, run: () => { changeStat("health", -3); changeStat("happiness", -2); } },
      { text: "Tu rencontres un vieux sage.", tone: "good", minAge: 10, run: () => { changeStat("sanity", 3); changeStat("intelligence", 2); } },
      { text: "Tu dépenses trop en divertissements.", tone: "warn", minAge: 10, run: () => { changeMoney(-rnd(2, 10)); } },
      { text: "Un pèlerin te remet un talisman.", tone: "good", minAge: 10, run: () => { addUnique(game.character.inventory, "talisman gravé"); changeStat("happiness", 2); } },
      { text: "Une soirée agitée finit en chaos.", tone: "bad", minAge: 12, run: () => { addCondition("injuries", pick(INJURIES)); changeStat("health", -4); } }
    ]
  };

  const RARITY_CONFIG = {
    common: { label: "Commun", weight: 74 },
    rare: { label: "Rare", weight: 22 },
    legendary: { label: "Légendaire", weight: 4 }
  };

  const STORYLINE_EVENTS = {
    Famille: [
      {
        title: "Serment de sang",
        rarity: "rare",
        minAge: 12,
        startText: "Tu promets de restaurer l'honneur de ta famille.",
        startTone: "warn",
        startRun: () => {
          changeStat("reputation", 2);
          changeStat("sanity", 2);
        },
        steps: [
          {
            inYears: 2,
            text: "Un parent éloigné réclame ton aide pour une dette ancienne.",
            tone: "warn",
            run: () => {
              game.character.debt += rnd(4, 20);
              changeStat("happiness", -2);
            }
          },
          {
            inYears: 3,
            text: "Ton nom est publiquement salué pour ta loyauté familiale.",
            tone: "good",
            run: () => {
              changeStat("reputation", 8);
              changeStat("happiness", 5);
            }
          }
        ]
      }
    ],
    "École & carrière": [
      {
        title: "La route du maître",
        rarity: "rare",
        minAge: 14,
        startText: "Un maître artisan accepte de te former en secret.",
        startTone: "good",
        startRun: () => {
          changeStat("intelligence", 3);
          changeStat("reputation", 2);
        },
        steps: [
          {
            inYears: 2,
            text: "Ton mentor disparaît; tu reprends son atelier en crise.",
            tone: "warn",
            run: () => {
              changeMoney(-rnd(6, 25));
              changeStat("sanity", -3);
            }
          },
          {
            inYears: 3,
            text: "Ton savoir-faire devient réputé dans plusieurs villes.",
            tone: "good",
            run: () => {
              changeMoney(rnd(14, 55));
              changeStat("reputation", 9);
            }
          }
        ]
      }
    ],
    "Santé & mental": [
      {
        title: "Le remède perdu",
        rarity: "legendary",
        minAge: 12,
        startText: "Tu découvres des notes sur un remède oublié.",
        startTone: "good",
        startRun: () => {
          changeStat("intelligence", 4);
          changeStat("sanity", 2);
        },
        steps: [
          {
            inYears: 2,
            text: "L'essai du remède échoue et t'épuise.",
            tone: "warn",
            run: () => {
              changeStat("health", -5);
              changeStat("sanity", -4);
            }
          },
          {
            inYears: 3,
            text: "Une version améliorée soulage durablement tes douleurs.",
            tone: "good",
            run: () => {
              clearCondition("illnesses");
              clearCondition("mental");
              changeStat("health", 10);
              changeStat("sanity", 8);
            }
          }
        ]
      }
    ],
    "Relations & amour": [
      {
        title: "Romance interdite",
        rarity: "rare",
        minAge: 14,
        startText: "Une relation secrète débute malgré les interdits.",
        startTone: "warn",
        startRun: () => {
          changeStat("happiness", 5);
          changeStat("sanity", -1);
        },
        steps: [
          {
            inYears: 2,
            text: "La relation éclate au grand jour et provoque un scandale.",
            tone: "bad",
            run: () => {
              changeStat("reputation", -8);
              changeStat("happiness", -6);
            }
          },
          {
            inYears: 3,
            text: "Contre toute attente, vous obtenez la bénédiction des proches.",
            tone: "good",
            run: () => {
              changeStat("reputation", 7);
              changeStat("happiness", 8);
            }
          }
        ]
      }
    ],
    "Argent & biens": [
      {
        title: "Caravane perdue",
        rarity: "legendary",
        minAge: 16,
        startText: "Tu investis dans une caravane vers l'Orient.",
        startTone: "warn",
        startRun: () => {
          changeMoney(-rnd(12, 40));
          changeStat("sanity", -2);
        },
        steps: [
          {
            inYears: 2,
            text: "Aucune nouvelle de la caravane: tes créanciers s'impatientent.",
            tone: "bad",
            run: () => {
              game.character.debt += rnd(10, 36);
              changeStat("happiness", -5);
            }
          },
          {
            inYears: 3,
            text: "La caravane revient chargée d'épices rares.",
            tone: "good",
            run: () => {
              changeMoney(rnd(35, 130));
              changeStat("reputation", 8);
            }
          }
        ]
      }
    ],
    "Crime & prison": [
      {
        title: "Le dossier noir",
        rarity: "rare",
        minAge: 14,
        startText: "Tu mets la main sur des documents compromettants.",
        startTone: "warn",
        startRun: () => {
          game.character.notoriety = clamp(game.character.notoriety + 6, -100, 100);
        },
        steps: [
          {
            inYears: 2,
            text: "Un juge influent ordonne une traque contre ton réseau.",
            tone: "bad",
            run: () => {
              game.character.criminal.record += 1;
              changeStat("reputation", -6);
            }
          },
          {
            inYears: 3,
            text: "Tu retournes la situation en vendant ces preuves à prix d'or.",
            tone: "good",
            run: () => {
              changeMoney(rnd(18, 70));
              game.character.criminal.record = Math.max(0, game.character.criminal.record - 1);
            }
          }
        ]
      }
    ],
    "Loisirs & spiritualité": [
      {
        title: "La prophétie du pèlerin",
        rarity: "rare",
        minAge: 10,
        startText: "Un pèlerin te confie une prophétie inquiétante.",
        startTone: "warn",
        startRun: () => {
          changeStat("sanity", -1);
          addUnique(game.character.inventory, "parchemin prophétique");
        },
        steps: [
          {
            inYears: 2,
            text: "La prophétie semble se réaliser: une perte te secoue.",
            tone: "bad",
            run: () => {
              changeStat("happiness", -6);
              changeMoney(-rnd(4, 20));
            }
          },
          {
            inYears: 3,
            text: "Tu comprends enfin le message et évites une grande catastrophe.",
            tone: "good",
            run: () => {
              changeStat("sanity", 9);
              changeStat("reputation", 5);
            }
          }
        ]
      }
    ]
  };

  const DELAYED_CONSEQUENCE_LIBRARY = {
    Famille: [
      { text: "Un héritage est enfin réglé en ta faveur.", tone: "good", run: () => changeMoney(rnd(6, 32)) },
      { text: "Une rancune familiale ressurgit.", tone: "warn", run: () => changeStat("happiness", -4) },
      { text: "Un proche tombe malade et dépend de toi.", tone: "bad", run: () => { changeMoney(-rnd(3, 18)); changeStat("sanity", -3); } }
    ],
    "École & carrière": [
      { text: "Ton dossier académique te vaut une opportunité.", tone: "good", run: () => changeStat("reputation", 5) },
      { text: "Une erreur de registre bloque une promotion.", tone: "warn", run: () => changeStat("happiness", -3) },
      { text: "Un ancien maître recommande ton nom.", tone: "good", run: () => { changeMoney(rnd(5, 24)); changeStat("reputation", 3); } }
    ],
    "Santé & mental": [
      { text: "Un traitement ancien révèle enfin ses effets positifs.", tone: "good", run: () => changeStat("health", 6) },
      { text: "Une faiblesse latente réapparaît brusquement.", tone: "warn", run: () => changeStat("health", -5) },
      { text: "Tes habitudes te rattrapent plus tard que prévu.", tone: "bad", run: () => { addCondition("illnesses", pick(ILLNESSES)); changeStat("sanity", -3); } }
    ],
    "Relations & amour": [
      { text: "Un ancien lien revient avec de bonnes nouvelles.", tone: "good", run: () => changeStat("happiness", 5) },
      { text: "Un secret de couple éclate tardivement.", tone: "bad", run: () => changeStat("reputation", -5) },
      { text: "Une réconciliation inattendue se produit.", tone: "good", run: () => changeStat("sanity", 4) }
    ],
    "Argent & biens": [
      { text: "Un investissement oublié finit par rapporter.", tone: "good", run: () => changeMoney(rnd(8, 42)) },
      { text: "Des intérêts cachés gonflent ta dette.", tone: "warn", run: () => { game.character.debt += rnd(4, 22); } },
      { text: "Une taxe rétroactive frappe tes biens.", tone: "bad", run: () => changeMoney(-rnd(6, 26)) }
    ],
    "Crime & prison": [
      { text: "Une vieille affaire est rouverte.", tone: "bad", run: () => { game.character.criminal.record += 1; changeStat("reputation", -5); } },
      { text: "Un témoin se rétracte tardivement.", tone: "good", run: () => { game.character.criminal.record = Math.max(0, game.character.criminal.record - 1); } },
      { text: "Un rival criminel réclame sa part.", tone: "warn", run: () => { changeMoney(-rnd(4, 20)); game.character.notoriety = clamp(game.character.notoriety + 5, -100, 100); } }
    ],
    "Loisirs & spiritualité": [
      { text: "Ton engagement spirituel améliore ta réputation.", tone: "good", run: () => changeStat("reputation", 4) },
      { text: "Un pari ancien te revient en plein visage.", tone: "bad", run: () => changeMoney(-rnd(4, 18)) },
      { text: "Une relation créée en voyage t'aide des années plus tard.", tone: "good", run: () => { changeMoney(rnd(5, 20)); changeStat("happiness", 3); } }
    ]
  };

  const ui = {
    startScreen: document.getElementById("start-screen"),
    gameShell: document.getElementById("game-shell"),
    startNewBtn: document.getElementById("start-new-btn"),
    startSavesList: document.getElementById("start-saves-list"),
    newLifeBtn: document.getElementById("new-life-btn"),
    saveCurrentBtn: document.getElementById("save-current-btn"),
    goHomeBtn: document.getElementById("go-home-btn"),
    settingsSavesList: document.getElementById("settings-saves-list"),
    topSettingsBtn: document.getElementById("top-settings-btn"),
    profileTrigger: document.getElementById("profile-trigger"),
    profileAvatar: document.getElementById("profile-avatar"),
    profileName: document.getElementById("profile-name"),
    profileStage: document.getElementById("profile-stage"),
    profileMoney: document.getElementById("profile-money"),
    openAvatarEditorInlineBtn: document.getElementById("open-avatar-editor-inline-btn"),
    statusStrip: document.getElementById("status-strip"),
    professionSummaryList: document.getElementById("profession-summary-list"),
    professionSchoolRoot: document.getElementById("profession-school-root"),
    professionJobRoot: document.getElementById("profession-job-root"),
    professionColleaguesRoot: document.getElementById("profession-colleagues-root"),
    professionMilitaryRoot: document.getElementById("profession-military-root"),
    schoolPeopleRoot: document.getElementById("school-people-root"),
    subpageScreen: document.getElementById("subpage-screen"),
    subpageBackBtn: document.getElementById("subpage-back-btn"),
    subpageJournalBtn: document.getElementById("subpage-journal-btn"),
    subpageTitle: document.getElementById("subpage-title"),
    subpageContent: document.getElementById("subpage-content"),
    eventText: document.getElementById("event-text"),
    eventChoices: document.getElementById("event-choices"),
    activityRoot: document.getElementById("activity-root"),
    crimeRoot: document.getElementById("crime-root"),
    detailMenu: document.getElementById("detail-menu"),
    resourcesList: document.getElementById("resources-list"),
    conditionsList: document.getElementById("conditions-list"),
    relationsList: document.getElementById("relations-list"),
    relationPeopleRoot: document.getElementById("relation-people-root"),
    log: document.getElementById("log"),
    inventoryList: document.getElementById("inventory-list"),
    animalsList: document.getElementById("animals-list"),
    childrenList: document.getElementById("children-list"),
    relationRoot: document.getElementById("relation-root"),
    actionCategoryTemplate: document.getElementById("action-category-template"),
    tabButtons: document.querySelectorAll(".tab-btn"),
    screens: document.querySelectorAll(".screen"),
    badges: {
      home: document.getElementById("badge-home"),
      assets: document.getElementById("badge-assets"),
      relationships: document.getElementById("badge-relationships"),
      activities: document.getElementById("badge-activities")
    },
    deathModal: document.getElementById("death-modal"),
    deathTitle: document.getElementById("death-title"),
    deathStats: document.getElementById("death-stats"),
    deathRecap: document.getElementById("death-recap"),
    deathNewLifeBtn: document.getElementById("death-new-life-btn"),
    deathLegacyBtn: document.getElementById("death-legacy-btn"),
    characterModal: document.getElementById("character-modal"),
    characterInfoList: document.getElementById("character-info-list"),
    characterCloseBtn: document.getElementById("character-close-btn"),
    characterEditAvatarBtn: document.getElementById("character-edit-avatar-btn"),
    openAvatarEditorBtn: document.getElementById("open-avatar-editor-btn"),
    avatarEditorModal: document.getElementById("avatar-editor-modal"),
    avatarEditorCloseBtn: document.getElementById("avatar-editor-close-btn"),
    avatarEditorRandomBtn: document.getElementById("avatar-editor-random-btn"),
    avatarEditorResetBtn: document.getElementById("avatar-editor-reset-btn"),
    avatarEditorSaveBtn: document.getElementById("avatar-editor-save-btn"),
    avatarEditorCancelBtn: document.getElementById("avatar-editor-cancel-btn"),
    avatarEditorPreview: document.getElementById("avatar-editor-preview"),
    avatarSkinSelect: document.getElementById("avatar-skin-select"),
    avatarHairStyleSelect: document.getElementById("avatar-hair-style-select"),
    avatarHairColorSelect: document.getElementById("avatar-hair-color-select"),
    avatarEyeColorSelect: document.getElementById("avatar-eye-color-select"),
    avatarBeardSelect: document.getElementById("avatar-beard-select"),
    avatarOutfitSelect: document.getElementById("avatar-outfit-select"),
    avatarAccessorySelect: document.getElementById("avatar-accessory-select"),
    actionResultModal: document.getElementById("action-result-modal"),
    actionResultTitle: document.getElementById("action-result-title"),
    actionResultText: document.getElementById("action-result-text"),
    actionResultDetails: document.getElementById("action-result-details"),
    actionResultCloseBtn: document.getElementById("action-result-close-btn")
  };

  let game = null;
  let activeTab = "home";
  let previousTabBeforeSettings = "home";
  let isCharacterModalOpen = false;
  let isAvatarEditorOpen = false;
  let actionResultState = null;
  let currentSaveId = null;
  let activeSubpage = null;

  const SAVE_STORAGE_KEY = "chroniquesDynastieSavesV1";

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

  function optionColor(options, id) {
    return options.find((entry) => entry.id === id)?.color;
  }

  function randomAvatarConfig(sex) {
    return {
      skin: pick(AVATAR_SKINS).id,
      hairStyle: pick(AVATAR_HAIR_STYLES),
      hairColor: pick(AVATAR_HAIR_COLORS).id,
      eyeColor: pick(AVATAR_EYE_COLORS).id,
      beard: sex === "Homme" ? pick(AVATAR_BEARDS) : "aucune",
      outfit: pick(AVATAR_OUTFITS).id,
      accessory: chance(0.45) ? pick(AVATAR_ACCESSORIES) : "aucun"
    };
  }

  function normalizedAvatarConfig(sex, avatar) {
    const fallback = randomAvatarConfig(sex);
    return {
      skin: avatar?.skin || fallback.skin,
      hairStyle: avatar?.hairStyle || fallback.hairStyle,
      hairColor: avatar?.hairColor || fallback.hairColor,
      eyeColor: avatar?.eyeColor || fallback.eyeColor,
      beard: sex === "Homme" ? avatar?.beard || fallback.beard : "aucune",
      outfit: avatar?.outfit || fallback.outfit,
      accessory: avatar?.accessory || fallback.accessory
    };
  }

  function rarityOf(entry) {
    return entry?.rarity && RARITY_CONFIG[entry.rarity] ? entry.rarity : "common";
  }

  function rarityLabel(rarity) {
    return RARITY_CONFIG[rarityOf({ rarity })].label;
  }

  function weightedPickByRarity(entries) {
    if (!entries.length) return null;
    const weighted = entries.map((entry) => ({
      value: entry,
      weight: RARITY_CONFIG[rarityOf(entry)].weight
    }));
    return weightedPick(weighted);
  }

  function isEventEligible(entry, character) {
    if (entry.minAge && character.age < entry.minAge) return false;
    if (entry.maxAge && character.age > entry.maxAge) return false;
    if (entry.when && !entry.when(character)) return false;
    return true;
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

  function loadSaveStore() {
    try {
      const raw = localStorage.getItem(SAVE_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch {
      return [];
    }
  }

  function persistSaveStore(saves) {
    localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(saves));
  }

  function serializeCurrentGame() {
    if (!game || !game.character) return null;
    const payload = {
      dynastyName: game.dynastyName,
      log: game.log,
      pendingEvent: null,
      character: game.character,
      achievements: game.achievements,
      scheduledConsequences: (game.scheduledConsequences || []).map((entry) => ({
        triggerAge: entry.triggerAge,
        text: entry.text,
        tone: entry.tone,
        rarity: entry.rarity
      }))
    };
    return JSON.parse(JSON.stringify(payload));
  }

  function summarizeSave(data, saveName, saveId, updatedAt) {
    const c = data?.character || {};
    return {
      id: saveId,
      name: saveName || c.fullName || "Sauvegarde",
      updatedAt,
      characterName: c.fullName || "Personnage inconnu",
      age: c.age ?? 0,
      generation: c.generation ?? 1,
      money: Math.round(c.money ?? 0)
    };
  }

  function upsertSaveEntry({ id, name, data }) {
    const saves = loadSaveStore();
    const updatedAt = new Date().toISOString();
    const entry = {
      ...summarizeSave(data, name, id, updatedAt),
      data
    };
    const idx = saves.findIndex((item) => item.id === id);
    if (idx >= 0) {
      saves[idx] = entry;
    } else {
      saves.unshift(entry);
    }
    persistSaveStore(saves);
  }

  function showStartScreen() {
    ui.startScreen.classList.remove("is-hidden");
    ui.gameShell.classList.add("is-hidden");
    activeTab = "home";
    previousTabBeforeSettings = "home";
    isCharacterModalOpen = false;
    isAvatarEditorOpen = false;
    actionResultState = null;
    activeSubpage = null;
    renderSaveLists();
  }

  function showGameShell() {
    ui.startScreen.classList.add("is-hidden");
    ui.gameShell.classList.remove("is-hidden");
  }

  function formatSaveDate(isoDate) {
    try {
      const d = new Date(isoDate);
      return d.toLocaleString("fr-FR");
    } catch {
      return "date inconnue";
    }
  }

  function saveCardHtml(save) {
    return `
      <p class="save-title">${save.name}</p>
      <p class="save-meta">${save.characterName} · ${save.age} ans · Génération ${save.generation} · ${save.money} pièces</p>
      <p class="save-meta">Dernière maj: ${formatSaveDate(save.updatedAt)}</p>
      <div class="save-controls">
        <button class="btn btn-green" data-save-load="${save.id}">Charger</button>
        <button class="btn btn-orange" data-save-delete="${save.id}">Supprimer</button>
      </div>
    `;
  }

  function restoreGameFromSave(save) {
    const payload = save?.data;
    if (!payload?.character) return false;
    game = payload;
    game.pendingEvent = null;
    game.scheduledConsequences = (payload.scheduledConsequences || []).map((entry) => ({
      ...entry,
      run: null
    }));
    game.character.avatar = normalizedAvatarConfig(game.character.sex, game.character.avatar);
    ensureCharacterIntegrity(game.character);
    ensureSchoolNetwork(game.character);
    ensureColleagues(game.character);
    currentSaveId = save.id;
    activeTab = "home";
    isCharacterModalOpen = false;
    isAvatarEditorOpen = false;
    actionResultState = null;
    activeSubpage = null;
    showGameShell();
    render();
    return true;
  }

  function saveCurrentProgress() {
    if (!game?.character) return;
    const data = serializeCurrentGame();
    if (!data) return;
    const saves = loadSaveStore();
    let saveId = currentSaveId;
    if (!saveId) {
      saveId = crypto.randomUUID();
    }
    const suggested = `${game.character.fullName} (${game.character.age} ans)`;
    const existingName = saves.find((entry) => entry.id === saveId)?.name;
    const saveName = existingName || suggested;
    upsertSaveEntry({ id: saveId, name: saveName, data });
    currentSaveId = saveId;
    addLog(`Progression sauvegardée (${saveName}).`, "good");
    renderSaveLists();
  }

  function autoSaveIfLinked() {
    if (!currentSaveId || !game?.character) return;
    const saves = loadSaveStore();
    const existing = saves.find((entry) => entry.id === currentSaveId);
    const name = existing?.name || `${game.character.fullName} (${game.character.age} ans)`;
    upsertSaveEntry({ id: currentSaveId, name, data: serializeCurrentGame() });
  }

  function deleteSaveById(saveId) {
    const saves = loadSaveStore();
    const target = saves.find((save) => save.id === saveId);
    if (!target) return;
    if (!window.confirm(`Supprimer la sauvegarde "${target.name}" ?`)) return;
    const next = saves.filter((save) => save.id !== saveId);
    persistSaveStore(next);
    if (currentSaveId === saveId) {
      currentSaveId = null;
    }
    renderSaveLists();
  }

  function handleSaveListClick(event) {
    const loadId = event.target.getAttribute("data-save-load");
    const deleteId = event.target.getAttribute("data-save-delete");
    const saves = loadSaveStore();
    if (loadId) {
      const entry = saves.find((save) => save.id === loadId);
      if (entry) restoreGameFromSave(entry);
      return;
    }
    if (deleteId) {
      deleteSaveById(deleteId);
    }
  }

  function renderSaveListInto(container) {
    if (!container) return;
    const saves = loadSaveStore();
    container.innerHTML = "";
    if (!saves.length) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "Aucune sauvegarde pour le moment.";
      container.append(empty);
      return;
    }
    saves.forEach((save) => {
      const div = document.createElement("div");
      div.className = "save-item";
      div.innerHTML = saveCardHtml(save);
      container.append(div);
    });
  }

  function renderSaveLists() {
    renderSaveListInto(ui.startSavesList);
    renderSaveListInto(ui.settingsSavesList);
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
    const inheritedClass = inherited?.className
      ? SOCIAL_CLASSES.find((entry) => entry.name === inherited.className)
      : null;
    const socialClass = inheritedClass && inheritedClass.name !== "Clergé"
      ? inheritedClass
      : pick(STARTING_SOCIAL_CLASSES);
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
    const avatar = normalizedAvatarConfig(sex, inherited?.avatarConfig || null);

    return {
      firstName,
      surname,
      fullName: `${firstName} ${surname}`,
      country,
      sex,
      socialClass: socialClass.name,
      age,
      alive: true,
      stats,
      money: socialClass.baseMoney + inheritedMoney,
      debt: inherited?.debtCarry || 0,
      fame: inherited?.fameCarry || 0,
      notoriety: inherited?.notorietyCarry || 0,
      karma: rnd(-10, 10),
      school: {
        enrolled: age >= 5 && age < 16,
        expelled: false,
        grade: rnd(35, 75),
        clubs: [],
        teacher: null,
        classmates: [],
        classroomSize: rnd(5, 9)
      },
      educationLevel: inherited?.educationLevel || 0,
      universityDebt: 0,
      job: null,
      salary: 0,
      careerLevel: 0,
      politicalLevel: 0,
      celebrity: 0,
      military: {
        branch: null,
        rank: 0
      },
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
      avatar,
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

  function bootstrapGame(inherited = null, options = {}) {
    const preserveSaveId = !!options.preserveSaveId;
    if (!preserveSaveId) {
      currentSaveId = null;
    }
    const generation = inherited?.generation || 1;
    game = {
      dynastyName: inherited?.surname || null,
      log: [],
      pendingEvent: null,
      scheduledConsequences: inherited?.scheduledConsequences || [],
      character: createInitialCharacter(generation, inherited),
      achievements: []
    };
    game.dynastyName = game.character.surname;
    ensureCharacterIntegrity(game.character);
    ensureSchoolNetwork(game.character);
    ensureColleagues(game.character);
    activeTab = "home";
    previousTabBeforeSettings = "home";
    actionResultState = null;
    isCharacterModalOpen = false;
    isAvatarEditorOpen = false;
    activeSubpage = null;
    addLog(
      `Début de la génération ${game.character.generation} : ${game.character.fullName} naît en ${game.character.country}.`,
      "good"
    );
    spawnAmbientPeople();
    ensureChecklist();
    showGameShell();
    render();
  }

  function ensureChecklist() {
    return;
  }

  function addLog(text, tone = "neutral") {
    game.log.unshift({ text, tone });
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
      avatar: randomAvatarConfig(sex),
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

  function ensurePersonIdentity(person) {
    if (!person) return;
    if (!person.id) {
      person.id = crypto.randomUUID();
    }
    if (typeof person.closeness !== "number" && typeof person.bond !== "number") {
      person.closeness = rnd(30, 75);
    }
  }

  function ensureCharacterIntegrity(c) {
    if (!c.school) {
      c.school = { enrolled: false, expelled: false, grade: 50, clubs: [], teacher: null, classmates: [], classroomSize: 7 };
    }
    c.school.clubs = Array.isArray(c.school.clubs) ? c.school.clubs : [];
    c.school.classmates = Array.isArray(c.school.classmates) ? c.school.classmates : [];
    c.school.classroomSize = c.school.classroomSize || rnd(5, 9);

    if (!c.family) c.family = { parents: [], siblings: [], spouse: null, inlaws: [], children: [] };
    c.family.parents = Array.isArray(c.family.parents) ? c.family.parents : [];
    c.family.siblings = Array.isArray(c.family.siblings) ? c.family.siblings : [];
    c.family.inlaws = Array.isArray(c.family.inlaws) ? c.family.inlaws : [];
    c.family.children = Array.isArray(c.family.children) ? c.family.children : [];
    c.family.parents.forEach(ensurePersonIdentity);
    c.family.siblings.forEach(ensurePersonIdentity);
    c.family.inlaws.forEach(ensurePersonIdentity);
    c.family.children.forEach(ensurePersonIdentity);
    if (c.family.spouse) ensurePersonIdentity(c.family.spouse);

    if (!c.social) c.social = { friends: [], enemies: [], neighbors: [], colleagues: [] };
    c.social.friends = Array.isArray(c.social.friends) ? c.social.friends : [];
    c.social.enemies = Array.isArray(c.social.enemies) ? c.social.enemies : [];
    c.social.neighbors = Array.isArray(c.social.neighbors) ? c.social.neighbors : [];
    c.social.colleagues = Array.isArray(c.social.colleagues) ? c.social.colleagues : [];
    c.social.friends.forEach(ensurePersonIdentity);
    c.social.enemies.forEach(ensurePersonIdentity);
    c.social.neighbors.forEach(ensurePersonIdentity);
    c.social.colleagues.forEach(ensurePersonIdentity);
    if (c.school.teacher) ensurePersonIdentity(c.school.teacher);
    c.school.classmates.forEach(ensurePersonIdentity);

    if (!c.military) {
      c.military = { branch: null, rank: 0 };
    }
    if (typeof c.military.rank !== "number") {
      c.military.rank = 0;
    }
  }

  function ensureSchoolNetwork(c) {
    const canAttend = c.age >= 5 && c.age < 18 && c.school.enrolled && !c.school.expelled;
    if (!canAttend) {
      c.school.teacher = null;
      c.school.classmates = [];
      return;
    }

    if (!c.school.classroomSize) {
      c.school.classroomSize = rnd(5, 9);
    }

    if (!c.school.teacher || !c.school.teacher.alive) {
      c.school.teacher = newPerson(
        "Professeur",
        Math.max(24, c.age + 10),
        Math.max(36, c.age + 22),
        pick(SURNAMES)
      );
      c.school.teacher.closeness = rnd(30, 70);
    }
    ensurePersonIdentity(c.school.teacher);

    c.school.classmates = c.school.classmates.filter((student) => student.alive);
    while (c.school.classmates.length < c.school.classroomSize) {
      const classmate = newPerson("Élève", Math.max(5, c.age - 2), Math.min(17, c.age + 2), pick(SURNAMES));
      classmate.closeness = rnd(25, 78);
      c.school.classmates.push(classmate);
    }
    if (c.school.classmates.length > c.school.classroomSize) {
      c.school.classmates = c.school.classmates.slice(0, c.school.classroomSize);
    }
    c.school.classmates.forEach(ensurePersonIdentity);
  }

  function ensureColleagues(c) {
    if (!c.job || c.criminal.inPrison) {
      c.social.colleagues = [];
      return;
    }
    c.social.colleagues = c.social.colleagues.filter((person) => person.alive);
    const target = clamp(2 + Math.floor(c.careerLevel / 2), 1, 6);
    while (c.social.colleagues.length < target) {
      const colleague = newPerson("Collègue", Math.max(16, c.age - 14), c.age + 12, pick(SURNAMES));
      colleague.closeness = rnd(28, 76);
      c.social.colleagues.push(colleague);
    }
    if (c.social.colleagues.length > target + 1) {
      c.social.colleagues = c.social.colleagues.slice(0, target + 1);
    }
    c.social.colleagues.forEach(ensurePersonIdentity);
  }

  function relationValue(person) {
    if (!person) return 0;
    if (typeof person.closeness === "number") return person.closeness;
    if (typeof person.bond === "number") return person.bond;
    return 50;
  }

  function setRelationValue(person, value) {
    if (!person) return;
    if (typeof person.closeness === "number") {
      person.closeness = clamp(value, 0, 100);
      return;
    }
    if (typeof person.bond === "number") {
      person.bond = clamp(value, 0, 100);
      return;
    }
    person.closeness = clamp(value, 0, 100);
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
    ensureColleagues(c);
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
        addLog(`${relative.name} (${relative.role}) meurt.`, "warn");
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
    if (c.age >= 5 && c.age < 16 && !c.school.expelled) {
      c.school.enrolled = true;
      c.school.grade = clamp(c.school.grade + rnd(-5, 6));
      ensureSchoolNetwork(c);
      if (c.school.teacher?.alive) {
        c.school.teacher.age += 1;
      }
      c.school.classmates.forEach((student) => {
        if (student.alive) {
          student.age += 1;
          if (chance(0.06)) {
            student.closeness = clamp(student.closeness + rnd(-5, 5), 0, 100);
          }
        }
      });
      if (chance(0.05)) {
        addLog("Une altercation éclate à l'école.", "warn");
        if (chance(0.3)) {
          changeStat("strength", 2);
          changeStat("health", -4);
        }
      }
    } else {
      c.school.enrolled = false;
      ensureSchoolNetwork(c);
    }

    if (c.age >= 16 && c.job && !c.criminal.inPrison) {
      ensureColleagues(c);
      const promotionRoll = 0.06 + c.stats.intelligence / 700 + c.careerLevel * 0.02;
      if (chance(promotionRoll)) {
        c.careerLevel += 1;
        c.salary += rnd(4, 12);
        changeStat("reputation", rnd(2, 7));
        addLog("Tu obtiens une promotion après une période agitée.", "good");
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
        c.social.colleagues = [];
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
      avatarConfig: normalizedAvatarConfig(heir.sex, heir.avatar || game.character.avatar),
      childrenCarry: []
    };
    bootstrapGame(legacyData, { preserveSaveId: true });
    addLog(`Tu incarnes désormais ${game.character.fullName}, héritier(e) de la lignée.`, "good");
    render();
  }

  function consumeAction() {
    if (!game.character.alive) {
      return false;
    }
    if (game.pendingEvent) {
      addLog("Résous l'événement en cours avant d'agir ailleurs.", "warn");
      return false;
    }
    return true;
  }

  function textsFromBlueprint(blueprint) {
    const output = [];
    for (const subject of blueprint.subjects) {
      for (const context of blueprint.contexts) {
        for (const twist of blueprint.twists) {
          output.push(`${subject} ${context} ${twist}`);
          if (output.length >= blueprint.limit) {
            return output;
          }
        }
      }
    }
    return output;
  }

  function applyMassEventOutcome(c, bias, approach) {
    const style = approach;
    if (bias === "money") {
      if (style === "safe") {
        changeMoney(rnd(-3, 8));
        changeStat("sanity", 1);
      } else if (style === "balanced") {
        if (chance(0.58)) changeMoney(rnd(5, 24));
        else changeMoney(-rnd(4, 15));
      } else if (chance(0.4)) {
        changeMoney(rnd(18, 70));
        game.character.notoriety = clamp(game.character.notoriety + rnd(2, 7), -100, 100);
      } else {
        changeMoney(-rnd(10, 32));
        changeStat("reputation", -2);
      }
      return;
    }

    if (bias === "reputation") {
      if (style === "safe") {
        changeStat("reputation", rnd(1, 4));
        changeStat("happiness", -1);
      } else if (style === "balanced") {
        if (chance(0.55)) changeStat("reputation", rnd(3, 8));
        else changeStat("reputation", -rnd(2, 6));
      } else if (chance(0.42)) {
        changeStat("reputation", rnd(6, 12));
        changeStat("happiness", 2);
      } else {
        changeStat("reputation", -rnd(6, 14));
        changeStat("sanity", -2);
      }
      return;
    }

    if (bias === "health") {
      if (style === "safe") {
        changeStat("health", rnd(2, 7));
        clearCondition("injuries");
      } else if (style === "balanced") {
        if (chance(0.6)) changeStat("health", rnd(1, 6));
        else {
          addCondition("injuries", pick(INJURIES));
          changeStat("health", -rnd(3, 8));
        }
      } else if (chance(0.38)) {
        changeStat("health", rnd(4, 10));
        changeStat("strength", rnd(1, 4));
      } else {
        addCondition("injuries", pick(INJURIES));
        if (chance(0.28)) addCondition("illnesses", pick(ILLNESSES));
        changeStat("health", -rnd(8, 14));
      }
      return;
    }

    if (bias === "learning") {
      if (style === "safe") {
        changeStat("intelligence", rnd(2, 5));
      } else if (style === "balanced") {
        if (chance(0.62)) {
          changeStat("intelligence", rnd(3, 8));
          if (game.character.age >= 10 && chance(0.2)) {
            game.character.educationLevel = Math.min(4, game.character.educationLevel + 1);
          }
        } else {
          changeStat("sanity", -2);
        }
      } else if (chance(0.37)) {
        changeStat("intelligence", rnd(5, 11));
        changeStat("reputation", 2);
      } else {
        changeStat("sanity", -4);
        changeStat("happiness", -3);
      }
      return;
    }

    if (bias === "family") {
      if (style === "safe") {
        relationshipPulse(c.family.parents, 4);
        relationshipPulse(c.family.siblings, 3);
        changeStat("happiness", 2);
      } else if (style === "balanced") {
        relationshipPulse(c.family.parents, chance(0.55) ? 6 : -4);
        relationshipPulse(c.family.siblings, chance(0.55) ? 5 : -5);
        changeStat("happiness", chance(0.55) ? 4 : -3);
      } else if (chance(0.4)) {
        relationshipPulse(c.family.parents, 8);
        relationshipPulse(c.family.siblings, 7);
        if (c.family.spouse?.alive) {
          c.family.spouse.closeness = clamp(c.family.spouse.closeness + 10, 0, 100);
        }
      } else {
        relationshipPulse(c.family.parents, -9);
        relationshipPulse(c.family.siblings, -9);
        if (c.family.spouse?.alive) {
          c.family.spouse.closeness = clamp(c.family.spouse.closeness - 12, 0, 100);
        }
      }
      return;
    }

    if (bias === "crime") {
      if (style === "safe") {
        changeStat("reputation", 2);
        changeStat("sanity", 1);
      } else if (style === "balanced") {
        if (chance(0.5)) {
          changeMoney(rnd(3, 18));
          c.notoriety = clamp(c.notoriety + 3, -100, 100);
        } else {
          tryCrime("affaire louche", 2, 10, 0.26, 0.005, [1, 2]);
        }
      } else if (c.age >= 14) {
        tryCrime("coup téméraire", 8, 35, 0.34, 0.015, [1, 4]);
      } else {
        changeStat("reputation", -3);
        changeStat("happiness", -2);
      }
      return;
    }

    if (bias === "spiritual") {
      if (style === "safe") {
        changeStat("sanity", rnd(2, 6));
        changeStat("happiness", 2);
      } else if (style === "balanced") {
        if (chance(0.58)) {
          changeStat("sanity", rnd(3, 8));
          changeStat("reputation", 2);
        } else {
          changeStat("sanity", -3);
        }
      } else if (chance(0.42)) {
        clearCondition("mental");
        changeStat("sanity", rnd(5, 10));
      } else {
        addCondition("mental", pick(MENTAL_ISSUES));
        changeStat("sanity", -rnd(5, 10));
      }
      return;
    }

    if (style === "safe") {
      changeStat("reputation", 1);
      changeStat("happiness", 1);
    } else if (style === "balanced") {
      if (chance(0.55)) {
        changeStat("reputation", 3);
        changeMoney(rnd(2, 10));
      } else {
        changeStat("reputation", -3);
      }
    } else if (chance(0.35)) {
      game.character.politicalLevel = clamp(game.character.politicalLevel + 1, 0, 10);
      changeStat("reputation", 6);
    } else {
      game.character.politicalLevel = Math.max(0, game.character.politicalLevel - 1);
      changeStat("reputation", -6);
      changeStat("sanity", -2);
    }
  }

  function inferMassEventTheme(text, fallbackTheme = "city") {
    const lower = text.toLowerCase();
    if (
      lower.includes("geôlier") ||
      lower.includes("détenu") ||
      lower.includes("cellule") ||
      lower.includes("évasion") ||
      lower.includes("gardien")
    ) {
      return "prison";
    }
    if (
      lower.includes("partenaire") ||
      lower.includes("couple") ||
      lower.includes("jalousie") ||
      lower.includes("foyer")
    ) {
      return "romance";
    }
    if (
      lower.includes("école") ||
      lower.includes("instituteur") ||
      lower.includes("apprenti") ||
      lower.includes("érudit") ||
      lower.includes("maître")
    ) {
      return "school";
    }
    if (
      lower.includes("guilde") ||
      lower.includes("atelier") ||
      lower.includes("employeur") ||
      lower.includes("collègue") ||
      lower.includes("client")
    ) {
      return "work";
    }
    if (
      lower.includes("marchand") ||
      lower.includes("taxe") ||
      lower.includes("contrat") ||
      lower.includes("banquier") ||
      lower.includes("prix") ||
      lower.includes("port")
    ) {
      return "trade";
    }
    if (
      lower.includes("évêque") ||
      lower.includes("abbaye") ||
      lower.includes("paroisse") ||
      lower.includes("procession") ||
      lower.includes("relique")
    ) {
      return "spiritual";
    }
    if (
      lower.includes("roi") ||
      lower.includes("noble") ||
      lower.includes("conseil") ||
      lower.includes("bailli") ||
      lower.includes("cour")
    ) {
      return "politics";
    }
    if (
      lower.includes("famille") ||
      lower.includes("héritage") ||
      lower.includes("cousin") ||
      lower.includes("serment")
    ) {
      return "family";
    }
    if (
      lower.includes("contrebandier") ||
      lower.includes("complot") ||
      lower.includes("fouille") ||
      lower.includes("rapport disciplinaire")
    ) {
      return "crime";
    }
    return fallbackTheme;
  }

  function biasForTheme(theme, index) {
    const byTheme = {
      school: "learning",
      work: "reputation",
      trade: "money",
      family: "family",
      romance: "family",
      prison: "crime",
      crime: "crime",
      spiritual: "spiritual",
      politics: "politics",
      health: "health",
      city: "reputation",
      senior: "reputation"
    };
    return byTheme[theme] || EVENT_BIASES[index % EVENT_BIASES.length];
  }

  function buildThemedMassChoices(c, theme, bias, index, text) {
    const lower = text.toLowerCase();
    const makeChoice = (label, approach, extra) => ({
      label,
      run: () => {
        applyMassEventOutcome(c, bias, approach);
        if (typeof extra === "function") {
          extra();
        }
      }
    });

    const choose = (list, shift = 0) => list[(index + shift) % list.length];
    const wantsFourth = index % 2 === 0;

    const choiceBanks = {
      school: {
        safe: [
          "Réviser chaque détail avant d'agir",
          "Demander un conseil au professeur",
          "Travailler discrètement après les cours",
          "Préparer un exposé irréprochable"
        ],
        balanced: [
          "Former une alliance avec un camarade fiable",
          "Négocier un délai avec l'encadrement",
          "Proposer une solution de compromis",
          "Soutirer des infos sans te compromettre"
        ],
        risky: [
          "Tenter un bluff devant toute la classe",
          "Voler un avantage à un rival",
          "Forcer la chance dans une épreuve",
          "Lancer une manœuvre audacieuse"
        ],
        fourth: [
          "Sécher et improviser au dernier moment",
          "Transformer ça en défi public",
          "Faire porter la faute à un autre élève",
          "Contourner les règles de l'école"
        ]
      },
      work: {
        safe: [
          "Accepter la tâche en respectant la méthode",
          "Suivre le protocole de l'atelier",
          "Livrer un travail propre sans bruit",
          "Demander une validation officielle"
        ],
        balanced: [
          "Renégocier les conditions de la mission",
          "Passer par un réseau de contacts",
          "Partager le risque avec un collègue",
          "Négocier un bonus contre résultat"
        ],
        risky: [
          "Saboter discrètement un concurrent",
          "Contourner les règles de guilde",
          "Signer un accord opaque",
          "Promettre l'impossible pour briller"
        ],
        fourth: [
          "Refiler la partie sale à un apprenti",
          "Exiger un engagement écrit immédiat",
          "Parier ta réputation sur ce coup",
          "Monter un coup de pression au client"
        ]
      },
      trade: {
        safe: [
          "Sécuriser un contrat clair et mesuré",
          "Vérifier les comptes ligne par ligne",
          "Avancer petit à petit sur le marché",
          "Refuser les clauses ambiguës"
        ],
        balanced: [
          "Négocier ferme sans rompre l'accord",
          "Monter une association temporaire",
          "Tester le marché avec une mise modérée",
          "Jouer les intermédiaires rémunérés"
        ],
        risky: [
          "Spéculer massivement sur la rumeur",
          "Cacher une partie des recettes",
          "Acheter en masse avant la hausse",
          "Forcer une opération limite légale"
        ],
        fourth: [
          "Corrompre un contrôleur des taxes",
          "Faire circuler une fausse information",
          "Monter une caisse noire provisoire",
          "Vendre avant que la garde n'arrive"
        ]
      },
      family: {
        safe: [
          "Ouvrir une discussion calme avec les proches",
          "Chercher un compromis familial",
          "Prendre du recul avant de répondre",
          "Rassurer chacun sans accuser"
        ],
        balanced: [
          "Offrir un geste concret pour apaiser",
          "Poser des limites claires mais justes",
          "Demander une médiation d'un proche",
          "Négocier une trêve temporaire"
        ],
        risky: [
          "Imposer ta décision sans débat",
          "Raviver un vieux reproche",
          "Menacer de couper les liens",
          "Faire éclater la vérité brutalement"
        ],
        fourth: [
          "Partir quelques jours sans prévenir",
          "Mettre tout le monde devant le fait accompli",
          "Confier le conflit à la belle-famille",
          "Rompre temporairement les contacts"
        ]
      },
      romance: {
        safe: [
          "Parler avec franchise dès maintenant",
          "Écouter avant de répondre",
          "Montrer ta loyauté par des actes",
          "Poser une discussion intime et honnête"
        ],
        balanced: [
          "Faire un geste romantique mesuré",
          "Négocier un compromis de couple",
          "Temporiser sans fuir le sujet",
          "Demander du temps pour clarifier"
        ],
        risky: [
          "Mentir pour éviter la crise",
          "Jouer la jalousie pour reprendre l'avantage",
          "Tester les limites du couple",
          "Balancer une vérité blessante"
        ],
        fourth: [
          "Prendre de la distance quelques jours",
          "Faire intervenir un proche dans la dispute",
          "Annuler tous vos plans communs",
          "Lancer un ultimatum émotionnel"
        ]
      },
      prison: {
        safe: [
          "Rester invisible dans le bloc",
          "Respecter strictement les règles internes",
          "Éviter les clans pour survivre",
          "Garder profil bas avec les gardiens"
        ],
        balanced: [
          "Négocier une protection discrète",
          "Échanger des services mesurés",
          "Obtenir des infos sans t'exposer",
          "Tisser une alliance de circonstance"
        ],
        risky: [
          "Participer au plan d'évasion",
          "Prendre parti dans la guerre des cellules",
          "Corrompre un gardien influent",
          "Provoquer un rival en public"
        ],
        fourth: [
          "Dénoncer un meneur à la direction",
          "Voler des ressources d'un autre bloc",
          "Forcer un passage interdit",
          "Parier gros sur un coup unique"
        ]
      },
      crime: {
        safe: [
          "Refuser l'affaire et couper court",
          "Signaler discrètement l'approche suspecte",
          "Te tenir loin de ce réseau",
          "Jouer l'ignorance totale"
        ],
        balanced: [
          "Aider sans laisser de traces directes",
          "Négocier une petite part du coup",
          "Servir d'intermédiaire temporaire",
          "Observer avant de t'engager"
        ],
        risky: [
          "Entrer à fond dans l'opération",
          "Doubler tes partenaires au dernier moment",
          "Monter un coup parallèle",
          "Tenter un acte criminel spectaculaire"
        ],
        fourth: [
          "Piéger un complice pour t'en sortir",
          "Racketter un acteur déjà impliqué",
          "Déclencher une diversion violente",
          "Brûler les preuves après le coup"
        ]
      },
      spiritual: {
        safe: [
          "Chercher conseil auprès d'un religieux respecté",
          "Prendre un temps de retraite et prière",
          "Suivre une voie de réconciliation",
          "Choisir l'humilité et la retenue"
        ],
        balanced: [
          "Faire un don mesuré à la communauté",
          "Négocier une médiation morale",
          "Soutenir le rite sans trop t'exposer",
          "Gagner du temps en restant diplomate"
        ],
        risky: [
          "Instrumentaliser le conflit à ton profit",
          "Défier l'autorité spirituelle locale",
          "Soutenir publiquement une position polémique",
          "Exploiter la ferveur populaire"
        ],
        fourth: [
          "Ignorer totalement l'affaire sacrée",
          "Acheter des soutiens religieux en coulisses",
          "Propager une lecture controversée",
          "Rompre avec la ligne officielle"
        ]
      },
      politics: {
        safe: [
          "Respecter le protocole et les formes",
          "Chercher un arbitrage officiel",
          "T'appuyer sur des témoins fiables",
          "Construire une position crédible"
        ],
        balanced: [
          "Négocier en coulisses avec prudence",
          "Former un bloc d'alliés temporaires",
          "Échanger des faveurs encadrées",
          "Tester un compromis avantageux"
        ],
        risky: [
          "Manipuler l'opinion par la rumeur",
          "Attaquer frontalement un rival puissant",
          "Forcer une décision publique",
          "Monter une manœuvre de déstabilisation"
        ],
        fourth: [
          "Rester neutre publiquement mais agir derrière",
          "Sacrifier un allié pour sauver ta place",
          "Acheter un vote décisif",
          "Déclencher une crise calculée"
        ]
      },
      city: {
        safe: [
          "Calmer la situation au plus vite",
          "Demander un avis officiel avant d'agir",
          "Aider la communauté sans te montrer",
          "Suivre la version la plus stable"
        ],
        balanced: [
          "Tirer un avantage raisonnable du contexte",
          "Passer un accord local discret",
          "Négocier un échange de services",
          "Soutenir un camp sans t'afficher"
        ],
        risky: [
          "Jouer la foule pour imposer ta version",
          "Exploiter la panique pour t'enrichir",
          "Lancer une manœuvre coup de poing",
          "Pousser l'affaire jusqu'au scandale"
        ],
        fourth: [
          "Quitter les lieux et laisser faire",
          "Faire disparaître un indice gênant",
          "Monter un contre-récit agressif",
          "Prendre un risque total sur un pari"
        ]
      }
    };

    const bank = choiceBanks[theme] || choiceBanks.city;
    const choices = [
      makeChoice(choose(bank.safe), "safe"),
      makeChoice(choose(bank.balanced, 2), "balanced"),
      makeChoice(choose(bank.risky, 4), "risky")
    ];

    if (theme === "school") {
      choices[2] = makeChoice(choices[2].label, "risky", () => changeStat("reputation", -2));
    } else if (theme === "work") {
      choices[2] = makeChoice(choices[2].label, "risky", () => changeStat("reputation", -2));
    } else if (theme === "trade") {
      choices[2] = makeChoice(choices[2].label, "risky", () => changeStat("reputation", -2));
    } else if (theme === "family") {
      choices[1] = makeChoice(choices[1].label, "balanced", () => changeMoney(-rnd(1, 10)));
    } else if (theme === "romance") {
      choices[1] = makeChoice(choices[1].label, "balanced", () => changeMoney(-rnd(2, 12)));
    } else if (theme === "prison") {
      choices[1] = makeChoice(choices[1].label, "balanced", () => changeMoney(-rnd(2, 14)));
      choices[2] = makeChoice(choices[2].label, "risky");
    } else if (theme === "crime") {
      choices[2] = makeChoice(choices[2].label, "risky");
    } else if (theme === "spiritual") {
      choices[1] = makeChoice(choices[1].label, "balanced", () => changeMoney(-rnd(1, 9)));
    } else if (theme === "politics") {
      choices[2] = makeChoice(choices[2].label, "risky");
    }

    if (wantsFourth) {
      let fourthApproach = theme === "crime" || theme === "prison" ? "risky" : "balanced";
      let fourthExtra = null;
      if (theme === "family") fourthExtra = () => changeStat("sanity", -1);
      if (theme === "romance") fourthExtra = () => changeStat("happiness", -2);
      if (theme === "politics") fourthExtra = () => changeStat("reputation", -1);
      if (theme === "crime") fourthExtra = () => changeStat("sanity", -2);
      if (theme === "prison") fourthExtra = () => changeStat("reputation", -4);
      choices.push(makeChoice(choose(bank.fourth, 1), fourthApproach, fourthExtra));
    }

    if (lower.includes("taxe")) {
      choices[0] = makeChoice("Contester la taxe auprès du bailli", "safe");
      choices[1] = makeChoice("Négocier une remise avec des appuis", "balanced");
    }
    if (lower.includes("évasion")) {
      choices[2] = makeChoice("T'inscrire dans le plan d'évasion", "risky");
    }
    if (lower.includes("héritage")) {
      choices[0] = makeChoice("Demander une médiation familiale officielle", "safe");
      choices[1] = makeChoice("Négocier ta part directement", "balanced");
    }
    if (lower.includes("épidémie")) {
      choices[0] = makeChoice("Te mettre en retrait sanitaire", "safe");
      choices[1] = makeChoice("Aider les malades avec précaution", "balanced");
    }

    return choices;
  }

  function buildMassEvent(c, text, index, fallbackTheme) {
    const theme = inferMassEventTheme(text, fallbackTheme);
    const bias = biasForTheme(theme, index);
    return {
      text,
      choices: buildThemedMassChoices(c, theme, bias, index, text)
    };
  }

  function addMassEventsToPool(pool, c) {
    let idx = 0;
    const pushTextEvents = (texts, fallbackTheme) => {
      texts.forEach((text) => {
        pool.push(buildMassEvent(c, text, idx, fallbackTheme));
        idx += 1;
      });
    };

    if (c.age <= 10) pushTextEvents(textsFromBlueprint(MASS_AGE_EVENT_BLUEPRINTS.child), "school");
    else if (c.age <= 17) pushTextEvents(textsFromBlueprint(MASS_AGE_EVENT_BLUEPRINTS.teen), "school");
    else if (c.age <= 54) pushTextEvents(textsFromBlueprint(MASS_AGE_EVENT_BLUEPRINTS.adult), "politics");
    else pushTextEvents(textsFromBlueprint(MASS_AGE_EVENT_BLUEPRINTS.senior), "senior");

    const classTexts = MASS_CLASS_EVENT_TEXTS[c.socialClass] || [];
    const classThemeMap = {
      Paysannerie: "family",
      Artisanat: "work",
      "Bourgeoisie marchande": "trade",
      "Petite noblesse": "politics",
      "Haute noblesse": "politics",
      Clergé: "spiritual"
    };
    pushTextEvents(classTexts, classThemeMap[c.socialClass] || "city");
    if (c.job) pushTextEvents(MASS_CONTEXT_EVENT_TEXTS.job, "work");
    if (c.criminal.inPrison) pushTextEvents(MASS_CONTEXT_EVENT_TEXTS.prison, "prison");
    else pushTextEvents(MASS_CONTEXT_EVENT_TEXTS.city, "city");
    if (c.family.spouse?.alive) pushTextEvents(MASS_CONTEXT_EVENT_TEXTS.spouse, "romance");
  }

  function randomEventPool() {
    const c = game.character;
    const pool = [];
    if (c.age >= 6) {
      pool.push({
        text: "Ta mère t'invite au restaurant.",
        choices: [
          {
            label: "Accepter",
            run: () => {
              spend(rnd(2, 8));
              relationshipPulse(c.family.parents, 5);
              changeStat("happiness", 7);
            }
          },
          {
            label: "Refuser",
            run: () => {
              relationshipPulse(c.family.parents, -4);
              changeStat("happiness", -3);
            }
          },
          {
            label: "Passer",
            run: () => {
              changeStat("sanity", 1);
            }
          }
        ]
      });
    }
    if (c.age <= 4) {
      pool.push({
        text: "Tes parents hésitent sur la manière de t'éduquer.",
        choices: [
          {
            label: "Rester calme",
            run: () => {
              changeStat("sanity", 2);
              changeStat("happiness", 2);
            }
          },
          {
            label: "Faire une grosse crise",
            run: () => {
              changeStat("happiness", chance(0.5) ? 3 : -2);
              relationshipPulse(c.family.parents, -4);
            }
          },
          {
            label: "Chercher du réconfort",
            run: () => {
              relationshipPulse(c.family.parents, 4);
              changeStat("happiness", 4);
            }
          }
        ]
      });
    }

    if (c.age >= 5 && c.age < 12) {
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
            label: "Te défendre physiquement",
            run: () => {
              if (chance(0.45)) {
                changeStat("strength", 3);
                changeStat("reputation", 2);
              } else {
                addCondition("injuries", pick(INJURIES));
                changeStat("health", -6);
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

    if (c.age >= 12) {
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
            label: "T'expliquer publiquement",
            run: () => {
              if (chance(0.48)) {
                changeStat("reputation", 6);
              } else {
                changeStat("reputation", -5);
                c.notoriety = clamp(c.notoriety + 4, -100, 100);
              }
            }
          },
          {
            label: "Acheter le silence",
            run: () => {
              spend(rnd(4, 16));
              changeStat("reputation", rnd(1, 5));
            }
          }
        ]
      });
    }

    if (c.age >= 16) {
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

    if (c.family.spouse?.alive && c.age >= 16) {
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
    addMassEventsToPool(pool, c);
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
    c.age += 1;
    addLog(`Tu vieillis. Tu as maintenant ${c.age} ans.`, "neutral");
    processScheduledConsequences();

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
    autoSaveIfLinked();
    render();
  }

  function getActionsByCategory() {
    const c = game.character;
    const isPrison = c.criminal.inPrison;
    const canWork = c.age >= 14 && !isPrison;
    const actions = {
      Famille: [
        {
          label: "Jouer avec la famille",
          when: () => c.age <= 4,
          run: () => {
            if (!consumeAction()) return;
            relationshipPulse(c.family.parents, 5);
            changeStat("happiness", 5);
            addLog("Tu passes un moment rassurant avec tes proches.", "good");
          }
        },
        {
          label: "Passer du temps avec la famille",
          when: () => c.age >= 5,
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
          when: () => c.age >= 6,
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
          when: () => c.age >= 8,
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
          when: () => c.age >= 12,
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
          when: () => c.age >= 14 && c.money > 5,
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
          when: () => !!c.family.spouse && c.age >= 16,
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
          when: () => c.age >= 5 && (c.school.enrolled || c.educationLevel < 4),
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
          when: () => c.age >= 8 && c.school.enrolled && !c.school.expelled,
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
          when: () => c.age >= 7 && c.age < 20 && !c.criminal.inPrison,
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
          when: () => !!c.job && c.age >= 16 && !isPrison,
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
          when: () => !!c.job && c.age >= 16 && !isPrison,
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
          when: () => c.age >= 12 && !isPrison,
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
          when: () => c.age >= 10 && !isPrison,
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
          when: () => c.age >= 10,
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
          when: () => c.age >= 3,
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
          when: () => c.age >= 16,
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
          when: () => c.age >= 18,
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
          when: () => c.age >= 5 && !isPrison,
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
          when: () => c.age >= 10,
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
          when: () => !!c.family.spouse && c.age >= 14,
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
          when: () => c.age >= 18 && c.family.children.length > 0,
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
              addLog(`Le divorce impose une pension régulière de ${pension} pièces.`, "warn");
            }
            c.family.spouse = null;
            addLog("Le divorce est prononcé.", "bad");
          }
        }
      ],
      "Argent & biens": [
        {
          label: "Acheter une maison",
          when: () => c.age >= 18 && !isPrison,
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
          when: () => c.age >= 18 && c.properties.length > 0,
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
          when: () => c.age >= 14 && !isPrison,
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
          when: () => c.age >= 14 && !isPrison,
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
          when: () => c.age >= 12 && c.inventory.length > 0,
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
          when: () => c.age >= 16 && !isPrison,
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
          when: () => c.age >= 16 && getTotalDebt() > 0 && c.money > 0,
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
          when: () => c.age >= 16,
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
          when: () => c.age >= 14 && !isPrison,
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
          when: () => c.age >= 6 && !isPrison,
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
          when: () => c.age >= 12 && !isPrison,
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
          when: () => c.age >= 12 && !isPrison,
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
          when: () => c.age >= 10 && !isPrison,
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
          when: () => c.age >= 12 && !isPrison,
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
          when: () => c.age >= 12,
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
    addLog(`Décision: ${option.label}.`, "neutral");
    game.pendingEvent = null;
    mortalityCheck();
    autoSaveIfLinked();
    render();
  }

  function snapshotCharacter() {
    const c = game.character;
    return {
      money: c.money,
      debt: getTotalDebt(),
      notoriety: c.notoriety,
      record: c.criminal.record,
      stats: { ...c.stats },
      logLen: game.log.length
    };
  }

  function scheduleConsequence(inYears, payload) {
    const c = game.character;
    if (!c.alive) return null;
    const item = {
      triggerAge: c.age + inYears,
      text: payload.text,
      tone: payload.tone || "neutral",
      rarity: rarityOf(payload),
      run: payload.run || (() => {})
    };
    game.scheduledConsequences.push(item);
    return item;
  }

  function startStoryline(categoryName, actionLabel, storyline) {
    const c = game.character;
    const rarity = rarityOf(storyline);
    if (storyline.startRun) {
      storyline.startRun(c, actionLabel);
    }
    (storyline.steps || []).forEach((step) => {
      const inYears = step.inYears || rnd(2, 3);
      scheduleConsequence(inYears, {
        text: `${storyline.title} — ${step.text}`,
        tone: step.tone || "neutral",
        rarity,
        run: step.run
      });
    });
    addLog(`Événement [${rarityLabel(rarity)}] : ${storyline.startText}`, storyline.startTone || "neutral");
    return {
      text: storyline.startText,
      rarity
    };
  }

  function scheduleDelayedConsequence(categoryName, rarityHint = "common") {
    const c = game.character;
    const pool = (DELAYED_CONSEQUENCE_LIBRARY[categoryName] || []).filter((entry) =>
      isEventEligible(entry, c)
    );
    if (!pool.length || !chance(0.45)) {
      return null;
    }
    const delayed = pick(pool);
    const scheduled = scheduleConsequence(rnd(2, 3), {
      ...delayed,
      rarity: delayed.rarity || rarityHint
    });
    return scheduled;
  }

  function processScheduledConsequences() {
    const c = game.character;
    if (!game.scheduledConsequences.length) return;
    const due = [];
    const future = [];
    game.scheduledConsequences.forEach((item) => {
      if (item.triggerAge <= c.age) {
        due.push(item);
      } else {
        future.push(item);
      }
    });
    game.scheduledConsequences = future;
    due.forEach((item) => {
      if (!c.alive) return;
      if (typeof item.run === "function") {
        item.run(c);
      } else {
        // Fallback when loading a saved deferred event without executable payload.
        if (item.tone === "good") {
          changeStat("happiness", 2);
        } else if (item.tone === "bad") {
          changeStat("happiness", -2);
        }
      }
      addLog(`Conséquence différée [${rarityLabel(item.rarity)}] : ${item.text}`, item.tone || "neutral");
    });
  }

  function triggerActionFollowUp(categoryName, actionLabel) {
    const c = game.character;
    const storyPool = (STORYLINE_EVENTS[categoryName] || []).filter((entry) => isEventEligible(entry, c));
    if (storyPool.length && chance(0.2)) {
      const storyline = weightedPickByRarity(storyPool);
      return startStoryline(categoryName, actionLabel, storyline);
    }

    const pool = (ACTION_FOLLOWUP_EVENTS[categoryName] || []).filter((entry) => isEventEligible(entry, c));
    if (!pool.length || !chance(0.75)) {
      return null;
    }
    const event = weightedPickByRarity(pool);
    const rarity = rarityOf(event);
    event.run(c, actionLabel);
    addLog(`Conséquence [${rarityLabel(rarity)}] : ${event.text}`, event.tone || "neutral");
    scheduleDelayedConsequence(categoryName, rarity);
    return {
      text: event.text,
      rarity
    };
  }

  function buildActionResult(actionLabel, before, followUp = null) {
    const c = game.character;
    const statNames = {
      health: "Santé",
      happiness: "Bonheur",
      intelligence: "Intelligence",
      looks: "Apparence",
      strength: "Force",
      sanity: "Mental",
      reputation: "Réputation"
    };
    const details = [];
    Object.entries(statNames).forEach(([key, label]) => {
      const diff = c.stats[key] - before.stats[key];
      if (diff !== 0) {
        details.push(`${label}: ${diff > 0 ? "+" : ""}${diff}`);
      }
    });
    const moneyDiff = Math.round((c.money - before.money) * 100) / 100;
    if (moneyDiff !== 0) {
      details.push(`Argent: ${moneyDiff > 0 ? "+" : ""}${Math.round(moneyDiff)}`);
    }
    const debtDiff = Math.round((getTotalDebt() - before.debt) * 100) / 100;
    if (debtDiff !== 0) {
      details.push(`Dettes: ${debtDiff > 0 ? "+" : ""}${Math.round(debtDiff)}`);
    }
    if (c.criminal.record !== before.record) {
      const diff = c.criminal.record - before.record;
      details.push(`Casier: ${diff > 0 ? "+" : ""}${diff}`);
    }
    if (c.notoriety !== before.notoriety) {
      const diff = c.notoriety - before.notoriety;
      details.push(`Notoriété: ${diff > 0 ? "+" : ""}${Math.round(diff)}`);
    }
    const newLogCount = Math.max(0, game.log.length - before.logLen);
    const recentLogs = newLogCount ? game.log.slice(0, Math.min(3, newLogCount)).map((entry) => entry.text) : [];
    recentLogs.forEach((line) => details.push(line));
    if (!details.length) {
      details.push("Aucun changement notable.");
    }
    const rarity = followUp?.rarity || null;
    const rarityTag = rarity ? ` [${rarityLabel(rarity)}]` : "";
    const eventName = followUp?.text || actionLabel;
    return {
      title: `Événement${rarityTag}`,
      text: eventName,
      details,
      rarity
    };
  }

  function executeActionWithFeedback(categoryName, action) {
    const before = snapshotCharacter();
    action.run();
    if (!game.character.alive) {
      actionResultState = null;
      render();
      return;
    }
    const followUp = triggerActionFollowUp(categoryName, action.label);
    actionResultState = buildActionResult(action.label, before, followUp);
    autoSaveIfLinked();
    render();
  }

  function renderStatus() {
    const c = game.character;
    const energy = clamp(Math.round((c.stats.strength * 0.55 + c.stats.sanity * 0.45)));
    const status = [
      { label: "Santé", icon: "❤️", value: c.stats.health },
      { label: "Bonheur", icon: "😊", value: c.stats.happiness },
      { label: "Intelligence", icon: "🧠", value: c.stats.intelligence },
      { label: "Apparence", icon: "👤", value: c.stats.looks },
      { label: "Énergie", icon: "⚡", value: energy }
    ];
    ui.statusStrip.innerHTML = "";
    status.forEach((entry) => {
      const div = document.createElement("div");
      div.className = "status-item";
      const displayValue = entry.text || `${entry.value}%`;
      const hue = Math.round((entry.value / 100) * 120);
      div.innerHTML = `
        <div class="status-label">
          <span>${entry.icon} ${entry.label}</span>
          <span>${displayValue}</span>
        </div>
        <div class="status-track">
          <div class="status-fill" style="width:${Math.max(
            2,
            entry.value
          )}%; background:hsl(${hue}, 77%, 44%);"></div>
        </div>
      `;
      ui.statusStrip.append(div);
    });
  }

  function getLifeStage(age) {
    if (age <= 2) return "Infant";
    if (age <= 12) return "Enfant";
    if (age <= 17) return "Adolescent";
    if (age <= 59) return "Adulte";
    return "Senior";
  }

  function agedHairColor(baseColor, age) {
    if (age >= 70) return "#d4d0c8";
    if (age >= 58) return "#b8b4ab";
    if (age >= 46) return "#8f8b85";
    return baseColor;
  }

  function buildAvatarSvg(c, avatar, size = 72) {
    const skin = optionColor(AVATAR_SKINS, avatar.skin) || "#d9ad7f";
    const hairBase = optionColor(AVATAR_HAIR_COLORS, avatar.hairColor) || "#5d3a22";
    const hair = agedHairColor(hairBase, c.age);
    const eye = optionColor(AVATAR_EYE_COLORS, avatar.eyeColor) || "#4a2e1f";
    const outfit = optionColor(AVATAR_OUTFITS, avatar.outfit) || "#5f7d3a";
    const stage = getLifeStage(c.age);
    const showBeard = c.age >= 18 && c.sex === "Homme" && avatar.beard !== "aucune";
    const wrinkles = c.age >= 58;

    const hairShape =
      avatar.hairStyle === "long"
        ? `<path d="M20 34 C22 16, 78 16, 80 34 L80 54 C76 50,72 48,68 49 L68 34 Z" fill="${hair}" />`
        : avatar.hairStyle === "boucle"
          ? `<circle cx="36" cy="27" r="9" fill="${hair}" /><circle cx="50" cy="23" r="11" fill="${hair}" /><circle cx="64" cy="27" r="9" fill="${hair}" />`
          : avatar.hairStyle === "tonsure"
            ? `<path d="M24 34 C28 18,72 18,76 34 C70 28,30 28,24 34 Z" fill="${hair}" />`
            : `<path d="M22 35 C26 18,74 18,78 35 C72 30,28 30,22 35 Z" fill="${hair}" />`;

    const beardShape =
      avatar.beard === "longue"
        ? `<path d="M39 56 C41 68,59 68,61 56 L63 72 C53 80,47 80,37 72 Z" fill="${hair}" />`
        : `<path d="M38 56 C42 63,58 63,62 56 L60 62 C52 66,48 66,40 62 Z" fill="${hair}" />`;

    const accessory =
      avatar.accessory === "couronne"
        ? `<path d="M28 20 L36 28 L50 18 L64 28 L72 20 L72 30 L28 30 Z" fill="#c9a34f" stroke="#8b6a2b" stroke-width="1.5" />`
        : avatar.accessory === "capuche"
          ? `<path d="M22 34 C24 12,76 12,78 34 L70 34 C68 22,32 22,30 34 Z" fill="#5a4430" />`
          : avatar.accessory === "bandeau"
            ? `<rect x="28" y="30" width="44" height="6" rx="3" fill="#7a3431" />`
            : avatar.accessory === "chapeau"
              ? `<ellipse cx="50" cy="21" rx="22" ry="6" fill="#4b3320" /><rect x="36" y="9" width="28" height="12" rx="4" fill="#5c4129" />`
              : "";

    const childCheeks = stage === "Infant" || stage === "Enfant" ? `<circle cx="37" cy="49" r="2.4" fill="#e9b09e" /><circle cx="63" cy="49" r="2.4" fill="#e9b09e" />` : "";
    const wrinkleLines = wrinkles ? `<path d="M40 46 Q50 42 60 46 M40 53 Q50 49 60 53" stroke="#816852" stroke-width="1.1" fill="none" stroke-linecap="round" />` : "";

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
        <rect width="100" height="100" rx="50" fill="#dbc7a1" />
        <path d="M24 94 L76 94 L70 66 L30 66 Z" fill="${outfit}" />
        <rect x="44" y="60" width="12" height="10" rx="4" fill="${skin}" />
        <circle cx="50" cy="44" r="${stage === "Infant" ? 21 : 20}" fill="${skin}" />
        ${hairShape}
        ${accessory}
        <circle cx="42" cy="45" r="2.9" fill="${eye}" />
        <circle cx="58" cy="45" r="2.9" fill="${eye}" />
        <path d="M43 55 Q50 59 57 55" stroke="#6e4f35" stroke-width="1.8" fill="none" stroke-linecap="round" />
        ${showBeard ? beardShape : ""}
        ${childCheeks}
        ${wrinkleLines}
      </svg>
    `;
  }

  function renderAvatar(container, c, avatar, size = 72) {
    if (!container) return;
    const svg = buildAvatarSvg(c, avatar, size);
    const src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
    container.innerHTML = `<img src="${src}" alt="Avatar médiéval" />`;
  }

  function renderTopProfile() {
    const c = game.character;
    c.avatar = normalizedAvatarConfig(c.sex, c.avatar);
    const stage = getLifeStage(c.age);
    renderAvatar(ui.profileAvatar, c, c.avatar, 72);
    ui.profileName.textContent = c.fullName;
    ui.profileStage.textContent = stage;
    ui.profileMoney.textContent = `$${Math.round(c.money)}`;
  }

  function renderDetailMenu() {
    const c = game.character;
    const items = [
      {
        icon: "👪",
        title: "Famille",
        detail: `${aliveChildren().length} enfant(s), conjoint: ${c.family.spouse ? "oui" : "non"}`
      },
      {
        icon: "⚒️",
        title: "Travail",
        detail: `${c.job || "Aucun"} · salaire ${Math.round(c.salary)}`
      },
      {
        icon: "🏠",
        title: "Maison",
        detail: `${c.properties.length} propriété(s), ${c.vehicles.length} monture(s)`
      },
      {
        icon: "🎯",
        title: "Activité",
        detail: c.criminal.inPrison ? "En prison" : "Libre de choisir une activité"
      }
    ];
    ui.detailMenu.innerHTML = "";
    items.forEach((entry) => {
      const li = document.createElement("li");
      li.className = "detail-item";
      li.innerHTML = `
        <span class="detail-icon">${entry.icon}</span>
        <div>
          <p class="detail-title">${entry.title}</p>
          <p class="detail-sub">${entry.detail}</p>
        </div>
      `;
      ui.detailMenu.append(li);
    });
  }

  function renderResources() {
    const c = game.character;
    const lines = [
      `Emploi: ${c.job || "Aucun"}`,
      `Salaire: ${c.salary || 0}`,
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

  function personInteractionOptions(scope) {
    if (scope === "teacher") {
      return [
        { action: "ask_teacher", label: "Demander aide" },
        { action: "challenge_teacher", label: "Contester cours" },
        { action: "gift_teacher", label: "Offrir un présent" }
      ];
    }
    if (scope === "classmate") {
      return [
        { action: "study_together", label: "Étudier ensemble" },
        { action: "chat", label: "Discuter" },
        { action: "bully", label: "Provoquer" }
      ];
    }
    if (scope === "child") {
      return [
        { action: "chat", label: "Parler" },
        { action: "gift", label: "Cadeau" },
        { action: "scold", label: "Gronder" }
      ];
    }
    if (scope === "spouse") {
      return [
        { action: "chat", label: "Discuter" },
        { action: "gift", label: "Cadeau" },
        { action: "flirt", label: "Flirter" }
      ];
    }
    return [
      { action: "chat", label: "Parler" },
      { action: "gift", label: "Cadeau" },
      { action: "insult", label: "Insulter" }
    ];
  }

  function makePersonCard(person, scope, titlePrefix = "") {
    const card = document.createElement("article");
    card.className = "person-card";

    const title = document.createElement("p");
    title.className = "person-name";
    title.textContent = `${titlePrefix}${person.name}`;

    const meta = document.createElement("p");
    meta.className = "person-meta";
    const relation = Math.round(relationValue(person));
    meta.textContent = `${person.role || "Relation"} · ${person.age} ans · Lien ${relation}/100`;

    const actions = document.createElement("div");
    actions.className = "person-actions";
    personInteractionOptions(scope).forEach((entry) => {
      const btn = document.createElement("button");
      btn.className = "person-btn";
      btn.textContent = entry.label;
      btn.dataset.personAction = entry.action;
      btn.dataset.personId = person.id;
      btn.dataset.personScope = scope;
      btn.disabled = !game.character.alive;
      actions.append(btn);
    });

    card.append(title, meta, actions);
    return card;
  }

  function findPersonByScope(scope, personId) {
    const c = game.character;
    if (!personId) return null;
    if (scope === "parent") return c.family.parents.find((person) => person.id === personId && person.alive) || null;
    if (scope === "sibling") return c.family.siblings.find((person) => person.id === personId && person.alive) || null;
    if (scope === "inlaw") return c.family.inlaws.find((person) => person.id === personId && person.alive) || null;
    if (scope === "friend") return c.social.friends.find((person) => person.id === personId && person.alive) || null;
    if (scope === "enemy") return c.social.enemies.find((person) => person.id === personId && person.alive) || null;
    if (scope === "neighbor") return c.social.neighbors.find((person) => person.id === personId && person.alive) || null;
    if (scope === "colleague") return c.social.colleagues.find((person) => person.id === personId && person.alive) || null;
    if (scope === "classmate") return c.school.classmates.find((person) => person.id === personId && person.alive) || null;
    if (scope === "child") return c.family.children.find((person) => person.id === personId && person.alive) || null;
    if (scope === "spouse") {
      return c.family.spouse?.alive && c.family.spouse.id === personId ? c.family.spouse : null;
    }
    if (scope === "teacher") {
      return c.school.teacher?.alive && c.school.teacher.id === personId ? c.school.teacher : null;
    }
    return null;
  }

  function applyPersonInteraction(scope, person, action) {
    const c = game.character;
    if (!consumeAction()) return;

    const current = relationValue(person);
    if (action === "chat") {
      setRelationValue(person, current + rnd(3, 7));
      changeStat("happiness", 2);
      addLog(`Tu échanges avec ${person.name}.`, "good");
    } else if (action === "gift") {
      spend(rnd(2, 12));
      setRelationValue(person, current + rnd(5, 10));
      changeStat("reputation", 1);
      addLog(`Tu offres un présent à ${person.name}.`, "good");
    } else if (action === "insult") {
      setRelationValue(person, current - rnd(8, 15));
      changeStat("reputation", -3);
      changeStat("happiness", chance(0.4) ? 1 : -3);
      addLog(`Tu blesses ${person.name} avec tes mots.`, "bad");
    } else if (action === "scold") {
      setRelationValue(person, current - rnd(4, 9));
      changeStat("sanity", -1);
      addLog(`Tu grondes ${person.name}.`, "warn");
    } else if (action === "flirt") {
      if (chance(0.62)) {
        setRelationValue(person, current + rnd(6, 12));
        changeStat("happiness", 4);
        addLog(`Le moment avec ${person.name} rapproche votre couple.`, "good");
      } else {
        setRelationValue(person, current - rnd(4, 10));
        changeStat("happiness", -3);
        addLog(`Ta tentative de charme avec ${person.name} tombe à plat.`, "warn");
      }
    } else if (action === "ask_teacher") {
      setRelationValue(person, current + rnd(4, 9));
      c.school.grade = clamp(c.school.grade + rnd(2, 6));
      changeStat("intelligence", rnd(1, 4));
      addLog(`Ton professeur ${person.name} t'accorde du temps.`, "good");
    } else if (action === "challenge_teacher") {
      if (chance(0.45 + c.stats.intelligence / 320)) {
        setRelationValue(person, current - rnd(1, 6));
        c.school.grade = clamp(c.school.grade + rnd(1, 5));
        changeStat("reputation", 2);
        addLog(`Ton débat avec ${person.name} impressionne la classe.`, "good");
      } else {
        setRelationValue(person, current - rnd(6, 12));
        c.school.grade = clamp(c.school.grade - rnd(2, 7));
        changeStat("reputation", -2);
        addLog(`${person.name} te recadre sévèrement en cours.`, "warn");
      }
    } else if (action === "gift_teacher") {
      spend(rnd(3, 10));
      setRelationValue(person, current + rnd(3, 8));
      c.school.grade = clamp(c.school.grade + rnd(1, 3));
      addLog(`Tu offres un petit présent à ${person.name}.`, "neutral");
    } else if (action === "study_together") {
      setRelationValue(person, current + rnd(4, 9));
      c.school.grade = clamp(c.school.grade + rnd(1, 5));
      changeStat("intelligence", rnd(1, 3));
      addLog(`Tu révises avec ${person.name} après la classe.`, "good");
    } else if (action === "bully") {
      if (chance(0.45)) {
        setRelationValue(person, current - rnd(8, 16));
        changeStat("reputation", -4);
        changeStat("happiness", 1);
        addLog(`Tu provoques ${person.name} et la tension grimpe.`, "warn");
      } else {
        setRelationValue(person, current - rnd(6, 12));
        addCondition("injuries", pick(INJURIES));
        changeStat("health", -5);
        addLog(`Ta provocation contre ${person.name} finit en blessure.`, "bad");
      }
    }

    if (scope === "enemy" && action === "chat" && chance(0.3)) {
      const before = relationValue(person);
      setRelationValue(person, before + 8);
      addLog(`Le ton baisse: ${person.name} devient moins hostile.`, "good");
    }

    ensureSchoolNetwork(c);
    autoSaveIfLinked();
    render();
  }

  function renderSchoolPeople(target = ui.schoolPeopleRoot) {
    const c = game.character;
    if (!target) return;
    target.innerHTML = "";

    if (!c.school.enrolled || c.school.expelled || c.age < 5 || c.age >= 18) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "Pas de classe active pour le moment.";
      target.append(empty);
      return;
    }

    ensureSchoolNetwork(c);
    if (c.school.teacher?.alive) {
      target.append(makePersonCard(c.school.teacher, "teacher", "Professeur · "));
    }
    const aliveStudents = c.school.classmates.filter((student) => student.alive);
    if (!aliveStudents.length) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "Aucun élève disponible aujourd'hui.";
      target.append(empty);
      return;
    }
    aliveStudents.slice(0, 8).forEach((student) => {
      target.append(makePersonCard(student, "classmate", "Élève · "));
    });
  }

  function renderProfessionPanel() {
    const c = game.character;
    if (!ui.professionSummaryList) return;
    const lines = [
      `École: ${
        c.school.expelled
          ? "Renvoyé(e)"
          : c.school.enrolled
            ? `Inscrit(e) · note ${Math.round(c.school.grade)}/100`
            : "Non inscrit(e)"
      }`,
      `Études: ${EDU_LEVELS[c.educationLevel]}`,
      `Travail: ${c.job || "Aucun"}${c.job ? ` · salaire ${Math.round(c.salary)}` : ""}`,
      `Rang de carrière: ${c.careerLevel} · Dette universitaire: ${Math.round(c.universityDebt)}`,
      `Militaire: ${c.military.branch || "Aucune branche"}${c.military.branch ? ` · rang ${c.military.rank}` : ""}`
    ];
    ui.professionSummaryList.innerHTML = "";
    lines.forEach((line) => {
      const li = document.createElement("li");
      li.textContent = line;
      ui.professionSummaryList.append(li);
    });
  }

  function handleMilitaryAction(branch, action) {
    const c = game.character;
    if (!consumeAction()) return;
    if (action === "join") {
      if (c.age < 16) {
        addLog("Tu es trop jeune pour t'engager.", "warn");
        render();
        return;
      }
      if (c.criminal.inPrison) {
        addLog("Impossible de s'engager depuis la prison.", "bad");
        render();
        return;
      }
      if (c.military.branch && c.military.branch !== branch && chance(0.45)) {
        addLog(`Transfert refusé: ${c.military.branch} bloque ton départ.`, "warn");
        render();
        return;
      }
      c.military.branch = branch;
      c.military.rank = Math.max(1, c.military.rank || 1);
      c.job = `${branch} (${c.socialClass})`;
      c.salary = Math.max(c.salary, rnd(22, 34));
      ensureColleagues(c);
      changeStat("reputation", 4);
      changeStat("strength", 3);
      addLog(`Tu rejoins la branche ${branch}.`, "good");
    } else if (action === "train") {
      if (c.military.branch !== branch) {
        addLog(`Tu dois d'abord rejoindre ${branch}.`, "warn");
        render();
        return;
      }
      changeStat("strength", rnd(2, 6));
      changeStat("health", chance(0.2) ? -3 : 2);
      if (chance(0.16)) {
        addCondition("injuries", pick(INJURIES));
        addLog(`Entraînement rude en ${branch}: tu te blesses.`, "warn");
      } else {
        addLog(`Séance d'entraînement réussie en ${branch}.`, "good");
      }
    } else if (action === "mission") {
      if (c.military.branch !== branch) {
        addLog(`Aucune mission disponible sans engagement en ${branch}.`, "warn");
        render();
        return;
      }
      if (chance(0.58 + c.stats.strength / 350)) {
        const gain = rnd(8, 34);
        changeMoney(gain);
        c.military.rank = clamp(c.military.rank + (chance(0.4) ? 1 : 0), 0, 10);
        changeStat("reputation", rnd(2, 7));
        addLog(`Mission réussie pour ${branch} (+${gain} pièces).`, "good");
      } else {
        changeStat("health", -rnd(4, 10));
        if (chance(0.12)) {
          kill(`mort en mission (${branch})`);
          return;
        }
        addCondition("injuries", pick(INJURIES));
        addLog(`Mission difficile en ${branch}: tu rentres blessé(e).`, "bad");
      }
    }
    autoSaveIfLinked();
    render();
  }

  function renderMilitaryBranches(target = ui.professionMilitaryRoot) {
    if (!target) return;
    const branches = [
      { icon: "🛡️", name: "Infanterie seigneuriale" },
      { icon: "🏹", name: "Compagnies d'archers" },
      { icon: "🐎", name: "Cavalerie lourde" },
      { icon: "🏰", name: "Garde du château" },
      { icon: "⚓", name: "Marine royale" }
    ];
    target.innerHTML = "";
    branches.forEach((entry) => {
      const details = document.createElement("details");
      details.className = "nav-subsection";
      const summary = document.createElement("summary");
      summary.innerHTML = `<span class="nav-title">${entry.icon} ${entry.name}</span><span class="nav-arrow">›</span>`;
      const actions = document.createElement("div");
      actions.className = "action-buttons";

      const buttons = [
        { label: "S'engager", action: "join" },
        { label: "S'entraîner", action: "train" },
        { label: "Partir en mission", action: "mission" }
      ];
      buttons.forEach((item) => {
        const btn = document.createElement("button");
        btn.className = "action-btn";
        btn.textContent = item.label;
        btn.disabled = !game.character.alive;
        btn.addEventListener("click", () => handleMilitaryAction(entry.name, item.action));
        actions.append(btn);
      });
      details.append(summary, actions);
      target.append(details);
    });
  }

  function renderProfessionColleagues(target = ui.professionColleaguesRoot) {
    if (!target) return;
    const c = game.character;
    ensureColleagues(c);
    target.innerHTML = "";
    if (!c.social.colleagues.length) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "Aucun collègue pour le moment.";
      target.append(empty);
      return;
    }
    c.social.colleagues.slice(0, 10).forEach((person) => {
      target.append(makePersonCard(person, "colleague"));
    });
  }

  function renderRelationPeople(target = ui.relationPeopleRoot) {
    const c = game.character;
    if (!target) return;
    target.innerHTML = "";

    const groups = [
      { scope: "parent", people: c.family.parents.filter((person) => person.alive) },
      { scope: "sibling", people: c.family.siblings.filter((person) => person.alive) },
      { scope: "spouse", people: c.family.spouse?.alive ? [c.family.spouse] : [] },
      { scope: "child", people: c.family.children.filter((person) => person.alive) },
      { scope: "inlaw", people: c.family.inlaws.filter((person) => person.alive) },
      { scope: "friend", people: c.social.friends.filter((person) => person.alive) },
      { scope: "enemy", people: c.social.enemies.filter((person) => person.alive) },
      { scope: "neighbor", people: c.social.neighbors.filter((person) => person.alive) },
      { scope: "colleague", people: c.social.colleagues.filter((person) => person.alive) }
    ];

    const flattened = groups.flatMap((entry) =>
      entry.people.map((person) => ({ scope: entry.scope, person }))
    );
    if (!flattened.length) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "Aucune relation détaillée à afficher pour le moment.";
      target.append(empty);
      return;
    }

    flattened.slice(0, 30).forEach(({ scope, person }) => {
      target.append(makePersonCard(person, scope));
    });
  }

  function renderRelations() {
    const c = game.character;
    const lines = relationSummaryLines(c);
    ui.relationsList.innerHTML = "";
    lines.forEach((line) => {
      const li = document.createElement("li");
      li.textContent = line;
      ui.relationsList.append(li);
    });
    renderRelationPeople();
  }

  function renderEvent() {
    const c = game.character;
    if (!c.alive) {
      ui.eventText.textContent = "Votre histoire est terminée.";
      ui.eventChoices.innerHTML = "";
      return;
    }

    if (!game.pendingEvent) {
      ui.eventText.textContent = "Aucun événement en attente. Utilise « Vieillir » pour continuer.";
      ui.eventChoices.innerHTML = "";
      return;
    }
    ui.eventText.textContent = game.pendingEvent.text;
    const classes = ["choice-accept", "choice-refuse", "choice-skip", "choice-refuse"];
    ui.eventChoices.innerHTML = "";
    game.pendingEvent.choices.slice(0, 4).forEach((choice, index) => {
      const btn = document.createElement("button");
      btn.className = `event-choice-btn ${classes[index] || "choice-skip"}`;
      btn.textContent = choice.label;
      btn.addEventListener("click", () => executeEventChoice(index));
      ui.eventChoices.append(btn);
    });
    if (game.pendingEvent.choices.length < 3) {
      const passBtn = document.createElement("button");
      passBtn.className = "event-choice-btn choice-skip";
      passBtn.textContent = "Passer";
      passBtn.addEventListener("click", () => {
        game.pendingEvent = null;
        addLog("Tu décides de passer cet événement.", "warn");
        render();
      });
      ui.eventChoices.append(passBtn);
    }
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

  function renderActionCategories(target, categoryEntries) {
    if (!target) return;
    const c = game.character;
    target.innerHTML = "";
    categoryEntries.forEach(([categoryName, actions]) => {
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
        btn.disabled = !c.alive;
        btn.addEventListener("click", () => {
          executeActionWithFeedback(categoryName, action);
        });
        buttons.append(btn);
      });
      target.append(details);
    });
  }

  function buildSubpageBlock(title) {
    const block = document.createElement("section");
    block.className = "subpage-block";
    const heading = document.createElement("h3");
    heading.className = "subpage-block-title";
    heading.textContent = title;
    const body = document.createElement("div");
    body.className = "subpage-block-body";
    block.append(heading, body);
    return { block, body };
  }

  function fillSimpleList(target, lines, emptyText) {
    const list = document.createElement("ul");
    list.className = "compact-list";
    const clean = (lines || []).filter(Boolean);
    if (!clean.length) {
      const li = document.createElement("li");
      li.textContent = emptyText;
      list.append(li);
      target.append(list);
      return;
    }
    clean.forEach((line) => {
      const li = document.createElement("li");
      li.textContent = line;
      list.append(li);
    });
    target.append(list);
  }

  function relationSummaryLines(c) {
    const aliveParents = c.family.parents.filter((p) => p.alive);
    const aliveSiblings = c.family.siblings.filter((s) => s.alive);
    return [
      `Parents vivants: ${aliveParents.length}`,
      `Frères/Sœurs vivants: ${aliveSiblings.length}`,
      `Conjoint(e): ${c.family.spouse?.name || "Aucun"}`,
      `Enfants vivants: ${aliveChildren().length}`,
      `Amis: ${c.social.friends.filter((f) => f.alive).length}`,
      `Ennemis: ${c.social.enemies.filter((f) => f.alive).length}`,
      `Voisins: ${c.social.neighbors.filter((f) => f.alive).length}`,
      `Collègues: ${c.social.colleagues.filter((f) => f.alive).length}`
    ];
  }

  function openSubpage(key, title) {
    if (!key) return;
    activeSubpage = { key, title: title || "Section" };
    render();
  }

  function closeSubpage() {
    if (!activeSubpage) return;
    activeSubpage = null;
    render();
  }

  function returnToJournal() {
    activeSubpage = null;
    activeTab = "home";
    previousTabBeforeSettings = "home";
    render();
  }

  function renderSubpage() {
    if (!ui.subpageScreen || !ui.subpageContent || !ui.subpageTitle) return;
    if (!activeSubpage) {
      ui.subpageScreen.classList.remove("show");
      ui.subpageScreen.setAttribute("aria-hidden", "true");
      ui.subpageContent.innerHTML = "";
      return;
    }

    const c = game.character;
    const categories = Object.entries(getActionsByCategory());
    const schoolEntries = categories.filter(([name]) => name === "École & carrière");
    const jobEntries = categories.filter(([name]) => name === "Argent & biens");
    const relationEntries = categories.filter(([name]) => name === "Famille" || name === "Relations & amour");
    const activityEntries = categories.filter(
      ([name]) =>
        name !== "Crime & prison" &&
        name !== "Famille" &&
        name !== "Relations & amour" &&
        name !== "École & carrière" &&
        name !== "Argent & biens"
    );
    const crimeEntries = categories.filter(([name]) => name === "Crime & prison");

    ui.subpageTitle.textContent = (activeSubpage.title || "Section").toUpperCase();
    ui.subpageContent.innerHTML = "";

    const section = (title) => {
      const block = buildSubpageBlock(title);
      ui.subpageContent.append(block.block);
      return block.body;
    };

    if (activeSubpage.key === "profession-education") {
      renderActionCategories(section("Cours & examens"), schoolEntries);
      renderSchoolPeople(section("Classe"));
    } else if (activeSubpage.key === "profession-jobs") {
      renderActionCategories(section("Tâches du métier"), jobEntries);
      renderProfessionColleagues(section("Collègues"));
    } else if (activeSubpage.key === "profession-military") {
      renderMilitaryBranches(section("Branches médiévales"));
    } else if (activeSubpage.key === "activity-civil") {
      renderActionCategories(section("Activités civiles"), activityEntries);
    } else if (activeSubpage.key === "activity-crime") {
      renderActionCategories(section("Crime & prison"), crimeEntries);
    } else if (activeSubpage.key === "assets-overview") {
      fillSimpleList(
        section("Vue d'ensemble"),
        [
          `Famille: ${aliveChildren().length} enfant(s), conjoint: ${c.family.spouse ? "oui" : "non"}`,
          `Travail: ${c.job || "Aucun"} · salaire ${Math.round(c.salary)}`,
          `Maison: ${c.properties.length} propriété(s), ${c.vehicles.length} monture(s)`,
          `Activité: ${c.criminal.inPrison ? "En prison" : "Libre de choisir une activité"}`
        ],
        "Aucune donnée."
      );
      fillSimpleList(
        section("Ressources"),
        [
          `Emploi: ${c.job || "Aucun"}`,
          `Salaire: ${c.salary || 0}`,
          `Niveau d'éducation: ${EDU_LEVELS[c.educationLevel]}`,
          `Dette universitaire: ${Math.round(c.universityDebt)}`,
          `Notoriété criminelle: ${Math.round(c.notoriety)}`,
          `Célébrité: ${Math.round(c.celebrity)}`,
          `Rang politique: ${c.politicalLevel}`,
          `Casier judiciaire: ${c.criminal.record}`
        ],
        "Aucune ressource."
      );
    } else if (activeSubpage.key === "assets-conditions") {
      fillSimpleList(
        section("Santé & état"),
        [
          ...c.conditions.illnesses.map((entry) => `Maladie: ${entry}`),
          ...c.conditions.injuries.map((entry) => `Blessure: ${entry}`),
          ...c.conditions.mental.map((entry) => `Trouble mental: ${entry}`),
          ...c.conditions.addictions.map((entry) => `Dépendance: ${entry}`)
        ],
        "Aucune condition majeure."
      );
    } else if (activeSubpage.key === "assets-goods") {
      fillSimpleList(section("Inventaire"), c.inventory, "Inventaire vide.");
      fillSimpleList(section("Animaux"), c.animals, "Aucun animal.");
    } else if (activeSubpage.key === "relations-summary") {
      fillSimpleList(section("Résumé des liens"), relationSummaryLines(c), "Aucune relation.");
    } else if (activeSubpage.key === "relations-people") {
      renderRelationPeople(section("Personnes"));
    } else if (activeSubpage.key === "relations-actions") {
      renderActionCategories(section("Interactions sociales"), relationEntries);
    } else if (activeSubpage.key === "relations-children") {
      fillSimpleList(
        section("Descendance"),
        c.family.children
          .filter((child) => child.alive)
          .map((child) => `${child.name} (${child.age} ans${child.adopted ? ", adopté(e)" : ""})`),
        "Aucun enfant vivant."
      );
    }

    ui.subpageScreen.classList.add("show");
    ui.subpageScreen.setAttribute("aria-hidden", "false");
  }

  function renderActions() {
    const categories = Object.entries(getActionsByCategory());
    const professionSchoolEntries = categories.filter(([name]) => name === "École & carrière");
    const professionJobEntries = categories.filter(([name]) => name === "Argent & biens");
    const crimeEntries = categories.filter(([name]) => name === "Crime & prison");
    const relationEntries = categories.filter(
      ([name]) => name === "Famille" || name === "Relations & amour"
    );
    const activityEntries = categories.filter(
      ([name]) =>
        name !== "Crime & prison" &&
        name !== "Famille" &&
        name !== "Relations & amour" &&
        name !== "École & carrière" &&
        name !== "Argent & biens"
    );
    renderActionCategories(ui.professionSchoolRoot, professionSchoolEntries);
    renderActionCategories(ui.professionJobRoot, professionJobEntries);
    renderActionCategories(ui.activityRoot, activityEntries);
    renderActionCategories(ui.crimeRoot, crimeEntries);
    renderActionCategories(ui.relationRoot, relationEntries);
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

  function renderBadges() {
    const c = game.character;
    const badgeState = {
      home: !!game.pendingEvent,
      assets: c.money < 0 || getTotalDebt() > 0,
      relationships: !c.family.spouse || aliveChildren().length === 0,
      activities: c.criminal.inPrison || c.criminal.record > 0
    };
    Object.entries(ui.badges).forEach(([key, badge]) => {
      if (badgeState[key]) {
        badge.classList.add("show");
      } else {
        badge.classList.remove("show");
      }
    });
  }

  function renderTabs() {
    ui.screens.forEach((screen) => {
      const screenTab = screen.id.replace("screen-", "");
      screen.classList.toggle("active", screenTab === activeTab);
    });
    ui.tabButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.tab === activeTab);
    });
  }

  function renderDeathModal() {
    const c = game.character;
    if (c.alive) {
      ui.deathModal.classList.remove("show");
      return;
    }
    const cause = c.deceasedCause || "de cause inconnue";
    const causeText = cause.startsWith("de") || cause.startsWith("d'") ? cause : `de ${cause}`;
    const spouseState = c.family.spouse?.alive ? "Marié(e)" : "Non marié(e)";
    const recap = `${spouseState}, ${aliveChildren().length} enfants, ${c.job || "sans emploi"}, $${Math.round(
      c.money
    )}`;
    ui.deathTitle.textContent = `Tu es mort ${causeText} à ${c.age} ans`;
    ui.deathStats.textContent = `Stats finales: ❤️${c.stats.health} · 😊${c.stats.happiness} · 🧠${c.stats.intelligence} · 👤${c.stats.looks}`;
    ui.deathRecap.textContent = `Récap vie: ${recap}`;
    const heirs = aliveChildren();
    ui.deathLegacyBtn.disabled = heirs.length === 0;
    ui.deathLegacyBtn.textContent = heirs.length ? "Legacy" : "Legacy indisponible";
    ui.deathLegacyBtn.onclick = () => {
      if (heirs.length) {
        continueAsChild(heirs[0].id);
      }
    };
    ui.deathModal.classList.add("show");
  }

  function renderCharacterModal() {
    const c = game.character;
    if (!isCharacterModalOpen) {
      ui.characterModal.classList.remove("show");
      return;
    }
    const list = [
      `Nom: ${c.fullName}`,
      `Âge: ${c.age} ans (${getLifeStage(c.age)})`,
      `Sexe: ${c.sex}`,
      `Pays: ${c.country}`,
      `Classe sociale: ${c.socialClass}`,
      `Travail: ${c.job || "Aucun"}`,
      `Argent: $${Math.round(c.money)} · Dettes: $${Math.round(getTotalDebt())}`,
      `Santé: ${c.stats.health}% · Bonheur: ${c.stats.happiness}%`,
      `Intelligence: ${c.stats.intelligence}% · Apparence: ${c.stats.looks}%`,
      `Réputation: ${c.stats.reputation}% · Casier: ${c.criminal.record}`
    ];
    ui.characterInfoList.innerHTML = "";
    list.forEach((line) => {
      const li = document.createElement("li");
      li.textContent = line;
      ui.characterInfoList.append(li);
    });
    ui.characterModal.classList.add("show");
  }

  function renderActionResultModal() {
    if (!actionResultState) {
      ui.actionResultModal.classList.remove("show");
      return;
    }
    ui.actionResultTitle.textContent = actionResultState.title;
    ui.actionResultText.textContent = actionResultState.text;
    ui.actionResultDetails.innerHTML = "";
    actionResultState.details.slice(0, 8).forEach((line) => {
      const li = document.createElement("li");
      li.textContent = line;
      ui.actionResultDetails.append(li);
    });
    ui.actionResultModal.classList.add("show");
  }

  function fillSelect(selectElement, entries, mapLabel = (v) => v, mapValue = (v) => v) {
    if (!selectElement || selectElement.options.length) return;
    entries.forEach((entry) => {
      const option = document.createElement("option");
      option.value = mapValue(entry);
      option.textContent = mapLabel(entry);
      selectElement.append(option);
    });
  }

  function ensureAvatarEditorOptions() {
    fillSelect(ui.avatarSkinSelect, AVATAR_SKINS, (entry) => entry.label, (entry) => entry.id);
    fillSelect(ui.avatarHairStyleSelect, AVATAR_HAIR_STYLES, (entry) => entry, (entry) => entry);
    fillSelect(ui.avatarHairColorSelect, AVATAR_HAIR_COLORS, (entry) => entry.label, (entry) => entry.id);
    fillSelect(ui.avatarEyeColorSelect, AVATAR_EYE_COLORS, (entry) => entry.label, (entry) => entry.id);
    fillSelect(ui.avatarBeardSelect, AVATAR_BEARDS, (entry) => entry, (entry) => entry);
    fillSelect(ui.avatarOutfitSelect, AVATAR_OUTFITS, (entry) => entry.label, (entry) => entry.id);
    fillSelect(ui.avatarAccessorySelect, AVATAR_ACCESSORIES, (entry) => entry, (entry) => entry);
  }

  function updateAvatarEditorConstraints() {
    if (!game?.character || !ui.avatarBeardSelect) return;
    const canBeard = game.character.sex === "Homme" && game.character.age >= 16;
    ui.avatarBeardSelect.disabled = !canBeard;
    if (!canBeard) {
      ui.avatarBeardSelect.value = "aucune";
    }
  }

  function avatarFromEditorInputs() {
    const c = game.character;
    return normalizedAvatarConfig(c.sex, {
      skin: ui.avatarSkinSelect.value,
      hairStyle: ui.avatarHairStyleSelect.value,
      hairColor: ui.avatarHairColorSelect.value,
      eyeColor: ui.avatarEyeColorSelect.value,
      beard: ui.avatarBeardSelect.value,
      outfit: ui.avatarOutfitSelect.value,
      accessory: ui.avatarAccessorySelect.value
    });
  }

  function syncEditorInputsFromAvatar(avatar) {
    ui.avatarSkinSelect.value = avatar.skin;
    ui.avatarHairStyleSelect.value = avatar.hairStyle;
    ui.avatarHairColorSelect.value = avatar.hairColor;
    ui.avatarEyeColorSelect.value = avatar.eyeColor;
    ui.avatarBeardSelect.value = avatar.beard;
    ui.avatarOutfitSelect.value = avatar.outfit;
    ui.avatarAccessorySelect.value = avatar.accessory;
    updateAvatarEditorConstraints();
  }

  function renderAvatarEditorPreview() {
    if (!game?.character) return;
    const previewAvatar = avatarFromEditorInputs();
    renderAvatar(ui.avatarEditorPreview, game.character, previewAvatar, 104);
  }

  function openAvatarEditor() {
    if (!game?.character) return;
    isCharacterModalOpen = false;
    actionResultState = null;
    ensureAvatarEditorOptions();
    syncEditorInputsFromAvatar(normalizedAvatarConfig(game.character.sex, game.character.avatar));
    isAvatarEditorOpen = true;
    renderAvatarEditorPreview();
    ui.avatarEditorModal.classList.add("show");
  }

  function closeAvatarEditor() {
    isAvatarEditorOpen = false;
    ui.avatarEditorModal.classList.remove("show");
  }

  function saveAvatarFromEditor() {
    if (!game?.character) return;
    game.character.avatar = avatarFromEditorInputs();
    autoSaveIfLinked();
    closeAvatarEditor();
    render();
  }

  function randomizeAvatarFromEditor() {
    if (!game?.character) return;
    const randomized = randomAvatarConfig(game.character.sex);
    syncEditorInputsFromAvatar(randomized);
    renderAvatarEditorPreview();
  }

  function resetAvatarFromEditor() {
    if (!game?.character) return;
    const baseline = normalizedAvatarConfig(game.character.sex, null);
    syncEditorInputsFromAvatar(baseline);
    renderAvatarEditorPreview();
  }

  function render() {
    if (!game?.character) {
      renderSaveLists();
      return;
    }
    renderTopProfile();
    renderStatus();
    renderDetailMenu();
    renderProfessionPanel();
    renderResources();
    renderConditions();
    renderRelations();
    renderSchoolPeople();
    renderProfessionColleagues();
    renderMilitaryBranches();
    renderEvent();
    renderLog();
    renderActions();
    renderCollections();
    renderTabs();
    renderSubpage();
    renderBadges();
    renderDeathModal();
    renderCharacterModal();
    renderActionResultModal();
    renderSaveLists();
    if (!isAvatarEditorOpen) {
      ui.avatarEditorModal?.classList.remove("show");
    }
  }

  function handlePersonInteractionClick(event) {
    const button = event.target.closest("button[data-person-id][data-person-action][data-person-scope]");
    if (!button) return;
    const personId = button.dataset.personId;
    const action = button.dataset.personAction;
    const scope = button.dataset.personScope;
    const person = findPersonByScope(scope, personId);
    if (!person) {
      addLog("Cette interaction n'est plus disponible.", "warn");
      render();
      return;
    }
    applyPersonInteraction(scope, person, action);
  }

  if (ui.newLifeBtn) {
    ui.newLifeBtn.addEventListener("click", () => bootstrapGame());
  }
  if (ui.startNewBtn) {
    ui.startNewBtn.addEventListener("click", () => {
      bootstrapGame();
    });
  }
  if (ui.saveCurrentBtn) {
    ui.saveCurrentBtn.addEventListener("click", () => saveCurrentProgress());
  }
  if (ui.goHomeBtn) {
    ui.goHomeBtn.addEventListener("click", () => {
      showStartScreen();
    });
  }
  if (ui.startSavesList) {
    ui.startSavesList.addEventListener("click", handleSaveListClick);
  }
  if (ui.settingsSavesList) {
    ui.settingsSavesList.addEventListener("click", handleSaveListClick);
  }
  if (ui.gameShell) {
    ui.gameShell.addEventListener("click", (event) => {
      const summary = event.target.closest("summary[data-subpage]");
      if (!summary || !ui.gameShell.contains(summary)) return;
      event.preventDefault();
      openSubpage(summary.dataset.subpage, summary.dataset.subpageTitle || summary.textContent.trim());
    });
    ui.gameShell.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const summary = event.target.closest("summary[data-subpage]");
      if (!summary || !ui.gameShell.contains(summary)) return;
      event.preventDefault();
      openSubpage(summary.dataset.subpage, summary.dataset.subpageTitle || summary.textContent.trim());
    });
  }
  if (ui.relationPeopleRoot) {
    ui.relationPeopleRoot.addEventListener("click", handlePersonInteractionClick);
  }
  if (ui.schoolPeopleRoot) {
    ui.schoolPeopleRoot.addEventListener("click", handlePersonInteractionClick);
  }
  if (ui.professionColleaguesRoot) {
    ui.professionColleaguesRoot.addEventListener("click", handlePersonInteractionClick);
  }
  if (ui.subpageContent) {
    ui.subpageContent.addEventListener("click", handlePersonInteractionClick);
  }
  if (ui.subpageBackBtn) {
    ui.subpageBackBtn.addEventListener("click", closeSubpage);
  }
  if (ui.subpageJournalBtn) {
    ui.subpageJournalBtn.addEventListener("click", returnToJournal);
  }
  if (ui.topSettingsBtn) {
    ui.topSettingsBtn.addEventListener("click", () => {
      isCharacterModalOpen = false;
      actionResultState = null;
      activeSubpage = null;
      if (activeTab === "settings") {
        activeTab = previousTabBeforeSettings || "home";
      } else {
        previousTabBeforeSettings = activeTab || "home";
        activeTab = "settings";
      }
      render();
    });
  }
  if (ui.profileTrigger) {
    const openProfile = () => {
      isAvatarEditorOpen = false;
      actionResultState = null;
      activeSubpage = null;
      isCharacterModalOpen = true;
      renderCharacterModal();
    };
    ui.profileTrigger.addEventListener("click", openProfile);
    ui.profileTrigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openProfile();
      }
    });
  }
  if (ui.characterCloseBtn) {
    ui.characterCloseBtn.addEventListener("click", () => {
      isCharacterModalOpen = false;
      renderCharacterModal();
    });
  }
  if (ui.characterModal) {
    ui.characterModal.addEventListener("click", (event) => {
      if (event.target === ui.characterModal) {
        isCharacterModalOpen = false;
        renderCharacterModal();
      }
    });
  }
  if (ui.actionResultCloseBtn) {
    ui.actionResultCloseBtn.addEventListener("click", () => {
      actionResultState = null;
      renderActionResultModal();
    });
  }
  if (ui.actionResultModal) {
    ui.actionResultModal.addEventListener("click", (event) => {
      if (event.target === ui.actionResultModal) {
        actionResultState = null;
        renderActionResultModal();
      }
    });
  }
  if (ui.openAvatarEditorBtn) {
    ui.openAvatarEditorBtn.addEventListener("click", openAvatarEditor);
  }
  if (ui.openAvatarEditorInlineBtn) {
    ui.openAvatarEditorInlineBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      openAvatarEditor();
    });
  }
  if (ui.characterEditAvatarBtn) {
    ui.characterEditAvatarBtn.addEventListener("click", openAvatarEditor);
  }
  [ui.avatarSkinSelect, ui.avatarHairStyleSelect, ui.avatarHairColorSelect, ui.avatarEyeColorSelect, ui.avatarBeardSelect, ui.avatarOutfitSelect, ui.avatarAccessorySelect].forEach(
    (selectElement) => {
      if (selectElement) {
        selectElement.addEventListener("change", renderAvatarEditorPreview);
      }
    }
  );
  if (ui.avatarEditorCloseBtn) {
    ui.avatarEditorCloseBtn.addEventListener("click", closeAvatarEditor);
  }
  if (ui.avatarEditorCancelBtn) {
    ui.avatarEditorCancelBtn.addEventListener("click", closeAvatarEditor);
  }
  if (ui.avatarEditorSaveBtn) {
    ui.avatarEditorSaveBtn.addEventListener("click", saveAvatarFromEditor);
  }
  if (ui.avatarEditorRandomBtn) {
    ui.avatarEditorRandomBtn.addEventListener("click", randomizeAvatarFromEditor);
  }
  if (ui.avatarEditorResetBtn) {
    ui.avatarEditorResetBtn.addEventListener("click", resetAvatarFromEditor);
  }
  if (ui.avatarEditorModal) {
    ui.avatarEditorModal.addEventListener("click", (event) => {
      if (event.target === ui.avatarEditorModal) {
        closeAvatarEditor();
      }
    });
  }
  ui.tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.action === "age") {
        nextYear();
        return;
      }
      if (button.dataset.tab) {
        actionResultState = null;
        activeSubpage = null;
        activeTab = button.dataset.tab;
        if (activeTab !== "settings") {
          previousTabBeforeSettings = activeTab;
        }
        render();
      }
    });
  });
  ui.deathNewLifeBtn.addEventListener("click", () => bootstrapGame(null, { preserveSaveId: true }));

  showStartScreen();
})();
