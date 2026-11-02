let deliverProject;
window.projectReady = new Promise((resolve) => { deliverProject = resolve; });
let initialized = false;

const gallery = document.getElementById("project-gallery");
function decorateGallery() {
    gallery.querySelectorAll(".gallery-category").forEach((section) => {
        const header = section.querySelector(".gallery-category-header");
        if (!header || header.querySelector(".admin-category-add")) return;
        const category = section.dataset.category;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "admin-category-add";
        button.textContent = "+";
        button.setAttribute("aria-label", `Add image to ${section.querySelector(".gallery-category-label")?.textContent || category}`);
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            window.parent.postMessage({ type: "admin-add-image", category }, window.location.origin);
        });
        button.addEventListener("keydown", (event) => event.stopPropagation());
        header.insertBefore(button, header.querySelector(".gallery-category-toggle"));
    });
    gallery.querySelectorAll(".gallery-item").forEach((figure) => {
        figure.tabIndex = 0;
        figure.setAttribute("role", "button");
        figure.setAttribute("aria-label", `Edit ${figure.querySelector("img")?.alt || "image"}`);
    });
}
new MutationObserver(decorateGallery).observe(gallery, { childList: true, subtree: true });
gallery.addEventListener("click", (event) => {
    const figure = event.target.closest(".gallery-item");
    if (!figure) return;
    event.stopImmediatePropagation();
    event.preventDefault();
    const section = figure.closest(".gallery-category");
    window.parent.postMessage({ type: "admin-edit-image", category: section?.dataset.category, index: [...figure.parentElement.querySelectorAll(".gallery-item")].indexOf(figure) }, window.location.origin);
}, true);
gallery.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && event.target.matches(".gallery-item")) {
        event.preventDefault();
        event.target.click();
    }
});

window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin || event.source !== window.parent || event.data?.type !== "admin-gallery-preview") return;
    const project = event.data.project;
    if (!project || typeof project !== "object") return;
    document.getElementById("preview-title").textContent = project.name || "Untitled project";
    if (!initialized) {
        initialized = true;
        deliverProject(project);
    } else if (typeof renderGallery === "function") {
        renderGallery(project, project.manifest);
    }
});

window.parent.postMessage({ type: "admin-gallery-ready" }, window.location.origin);
