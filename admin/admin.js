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
const categoryPreset = document.getElementById("image-category-preset");
const destinationNote = document.getElementById("destination-note");
const uploadSelection = document.getElementById("upload-selection");
const uploadThumbnail = document.getElementById("upload-thumbnail");
const uploadFilename = document.getElementById("upload-filename");
const uploadDetails = document.getElementById("upload-details");
const addImageButton = document.getElementById("add-image");
const projectOrderNote = document.getElementById("project-order-note");
const imageDialog = document.getElementById("image-dialog");
const imageDialogTitle = document.getElementById("image-dialog-title");
const imageDialogContext = document.getElementById("image-dialog-context");
const submitImage = document.getElementById("submit-image");
const imageOrderControls = document.getElementById("image-order-controls");
const imageMoveEarlier = document.getElementById("image-move-earlier");
const imageMoveLater = document.getElementById("image-move-later");

const labels = {
    cover: "Cover",
    "social-post": "Social media posts",
    story: "Stories",
    square: "Square posts",
    landscape: "Landscape",
    other: "Other"
};
const destinationDetails = {
    cover: "Homepage card image. It does not appear inside the project gallery; a new cover becomes the active one.",
    "social-post": "Appears under Social media posts in the project gallery. Suggested crop: 4:5 portrait.",
    story: "Appears under Stories in the project gallery. Suggested crop: 9:16 portrait.",
    square: "Appears under Square posts in the project gallery. Suggested crop: 1:1.",
    landscape: "Appears under Landscape in the project gallery. Suggested crop: 16:9.",
    other: "Appears under Other in the project gallery. Keep the original ratio or choose a crop."
};

