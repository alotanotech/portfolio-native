# Content guide

## Live D1/R2 workflow (current)

Open `/admin/` after Cloudflare Access login, enter the separate admin token, and choose an existing project or create a draft. Upload a **cover** plus gallery images under `social-post`, `story`, `square`, `landscape`, or `other`. The cover is not shown as a gallery item; the newest uploaded cover is active. Use the ↑/↓ controls to change image order within a category. Save the project as published only when ready. Published projects with an image appear on the homepage automatically. Unpublish to hide one without deleting it.

The media panel can also remove an individual image after confirmation. This deletes its R2 file permanently, so keep your source export elsewhere. Deleting a project also deletes every image attached to it. Reordering does not delete or duplicate image files.

Images must be 10 MB or smaller. Export optimized WebP where possible; GIF is supported. D1 stores metadata and ordering; R2 stores image bytes. New live content does **not** require a Git commit or a new folder.

The original 11 projects remain in Git as fallback/import material. Run `npm run content:plan` to validate them. After deploying the updated Worker, `npm run content:import` asks for the admin token at a hidden terminal prompt and uploads the 68 gallery files and 9 covers. It is resumable and does not delete the originals.

## Legacy local workflow (fallback only)

### Add images to an existing project

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

### Add a new project

1. Create a lower-case slug with hyphens, for example `coffee-campaign`.
2. Add the project metadata to the `projects` object in `js/project.js`.
3. Create `assets/projects/coffee-campaign/` and add images using the categories above.
4. Run `npm run gallery`.
5. Add a homepage work card in `index.html` and connect it with `onclick="openProject('coffee-campaign')"` or the existing card pattern.

The folder name and slug must match exactly. A project may use no category folders, but it will show an empty gallery until images are added.

### Edit common portfolio content

| Content | Location |
| --- | --- |
| Bio, services, contact text | `index.html` |
| Email link | `index.html`, search for `alotanostudio@gmail.com` |
| Live project title, description, client, year, category | `/admin/` |
| Live homepage project thumbnail | Cover upload in `/admin/` |
| Hero or logo art | `asset/hero/` and `asset/logo/` |

### Media standards

- Export still images as WebP and keep the original source outside this repository.
- Name files clearly without duplicate suffixes such as `final-final` where possible.
- Test large images on mobile data; portfolio imagery is the main load-time cost.
- Add the missing `asset/software/blender.webp` or remove its matching markup before release.
