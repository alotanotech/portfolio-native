document.addEventListener("DOMContentLoaded", () => {
    const hero = document.querySelector(".work-hero");
    if (!hero) return;

    const fallbackProjects = [
        { slug: "pcba", name: "PCBA Semiconductor International", type: "BRAND / DESIGN", image: "/asset/project/PSI.webp", group: "client" },
        { slug: "little-lady", name: "Little Lady", type: "BRAND / IDENTITY", image: "/asset/project/LittleLady.webp", group: "client" },
        { slug: "pacohome", name: "Pacohome", type: "BRAND / CAMPAIGN", image: "/asset/project/Pacohome.webp", group: "client" },
        { slug: "adiograf", name: "Adiograf Indonesia", type: "BRAND / GRAPHIC", image: "/asset/project/Adiograf.webp", group: "client" },
        { slug: "bagatelle", name: "Bagatelle", type: "BRAND / SOCIAL", image: "/asset/project/Bagatelle.webp", group: "client" },
        { slug: "3d", name: "3D", type: "3D", image: "/assets/projects/3d/CupVase.webp", group: "personal" },
        { slug: "digital-illustration", name: "Digital Illustration", type: "ILLUSTRATION", image: "/assets/projects/digital-illustration/la.webp", group: "personal" },
        { slug: "graphic-design", name: "Graphic Design", type: "GRAPHIC DESIGN", image: "/assets/projects/graphic-design/CyberChris.webp", group: "personal" },
        { slug: "pixel-art", name: "Pixel Art", type: "PIXEL ART", image: "/assets/projects/pixel-art/Lyan.gif", group: "personal" }
    ].map((project) => ({ ...project, href: `/pages/project.html?project=${encodeURIComponent(project.slug)}` }));

    const image = hero.querySelector(".work-hero__image");
    const title = hero.querySelector(".work-hero__title");
    const projectCopy = hero.querySelector(".work-hero__project-copy");
    const type = hero.querySelector(".work-hero__type");
    const counter = hero.querySelector(".work-hero__counter");
    const link = hero.querySelector(".work-hero__link");
    const thumbnails = hero.querySelector(".work-hero__thumbs");
    const filters = [...hero.querySelectorAll("[data-work-filter]")];
    const previous = hero.querySelector(".work-hero__previous");
    const next = hero.querySelector(".work-hero__next");
    let activeFilter = "client";
    let activeIndex = 0;
    let projects = [];
    let catalog = fallbackProjects;
    let imageChange = 0;

    image.addEventListener("animationend", () => image.classList.remove("is-changing"));
    projectCopy.addEventListener("animationend", () => projectCopy.classList.remove("is-changing"));

    function getProjects() {
        return catalog;
    }

    async function loadPublishedProjects() {
        try {
            const response = await fetch("/api/projects", { cache: "no-store" });
            if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) return;
            const published = await response.json();
            if (!Array.isArray(published) || published.length === 0) return;
            const nextCatalog = published.filter((project) => project.cover && project.slug).map((project) => {
                const name = project.fullName || project.name;
                const type = project.type || "Creative work";
                const isPhoto = /photograph|\bphoto\b/i.test(`${project.category || ""} ${type} ${name}`);
                return {
                    slug: project.slug,
                    name,
                    type,
                    image: project.cover,
                    href: `/pages/project.html?project=${encodeURIComponent(project.slug)}`,
                    group: isPhoto ? "photography" : project.kind === "client" ? "client" : "personal"
                };
            }).filter((project) => project.name);
            if (!nextCatalog.length) return;
            catalog = nextCatalog;
            selectFilter(activeFilter, projects[activeIndex]?.slug);
        } catch (error) {
            console.warn("Using local work covers:", error);
        }
    }

    function setImage(src) {
        const change = ++imageChange;
        if (!src) {
            image.hidden = true;
            image.classList.remove("is-changing");
            return;
        }
        const preload = new Image();
        preload.onload = () => {
            if (change !== imageChange) return;
            image.src = src;
            image.hidden = false;
            image.classList.remove("is-changing");
            void image.offsetWidth;
            image.classList.add("is-changing");
        };
        preload.onerror = () => {
            if (change !== imageChange) return;
            image.hidden = true;
            image.classList.remove("is-changing");
        };
        preload.src = src;
    }

    function showProject(index) {
        activeIndex = index;
        const project = projects[index];
        const empty = !project;
        hero.classList.toggle("work-hero__empty", empty);
        previous.hidden = empty || index === 0;
        next.hidden = empty || index === projects.length - 1;
        thumbnails.hidden = empty;
        link.hidden = empty;

        if (empty) {
            counter.textContent = "00 / 00";
            type.textContent = "PHOTOGRAPHY";
            title.textContent = "Photography collection coming soon.";
            projectCopy.classList.remove("is-changing");
            setImage(null);
            return;
        }

        counter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`;
        type.textContent = project.type;
        title.textContent = project.name;
        projectCopy.classList.remove("is-changing");
        void projectCopy.offsetWidth;
        projectCopy.classList.add("is-changing");
        link.href = project.href;
        link.setAttribute("aria-label", `Explore ${project.name} project`);
        setImage(project.image);
        [...thumbnails.children].forEach((button, position) => {
            button.classList.toggle("is-active", position === index);
            button.setAttribute("aria-current", position === index ? "true" : "false");
        });
        const activeThumb = thumbnails.children[index];
        if (activeThumb) {
            const left = activeThumb.getBoundingClientRect().left
                - thumbnails.getBoundingClientRect().left + thumbnails.scrollLeft;
            const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            thumbnails.scrollTo({ left, behavior: reducedMotion ? "auto" : "smooth" });
        }
    }

    function renderThumbnails() {
        thumbnails.replaceChildren(...projects.map((project, index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "work-hero__thumb";
            button.setAttribute("aria-label", `Show ${project.name}`);
            const thumb = document.createElement("img");
            thumb.src = project.image;
            thumb.alt = "";
            thumb.loading = "lazy";
            button.append(thumb);
            button.addEventListener("click", () => showProject(index));
            return button;
        }));
    }

    function selectFilter(filter, preferredSlug) {
        activeFilter = filter;
        filters.forEach((button) => {
            const active = button.dataset.workFilter === filter;
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-pressed", String(active));
        });
        projects = getProjects().filter((project) => project.group === filter);
        renderThumbnails();
        const preservedIndex = projects.findIndex((project) => project.slug === preferredSlug);
        showProject(preservedIndex >= 0 ? preservedIndex : 0);
    }

    filters.forEach((button) => button.addEventListener("click", () => selectFilter(button.dataset.workFilter)));
    previous.addEventListener("click", () => {
        if (activeIndex > 0) showProject(activeIndex - 1);
    });
    next.addEventListener("click", () => {
        if (activeIndex < projects.length - 1) showProject(activeIndex + 1);
    });
    selectFilter(activeFilter);
    loadPublishedProjects();

    const toolkitTabs = [...document.querySelectorAll(".about-toolkit .tool-tab")];
    toolkitTabs.forEach((button, index) => {
        button.addEventListener("click", () => {
            toolkitTabs.forEach((tab) => {
                const active = tab === button;
                tab.classList.toggle("active", active);
                tab.setAttribute("aria-selected", String(active));
                tab.tabIndex = active ? 0 : -1;
                const panel = document.getElementById(tab.getAttribute("aria-controls"));
                panel.hidden = !active;
                panel.classList.toggle("active", active);
            });
        });
        button.addEventListener("keydown", (event) => {
            if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
            event.preventDefault();
            const direction = event.key === "ArrowRight" ? 1 : -1;
            const target = toolkitTabs[(index + direction + toolkitTabs.length) % toolkitTabs.length];
            target.focus();
            target.click();
        });
    });
});
