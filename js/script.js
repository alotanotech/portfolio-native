if (typeof lucide !== "undefined") {
    lucide.createIcons();
}
/* ---------------- HERO TABS ---------------- */

const expertiseBtn = document.getElementById("expertiseBtn");
const socialBtn = document.getElementById("socialBtn");
const iconContainer = document.getElementById("iconContainer");

const expertiseIcons = `
<div class="w-20 h-20 flex items-center justify-center border border-zinc-700 rounded-xl hover:border-yellow-300 transition">
    <img src="./assets/photoshop.png" class="max-w-10 max-h-10 object-contain">
</div>

<div class="w-20 h-20 flex items-center justify-center border border-zinc-700 rounded-xl hover:border-yellow-300 transition">
    <img src="./assets/illustrator.png" class="max-w-10 max-h-10 object-contain">
</div>

<div class="w-20 h-20 flex items-center justify-center border border-zinc-700 rounded-xl hover:border-yellow-300 transition">
    <img src="./assets/figma1.png" class="max-w-10 max-h-10 object-contain">
</div>
`;

const socialIcons = `
<a href="#" class="w-20 h-20 flex items-center justify-center border border-zinc-700 rounded-xl hover:border-yellow-300 transition">
    <img src="./assets/icon/instagram.png" class="max-w-10 max-h-10 object-contain">
</a>

<a href="https://www.linkedin.com/in/alotanoluna/" target="_blank" class="w-20 h-20 flex items-center justify-center border border-zinc-700 rounded-xl hover:border-yellow-300 transition">
    <img src="./assets/linkedin.png" class="max-w-10 max-h-10 object-contain">
</a>

<a href="#" class="w-20 h-20 flex items-center justify-center border border-zinc-700 rounded-xl hover:border-yellow-300 transition">
    <img src="./assets/gmail.png" class="max-w-10 max-h-10 object-contain">
</a>
`;

if (expertiseBtn && socialBtn && iconContainer) {

    expertiseBtn.onclick = () => {

        iconContainer.innerHTML = expertiseIcons;

        expertiseBtn.classList.add("text-yellow-300", "border-yellow-300");
        expertiseBtn.classList.remove("text-zinc-400", "border-transparent");

        socialBtn.classList.remove("text-yellow-300", "border-yellow-300");
        socialBtn.classList.add("text-zinc-400", "border-transparent");

    };

    socialBtn.onclick = () => {

        iconContainer.innerHTML = socialIcons;

        socialBtn.classList.add("text-yellow-300", "border-yellow-300");
        socialBtn.classList.remove("text-zinc-400", "border-transparent");

        expertiseBtn.classList.remove("text-yellow-300", "border-yellow-300");
        expertiseBtn.classList.add("text-zinc-400", "border-transparent");

    };

}

/* ---------------- PROJECT DATA ---------------- */

const projectData = {

    pcba: {
        title: "",
        category: "",
        description: "",
        cover: "",
        gallery: []
    },

    brand2: {},
    brand3: {},
    brand4: {}

};

/* ---------------- ACTIVE NAVBAR ---------------- */

const page = window.location.pathname.split("/").pop();

const navProjects = document.getElementById("nav-projects");
const navAbout = document.getElementById("nav-about");

if (
    navProjects &&
    (
        page === "" ||
        page === "index.html" ||
        page.startsWith("project-")
    )
) {
    navProjects.classList.add("nav-active");
}

if (navAbout && page === "about.html") {
    navAbout.classList.add("nav-active");
}

/* ---------------- SOFTWARE INFINITE DRAG CAROUSEL ---------------- */


const carousel = document.getElementById("software-carousel");


if (carousel) {


    let isDragging = false;

    let startX = 0;

    let startScrollLeft = 0;

    let autoSpeed = 0.6;

    let animationID;



    /*
        Hide scrollbar
        because apparently browsers need instructions
        to not show the thing we do not want.
    */

    const hideScrollbar = document.createElement("style");

    hideScrollbar.innerHTML = `

        #software-carousel::-webkit-scrollbar {
            display:none;
        }

        #software-carousel {
            scrollbar-width:none;
            -ms-overflow-style:none;
        }

    `;

    document.head.appendChild(hideScrollbar);




    /*
        AUTO SCROLL
        Smooth animation using requestAnimationFrame
    */


    function animateCarousel(){


        if(!isDragging){


            carousel.scrollLeft += autoSpeed;



            /*
                Reset position when reaching duplicate cards
            */

            if(carousel.scrollLeft >= carousel.scrollWidth / 2){

                carousel.scrollLeft = 0;

            }


        }


        animationID = requestAnimationFrame(animateCarousel);


    }


    animateCarousel();





    /*
        MOUSE DRAGGING
    */


    carousel.addEventListener("mousedown",(e)=>{


        isDragging = true;


        carousel.classList.remove("cursor-grab");

        carousel.classList.add("cursor-grabbing");



        startX = e.pageX;


        startScrollLeft = carousel.scrollLeft;


        cancelAnimationFrame(animationID);


    });



    carousel.addEventListener("mousemove",(e)=>{


        if(!isDragging) return;


        e.preventDefault();



        const distance = (e.pageX - startX) * 1.5;



        carousel.scrollLeft = startScrollLeft - distance;


    });





    function stopDragging(){


        if(!isDragging) return;


        isDragging = false;



        carousel.classList.remove("cursor-grabbing");

        carousel.classList.add("cursor-grab");



        animateCarousel();


    }



    carousel.addEventListener("mouseup", stopDragging);


    carousel.addEventListener("mouseleave", stopDragging);






    /*
        TOUCH SUPPORT MOBILE
    */


    carousel.addEventListener("touchstart",(e)=>{


        isDragging = true;


        cancelAnimationFrame(animationID);



        startX = e.touches[0].pageX;


        startScrollLeft = carousel.scrollLeft;


    });





    carousel.addEventListener("touchmove",(e)=>{


        if(!isDragging) return;



        const distance = (e.touches[0].pageX - startX) * 1.5;



        carousel.scrollLeft = startScrollLeft - distance;


    });





    carousel.addEventListener("touchend",()=>{


        isDragging = false;


        animateCarousel();


    });






    /*
        Pause on hover
    */


    carousel.addEventListener("mouseenter",()=>{


        autoSpeed = 0;



    });




    carousel.addEventListener("mouseleave",()=>{


        if(!isDragging){

            autoSpeed = 0.6;

        }


    });



}