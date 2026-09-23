# Repository guide for coding agents

## Purpose

Maintain this static creative portfolio without changing its cyber-inspired visual direction or breaking the reusable project gallery.

## Architecture

- `index.html` is the complete homepage.
- `pages/project.html` is one shared project page. Its `?project=<slug>` query parameter selects content.
- `js/project.js` is the single source of truth for project metadata and valid slugs.
- `js/gallery.js` loads `assets/projects/<slug>/manifest.json` and renders the gallery.
- `src/worker.mjs` provides the deployed Cloudflare CRUD API, D1 data access, and R2 image delivery.
- `admin/` is a protected upload/create/delete interface. It authenticates with the `ADMIN_TOKEN` Cloudflare secret.
- `asset/` contains shared site media. `assets/projects/` contains per-project content.

## Safe content workflow

1. Add a project entry to `js/project.js` with a unique slug.
2. Add the matching `assets/projects/<slug>/` folder and category folders.
3. Add optimised images.
4. Run `npm run gallery`.
5. Add or update the matching homepage card in `index.html` when appropriate.
6. Run `npm run check` and test the project URL locally.

## Change rules

- Preserve the current URL structure and asset paths unless a migration updates every reference.
- Do not create a separate HTML page for each project; use the existing shared gallery page.
- Prefer small, local CSS and JavaScript edits. Do not introduce a framework or dependency for a small interaction.
- Keep animations transform/opacity based when possible. Avoid scroll-linked `filter`, large `clip-path` animation, or layout-changing animation.
- Respect `prefers-reduced-motion` whenever adding motion.
- Keep content legible at 320px, 768px, 1024px, and 1440px.

## Verification

Run `npm run check`. Manually verify the homepage, one populated project gallery, keyboard close with Escape in the image viewer, and the mobile navigation.
