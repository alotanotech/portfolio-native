
/* =========================================================
   WORK
   ---------------------------------------------------------
   DATABASE SCROLL STATE
========================================================= */

const workScroll = document.querySelector(".work-scroll");
const workCards = document.querySelectorAll(".work-card");
const workProjectCount = document.querySelector(".work-project-count");

if (workScroll && workCards.length) {

    const observer = new IntersectionObserver(
        (entries) => {

            entries.forEach((entry) => {

                if (!entry.isIntersecting) {
                    return;
                }

                const index =
                    [...workCards].indexOf(entry.target) + 1;

                const formattedIndex =
                    String(index).padStart(2, "0");

                if (workProjectCount) {
                    workProjectCount.textContent =
                        formattedIndex;
                }

            });

        },
        {
            root: workScroll,
            threshold: 0.55
        }
    );


    workCards.forEach((card) => {
        observer.observe(card);
    });

}
