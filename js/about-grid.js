(() => {
    const section = document.getElementById("about");
    if (!section) return;

    const layer = document.createElement("div");
    layer.className = "about-grid-motion";
    layer.setAttribute("aria-hidden", "true");
    section.prepend(layer);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cellSize = 64;

    function layoutCells() {
        const columns = Math.max(1, Math.ceil(section.clientWidth / cellSize));
        const rows = Math.max(1, Math.ceil(section.clientHeight / cellSize));
        const total = columns * rows;
        const count = Math.min(18, Math.max(6, Math.floor(total * 0.045)));
        const used = new Set();
        const fragment = document.createDocumentFragment();
        let seed = columns * 97 + rows * 31;

        for (let index = 0; index < count; index += 1) {
            seed = (seed * 1664525 + 1013904223) >>> 0;
            let cell = seed % total;
            while (used.has(cell)) cell = (cell + 1) % total;
            used.add(cell);

            const square = document.createElement("span");
            square.className = "about-grid-cell";
            square.style.left = `${(cell % columns) * cellSize}px`;
            square.style.top = `${Math.floor(cell / columns) * cellSize}px`;
            square.style.setProperty("--grid-duration", `${3.1 + (index % 5) * 0.35}s`);
            square.style.setProperty("--grid-delay", `${-(index * 0.47)}s`);
            fragment.append(square);
        }

        layer.replaceChildren(fragment);
    }

    layoutCells();
    if ("ResizeObserver" in window) new ResizeObserver(layoutCells).observe(section);
    else window.addEventListener("resize", layoutCells, { passive: true });

    if ("IntersectionObserver" in window) {
        new IntersectionObserver(([entry]) => {
            layer.classList.toggle("is-active", entry.isIntersecting && !reducedMotion.matches);
        }).observe(section);
    } else {
        layer.classList.toggle("is-active", !reducedMotion.matches);
    }

    reducedMotion.addEventListener?.("change", () => {
        layer.classList.toggle("is-active", !reducedMotion.matches && section.getBoundingClientRect().bottom > 0 && section.getBoundingClientRect().top < innerHeight);
    });
})();
