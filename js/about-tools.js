document.addEventListener("DOMContentLoaded", () => {
    const bar = document.querySelector(".about .t-tabs");
    const panel = document.querySelector("#about-tools");
    if (!bar || !panel) return;

    const pill = bar.querySelector(".t-tabs-pill");
    const tabs = [...bar.querySelectorAll(".t-tab")];
    const tools = [...panel.querySelectorAll(".skill-item")];
    const previous = document.querySelector('[data-tool-scroll="previous"]');
    const next = document.querySelector('[data-tool-scroll="next"]');

    // Keep the moving tab indicator in sync with the active button.
    function moveTo(tab, animate) {
        if (!animate) {
            const previousTransition = pill.style.transition;
            pill.style.transition = "none";
            pill.style.transform = `translateX(${tab.offsetLeft}px)`;
            pill.style.width = `${tab.offsetWidth}px`;
            void pill.offsetWidth;
            pill.style.transition = previousTransition;
        } else {
            pill.style.transform = `translateX(${tab.offsetLeft}px)`;
            pill.style.width = `${tab.offsetWidth}px`;
        }
    }

    const active = () => tabs.find((tab) => tab.getAttribute("aria-selected") === "true") || tabs[0];

    function updateScrollButtons() {
        if (!previous || !next) return;
        previous.disabled = panel.scrollLeft <= 1;
        next.disabled = panel.scrollLeft + panel.clientWidth >= panel.scrollWidth - 1;
    }

    function select(tab) {
        tabs.forEach((item) => {
            const selected = item === tab;
            item.setAttribute("aria-selected", String(selected));
            item.tabIndex = selected ? 0 : -1;
        });

        tools.forEach((tool) => {
            tool.hidden = tool.dataset.toolGroup !== tab.dataset.toolCategory;
        });

        panel.setAttribute("aria-labelledby", tab.id);
        panel.scrollLeft = 0;
        moveTo(tab, true);
        requestAnimationFrame(updateScrollButtons);
    }

    tabs.forEach((tab) => tab.addEventListener("click", () => select(tab)));

    bar.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const index = tabs.indexOf(active());
        const nextTab = tabs[(index + direction + tabs.length) % tabs.length];
        nextTab.focus();
        select(nextTab);
    });

    [previous, next].forEach((button) => {
        button?.addEventListener("click", () => {
            const direction = button === next ? 1 : -1;
            panel.scrollBy({
                left: direction * Math.max(180, panel.clientWidth * 0.7),
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
            });
        });
    });

    panel.addEventListener("scroll", updateScrollButtons, { passive: true });
    window.addEventListener("resize", () => {
        moveTo(active(), false);
        updateScrollButtons();
    });

    tabs.forEach((tab) => { tab.tabIndex = tab === active() ? 0 : -1; });
    tools.forEach((tool) => { tool.hidden = tool.dataset.toolGroup !== active().dataset.toolCategory; });
    requestAnimationFrame(() => {
        moveTo(active(), false);
        updateScrollButtons();
    });
});
