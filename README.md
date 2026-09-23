# Lyanlu Portfolio

A responsive portfolio for Christopher Aurellyan Alotano Luna. The live Cloudflare site reads project metadata from D1 and gallery images from R2. The original file-based gallery remains as a local fallback during migration.

## Start here

```bash
npm run dev
```

Open the local address shown in the terminal. No build step is required.

Before committing, run:

```bash
npm run check
```

This checks JavaScript syntax and regenerates every project gallery manifest.

## Project map

| What you want to change | Edit here |
| --- | --- |
| Homepage structure and copy | `index.html` |
| Global colours, type, scrolling, accessibility motion setting | `css/style.css` |
| A homepage section's look | its matching file in `css/` |
| Hero interaction | `js/hero.js` + `css/hero.css` |
| About photo interaction | `js/about.js` + `css/about.css` |
| Work cards and scrolling | `js/work-data.js`, `js/work.js` + `css/work.css` |
| Live project names, dates, descriptions, and order | `/admin/` (Cloudflare D1) |
| Gallery rendering and image viewer | `js/gallery.js` + `css/project-gallery.css` |
| Cloudflare API, database, and image delivery | `src/worker.mjs` + `migrations/0001_init.sql` |
| Private project editing, uploads, and gallery ordering | `admin/` (available at `/admin/` after Cloudflare deployment) |
| Reusable project-page shell | `pages/project.html` |
| Shared site images and logos | `asset/` |
| Live project images | `/admin/` (Cloudflare R2) |
| Legacy project images and manifests | `assets/projects/` |

Read [the content guide](docs/CONTENT-GUIDE.md) before adding a project. Read [the development guide](docs/DEVELOPMENT.md) before restructuring code. Deployment and the recommended future CRUD architecture are in [the deployment guide](docs/DEPLOYMENT.md).

## Deployment

The live site is a Cloudflare Worker connected to GitHub `main` at [lyanluna.com](https://lyanluna.com). It has no frontend build step. See [the deployment guide](docs/DEPLOYMENT.md) for the current setup, import, and cost/security notes.

## Notes

- Keep `asset/` for shared site artwork. `assets/projects/` is preserved legacy content; new gallery images go to R2 through `/admin/`.
- Run `npm run content:plan` to validate the 11-project legacy import. After the Worker is deployed, `npm run content:import` performs the resumable D1/R2 import without deleting files.
- The Blender software icon is referenced in `index.html` but is not currently in `asset/software/`; add `asset/software/blender.webp` before publishing to avoid a broken image.
