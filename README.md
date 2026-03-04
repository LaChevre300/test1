# SH-Search — Recherche & aide à l’analyse (sciences humaines)

Application web **sans installation** pour les étudiant·es en sciences humaines:

- Recherche sur plusieurs sources **sans clé API**: **Wikipedia**, **OpenAlex**, **Crossref**
- Résumé automatique (extractif, local)
- Idées: problématique, conséquences, solutions / angles, concepts-carrefour
- Génération de citation **APA 7** (au mieux selon les métadonnées disponibles)

## Ouvrir (zéro installation)

Le projet est **100% statique** (`index.html` + `styles.css` + `app.js`).

### Option A — Lien direct (si dépôt public)

Tu peux ouvrir `index.html` via un hébergement statique (ou un lien “raw” qui sert les bons MIME types).

### Option B — Serveur local intégré (sans installation)

Si tu as déjà Python 3 sur la machine:

```bash
python3 -m http.server 8000
```

Puis ouvre `http://localhost:8000`.

> Remarque: ouvrir `index.html` en `file://` peut échouer (modules ES). En HTTP, c’est fiable.

