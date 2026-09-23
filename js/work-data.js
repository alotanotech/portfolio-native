/* The existing cards stay visible until the published catalog is available. */
function updateCard(card, project, position, total, personal) {
    const link = card.querySelector(".work-card-link");
    const image = card.querySelector(".work-image");
    const title = card.querySelector(".work-card-title");
    const secondary = card.querySelector(".work-card-title-secondary");
    const number = personal ? `P${String(position).padStart(2, "0")}` : String(position).padStart(2, "0");
    const displayName = project.fullName || project.name;

    link.href = `./pages/project.html?project=${encodeURIComponent(project.slug)}`;
    link.dataset.project = project.slug;
    link.setAttribute("aria-label", `View ${displayName} project`);
    image.src = project.cover;
    image.alt = `${displayName} project`;
    card.querySelector(".work-card-index").textContent = number;
    card.querySelector(".work-card-type").textContent = project.type;
    card.querySelector(".work-card-state").textContent = personal ? "PERSONAL" : "COMPLETED";
    card.querySelector(".work-card-id").textContent = personal ? number : `${number} / ${String(total).padStart(2, "0")}`;
    card.querySelector(".work-image-code").textContent = `${project.name} / ${project.year}`;

    const oldTitle = `${title.textContent.trim()} ${secondary?.textContent.trim() || ""}`.trim();
    if (oldTitle !== displayName) {
        title.textContent = displayName;
        secondary?.remove();
    }
}

async function loadPublishedWork() {
    const response = await fetch("/api/projects", { cache: "no-store" });
    if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) return;
    const projects = await response.json();
    if (!Array.isArray(projects) || projects.length === 0) return;

    const clientGrid = document.querySelector("#work-client .work-grid");
    const personalSection = document.querySelector("#work-personal");
    const clientTemplate = clientGrid?.querySelector(".work-card");
    const personalTemplate = personalSection?.querySelector(".work-subcategory");
    if (!clientTemplate || !personalTemplate) return;

    const oldClients = new Map([...clientGrid.querySelectorAll(".work-card")].map((card) => [card.querySelector("[data-project]")?.dataset.project, card]));
    const oldPersonal = new Map([...personalSection.querySelectorAll(".work-subcategory")].map((group) => [group.querySelector("[data-project]")?.dataset.project, group]));
    const visible = projects.filter((project) => project.cover && project.slug && ["client", "personal"].includes(project.kind));
    const clients = visible.filter((project) => project.kind === "client");
    const personal = visible.filter((project) => project.kind === "personal");

    clientGrid.replaceChildren(...clients.map((project, index) => {
        const card = oldClients.get(project.slug) || clientTemplate.cloneNode(true);
        updateCard(card, project, index + 1, clients.length, false);
        return card;
    }));

    personalSection.querySelectorAll(".work-subcategory").forEach((group) => group.remove());
    personal.forEach((project, index) => {
        const group = oldPersonal.get(project.slug) || personalTemplate.cloneNode(true);
        group.querySelector(".work-subcategory-index").textContent = `02.${String(index + 1).padStart(2, "0")}`;
        group.querySelector(".work-subcategory-title").textContent = project.category || project.fullName || project.name;
        updateCard(group.querySelector(".work-card"), project, index + 1, personal.length, true);
        personalSection.append(group);
    });

    document.dispatchEvent(new Event("portfolio:work-updated"));
}

loadPublishedWork().catch((error) => console.warn("Using local work cards:", error));
