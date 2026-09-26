document.addEventListener("DOMContentLoaded", () => {
    const blocks = [...document.querySelectorAll(".about .description-text .t-stream")];

    if (!blocks.length ||
        !window.IntersectionObserver ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    // Keep the original paragraphs readable until the introduction enters view.
    const spans = blocks.flatMap((block) => {
        const words = block.textContent.trim().split(/\s+/);
        block.textContent = "";

        return words.map((word, index) => {
            const span = document.createElement("span");
            span.className = "t-stream-w is-in";
            span.textContent = word;
            block.appendChild(span);

            if (index < words.length - 1) {
                block.appendChild(document.createTextNode(" "));
            }

            return span;
        });
    });

    const gap = parseFloat(
        getComputedStyle(blocks[0]).getPropertyValue("--stream-gap")
    ) || 60;

    function stream() {
        // Wipe without animating backward, then resolve each word in order.
        spans.forEach((span) => {
            span.style.transition = "none";
            span.classList.remove("is-in");
        });

        void blocks[0].offsetWidth;
        spans.forEach((span) => { span.style.transition = ""; });

        (function next(index) {
            if (index >= spans.length) return;
            spans[index].classList.add("is-in");
            setTimeout(() => next(index + 1), gap);
        })(0);
    }

    const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        stream();
    }, { threshold: 0.15 });

    observer.observe(blocks[0]);
});
