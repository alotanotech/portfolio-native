const PROJECT_PAGE =
    "./pages/project.html";


const projects = {

    pcba: {

        index:
            "01",

        slug:
            "pcba",

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

        kind:
            "client",

        category:
            "Client",

        description:
            "Visual communication and digital design work created for PCBA Semiconductor International.",

        folder:
            "../assets/projects/pcba/"

    },


    "little-lady": {

        index:
            "02",

        slug:
            "little-lady",

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

        kind:
            "client",

        category:
            "Client",

        description:
            "Selected visual design work created for Little Lady.",

        folder:
            "../assets/projects/little-lady/"

    },


    pacohome: {

        index:
            "03",

        slug:
            "pacohome",

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

        kind:
            "client",

        category:
            "Client",

        description:
            "Selected visual design work created for Pacohome.",

        folder:
            "../assets/projects/pacohome/"

    },


    adiograf: {

        index:
            "04",

        slug:
            "adiograf",

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

        kind:
            "client",

        category:
            "Client",

        description:
            "Selected visual design work created for Adiograf Indonesia.",

        folder:
            "../assets/projects/adiograf/"

    },


    bagatelle: {

        index:
            "05",

        slug:
            "bagatelle",

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

        kind:
            "client",

        category:
            "Client",

        description:
            "Selected visual design work created for Bagatelle.",

        folder:
            "../assets/projects/bagatelle/"

    },


    "3d": {

        index:
            "06",

        slug:
            "3d",

        name:
            "3D",

        fullName:
            "3D",

        client:
            "PERSONAL PROJECT",

        year:
            "2026",

        type:
            "3D / PERSONAL",

        status:
            "ARCHIVE",

        kind:
            "personal",

        category:
            "3D",

        description:
            "A collection of personal 3D work, studies, experiments, and rendered objects.",

        folder:
            "../assets/projects/3d/"

    },


    "digital-illustration": {

        index:
            "07",

        slug:
            "digital-illustration",

        name:
            "DIGITAL ILLUSTRATION",

        fullName:
            "Digital Illustration",

        client:
            "PERSONAL PROJECT",

        year:
            "2025—2026",

        type:
            "ILLUSTRATION / PERSONAL",

        status:
            "ARCHIVE",

        kind:
            "personal",

        category:
            "Digital Illustration",

        description:
            "A collection of personal digital illustrations, character work, and visual studies.",

        folder:
            "../assets/projects/digital-illustration/"

    },


    "graphic-design": {

        index:
            "08",

        slug:
            "graphic-design",

        name:
            "GRAPHIC DESIGN",

        fullName:
            "Graphic Design",

        client:
            "PERSONAL PROJECT",

        year:
            "2026",

        type:
            "GRAPHIC DESIGN / PERSONAL",

        status:
            "ARCHIVE",

        kind:
            "personal",

        category:
            "Graphic Design",

        description:
            "A collection of personal graphic design experiments, compositions, posters, and visual explorations.",

        folder:
            "../assets/projects/graphic-design/"

    },


    animation: {

        index:
            "09",

        slug:
            "animation",

        name:
            "ANIMATION",

        fullName:
            "Animation",

        client:
            "PERSONAL PROJECT",

        year:
            "2026",

        type:
            "ANIMATION / PERSONAL",

        status:
            "ARCHIVE",

        kind:
            "personal",

        category:
            "Animation",

        description:
            "A collection of personal animation experiments, motion studies, and animated work.",

        folder:
            "../assets/projects/animation/"

    },


    "pixel-art": {

        index:
            "10",

        slug:
            "pixel-art",

        name:
            "PIXEL ART",

        fullName:
            "Pixel Art",

        client:
            "PERSONAL PROJECT",

        year:
            "2025—2026",

        type:
            "PIXEL ART / PERSONAL",

        status:
            "ARCHIVE",

        kind:
            "personal",

        category:
            "Pixel Art",

        description:
            "A collection of personal pixel art, sprite work, and low-resolution character studies.",

        folder:
            "../assets/projects/pixel-art/"

    },


    brands: {

        index:
            "11",

        slug:
            "brands",

        name:
            "BRANDS",

        fullName:
            "Brands",

        client:
            "PERSONAL PROJECT",

        year:
            "2026",

        type:
            "BRAND / PERSONAL",

        status:
            "ARCHIVE",

        kind:
            "personal",

        category:
            "Brands",

        description:
            "A collection of personal branding, identity, logo, and visual system experiments.",

        folder:
            "../assets/projects/brands/"

    }

};


const projectData =
    projects;


function normalizeProjectSlug(
    value
) {

    return String(
        value || ""
    )
        .toLowerCase()
        .trim();

}


function openProject(
    slug
) {

    const normalizedSlug =
        normalizeProjectSlug(
            slug
        );


    if (
        !normalizedSlug
    ) {

        console.error(
            "Cannot open project: project slug is missing."
        );

        return;

    }


    if (
        !projects[
            normalizedSlug
        ]
    ) {

        console.error(
            `Cannot open project: "${normalizedSlug}" does not exist in project data.`
        );

        return;

    }


    const url =
        `${PROJECT_PAGE}?project=${encodeURIComponent(normalizedSlug)}`;


    window.location.href =
        url;

}


function getProjectSlug() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return normalizeProjectSlug(
        params.get(
            "project"
        )
    );

}


function getCurrentProject() {

    const slug =
        getProjectSlug();


    return {

        slug,

        data:
            projects[
                slug
            ] || null

    };

}


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


    document.documentElement.dataset.project =
        project.slug;


    document.documentElement.dataset.projectKind =
        project.kind;


    document.documentElement.dataset.projectCategory =
        project.category;

}


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


function initializeProject() {

    const {
        slug,
        data
    } =
        getCurrentProject();


    return initializeProjectAsync(
        slug,
        data
    );

}


async function initializeProjectAsync(
    slug,
    localProject
) {

    let project =
        localProject;


    if (slug) {

        try {

            const response =
                await fetch(
                    `/api/projects/${encodeURIComponent(slug)}`,
                    {
                        cache: "no-store"
                    }
                );


            if (response.ok) {

                project =
                    await response.json();

            }

        } catch (error) {

            /* Local static development intentionally uses project.js data. */

        }

    }


    if (!project) {

        showProjectError(

            slug

                ? `No project configuration exists for "${slug}".`

                : "No project was specified in the URL."

        );


        return null;

    }


    applyProjectData(
        project
    );


    return project;

}


window.projects =
    projects;


window.projectData =
    projectData;


window.openProject =
    openProject;


window.getProjectSlug =
    getProjectSlug;


window.getCurrentProject =
    getCurrentProject;


window.currentProject =
    getCurrentProject().data;


window.projectReady =
    initializeProject()
        .then(
            project => {

                window.currentProject =
                    project;


                return project;

            }
        );
