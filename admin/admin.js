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
const projectFilters = [...document.querySelectorAll("[data-project-filter]")];
const galleryFilters = [...document.querySelectorAll("[data-gallery-filter]")];
const galleryFilterBar = document.getElementById("gallery-filters");
const newCoverField = document.getElementById("new-cover-field");
const draftCoverImage = document.getElementById("draft-cover-image");
const draftCoverEmpty = document.getElementById("draft-cover-empty");

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
let projectFilter = "all";
let galleryFilter = "all";
let previewFile = null;
let previewObjectUrl = null;
let savedEditorState = "";

tokenInput.value = sessionStorage.getItem("portfolio-admin-token") || "";

function setStatus(message, isError = false) {
    status.textContent = message;
    status.classList.toggle("is-error", isError);
}

function renderDraftPreview() {
    const form = projectForm.elements;
    const name = form.fullName.value.trim() || form.name.value.trim();
    document.getElementById("draft-title").textContent = name || "Your project title";
    document.getElementById("draft-kind").textContent = form.kind.value.toUpperCase();
    document.getElementById("draft-year").textContent = form.year.value.trim() || "YEAR";
    document.getElementById("draft-type").textContent = form.type.value.trim() || "Project type";
    document.getElementById("draft-description").textContent = form.description.value.trim() || "Your description will appear here as you type.";
    document.getElementById("draft-state").textContent = form.published.checked ? "PUBLISHED · PUBLIC" : "DRAFT · NOT PUBLIC";

    const file = editingSlug
        ? uploadForm.elements.category.value === "cover" ? uploadForm.elements.file.files[0] : null
        : form.newCover.files[0];
    if (file !== previewFile) {
        if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
        previewFile = file || null;
        previewObjectUrl = file ? URL.createObjectURL(file) : null;
    }
    const cover = images.filter((image) => image.category === "cover").at(-1) || images[0];
    const source = previewObjectUrl || cover?.url;
    draftCoverImage.hidden = !source;
    draftCoverEmpty.hidden = Boolean(source);
    if (source) draftCoverImage.src = source;
    else draftCoverImage.removeAttribute("src");

    const gallery = document.getElementById("draft-gallery-images");
    const galleryImages = images.filter((image) => image.category !== "cover").slice(0, 4);
    gallery.replaceChildren();
    if (galleryImages.length) {
        galleryImages.forEach((image) => {
            const thumbnail = document.createElement("img");
            thumbnail.src = image.url;
            thumbnail.alt = image.alt || `${labels[image.category] || "Gallery"} preview`;
            thumbnail.loading = "lazy";
            gallery.append(thumbnail);
        });
    } else {
        const empty = document.createElement("p");
        empty.textContent = "Add images to build this project's gallery.";
        gallery.append(empty);
    }
}

function editorState() {
    const fields = [...projectForm.elements].filter((field) => field.name).map((field) => {
        if (field.type === "checkbox") return [field.name, field.checked];
        if (field.type === "file") return [field.name, field.files[0]?.name || "", field.files[0]?.size || 0];
        return [field.name, field.value];
    });
    const upload = uploadForm.elements.file.files[0];
    return JSON.stringify([...fields, ["pendingUpload", upload?.name || "", upload?.size || 0]]);
}

function hasUnsavedChanges() {
    return Boolean(savedEditorState) && editorState() !== savedEditorState;
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

    const filtered = projects.filter((item) => {
        const matchesSearch = `${item.name} ${item.full_name || ""} ${item.slug}`.toLowerCase().includes(search);
        const matchesKind = projectFilter === "all" || (projectFilter === "draft" ? !item.published : item.kind === projectFilter);
        return matchesSearch && matchesKind;
    });

    for (const project of filtered) {
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
        button.addEventListener("click", () => {
            if (editingSlug === project.slug) return;
            if (hasUnsavedChanges() && !confirm("Discard unsaved project changes?")) return;
            selectProject(project.slug);
        });
        projectList.append(button);
    }

    if (!projectList.children.length) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = projects.length ? "No projects match this view. Try another filter or search." : "No projects yet. Create your first one.";
        projectList.append(empty);
    }
}

