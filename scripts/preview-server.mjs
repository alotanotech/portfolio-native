import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

const root = resolve(process.cwd());
const port = Number(process.argv[2] || 8767);
const demo = process.argv.includes("--demo");
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif" };
const sampleProject = { slug: "demo-project", project_index: "01", name: "DEMO PROJECT", full_name: "Demo project", client: "LOCAL PREVIEW", year: "2026", type: "BRAND / DESIGN", category: "Personal", status: "ARCHIVE", kind: "personal", description: "Local-only example for testing the admin interface.", published: 0 };
const sampleProjects = [sampleProject,
    { ...sampleProject, slug: "second-project", project_index: "02", name: "SECOND PROJECT", full_name: "Second project" },
    { ...sampleProject, slug: "third-project", project_index: "03", name: "THIRD PROJECT", full_name: "Third project" }];
const sampleImages = [
    { id: 1, category: "cover", alt: "Sample cover", order: 1, url: "/assets/projects/pcba/social-post/1.webp" },
    { id: 2, category: "social-post", alt: "Sample social post", order: 1, url: "/assets/projects/pcba/social-post/2.webp" },
    { id: 3, category: "social-post", alt: "Second social post", order: 2, url: "/assets/projects/pcba/social-post/3.webp" },
    { id: 4, category: "story", alt: "Sample story", order: 1, url: "/assets/projects/pcba/social-post/5.webp" },
    { id: 5, category: "story", alt: "Second story", order: 2, url: "/assets/projects/pcba/social-post/23.webp" }
];
const galleryPreviewProject = {
    slug: "gallery-preview",
    index: "00",
    name: "GALLERY PREVIEW",
    fullName: "Multi-category gallery preview",
    client: "LOCAL PREVIEW",
    kind: "personal",
    category: "Personal",
    status: "PREVIEW",
    type: "DESIGN",
    folder: "../assets/projects/pcba/",
    manifest: {
        categoryOrder: ["story", "social-post", "square"],
        categories: {
            "social-post": ["social-post/1.webp", "social-post/2.webp"],
            story: ["social-post/3.webp", "social-post/5.webp", "social-post/23.webp", "social-post/131.webp"],
            square: ["social-post/244.webp", "social-post/5 (1).webp", "social-post/5 (2).webp"]
        }
    }
};

createServer(async (request, response) => {
    try {
        const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
        if (demo && request.method === "GET" && pathname === "/api/projects/gallery-preview") {
            response.writeHead(200, { "content-type": "application/json", "cache-control": "no-store", "x-preview-mode": "read-only" });
            response.end(JSON.stringify(galleryPreviewProject));
            return;
        }
        if (demo && pathname.startsWith("/api/admin/")) {
            const data = request.method === "GET" && pathname === "/api/admin/projects" ? sampleProjects
                : request.method === "GET" && /^\/api\/admin\/projects\/(demo-project|second-project|third-project)\/images$/.test(pathname) ? sampleImages
                : { error: "Local demo is read-only; no changes were saved." };
            response.writeHead(Array.isArray(data) ? 200 : 403, { "content-type": "application/json", "cache-control": "no-store", "x-preview-mode": "read-only" });
            response.end(JSON.stringify(data));
            return;
        }
        if (pathname.split("/").some((part) => part.startsWith("."))) throw new Error("Hidden file");
        let file = resolve(root, `.${pathname}`);
        if (file !== root && !file.startsWith(`${root}${sep}`)) throw new Error("Outside project");
        if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
        const body = await readFile(file);
        response.writeHead(200, { "content-type": types[extname(file).toLowerCase()] || "application/octet-stream", "cache-control": "no-store" });
        response.end(body);
    } catch {
        response.writeHead(404, { "content-type": "text/plain" });
        response.end("Not found");
    }
}).listen(port, "127.0.0.1", () => console.log(`Preview: http://127.0.0.1:${port}/`));