function categoryId(value) {
    const text = String(value || "").trim();
    const preset = Object.entries(labels).find(([id, label]) => id === text.toLowerCase() || label.toLowerCase() === text.toLowerCase());
    return preset?.[0] || text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function categoryLabel(value) {
    return Object.hasOwn(labels, value) ? labels[value] : String(value || "").replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function refreshCategorySuggestions() {
    const list = document.getElementById("image-category-suggestions");
    const names = [...Object.values(labels), ...images.map((image) => categoryLabel(image.category))];
    list.replaceChildren(...[...new Set(names)].map((name) => {
        const option = document.createElement("option");
        option.value = name;
        return option;
    }));
}

function sectionLabel(value) {
    return String(value || "Personal").replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

let projects = [];
let images = [];
let editingSlug = null;
let stagedFile = null;
let sourceFile = null;
let stagedUrl = null;
let readOnlyDemo = false;
let shortTitleManuallyEdited = false;
let slugManuallyEdited = false;
let editingImage = null;
let modalCloseTimer = null;

function updateImageOrderControls() {
    const peers = images.filter((item) => item.category === editingImage?.category);
    const index = peers.findIndex((item) => item.id === editingImage?.id);
    imageOrderControls.hidden = index < 0 || editingImage?.category === "cover" || categoryId(uploadForm.elements.category.value) !== editingImage?.category;
    imageMoveEarlier.disabled = index <= 0;
    imageMoveLater.disabled = index < 0 || index >= peers.length - 1;
}

function openImageDialog(category, image = null) {
    if (!editingSlug) return;
    clearStagedImage();
    editingImage = image;
    uploadForm.hidden = false;
    uploadForm.elements.category.value = categoryLabel(category);
    categoryPreset.value = Object.hasOwn(labels, category) ? category : "";
    updateImageOrderControls();
    uploadForm.elements.alt.value = image?.alt || "";
    imageDialogTitle.textContent = image ? "Edit image" : "Add image";
    imageDialogContext.textContent = `${projectForm.elements.fullName.value || editingSlug} / ${categoryLabel(category)}${image ? ` / image ${images.filter((item) => item.category === category).findIndex((item) => item.id === image.id) + 1}` : ""}`;
    submitImage.textContent = image ? "Save image" : "Upload image";
    if (image) {
        uploadThumbnail.src = image.url;
        uploadFilename.textContent = "Current image";
        uploadDetails.textContent = "Choose a new file to replace this image, or change only its alt text.";
        uploadSelection.hidden = false;
        document.getElementById("edit-crop").hidden = true;
    } else {
        document.getElementById("edit-crop").hidden = false;
    }
    updateDestination();
    clearTimeout(modalCloseTimer);
    imageDialog.classList.remove("is-closing");
    if (!imageDialog.open) imageDialog.showModal();
    requestAnimationFrame(() => imageDialog.classList.add("is-open"));
}

function closeImageDialog() {
    if (!imageDialog.open || imageDialog.classList.contains("is-closing")) return;
    imageDialog.classList.remove("is-open");
    imageDialog.classList.add("is-closing");
    const closeMs = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--modal-close-dur")) || 150;
    modalCloseTimer = setTimeout(() => {
        imageDialog.close();
        imageDialog.classList.remove("is-closing");
        editingImage = null;
        clearStagedImage();
        uploadForm.elements.alt.value = "";
    }, closeMs);
}

tokenInput.value = sessionStorage.getItem("portfolio-admin-token") || "";

function setStatus(message, isError = false) {
    status.textContent = message;
    status.classList.toggle("is-error", isError);
}

function clearStagedImage() {
    if (stagedUrl) URL.revokeObjectURL(stagedUrl);
    stagedFile = null;
    sourceFile = null;
    stagedUrl = null;
    uploadForm.elements.file.value = "";
    uploadSelection.hidden = true;
}

function updateDestination() {
    const category = categoryId(uploadForm.elements.category.value);
    destinationNote.replaceChildren();
    const title = document.createElement("strong");
    const detail = document.createElement("span");
    const makingCover = editingImage && category === "cover" && editingImage.category !== "cover";
    title.textContent = `${makingCover ? "Using as cover" : editingImage ? "Placing in" : "Uploading to"} ${editingSlug || "a saved project"} / ${categoryLabel(category) || "Choose a group"}`;
    detail.textContent = makingCover
        ? "A separate cover copy will be created. This image stays in its current gallery category."
        : destinationDetails[category] || "Appears as its own group in this project's gallery. Choose the crop that suits the image.";
    destinationNote.append(title, detail);
    submitImage.textContent = makingCover ? "Use as cover" : editingImage ? "Save image" : "Upload image";
    if (editingImage && !stagedFile) {
        uploadDetails.textContent = makingCover
            ? "Use this existing image as cover, or choose a new file. The gallery original stays unchanged."
            : "Choose a new file to replace this image, or change its category and alt text.";
    }
    updateImageOrderControls();
    if (!editingImage) imageDialogContext.textContent = `${projectForm.elements.fullName.value || editingSlug || "New project"} / ${categoryLabel(category) || "Choose a group"}`;
}

async function request(path, options = {}) {
    const token = tokenInput.value.trim();
    if (!token) throw new Error("Enter your admin token first.");
    const response = await fetch(path, {
        ...options,
        headers: { ...options.headers, authorization: `Bearer ${token}` }
    });
    if (response.headers.get("x-preview-mode") === "read-only") {
        readOnlyDemo = true;
        document.getElementById("demo-banner").hidden = false;
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`);
    return data;
}

function renderProjects() {
    const search = projectSearch.value.trim().toLowerCase();
    projectCount.textContent = String(projects.length);
    projectList.replaceChildren();

    for (const project of projects.filter((item) => `${item.name} ${item.slug} ${item.kind} ${item.category}`.toLowerCase().includes(search))) {
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
        meta.textContent = `${sectionLabel(project.kind)} · ${project.published ? "Published" : "Draft"}`;
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
    closeImageDialog();
    clearStagedImage();
    editingSlug = null;
    images = [];
    refreshCategorySuggestions();
    projectForm.reset();
    projectForm.elements.index.value = String(Math.max(0, ...projects.map((project) => Number(project.project_index) || 0)) + 1).padStart(2, "0");
    projectForm.elements.type.value = "PERSONAL WORK";
    projectForm.elements.status.value = "ARCHIVE";
    projectForm.elements.kind.value = "Personal";
    projectForm.elements.category.value = "";
    shortTitleManuallyEdited = false;
    slugManuallyEdited = false;
    projectOrderNote.textContent = `Placement: ${projectForm.elements.index.value} (assigned automatically)`;
    editorTitle.textContent = "New project";
    document.getElementById("save-project").textContent = "Create project";
    document.getElementById("cancel-edit").textContent = "Reset form";
    projectPreview.hidden = true;
    dangerZone.hidden = true;
    addImageButton.disabled = true;
    uploadForm.hidden = true;
    mediaContext.textContent = "Save a project first, then add images. Choose their category in the popup.";
    mediaCount.textContent = "0 images";
    mediaList.replaceChildren();
    renderProjects();
    updateDestination();
}

async function selectProject(slug) {
    if (editingSlug !== slug) closeImageDialog();
    const project = projects.find((item) => item.slug === slug);
    if (!project) return;
    if (editingSlug !== slug) {
        clearStagedImage();
        images = [];
    }
    editingSlug = slug;
    projectForm.elements.slug.value = project.slug;
    projectForm.elements.index.value = project.project_index;
    projectForm.elements.name.value = project.name;
    projectForm.elements.fullName.value = project.full_name;
    projectForm.elements.client.value = project.client;
    projectForm.elements.year.value = project.year;
    projectForm.elements.type.value = project.type;
    projectForm.elements.category.value = project.category || "";
    projectForm.elements.status.value = project.status;
    projectForm.elements.kind.value = sectionLabel(project.kind);
    projectForm.elements.description.value = project.description;
    projectForm.elements.published.checked = Boolean(project.published);
    shortTitleManuallyEdited = true;
    slugManuallyEdited = true;
    projectOrderNote.textContent = `Placement: ${project.project_index} (kept from this project)`;
    editorTitle.textContent = project.full_name || project.name;
    document.getElementById("save-project").textContent = "Save changes";
    document.getElementById("cancel-edit").textContent = "Cancel changes";
    projectPreview.href = `/pages/project.html?project=${encodeURIComponent(slug)}`;
    projectPreview.hidden = !project.published;
    dangerZone.hidden = false;
    addImageButton.disabled = false;
    uploadForm.hidden = false;
    mediaContext.textContent = `Managing images for ${project.full_name || project.name}. Select a thumbnail to edit, or choose Add image to pick a category.`;
    updateDestination();
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
    document.body.classList.add("admin-unlocked");
    sessionStorage.setItem("portfolio-admin-token", tokenInput.value.trim());
    setStatus(`${projects.length} project${projects.length === 1 ? "" : "s"} loaded.`);
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
    updateImageOrderControls();
    mediaCount.textContent = `${images.length} image${images.length === 1 ? "" : "s"}`;
    if (!images.length) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = "No images yet. Upload a cover, then add gallery images in the category you want visitors to browse.";
        mediaList.append(empty);
        return;
    }

    const categories = [...Object.keys(labels), ...new Set(images.map((image) => image.category).filter((category) => !Object.hasOwn(labels, category)))];
    for (const category of categories) {
        const label = categoryLabel(category);
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
            const edit = document.createElement("button");
            const preview = document.createElement("img");
            const editLabel = document.createElement("span");
            const body = document.createElement("div");
            const caption = document.createElement("p");
            const actions = document.createElement("div");
            card.className = "media-item";
            edit.type = "button";
            edit.className = "media-edit-trigger";
            edit.setAttribute("aria-label", `Edit ${label} image ${index + 1}`);
            edit.addEventListener("click", () => openImageDialog(category, image));
            preview.src = image.url;
            preview.alt = image.alt || `${label} image ${index + 1}`;
            preview.loading = "lazy";
            editLabel.className = "media-edit-label";
            editLabel.textContent = "Edit image";
            edit.append(preview, editLabel);
            body.className = "media-item-body";
            caption.textContent = `${category === "cover" && index === items.length - 1 ? "ACTIVE COVER · " : ""}${String(index + 1).padStart(2, "0")} / ${image.alt || "No alt text"}`;
            actions.className = "media-actions";
            actions.append(
                mediaButton(`Move ${label} image ${index + 1} earlier`, "↑", () => moveImage(category, index, -1), index === 0),
                mediaButton(`Move ${label} image ${index + 1} later`, "↓", () => moveImage(category, index, 1), index === items.length - 1),
                mediaButton(`Delete ${label} image ${index + 1}`, "Remove", () => removeImage(image), false, "remove-image")
            );
            body.append(caption, actions);
            card.append(edit, body);
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
    refreshCategorySuggestions();
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
        setStatus(`${categoryLabel(category)} order saved.`);
    } catch (error) {
        await loadImages(slug).catch(() => {});
        setStatus(error.message, true);
    }
}

async function removeImage(image) {
    if (!editingSlug || !confirm(`Delete this ${categoryLabel(image.category)} image? This permanently removes its R2 file and cannot be undone.`)) return;
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
    projectForm.elements.fullName.focus();
    setStatus("New draft ready.");
});

document.getElementById("cancel-edit").addEventListener("click", () => {
    if (editingSlug) selectProject(editingSlug);
    else resetEditor();
    setStatus("Unsaved changes discarded.");
});

document.getElementById("lock-studio").addEventListener("click", () => {
    clearStagedImage();
    sessionStorage.removeItem("portfolio-admin-token");
    tokenInput.value = "";
    projects = [];
    images = [];
    editingSlug = null;
    workspace.hidden = true;
    accessPanel.hidden = false;
    document.body.classList.remove("admin-unlocked");
    setStatus("Studio locked for this browser session.");
    tokenInput.focus();
});

projectSearch.addEventListener("input", renderProjects);
projectForm.elements.name.addEventListener("input", () => { shortTitleManuallyEdited = true; });
projectForm.elements.slug.addEventListener("input", () => { slugManuallyEdited = true; });
projectForm.elements.fullName.addEventListener("input", () => {
    const title = projectForm.elements.fullName.value.trim();
    if (!shortTitleManuallyEdited) projectForm.elements.name.value = title.toUpperCase();
    if (!slugManuallyEdited) projectForm.elements.slug.value = title.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
});
projectForm.elements.kind.addEventListener("input", () => {
    if (!editingSlug) {
        const section = projectForm.elements.kind.value.trim().toUpperCase();
        projectForm.elements.type.value = section === "PHOTOGRAPHY" ? section : `${section || "PERSONAL"} WORK`;
    }
});
categoryPreset.addEventListener("change", () => {
    uploadForm.elements.category.value = categoryPreset.value ? categoryLabel(categoryPreset.value) : "";
    updateDestination();
    if (!categoryPreset.value) uploadForm.elements.category.focus();
});
uploadForm.elements.category.addEventListener("input", () => {
    const category = categoryId(uploadForm.elements.category.value);
    categoryPreset.value = Object.hasOwn(labels, category) ? category : "";
    updateDestination();
});
addImageButton.addEventListener("click", () => openImageDialog("other"));
document.getElementById("close-image-dialog").addEventListener("click", closeImageDialog);
imageMoveEarlier.addEventListener("click", () => {
    const index = images.filter((item) => item.category === editingImage?.category).findIndex((item) => item.id === editingImage?.id);
    if (index >= 0) moveImage(editingImage.category, index, -1);
});
imageMoveLater.addEventListener("click", () => {
    const index = images.filter((item) => item.category === editingImage?.category).findIndex((item) => item.id === editingImage?.id);
    if (index >= 0) moveImage(editingImage.category, index, 1);
});
imageDialog.addEventListener("cancel", (event) => { event.preventDefault(); closeImageDialog(); });
imageDialog.addEventListener("click", (event) => { if (event.target === imageDialog) closeImageDialog(); });

async function editSelectedImage(file) {
    const slug = editingSlug;
    try {
        const selection = await imageEditor.open(file, categoryId(uploadForm.elements.category.value));
        uploadForm.elements.file.value = "";
        if (!selection || slug !== editingSlug) return;
        if (stagedUrl) URL.revokeObjectURL(stagedUrl);
        stagedFile = selection.file;
        sourceFile = file;
        stagedUrl = URL.createObjectURL(stagedFile);
        uploadThumbnail.src = stagedUrl;
        uploadFilename.textContent = stagedFile.name;
        uploadDetails.textContent = `${(stagedFile.size / 1024 / 1024).toFixed(2)} MB · ${selection.edited ? "cropped WebP" : "original file"}`;
        uploadSelection.hidden = false;
        document.getElementById("edit-crop").hidden = false;
    } catch (error) {
        uploadForm.elements.file.value = "";
        setStatus(error.message, true);
    }
}

uploadForm.elements.file.addEventListener("change", () => {
    const file = uploadForm.elements.file.files[0];
    if (file) editSelectedImage(file);
});
document.getElementById("edit-crop").addEventListener("click", () => {
    if (sourceFile) editSelectedImage(sourceFile);
});

projectForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (readOnlyDemo) { setStatus("Local demo is read-only. Open the live admin to save project changes.", true); return; }
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
    if (readOnlyDemo) { setStatus("Local demo is read-only. Your crop is only a preview; nothing was uploaded.", true); return; }
    if (!editingSlug) return;
    const slug = editingSlug;
    const form = new FormData(uploadForm);
    const file = stagedFile;
    if ((!file || !file.size) && !editingImage) { setStatus("Choose an image and confirm its crop before uploading.", true); return; }
    if (file) form.set("file", file);
    else form.delete("file");
    form.set("category", categoryId(uploadForm.elements.category.value));
    if (file && file.size > 10 * 1024 * 1024) {
        setStatus("Images must be 10 MB or smaller.", true);
        return;
    }
    const button = uploadForm.querySelector("button[type=submit]");
    button.disabled = true;
    try {
        const makingCover = editingImage && categoryId(uploadForm.elements.category.value) === "cover" && editingImage.category !== "cover";
        await request(editingImage ? `/api/admin/images/${editingImage.id}` : `/api/admin/projects/${encodeURIComponent(slug)}/images`, { method: editingImage ? "PUT" : "POST", body: form });
        await loadImages(slug);
        closeImageDialog();
        setStatus(makingCover ? "Cover selected. The gallery image is still in place." : editingImage ? "Image updated." : "Image uploaded. Its gallery position is saved automatically.");
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
updateDestination();
