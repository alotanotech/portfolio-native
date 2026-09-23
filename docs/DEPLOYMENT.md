# Deployment and future content system

## Vercel: personal, non-commercial deployment

1. Push this repository to GitHub.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Choose **Other** as the framework preset.
4. Leave the build command empty and use `.` as the output directory if Vercel asks.
5. Deploy. Vercel serves `index.html` and the `pages/project.html` gallery directly.

Every push to the production branch can redeploy the site. Use a preview deployment to test visual changes before publishing them.

Important: Vercel's current Hobby plan is restricted to non-commercial, personal use. It can host a personal showcase, but do not use it for a freelance business portfolio or paid client work without confirming the terms or moving to a commercial-appropriate plan/provider.

## Recommended free path for a freelance portfolio

Use Cloudflare Pages for the public site and, later, Pages Functions or Workers for the protected admin API. This repository already has `wrangler.jsonc`, so Cloudflare is the more natural next host. Cloudflare documents free and unlimited static-asset requests, while its free function allowance is shared with Workers and has a daily request limit. Keep the initial portfolio static; that is effectively free for normal portfolio traffic.

## Set up the included dynamic system

The repository now includes a Cloudflare Worker, D1 schema, R2 media bucket, and private `/admin` page. Complete these steps in your own Cloudflare account:

1. Create a free Cloudflare account and install Node.js if needed.
2. Run `npx wrangler login` in this repository. A browser window will ask you to approve access to **your** Cloudflare account.
3. Create the database: `npx wrangler d1 create portfolio-db`.
4. Copy the returned database ID into `wrangler.jsonc`, replacing `REPLACE_WITH_YOUR_D1_DATABASE_ID`.
5. Create image storage: `npx wrangler r2 bucket create portfolio-media`.
6. Create a long random admin password: `npx wrangler secret put ADMIN_TOKEN`. This is the password used only at `/admin`; never place it in source code.
7. Create the database tables: `npx wrangler d1 execute portfolio-db --remote --file migrations/0001_init.sql`.
8. Deploy: `npm run cf:deploy`.

After deployment, open `/admin`, enter the same `ADMIN_TOKEN`, create a project, upload WebP images, and tick **Publish immediately** when it is ready. The shared project page will then read that project and its images dynamically from D1 and R2.

The existing homepage work cards deliberately remain unchanged for now. They still open the same reusable gallery URLs. Add new cards to the homepage after creating a new project in the admin area.

## Can a free hosted portfolio have CRUD?

Technically yes: the Hobby plan includes serverless function usage, but its non-commercial restriction makes it the wrong long-term choice if this portfolio markets freelance services. Use the same architecture on a commercial-appropriate host when you are ready for CRUD. This avoids rebuilding the site whenever you upload work and avoids storing large originals in Git.

Recommended first version:

```text
Admin dashboard on Cloudflare Pages
        ↓ authenticated create / edit / delete requests
Cloudflare Pages Function or Worker
        ↓
Supabase Postgres (project metadata) + Supabase Storage (optimised images)
        ↓
Public portfolio fetches a read-only project list and image URLs
```

Use the database for project titles, descriptions, dates, categories, and image order. Use object storage for images. Do not put your storage service key in browser JavaScript; only the server-side route may use it.

## Why not use Google Drive directly?

Google Drive is useful as your private source archive, but it is not a good public image CDN or content API for this portfolio. Shared-file links are fragile, public browsing is awkward, and it adds permission and rate-limit issues. Keep design source files in Drive, then export web-ready images to dedicated storage.

## Build this later, not now

The current static version is the best no-cost first launch: it is fast, simple, and easy to maintain. Add CRUD only once manual image updates become painful. The migration should replace the `projects` object and generated manifests with an API response, while preserving the existing gallery UI.

## Minimum security checklist for CRUD

- Require sign-in for every admin route.
- Check ownership on every create, edit, and delete request.
- Limit upload file type and file size; optimise images before storage.
- Keep database and storage secret keys in Vercel environment variables.
- Back up project metadata before destructive operations.
