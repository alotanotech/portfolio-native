const tokenInput = document.getElementById("token");
const status = document.getElementById("status");
const projectSelect = document.getElementById("project-select");
const projectList = document.getElementById("project-list");
const projectForm = document.getElementById("project-form");
let editingSlug = null;

tokenInput.value = sessionStorage.getItem("portfolio-admin-token") || "";

function setStatus(message) { status.textContent = message; }

async function request(path, options = {}) {
    const token = tokenInput.value.trim();
    if (!token) throw new Error("Enter your admin token first.");
    sessionStorage.setItem("portfolio-admin-token", token);
    const response = await fetch(path, { ...options, headers: { ...(options.headers || {}), authorization: `Bearer ${token}` } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed.");
    return data;
}

async function loadProjects() {
    const projects = await request("/api/admin/projects");
    projectSelect.innerHTML = projects.map((project) => `<option value="${project.slug}">${project.project_index} — ${project.name}</option>`).join("");
    projectList.innerHTML = "";
    projects.forEach((project) => {
        const row = document.createElement("div");
        row.className = "project-row";
        row.innerHTML = `<span>${project.project_index} — ${project.name} (${project.published ? "published" : "draft"})</span>`;
        const remove = document.createElement("button");
        remove.type = "button";
        remove.textContent = "Delete";
        remove.addEventListener("click", async () => {
            if (!confirm(`Delete ${project.name} and its uploaded images?`)) return;
            try { await request(`/api/admin/projects/${encodeURIComponent(project.slug)}`, { method: "DELETE" }); setStatus("Project deleted."); await loadProjects(); } catch (error) { setStatus(error.message); }
        });
        const edit = document.createElement("button");
        edit.type = "button";
        edit.textContent = "Edit";
        edit.addEventListener("click", () => {
            editingSlug = project.slug;
            projectForm.elements.slug.value = project.slug;
            projectForm.elements.index.value = project.project_index;
            projectForm.elements.name.value = project.name;
            projectForm.elements.fullName.value = project.full_name;
            projectForm.elements.client.value = project.client;
            projectForm.elements.year.value = project.year;
            projectForm.elements.type.value = project.type;
            projectForm.elements.category.value = project.category;
            projectForm.elements.status.value = project.status;
            projectForm.elements.kind.value = project.kind;
            projectForm.elements.description.value = project.description;
            projectForm.elements.published.checked = Boolean(project.published);
            projectForm.querySelector("button[type=submit]").textContent = "Save changes";
            projectForm.scrollIntoView({ behavior: "smooth", block: "start" });
            setStatus(`Editing ${project.name}.`);
        });
        row.append(edit, remove); projectList.append(row);
    });
    setStatus(`${projects.length} project(s) loaded.`);
}

document.getElementById("load-projects").addEventListener("click", () => loadProjects().catch((error) => setStatus(error.message)));

projectForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const data = Object.fromEntries(form);
    data.published = form.get("published") === "on";
    try {
        const path = editingSlug ? `/api/admin/projects/${encodeURIComponent(editingSlug)}` : "/api/admin/projects";
        await request(path, { method: editingSlug ? "PUT" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
        event.currentTarget.reset();
        editingSlug = null;
        projectForm.querySelector("button[type=submit]").textContent = "Create project";
        setStatus("Project saved.");
        await loadProjects();
    } catch (error) { setStatus(error.message); }
});

document.getElementById("upload-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try { await request(`/api/admin/projects/${encodeURIComponent(form.get("project"))}/images`, { method: "POST", body: form }); event.currentTarget.reset(); setStatus("Image uploaded."); } catch (error) { setStatus(error.message); }
});
