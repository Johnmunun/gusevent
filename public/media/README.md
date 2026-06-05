# Dossier médias — gusEvent

Déposez vos fichiers **manuellement** dans ce dossier. Le site les charge automatiquement.

## Si vos fichiers ont d'autres noms (1.jpeg, 10.jpeg…)

Après avoir déposé vos photos, lancez à la racine du projet :

```bash
npm run media:sync
```

Cela copie automatiquement `1.jpeg` → `01.jpg`, `10.jpeg` → `08.jpg`, etc.

## Logo (racine `media/`)

| Fichier | Usage |
|---------|--------|
| `logo.png` | Logo principal (recommandé, fond transparent) |
| `logo.jpg` | Alternative si vous n’avez pas de PNG |

→ Au moins **un** des deux. Priorité : `logo.png`, puis `logo.jpg`.

---

## Hero (`media/hero/`)

| Fichier | Usage |
|---------|--------|
| `hero.jpg` | Fond plein écran du hero |
| `visual-1.jpg` | Grande photo à droite |
| `visual-2.jpg` | Petite photo superposée |
| `hero-video.mp4` | Vidéo optionnelle |

**Astuce :** déposez vos photos en `gallery/10.jpeg`, `gallery/11.jpeg`, `gallery/1.jpeg` puis lancez `npm run media:sync` — elles remplacent automatiquement les images du hero.

Formats vidéo acceptés : `.mp4` (recommandé), nom exact : `hero-video.mp4`.

---

## Galerie réalisations (`media/gallery/`)

Déposez vos photos en **.jpeg** puis `npm run media:sync` :

| Votre fichier | → Affiché comme |
|---------------|-----------------|
| `1.jpeg` | `01.jpg`, `08.jpg` |
| `10.jpeg` | `05.jpg` (+ fond hero) |
| `11.jpeg` | `04.jpg` (+ hero droite) |
| `12.jpeg` | `02.jpg`, `06.jpg` |
| `13.jpeg` | `03.jpg`, `07.jpg` |

8 visuels dans la section **Réalisations** — uniquement vos images (plus de photos stock).

Formats : `.jpg`, `.jpeg`, `.png`, `.webp`

---

## Témoignages (`media/testimonials/`)

| Fichier | Client (exemple) |
|---------|------------------|
| `01.jpg` | Sophie Martin |
| `02.jpg` | Karim Benali |
| `03.jpg` | Élise Dubois |

Photos carrées ou portrait, min. 200×200 px.

---

## Conseils

- **Hero** : 1200×1500 px minimum (portrait)
- **Galerie** : 800×600 px ou plus
- **Logo** : hauteur ~80–120 px, fond transparent (PNG)
- **Vidéo** : courte boucle (&lt; 15 Mo), sans son pour l’autoplay

Après ajout des fichiers : rafraîchir la page (`npm run dev`).
