# Pre-release checklist (Neon Noodle Tycoon)

Utilise cette checklist avant publication.

## 1) Build et scripts

- [ ] Le jeu se lance sans erreur dans Output.
- [ ] Les 4 plots s'attribuent correctement.
- [ ] Les upgrades s'achetent dans le bon ordre.
- [ ] Le pad de collecte fonctionne.
- [ ] Le rebirth fonctionne.
- [ ] Les milestones se debloquent et donnent les recompenses.
- [ ] La recherche permanente (shards) fonctionne.
- [ ] Le pad overclock fonctionne (activation + cooldown).
- [ ] La quete du jour se genere correctement et peut etre claim.
- [ ] Le bonus de connexion (streak) se met a jour d'un jour a l'autre.
- [ ] L'event rotatif du jour applique bien ses bonus.
- [ ] Le classement hebdo affiche des scores coherents.
- [ ] Le rendu V4 est stable (lighting + post-processing + audio ambience).
- [ ] Les nouveaux models machines/ramens restent performants en multi.
- [ ] Le save/load fonctionne (test sortie + rejoin).

## 2) Roblox Studio settings

- [ ] Home > Game Settings > Security > Enable Studio Access to API Services (test DataStore).
- [ ] Home > Game Settings > Permissions verifies.
- [ ] Home > Game Settings > Avatar adapte au style de jeu.
- [ ] Home > Game Settings > Basic Info rempli.

## 3) Multi-joueurs

- [ ] Test Start Server (2 joueurs minimum).
- [ ] Chaque joueur a un plot different.
- [ ] Aucun joueur ne peut acheter sur le plot d'un autre.
- [ ] Les stats UI restent synchronisees.

## 4) Monetisation

- [ ] IDs gamepass renseignes dans `MonetizationConfig.lua`.
- [ ] IDs developer products renseignes dans `MonetizationConfig.lua`.
- [ ] Achat test VIP x2 revenu.
- [ ] Achat test Auto Collect.
- [ ] Achat test Cash packs.
- [ ] Achat test Instant Rebirth.

## 5) Page Roblox / Store

- [ ] Nom du jeu final.
- [ ] Description publique.
- [ ] 1 icone (512x512).
- [ ] 3 a 5 thumbnails.
- [ ] Tags et age guidelines verifies.

## 6) QA final

- [ ] 10 minutes de jeu continu sans bug bloqueur.
- [ ] Progression 0 -> prestige testee.
- [ ] Performances stables (pas de freeze visible).
- [ ] Publication effectuee puis test live.
