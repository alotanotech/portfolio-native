import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import worker from "../src/worker.mjs";

const database = new DatabaseSync(":memory:");
database.exec(`
    CREATE TABLE projects (id INTEGER PRIMARY KEY, slug TEXT, project_index TEXT, name TEXT, full_name TEXT, client TEXT, year TEXT, type TEXT, status TEXT, kind TEXT, category TEXT, description TEXT, published INTEGER);
    CREATE TABLE project_images (id INTEGER PRIMARY KEY, project_id INTEGER, category TEXT, object_key TEXT, alt_text TEXT, sort_order INTEGER);
    INSERT INTO projects VALUES (1, 'sample', '01', 'SAMPLE', 'Sample', 'Client', '2026', 'DESIGN', 'ARCHIVE', 'client', 'Client', '', 1);
    INSERT INTO projects VALUES (2, 'other', '02', 'OTHER', 'Other', 'Client', '2026', 'DESIGN', 'ARCHIVE', 'client', 'Client', '', 1);
    INSERT INTO project_images VALUES (11, 1, 'social-post', 'sample/a.webp', 'First', 1);
    INSERT INTO project_images VALUES (12, 1, 'social-post', 'sample/b.webp', 'Second', 2);
    INSERT INTO project_images VALUES (13, 1, 'cover', 'sample/cover.webp', 'Cover', 1);
    INSERT INTO project_images VALUES (15, 1, 'cover', 'sample/new-cover.webp', 'New cover', 2);
    INSERT INTO project_images VALUES (14, 2, 'social-post', 'other/x.webp', 'Other', 1);
`);

const storedImages = new Set(["sample/a.webp", "sample/b.webp", "sample/cover.webp", "sample/new-cover.webp", "other/x.webp"]);
const env = {
    ADMIN_TOKEN: "test-token",
    MEDIA: {
        async get(key) {
            return storedImages.has(key)
                ? { body: new Blob(["stored image"]).stream(), httpMetadata: { contentType: "image/webp" } }
                : null;
        },
        async put(key) { storedImages.add(key); return { key }; },
        async delete(key) { storedImages.delete(key); return { key }; }
    },
    DB: {
        prepare(sql) {
            const statement = database.prepare(sql);
            return {
                bind(...values) {
                    return {
                        async first() { return statement.get(...values) || null; },
                        async all() { return { results: statement.all(...values) }; },
                        async run() { return { meta: statement.run(...values) }; }
                    };
                },
                async all() { return { results: statement.all() }; }
            };
        }
    }
};

