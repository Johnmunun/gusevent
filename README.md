# Guq Event — Plateforme événementielle

Agence événementielle premium — Phase 1 : landing page et fondation technique.

## Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Prisma ORM** + **NeonDB** (PostgreSQL)
- **Framer Motion** — animations discrètes

## Démarrage

```bash
npm install
cp .env.example .env
# Renseigner DATABASE_URL (Neon) puis :
npm run db:generate
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Base de données & Neon Auth

1. Créer un projet sur [neon.tech](https://neon.tech) et activer **Neon Auth** (onglet Auth → Enable).
2. Copier dans `.env` :
   - `DATABASE_URL` (connection string pooled)
   - `NEON_AUTH_BASE_URL` (Console Neon → Auth ; même préfixe `ep-…` que la DB, domaine `neonauth.c-7.…`, suffixe `/neondb/auth`)
   - `NEON_AUTH_COOKIE_SECRET` (min. 32 caractères : `openssl rand -base64 32`)

```bash
npx neonctl@latest init   # ou configuration manuelle
npm run db:setup          # schéma + seed CMS + profil admin Prisma
```

3. Créer le compte **Neon Auth** avec le même email que `SEED_ADMIN_EMAIL` (inscription sur `/admin/login` ou Console Neon → Users).

Le panneau `/admin` utilise **Neon Auth** pour la connexion et la table **User** (Prisma) pour les rôles (Super admin, Admin, Éditeur, Lecteur).

## Médias (images & vidéo)

Déposez vos fichiers dans **`public/media/`** — voir le guide détaillé :

**[public/media/README.md](public/media/README.md)**

| Emplacement | Fichiers |
|-------------|----------|
| `public/media/` | `logo.png` ou `logo.jpg` |
| `public/media/hero/` | `hero.jpg`, `hero-video.mp4` (optionnel) |
| `public/media/gallery/` | `01.jpg` … `08.jpg` |
| `public/media/testimonials/` | `01.jpg` … `03.jpg` |

Tant que les fichiers ne sont pas déposés, des images de démonstration s’affichent en secours.

## Structure

```
public/media/         # Vos images, logo, vidéo
src/
├── app/              # Pages App Router
├── config/media.ts   # Chemins des médias
├── components/
│   ├── landing/      # Sections landing
│   ├── layout/       # Header, Footer
│   └── ui/           # Logo, MediaImage
├── data/             # Contenu statique (phase 1)
└── lib/              # Prisma, utils
```

## Déploiement Vercel

1. Pousser le dépôt sur GitHub.
2. [vercel.com/new](https://vercel.com/new) → importer le repo.
3. Variables d'environnement (Settings → Environment Variables) :

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Connection string Neon (sans `channel_binding=require`) |
| `NEON_AUTH_BASE_URL` | URL Auth Neon (`…neonauth…/neondb/auth`) |
| `NEON_AUTH_COOKIE_SECRET` | Secret cookies (min. 32 caractères) |
| `NEXT_PUBLIC_APP_URL` | URL Vercel (`https://xxx.vercel.app`) |
| `SEED_ADMIN_EMAIL` | Email admin (optionnel, seed) |

4. Après le premier déploiement : exécuter `npm run db:setup` en local (ou Neon SQL) puis créer le compte sur `/admin/login`.

## Phase 2+ (à venir)

- Modules métier (devis, CRM, planning)
- Administration
- Contenu dynamique depuis la base
