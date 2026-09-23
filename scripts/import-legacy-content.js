// One-time, resumable import from the checked-in legacy catalog to D1/R2.
// Run without --execute to validate the files and see the upload plan.
const fs = require("node:fs/promises");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const origin = "https://lyanluna.com";
const execute = process.argv.includes("--execute");
const categories = ["social-post", "story", "square", "landscape", "other"];
const covers = {
    pcba: "asset/project/PSI.webp",
    "little-lady": "asset/project/LittleLady.webp",
    pacohome: "asset/project/Pacohome.webp",
    adiograf: "asset/project/Adiograf.webp",
    bagatelle: "asset/project/Bagatelle.webp",
    "3d": "assets/projects/3d/CupVase.webp",
    "digital-illustration": "assets/projects/digital-illustration/la.webp",
    "graphic-design": "assets/projects/graphic-design/CyberChris.webp",
    "pixel-art": "assets/projects/pixel-art/Lyan.gif"
};

function contentType(filename) {
    return filename.toLowerCase().endsWith(".gif") ? "image/gif" : "image/webp";
}

async function readCatalog() {
    const source = await fs.readFile(path.join(root, "js/project.js"), "utf8");
    const start = source.indexOf("const projects = {");
    const end = source.indexOf("const projectData =", start);
    if (start < 0 || end < 0) throw new Error("Project catalog was not found.");
    return Object.values(vm.runInNewContext(`${source.slice(start, end)}; projects;`));
}

async function buildPlan() {
    const projects = await readCatalog();
    const plan = [];
    for (const project of projects) {
        const folder = path.join(root, "assets/projects", project.slug);
        const manifest = JSON.parse(await fs.readFile(path.join(folder, "manifest.json"), "utf8"));
        const images = [];
        if (covers[project.slug]) images.push({ category: "cover", relative: covers[project.slug], order: 1 });
        for (const category of categories) {
            for (const [index, filename] of (manifest[category] || []).entries()) {
                const absolute = path.resolve(folder, filename);
                if (!absolute.startsWith(`${folder}${path.sep}`)) throw new Error(`Invalid gallery path: ${filename}`);
                images.push({ category, relative: path.relative(root, absolute), order: index + 1 });
            }
        }
        for (const image of images) {
            image.absolute = path.resolve(root, image.relative);
            const size = (await fs.stat(image.absolute)).size;
            if (size > 10 * 1024 * 1024) throw new Error(`${image.relative} exceeds the 10 MB upload limit.`);
        }
        plan.push({ project, images });
    }
    return plan;
}

async function readToken() {
    if (!process.stdin.isTTY) throw new Error("Run --execute in an interactive terminal to enter the admin token privately.");
    process.stdout.write("Admin token (hidden): ");
    process.stdin.setRawMode(true);
    process.stdin.resume();
    return new Promise((resolve, reject) => {
        let value = "";
        const onData = (chunk) => {
            const character = chunk.toString("utf8");
            if (character === "\u0003") {
                process.stdin.setRawMode(false);
                process.stdin.pause();
                reject(new Error("Cancelled."));
            } else if (character === "\r" || character === "\n") {
                process.stdin.off("data", onData);
                process.stdin.setRawMode(false);
                process.stdin.pause();
                process.stdout.write("\n");
                resolve(value.trim());
            } else if (character === "\u007f") {
                value = value.slice(0, -1);
            } else {
                value += character;
            }
        };
        process.stdin.on("data", onData);
    });
}

async function api(token, endpoint, options = {}) {
    const response = await fetch(`${origin}${endpoint}`, {
        ...options,
        headers: { ...options.headers, authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(`${endpoint}: ${data.error || response.status}`);
    return data;
}

function payload(project, published = false) {
    return {
        slug: project.slug,
        index: project.project_index || project.index,
        name: project.name,
        fullName: project.full_name || project.fullName,
        client: project.client,
        year: project.year,
        type: project.type,
        status: project.status,
        kind: project.kind,
        category: project.category,
        description: project.description,
        published
    };
}

async function upload(token, project, image) {
    const bytes = await fs.readFile(image.absolute);
    const form = new FormData();
    form.append("file", new Blob([bytes], { type: contentType(image.relative) }), path.basename(image.relative));
    form.append("category", image.category);
    form.append("alt", `${project.fullName} ${image.category === "cover" ? "cover" : image.category.replaceAll("-", " ")}`);
    form.append("importName", image.relative.replaceAll("\\", "/"));
    form.append("sortOrder", String(image.order));
    return api(token, `/api/admin/projects/${encodeURIComponent(project.slug)}/images`, { method: "POST", body: form });
}

async function main() {
    const plan = await buildPlan();
    const imageCount = plan.reduce((count, entry) => count + entry.images.length, 0);
    process.stdout.write(`Validated ${plan.length} projects and ${imageCount} image uploads (${imageCount - Object.keys(covers).length} gallery, ${Object.keys(covers).length} covers).\n`);
    if (!execute) {
        process.stdout.write("Dry run only. Use --execute after the updated Worker is deployed.\n");
        return;
    }

    const token = await readToken();
    if (!token) throw new Error("No admin token entered.");
    const existing = new Map((await api(token, "/api/admin/projects")).map((project) => [project.slug, project]));
    for (const { project, images } of plan) {
        if (!existing.has(project.slug)) {
            await api(token, "/api/admin/projects", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(payload(project))
            });
        }
        for (const [index, image] of images.entries()) {
            await upload(token, project, image);
            process.stdout.write(`\r${project.slug}: ${index + 1}/${images.length} images`);
        }
        process.stdout.write(`\n`);
    }

    // Publish last so the homepage keeps its static fallback during uploads.
    for (const { project, images } of plan) {
        if (!images.length || existing.get(project.slug)?.published) continue;
        await api(token, `/api/admin/projects/${encodeURIComponent(project.slug)}`, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload(existing.get(project.slug) || project, true))
        });
        process.stdout.write(`Published ${project.slug}.\n`);
    }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