function resetEditor() {
    editingSlug = null;
    images = [];
    projectForm.reset();
    uploadForm.reset();
    newCoverField.hidden = false;
    galleryFilterBar.hidden = true;
    galleryFilter = "all";
    galleryFilters.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.galleryFilter === "all")));
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
    renderDraftPreview();
    savedEditorState = editorState();
}

async function selectProject(slug) {
    const project = projects.find((item) => item.slug === slug);
    if (!project) return;
    editingSlug = slug;
    images = [];
    uploadForm.reset();
    projectForm.elements.newCover.value = "";
    newCoverField.hidden = true;
    galleryFilterBar.hidden = false;
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
    renderDraftPreview();
    savedEditorState = editorState();
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
    galleryFilters.forEach((button) => {
        const category = button.dataset.galleryFilter;
        const count = category === "all" ? images.length : images.filter((image) => image.category === category).length;
        button.textContent = `${category === "all" ? "All images" : labels[category]} (${count})`;
        button.setAttribute("aria-pressed", String(category === galleryFilter));
    });
    if (!images.length) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = "No images yet. Upload a cover, then add gallery images in the category you want visitors to browse.";
        mediaList.append(empty);
        return;
    }

    for (const [category, label] of Object.entries(labels)) {
        if (galleryFilter !== "all" && galleryFilter !== category) continue;
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
    if (!mediaList.children.length) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = `No ${labels[galleryFilter]?.toLowerCase() || "gallery"} images yet. Choose this category when uploading an image.`;
        mediaList.append(empty);
    }
}

async function loadImages(slug) {
    const records = await request(`/api/admin/projects/${encodeURIComponent(slug)}/images`);
    if (editingSlug !== slug) return;
    images = records;
    renderImages();
    renderDraftPreview();
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
    if (hasUnsavedChanges() && !confirm("Discard unsaved project changes?")) return;
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
projectFilters.forEach((button) => button.addEventListener("click", () => {
    projectFilter = button.dataset.projectFilter;
    projectFilters.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    renderProjects();
}));
galleryFilters.forEach((button) => button.addEventListener("click", () => {
    galleryFilter = button.dataset.galleryFilter;
    if (galleryFilter !== "all") uploadForm.elements.category.value = galleryFilter;
    renderImages();
    renderDraftPreview();
}));
projectForm.addEventListener("input", renderDraftPreview);
projectForm.addEventListener("change", renderDraftPreview);
uploadForm.addEventListener("change", renderDraftPreview);

projectForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(projectForm);
    const data = Object.fromEntries(form);
    data.published = form.get("published") === "on";
    const previousSlug = editingSlug;
    const newCover = previousSlug ? null : form.get("newCover");
    delete data.newCover;
    if (newCover?.size > 10 * 1024 * 1024) {
        setStatus("Cover images must be 10 MB or smaller.", true);
        return;
    }
    if (newCover?.size && !newCover.type.startsWith("image/")) {
        setStatus("Choose an image for the cover.", true);
        return;
    }
    const publishAfterCover = Boolean(newCover?.size && data.published);
    if (publishAfterCover) data.published = false;
    const submit = document.getElementById("save-project");
    submit.disabled = true;
    let result;
    try {
        const path = previousSlug ? `/api/admin/projects/${encodeURIComponent(previousSlug)}` : "/api/admin/projects";
        result = await request(path, {
            method: previousSlug ? "PUT" : "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(data)
        });
        if (newCover?.size) {
            const coverUpload = new FormData();
            coverUpload.append("file", newCover);
            coverUpload.append("category", "cover");
            coverUpload.append("alt", data.fullName || data.name);
            await request(`/api/admin/projects/${encodeURIComponent(result.slug)}/images`, { method: "POST", body: coverUpload });
            if (publishAfterCover) {
                data.published = true;
                await request(`/api/admin/projects/${encodeURIComponent(result.slug)}`, {
                    method: "PUT",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify(data)
                });
            }
        }
        await loadProjects(result.slug);
        setStatus(previousSlug ? "Project updated." : newCover?.size ? "Project and cover saved. Add gallery images next." : "Project created. Add its cover and gallery images next.");
    } catch (error) {
        if (result && !previousSlug) {
            await loadProjects(result.slug).catch(() => {});
            setStatus(`Project created, but its cover or publish step failed: ${error.message} Retry in the gallery.`, true);
        } else {
            setStatus(error.message, true);
        }
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
