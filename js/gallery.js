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
   ---------------------------------------------------------
   Supports:

   manifest.cover
   manifest.coverImage
   manifest.thumbnail
   manifest.hero

   If none exists, first gallery image is used.
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
       LIGHTBOX
    ====================================================== */

    figure.addEventListener(
        "click",
        () => {

            if (!imageURL) {
                return;
            }


            openImageViewer(
                imageURL,
                image.alt
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


            /* ============================================
               EMPTY CATEGORIES ARE NOT RENDERED
            ============================================= */

            if (
                images.length === 0
            ) {

                return;
            }


            totalImages +=
                images.length;


            gallery.append(

                createGalleryCategory(
                    category,
                    images,
                    project
                )

            );

        }
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


    /* =====================================================
       COVER
    ====================================================== */

    applyProjectCover(
        project,
        manifest
    );

}


/* =========================================================
   LIGHTBOX
========================================================= */

function openImageViewer(
    imageURL,
    imageAlt
) {

    const existing =
        document.querySelector(
            ".gallery-lightbox"
        );


    if (existing) {

        existing.remove();

    }


    /* =====================================================
       LIGHTBOX
    ====================================================== */

    const lightbox =
        document.createElement(
            "div"
        );


    lightbox.className =
        "gallery-lightbox";


    lightbox.setAttribute(
        "role",
        "dialog"
    );


    lightbox.setAttribute(
        "aria-modal",
        "true"
    );


    lightbox.setAttribute(
        "aria-label",
        "Image preview"
    );


    /* =====================================================
       IMAGE
    ====================================================== */

    const image =
        document.createElement(
            "img"
        );


    image.className =
        "gallery-lightbox-image";


    image.src =
        imageURL;


    image.alt =
        imageAlt || "";


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
        "gallery-lightbox-close";


    close.setAttribute(
        "aria-label",
        "Close image preview"
    );


    close.textContent =
        "×";


    lightbox.append(
        close,
        image
    );


    document.body.append(
        lightbox
    );


    document.body.classList.add(
        "gallery-lightbox-open"
    );


    function closeViewer() {

        lightbox.remove();


        document.body.classList.remove(
            "gallery-lightbox-open"
        );


        document.removeEventListener(
            "keydown",
            handleKeyboard
        );

    }


    close.addEventListener(
        "click",
        closeViewer
    );


    lightbox.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                lightbox
            ) {

                closeViewer();

            }

        }
    );


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


    document.addEventListener(
        "keydown",
        handleKeyboard
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