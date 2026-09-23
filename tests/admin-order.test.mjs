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

const env = {
    ADMIN_TOKEN: "test-token",
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
console.log("Admin image listing, authorization, reorder validation and public gallery order passed.");
