const tokenInput = document.getElementById("token");
const status = document.getElementById("status");
const accessPanel = document.getElementById("access-panel");
const workspace = document.getElementById("workspace");
const projectList = document.getElementById("project-list");
const projectCount = document.getElementById("project-count");
const projectSearch = document.getElementById("project-search");
const projectForm = document.getElementById("project-form");
const editorTitle = document.getElementById("editor-title");
const projectPreview = document.getElementById("project-preview");
const dangerZone = document.getElementById("danger-zone");
const mediaContext = document.getElementById("media-context");
const mediaCount = document.getElementById("media-count");
const mediaList = document.getElementById("media-list");
const uploadForm = document.getElementById("upload-form");

const labels = {
    cover: "Cover",
    "social-post": "Social media posts",
    story: "Stories",
    square: "Square posts",
    landscape: "Landscape",
    other: "Other"
};

let projects = [];
let images = [];
let editingSlug = null;

tokenInput.value = sessionStorage.getItem("portfolio-admin-token") || "";

function setStatus(message, isError = false) {
    status.textContent = message;
    status.classList.toggle("is-error", isError);
}

async function request(path, options = {}) {
    const token = tokenInput.value.trim();
    if (!token) throw new Error("Enter your admin token first.");
    const response = await fetch(path, {
        ...options,
        headers: { ...options.headers, authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`);
    return data;
}

function renderProjects() {
    const search = projectSearch.value.trim().toLowerCase();
    projectCount.textContent = String(projects.length);
    projectList.replaceChildren();

    for (const project of projects.filter((item) => `${item.name} ${item.slug}`.toLowerCase().includes(search))) {
        const button = document.createElement("button");
        const number = document.createElement("span");
        const detail = document.createElement("span");
        const name = document.createElement("span");
        const meta = document.createElement("span");
        button.type = "button";
        button.className = `project-option${editingSlug === project.slug ? " is-active" : ""}`;
        button.setAttribute("aria-current", editingSlug === project.slug ? "true" : "false");
        number.className = "project-number";
        number.textContent = project.project_index;
        name.className = "project-name";
        name.textContent = project.full_name || project.name;
        meta.className = "project-meta";
        meta.textContent = `${project.kind === "client" ? "Client" : "Personal"} · ${project.published ? "Published" : "Draft"}`;
        detail.append(name, meta);
        button.append(number, detail);
        button.addEventListener("click", () => selectProject(project.slug));
        projectList.append(button);
    }

    if (!projectList.children.length) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = search ? "No projects match that search." : "No projects yet. Create your first one.";
        projectList.append(empty);
    }
}

function resetEditor() {
    editingSlug = null;
    images = [];
    projectForm.reset();
    projectForm.elements.index.value = String(projects.length + 1).padStart(2, "0");
    editorTitle.textContent = "New project";
    document.getElementById("save-project").textContent = "Create project";
    document.getElementById("cancel-edit").textContent = "Reset form";
    projectPreview.hidden = true;
    dangerZone.hidden = true;
    uploadForm.hidden = true;
    mediaContext.textContent = "Save a project first, then add its cover and gallery images. The cover is separate from gallery categories.";
    mediaCount.textContent = "0 images";
    mediaList.replaceChildren();
    renderProjects();
}

async function selectProject(slug) {
    const project = projects.find((item) => item.slug === slug);
    if (!project) return;
    editingSlug = slug;
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
    editorTitle.textContent = project.full_name || project.name;
    document.getElementById("save-project").textContent = "Save changes";
    document.getElementById("cancel-edit").textContent = "Cancel changes";
    projectPreview.href = `/pages/project.html?project=${encodeURIComponent(slug)}`;
    projectPreview.hidden = !project.published;
    dangerZone.hidden = false;
    uploadForm.hidden = false;
    mediaContext.textContent = `Managing images for ${project.full_name || project.name}. Upload a new cover to make it the active one.`;
    renderProjects();
    mediaList.replaceChildren();
    mediaCount.textContent = "Loading…";
    try {
        await loadImages(slug);
    } catch (error) {
        setStatus(error.message, true);
    }
}

async function loadProjects(preferredSlug = editingSlug) {
    projects = await request("/api/admin/projects");
    workspace.hidden = false;
    accessPanel.hidden = true;
    sessionStorage.setItem("portfolio-admin-token", tokenInput.value.trim());
    setStatus(`${projects.length} projects loaded.`);
    if (preferredSlug && projects.some((project) => project.slug === preferredSlug)) {
        await selectProject(preferredSlug);
    } else if (projects.length) {
        await selectProject(projects[0].slug);
    } else {
        resetEditor();
    }
}

function mediaButton(label, text, onClick, disabled = false, className = "order-button") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = text;
    button.setAttribute("aria-label", label);
    button.disabled = disabled;
    button.addEventListener("click", onClick);
    return button;
}

function renderImages() {
    mediaList.replaceChildren();
    mediaCount.textContent = `${images.length} image${images.length === 1 ? "" : "s"}`;
    if (!images.length) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = "No images yet. Upload a cover, then add gallery images in the category you want visitors to browse.";
        mediaList.append(empty);
        return;
    }

    for (const [category, label] of Object.entries(labels)) {
        const items = images.filter((image) => image.category === category);
        if (!items.length) continue;
        const group = document.createElement("section");
        const heading = document.createElement("div");
        const title = document.createElement("h3");
        const count = document.createElement("span");
        const grid = document.createElement("div");
        group.className = "media-group";
        heading.className = "media-group-heading";
        title.textContent = label;
        count.textContent = `${items.length} image${items.length === 1 ? "" : "s"}`;
        grid.className = "media-grid";
        heading.append(title, count);

        items.forEach((image, index) => {
            const card = document.createElement("article");
            const preview = document.createElement("img");
            const body = document.createElement("div");
            const caption = document.createElement("p");
            const actions = document.createElement("div");
            card.className = "media-item";
            preview.src = image.url;
            preview.alt = image.alt || `${label} image ${index + 1}`;
            preview.loading = "lazy";
            body.className = "media-item-body";
            caption.textContent = `${category === "cover" && index === items.length - 1 ? "ACTIVE COVER · " : ""}${String(index + 1).padStart(2, "0")} / ${image.alt || "No alt text"}`;
            actions.className = "media-actions";
            actions.append(
                mediaButton(`Move ${label} image ${index + 1} earlier`, "↑", () => moveImage(category, index, -1), index === 0),
                mediaButton(`Move ${label} image ${index + 1} later`, "↓", () => moveImage(category, index, 1), index === items.length - 1),
                mediaButton(`Delete ${label} image ${index + 1}`, "Remove", () => removeImage(image), false, "remove-image")
            );
            body.append(caption, actions);
            card.append(preview, body);
            grid.append(card);
        });
        group.append(heading, grid);
        mediaList.append(group);
    }
}

async function loadImages(slug) {
    const records = await request(`/api/admin/projects/${encodeURIComponent(slug)}/images`);
    if (editingSlug !== slug) return;
    images = records;
    renderImages();
}

async function moveImage(category, index, direction) {
    const slug = editingSlug;
    const categoryImages = images.filter((image) => image.category === category);
    const next = index + direction;
    if (!slug || next < 0 || next >= categoryImages.length) return;
    const ids = categoryImages.map((image) => image.id);
    [ids[index], ids[next]] = [ids[next], ids[index]];
    mediaList.querySelectorAll("button").forEach((button) => { button.disabled = true; });
    try {
        await request(`/api/admin/projects/${encodeURIComponent(slug)}/images/order`, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ category, ids })
        });
        await loadImages(slug);
        setStatus(`${labels[category]} order saved.`);
    } catch (error) {
        await loadImages(slug).catch(() => {});
        setStatus(error.message, true);
    }
}

async function removeImage(image) {
    if (!editingSlug || !confirm(`Delete this ${labels[image.category]} image? This permanently removes its R2 file and cannot be undone.`)) return;
    const slug = editingSlug;
    try {
        await request(`/api/admin/images/${image.id}`, { method: "DELETE" });
        await loadImages(slug);
        setStatus("Image removed.");
    } catch (error) {
        setStatus(error.message, true);
    }
}

document.getElementById("access-form").addEventListener("submit", (event) => {
    event.preventDefault();
    loadProjects().catch((error) => setStatus(error.message, true));
});

document.getElementById("new-project").addEventListener("click", () => {
    resetEditor();
    projectForm.elements.slug.focus();
    setStatus("New draft ready.");
});

document.getElementById("cancel-edit").addEventListener("click", () => {
    if (editingSlug) selectProject(editingSlug);
    else resetEditor();
    setStatus("Unsaved changes discarded.");
});

document.getElementById("lock-studio").addEventListener("click", () => {
    sessionStorage.removeItem("portfolio-admin-token");
    tokenInput.value = "";
    projects = [];
    images = [];
    editingSlug = null;
    workspace.hidden = true;
    accessPanel.hidden = false;
    setStatus("Studio locked for this browser session.");
    tokenInput.focus();
});

projectSearch.addEventListener("input", renderProjects);

projectForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(projectForm);
    const data = Object.fromEntries(form);
    data.published = form.get("published") === "on";
    const previousSlug = editingSlug;
    const submit = document.getElementById("save-project");
    submit.disabled = true;
    try {
        const path = previousSlug ? `/api/admin/projects/${encodeURIComponent(previousSlug)}` : "/api/admin/projects";
        const result = await request(path, {
            method: previousSlug ? "PUT" : "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(data)
        });
        await loadProjects(result.slug);
        setStatus(previousSlug ? "Project updated." : "Project created. Add its cover and gallery images next.");
    } catch (error) {
        setStatus(error.message, true);
    } finally {
        submit.disabled = false;
    }
});

uploadForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!editingSlug) return;
    const slug = editingSlug;
    const form = new FormData(uploadForm);
    const file = form.get("file");
    if (!file || !file.size) return;
    if (file.size > 10 * 1024 * 1024) {
        setStatus("Images must be 10 MB or smaller.", true);
        return;
    }
    const button = uploadForm.querySelector("button[type=submit]");
    button.disabled = true;
    try {
        await request(`/api/admin/projects/${encodeURIComponent(slug)}/images`, { method: "POST", body: form });
        uploadForm.elements.file.value = "";
        uploadForm.elements.alt.value = "";
        await loadImages(slug);
        setStatus("Image uploaded. Its gallery position is saved automatically.");
    } catch (error) {
        setStatus(error.message, true);
    } finally {
        button.disabled = false;
    }
});

document.getElementById("delete-project").addEventListener("click", async () => {
    const project = projects.find((item) => item.slug === editingSlug);
    if (!project || !confirm(`Permanently delete “${project.full_name || project.name}” and every uploaded image? This cannot be undone.`)) return;
    try {
        await request(`/api/admin/projects/${encodeURIComponent(project.slug)}`, { method: "DELETE" });
        editingSlug = null;
        await loadProjects(null);
        setStatus("Project and its images deleted.");
    } catch (error) {
        setStatus(error.message, true);
    }
});

if (tokenInput.value) loadProjects().catch(() => {
    sessionStorage.removeItem("portfolio-admin-token");
    tokenInput.value = "";
    setStatus("Session expired. Enter your admin token again.", true);
});
