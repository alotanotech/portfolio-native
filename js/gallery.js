/* =========================================================
   PROJECT GALLERY
   ---------------------------------------------------------
   Works with:

   /pages/project.html
   /js/project.js
   /js/gallery.js
   /assets/projects/<project>/manifest.json

   Gallery categories:
   - social-post
   - story
   - square
   - landscape
   - other
========================================================= */


/* =========================================================
   GALLERY CATEGORIES
========================================================= */

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


/* =========================================================
   GET MANIFEST URL
========================================================= */

function getManifestURL(
    project
) {

    if (
        !project ||
        !project.folder
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


/* =========================================================
   GET IMAGE URL
========================================================= */

function getImageURL(
    project,
    imagePath
) {

    if (
        !project ||
        !project.folder ||
        !imagePath
    ) {

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


/* =========================================================
   LOAD MANIFEST
========================================================= */

async function loadManifest(
    project
) {

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


    if (!response.ok) {

        throw new Error(
            `Manifest could not be loaded (${response.status}).`
        );
    }


    return await response.json();
}


/* =========================================================
   GET COVER PATH
========================================================= */

function getCoverPath(
    manifest
) {

    const possibleCover =
        manifest?.cover ||
        manifest?.coverImage ||
        manifest?.thumbnail ||
        manifest?.hero;


    if (
        typeof possibleCover ===
        "string"
    ) {

        return possibleCover;
    }


    if (
        possibleCover &&
        typeof possibleCover ===
        "object"
    ) {

        return (
            possibleCover.src ||
            possibleCover.path ||
            possibleCover.url ||
            ""
        );
    }


    for (
        const category
        of galleryCategories
    ) {

        const images =
            Array.isArray(
                manifest?.[
                    category.id
                ]
            )
                ? manifest[
                    category.id
                ]
                : [];


        if (
            images.length > 0
        ) {

            const first =
                images[0];


            if (
                typeof first ===
                "string"
            ) {

                return first;
            }


            if (
                first &&
                typeof first ===
                "object"
            ) {

                return (
                    first.src ||
                    first.path ||
                    first.url ||
                    ""
                );
            }

        }

    }


    return "";
}


/* =========================================================
   APPLY COVER
========================================================= */

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


    if (!coverPath) {

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


    cover.src =
        coverURL;


    cover.alt =
        `${project.name} project cover`;


    wrapper.classList.remove(
        "is-empty"
    );


    cover.addEventListener(
        "error",
        () => {

            wrapper.classList.add(
                "is-empty"
            );

        },
        {
            once:
                true
        }
    );

}


/* =========================================================
   CREATE CATEGORY
========================================================= */

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


    /* =====================================================
       HEADER
    ====================================================== */

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


    /* =====================================================
       INDEX
    ====================================================== */

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


    /* =====================================================
       LABEL
    ====================================================== */

    const label =
        document.createElement(
            "span"
        );


    label.className =
        "gallery-category-label";


    label.textContent =
        category.label;


    /* =====================================================
       INFORMATION
    ====================================================== */

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


    /* =====================================================
       TOGGLE
    ====================================================== */

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


    /* =====================================================
       HEADER
    ====================================================== */

    header.append(
        index,
        label,
        information,
        toggle
    );


    /* =====================================================
       BODY
    ====================================================== */

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


    /* =====================================================
       TRACK
    ====================================================== */

    const track =
        document.createElement(
            "div"
        );


    track.className =
        "gallery-category-track";


    /* =====================================================
       EMPTY
    ====================================================== */

    if (
        !Array.isArray(images) ||
        images.length === 0
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
                imagePath,
                imageIndex
            ) => {

                track.append(

                    createGalleryItem(
                        project,
                        category,
                        imagePath,
                        imageIndex
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


/* =========================================================
   CREATE GALLERY ITEM
========================================================= */

function createGalleryItem(
    project,
    category,
    imagePath,
    imageIndex
) {

    const figure =
        document.createElement(
            "figure"
        );


    figure.className =
        "gallery-item";


    const actualPath =
        typeof imagePath ===
        "string"

            ? imagePath

            : (
                imagePath?.src ||
                imagePath?.path ||
                imagePath?.url ||
                ""
            );


    const imageURL =
        getImageURL(
            project,
            actualPath
        );


    /* =====================================================
       IMAGE
    ====================================================== */

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


    /* =====================================================
       INDEX
    ====================================================== */

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


    /* =====================================================
       ERROR
    ====================================================== */

    image.addEventListener(
        "error",
        () => {

            figure.classList.add(
                "is-error"
            );

        }
    );


    /* =====================================================
       IMAGE VIEWER
    ====================================================== */

    figure.addEventListener(
        "click",
        () => {

            if (!imageURL) {
                return;
            }


            openImageViewer(
                imageURL,
                category.label,
                imageIndex + 1,
                imagesCountForCategory(
                    category,
                    project
                )
            );

        }
    );


    figure.append(
        image,
        index
    );


    return figure;
}


/* =========================================================
   CATEGORY IMAGE COUNT
========================================================= */

function imagesCountForCategory(
    category,
    project
) {

    const manifest =
        window.currentProjectManifest;


    if (!manifest) {
        return 0;
    }


    const images =
        Array.isArray(
            manifest?.[
                category.id
            ]
        )
            ? manifest[
                category.id
            ]
            : [];


    return images.length;
}


/* =========================================================
   CATEGORY TOGGLE
========================================================= */

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


        if (
            expanded
        ) {

            requestAnimationFrame(
                () => {

                    const body =
                        section.querySelector(
                            ".gallery-category-body"
                        );


                    if (
                        body
                    ) {

                        body.scrollTop =
                            0;

                    }

                }
            );

        }

    }


    toggle.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            toggleCategory();

        }
    );


    header.addEventListener(
        "click",
        (event) => {

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
        (event) => {

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


/* =========================================================
   SIDEBAR
========================================================= */

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

            const open =
                sidebar.classList.contains(
                    "is-open"
                );


            setSidebar(
                !open
            );

        }
    );


    document.addEventListener(
        "keydown",
        (event) => {

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


    const links =
        sidebar.querySelectorAll(
            ".gallery-sidebar-link"
        );


    links.forEach(
        (link) => {

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


/* =========================================================
   RENDER GALLERY
========================================================= */

function renderGallery(
    project,
    manifest
) {

    const gallery =
        document.getElementById(
            "project-gallery"
        );


    if (!gallery) {

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
        (category) => {

            const images =
                Array.isArray(
                    manifest?.[
                        category.id
                    ]
                )
                    ? manifest[
                        category.id
                    ]
                    : [];


            if (
                images.length === 0
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


    gallery.append(
        content
    );


    /* =====================================================
       PROJECT TOTAL
    ====================================================== */

    const projectCount =
        document.getElementById(
            "project-count"
        );


    if (projectCount) {

        projectCount.textContent =
            String(
                totalImages
            ).padStart(
                2,
                "0"
            );

    }


    /* =====================================================
       GALLERY TOTAL
    ====================================================== */

    const galleryCount =
        document.getElementById(
            "project-gallery-count"
        );


    if (galleryCount) {

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


/* =========================================================
   IMAGE VIEWER
========================================================= */

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


    if (existing) {

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


    /* =====================================================
       BACKDROP
    ====================================================== */

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


    /* =====================================================
       PANEL
    ====================================================== */

    const panel =
        document.createElement(
            "div"
        );


    panel.className =
        "gallery-image-viewer-panel";


    /* =====================================================
       HEADER
    ====================================================== */

    const header =
        document.createElement(
            "header"
        );


    header.className =
        "gallery-image-viewer-header";


    /* =====================================================
       INDEX
    ====================================================== */

    const index =
        document.createElement(
            "span"
        );


    index.className =
        "gallery-image-viewer-index";


    index.textContent =
        imageIndex
            ? String(
                imageIndex
            ).padStart(
                2,
                "0"
            )
            : "IMG";


    /* =====================================================
       TITLE
    ====================================================== */

    const title =
        document.createElement(
            "h2"
        );


    title.className =
        "gallery-image-viewer-title";


    title.textContent =
        categoryTitle ||
        "IMAGE";


    /* =====================================================
       META
    ====================================================== */

    const meta =
        document.createElement(
            "span"
        );


    meta.className =
        "gallery-image-viewer-meta";


    if (
        categoryTotal
    ) {

        meta.textContent =
            `${String(imageIndex).padStart(2,"0")} / ${String(categoryTotal).padStart(2,"0")}`;

    } else {

        meta.textContent =
            "IMAGE";

    }


    /* =====================================================
       CLOSE
    ====================================================== */

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


    header.append(
        index,
        title,
        close
    );


    /* =====================================================
       CONTENT
    ====================================================== */

    const content =
        document.createElement(
            "div"
        );


    content.className =
        "gallery-image-viewer-content";


    /* =====================================================
       IMAGE
    ====================================================== */

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


    /* =====================================================
       IMAGE ERROR
    ====================================================== */

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


    /* =====================================================
       FOOTER
    ====================================================== */

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
        "IMAGE VIEW";


    footer.append(
        footerLeft,
        footerRight
    );


    /* =====================================================
       PANEL
    ====================================================== */

    panel.append(
        header,
        content,
        footer
    );


    /* =====================================================
       VIEWER
    ====================================================== */

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


/* =========================================================
   GALLERY ERROR
========================================================= */

function showGalleryError(
    message
) {

    const gallery =
        document.getElementById(
            "project-gallery"
        );


    if (!gallery) {
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


/* =========================================================
   INITIALIZE
========================================================= */

async function initializeGallery() {

    setupGallerySidebar();


    const project =
        window.currentProject;


    if (!project) {

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

    } catch (error) {

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


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeGallery
);