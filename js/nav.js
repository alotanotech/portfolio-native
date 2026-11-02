const topbar = document.querySelector(".topbar");
const navToggle = document.querySelector(".nav-toggle");

if (topbar && navToggle) {

    navToggle.addEventListener("click", () => {

        const isOpen = topbar.classList.toggle("menu-open");

        navToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        navToggle.setAttribute(
            "aria-label",
            isOpen
                ? "Close navigation"
                : "Open navigation"
        );

    });


    topbar
        .querySelectorAll(".nav-links a, .contact-button")
        .forEach(link => {

            link.addEventListener("click", () => {

                topbar.classList.remove("menu-open");

                navToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

                navToggle.setAttribute(
                    "aria-label",
                    "Open navigation"
                );

            });

        });

}

const workHero = document.querySelector(".work-hero");
if (topbar && workHero) {
    let frame = 0;
    const updateHeroNavbar = () => {
        frame = 0;
        topbar.classList.toggle(
            "is-over-hero",
            workHero.getBoundingClientRect().bottom > topbar.offsetHeight
        );
    };
    const queueHeroNavbar = () => {
        if (!frame) frame = requestAnimationFrame(updateHeroNavbar);
    };
    updateHeroNavbar();
    window.addEventListener("scroll", queueHeroNavbar, { passive: true });
    window.addEventListener("resize", queueHeroNavbar);
}
