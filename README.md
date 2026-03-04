# Chroniques de Dynastie

Jeu de simulation de vie médiévale inspiré de BitLife, orienté texte/choix avec conséquences cachées.

## Liste complète des systèmes inclus

### 1) Création et progression de personnage
- Génération aléatoire : nom, pays, sexe, classe sociale, famille, stats de base.
- Bouton **Passer une année** qui déclenche :
  - vieillissement,
  - événements annuels à choix,
  - revenus/dettes,
  - risques de santé, prison, décès.
- Mort possible par : maladie, accident, duel, prison, overdose, règlements de compte, vieillesse.
- Résumé de fin de vie automatique.

### 2) Enfance, famille et école
- Parents, fratrie, belle-famille, conjoint et enfants.
- Actions famille : passer du temps, cadeaux, insultes, rupture de liens, aide financière, testament.
- École : résultats, clubs, bagarres, renvoi/suspension, absentéisme.

### 3) Santé, apparence et mental
- Stats à gérer : santé, bonheur, intelligence, apparence, force, mental, réputation.
- Interactions : médecin, hôpital, psy/confesseur, repos, entraînement.
- Dépendances : alcool, opium, jeu.
- Maladies, blessures, troubles mentaux, chirurgie esthétique risquée.

### 4) Études et carrière
- Études supérieures avec dette universitaire.
- Emplois variés, salaire annuel, promotions et baisses de paie.
- Conflits au travail (sabotage, licenciement possible).
- Voies extrêmes : célébrité, politique, business.

### 5) Relations sociales, amour et famille
- Amis, ennemis, voisins, proches.
- Relations amoureuses : flirt, couple, mariage, infidélité, rupture, divorce.
- Descendance : enfants biologiques + adoption.
- Gestion familiale : test de parentalité, pension post-divorce.

### 6) Argent, biens et style de vie
- Revenus : salaire, propriétés, héritage, jeux, crime, événements.
- Dépenses : santé, voyages, luxe, investissements.
- Système de dettes/ prêts/ intérêts.
- Achats/ventes : maisons, montures, objets, animaux.

### 7) Criminalité et prison
- Crimes : vol, pickpocket, cambriolage, braquage, fraude, contrebande, corruption, mafia.
- Arrestation, jugement, condamnation.
- Prison avec mini-gameplay : gang, bagarres, évasion, études en cellule.
- Casier qui impacte emploi/réputation.

### 8) Activités et événements aléatoires
- Activités : tournoi, chasse, pèlerinage, charité, fête, chroniques publiques, rumeurs.
- Événements annuels fréquents et imprévisibles.
- Choix nombreux avec conséquences non révélées à l’avance.

### 9) Héritage et générations
- À la mort, possibilité d’incarner un enfant vivant.
- Transmission partielle de fortune, dettes, statut, possessions, réputation.
- Continuité de dynastie sur plusieurs générations.

### 10) Interface et ton
- Interface textuelle structurée par menus :
  - stats,
  - famille,
  - carrière,
  - santé,
  - crime,
  - argent/biens,
  - activités.
- Ton : liberté de choix, situations extrêmes, drames et humour noir implicite.

## Jouer (lien local)

1. Ouvrir un terminal dans `/workspace`
2. Lancer :

```bash
python3 -m http.server 8000
```

3. Ouvrir le lien :

`http://localhost:8000`

Le jeu est dans `index.html`, avec la logique dans `game.js`.
