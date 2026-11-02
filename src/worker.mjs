const CATEGORIES = ["social-post", "story", "square", "landscape", "other"];

function imageCategory(value) {
    const raw = String(value || "").trim();
    if (!raw || raw.length > 80) return "";
    return cleanSlug(raw.normalize("NFKD").replace(/[\u0300-\u036f]/g, ""));
}

const json = (data, status = 200) => new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
});

const error = (message, status = 400) => json({ error: message }, status);

function authorized(request, env) {
    return Boolean(env.ADMIN_TOKEN) && request.headers.get("authorization") === `Bearer ${env.ADMIN_TOKEN}`;
}

function cleanSlug(value) {
    return String(value || "").toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
}

function savedCategoryOrder(value) {
    try {
        const order = JSON.parse(value || "[]");
        return Array.isArray(order) ? order.filter((category) => typeof category === "string") : [];
    } catch {
        return [];
    }
}

function projectPayload(project, images = []) {
    const categories = Object.fromEntries(CATEGORIES.map((category) => [category, []]));
    const coverImage = images.filter((image) => image.category === "cover").at(-1);
    const firstImage = images.find((image) => image.category !== "cover");
    const coverKey = coverImage?.object_key || project.cover_key || firstImage?.object_key;
    images.forEach((image) => {
        if (image.category !== "cover") {
            if (!Object.hasOwn(categories, image.category)) categories[image.category] = [];
            categories[image.category].push({ src: `/media/${image.object_key}`, alt: image.alt_text || "" });
        }
    });

    return {
        index: project.project_index,
        slug: project.slug,
        name: project.name,
        fullName: project.full_name,
        client: project.client,
        year: project.year,
        type: project.type,
        status: project.status,
        kind: project.kind,
        category: project.category,
        description: project.description,
        cover: coverKey ? `/media/${coverKey}` : null,
        manifest: { cover: coverKey ? `/media/${coverKey}` : null, categories, categoryOrder: savedCategoryOrder(project.gallery_category_order) }
    };
}

async function readBody(request) {
    const data = await request.json();
    const slug = cleanSlug(data.slug);
    const kind = cleanSlug(String(data.kind || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, ""));
    if (!slug || !data.name || !data.year || !data.type) throw new Error("Slug, name, year, and type are required.");
    if (!kind || kind.length > 80) throw new Error("Portfolio section is required (up to 80 characters).");

    return {
        slug,
        project_index: String(data.index || "00"),
        name: String(data.name).trim(),
        full_name: String(data.fullName || data.name).trim(),
        client: String(data.client || "PERSONAL PROJECT").trim(),
        year: String(data.year).trim(),
        type: String(data.type).trim(),
        status: String(data.status || "ARCHIVE").trim(),
        kind,
        category: String(data.category || "Personal").trim(),
        description: String(data.description || "").trim(),
        published: data.published ? 1 : 0
    };
}

async function getProject(env, slug, includeDraft = false) {
    const query = includeDraft
        ? "SELECT * FROM projects WHERE slug = ?"
        : "SELECT * FROM projects WHERE slug = ? AND published = 1";
    const project = await env.DB.prepare(query).bind(slug).first();
    if (!project) return null;
    const { results: images } = await env.DB.prepare("SELECT * FROM project_images WHERE project_id = ? ORDER BY category, sort_order, id").bind(project.id).all();
    return { project, images };
}

async function publicApi(request, env, pathname) {
    const slug = pathname.match(/^\/api\/projects\/([^/]+)$/)?.[1];
    if (slug) {
        const record = await getProject(env, decodeURIComponent(slug));
        return record ? json(projectPayload(record.project, record.images)) : error("Project not found.", 404);
    }

    if (pathname === "/api/projects") {
        const { results } = await env.DB.prepare(`SELECT p.project_index, p.slug, p.name, p.full_name, p.client, p.year, p.type, p.status, p.kind, p.category, p.description,
            (SELECT object_key FROM project_images WHERE project_id = p.id ORDER BY CASE WHEN category = 'cover' THEN 0 ELSE 1 END,
                CASE WHEN category = 'cover' THEN -sort_order ELSE sort_order END, id DESC LIMIT 1) AS cover_key
            FROM projects p WHERE p.published = 1 ORDER BY p.project_index, p.id`).all();
        return json(results.map((project) => projectPayload(project)));
    }

    return null;
}

