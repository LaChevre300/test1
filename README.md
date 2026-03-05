# Neon Noodle Tycoon (Roblox)

Tycoon complet au style **cyberpunk / usine de ramen futuriste** :

- progression longue en 30 paliers (droppers, upgrades, machines avancees),
- economie avec revenu/seconde + cash a collecter,
- systeme de **Rebirth** (prestige) avec bonus permanent,
- systeme de **shards** et recherche permanente,
- milestones de progression avec recompenses,
- overclock temporaire activable en jeu,
- quetes journalieres (claim en jeu),
- bonus de connexion (streak),
- event rotatif quotidien (bonus variables),
- classement hebdomadaire (top scores),
- sauvegarde DataStore (cash, rebirths, unlocks),
- HUD client en temps reel,
- generation automatique de 4 parcelles de tycoon.

## Concept de jeu

Tu construis une chaine de production de nouilles ultra-tech :

1. demarre avec un dropper de base,
2. achete des ameliorations via les boutons du plot,
3. collecte le cash non collecte sur le pad jaune,
4. debloque le terminal prestige,
5. fais un rebirth sur le pad rouge pour augmenter ton scaling.
6. depense tes shards en recherche permanente.
7. complete la quete du jour et conserve ta streak.

## Arborescence

```text
src/
  Shared/Config/TycoonConfig.lua
  Shared/Config/MonetizationConfig.lua
  ServerScriptService/
    Main.server.lua
    Modules/
      DataService.lua
      MonetizationService.lua
      TycoonFactory.lua
      TycoonService.lua
  StarterPlayer/StarterPlayerScripts/
    TycoonHUD.client.lua
default.project.json
```

## Utilisation (Rojo)

1. Installe Rojo.
2. Demarre le serveur Rojo a la racine du repo :
   ```bash
   rojo serve
   ```
3. Dans Roblox Studio, ouvre ton `.rbxl/.rbxlx` puis connecte Rojo.
4. Lance Play Test.

## Publication Roblox (important)

Tu as un guide complet pas-a-pas ici :

- `INSTALL_ROBLOX.md`

Ce guide explique :

- comment installer Rojo + plugin Studio,
- comment synchroniser le projet dans Studio,
- comment publier ton monde sur Roblox,
- comment faire sans Rojo (methode manuelle).

## Pack pre-release

J'ai prepare aussi :

- `PRE_RELEASE_CHECKLIST.md` (checklist complete avant mise en ligne)
- `STORE_CONTENT_PACK.md` (titre, description, update log, pitch)
- `ASSET_BRIEF.md` (briefs pour icone et thumbnails)

## Monetisation prete

Le jeu inclut deja une base monetisation:

- GamePass: VIP x2 revenu, Auto Collect
- Developer Products: Cash packs, Instant Rebirth
- UI boutique en jeu

Tu dois juste renseigner les IDs Roblox dans:

- `src/Shared/Config/MonetizationConfig.lua`

## Reglages gameplay

Les principaux parametres sont dans `src/Shared/Config/TycoonConfig.lua` :

- couts, revenus, multiplicateurs,
- formule de rebirth,
- milestones et recompenses,
- arbre de recherche (cout shards / effets),
- overclock (duree / cooldown / multiplicateur),
- daily login rewards,
- daily quests pool,
- rotation events,
- weekly leaderboard datastore,
- nombre de plots,
- intervalle d'autosave.

## Notes

- Si DataStore API est desactivee en Studio, le jeu reste jouable (avec warnings de save/load).
- Le systeme est pret a etre etendu (cosmetiques, gamepass, quetes, NPC, etc.).
