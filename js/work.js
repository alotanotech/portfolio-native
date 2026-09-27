const workScroll =
    document.querySelector(
        ".work-scroll"
    );


const workProjectCount =
    document.querySelector(
        ".work-project-count"
    );

const workSwitcher = document.querySelector(".work-switcher");
const workTabs = [...(workSwitcher?.querySelectorAll("[data-work-category]") || [])];
const workPill = workSwitcher?.querySelector(".t-tabs-pill");
const workPanels = Object.fromEntries(workTabs.map((tab) => [
    tab.dataset.workCategory,
    document.getElementById(tab.getAttribute("aria-controls"))
]));

let workCounterObserver = null;


function getWorkCards() {

    const active = workTabs.find((tab) => tab.getAttribute("aria-selected") === "true");
    return workPanels[active?.dataset.workCategory || workTabs[0]?.dataset.workCategory]?.querySelectorAll(".work-card") || [];

}


function updateWorkProjectCount(
    card,
    cards
) {

    if (
        !workProjectCount ||
        !card
    ) {

        return;

    }


    const index =
        Array.from(
            cards
        ).indexOf(
            card
        ) + 1;


    if (
        index <= 0
    ) {

        return;

    }


    workProjectCount.textContent =
        `${String(
            index
        ).padStart(
            2,
            "0"
        )} / ${String(cards.length).padStart(2, "0")}`;

}


function initializeWorkCounter() {

    workCounterObserver?.disconnect();

    if (
        !workScroll ||
        !workProjectCount
    ) {

        return;

    }


    const cards =
        getWorkCards();


    if (
        !cards.length
    ) {

        workProjectCount.textContent = "00 / 00";
        return;

    }


    const observer =
        new IntersectionObserver(

            (
                entries
            ) => {

                entries.forEach(
                    (
                        entry
                    ) => {

                        if (
                            !entry.isIntersecting
                        ) {

                            return;

                        }


                        updateWorkProjectCount(
                            entry.target,
                            cards
                        );

                    }
                );

            },

            {
                root:
                    workScroll,

                threshold:
                    0.55

            }

        );

    workCounterObserver = observer;


    cards.forEach(
        (
            card
        ) => {

            observer.observe(
                card
            );

        }
    );


    const firstCard =
        cards[0];


    if (
        firstCard
    ) {

        updateWorkProjectCount(
            firstCard,
            cards
        );

    }

}


function initializeWorkTabs() {
    if (!workSwitcher || !workScroll || !workTabs.length) return;

    // Keep the existing transitions.dev pill in sync with the selected category.
    function movePill(tab, animate) {
        if (!workPill) return;
        if (!animate) workPill.style.transition = "none";
        workPill.style.transform = `translateX(${tab.offsetLeft}px)`;
        workPill.style.width = `${tab.offsetWidth}px`;
        if (!animate) {
            void workPill.offsetWidth;
            workPill.style.transition = "";
        }
    }

    function selectCategory(category, { updateHash = false, focus = false, animate = true } = {}) {
        const selected = workTabs.find((tab) => tab.dataset.workCategory === category);
        if (!selected || !workPanels[category]) return;

        workTabs.forEach((tab) => {
            const active = tab === selected;
            tab.setAttribute("aria-selected", String(active));
            tab.tabIndex = active ? 0 : -1;
            workPanels[tab.dataset.workCategory].hidden = !active;
        });

        workScroll.scrollTop = 0;
        movePill(selected, animate);
        initializeWorkCounter();
        if (focus) selected.focus();
        if (updateHash) history.replaceState(null, "", `#work-${category}`);
    }

    workTabs.forEach((tab, index) => {
        tab.addEventListener("click", () => selectCategory(tab.dataset.workCategory, { updateHash: true }));
        tab.addEventListener("keydown", (event) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
            event.preventDefault();
            const next = event.key === "Home" ? 0 : event.key === "End" ? workTabs.length - 1 :
                (index + (event.key === "ArrowRight" ? 1 : -1) + workTabs.length) % workTabs.length;
            selectCategory(workTabs[next].dataset.workCategory, { updateHash: true, focus: true });
        });
    });

    const requestedCategory = location.hash.startsWith("#work-") ? location.hash.slice(6) : "";
    const initialCategory = workPanels[requestedCategory] ? requestedCategory : workTabs[0].dataset.workCategory;
    selectCategory(initialCategory, { animate: false });
    requestAnimationFrame(() => movePill(workTabs.find((tab) => tab.dataset.workCategory === initialCategory), false));
    window.addEventListener("resize", () => {
        const active = workTabs.find((tab) => tab.getAttribute("aria-selected") === "true") || workTabs[0];
        movePill(active, false);
    });
    window.addEventListener("hashchange", () => {
        if (location.hash.startsWith("#work-") && workPanels[location.hash.slice(6)]) {
            selectCategory(location.hash.slice(6), { animate: false });
        }
    });
}

function initializeWork() {

    initializeWorkTabs();

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeWork
    );

} else {

    initializeWork();

}

document.addEventListener("portfolio:work-updated", initializeWorkCounter);
