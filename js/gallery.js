const galleryCategories = [

    {
        id:
            "social-post",

        label:
            "SOCIAL MEDIA POSTS",

        size:
            "1080 × 1350",

        ratio:
            "4:5"

    },


    {
        id:
            "story",

        label:
            "STORIES",

        size:
            "1080 × 1920",

        ratio:
            "9:16"

    },


    {
        id:
            "square",

        label:
            "SQUARE POSTS",

        size:
            "1080 × 1080",

        ratio:
            "1:1"

    },


    {
        id:
            "landscape",

        label:
            "LANDSCAPE",

        size:
            "1920 × 1080",

        ratio:
            "16:9"

    },


    {
        id:
            "other",

        label:
            "OTHER",

        size:
            "CUSTOM",

        ratio:
            "—"

    }

];


function getManifestURL(
    project
) {

    if (
        !project?.folder
    ) {

        throw new Error(
            "Project folder is missing."
        );

    }


    return new URL(
        "manifest.json",
        new URL(
            project.folder,
            window.location.href
        )
    ).href;

}


function getImageURL(
    project,
    imagePath
) {

    if (!imagePath) {

        return "";

    }


    if (
        imagePath.startsWith("/") ||
        imagePath.startsWith("http://") ||
        imagePath.startsWith("https://")
    ) {

        return imagePath;

    }


    if (!project?.folder) {

        return "";

    }


    return new URL(
        imagePath,
        new URL(
            project.folder,
            window.location.href
        )
    ).href;

}


async function loadManifest(
    project
) {

    if (project?.manifest) {

        return project.manifest;

    }


    const manifestURL =
        getManifestURL(
            project
        );


    const response =
        await fetch(
            manifestURL,
            {
                cache:
                    "no-store"
            }
        );


    if (
        !response.ok
    ) {

        throw new Error(
            `Manifest could not be loaded (${response.status}).`
        );

    }


    const manifest =
        await response.json();


    if (
        !manifest ||
        typeof manifest !==
        "object"
    ) {

        throw new Error(
            "Manifest contains invalid data."
        );

    }


    return manifest;

}


function extractImagePath(
    image
) {

    if (
        typeof image ===
        "string"
    ) {

        return image;

    }


    if (
        image &&
        typeof image ===
        "object"
    ) {

        return (
            image.src ||
            image.path ||
            image.url ||
            image.file ||
            image.filename ||
            ""
        );

    }


    return "";

}


function getManifestCategories(
    manifest
) {

    if (
        manifest?.categories &&
        typeof manifest.categories ===
        "object"
    ) {

        return manifest.categories;

    }


    return manifest || {};

}


function getCategoryImages(
    manifest,
    category
) {

    const categories =
        getManifestCategories(
            manifest
        );


    const images =
        categories[
            category.id
        ];


    return Array.isArray(
        images
    )
        ? images
        : [];

}


function getCoverPath(
    manifest
) {

    const cover =
        manifest?.cover ||
        manifest?.coverImage ||
        manifest?.thumbnail ||
        manifest?.hero;


    const directCover =
        extractImagePath(
            cover
        );


    if (
        directCover
    ) {

        return directCover;

    }


    for (
        const category
        of galleryCategories
    ) {

        const images =
            getCategoryImages(
                manifest,
                category
            );


        if (
            images.length
        ) {

            const firstPath =
                extractImagePath(
                    images[0]
                );


            if (
                firstPath
            ) {

                return firstPath;

            }

        }

    }


    return "";

}


function applyProjectCover(
    project,
    manifest
) {

    const cover =
        document.getElementById(
            "project-cover"
        );


    const wrapper =
        document.getElementById(
            "project-cover-wrap"
        );


    if (
        !cover ||
        !wrapper
    ) {

        return;

    }


    const coverPath =
        getCoverPath(
            manifest
        );


    if (
        !coverPath
    ) {

        wrapper.classList.add(
            "is-empty"
        );

        return;

    }


    const coverURL =
        getImageURL(
            project,
            coverPath
        );


    if (
        !coverURL
    ) {

        wrapper.classList.add(
            "is-empty"
        );

        return;

    }


    cover.src =
        coverURL;


    cover.alt =
        `${project.name} project cover`;


    cover.onload =
        () => {

            wrapper.classList.remove(
                "is-empty"
            );

        };


    cover.onerror =
        () => {

            wrapper.classList.add(
                "is-empty"
            );

        };

}


