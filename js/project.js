/* =========================================================
   PROJECT PAGE
   ---------------------------------------------------------
   Works with:

   /pages/project.html
   /js/project.js
   /js/gallery.js
========================================================= */


/* =========================================================
   PROJECT DATA
========================================================= */

const projects = {

    pcba: {

        index:
            "01",

        name:
            "PCBA",

        fullName:
            "PCBA Semiconductor International",

        client:
            "PCBA Semiconductor International",

        year:
            "2025—2026",

        type:
            "BRAND / DESIGN",

        status:
            "ARCHIVE",

        description:
            "Visual communication and digital design work created for PCBA Semiconductor International.",

        folder:
            "../assets/projects/pcba/"

    },


    "little-lady": {

        index:
            "02",

        name:
            "LITTLE LADY",

        fullName:
            "Little Lady",

        client:
            "Little Lady",

        year:
            "2025—2026",

        type:
            "BRAND / IDENTITY",

        status:
            "ARCHIVE",

        description:
            "Selected visual design work created for Little Lady.",

        folder:
            "../assets/projects/little-lady/"

    },


    pacohome: {

        index:
            "03",

        name:
            "PACOHOME",

        fullName:
            "Pacohome",

        client:
            "Pacohome",

        year:
            "2025—2026",

        type:
            "BRAND / CAMPAIGN",

        status:
            "ARCHIVE",

        description:
            "Selected visual design work created for Pacohome.",

        folder:
            "../assets/projects/pacohome/"

    },


    adiograf: {

        index:
            "04",

        name:
            "ADIOGRAF",

        fullName:
            "Adiograf Indonesia",

        client:
            "Adiograf Indonesia",

        year:
            "2025—2026",

        type:
            "BRAND / GRAPHIC",

        status:
            "ARCHIVE",

        description:
            "Selected visual design work created for Adiograf Indonesia.",

        folder:
            "../assets/projects/adiograf/"

    },


    bagatelle: {

        index:
            "05",

        name:
            "BAGATELLE",

        fullName:
            "Bagatelle",

        client:
            "Bagatelle",

        year:
            "2025—2026",

        type:
            "BRAND / SOCIAL",

        status:
            "ARCHIVE",

        description:
            "Selected visual design work created for Bagatelle.",

        folder:
            "../assets/projects/bagatelle/"

    }

};


/* =========================================================
   GET PROJECT SLUG
========================================================= */

function getProjectSlug() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return (
        params.get("project") ||
        ""
    )
        .toLowerCase()
        .trim();
}


/* =========================================================
   GET CURRENT PROJECT
========================================================= */

function getCurrentProject() {

    const slug =
        getProjectSlug();


    return {

        slug,

        data:
            projects[slug] || null

    };
}


/* =========================================================
   SET TEXT HELPER
========================================================= */

function setProjectText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {
        return;
    }


    element.textContent =
        value ?? "";
}


/* =========================================================
   APPLY PROJECT DATA
========================================================= */

function applyProjectData(
    project
) {

    document.title =
        `${project.name} | Lyan`;


    setProjectText(
        "project-index",
        project.index
    );


    setProjectText(
        "project-title",
        project.name
    );


    setProjectText(
        "project-status",
        project.status
    );


    setProjectText(
        "project-client",
        project.client
    );


    setProjectText(
        "project-year",
        project.year
    );


    setProjectText(
        "project-label",
        project.type
    );


    setProjectText(
        "project-description",
        project.description
    );


    setProjectText(
        "project-brand-description",
        project.description
    );

}


/* =========================================================
   PROJECT ERROR
========================================================= */

function showProjectError(
    message
) {

    document.title =
        "Project Not Found | Lyan";


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
        "PROJECT NOT FOUND";


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
   INITIALIZE PROJECT
========================================================= */

function initializeProject() {

    const {
        slug,
        data
    } =
        getCurrentProject();


    if (!data) {

        showProjectError(

            slug

                ? `No project configuration exists for "${slug}".`

                : "No project was specified in the URL."

        );


        return null;
    }


    applyProjectData(
        data
    );


    return data;
}


/* =========================================================
   START
========================================================= */

window.currentProject =
    initializeProject();