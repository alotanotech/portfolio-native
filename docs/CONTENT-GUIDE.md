# Content guide

## Add images to an existing project

1. Find the project slug in `js/project.js`.
2. Put the files in `assets/projects/<slug>/` or one of these optional folders:
   - `social-post/`
   - `story/`
   - `square/`
   - `landscape/`
   - `other/`
3. Use `.webp` where possible. The generator also accepts JPG, PNG, AVIF, and GIF.
4. Run `npm run gallery`.
5. Open `pages/project.html?project=<slug>` locally and check the image viewer.

`manifest.json` is generated. Do not edit it by hand unless you are intentionally changing the generator.

For older projects, images placed directly in `assets/projects/<slug>/` are kept and appear in the **Other** gallery category. New projects should use the named category folders so their content stays easy to browse.

## Add a new project

1. Create a lower-case slug with hyphens, for example `coffee-campaign`.
2. Add the project metadata to the `projects` object in `js/project.js`.
3. Create `assets/projects/coffee-campaign/` and add images using the categories above.
4. Run `npm run gallery`.
5. Add a homepage work card in `index.html` and connect it with `onclick="openProject('coffee-campaign')"` or the existing card pattern.

The folder name and slug must match exactly. A project may use no category folders, but it will show an empty gallery until images are added.

## Edit common portfolio content

| Content | Location |
| --- | --- |
| Bio, services, contact text | `index.html` |
| Email link | `index.html`, search for `alotanostudio@gmail.com` |
| Project title, description, client, year, category | `js/project.js` |
| Homepage project thumbnail | `index.html` and `asset/project/` or the relevant project asset |
| Hero or logo art | `asset/hero/` and `asset/logo/` |

## Media standards

- Export still images as WebP and keep the original source outside this repository.
- Name files clearly without duplicate suffixes such as `final-final` where possible.
- Test large images on mobile data; portfolio imagery is the main load-time cost.
- Add the missing `asset/software/blender.webp` or remove its matching markup before release.