function createGalleryItem(
    project,
    category,
    imagePath,
    imageIndex,
    categoryTotal
) {

    const figure =
        document.createElement(
            "figure"
        );


    figure.className =
        "gallery-item";


    const actualPath =
        extractImagePath(
            imagePath
        );


    if (
        !actualPath
    ) {

        figure.classList.add(
            "is-error"
        );

        return figure;

    }


    const imageURL =
        getImageURL(
            project,
            actualPath
        );


    const image =
        document.createElement(
            "img"
        );


    image.className =
        "gallery-image";


    image.src =
        imageURL;


    image.alt =
        `${project.name} ${category.label.toLowerCase()} ${imageIndex + 1}`;


    image.loading =
        "lazy";


    image.decoding =
        "async";


    const index =
        document.createElement(
            "span"
        );


    index.className =
        "gallery-item-index";


    index.textContent =
        String(
            imageIndex + 1
        ).padStart(
            2,
            "0"
        );


    image.addEventListener(
        "error",
        () => {

            figure.classList.add(
                "is-error"
            );

            console.error(
                `Gallery image could not be loaded: ${imageURL}`
            );

        }
    );


    if (
        imageURL
    ) {

        figure.addEventListener(
            "click",
            () => {

                openImageViewer(
                    imageURL,
                    category.label,
                    imageIndex + 1,
                    categoryTotal
                );

            }
        );

    }


    figure.append(
        image,
        index
    );


    return figure;

}


function createGalleryCategory(
    category,
    images,
    project
) {

    const section =
        document.createElement(
            "section"
        );


    section.className =
        "gallery-category";


    section.dataset.category =
        category.id;


    const header =
        document.createElement(
            "div"
        );


    header.className =
        "gallery-category-header";


    header.setAttribute(
        "role",
        "button"
    );


    header.setAttribute(
        "tabindex",
        "0"
    );


    header.setAttribute(
        "aria-expanded",
        "true"
    );


    const index =
        document.createElement(
            "span"
        );


    index.className =
        "gallery-category-index";


    index.textContent =
        String(
            galleryCategories.indexOf(
                category
            ) + 1
        ).padStart(
            2,
            "0"
        );


    const label =
        document.createElement(
            "span"
        );


    label.className =
        "gallery-category-label";


    label.textContent =
        category.label;


    const information =
        document.createElement(
            "div"
        );


    information.className =
        "gallery-category-info";


    const size =
        document.createElement(
            "span"
        );


    size.className =
        "gallery-category-size";


    size.textContent =
        category.size;


    const ratio =
        document.createElement(
            "span"
        );


    ratio.className =
        "gallery-category-ratio";


    ratio.textContent =
        category.ratio;


    const count =
        document.createElement(
            "span"
        );


    count.className =
        "gallery-category-count";


    count.textContent =
        String(
            images.length
        ).padStart(
            2,
            "0"
        );


    information.append(
        size,
        ratio,
        count
    );


    const toggle =
        document.createElement(
            "button"
        );


    toggle.type =
        "button";


    toggle.className =
        "gallery-category-toggle";


    toggle.setAttribute(
        "aria-expanded",
        "true"
    );


    toggle.setAttribute(
        "aria-label",
        `Collapse ${category.label}`
    );


    toggle.textContent =
        "−";


    header.append(
        index,
        label,
        information,
        toggle
    );


    const body =
        document.createElement(
            "div"
        );


    body.className =
        "gallery-category-body";


    body.setAttribute(
        "aria-label",
        `${category.label} gallery`
    );


    const track =
        document.createElement(
            "div"
        );


    track.className =
        "gallery-category-track";


    if (
        !images.length
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "gallery-empty";


        empty.textContent =
            "NO WORKS IN THIS CATEGORY";


        track.append(
            empty
        );

    } else {

        images.forEach(
            (
                image,
                imageIndex
            ) => {

                track.append(
                    createGalleryItem(
                        project,
                        category,
                        image,
                        imageIndex,
                        images.length
                    )
                );

            }
        );

    }


    body.append(
        track
    );


    section.append(
        header,
        body
    );


    setupCategoryToggle(
        section,
        header,
        toggle,
        category
    );


    return section;

}


