const fs = require("fs");
const path = require("path");


/* =========================================================
   CONFIGURATION
========================================================= */

const projectsRoot =
    path.join(
        __dirname,
        "..",
        "assets",
        "projects"
    );


const categories = [

    "social-post",

    "story",

    "square",

    "landscape",

    "other"

];


const allowedExtensions = [

    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".avif",
    ".gif"

];


/* =========================================================
   SORT FILES NATURALLY
========================================================= */

function naturalSort(a, b) {

    return a.localeCompare(
        b,
        undefined,
        {
            numeric: true,
            sensitivity: "base"
        }
    );
}


/* =========================================================
   GET IMAGE FILES
========================================================= */

function getImages(folderPath) {

    if (
        !fs.existsSync(folderPath)
    ) {

        return [];
    }


    return fs
        .readdirSync(
            folderPath,
            {
                withFileTypes: true
            }
        )

        .filter(
            entry =>
                entry.isFile()
        )

        .map(
            entry =>
                entry.name
        )

        .filter(
            filename => {

                const extension =
                    path.extname(
                        filename
                    ).toLowerCase();


                return allowedExtensions
                    .includes(extension);

            }
        )

        .sort(naturalSort);
}


/* =========================================================
   GENERATE MANIFEST FOR PROJECT
========================================================= */

function generateProjectManifest(
    projectName
) {

    const projectPath =
        path.join(
            projectsRoot,
            projectName
        );


    const manifest = {};


    categories.forEach(
        category => {

            const categoryPath =
                path.join(
                    projectPath,
                    category
                );


            const files =
                getImages(
                    categoryPath
                );


            manifest[category] =
                files.map(
                    filename =>
                        `${category}/${filename}`
                );

        }
    );


    const manifestPath =
        path.join(
            projectPath,
            "manifest.json"
        );


    fs.writeFileSync(
        manifestPath,
        JSON.stringify(
            manifest,
            null,
            4
        ) + "\n",
        "utf8"
    );


    const total =
        Object.values(manifest)
            .reduce(
                (sum, images) =>
                    sum + images.length,
                0
            );


    console.log(
        `✓ ${projectName}: ${total} image(s)`
    );
}


/* =========================================================
   MAIN
========================================================= */

function generateAllManifests() {

    if (
        !fs.existsSync(
            projectsRoot
        )
    ) {

        console.error(
            "Project directory does not exist:"
        );

        console.error(
            projectsRoot
        );

        process.exit(1);
    }


    const projects =
        fs
            .readdirSync(
                projectsRoot,
                {
                    withFileTypes: true
                }
            )

            .filter(
                entry =>
                    entry.isDirectory()
            )

            .map(
                entry =>
                    entry.name
            )

            .sort(naturalSort);


    if (
        projects.length === 0
    ) {

        console.log(
            "No project folders found."
        );

        return;
    }


    console.log(
        "\nGenerating gallery manifests...\n"
    );


    projects.forEach(
        project =>
            generateProjectManifest(
                project
            )
    );


    console.log(
        "\nManifest generation complete.\n"
    );
}


generateAllManifests();