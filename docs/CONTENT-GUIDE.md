# Content guide

## Live D1/R2 workflow (current)

Open `/admin/` after Cloudflare Access login, enter the separate admin token, and choose an existing project or create a draft. Upload a **cover** plus gallery images under `social-post`, `story`, `square`, `landscape`, or `other`. The cover is not shown as a gallery item; the newest uploaded cover is active. Use the ↑/↓ controls to change image order within a category. Save the project as published only when ready. Published projects with an image appear on the homepage automatically. Unpublish to hide one without deleting it.

The media panel can also remove an individual image after confirmation. This deletes its R2 file permanently, so keep your source export elsewhere. Deleting a project also deletes every image attached to it. Reordering does not delete or duplicate image files.

Images must be 10 MB or smaller. Export optimized WebP where possible; GIF is supported. D1 stores metadata and ordering; R2 stores image bytes. New live content does **not** require a Git commit or a new folder.

### Upload and manage images

1. In the project editor, enter the full and short titles, client, year, your own project category label, and description. Type a **Portfolio section** separately—Client, Personal, Photography, or a new name. It controls the public Work selector and appears on the project gallery page; the project category is a more specific label. New projects receive a URL slug and placement automatically; open **URL and placement** only when you need to inspect or change the slug. The older Type and Status metadata are preserved without cluttering the editor.
2. Save the project first, then choose **Add image** above the image list. Select **Place in** inside the popup: Cover for the homepage card, or Social media posts, Stories, Square posts, Landscape, or Other for the project gallery. Choose a file, drag to position it, use the zoom slider, and choose a crop shape if needed. **Use crop** stages an optimized still image; **Upload original** keeps the file unchanged. Click **Upload image** to persist it. Cropping an animated GIF makes a still frame, so use its original if you want animation.
3. The image list groups existing images by category. Select a thumbnail to open its edit popup, change its **Place in** category, edit alt text, replace its file, or move it earlier/later. Choosing **Cover** for a gallery image creates a separate cover copy and leaves the gallery image in place; you can also upload a new cover. The newest Cover is active on the homepage. The card controls reorder or remove an image. Image deletion permanently removes its R2 file.
4. For longer editing sessions, the project archive remains visible while the content column scrolls independently. On smaller screens, the archive stays above the independently scrolling editor.

The localhost demo at `http://127.0.0.1:8767/admin/` uses sample data and is **read-only**. It lets you test cropping and layout but cannot save to D1/R2. Use the live `/admin/` to save real content.

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
