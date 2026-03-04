# Laboratoire 4512 — Jeu d’horreur 3D (prototype)

Prototype jouable en 3D dans le navigateur: un laboratoire informatique, un chien-monstre qui patrouille et vous chasse, et un HUD rappelant que votre personnage est chauve.

## Ouvrir sans installer Node.js (recommandé)

Le projet fonctionne en **HTML/CSS/JS “pur navigateur”** (grâce à un *import map* qui charge `three` depuis un CDN).

### Option A — GitHub Pages (zéro installation)

- Active GitHub Pages sur la branche du dépôt (dossier racine).
- Ouvre ensuite le site publié: tu n’as rien à installer.

### Option B — Serveur local intégré (sans installation)

Si tu as déjà Python 3 sur la machine:

```bash
python3 -m http.server 8000
```

Puis ouvre `http://localhost:8000`.

> Remarque: ouvrir `index.html` en `file://` peut échouer (modules ES / CORS). En HTTP ça marche.

## Lancer en local (avec Node.js, optionnel)

```bash
npm install
npm run dev
```

Puis ouvrez l’URL affichée par Vite.

## Contrôles

- WASD: déplacer
- Souris: regarder
- Maj: courir
- Échap: libérer la souris (Pointer Lock)

## Objectif

Survivre 60 secondes. Si le chien vous attrape, c’est perdu.