const url = (path) => `https://example.com${path}`;
const request = (path, method = "GET", body, authorized = true) => new Request(url(path), {
    method,
    headers: authorized ? { authorization: "Bearer test-token", "content-type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined
});

const list = await worker.fetch(request("/api/admin/projects/sample/images"), env);
assert.equal(list.status, 200);
assert.deepEqual((await list.json()).map((image) => image.id), [13, 15, 11, 12]);

const unauthorized = await worker.fetch(request("/api/admin/projects/sample/images/order", "PUT", { category: "social-post", ids: [12, 11] }, false), env);
assert.equal(unauthorized.status, 401);

const foreign = await worker.fetch(request("/api/admin/projects/sample/images/order", "PUT", { category: "social-post", ids: [14, 11] }), env);
assert.equal(foreign.status, 409);

const incomplete = await worker.fetch(request("/api/admin/projects/sample/images/order", "PUT", { category: "social-post", ids: [11] }), env);
assert.equal(incomplete.status, 409);

const reordered = await worker.fetch(request("/api/admin/projects/sample/images/order", "PUT", { category: "social-post", ids: [12, 11] }), env);
assert.equal(reordered.status, 200);
const project = await worker.fetch(request("/api/projects/sample", "GET", undefined, false), env).then((response) => response.json());
assert.deepEqual(project.manifest.categories["social-post"].map((image) => image.alt), ["Second", "First"]);
assert.equal(project.cover, "/media/sample/new-cover.webp");
const publicList = await worker.fetch(request("/api/projects", "GET", undefined, false), env).then((response) => response.json());
assert.equal(publicList[0].cover, project.cover);

const coverOrder = await worker.fetch(request("/api/admin/projects/sample/images/order", "PUT", { category: "cover", ids: [15, 13] }), env);
assert.equal(coverOrder.status, 200);
const changedCover = await worker.fetch(request("/api/projects/sample", "GET", undefined, false), env).then((response) => response.json());
assert.equal(changedCover.cover, "/media/sample/cover.webp");
const altForm = new FormData();
altForm.set("alt", "Updated accessible description");
const editRequest = (body) => new Request(url("/api/admin/images/11"), { method: "PUT", headers: { authorization: "Bearer test-token" }, body });
const altUpdate = await worker.fetch(editRequest(altForm), env);
assert.equal(altUpdate.status, 200);
assert.equal(database.prepare("SELECT alt_text FROM project_images WHERE id = 11").get().alt_text, "Updated accessible description");
const replacementForm = new FormData();
replacementForm.set("alt", "Replacement image");
replacementForm.set("file", new File(["image bytes"], "new.webp", { type: "image/webp" }));
const replacement = await worker.fetch(editRequest(replacementForm), env);
assert.equal(replacement.status, 200);
const replacementRecord = database.prepare("SELECT object_key, category, sort_order, alt_text FROM project_images WHERE id = 11").get();
assert.match(replacementRecord.object_key, /^sample\/[a-f0-9-]+\.webp$/);
assert.equal(replacementRecord.category, "social-post");
assert.equal(replacementRecord.sort_order, 2);
assert.equal(replacementRecord.alt_text, "Replacement image");

const invalidCategoryForm = new FormData();
invalidCategoryForm.set("category", "not-a-category");
assert.equal((await worker.fetch(editRequest(invalidCategoryForm), env)).status, 400);

const moveForm = new FormData();
moveForm.set("category", "other");
moveForm.set("alt", "Moved to other");
assert.equal((await worker.fetch(new Request(url("/api/admin/images/12"), {
    method: "PUT", headers: { authorization: "Bearer test-token" }, body: moveForm
}), env)).status, 200);
const moved = database.prepare("SELECT category, sort_order, object_key FROM project_images WHERE id = 12").get();
assert.equal(moved.category, "other");
assert.equal(moved.sort_order, 1);
assert.equal(moved.object_key, "sample/b.webp");

const coverForm = new FormData();
coverForm.set("category", "cover");
coverForm.set("alt", "Featured from gallery");
const coverResponse = await worker.fetch(editRequest(coverForm), env);
assert.equal(coverResponse.status, 200);
assert.equal((await coverResponse.json()).coverCreated, true);
const galleryOriginal = database.prepare("SELECT category, object_key FROM project_images WHERE id = 11").get();
assert.equal(galleryOriginal.category, "social-post");
assert.equal(galleryOriginal.object_key, replacementRecord.object_key);
const selectedCover = database.prepare("SELECT object_key, alt_text FROM project_images WHERE category = 'cover' ORDER BY sort_order DESC LIMIT 1").get();
assert.notEqual(selectedCover.object_key, galleryOriginal.object_key);
assert.equal(selectedCover.alt_text, "Featured from gallery");
assert.ok(storedImages.has(selectedCover.object_key));
const updatedPublicProject = await worker.fetch(request("/api/projects/sample", "GET", undefined, false), env).then((response) => response.json());
assert.equal(updatedPublicProject.cover, `/media/${selectedCover.object_key}`);
assert.deepEqual(updatedPublicProject.manifest.categories["social-post"].map((image) => image.alt), ["Replacement image"]);

const customCategory = await worker.fetch(request("/api/admin/projects", "POST", {
    slug: "custom-category", index: "03", name: "CUSTOM", fullName: "Custom category project",
    client: "Personal project", year: "2026", type: "PERSONAL WORK", status: "ARCHIVE",
    kind: "personal", category: "Brand identity", description: "Custom project label", published: true
}), env);
assert.equal(customCategory.status, 201);
const customProject = await worker.fetch(request("/api/projects/custom-category", "GET", undefined, false), env).then((response) => response.json());
assert.equal(customProject.category, "Brand identity");

const photography = await worker.fetch(request("/api/admin/projects", "POST", {
    slug: "portrait-series", index: "04", name: "PORTRAITS", fullName: "Portrait series",
    client: "Personal project", year: "2026", type: "PHOTOGRAPHY", status: "ARCHIVE",
    kind: "Photography", category: "Portraits", description: "A photography project", published: true
}), env);
assert.equal(photography.status, 201);
const photoProject = await worker.fetch(request("/api/projects/portrait-series", "GET", undefined, false), env).then((response) => response.json());
assert.equal(photoProject.kind, "photography");
assert.equal(photoProject.category, "Portraits");

const futureSection = await worker.fetch(request("/api/admin/projects", "POST", {
    slug: "motion-study", index: "05", name: "MOTION", fullName: "Motion study",
    client: "Personal project", year: "2026", type: "MOTION DESIGN WORK", status: "ARCHIVE",
    kind: "Motion Design", category: "Experiments", description: "A future section", published: true
}), env);
assert.equal(futureSection.status, 201);
const motionProject = await worker.fetch(request("/api/projects/motion-study", "GET", undefined, false), env).then((response) => response.json());
assert.equal(motionProject.kind, "motion-design");

console.log("Admin image listing, authorization, reorder, category moves, cover selection and public gallery order passed.");
