(() => {
    const gallery = document.getElementById("project-gallery");
    if (!gallery || !("IntersectionObserver" in window)) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const prepared = new WeakSet();
    const revealObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.remove("is-reveal-pending");
            revealObserver.unobserve(entry.target);
        }
    }, { rootMargin: "0px 0px -40px 0px", threshold: 0.01 });

    function prepareContent() {
        if (reducedMotion.matches) return;
        for (const content of gallery.querySelectorAll(".gallery-content")) {
            if (prepared.has(content)) continue;
            prepared.add(content);
            const items = [...content.querySelectorAll(".gallery-item")];
            items.forEach((item, index) => {
                item.style.setProperty("--reveal-delay", `${(index % 4) * 45}ms`);
                item.classList.add("is-reveal-pending");
            });
            void content.offsetWidth;
            items.forEach((item) => {
                const image = item.querySelector(".gallery-image");
                const observeAfterLayout = () => requestAnimationFrame(() => revealObserver.observe(item));
                if (image?.complete && image.naturalWidth) observeAfterLayout();
                else if (image?.complete) item.classList.remove("is-reveal-pending");
                else {
                    image?.addEventListener("load", observeAfterLayout, { once: true });
                    image?.addEventListener("error", () => item.classList.remove("is-reveal-pending"), { once: true });
                }
            });
        }
    }

    new MutationObserver(prepareContent).observe(gallery, { childList: true });
    prepareContent();
    reducedMotion.addEventListener?.("change", () => {
        if (!reducedMotion.matches) return;
        gallery.querySelectorAll(".is-reveal-pending").forEach((item) => {
            revealObserver.unobserve(item);
            item.classList.remove("is-reveal-pending");
        });
    });
})();
