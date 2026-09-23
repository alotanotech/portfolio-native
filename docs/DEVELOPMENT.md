# Development guide

## Local workflow

Run `npm run dev` to serve the static fallback locally. Run `npm run cf:dev` to exercise the Worker with configured local D1/R2 bindings. Run `npm run check` after JavaScript or gallery changes. `npm run content:plan` validates import inputs without uploading anything.

## Code navigation

The site deliberately uses plain HTML, CSS, and JavaScript. There is no bundler or framework:

```text
index.html                 homepage structure
pages/project.html         reusable gallery page
css/style.css              shared reset, tokens, scroll and accessibility
css/<section>.css          visual styles per homepage section
js/hero.js                 hero brush/cursor/glitch lifecycle
js/about.js                identity-photo interaction lifecycle
js/work.js                 work scrolling and counter
js/work-data.js            live homepage cards from the API
js/project.js              project page setup and legacy fallback
js/gallery.js              API/manifest gallery and image viewer
src/worker.mjs             D1/R2 API and media delivery
admin/                     protected content editor
scripts/generate-gallery-manifests.js  generated gallery data
scripts/import-legacy-content.js       resumable D1/R2 import
```

## Folder conventions

- `asset/` means shared interface or branding media. Do not mix project archives into it.
- `assets/projects/<slug>/` is preserved legacy gallery content and import input; new live uploads go to R2.
- `css/` and `js/` are organised by page area, not by component framework.
- `docs/` explains workflows; it is not served as portfolio content.

This is intentionally a documentation-first tidy-up. Renaming the live `asset/` directory now would touch many homepage references and add risk without improving the visitor experience. If you later migrate it, update all references in one pull request and test every page.

## Animation performance rules

- Use `transform` and `opacity` for transitions and reveals.
- Queue pointer-driven visual updates with `requestAnimationFrame`.
- Avoid animating `filter`, `width`, `height`, or large `clip-path` masks while scrolling.
- Never rely on motion for essential information; keep reduced-motion behavior working.

## When to split a file

Split a file only when it owns a separate page feature, as the gallery already does. Keep styles and scripts paired by feature. The current large `hero.css` is a candidate for future internal cleanup, but splitting its animations before visual regression testing would be riskier than useful.
