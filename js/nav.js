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