function setupCategoryToggle(
    section,
    header,
    toggle,
    category
) {

    function toggleCategory() {

        const collapsed =
            section.classList.toggle(
                "is-collapsed"
            );


        const expanded =
            !collapsed;


        header.setAttribute(
            "aria-expanded",
            String(
                expanded
            )
        );


        toggle.setAttribute(
            "aria-expanded",
            String(
                expanded
            )
        );


        toggle.setAttribute(
            "aria-label",
            expanded
                ? `Collapse ${category.label}`
                : `Expand ${category.label}`
        );


        toggle.textContent =
            expanded
                ? "−"
                : "+";

    }


    toggle.addEventListener(
        "click",
        (
            event
        ) => {

            event.stopPropagation();

            toggleCategory();

        }
    );


    header.addEventListener(
        "click",
        (
            event
        ) => {

            if (
                event.target.closest(
                    ".gallery-category-toggle"
                )
            ) {

                return;

            }


            toggleCategory();

        }
    );


    header.addEventListener(
        "keydown",
        (
            event
        ) => {

            if (
                event.key ===
                    "Enter" ||
                event.key ===
                    " "
            ) {

                event.preventDefault();

                toggleCategory();

            }

        }
    );

}


function setupGallerySidebar() {

    const sidebar =
        document.getElementById(
            "gallery-sidebar"
        );


    const toggle =
        document.getElementById(
            "gallery-sidebar-toggle"
        );


    if (
        !sidebar ||
        !toggle
    ) {

        return;

    }


    function setSidebar(
        open
    ) {

        sidebar.classList.toggle(
            "is-open",
            open
        );


        toggle.classList.toggle(
            "is-open",
            open
        );


        toggle.setAttribute(
            "aria-expanded",
            String(
                open
            )
        );


        toggle.setAttribute(
            "aria-label",
            open
                ? "Close project navigation"
                : "Open project navigation"
        );

    }


    toggle.addEventListener(
        "click",
        () => {

            setSidebar(
                !sidebar.classList.contains(
                    "is-open"
                )
            );

        }
    );


    document.addEventListener(
        "keydown",
        (
            event
        ) => {

            if (
                event.key ===
                "Escape"
            ) {

                setSidebar(
                    false
                );

            }

        }
    );


    sidebar
        .querySelectorAll(
            ".gallery-sidebar-link"
        )
        .forEach(
            (
                link
            ) => {

                link.addEventListener(
                    "click",
                    () => {

                        setSidebar(
                            false
                        );

                    }
                );

            }
        );

}


function renderGallery(
    project,
    manifest
) {

    const gallery =
        document.getElementById(
            "project-gallery"
        );


    if (
        !gallery
    ) {

        console.error(
            "Element #project-gallery was not found."
        );

        return;

    }


    gallery.innerHTML =
        "";


    window.currentProjectManifest =
        manifest;


    const content =
        document.createElement(
            "div"
        );


    content.className =
        "gallery-content";


    let totalImages =
        0;


    galleryCategories.forEach(
        (
            category
        ) => {

            const images =
                getCategoryImages(
                    manifest,
                    category
                );


            if (
                !images.length
            ) {

                return;

            }


            totalImages +=
                images.length;


            content.append(
                createGalleryCategory(
                    category,
                    images,
                    project
                )
            );

        }
    );


    if (
        !content.children.length
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "gallery-empty";


        empty.textContent =
            "NO WORKS FOUND";


        content.append(
            empty
        );

    }


    gallery.append(
        content
    );


    const projectCount =
        document.getElementById(
            "project-count"
        );


    if (
        projectCount
    ) {

        projectCount.textContent =
            String(
                totalImages
            ).padStart(
                2,
                "0"
            );

    }


    const galleryCount =
        document.getElementById(
            "project-gallery-count"
        );


    if (
        galleryCount
    ) {

        galleryCount.textContent =
            String(
                totalImages
            ).padStart(
                2,
                "0"
            );

    }


    applyProjectCover(
        project,
        manifest
    );

}


