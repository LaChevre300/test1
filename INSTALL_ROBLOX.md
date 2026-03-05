# Installer et publier ce monde sur Roblox

Ce projet est pret. Tu dois maintenant l'importer dans Roblox Studio, puis le publier.

## Methode 1 (recommandee) : Rojo + Roblox Studio

### 1) Installer les outils sur ton PC

Installe :

- Roblox Studio
- Rojo CLI
- Plugin Rojo dans Roblox Studio

Liens utiles :

- Rojo: https://rojo.space/docs/v7/getting-started/installation/
- Plugin Rojo (Marketplace Roblox Studio): cherche "Rojo"

### 2) Recuperer le projet

Clone ce repo sur ton ordinateur puis ouvre un terminal dans le dossier du projet.

### 3) Lancer la synchro Rojo

Dans le terminal du projet :

```bash
rojo serve
```

Par defaut, Rojo tourne sur `localhost:34872`.

### 4) Connecter Roblox Studio

Dans Roblox Studio :

1. Cree un nouveau jeu (Baseplate).
2. Ouvre l'onglet Plugins.
3. Lance le plugin Rojo.
4. Connecte-toi a `localhost` port `34872`.
5. Synchronise le projet.

Tu dois voir arriver automatiquement :

- `ReplicatedStorage/Shared`
- `ServerScriptService/Main.server.lua` + modules
- `StarterPlayer/StarterPlayerScripts/TycoonHUD.client.lua`

### 5) Tester le jeu

Dans Studio :

- Clique sur **Play**.
- Verifie qu'un plot est attribue.
- Achete des upgrades, collecte, teste rebirth.

### 6) Publier sur Roblox

Dans Studio :

1. **File > Publish to Roblox As...**
2. Cree une nouvelle experience (ou choisis une existante).
3. Publie.

Ton monde est alors en ligne dans Roblox.

---

## Methode 2 : Build un fichier `.rbxlx` puis publier

Si tu preferes un fichier place local :

```bash
rojo build default.project.json -o NeonNoodleTycoon.rbxlx
```

Ensuite :

1. Ouvre `NeonNoodleTycoon.rbxlx` dans Roblox Studio.
2. Teste rapidement.
3. **File > Publish to Roblox As...**

---

## Methode 3 (sans Rojo) : import manuel

Possible, mais plus long :

1. Cree un projet vide dans Roblox Studio.
2. Cree les dossiers/scripts correspondants a `src/`.
3. Copie-colle le contenu de chaque fichier Lua.
4. Publie via **File > Publish to Roblox As...**

---

## Reglages Roblox a verifier avant release

Dans **Game Settings** :

- **Security > Enable Studio Access to API Services** (pour tester DataStore en studio).
- Configure icone, miniatures, permissions, etc.
- Fais un test multijoueur local (2 joueurs) pour valider les plots.

## Depannage rapide

- Si rien ne se synchronise : verifie que `rojo serve` tourne.
- Si plugin Rojo ne connecte pas : verifie le port `34872`.
- Si la sauvegarde ne marche pas en test Studio : active API Services.
