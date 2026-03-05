# Ferme des Quatre Brumes

Prototype jouable en navigateur (PC/mobile clavier) inspiré des farming sims cozy.

## Lancer le jeu

Ouvrir `index.html` dans un navigateur moderne, ou servir le dossier :

```bash
python3 -m http.server 8080
```

Puis ouvrir `http://localhost:8080`.

## Contrôles

- **Déplacement** : `ZQSD` ou `WASD`
- **Interagir / Utiliser outil** : `E` ou clic gauche
- **Outils** : `1` à `6`
  1. Houe
  2. Arrosoir
  3. Hache
  4. Pioche
  5. Faux
  6. Canne à pêche
- **Planter / Récolter / Poser machine-clôture / Engrais** : `F`
- **Inventaire** : `Tab`
- **Journal** : `J`
- **Crafting** : `C`
- **Pause + sauvegarde manuelle + switch FR/EN** : `Esc`
- **Accélération du temps x4** : maintenir `Espace`
- **Dormir** : interagir (`E`) avec le lit dans la maison (optionnel)

## Fonctionnalités implémentées

- Résolution fixe **1280x720**, rendu pixel (tuiles 16x16), boucle **60 FPS**
- Monde complet 5 zones sans chargement, **agrandi** + bande d'intérieurs visitables
- Cycle jour/nuit, saisons (28 jours), météo aléatoire, énergie (coût x2 la nuit), **repos seulement si le joueur dort**
- HUD permanent (argent, énergie, heure, saison, outil, graine)
- Champs 24x24, 12 cultures, engrais, récoltes, regrowth
- Inventaire 36 slots, coffre 100 slots, boîte de vente 10 slots
- **Hutte aux Herbes** (nouveau design UI + bâtiment + intérieur), graines, animaux, bâtiments, amélioration arrosoir, déco
- Ressources (bois, pierre, fibre), pêche (mini-jeu), limites journalières
- Animaux (poule, vache, mouton, cochon, canard), bonheur/soin/produits
- Crafting (12 recettes), machines posables et transformation des produits
- 6 PNJ, amitié (cœurs), cadeaux, 20 quêtes, festivals saisonniers
- Intérieurs meublés (maison, hutte, taverne, mairie) avec collisions mobilier
- Passe polish visuel : meubles plus variés et uniques par pièce, routes village retravaillées
- Éclairage dynamique : ambiance jour/soir/nuit, météo, lueurs de fenêtres et lampadaires, glow intérieur
- Sauvegarde JSON locale : auto fin de journée + manuelle
- Fin de jeu + écran de stats + **New Game+**