async function adminApi(request, env, pathname) {
    if (!authorized(request, env)) return error("Unauthorized.", 401);

    if (pathname === "/api/admin/projects" && request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM projects ORDER BY project_index, id").all();
        return json(results);
    }

    if (pathname === "/api/admin/projects" && request.method === "POST") {
        try {
            const data = await readBody(request);
            const result = await env.DB.prepare(`INSERT INTO projects (slug, project_index, name, full_name, client, year, type, status, kind, category, description, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
                .bind(data.slug, data.project_index, data.name, data.full_name, data.client, data.year, data.type, data.status, data.kind, data.category, data.description, data.published).run();
            return json({ id: result.meta.last_row_id, slug: data.slug }, 201);
        } catch (cause) {
            return error(cause.message || "Could not create project.");
        }
    }

    if (pathname === "/api/admin/projects/order" && request.method === "PUT") {
        let body;
        try { body = await request.json(); } catch { return error("Invalid JSON body."); }
        const slugs = body?.slugs;
        if (!Array.isArray(slugs) || slugs.length > 200 ||
            !slugs.every((slug) => typeof slug === "string" && cleanSlug(slug) === slug && slug.length > 0) ||
            new Set(slugs).size !== slugs.length) {
            return error("Provide the ordered project slugs without duplicates.");
        }
        const { results } = await env.DB.prepare("SELECT slug FROM projects ORDER BY project_index, id").all();
        if (results.length !== slugs.length || results.some((project) => !slugs.includes(project.slug))) {
            return error("Project list changed. Refresh before reordering.", 409);
        }
        if (slugs.length) {
            const cases = slugs.map(() => "WHEN ? THEN ?").join(" ");
            const placeholders = slugs.map(() => "?").join(", ");
            const values = slugs.flatMap((slug, index) => [slug, String(index + 1).padStart(2, "0")]);
            await env.DB.prepare(`UPDATE projects SET project_index = CASE slug ${cases} END, updated_at = CURRENT_TIMESTAMP WHERE slug IN (${placeholders})`)
                .bind(...values, ...slugs).run();
        }
        return json({ slugs });
    }

    const projectMatch = pathname.match(/^\/api\/admin\/projects\/([^/]+)$/);
    if (projectMatch && request.method === "PUT") {
        try {
            const data = await readBody(request);
            const result = await env.DB.prepare(`UPDATE projects SET slug = ?, project_index = ?, name = ?, full_name = ?, client = ?, year = ?, type = ?, status = ?, kind = ?, category = ?, description = ?, published = ?, updated_at = CURRENT_TIMESTAMP WHERE slug = ?`)
                .bind(data.slug, data.project_index, data.name, data.full_name, data.client, data.year, data.type, data.status, data.kind, data.category, data.description, data.published, decodeURIComponent(projectMatch[1])).run();
            return result.meta.changes ? json({ slug: data.slug }) : error("Project not found.", 404);
        } catch (cause) {
            return error(cause.message || "Could not update project.");
        }
    }

    if (projectMatch && request.method === "DELETE") {
        const record = await getProject(env, decodeURIComponent(projectMatch[1]), true);
        if (!record) return error("Project not found.", 404);
        await Promise.all(record.images.map((image) => env.MEDIA.delete(image.object_key)));
        await env.DB.prepare("DELETE FROM projects WHERE id = ?").bind(record.project.id).run();
        return json({ deleted: true });
    }

    const imagesMatch = pathname.match(/^\/api\/admin\/projects\/([^/]+)\/images$/);
    if (imagesMatch && request.method === "GET") {
        const record = await getProject(env, decodeURIComponent(imagesMatch[1]), true);
        if (!record) return error("Project not found.", 404);
        return json(record.images.map((image) => ({
            id: image.id,
            category: image.category,
            alt: image.alt_text,
            order: image.sort_order,
            url: `/media/${image.object_key}`
        })));
    }

    const categoryOrderMatch = pathname.match(/^\/api\/admin\/projects\/([^/]+)\/categories\/order$/);
    if (categoryOrderMatch && request.method === "PUT") {
        const project = await env.DB.prepare("SELECT id FROM projects WHERE slug = ?")
            .bind(decodeURIComponent(categoryOrderMatch[1])).first();
        if (!project) return error("Project not found.", 404);
        let body;
        try { body = await request.json(); } catch { return error("Invalid JSON body."); }
        const categories = body?.categories;
        if (!Array.isArray(categories) || categories.length > 100 ||
            !categories.every((category) => typeof category === "string" && category !== "cover" && imageCategory(category) === category) ||
            new Set(categories).size !== categories.length) {
            return error("Provide the ordered gallery categories without duplicates.");
        }
        const { results } = await env.DB.prepare("SELECT DISTINCT category FROM project_images WHERE project_id = ? AND category != 'cover'")
            .bind(project.id).all();
        if (results.length !== categories.length || results.some((image) => !categories.includes(image.category))) {
            return error("Gallery categories changed. Refresh before reordering.", 409);
        }
        await env.DB.prepare("UPDATE projects SET gallery_category_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
            .bind(JSON.stringify(categories), project.id).run();
        return json({ categoryOrder: categories });
    }

    const orderMatch = pathname.match(/^\/api\/admin\/projects\/([^/]+)\/images\/order$/);
    if (orderMatch && request.method === "PUT") {
        const slug = decodeURIComponent(orderMatch[1]);
        const project = await env.DB.prepare("SELECT id FROM projects WHERE slug = ?").bind(slug).first();
        if (!project) return error("Project not found.", 404);
        let body;
        try { body = await request.json(); } catch { return error("Invalid JSON body."); }
        const category = imageCategory(body.category);
        const ids = body.ids;
        if (!category || !Array.isArray(ids) ||
            !ids.every((id) => Number.isSafeInteger(id) && id > 0) || new Set(ids).size !== ids.length) {
            return error("Provide one category and its ordered image IDs.");
        }
        const { results } = await env.DB.prepare("SELECT id FROM project_images WHERE project_id = ? AND category = ? ORDER BY sort_order, id").bind(project.id, category).all();
        if (results.length !== ids.length || results.some((image) => !ids.includes(image.id))) {
            return error("Image list changed. Refresh before reordering.", 409);
        }
        if (!ids.length) return json({ updated: true });
        const cases = ids.map(() => "WHEN ? THEN ?").join(" ");
        const placeholders = ids.map(() => "?").join(", ");
        const bindings = ids.flatMap((id, index) => [id, index + 1]);
        await env.DB.prepare(`UPDATE project_images SET sort_order = CASE id ${cases} END WHERE project_id = ? AND category = ? AND id IN (${placeholders})`)
            .bind(...bindings, project.id, category, ...ids).run();
        return json({ updated: true });
    }

    const uploadMatch = pathname.match(/^\/api\/admin\/projects\/([^/]+)\/images$/);
    if (uploadMatch && request.method === "POST") {
        const form = await request.formData();
        const file = form.get("file");
        const category = imageCategory(form.get("category") || "other");
        const project = await env.DB.prepare("SELECT id FROM projects WHERE slug = ?").bind(decodeURIComponent(uploadMatch[1])).first();
        if (!project) return error("Project not found.", 404);
        if (!(file instanceof File) || !file.size || !file.type.startsWith("image/")) return error("Upload one image file.");
        if (!category) return error("Image group is required (up to 80 characters).");
        if (file.size > 10 * 1024 * 1024) return error("Images must be 10 MB or smaller.");

        const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "webp";
        const importName = String(form.get("importName") || "");
        const digest = importName ? await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${category}/${importName}`)) : null;
        const hash = digest ? Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("") : null;
        const objectKey = hash ? `${decodeURIComponent(uploadMatch[1])}/import/${hash}.${extension}` : `${decodeURIComponent(uploadMatch[1])}/${crypto.randomUUID()}.${extension}`;
        const existing = hash ? await env.DB.prepare("SELECT id FROM project_images WHERE object_key = ?").bind(objectKey).first() : null;
        if (existing) return json({ id: existing.id, url: `/media/${objectKey}`, existing: true });
        const order = await env.DB.prepare("SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM project_images WHERE project_id = ? AND category = ?").bind(project.id, category).first();
        const requestedOrder = Number(form.get("sortOrder"));
        const sortOrder = importName && Number.isInteger(requestedOrder) && requestedOrder > 0 ? requestedOrder : order.next_order;
        await env.MEDIA.put(objectKey, file.stream(), { httpMetadata: { contentType: file.type } });
        const result = await env.DB.prepare("INSERT INTO project_images (project_id, category, object_key, alt_text, sort_order) VALUES (?, ?, ?, ?, ?)")
            .bind(project.id, category, objectKey, String(form.get("alt") || ""), sortOrder).run();
        return json({ id: result.meta.last_row_id, url: `/media/${objectKey}` }, 201);
    }

    const imageMatch = pathname.match(/^\/api\/admin\/images\/(\d+)$/);
    if (imageMatch && request.method === "PUT") {
        const image = await env.DB.prepare("SELECT project_id, category, object_key, sort_order FROM project_images WHERE id = ?").bind(imageMatch[1]).first();
        if (!image) return error("Image not found.", 404);
        const form = await request.formData();
        const file = form.get("file");
        const alt = String(form.get("alt") || "");
        const category = imageCategory(form.get("category") || image.category);
        if (!category) return error("Image group is required (up to 80 characters).");
        if (file && (!(file instanceof File) || !file.size || !file.type.startsWith("image/"))) return error("Upload one image file.");
        if (file && file.size > 10 * 1024 * 1024) return error("Images must be 10 MB or smaller.");
        const order = category !== image.category || category === "cover"
            ? await env.DB.prepare("SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM project_images WHERE project_id = ? AND category = ?").bind(image.project_id, category).first()
            : null;
        const sortOrder = order?.next_order || image.sort_order;
        const projectFolder = image.object_key.split("/")[0];

        // A gallery image selected as cover remains in its gallery category.
        if (category === "cover" && image.category !== "cover") {
            const source = file ? null : await env.MEDIA.get(image.object_key);
            if (!file && !source) return error("Original image not found in storage.", 404);
            const extension = file
                ? file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "webp"
                : image.object_key.split(".").pop();
            const objectKey = `${projectFolder}/${crypto.randomUUID()}.${extension}`;
            await env.MEDIA.put(objectKey, file ? file.stream() : source.body, {
                httpMetadata: { contentType: file?.type || source?.httpMetadata?.contentType || "image/webp" }
            });
            try {
                const result = await env.DB.prepare("INSERT INTO project_images (project_id, category, object_key, alt_text, sort_order) VALUES (?, 'cover', ?, ?, ?)")
                    .bind(image.project_id, objectKey, alt, sortOrder).run();
                return json({ updated: true, coverCreated: true, id: result.meta.last_row_id, url: `/media/${objectKey}` });
            } catch (cause) {
                await env.MEDIA.delete(objectKey);
                throw cause;
            }
        }

        if (!file) {
            await env.DB.prepare("UPDATE project_images SET category = ?, sort_order = ?, alt_text = ? WHERE id = ?")
                .bind(category, sortOrder, alt, imageMatch[1]).run();
            return json({ updated: true });
        }
        const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "webp";
        const objectKey = `${projectFolder}/${crypto.randomUUID()}.${extension}`;
        await env.MEDIA.put(objectKey, file.stream(), { httpMetadata: { contentType: file.type } });
        try {
            await env.DB.prepare("UPDATE project_images SET object_key = ?, category = ?, sort_order = ?, alt_text = ? WHERE id = ?")
                .bind(objectKey, category, sortOrder, alt, imageMatch[1]).run();
        } catch (cause) {
            await env.MEDIA.delete(objectKey);
            throw cause;
        }
        await env.MEDIA.delete(image.object_key);
        return json({ updated: true, url: `/media/${objectKey}` });
    }
    if (imageMatch && request.method === "DELETE") {
        const image = await env.DB.prepare("SELECT object_key FROM project_images WHERE id = ?").bind(imageMatch[1]).first();
        if (!image) return error("Image not found.", 404);
        await env.MEDIA.delete(image.object_key);
        await env.DB.prepare("DELETE FROM project_images WHERE id = ?").bind(imageMatch[1]).run();
        return json({ deleted: true });
    }

    return error("Not found.", 404);
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname.startsWith("/api/admin/")) return adminApi(request, env, url.pathname);
        if (url.pathname.startsWith("/api/")) return (await publicApi(request, env, url.pathname)) || error("Not found.", 404);

        if (url.pathname.startsWith("/media/")) {
            const object = await env.MEDIA.get(decodeURIComponent(url.pathname.slice(7)));
            return object ? new Response(object.body, { headers: { "content-type": object.httpMetadata?.contentType || "application/octet-stream", "cache-control": "public, max-age=31536000, immutable" } }) : error("Image not found.", 404);
        }

        if (url.pathname === "/admin") return env.ASSETS.fetch(new Request(new URL("/admin/index.html", request.url), request));
        return env.ASSETS.fetch(request);
    }
};
