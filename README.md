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

## Fonctionnalités implémentées

- Résolution fixe **1280x720**, rendu pixel (tuiles 16x16), boucle **60 FPS**
- Monde complet 5 zones sans chargement (Ferme, Village, Forêt, Rivière, Colline)
- Cycle jour/nuit, saisons (28 jours), météo aléatoire, énergie (coût x2 la nuit)
- HUD permanent (argent, énergie, heure, saison, outil, graine)
- Champs 20x20, 12 cultures, engrais, récoltes, regrowth
- Inventaire 36 slots, coffre 100 slots, boîte de vente 10 slots
- Boutique de Pierre (graines, animaux, bâtiments, amélioration arrosoir, déco)
- Ressources (bois, pierre, fibre), pêche (mini-jeu), limites journalières
- Animaux (poule, vache, mouton, cochon, canard), bonheur/soin/produits
- Crafting (12 recettes), machines posables et transformation des produits
- 6 PNJ, amitié (cœurs), cadeaux, 20 quêtes, festivals saisonniers
- Sauvegarde JSON locale : auto fin de journée + manuelle
- Fin de jeu + écran de stats + **New Game+**
