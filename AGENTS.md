# Repository guide for coding agents

## Purpose

Maintain this creative portfolio without changing its visual direction or breaking the reusable project gallery.

## Architecture

- `index.html` is the complete homepage.
- `pages/project.html` is one shared project page. Its `?project=<slug>` query parameter selects content.
- `js/work-data.js` loads published homepage cards from `/api/projects`; `js/work.js` owns scrolling and the counter.
- `js/project.js` loads published project data from the API, with local legacy fallback. `js/gallery.js` renders R2 image URLs or legacy manifests.
- `src/worker.mjs` provides the deployed Cloudflare CRUD API, D1 data access, and R2 image delivery.
- `admin/` is the protected project editor and category-specific image ordering UI. It authenticates with the `ADMIN_TOKEN` Cloudflare secret.
- D1/R2 are the live content source. `asset/` contains shared site media; `assets/projects/` and the metadata in `js/project.js` are retained legacy import/fallback inputs.
- The public site is [lyanluna.com](https://lyanluna.com), connected to this repository's GitHub `main` branch. Pushing an authorized site update to `origin/main` triggers deployment.

## Safe content workflow

1. Create a draft in `/admin/` with a unique slug.
2. Upload an optimised cover and gallery images in their intended order.
3. Publish when ready and check the live project URL.
4. Run `npm run check` for code changes; use `npm run content:plan` before any legacy import.

## Change rules

- Preserve the current URL structure and asset paths unless a migration updates every reference.
- Never commit the `ADMIN_TOKEN` or delete legacy content without explicit approval.
- Do not create a separate HTML page for each project; use the existing shared gallery page.
- Prefer small, local CSS and JavaScript edits. Do not introduce a framework or dependency for a small interaction.
- Keep the admin visual style restrained and aligned: white background, black text, the portfolio wordmark on the left, and only a “View portfolio” link on the right of its header. Use normal sans-serif body text, a modestly larger page heading, thin square black borders, generous whitespace, and consistent content alignment. Avoid oversized type, gradients, heavy decoration, rounded cards, and strong shadows.
- Keep admin forms, project list, and gallery thumbnails aligned to the same content grid. Use the black button treatment sparingly and retain clear focus states, readable labels, and responsive stacking on small screens.
- Keep animations transform/opacity based when possible. Avoid scroll-linked `filter`, large `clip-path` animation, or layout-changing animation.
- Respect `prefers-reduced-motion` whenever adding motion.
- Keep content legible at 320px, 768px, 1024px, and 1440px.
- For authorized live site updates, commit and push the verified change to `origin/main`, then check the deployed page.

## Verification

Run `npm run check`. Manually verify the homepage, one populated project gallery, keyboard close with Escape in the image viewer, and the mobile navigation.