function openImageViewer(
    imageURL,
    categoryTitle,
    imageIndex,
    categoryTotal
) {

    const existing =
        document.querySelector(
            ".gallery-image-viewer"
        );


    if (
        existing
    ) {

        existing.remove();

    }


    const viewer =
        document.createElement(
            "div"
        );


    viewer.className =
        "gallery-image-viewer";


    viewer.setAttribute(
        "role",
        "dialog"
    );


    viewer.setAttribute(
        "aria-modal",
        "true"
    );


    viewer.setAttribute(
        "aria-label",
        `${categoryTitle || "Image"} preview`
    );


    const backdrop =
        document.createElement(
            "div"
        );


    backdrop.className =
        "gallery-image-viewer-backdrop";


    backdrop.setAttribute(
        "aria-hidden",
        "true"
    );


    const panel =
        document.createElement(
            "div"
        );


    panel.className =
        "gallery-image-viewer-panel";


    const header =
        document.createElement(
            "header"
        );


    header.className =
        "gallery-image-viewer-header";


    const index =
        document.createElement(
            "span"
        );


    index.className =
        "gallery-image-viewer-index";


    index.textContent =
        String(
            imageIndex
        ).padStart(
            2,
            "0"
        );


    const title =
        document.createElement(
            "h2"
        );


    title.className =
        "gallery-image-viewer-title";


    title.textContent =
        categoryTitle ||
        "IMAGE";


    const close =
        document.createElement(
            "button"
        );


    close.type =
        "button";


    close.className =
        "gallery-image-viewer-close";


    close.setAttribute(
        "aria-label",
        "Close image viewer"
    );


    close.textContent =
        "×";


    const meta =
        document.createElement(
            "span"
        );


    meta.className =
        "gallery-image-viewer-meta";


    meta.textContent =
        categoryTotal
            ? `${String(imageIndex).padStart(2, "0")} / ${String(categoryTotal).padStart(2, "0")}`
            : "IMAGE";


    header.append(
        index,
        title,
        close
    );


    const content =
        document.createElement(
            "div"
        );


    content.className =
        "gallery-image-viewer-content";


    const image =
        document.createElement(
            "img"
        );


    image.className =
        "gallery-image-viewer-image";


    image.src =
        imageURL;


    image.alt =
        categoryTitle ||
        "Project image";


    image.decoding =
        "async";


    image.addEventListener(
        "load",
        () => {

            viewer.classList.add(
                "is-loaded"
            );

        },
        {
            once:
                true
        }
    );


    image.addEventListener(
        "error",
        () => {

            content.classList.add(
                "is-error"
            );


            image.alt =
                "Unable to load image";

        },
        {
            once:
                true
        }
    );


    content.append(
        image
    );


    const footer =
        document.createElement(
            "footer"
        );


    footer.className =
        "gallery-image-viewer-footer";


    const footerLeft =
        document.createElement(
            "span"
        );


    footerLeft.textContent =
        "PROJECT ARCHIVE";


    const footerRight =
        document.createElement(
            "span"
        );


    footerRight.textContent =
        meta.textContent;


    footer.append(
        footerLeft,
        footerRight
    );


    panel.append(
        header,
        content,
        footer
    );


    viewer.append(
        backdrop,
        panel
    );


    document.body.append(
        viewer
    );


    document.body.classList.add(
        "gallery-viewer-open"
    );


    function closeViewer() {

        viewer.classList.remove(
            "is-open"
        );


        document.body.classList.remove(
            "gallery-viewer-open"
        );


        document.removeEventListener(
            "keydown",
            handleKeyboard
        );


        window.setTimeout(
            () => {

                if (
                    viewer.parentNode
                ) {

                    viewer.remove();

                }

            },
            450
        );

    }


    function handleKeyboard(
        event
    ) {

        if (
            event.key ===
            "Escape"
        ) {

            closeViewer();

        }

    }


    close.addEventListener(
        "click",
        closeViewer
    );


    backdrop.addEventListener(
        "click",
        closeViewer
    );


    document.addEventListener(
        "keydown",
        handleKeyboard
    );


    requestAnimationFrame(
        () => {

            viewer.classList.add(
                "is-open"
            );

        }
    );


    close.focus();

}


function showGalleryError(
    message
) {

    const gallery =
        document.getElementById(
            "project-gallery"
        );


    if (
        !gallery
    ) {

        return;

    }


    gallery.innerHTML =
        "";


    const error =
        document.createElement(
            "div"
        );


    error.className =
        "project-error";


    const title =
        document.createElement(
            "strong"
        );


    title.textContent =
        "GALLERY ERROR";


    const description =
        document.createElement(
            "span"
        );


    description.textContent =
        message;


    error.append(
        title,
        description
    );


    gallery.append(
        error
    );

}


async function initializeGallery() {

    setupGallerySidebar();


    const project =
        await (
            window.projectReady ||
            Promise.resolve(
                window.currentProject
            )
        );


    if (
        !project
    ) {

        showGalleryError(
            "No valid project was found."
        );

        return;

    }


    try {

        const manifest =
            await loadManifest(
                project
            );


        renderGallery(
            project,
            manifest
        );

    } catch (
        error
    ) {

        console.error(
            "Gallery initialization failed:",
            error
        );


        showGalleryError(
            error.message ||
            "Unable to load the project gallery."
        );

    }

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeGallery
    );

} else {

    initializeGallery();

}
