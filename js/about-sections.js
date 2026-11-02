(() => {
    const section = document.querySelector("#experience");
    if (section) {
        const filters = section.querySelector(".experience-filters");
        const buttons = [...filters.querySelectorAll("button")];
        const entries = [...section.querySelectorAll(".about-experience-item")];
        const status = section.querySelector(".experience-status");
        const list = section.querySelector(".about-experience-list");
        filters.hidden = false;
        // Reserve the unfiltered list's height, including wrapped mobile rows.
        // Restore the current filter before the browser paints.
        const reserveListHeight = () => {
            const hidden = entries.map((entry) => entry.hidden);
            entries.forEach((entry) => { entry.hidden = false; });
            list.style.setProperty("--experience-list-height", "0px");
            const height = Math.ceil(list.getBoundingClientRect().height);
            list.style.setProperty("--experience-list-height", `${height}px`);
            entries.forEach((entry, index) => { entry.hidden = hidden[index]; });
        };
        reserveListHeight();
        if ("ResizeObserver" in window) {
            let width = list.getBoundingClientRect().width;
            new ResizeObserver(() => {
                const nextWidth = list.getBoundingClientRect().width;
                if (nextWidth === width) return;
                width = nextWidth;
                reserveListHeight();
            }).observe(list);
        } else window.addEventListener("resize", reserveListHeight);
        if (document.fonts) document.fonts.ready.then(reserveListHeight);
        buttons.forEach((button) => button.addEventListener("click", () => {
            const category = button.dataset.experienceFilter;
            buttons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
            entries.forEach((entry) => {
                entry.hidden = category !== "all" && entry.dataset.category !== category;
            });
            const count = entries.filter((entry) => !entry.hidden).length;
            status.textContent = `${count} experiences shown: ${button.textContent.trim()}.`;
        }));
    }

    const strip = document.querySelector("#toolkit-scroll");
    if (!strip) return;
    const controls = strip.closest(".toolkit-controls");
    const previous = controls.querySelector(".toolkit-prev");
    const next = controls.querySelector(".toolkit-next");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    previous.hidden = next.hidden = false;

    const updateControls = () => {
        previous.disabled = strip.scrollLeft <= 1;
        next.disabled = strip.scrollLeft >= strip.scrollWidth - strip.clientWidth - 1;
    };
    const scrollBy = (direction) => strip.scrollBy({
        left: direction * Math.max(84, strip.clientWidth * .7),
        behavior: reducedMotion.matches ? "instant" : "smooth"
    });
    previous.addEventListener("click", () => scrollBy(-1));
    next.addEventListener("click", () => scrollBy(1));
    strip.addEventListener("scroll", updateControls, { passive: true });
    strip.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        if (event.key === "Home") strip.scrollLeft = 0;
        else if (event.key === "End") strip.scrollLeft = strip.scrollWidth;
        else scrollBy(event.key === "ArrowLeft" ? -1 : 1);
    });

    // Touch uses native horizontal scrolling; mouse and pen use pointer capture.
    let drag = null;
    strip.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "touch" || event.button !== 0 || !event.isPrimary) return;
        drag = { id: event.pointerId, x: event.clientX, left: strip.scrollLeft };
        strip.setPointerCapture(event.pointerId);
        strip.classList.add("is-dragging");
        event.preventDefault();
    });
    strip.addEventListener("pointermove", (event) => {
        if (!drag || event.pointerId !== drag.id) return;
        strip.scrollLeft = drag.left - (event.clientX - drag.x);
    });
    const endDrag = (event) => {
        if (!drag || drag.id !== event.pointerId) return;
        drag = null;
        strip.classList.remove("is-dragging");
        if (strip.hasPointerCapture(event.pointerId)) strip.releasePointerCapture(event.pointerId);
    };
    strip.addEventListener("pointerup", endDrag);
    strip.addEventListener("pointercancel", endDrag);
    strip.addEventListener("lostpointercapture", endDrag);
    if ("ResizeObserver" in window) new ResizeObserver(updateControls).observe(strip);
    else window.addEventListener("resize", updateControls);
    updateControls();
})();
