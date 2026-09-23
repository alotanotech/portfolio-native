const workScroll =
    document.querySelector(
        ".work-scroll"
    );


const workProjectCount =
    document.querySelector(
        ".work-project-count"
    );

let workCounterObserver = null;


function getWorkCards() {

    return document.querySelectorAll(
        ".work-card"
    );

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


function initializeWorkNavigation() {

    const navigationLinks =
        document.querySelectorAll(
            ".work-category-nav-link"
        );


    if (
        !navigationLinks.length
    ) {

        return;

    }


    navigationLinks.forEach(
        (
            link
        ) => {

            link.addEventListener(
                "click",
                (
                    event
                ) => {

                    const targetSelector =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        !targetSelector ||
                        !targetSelector.startsWith(
                            "#"
                        )
                    ) {

                        return;

                    }


                    const target =
                        document.querySelector(
                            targetSelector
                        );


                    if (
                        !target ||
                        !workScroll
                    ) {

                        return;

                    }


                    event.preventDefault();


                    workScroll.scrollTo(
                        {

                            top:
                                target.offsetTop,

                            behavior:
                                "smooth"

                        }
                    );


                    history.replaceState(
                        null,
                        "",
                        targetSelector
                    );

                }
            );

        }
    );

}


function initializeWork() {

    initializeWorkCounter();

    initializeWorkNavigation();

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
