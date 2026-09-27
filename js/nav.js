const topbar = document.querySelector(".topbar");
const navToggle = document.querySelector(".nav-toggle");

// Keep the visual and keyboard reading order aligned with the homepage journey.
const heroSection = document.querySelector("main > #hero");
const aboutSection = document.querySelector("main > #about");
const workSection = document.querySelector("main > #work");
const aboutBreak = aboutSection?.nextElementSibling;

if (heroSection && aboutSection && workSection) {
    if (aboutBreak?.classList.contains("ad-break")) {
        heroSection.after(aboutBreak, workSection);
    } else {
        heroSection.after(workSection);
    }

    const aboutBody = aboutSection.querySelector(".database-body");
    const introduction = aboutBody?.querySelector(".database-right");
    if (aboutBody && introduction) aboutBody.prepend(introduction);
}

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
