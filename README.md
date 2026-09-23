# Lyanlu Portfolio

A static, responsive portfolio site for Christopher Aurellyan Alotano Luna. The homepage presents the designer, services, and selected work. Each project opens one reusable gallery page populated from a project manifest.

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
| Work cards and filters | `js/work.js` + `css/work.css` |
| Project names, dates, descriptions, and order | `js/project.js` |
| Gallery rendering and image viewer | `js/gallery.js` + `css/project-gallery.css` |
| Cloudflare API, database, and image delivery | `src/worker.mjs` + `migrations/0001_init.sql` |
| Private browser-based project uploads | `admin/` (available at `/admin` after Cloudflare deployment) |
| Reusable project-page shell | `pages/project.html` |
| Shared site images and logos | `asset/` |
| Project gallery images and manifests | `assets/projects/` |

Read [the content guide](docs/CONTENT-GUIDE.md) before adding a project. Read [the development guide](docs/DEVELOPMENT.md) before restructuring code. Deployment and the recommended future CRUD architecture are in [the deployment guide](docs/DEPLOYMENT.md).

## Deployment

This is a static site, so it has no build step. Vercel can host a personal non-commercial version; Cloudflare Pages is the recommended free path when the portfolio is used to promote freelance work. See [the deployment guide](docs/DEPLOYMENT.md) for the settings and a sensible upgrade path for an admin dashboard.

## Notes

- Keep `asset/` for shared site artwork and `assets/projects/` for gallery content. Those names are intentionally separate because they have different jobs.
- The Blender software icon is referenced in `index.html` but is not currently in `asset/software/`; add `asset/software/blender.webp` before publishing to avoid a broken image.
